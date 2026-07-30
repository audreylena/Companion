import { TtsError, type TtsProvider } from "./types";

/**
 * ElevenLabs text-to-speech — a warm, natural voice for the companion.
 *
 * Voice and model are env-overridable. The default is a calm, gentle voice
 * well-suited to speaking with a child. Multilingual model so non-English
 * replies still sound right.
 */

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // "Rachel" — calm, warm
const DEFAULT_MODEL = "eleven_multilingual_v2";

export function createElevenLabsProvider(): TtsProvider {
  return {
    name: "elevenlabs",

    async synthesize(text) {
      const key = process.env.ELEVENLABS_API_KEY;
      if (!key) throw new TtsError("ELEVENLABS_API_KEY is not set");

      const voice = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE;
      const model = process.env.ELEVENLABS_MODEL ?? DEFAULT_MODEL;

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": key,
              "content-type": "application/json",
              accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text,
              model_id: model,
              // Gentle, steady delivery; a little warmth without over-acting.
              voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15 },
            }),
          },
        );
        if (!res.ok) {
          throw new TtsError(`ElevenLabs failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
        }
        const audio = Buffer.from(await res.arrayBuffer());
        return { audio, mime: "audio/mpeg", provider: "elevenlabs" };
      } catch (err) {
        if (err instanceof TtsError) throw err;
        throw new TtsError(`ElevenLabs request error: ${err instanceof Error ? err.message : String(err)}`, err);
      }
    },
  };
}
