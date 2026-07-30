import { getTtsProvider } from "@/lib/tts";

/**
 * POST /api/tts — text in, spoken audio out.
 *
 * Returns audio/mpeg when a provider (ElevenLabs) is configured. When none is,
 * responds 503 so the client falls back to the browser's built-in voice.
 */

const MAX_CHARS = 1000;

export async function POST(request: Request) {
  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON with a 'text' field." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_CHARS) : "";
  if (!text) return Response.json({ error: "Missing 'text'." }, { status: 400 });

  const provider = getTtsProvider();
  if (!provider) {
    // No server voice configured — tell the client to use the browser voice.
    return Response.json({ error: "no_tts_provider" }, { status: 503 });
  }

  try {
    const { audio, mime } = await provider.synthesize(text);
    return new Response(new Uint8Array(audio), {
      headers: { "content-type": mime, "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("[tts] synthesis failed:", err);
    return Response.json({ error: "tts_failed" }, { status: 502 });
  }
}
