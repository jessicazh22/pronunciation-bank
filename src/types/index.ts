// Database types (snake_case - matches Supabase schema)
export interface DbUser {
  id: string;
  name: string;
  created_at: string;
}

export interface DbWord {
  id: string;
  user_id: string;
  word: string;
  phonetic: string;
  pattern: string;
  readable: string;
  audio_url: string;
  status: 'learning' | 'reviewing' | 'mastered';
  practice_count: number;
  correct_streak: number;
  total_errors: number;
  priority: boolean;
  next_review: string;
  last_practiced: string | null;
  notes: string;
  created_at: string;
}

// UI types (camelCase - used in React components)
export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pattern: string;
  readable: string;
  audioUrl: string;
  status: 'learning' | 'reviewing' | 'mastered';
  practiceCount: number;
  correctStreak: number;
  totalErrors: number;
  priority: boolean;
  nextReview: string;
  lastPracticed: string | null;
  notes: string;
  createdAt: string;
}

export interface PracticeResult {
  wordId: string;
  word: string;
  isCorrect: boolean;
}

export interface WordStats {
  learning: number;
  reviewing: number;
  mastered: number;
}

export interface DailyPracticeSet {
  words: DbWord[];
  newWords: DbWord[];
  strugglingWords: DbWord[];
  reviewWords: DbWord[];
  retentionWord: DbWord | null;
  backfillWords: DbWord[];
}

// Re-export for backward compatibility
export type PronunciationWord = DbWord;
