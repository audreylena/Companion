import OpenAI from "openai";
import {
  CompanionError,
  type BrainProvider,
  type Category,
  type Classification,
  type Feeling,
  type ToneKey,
} from "./types";

/**
 * Gloo AI Studio provider.
 *
 * Gloo is OpenAI-compatible for chat, so we reuse the `openai` SDK pointed at
 * Gloo's base URL (same approach proved in scripts/spike.mjs). Auth is OAuth2
 * client-credentials: we mint a bearer token, cache it until just before it
 * expires, and refresh on demand.
 */

const FEELINGS: Feeling[] = [
  "fear", "worry", "sadness", "loneliness", "anger",
  "gratitude", "sleep", "identity", "wonder", "other",
];
const CATEGORIES: Category[] = ["in_scope", "wonder", "danger"];

const toneFor: Record<Feeling, ToneKey> = {
  fear: "attention", worry: "attention", sleep: "attention", anger: "attention",
  sadness: "reflective", loneliness: "reflective", identity: "reflective", wonder: "reflective",
  gratitude: "joyful", other: "calm",
};

let token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;

  const { GLOO_CLIENT_ID, GLOO_CLIENT_SECRET, GLOO_TOKEN_URL, GLOO_SCOPE } = process.env;
  if (!GLOO_CLIENT_ID || !GLOO_CLIENT_SECRET || !GLOO_TOKEN_URL) {
    throw new CompanionError("Gloo credentials are not configured.");
  }

  const basic = Buffer.from(`${GLOO_CLIENT_ID}:${GLOO_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(GLOO_TOKEN_URL, {
    method: "POST",
    headers: {
      authorization: `Basic ${basic}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: GLOO_SCOPE ?? "api/access",
    }),
  });
  if (!res.ok) {
    throw new CompanionError(`Gloo token request failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new CompanionError("Gloo token response had no access_token.");

  // Refresh a minute early to avoid using a token that expires mid-request.
  const ttl = (data.expires_in ?? 3600) * 1000;
  token = { value: data.access_token, expiresAt: Date.now() + ttl - 60_000 };
  return token.value;
}

async function client(): Promise<OpenAI> {
  return new OpenAI({
    baseURL: process.env.GLOO_BASE_URL ?? "https://platform.ai.gloo.com/ai/v1",
    apiKey: await getToken(),
  });
}

const model = () => process.env.GLOO_MODEL ?? "gloo-openai-gpt-5-mini";

function firstJson(raw: string): Record<string, unknown> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new CompanionError("Classifier returned no JSON.");
  return JSON.parse(match[0]);
}

const CLASSIFY_SYSTEM = `You classify a young child's message to a faith companion toy. Reply with ONLY JSON:
{"category": "in_scope|wonder|danger", "feeling": "fear|worry|sadness|loneliness|anger|gratitude|sleep|identity|wonder|other"}

Rules:
- "danger": the child mentions being hurt, abuse, someone hurting them, self-harm, or wanting to die. This overrides everything.
- "wonder": a big question the toy should NOT answer alone — death, why we can't see God, whether God is real, what happens when we die.
- "in_scope": everyday feelings a gentle companion can comfort.
Pick the single closest "feeling". Output JSON only, no prose.`;

export function createGlooProvider(): BrainProvider {
  return {
    name: "gloo",

    async classify(text) {
      try {
        const c = await client();
        const res = await c.chat.completions.create({
          model: model(),
          messages: [
            { role: "system", content: CLASSIFY_SYSTEM },
            { role: "user", content: text },
          ],
        });
        const json = firstJson(res.choices[0]?.message?.content ?? "");
        const feeling = (FEELINGS.includes(json.feeling as Feeling) ? json.feeling : "other") as Feeling;
        let category = (CATEGORIES.includes(json.category as Category) ? json.category : "in_scope") as Category;
        if (feeling === "wonder" && category === "in_scope") category = "wonder";
        return { category, feeling, tone: toneFor[feeling] };
      } catch (err) {
        if (err instanceof CompanionError) throw err;
        throw new CompanionError(`Gloo classify failed: ${err instanceof Error ? err.message : String(err)}`, err);
      }
    },

    async compose({ text, ctx, classification, verse }) {
      const { category, feeling } = classification;
      const guardian = ctx.guardian ?? "a grown-up who loves you";
      const name = ctx.name ?? "friend";
      const age = ctx.age ?? "7";

      // The app shows the verse on its own card, so the reply must NOT quote it
      // verbatim or print the reference — just carry its comfort in plain words.
      const rules =
        category === "danger"
          ? `This is serious. Stay calm and kind. Do NOT try to counsel or fix it. In 2 short sentences, tell ${name} they are not alone and they should tell ${guardian} right now, today. Do not include a verse.`
          : category === "wonder"
          ? `This is a big question you should not answer alone. In 2-3 short sentences, gently say it's a wonderful question, offer the comfort of the verse in your OWN simple words (do not quote it or write the reference), and warmly encourage ${name} to talk about it with ${guardian}.`
          : `In 2-3 short, warm sentences, comfort ${name}, carry the comfort of the verse in your OWN simple words (do not quote it verbatim or write the reference — a card already shows it), and gently point them to God and to ${guardian}. Never encourage relying on you instead of God or grown-ups.`;

      const system = `You are ${ctx.companionName ?? "a gentle faith companion"}, a warm, calm companion for a ${age}-year-old child. Speak simply and kindly, like a caring friend. Never sound like a robot or a therapist. ${rules}`;

      const verseLine = verse ? `The verse to share is ${verse.ref}: "${verse.text}"` : "No verse this time.";

      try {
        const c = await client();
        const res = await c.chat.completions.create({
          model: model(),
          messages: [
            { role: "system", content: system },
            { role: "user", content: `The child said: "${text}". ${verseLine}` },
          ],
        });
        const reply = res.choices[0]?.message?.content?.trim();
        if (!reply) throw new CompanionError("Gloo returned an empty reply.");
        return reply;
      } catch (err) {
        if (err instanceof CompanionError) throw err;
        throw new CompanionError(`Gloo compose failed: ${err instanceof Error ? err.message : String(err)}`, err);
      }
    },
  };
}
