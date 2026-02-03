interface ConversionResult {
  readable: string;
  quality: number;
  needsLLM: boolean;
}

interface CachedPronunciation {
  word: string;
  phonetic: string;
  readable: string;
  timestamp: number;
}

const CACHE_KEY = 'pronunciation-cache-v1';

export const getPronunciationCache = (): Map<string, CachedPronunciation> => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error('Failed to load pronunciation cache:', error);
  }
  return new Map();
};

export const savePronunciationCache = (cache: Map<string, CachedPronunciation>): void => {
  try {
    const data = Object.fromEntries(cache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save pronunciation cache:', error);
  }
};

export const getCachedPronunciation = (word: string, phonetic: string): string | null => {
  const cache = getPronunciationCache();
  const key = `${word.toLowerCase()}:${phonetic}`;
  const cached = cache.get(key);

  if (cached) {
    return cached.readable;
  }
  return null;
};

export const cachePronunciation = (word: string, phonetic: string, readable: string): void => {
  const cache = getPronunciationCache();
  const key = `${word.toLowerCase()}:${phonetic}`;
  cache.set(key, {
    word,
    phonetic,
    readable,
    timestamp: Date.now()
  });
  savePronunciationCache(cache);
};

const ipaToEnglishMap: Array<[RegExp | string, string]> = [
  [/ɑːr/g, 'ar'],
  [/ɑː/g, 'ah'],
  [/æ/g, 'a'],
  [/eɪ/g, 'ay'],
  [/aɪ/g, 'eye'],
  [/aʊ/g, 'ow'],
  [/ɔː/g, 'aw'],
  [/ɔɪ/g, 'oy'],
  [/oʊ/g, 'oh'],
  [/əʊ/g, 'oh'],
  [/ɪə/g, 'eer'],
  [/eə/g, 'air'],
  [/ʊə/g, 'oor'],
  [/juː/g, 'yoo'],
  [/uː/g, 'oo'],
  [/iː/g, 'ee'],
  [/ɜːr/g, 'ur'],
  [/ɜː/g, 'ur'],
  [/ɝ/g, 'ur'],
  [/ər/g, 'er'],
  [/əl/g, 'ul'],
  [/ən/g, 'un'],
  [/əm/g, 'um'],
  [/ə/g, 'uh'],
  [/ɚ/g, 'er'],
  [/ɪ/g, 'ih'],
  [/i/g, 'ee'],
  [/ɛ/g, 'eh'],
  [/e/g, 'ay'],
  [/ʌ/g, 'uh'],
  [/ʊ/g, 'uu'],
  [/u/g, 'oo'],
  [/ɒ/g, 'ah'],
  [/ɔ/g, 'aw'],
  [/ɑ/g, 'ah'],
  [/θ/g, 'th'],
  [/ð/g, 'th'],
  [/ʃ/g, 'sh'],
  [/ʒ/g, 'zh'],
  [/tʃ/g, 'ch'],
  [/dʒ/g, 'j'],
  [/ŋ/g, 'ng'],
  [/j/g, 'y'],
  [/w/g, 'w'],
  [/r/g, 'r'],
  [/l/g, 'l'],
  [/m/g, 'm'],
  [/n/g, 'n'],
  [/p/g, 'p'],
  [/b/g, 'b'],
  [/t/g, 't'],
  [/d/g, 'd'],
  [/k/g, 'k'],
  [/ɡ/g, 'g'],
  [/g/g, 'g'],
  [/f/g, 'f'],
  [/v/g, 'v'],
  [/s/g, 's'],
  [/z/g, 'z'],
  [/h/g, 'h'],
  [/ː/g, ''],
  [/ˑ/g, ''],
  [/ʔ/g, ''],
  [/x/g, 'k'],
];

const postProcessingSimplifcations: Array<[RegExp, string]> = [
  [/uhuh/g, 'uh'],
  [/erer/g, 'er'],
  [/ihih/g, 'ih'],
  [/oooo/g, 'oo'],
  [/eeee/g, 'ee'],
  [/([aeiou])\1{2,}/g, '$1$1'],
  [/uhbul$/g, 'ble'],
  [/uhl$/g, 'ul'],
  [/uhm$/g, 'um'],
  [/uhn$/g, 'un'],
  [/tuh$/g, 't'],
  [/duh$/g, 'd'],
  [/^kuh([mnlr])/g, 'cuh$1'],
];

const convertIPAToEnglish = (ipaText: string): string => {
  let result = ipaText;

  for (const [pattern, replacement] of ipaToEnglishMap) {
    if (typeof pattern === 'string') {
      result = result.replaceAll(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }

  result = result.replace(/[^a-z-]/gi, '');

  for (const [pattern, replacement] of postProcessingSimplifcations) {
    result = result.replace(pattern, replacement);
  }

  return result;
};

const assessQuality = (original: string, converted: string, syllableCount: number): number => {
  let score = 100;

  if (!converted || converted.length === 0) {
    return 0;
  }

  if (converted.length < 2) {
    score -= 30;
  }

  const vowelCount = (converted.match(/[aeiou]/gi) || []).length;
  if (vowelCount === 0) {
    score -= 40;
  } else if (vowelCount < syllableCount - 1) {
    score -= 20;
  }

  const hasWeirdPatterns = /([bcdfghjklmnpqrstvwxyz])\1{2,}/i.test(converted);
  if (hasWeirdPatterns) {
    score -= 25;
  }

  const syllables = converted.split('-');
  const hasEmptySyllables = syllables.some(s => !s || s.length === 0);
  if (hasEmptySyllables) {
    score -= 30;
  }

  const lengthRatio = converted.length / original.length;
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    score -= 15;
  }

  return Math.max(0, score);
};

export const generateReadablePronunciation = (word: string, phonetic: string): ConversionResult => {
  const cached = getCachedPronunciation(word, phonetic);
  if (cached) {
    return {
      readable: cached,
      quality: 100,
      needsLLM: false
    };
  }

  if (!phonetic || phonetic === `/${word}/`) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    if (syllables.length === 1) {
      return {
        readable: word.toLowerCase(),
        quality: 50,
        needsLLM: true
      };
    }
    const result = syllables.map(s => s.toLowerCase()).join('-');
    return {
      readable: result,
      quality: 50,
      needsLLM: true
    };
  }

  const cleanPhonetic = phonetic.replace(/^\/|\/$/g, '').replace(/\(.*?\)/g, '');

  const parts = cleanPhonetic.split(/(ˈ|ˌ)/);

  if (parts.length <= 1) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    const result = syllables.map(s => s.toLowerCase()).join('-');
    return {
      readable: result,
      quality: 50,
      needsLLM: true
    };
  }

  const syllablePattern: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part && part !== 'ˈ' && part !== 'ˌ' && part.trim()) {
      const converted = convertIPAToEnglish(part);
      if (converted) {
        syllablePattern.push(converted);
      }
    }
  }

  if (syllablePattern.length === 0) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    const result = syllables.map(s => s.toLowerCase()).join('-');
    return {
      readable: result,
      quality: 40,
      needsLLM: true
    };
  }

  const readable = syllablePattern.join('-');
  const quality = assessQuality(word, readable, syllablePattern.length);
  const needsLLM = quality < 60;

  if (!needsLLM) {
    cachePronunciation(word, phonetic, readable);
  }

  return {
    readable,
    quality,
    needsLLM
  };
};

export const generateStressPattern = (word: string, phonetic: string): string => {
  if (!phonetic || phonetic === `/${word}/`) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    if (syllables.length === 1) return word.toUpperCase();
    return syllables[0].toUpperCase() + '-' + syllables.slice(1).map(s => s.toLowerCase()).join('-');
  }

  const cleanPhonetic = phonetic.replace(/^\/|\/$/g, '').replace(/\(.*?\)/g, '');
  const parts = cleanPhonetic.split(/(ˈ|ˌ)/);

  if (parts.length <= 1) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    if (syllables.length === 1) return word.toUpperCase();
    return syllables[0].toUpperCase() + '-' + syllables.slice(1).map(s => s.toLowerCase()).join('-');
  }

  const syllablePattern: string[] = [];
  let isPrimaryStress = false;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'ˈ') {
      isPrimaryStress = true;
    } else if (parts[i] === 'ˌ') {
      isPrimaryStress = false;
    } else if (parts[i] && parts[i].trim()) {
      const syllable = convertIPAToEnglish(parts[i]);

      if (syllable) {
        syllablePattern.push(isPrimaryStress ? syllable.toUpperCase() : syllable.toLowerCase());
        isPrimaryStress = false;
      }
    }
  }

  if (syllablePattern.length === 0) {
    const syllables = word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]*$|[^aeiou](?=[aeiou]))?/gi) || [word];
    if (syllables.length === 1) return word.toUpperCase();
    return syllables[0].toUpperCase() + '-' + syllables.slice(1).map(s => s.toLowerCase()).join('-');
  }

  return syllablePattern.join('-');
};
