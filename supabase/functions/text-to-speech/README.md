# Text-to-Speech (ElevenLabs → VoiceRSS → Edge TTS)

Provides pronunciation audio when Free Dictionary has no result. The client calls this **right after Free Dictionary** in the cascade.

## Behaviour (in order)

1. **ElevenLabs** (if `ELEVENLABS_API_KEY` is set): High-quality, human-like US English. Voice: Rachel (`21m00Tcm4TlvDq8ikWAM`), model: `eleven_multilingual_v2`. Get an API key at [elevenlabs.io](https://elevenlabs.io) (free tier available).
2. **VoiceRSS** (if `VOICERSS_API_KEY` is set): Human-like US English. Free key at [voicerss.org](https://www.voicerss.org) (350 requests/day).
3. **Microsoft Edge TTS** (fallback): No API key. Uses [edge-tts-universal](https://github.com/travisvn/edge-tts-universal).

## Client cascade order

Cache → **Free Dictionary** → **This Edge Function** (ElevenLabs → VoiceRSS → Edge TTS) → Forvo → Browser TTS.

## Setup

1. In Supabase: **Project → Settings → Edge Functions → Secrets**, add:
   - **ELEVENLABS_API_KEY** – your ElevenLabs API key (optional; used first when set).
   - **VOICERSS_API_KEY** – your VoiceRSS key (optional).
2. Deploy: `supabase functions deploy text-to-speech`

Audio is returned as a base64 data URL. The client caches it by word and shows the source (elevenlabs, voicerss, or edge_tts) in the UI.
