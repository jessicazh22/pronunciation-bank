import { supabase } from './supabase-client';

interface DictionaryApiPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiResponse {
  word: string;
  phonetics: DictionaryApiPhonetic[];
}

interface AudioCacheEntry {
  word: string;
  audio_url: string;
  source: string;
  quality_score: number;
}

/** Capitalise first letter only: "wednesday" -> "Wednesday". Use for API queries where proper form helps. */
export const toTitleCaseWord = (word: string): string => {
  const t = word.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

/** Variants to try for API requests: normalised (lowercase) and title-case (e.g. Wednesday). */
const getQueryVariants = (word: string): string[] => {
  const w = word.trim();
  if (!w) return [];
  const low = w.toLowerCase();
  const title = toTitleCaseWord(w);
  const uniq = low === title ? [low] : [low, title];
  return uniq;
};

/** Base-form candidates for derived words (e.g. accessing→access, walked→walk). Tried when exact word has no audio. */
const getBaseFormCandidates = (word: string): string[] => {
  const w = word.toLowerCase().trim();
  if (w.length < 4) return [];
  const out: string[] = [];
  if (w.endsWith('ing') && w.length > 5) {
    out.push(w.slice(0, -3));
    if (w.length > 6) out.push(w.slice(0, -3) + 'e');
  }
  if (w.endsWith('ed') && w.length > 4) {
    out.push(w.slice(0, -2));
    if (!w.endsWith('eed')) out.push(w.slice(0, -2) + 'e');
  }
  if (w.endsWith('es') && w.length > 4) {
    out.push(w.slice(0, -2));
  }
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss') && !w.endsWith('es')) {
    out.push(w.slice(0, -1));
  }
  if (w.endsWith('er') && w.length > 4) {
    out.push(w.slice(0, -2));
    out.push(w.slice(0, -2) + 'e');
  }
  if (w.endsWith('ly') && w.length > 5) {
    out.push(w.slice(0, -2));
  }
  return [...new Set(out)].filter(c => c.length >= 2);
};

const getCachedAudio = async (word: string): Promise<string | null> => {
  try {
    const normalizedWord = word.toLowerCase().trim();
    const { data, error } = await supabase
      .from('audio_cache')
      .select('audio_url, source')
      .eq('word', normalizedWord)
      .maybeSingle();

    if (error) {
      console.error('Error fetching from cache:', error);
      return null;
    }

    if (data?.audio_url) {
      await supabase.rpc('update_audio_cache_access', { cache_word: normalizedWord });
      console.log(`✓ Cache hit for "${word}" (source: ${data.source})`);
      return data.audio_url;
    }

    return null;
  } catch (error) {
    console.error('Cache lookup error:', error);
    return null;
  }
};

const saveToCache = async (word: string, audioUrl: string, source: string, qualityScore: number): Promise<void> => {
  try {
    const normalizedWord = word.toLowerCase().trim();
    const { error } = await supabase
      .from('audio_cache')
      .upsert({
        word: normalizedWord,
        audio_url: audioUrl,
        source,
        quality_score: qualityScore,
        last_accessed: new Date().toISOString(),
        access_count: 1
      }, {
        onConflict: 'word'
      });

    if (error) {
      console.error('Error saving to cache:', error);
    } else {
      console.log(`✓ Cached "${word}" from ${source}`);
    }
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

const fetchFromFreeDictionaryOne = async (queryWord: string): Promise<string | null> => {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(queryWord)}`);
  if (!response.ok) return null;

  const data: DictionaryApiResponse[] = await response.json();
  if (!data || data.length === 0) return null;

  const phonetics = data[0].phonetics;
  if (!phonetics || phonetics.length === 0) return null;

  const audioPhonetic = phonetics.find(p => p.audio && p.audio.includes('-us.mp3'));
  if (audioPhonetic?.audio) return audioPhonetic.audio;

  const anyAudio = phonetics.find(p => p.audio && (p.audio?.length ?? 0) > 0);
  return anyAudio?.audio ?? null;
};

const fetchFromFreeDictionary = async (word: string): Promise<string | null> => {
  try {
    const variants = getQueryVariants(word);
    // Only try exact word variants (lowercase, title-case), not base forms
    // This ensures "accessing" gets TTS pronunciation, not "access" audio
    for (const queryWord of variants) {
      const audio = await fetchFromFreeDictionaryOne(queryWord);
      if (audio) {
        console.log(`✓ Found audio for "${word}" from Free Dictionary API (queried as "${queryWord}")`);
        return audio;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching from Free Dictionary API for "${word}":`, error);
    return null;
  }
};

/** Forvo: fetches HTML and extracts mp3 URLs. Note: may be CORS-blocked when run in the browser; use a backend proxy if needed. */
const fetchFromForvo = async (word: string): Promise<string | null> => {
  try {
    const query = getQueryVariants(word)[0] ?? word.toLowerCase();
    const response = await fetch(`https://forvo.com/word/${encodeURIComponent(query)}/#en`, { mode: 'cors' });

    if (!response.ok) return null;

    const html = await response.text();
    const audioRegex = /https:\/\/audio\d+\.forvo\.com\/audios\/mp3\/[^"']+\.mp3/g;
    const matches = html.match(audioRegex);

    if (matches && matches.length > 0) {
      console.log(`✓ Found audio for "${word}" from Forvo`);
      return matches[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching from Forvo for "${word}":`, error);
    return null;
  }
};

/** Sentinel value meaning "use browser Web Speech API". Only used when no human-like TTS is available. */
export const BROWSER_TTS_MARKER = 'browser-tts';

const fetchFromTTS = async (word: string): Promise<{ url: string; source: string } | null> => {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: word }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.audioUrl && typeof data.audioUrl === 'string' && data.audioUrl.length > 50) {
      const source = (data.source && typeof data.source === 'string') ? data.source : 'tts';
      console.log(`✓ Generated TTS for "${word}" (${source})`);
      return { url: data.audioUrl, source };
    }
    return null;
  } catch (e) {
    console.error(`Error fetching TTS for "${word}":`, e);
    return null;
  }
};

export type FetchAudioOptions = { skipCache?: boolean };

export const fetchAudioUrl = async (word: string, opts?: FetchAudioOptions): Promise<string> => {
  const skipCache = opts?.skipCache === true;
  console.log(`🔍 Starting audio cascade for "${word}"${skipCache ? ' (skip cache)' : ''}...`);

  if (!skipCache) {
    const cachedAudio = await getCachedAudio(word);
    if (cachedAudio) return cachedAudio;
  }

  const freeDictionaryAudio = await fetchFromFreeDictionary(word);
  if (freeDictionaryAudio) {
    await saveToCache(word, freeDictionaryAudio, 'free_dictionary', 1);
    return freeDictionaryAudio;
  }

  const ttsResult = await fetchFromTTS(word);
  if (ttsResult) {
    await saveToCache(word, ttsResult.url, ttsResult.source, 2);
    return ttsResult.url;
  }

  const forvoAudio = await fetchFromForvo(word);
  if (forvoAudio) {
    await saveToCache(word, forvoAudio, 'forvo', 3);
    return forvoAudio;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    console.log(`✓ Using browser TTS as last resort for "${word}" (set VOICERSS_API_KEY for human-like fallback)`);
    await saveToCache(word, BROWSER_TTS_MARKER, 'browser_tts', 4);
    return BROWSER_TTS_MARKER;
  }

  console.log(`❌ No audio source found for "${word}"`);
  return '';
};

export const playWordAudio = (word: string, audioUrl: string | null): void => {
  const useBrowserTts = !audioUrl || audioUrl === '' || audioUrl === BROWSER_TTS_MARKER || audioUrl.startsWith('browser-tts');

  if (useBrowserTts && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
    return;
  }

  if (!audioUrl || audioUrl === '') {
    console.warn(`No audio available for "${word}"`);
    alert(`No audio pronunciation available for "${word}". Try refreshing the word to search for audio again.`);
    return;
  }

  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    alert(`Failed to play audio for "${word}". The audio file may be unavailable.`);
  });
};
