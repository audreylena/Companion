import type { SttProvider, TranscribeOptions } from "./types";

/**
 * Keeps the full pipeline — mic, upload, route, UI — demoable with no API key
 * and no network. Cycles through utterances so repeated presses don't all look
 * like a cached response.
 */

const UTTERANCES = [
  "I'm scared of the dark",
  "Why did Grandma have to go away?",
  "I had a really good day today",
  "My tummy hurts and I can't sleep",
];

let next = 0;

export function createMockProvider(): SttProvider {
  return {
    name: "mock",

    async transcribe(_audio: File, opts: TranscribeOptions = {}) {
      const startedAt = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 400));

      const text = UTTERANCES[next % UTTERANCES.length];
      next += 1;

      return {
        text,
        language: opts.language,
        durationMs: Date.now() - startedAt,
        provider: "mock",
      };
    },
  };
}
