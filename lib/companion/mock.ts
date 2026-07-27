import type {
  BrainProvider,
  Category,
  Classification,
  Feeling,
  ToneKey,
} from "./types";

/**
 * Offline, rule-based provider. Keeps the whole brain demoable with no Gloo
 * key and no network — pairs with the STT mock so the full mic→reply pipeline
 * runs on a laptop with nothing configured.
 */

const toneFor: Record<Feeling, ToneKey> = {
  fear: "attention", worry: "attention", sleep: "attention", anger: "attention",
  sadness: "reflective", loneliness: "reflective", identity: "reflective", wonder: "reflective",
  gratitude: "joyful", other: "calm",
};

// Ordered most-severe first: danger and wonder win over everyday feelings.
const RULES: { category: Category; feeling: Feeling; any: RegExp }[] = [
  { category: "danger", feeling: "other", any: /\b(hurt me|hit me|touch|kill|die myself|hurt myself|hate myself|end it|scared of (my|him|her|them))\b/i },
  { category: "wonder", feeling: "wonder", any: /\b(why did .*(die|go away)|is god real|see god|what happens when|why can'?t i see|heaven|when we die)\b/i },
  { category: "in_scope", feeling: "fear", any: /\b(scared|afraid|dark|monster|nightmare|frighten)\b/i },
  { category: "in_scope", feeling: "worry", any: /\b(worried|nervous|test|presentation|scared about school|anxious)\b/i },
  { category: "in_scope", feeling: "sleep", any: /\b(sleep|tired|can'?t sleep|tummy|bed)\b/i },
  { category: "in_scope", feeling: "sadness", any: /\b(sad|cry|crying|upset|unhappy)\b/i },
  { category: "in_scope", feeling: "loneliness", any: /\b(alone|lonely|left out|nobody|no one likes)\b/i },
  { category: "in_scope", feeling: "anger", any: /\b(angry|mad|mean|unfair|hate)\b/i },
  { category: "in_scope", feeling: "gratitude", any: /\b(thank|grateful|happy|good day|love)\b/i },
  { category: "in_scope", feeling: "identity", any: /\b(ugly|dumb|stupid|not good enough|not enough|hate myself)\b/i },
];

export function createMockProvider(): BrainProvider {
  return {
    name: "mock",

    async classify(text): Promise<Classification> {
      await new Promise((r) => setTimeout(r, 300));
      const hit = RULES.find((r) => r.any.test(text));
      const feeling = hit?.feeling ?? "other";
      return { category: hit?.category ?? "in_scope", feeling, tone: toneFor[feeling] };
    },

    async compose({ ctx, classification, verse }) {
      const name = ctx.name ?? "friend";
      const guardian = ctx.guardian ?? "a grown-up who loves you";
      const v = verse ? ` The Bible says, "${verse.text}" (${verse.ref}).` : "";

      if (classification.category === "danger") {
        return `${name}, thank you for telling me. You are not alone, and this is important. Please go tell ${guardian} right now — they can help you.`;
      }
      if (classification.category === "wonder") {
        return `That's a really big and wonderful question.${v} I think ${guardian} would love to talk about that with you — will you ask them together?`;
      }
      return `It's okay to feel this way, ${name}. God is always with you, even now.${v} Maybe you can tell ${guardian} about it too — you don't have to carry it alone.`;
    },
  };
}
