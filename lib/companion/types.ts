/**
 * The companion "brain" — reasoning adapter boundary.
 *
 * Mirrors lib/stt: an env-selected provider with a mock fallback, so the whole
 * pipeline runs with no API keys. The device (browser today, plushie tomorrow)
 * never sees anything behind this interface — it only POSTs text to
 * /api/interact and gets a CompanionTurn back.
 */

/** What kind of moment this is — drives whether the toy answers or hands off. */
export type Category = "in_scope" | "wonder" | "danger";

/** The child's emotional need. Keyed to a curated, age-safe verse. */
export type Feeling =
  | "fear"
  | "worry"
  | "sadness"
  | "loneliness"
  | "anger"
  | "gratitude"
  | "sleep"
  | "identity"
  | "wonder"
  | "other";

/** Matches the dashboard's tone vocabulary so events line up later. */
export type ToneKey = "calm" | "attention" | "reflective" | "joyful";

export interface ChildContext {
  name?: string;
  companionName?: string;
  age?: string; // e.g. "7"
  language?: string; // BCP-47, e.g. "en"
  /** How the companion should refer to the trusted grown-up ("your mom"). */
  guardian?: string;
}

export interface Classification {
  category: Category;
  feeling: Feeling;
  tone: ToneKey;
}

export interface Verse {
  ref: string; // "Isaiah 41:10"
  text: string;
  translation?: string;
  language?: string;
  source: "youversion" | "local";
}

export interface CompanionTurn {
  category: Category;
  feeling: Feeling;
  tone: ToneKey;
  /** What the companion says aloud to the child. */
  reply: string;
  verse: Verse | null;
  /** Present for wonder/danger — the toy stepping back toward a human. */
  handoff: { line: string; urgent: boolean } | null;
  meta: { provider: string; latencyMs: number };
}

/**
 * A reasoning provider: understands the child, then composes a reply.
 * Scripture selection lives outside this on purpose — the model classifies,
 * but it never gets to invent a Bible reference for a child.
 */
export interface BrainProvider {
  readonly name: string;
  classify(text: string, ctx: ChildContext): Promise<Classification>;
  compose(input: {
    text: string;
    ctx: ChildContext;
    classification: Classification;
    verse: Verse | null;
  }): Promise<string>;
}

/** Thrown for provider failures the route should translate into a 502. */
export class CompanionError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CompanionError";
  }
}
