import { createMockProvider } from "./mock";
import { createOpenAiProvider } from "./openai";
import type { SttProvider } from "./types";

export type { SttProvider, Transcript, TranscribeOptions } from "./types";
export { SttError } from "./types";

let cached: SttProvider | null = null;

/**
 * Picks the provider from the environment:
 *   STT_PROVIDER=mock   → always the mock
 *   OPENAI_API_KEY set  → OpenAI
 *   otherwise           → mock, so a missing key degrades instead of crashing
 */
export function getSttProvider(): SttProvider {
  if (cached) return cached;

  const forced = process.env.STT_PROVIDER?.toLowerCase();

  if (forced === "mock") {
    cached = createMockProvider();
  } else if (forced === "openai" || process.env.OPENAI_API_KEY) {
    cached = createOpenAiProvider();
  } else {
    console.warn("[stt] no OPENAI_API_KEY — falling back to the mock provider");
    cached = createMockProvider();
  }

  console.log(`[stt] provider: ${cached.name}`);
  return cached;
}
