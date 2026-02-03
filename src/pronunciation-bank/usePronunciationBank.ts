import { useState, useEffect, useMemo } from 'react';
import { Word, WordStats, PracticeResult } from '../types';
import { toUiWord, toUiWords } from '../utils/word-transformer';
import { getPronunciationData } from '../services/pronunciation-api';
import { fetchAudioUrl, playWordAudio } from '../services/audio-fetcher';
import { COMMON_WORDS, SPACED_REPETITION } from '../constants/common-words';
import * as db from '../services/database-service';

// Get user from URL parameter (e.g., ?user=tommy)
const getUrlUser = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
};

// Calculate next review date based on status
const getNextReviewDate = (status: string, practiceCount: number): string => {
  const today = new Date();
  let daysToAdd = 0;

  if (status === 'learning') {
    daysToAdd = SPACED_REPETITION.LEARNING_INTERVAL;
  } else if (status === 'reviewing') {
    daysToAdd = practiceCount <= SPACED_REPETITION.REVIEWING_THRESHOLD
      ? SPACED_REPETITION.REVIEWING_INTERVAL_EARLY
      : SPACED_REPETITION.REVIEWING_INTERVAL_LATE;
  } else if (status === 'mastered') {
    daysToAdd = SPACED_REPETITION.MASTERED_INTERVAL;
  }

  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
};

export interface UsePronunciationBankReturn {
  // State
  currentUserId: string | null;
  isLockedUser: boolean;
  words: Word[];
  isLoading: boolean;
  isAdding: boolean;
  autoRefreshing: boolean;
  newWord: string;
  showSuggestions: boolean;
  filteredSuggestions: string[];
  editingNotes: string | null;
  audioSources: Record<string, string>;
  isPracticing: boolean;
  practiceWords: Word[];
  stats: WordStats;
  eligibleWordsCount: number;
  sessionNumber: number;

  // Actions
  setNewWord: (value: string) => void;
  setShowSuggestions: (show: boolean) => void;
  setEditingNotes: (wordId: string | null) => void;
  handleUserSelect: (userId: string) => void;
  addWord: (word?: string) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
  updateNotes: (wordId: string, notes: string) => Promise<void>;
  togglePriority: (wordId: string) => Promise<void>;
  refreshPhonetics: (wordId: string) => Promise<void>;
  refreshAllPhonetics: () => Promise<void>;
  fetchMissingAudio: () => Promise<void>;
  playAudio: (word: string, audioUrl: string) => void;
  recordPractice: (wordId: string, isCorrect: boolean) => Promise<void>;
  startPracticeSession: () => Promise<void>;
  handlePracticeComplete: (results: PracticeResult[]) => Promise<void>;
  exitPractice: () => void;
}

export const usePronunciationBank = (): UsePronunciationBankReturn => {
  // User state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLockedUser, setIsLockedUser] = useState(false);

  // Words state
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [audioSources, setAudioSources] = useState<Record<string, string>>({});

  // Input state
  const [newWord, setNewWord] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  // Practice state
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);

  // Computed values
  const stats = useMemo<WordStats>(() => ({
    learning: words.filter(w => w.status === 'learning').length,
    reviewing: words.filter(w => w.status === 'reviewing').length,
    mastered: words.filter(w => w.status === 'mastered').length,
  }), [words]);

  const eligibleWordsCount = useMemo(() =>
    words.filter(w => (w.correctStreak || 0) < 3).length,
  [words]);

  const filteredSuggestions = useMemo(() => {
    if (!newWord.trim()) return [];
    return COMMON_WORDS
      .filter(w => w.toLowerCase().startsWith(newWord.toLowerCase()))
      .slice(0, 10);
  }, [newWord]);

  // Session management
  const getSessionCount = (): number => {
    const count = localStorage.getItem(`session-count-${currentUserId}`);
    return count ? parseInt(count, 10) : 0;
  };

  const incrementSessionCount = (): number => {
    const newCount = getSessionCount() + 1;
    localStorage.setItem(`session-count-${currentUserId}`, newCount.toString());
    return newCount;
  };

  // Initialize user
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const urlUser = getUrlUser();

        if (urlUser) {
          const userId = urlUser.toLowerCase().replace(/\s+/g, '-');
          let user = await db.getUser(userId);

          if (!user) {
            const displayName = urlUser
              .split(/[-_\s]+/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            user = await db.createUser(userId, displayName);
          }

          if (user) {
            setCurrentUserId(user.id);
            setIsLockedUser(true);
            localStorage.setItem('current-user-id', user.id);
            return;
          }
        }

        const savedUserId = localStorage.getItem('current-user-id');
        if (savedUserId) {
          const user = await db.getUser(savedUserId);
          if (user) {
            setCurrentUserId(savedUserId);
            return;
          }
        }

        let defaultUser = await db.createUser('default-user', 'Default User');
        if (!defaultUser) {
          defaultUser = await db.getUser('default-user');
        }

        if (defaultUser) {
          setCurrentUserId(defaultUser.id);
          localStorage.setItem('current-user-id', defaultUser.id);
        } else {
          setCurrentUserId('default-user');
          localStorage.setItem('current-user-id', 'default-user');
        }
      } catch (e) {
        console.error('Init failed:', e);
        setCurrentUserId('default-user');
        localStorage.setItem('current-user-id', 'default-user');
      }
    };

    initializeApp();
  }, []);

  // Load words when user changes
  useEffect(() => {
    if (!currentUserId) return;

    const loadWords = async () => {
      setIsLoading(true);
      try {
        const userWords = await db.getUserWords(currentUserId);
        const formattedWords = toUiWords(userWords);
        setWords(formattedWords);

        if (!hasMigrated) {
          await migrateLocalStorageData();
          setHasMigrated(true);
        }

        setTimeout(() => {
          autoRefreshPlaceholders(formattedWords);
        }, 1000);
      } catch (e) {
        console.error('Load words failed:', e);
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [currentUserId]);

  // Fetch audio sources
  useEffect(() => {
    if (!words.length) {
      setAudioSources({});
      return;
    }
    const wordStrings = words.map(w => w.word);
    db.getAudioSourcesForWords(wordStrings).then(setAudioSources);
  }, [words]);

  // Update suggestions visibility
  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0 && newWord.trim().length > 0);
  }, [filteredSuggestions, newWord]);

  // Migrate localStorage data
  const migrateLocalStorageData = async () => {
    try {
      const stored = localStorage.getItem('pronunciation-bank-v2');
      if (!stored || !currentUserId) return;

      const localWords = JSON.parse(stored);
      if (localWords.length === 0) return;

      const existingWords = await db.getUserWords(currentUserId);
      if (existingWords.length > 0) return;

      console.log(`Migrating ${localWords.length} words from localStorage to database...`);

      for (const word of localWords) {
        if (word.word.toLowerCase() === 'don') continue;

        await db.addWord(currentUserId, {
          word: word.word,
          phonetic: word.phonetic || '',
          pattern: word.pattern || '',
          readable: word.readable || word.pattern || '',
          audio_url: word.audioUrl || '',
          status: word.status || 'learning',
          practice_count: word.practiceCount || 0,
          correct_streak: word.correctStreak || 0,
          total_errors: 0,
          priority: false,
          next_review: word.nextReview,
          last_practiced: word.lastPracticed,
          notes: word.notes || '',
        });
      }

      const migratedWords = await db.getUserWords(currentUserId);
      setWords(toUiWords(migratedWords));
      console.log('Migration complete!');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  // Auto-refresh placeholder phonetics
  const autoRefreshPlaceholders = async (wordsList: Word[]) => {
    const needsRefresh = wordsList.filter(w => {
      const phonetic = w.phonetic || '';
      const isSimplePlaceholder = phonetic === `/${w.word}/`;
      const hasNoStressMarks = !phonetic.includes('ˈ') && !phonetic.includes('ˌ');
      return isSimplePlaceholder || hasNoStressMarks;
    });

    if (needsRefresh.length === 0) {
      console.log('No words need refreshing');
      return;
    }

    console.log(`Found ${needsRefresh.length} words to refresh:`, needsRefresh.map(w => w.word));
    setAutoRefreshing(true);

    for (const word of needsRefresh) {
      try {
        const data = await getPronunciationData(word.word);
        await db.updateWord(word.id, {
          phonetic: data.phonetic,
          pattern: data.pattern,
          readable: data.readable,
          audio_url: data.audioUrl || '',
        });

        setWords(prev => prev.map(w =>
          w.id === word.id
            ? { ...w, phonetic: data.phonetic, pattern: data.pattern, readable: data.readable, audioUrl: data.audioUrl || '' }
            : w
        ));

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to refresh ${word.word}:`, error);
      }
    }

    setAutoRefreshing(false);
    console.log('✅ Auto-refresh complete!');
  };

  // Actions
  const handleUserSelect = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('current-user-id', userId);
  };

  const addWord = async (wordToAdd = newWord.trim()) => {
    if (!wordToAdd || !currentUserId) return;

    if (words.some(w => w.word.toLowerCase() === wordToAdd.toLowerCase())) {
      alert('This word is already in your list!');
      return;
    }

    setIsAdding(true);
    setShowSuggestions(false);

    const data = await getPronunciationData(wordToAdd);

    const newWordData = {
      word: wordToAdd,
      phonetic: data.phonetic,
      pattern: data.pattern,
      readable: data.readable,
      audio_url: data.audioUrl || '',
      status: 'learning' as const,
      practice_count: 0,
      correct_streak: 0,
      total_errors: 0,
      priority: false,
      next_review: getNextReviewDate('learning', 0),
      last_practiced: null,
      notes: '',
    };

    const savedWord = await db.addWord(currentUserId, newWordData);

    if (savedWord) {
      setWords(prev => [toUiWord(savedWord), ...prev]);
    }

    setNewWord('');
    setIsAdding(false);
  };

  const deleteWord = async (wordId: string) => {
    if (confirm('Delete this word?')) {
      const success = await db.deleteWord(wordId);
      if (success) {
        setWords(prev => prev.filter(w => w.id !== wordId));
      }
    }
  };

  const updateNotes = async (wordId: string, newNotes: string) => {
    const updatedWord = await db.updateWord(wordId, { notes: newNotes });
    if (updatedWord) {
      setWords(prev => prev.map(word =>
        word.id === wordId ? { ...word, notes: newNotes } : word
      ));
    }
    setEditingNotes(null);
  };

  const togglePriority = async (wordId: string) => {
    const updatedWord = await db.toggleWordPriority(wordId);
    if (updatedWord) {
      setWords(prev => prev.map(word =>
        word.id === wordId ? { ...word, priority: updatedWord.priority } : word
      ));
    }
  };

  const refreshPhonetics = async (wordId: string) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    const data = await getPronunciationData(word.word, { skipCache: true });
    const updatedWord = await db.updateWord(wordId, {
      phonetic: data.phonetic,
      pattern: data.pattern,
      readable: data.readable,
      audio_url: data.audioUrl || '',
    });

    if (updatedWord) {
      setWords(prev => prev.map(w =>
        w.id === wordId
          ? { ...w, phonetic: data.phonetic, pattern: data.pattern, readable: data.readable, audioUrl: data.audioUrl || '' }
          : w
      ));
    }
  };

  const refreshAllPhonetics = async () => {
    if (!confirm('Refresh phonetics for all words? This will fetch real data from the dictionary.')) {
      return;
    }

    console.log('Starting manual refresh...');
    setIsAdding(true);

    for (const word of words) {
      try {
        const data = await getPronunciationData(word.word, { skipCache: true });
        await db.updateWord(word.id, {
          phonetic: data.phonetic,
          pattern: data.pattern,
          readable: data.readable,
          audio_url: data.audioUrl || '',
        });

        setWords(prev => prev.map(w =>
          w.id === word.id
            ? { ...w, phonetic: data.phonetic, pattern: data.pattern, readable: data.readable, audioUrl: data.audioUrl || '' }
            : w
        ));

        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`Failed to fetch ${word.word}:`, error);
      }
    }

    setIsAdding(false);
    alert(`Refreshed ${words.length} words!`);
    console.log('Manual refresh complete!');
  };

  const fetchMissingAudio = async () => {
    const wordsWithoutAudio = words.filter(w => !w.audioUrl || w.audioUrl === '');

    if (wordsWithoutAudio.length === 0) {
      alert('All words already have audio!');
      return;
    }

    if (!confirm(`Fetch audio for ${wordsWithoutAudio.length} words without audio?`)) {
      return;
    }

    console.log(`Fetching audio for ${wordsWithoutAudio.length} words...`);
    setIsAdding(true);

    let successCount = 0;
    for (const word of wordsWithoutAudio) {
      try {
        const audioUrl = await fetchAudioUrl(word.word);
        if (audioUrl) {
          await db.updateWord(word.id, { audio_url: audioUrl });
          setWords(prev => prev.map(w =>
            w.id === word.id ? { ...w, audioUrl } : w
          ));
          successCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Failed to fetch audio for ${word.word}:`, error);
      }
    }

    setIsAdding(false);
    alert(`Successfully fetched audio for ${successCount}/${wordsWithoutAudio.length} words from multiple sources!`);
    console.log('Audio fetch complete!');
  };

  const playAudio = (word: string, audioUrl: string) => {
    playWordAudio(word, audioUrl);
  };

  const recordPractice = async (wordId: string, isCorrect: boolean) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    const newCorrectStreak = isCorrect ? word.correctStreak + 1 : 0;
    const newPracticeCount = word.practiceCount + 1;
    const newTotalErrors = isCorrect ? word.totalErrors : (word.totalErrors || 0) + 1;

    let newStatus = word.status;
    if (newCorrectStreak >= 3 && word.status === 'learning') {
      newStatus = 'reviewing';
    } else if (newCorrectStreak >= 5 && word.status === 'reviewing') {
      newStatus = 'mastered';
    }

    const updates = {
      practice_count: newPracticeCount,
      correct_streak: newCorrectStreak,
      total_errors: newTotalErrors,
      status: newStatus,
      last_practiced: new Date().toISOString().split('T')[0],
      next_review: getNextReviewDate(newStatus, newPracticeCount),
    };

    const updatedWord = await db.updateWord(wordId, updates);

    if (updatedWord) {
      setWords(prev => prev.map(w => {
        if (w.id !== wordId) return w;
        return {
          ...w,
          practiceCount: updatedWord.practice_count,
          correctStreak: updatedWord.correct_streak,
          totalErrors: updatedWord.total_errors || 0,
          status: updatedWord.status,
          lastPracticed: updatedWord.last_practiced,
          nextReview: updatedWord.next_review,
        };
      }));
    }
  };

  const startPracticeSession = async () => {
    if (words.length === 0) {
      alert('No words in your bank yet! Add some words first.');
      return;
    }

    const sessionCount = getSessionCount();
    const practiceSet = await db.getDailyPracticeSet(currentUserId!, sessionCount);

    if (practiceSet.words.length === 0) {
      alert('All words have graduated! Add more words or wait for retention checks.');
      return;
    }

    const formattedPracticeWords = toUiWords(practiceSet.words);

    console.log(`Starting practice session #${sessionCount + 1}`);
    console.log(`New: ${practiceSet.newWords.length}, Struggling: ${practiceSet.strugglingWords.length}, Review: ${practiceSet.reviewWords.length}, Retention: ${practiceSet.retentionWord ? 1 : 0}, Backfill: ${practiceSet.backfillWords.length}`);

    setPracticeWords(formattedPracticeWords);
    setIsPracticing(true);
  };

  const handlePracticeComplete = async (results: PracticeResult[]) => {
    for (const result of results) {
      await recordPractice(result.wordId, result.isCorrect);
    }

    incrementSessionCount();
    setIsPracticing(false);
    setPracticeWords([]);

    const updatedWords = await db.getUserWords(currentUserId!);
    setWords(toUiWords(updatedWords));
  };

  const exitPractice = () => {
    if (confirm('Exit practice session? Your answered words have already been saved.')) {
      setIsPracticing(false);
      setPracticeWords([]);
    }
  };

  return {
    // State
    currentUserId,
    isLockedUser,
    words,
    isLoading,
    isAdding,
    autoRefreshing,
    newWord,
    showSuggestions,
    filteredSuggestions,
    editingNotes,
    audioSources,
    isPracticing,
    practiceWords,
    stats,
    eligibleWordsCount,
    sessionNumber: getSessionCount() + 1,

    // Actions
    setNewWord,
    setShowSuggestions,
    setEditingNotes,
    handleUserSelect,
    addWord,
    deleteWord,
    updateNotes,
    togglePriority,
    refreshPhonetics,
    refreshAllPhonetics,
    fetchMissingAudio,
    playAudio,
    recordPractice,
    startPracticeSession,
    handlePracticeComplete,
    exitPractice,
  };
};
