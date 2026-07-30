/**
 * Text-to-speech adapter boundary (mirrors lib/stt).
 *
 * Server-side synthesis keeps the provider key off the device. When no provider
 * is configured, the route says so and the client falls back to the browser's
 * built-in speech — so the companion always has a voice.
 */

export interface TtsResult {
  audio: Buffer;
  mime: string;
  provider: string;
}

export interface TtsProvider {
  readonly name: string;
  synthesize(text: string, opts?: { language?: string }): Promise<TtsResult>;
}

export class TtsError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TtsError";
  }
}
