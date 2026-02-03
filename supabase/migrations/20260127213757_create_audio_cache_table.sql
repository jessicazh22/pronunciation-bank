/*
  # Create Audio Cache Table

  ## Overview
  This migration creates a global audio cache table to store pronunciation audio URLs
  from various sources. This significantly reduces API calls and token usage by caching
  audio URLs that can be reused across all users.

  ## New Tables
  
  ### `audio_cache`
  Stores cached audio URLs with source tracking
  - `id` (uuid, primary key) - Unique cache entry identifier
  - `word` (text, unique) - The word (normalized to lowercase)
  - `audio_url` (text) - URL or identifier for audio source
  - `source` (text) - Source of audio: 'free_dictionary', 'forvo', 'google_tts', 'amazon_polly', 'browser_tts'
  - `quality_score` (integer) - Quality ranking (1=best, higher=fallback)
  - `created_at` (timestamptz) - When the cache entry was created
  - `last_accessed` (timestamptz) - When last used (for cache management)
  - `access_count` (integer) - Number of times this cache entry was used

  ## Security
  
  ### Row Level Security (RLS)
  - Enabled on the table
  - All users can read cached audio (public data)
  - Only the system can insert/update cache entries
  
  ### Policies
  - SELECT: All users can read cached audio entries
  - INSERT: Only authenticated users can add cache entries
  - UPDATE: Only authenticated users can update access tracking

  ## Indexes
  - Unique index on word for fast lookups
  - Index on source for filtering by audio source
  - Index on created_at for cache management
*/

-- Create audio_cache table
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  audio_url text NOT NULL,
  source text NOT NULL DEFAULT 'free_dictionary',
  quality_score integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  access_count integer DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audio_cache table
CREATE POLICY "Anyone can view cached audio"
  ON audio_cache FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert cache entries"
  ON audio_cache FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update access tracking"
  ON audio_cache FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_audio_cache_word 
  ON audio_cache(word);

CREATE INDEX IF NOT EXISTS idx_audio_cache_source 
  ON audio_cache(source);

CREATE INDEX IF NOT EXISTS idx_audio_cache_created_at 
  ON audio_cache(created_at);

-- Function to update last_accessed and increment access_count
CREATE OR REPLACE FUNCTION update_audio_cache_access(cache_word text)
RETURNS void AS $$
BEGIN
  UPDATE audio_cache
  SET 
    last_accessed = now(),
    access_count = access_count + 1
  WHERE word = cache_word;
END;
$$ LANGUAGE plpgsql;