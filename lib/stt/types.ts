/**
 * Speech-to-text adapter boundary.
 *
 * The browser is only a stand-in for plushie hardware, so nothing behind this
 * interface may assume one. A Raspberry Pi posting a WAV must be
 * indistinguishable from a laptop posting a WebM.
 */

export interface Transcript {
  text: string;
  /** BCP-47 tag, when the provider reports one. */
  language?: string;
  /** Wall-clock time spent in the provider call, for latency budgeting. */
  durationMs: number;
  /** Which implementation produced this, so responses are traceable. */
  provider: string;
}

export interface TranscribeOptions {
  /** BCP-47 hint. Improves accuracy and cuts cost when the language is known. */
  language?: string;
}

export interface SttProvider {
  readonly name: string;
  transcribe(audio: File, opts?: TranscribeOptions): Promise<Transcript>;
}

/** Thrown for provider failures the route should translate into a 502. */
export class SttError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SttError";
  }
}
