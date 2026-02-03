/*
  # Add priority and total_errors columns to pronunciation_words

  ## Overview
  This migration adds two new columns to support the daily practice selection algorithm:
  - `priority` - Allows users to mark important words for prioritized review
  - `total_errors` - Tracks cumulative incorrect answers for struggling word identification

  ## New Columns

  ### `priority` (boolean, default false)
  - Marks words as high priority for the user
  - Priority words are selected first in the Review bucket during daily practice

  ### `total_errors` (integer, default 0)
  - Cumulative count of incorrect answers for this word
  - Used to identify struggling words (words with total_errors >= 1)
  - Struggling words are sorted by most errors first during daily practice

  ## Indexes
  - Index on priority for filtering priority words
  - Index on total_errors for sorting struggling words
*/

-- Add priority column
ALTER TABLE pronunciation_words
ADD COLUMN IF NOT EXISTS priority boolean DEFAULT false;

-- Add total_errors column
ALTER TABLE pronunciation_words
ADD COLUMN IF NOT EXISTS total_errors integer DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pronunciation_words_priority
  ON pronunciation_words(priority);

CREATE INDEX IF NOT EXISTS idx_pronunciation_words_total_errors
  ON pronunciation_words(total_errors);
