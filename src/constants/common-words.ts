// Common English words for autocomplete (commonly mispronounced words)
export const COMMON_WORDS = [
  'comfortable', 'vegetable', 'chocolate', 'interesting', 'different', 'restaurant', 'library',
  'February', 'Wednesday', 'schedule', 'business', 'develop', 'environment', 'government',
  'probably', 'especially', 'basically', 'literally', 'actually', 'generally', 'particularly',
  'nuclear', 'jewelry', 'mischievous', 'pronunciation', 'supposedly', 'espresso', 'etcetera',
  'prescription', 'architect', 'hierarchy', 'relevant', 'temperature',
  'laboratory', 'Caribbean', 'controversial', 'statistics', 'accessories', 'accidentally',
  'anonymous', 'athlete', 'candidate', 'caramel', 'cemetery', 'colleague', 'conscience',
  'conscious', 'consensus', 'definitely', 'deteriorate', 'draught', 'drought', 'eighth',
  'eligible', 'embarrass', 'exaggerate', 'existence', 'facilities', 'familiar', 'financial',
  'foreign', 'guarantee', 'guardian', 'harass', 'heritage', 'identity',
  'independent', 'maintenance', 'millennium', 'miniature', 'mischief', 'mortgage', 'muscle',
  'necessary', 'neighbor', 'obsolete', 'occasionally', 'occurrence', 'parallel', 'parliament',
  'permanent', 'perseverance', 'persistent', 'personnel', 'possess', 'precede', 'prejudice',
  'privilege', 'proceed', 'receipt', 'receive', 'recommend', 'reference',
  'referred', 'rhythm', 'separate', 'sergeant',
  'significant', 'similar', 'sincerely', 'succeed', 'success', 'sufficient',
  'surprise', 'thorough', 'tomorrow', 'transferred', 'truly', 'unnecessary',
  'until', 'unusual', 'vacuum', 'valuable', 'vehicle', 'weird', 'welfare', 'whether',
  'woman', 'women', 'colonel', 'debris', 'lingerie', 'genre', 'niche', 'ballet', 'buffet',
  'cliche', 'fiance', 'entrepreneur', 'hors', 'rendezvous', 'reservoir', 'silhouette',
  'vague', 'antique', 'boutique', 'catalogue', 'fatigue', 'intrigue', 'league',
  'plague', 'rogue', 'vogue', 'analogue', 'dialogue', 'epilogue', 'monologue', 'prologue',
  'synagogue', 'travelogue', 'demagogue', 'pedagogue'
].sort();

// Spaced repetition intervals (in days)
export const SPACED_REPETITION = {
  LEARNING_INTERVAL: 1,
  REVIEWING_INTERVAL_EARLY: 3,
  REVIEWING_INTERVAL_LATE: 7,
  MASTERED_INTERVAL: 14,
  REVIEWING_THRESHOLD: 3, // practice count threshold for early vs late
};

// Daily practice configuration
export const DAILY_PRACTICE = {
  TOTAL_SIZE: 15,
  NEW_WORDS_COUNT: 7,
  STRUGGLING_WORDS_COUNT: 5,
  REVIEW_WORDS_COUNT: 3,
  GRADUATION_STREAK: 3,
  RETENTION_CHECK_INTERVAL: 5,
};
