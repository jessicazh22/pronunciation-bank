import { createClient } from '@supabase/supabase-js';
import { DbUser, DbWord } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export types for backward compatibility
export type User = DbUser;
export type PronunciationWord = DbWord;
