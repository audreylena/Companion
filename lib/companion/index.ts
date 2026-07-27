import { createGlooProvider } from "./gloo";
import { createMockProvider } from "./mock";
import { getVerse } from "./scripture";
import type { BrainProvider, ChildContext, CompanionTurn } from "./types";

export type {
  Category, Feeling, ToneKey, ChildContext, CompanionTurn, Verse,
} from "./types";
export { CompanionError } from "./types";

let cached: BrainProvider | null = null;

/**
 * Provider selection, same shape as lib/stt:
 *   BRAIN_PROVIDER=mock   → always the mock
 *   Gloo credentials set  → Gloo
 *   otherwise             → mock, so a missing key degrades instead of crashing
 */
export function getBrainProvider(): BrainProvider {
  if (cached) return cached;

  const forced = process.env.BRAIN_PROVIDER?.toLowerCase();
  const hasGloo = !!(process.env.GLOO_CLIENT_ID && process.env.GLOO_CLIENT_SECRET && process.env.GLOO_TOKEN_URL);

  if (forced === "mock") {
    cached = createMockProvider();
  } else if (forced === "gloo" || hasGloo) {
    cached = createGlooProvider();
  } else {
    console.warn("[brain] no Gloo credentials — falling back to the mock provider");
    cached = createMockProvider();
  }

  console.log(`[brain] provider: ${cached.name}`);
  return cached;
}

/**
 * The brain. Classify the moment, choose Scripture, compose a warm reply that
 * always points upward — and, for the moments a toy must not own, build the
 * hand-off back to a human.
 */
export async function respondToChild(input: {
  text: string;
  ctx?: ChildContext;
}): Promise<CompanionTurn> {
  const startedAt = Date.now();
  const provider = getBrainProvider();
  const ctx: ChildContext = { guardian: "a grown-up who loves you", language: "en", ...input.ctx };

  const classification = await provider.classify(input.text, ctx);

  // Danger prioritizes the human, not a verse.
  const verse =
    classification.category === "danger"
      ? null
      : await getVerse(classification.feeling, ctx.language);

  const reply = await provider.compose({ text: input.text, ctx, classification, verse });

  const guardian = ctx.guardian ?? "a grown-up you trust";
  const handoff =
    classification.category === "danger"
      ? { line: `Please tell ${guardian} right now — you don't have to handle this alone.`, urgent: true }
      : classification.category === "wonder"
      ? { line: `${guardian} would love to explore this big question with you.`, urgent: false }
      : null;

  return {
    ...classification,
    reply,
    verse,
    handoff,
    meta: { provider: provider.name, latencyMs: Date.now() - startedAt },
  };
}
