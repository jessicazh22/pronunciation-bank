import { generateStressPattern } from '../utils/pronunciation-utils';
import { fetchAudioUrl, toTitleCaseWord } from './audio-fetcher';

export interface PronunciationData {
  phonetic: string;
  pattern: string;
  readable: string;
  audioUrl: string;
}

interface PronunciationOptions {
  skipCache?: boolean;
}

// Get real pronunciation data from Free Dictionary API
// Tries lowercase first, then title-case (e.g. Wednesday)
export const getPronunciationData = async (
  word: string,
  opts: PronunciationOptions = {}
): Promise<PronunciationData> => {
  const { skipCache = false } = opts;
  const variants = [word.toLowerCase().trim(), toTitleCaseWord(word)]
    .filter((v, i, a) => a.indexOf(v) === i);

  let data = null;
  let entry = null;

  for (const query of variants) {
    try {
      console.log(`Calling API for: ${word} (try: ${query})`);
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        console.log(`API returned error for ${query}:`, response.status);
        continue;
      }
      data = await response.json();
      entry = data?.[0];
      if (entry) break;
    } catch (e) {
      console.warn(`Dictionary API try "${query}" failed:`, e);
    }
  }

  try {
    if (!entry) throw new Error('Word not found');
    console.log(`API response for ${word}:`, data);

    let phonetic = extractPhonetic(entry);
    console.log(`Final phonetic for ${word}: ${phonetic}`);

    const pattern = generateStressPattern(word, phonetic);
    console.log(`Generated pattern for ${word}: ${pattern}`);

    const audioUrl = await fetchAudioUrl(word, skipCache ? { skipCache: true } : undefined);
    console.log(`Cascade audio URL for ${word}: ${audioUrl}`);

    return {
      phonetic: phonetic || `/${word}/`,
      pattern,
      readable: pattern,
      audioUrl,
    };
  } catch (error) {
    console.error(`Dictionary API error for ${word}:`, error);
    const audioUrl = await fetchAudioUrl(word, skipCache ? { skipCache: true } : undefined);
    return {
      phonetic: `/${word}/`,
      pattern: word.toUpperCase(),
      readable: word.toUpperCase(),
      audioUrl,
    };
  }
};

// Extract phonetic notation from dictionary entry
const extractPhonetic = (entry: any): string => {
  let phonetic = '';

  // 1. Try main phonetic field
  if (entry.phonetic) {
    phonetic = entry.phonetic;
    console.log(`Found phonetic in main field: ${phonetic}`);
  }

  // 2. Try phonetics array for phonetic text
  if (entry.phonetics?.length > 0 && !phonetic) {
    console.log(`Checking phonetics array:`, entry.phonetics);
    for (const p of entry.phonetics) {
      if (p.text) {
        phonetic = p.text;
        console.log(`Found phonetic in array: ${phonetic}`);
        break;
      }
    }
  }

  // Clean up phonetic notation
  if (phonetic) {
    phonetic = phonetic
      .replace(/\s*\(US\)\s*/g, '')
      .replace(/\s*\(UK\)\s*/g, '')
      .trim();
  }

  return phonetic;
};
