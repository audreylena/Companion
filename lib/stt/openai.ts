import OpenAI from "openai";
import { SttError, type SttProvider, type TranscribeOptions } from "./types";

/**
 * OpenAI transcription.
 *
 * Deliberately NOT the Gloo client from scripts/spike.mjs. Gloo's
 * OpenAI-compatible surface covers chat completions; it does not serve
 * /audio/transcriptions. This needs its own key and the default base URL.
 */

const DEFAULT_MODEL = "gpt-4o-mini-transcribe";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new SttError("OPENAI_API_KEY is not set");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function createOpenAiProvider(): SttProvider {
  return {
    name: "openai",

    async transcribe(audio: File, opts: TranscribeOptions = {}) {
      const model = process.env.STT_MODEL ?? DEFAULT_MODEL;
      const startedAt = Date.now();

      try {
        // The SDK's `Uploadable` accepts a web File directly, so the multipart
        // body streams through without ever being buffered or written to disk.
        const res = await getClient().audio.transcriptions.create({
          file: audio,
          model,
          language: opts.language,
          // gpt-4o-*-transcribe only supports "json"; whisper-1 also accepts it.
          response_format: "json",
        });

        return {
          text: res.text.trim(),
          language: opts.language,
          durationMs: Date.now() - startedAt,
          provider: "openai",
        };
      } catch (err) {
        if (err instanceof SttError) throw err;
        const detail = err instanceof Error ? err.message : String(err);
        throw new SttError(`OpenAI transcription failed: ${detail}`, err);
      }
    },
  };
}
