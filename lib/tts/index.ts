import { createElevenLabsProvider } from "./elevenlabs";
import type { TtsProvider } from "./types";

export type { TtsProvider, TtsResult } from "./types";
export { TtsError } from "./types";

let cached: TtsProvider | null | undefined;

/**
 * ELEVENLABS_API_KEY set → ElevenLabs. Otherwise null, and the client falls
 * back to the browser's speech synthesis so there's always a voice.
 */
export function getTtsProvider(): TtsProvider | null {
  if (cached !== undefined) return cached;
  cached = process.env.ELEVENLABS_API_KEY ? createElevenLabsProvider() : null;
  console.log(`[tts] provider: ${cached?.name ?? "browser fallback"}`);
  return cached;
}
