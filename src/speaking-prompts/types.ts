// Grammar focus areas for targeted practice
export type GrammarFocus =
  | 'past_tense'
  | 'present_perfect'
  | 'conditionals'
  | 'comparatives'
  | 'articles'
  | 'prepositions'
  | 'passive_voice'
  | 'reported_speech'
  | 'modals'
  | 'relative_clauses';

// Speaking patterns to practice
export type SpeakingPattern =
  | 'expressing_opinions'
  | 'describing'
  | 'comparing'
  | 'narrating'
  | 'explaining_process'
  | 'hypothesizing'
  | 'agreeing_disagreeing'
  | 'giving_examples';

// Difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Topic categories (IELTS-style)
export type TopicCategory =
  | 'hometown'
  | 'work_study'
  | 'hobbies'
  | 'technology'
  | 'art_culture'
  | 'environment'
  | 'health'
  | 'travel'
  | 'food'
  | 'education'
  | 'social_media'
  | 'family_friends';

// A tip/reminder shown before practicing
export interface PromptTip {
  id: string;
  text: string;
  grammarFocus?: GrammarFocus;
  speakingPattern?: SpeakingPattern;
}

// A single speaking prompt
export interface SpeakingPrompt {
  id: string;
  question: string;
  followUpQuestions: string[];
  category: TopicCategory;
  difficulty: DifficultyLevel;
  grammarFocus: GrammarFocus[];
  speakingPatterns: SpeakingPattern[];
  tips: PromptTip[];
  suggestedDuration: number; // in seconds
  vocabularyHints?: string[];
}

// Database types (snake_case - matches Supabase schema)
export interface DbSpeakingSession {
  id: string;
  user_id: string;
  prompt_id: string;
  recording_url: string | null;
  duration: number; // in seconds
  self_rating: number | null; // 1-5
  grammar_notes: string;
  fluency_notes: string;
  vocabulary_notes: string;
  general_notes: string;
  completed_at: string;
  created_at: string;
}

// UI types (camelCase - used in React components)
export interface SpeakingSession {
  id: string;
  promptId: string;
  recordingUrl: string | null;
  duration: number;
  selfRating: number | null;
  grammarNotes: string;
  fluencyNotes: string;
  vocabularyNotes: string;
  generalNotes: string;
  completedAt: string;
  createdAt: string;
}

// Session statistics
export interface SpeakingStats {
  totalSessions: number;
  averageRating: number;
  totalPracticeTime: number; // in seconds
  sessionsThisWeek: number;
  categoriesPracticed: TopicCategory[];
  grammarFocusCount: Record<GrammarFocus, number>;
}

// Filter state for prompt selection
export interface PromptFilters {
  categories: TopicCategory[];
  difficulty: DifficultyLevel | null;
  grammarFocus: GrammarFocus[];
  speakingPatterns: SpeakingPattern[];
}

// Feedback form state
export interface SessionFeedback {
  selfRating: number;
  grammarNotes: string;
  fluencyNotes: string;
  vocabularyNotes: string;
  generalNotes: string;
}
