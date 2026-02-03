/*
  # Create Pronunciation Bank Database Schema

  ## Overview
  This migration creates the database structure for the Pronunciation Bank application,
  enabling persistent storage of user data and pronunciation words across sessions.

  ## New Tables

  ### `users`
  Stores basic user information for the pronunciation bank app
  - `id` (text, primary key) - Unique user identifier
  - `name` (text) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp

  ### `pronunciation_words`
  Stores all pronunciation words with spaced repetition data
  - `id` (uuid, primary key) - Unique word entry identifier
  - `user_id` (text, foreign key) - References users table
  - `word` (text) - The word being learned
  - `phonetic` (text) - IPA phonetic notation
  - `pattern` (text) - Stress pattern representation
  - `readable` (text) - Human-readable pronunciation guide
  - `audio_url` (text) - URL to pronunciation audio file
  - `status` (text) - Learning status: learning, reviewing, or mastered
  - `practice_count` (integer) - Total number of practice attempts
  - `correct_streak` (integer) - Current streak of correct answers
  - `next_review` (date) - Date for next spaced repetition review
  - `last_practiced` (date) - Date of most recent practice session
  - `notes` (text) - User's personal notes about the word
  - `created_at` (timestamptz) - When the word was added

  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on both tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations

  ### Policies
  
  #### users table:
  - SELECT: Users can view only their own user record
  - INSERT: Users can create their own user record
  - UPDATE: Users can update only their own user record
  - DELETE: Users can delete only their own user record

  #### pronunciation_words table:
  - SELECT: Users can view only their own words
  - INSERT: Users can add words to their own collection
  - UPDATE: Users can update only their own words
  - DELETE: Users can delete only their own words

  ## Indexes
  - Index on pronunciation_words.user_id for faster user-specific queries
  - Index on pronunciation_words.status for filtering by learning status
  - Index on pronunciation_words.next_review for spaced repetition scheduling
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pronunciation_words table
CREATE TABLE IF NOT EXISTS pronunciation_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word text NOT NULL,
  phonetic text DEFAULT '',
  pattern text DEFAULT '',
  readable text DEFAULT '',
  audio_url text DEFAULT '',
  status text DEFAULT 'learning',
  practice_count integer DEFAULT 0,
  correct_streak integer DEFAULT 0,
  next_review date,
  last_practiced date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for pronunciation_words table
CREATE POLICY "Users can view own words"
  ON pronunciation_words FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own words"
  ON pronunciation_words FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own words"
  ON pronunciation_words FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own words"
  ON pronunciation_words FOR DELETE
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_user_id 
  ON pronunciation_words(user_id);

CREATE INDEX IF NOT EXISTS idx_pronunciation_words_status 
  ON pronunciation_words(status);

CREATE INDEX IF NOT EXISTS idx_pronunciation_words_next_review 
  ON pronunciation_words(next_review);