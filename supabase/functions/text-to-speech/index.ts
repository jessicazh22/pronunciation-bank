const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const ELEVENLABS_VOICE_ID = "pqHfZKP75CvOlQylNhV4";
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

/** Encode ArrayBuffer to base64 in chunks to avoid stack overflow on large audio. */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

/** ElevenLabs TTS – requires ELEVENLABS_API_KEY in Supabase secrets. */
async function fetchElevenLabs(text: string): Promise<{ audioUrl: string; source: string } | null> {
  if (!ELEVENLABS_KEY) {
    console.error("ELEVENLABS_API_KEY not set");
    return null;
  }
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.slice(0, 500),
          model_id: ELEVENLABS_MODEL,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs error:", res.status, err.slice(0, 200));
      return null;
    }
    const body = await res.arrayBuffer();
    if (body.byteLength < 100) return null;
    const b64 = arrayBufferToBase64(body);
    return { audioUrl: `data:audio/mpeg;base64,${b64}`, source: "elevenlabs" };
  } catch (err) {
    console.error("ElevenLabs error:", err);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanText = String(text).slice(0, 500).trim();
    if (!cleanText) {
      return new Response(
        JSON.stringify({ audioUrl: "", source: "", error: "Empty text" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await fetchElevenLabs(cleanText);

    if (result && result.audioUrl.length > 100) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        audioUrl: "",
        source: "",
        error: "TTS failed. Ensure ELEVENLABS_API_KEY is set in Supabase secrets.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("text-to-speech error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
