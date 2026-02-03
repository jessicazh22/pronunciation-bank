import { DbWord, Word, DbUser, User } from '../types';

// Transform database word (snake_case) to UI word (camelCase)
export const toUiWord = (dbWord: DbWord): Word => ({
  id: dbWord.id,
  word: dbWord.word,
  phonetic: dbWord.phonetic,
  pattern: dbWord.pattern,
  readable: dbWord.readable || dbWord.pattern,
  audioUrl: dbWord.audio_url,
  status: dbWord.status,
  practiceCount: dbWord.practice_count,
  correctStreak: dbWord.correct_streak,
  totalErrors: dbWord.total_errors || 0,
  priority: dbWord.priority || false,
  nextReview: dbWord.next_review,
  lastPracticed: dbWord.last_practiced,
  notes: dbWord.notes,
  createdAt: dbWord.created_at,
});

// Transform UI word (camelCase) to database word (snake_case)
export const toDbWord = (word: Word, userId: string): Omit<DbWord, 'id' | 'created_at'> => ({
  user_id: userId,
  word: word.word,
  phonetic: word.phonetic,
  pattern: word.pattern,
  readable: word.readable,
  audio_url: word.audioUrl,
  status: word.status,
  practice_count: word.practiceCount,
  correct_streak: word.correctStreak,
  total_errors: word.totalErrors,
  priority: word.priority,
  next_review: word.nextReview,
  last_practiced: word.lastPracticed,
  notes: word.notes,
});

// Transform array of database words to UI words
export const toUiWords = (dbWords: DbWord[]): Word[] => dbWords.map(toUiWord);

// Transform database user to UI user
export const toUiUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  name: dbUser.name,
  createdAt: dbUser.created_at,
});

// Transform array of database users to UI users
export const toUiUsers = (dbUsers: DbUser[]): User[] => dbUsers.map(toUiUser);
