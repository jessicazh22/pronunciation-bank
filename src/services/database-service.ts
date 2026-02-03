import { supabase, User, PronunciationWord } from './supabase-client';

export const createUser = async (id: string, name: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert({ id, name })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

export const getUser = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
};

export const getUserWords = async (userId: string): Promise<PronunciationWord[]> => {
  const { data, error } = await supabase
    .from('pronunciation_words')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching words:', error);
    return [];
  }

  return data || [];
};

export const addWord = async (userId: string, word: Omit<PronunciationWord, 'id' | 'user_id' | 'created_at'>): Promise<PronunciationWord | null> => {
  const { data, error } = await supabase
    .from('pronunciation_words')
    .insert({
      user_id: userId,
      ...word
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding word:', error);
    return null;
  }

  return data;
};

export const updateWord = async (wordId: string, updates: Partial<PronunciationWord>): Promise<PronunciationWord | null> => {
  const { data, error } = await supabase
    .from('pronunciation_words')
    .update(updates)
    .eq('id', wordId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating word:', error);
    return null;
  }

  return data;
};

export const deleteWord = async (wordId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pronunciation_words')
    .delete()
    .eq('id', wordId);

  if (error) {
    console.error('Error deleting word:', error);
    return false;
  }

  return true;
};

export interface AudioCacheStats {
  total_cached: number;
  by_source: {
    source: string;
    count: number;
  }[];
  most_accessed: {
    word: string;
    access_count: number;
    source: string;
  }[];
}

/** Get audio source (free_dictionary, forvo, voicerss, browser_tts) for words that are in audio_cache. */
export const getAudioSourcesForWords = async (words: string[]): Promise<Record<string, string>> => {
  if (!words.length) return {};
  const norm = words.map((w) => w.toLowerCase().trim()).filter(Boolean);
  const { data, error } = await supabase
    .from('audio_cache')
    .select('word, source')
    .in('word', [...new Set(norm)]);
  if (error) {
    console.error('Error fetching audio sources:', error);
    return {};
  }
  const out: Record<string, string> = {};
  for (const row of data || []) {
    out[row.word] = row.source;
  }
  return out;
};

export const getAudioCacheStats = async (): Promise<AudioCacheStats | null> => {
  try {
    const { data: totalData, error: totalError } = await supabase
      .from('audio_cache')
      .select('id', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total cache count:', totalError);
      return null;
    }

    const { data: bySourceData, error: bySourceError } = await supabase
      .from('audio_cache')
      .select('source');

    if (bySourceError) {
      console.error('Error fetching by source data:', bySourceError);
      return null;
    }

    const sourceCount = (bySourceData || []).reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const { data: mostAccessedData, error: mostAccessedError } = await supabase
      .from('audio_cache')
      .select('word, access_count, source')
      .order('access_count', { ascending: false })
      .limit(10);

    if (mostAccessedError) {
      console.error('Error fetching most accessed data:', mostAccessedError);
      return null;
    }

    return {
      total_cached: totalData?.length || 0,
      by_source: Object.entries(sourceCount).map(([source, count]) => ({
        source,
        count
      })),
      most_accessed: mostAccessedData || []
    };
  } catch (error) {
    console.error('Error fetching audio cache stats:', error);
    return null;
  }
};

export const clearOldCacheEntries = async (daysOld: number = 90): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('audio_cache')
      .delete()
      .lt('last_accessed', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error clearing old cache entries:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
    return 0;
  }
};

// Daily Practice Selection Constants
const DAILY_PRACTICE_SIZE = 15;
const NEW_WORDS_COUNT = 7;
const STRUGGLING_WORDS_COUNT = 5;
const REVIEW_WORDS_COUNT = 3;
const GRADUATION_STREAK = 3;
const RETENTION_CHECK_INTERVAL = 5; // Every 5 sessions, add 1 graduated word

export interface DailyPracticeSet {
  words: PronunciationWord[];
  newWords: PronunciationWord[];
  strugglingWords: PronunciationWord[];
  reviewWords: PronunciationWord[];
  retentionWord: PronunciationWord | null;
  backfillWords: PronunciationWord[];
}

/**
 * Get the daily practice set for a user based on the selection algorithm:
 * - New words (7): Earliest added, not graduated (correctStreak < 3)
 * - Struggling words (5): Words with totalErrors >= 1, sorted by most errors first
 * - Review words (3): Not new/struggling, not graduated, sorted by priority then oldest practiced
 * - Retention check: Every 5 sessions, add 1 random graduated word
 * - Backfill: If any bucket is short, fill from chronological order (earliest first)
 */
export const getDailyPracticeSet = async (
  userId: string,
  sessionCount: number
): Promise<DailyPracticeSet> => {
  // Fetch all words for the user, ordered by created_at ascending (oldest first)
  const { data: allWords, error } = await supabase
    .from('pronunciation_words')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error || !allWords) {
    console.error('Error fetching words for daily practice:', error);
    return {
      words: [],
      newWords: [],
      strugglingWords: [],
      reviewWords: [],
      retentionWord: null,
      backfillWords: []
    };
  }

  // Separate graduated vs non-graduated words
  const graduatedWords = allWords.filter(w => (w.correct_streak || 0) >= GRADUATION_STREAK);
  const nonGraduatedWords = allWords.filter(w => (w.correct_streak || 0) < GRADUATION_STREAK);

  const selectedIds = new Set<string>();

  // 1. NEW WORDS: Earliest added, not graduated, never or barely practiced
  // Consider "new" as words with low practice count (< 3 practices)
  const newWords = nonGraduatedWords
    .filter(w => (w.practice_count || 0) < 3)
    .slice(0, NEW_WORDS_COUNT);

  newWords.forEach(w => selectedIds.add(w.id));

  // 2. STRUGGLING WORDS: Words with at least 1 error, sorted by most errors first
  const strugglingWords = nonGraduatedWords
    .filter(w => !selectedIds.has(w.id) && (w.total_errors || 0) >= 1)
    .sort((a, b) => (b.total_errors || 0) - (a.total_errors || 0))
    .slice(0, STRUGGLING_WORDS_COUNT);

  strugglingWords.forEach(w => selectedIds.add(w.id));

  // 3. REVIEW WORDS: Not new/struggling, not graduated, sorted by priority then oldest practiced
  const reviewWords = nonGraduatedWords
    .filter(w => !selectedIds.has(w.id))
    .sort((a, b) => {
      // Priority words first
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      // Then by oldest last_practiced (null means never practiced, should come first)
      const aDate = a.last_practiced ? new Date(a.last_practiced).getTime() : 0;
      const bDate = b.last_practiced ? new Date(b.last_practiced).getTime() : 0;
      return aDate - bDate;
    })
    .slice(0, REVIEW_WORDS_COUNT);

  reviewWords.forEach(w => selectedIds.add(w.id));

  // 4. RETENTION CHECK: Every N sessions, add 1 random graduated word
  let retentionWord: PronunciationWord | null = null;
  if (sessionCount > 0 && sessionCount % RETENTION_CHECK_INTERVAL === 0 && graduatedWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * graduatedWords.length);
    retentionWord = graduatedWords[randomIndex];
    selectedIds.add(retentionWord.id);
  }

  // 5. BACKFILL: If we don't have enough words, fill from chronological order
  const currentCount = selectedIds.size;
  const backfillNeeded = DAILY_PRACTICE_SIZE - currentCount;

  const backfillWords = backfillNeeded > 0
    ? nonGraduatedWords
        .filter(w => !selectedIds.has(w.id))
        .slice(0, backfillNeeded)
    : [];

  backfillWords.forEach(w => selectedIds.add(w.id));

  // Combine all words
  const allSelectedWords = [
    ...newWords,
    ...strugglingWords,
    ...reviewWords,
    ...(retentionWord ? [retentionWord] : []),
    ...backfillWords
  ];

  // Sort so priority (starred) words appear first, preserving relative order otherwise
  const priorityWords = allSelectedWords.filter(w => w.priority);
  const nonPriorityWords = allSelectedWords.filter(w => !w.priority);
  const words = [...priorityWords, ...nonPriorityWords];

  return {
    words,
    newWords,
    strugglingWords,
    reviewWords,
    retentionWord,
    backfillWords
  };
};

/** Toggle priority status for a word */
export const toggleWordPriority = async (wordId: string): Promise<PronunciationWord | null> => {
  // First get current priority
  const { data: current, error: fetchError } = await supabase
    .from('pronunciation_words')
    .select('priority')
    .eq('id', wordId)
    .maybeSingle();

  if (fetchError || !current) {
    console.error('Error fetching word priority:', fetchError);
    return null;
  }

  // Toggle it
  const newPriority = !current.priority;

  const { data, error } = await supabase
    .from('pronunciation_words')
    .update({ priority: newPriority })
    .eq('id', wordId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error toggling word priority:', error);
    return null;
  }

  return data;
};
