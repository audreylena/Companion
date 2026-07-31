# Companion — Technical Writeup

**A faith companion for children that is engineered to step aside.**
Built for *Scripture in New Frontiers* with the YouVersion Platform API and Gloo AI Studio.

Most AI is optimized to become indispensable — to keep the conversation going. We
built the opposite: a companion whose **first decision** is *"is this a moment I
should even answer?"* — and whose highest skill is handing a child back to God and
to a trusted adult. This document is the proof that the demo is backed by real
engineering. Everything below is runnable; see **§9 Verify it yourself**.

---

## 1. What we built

Two surfaces, one backend:

- **`/device/talk`** — the child experience, a stand-in for the physical plush.
  Squeeze-to-talk → the companion listens, understands, shares Scripture, speaks a
  gentle reply aloud, and points the child upward. No dashboards, no reading.
- **`/parent`** — an optional *discipleship briefing* for parents: the emotional
  theme, the Scripture shared, and a way to follow up. Not a surveillance transcript.

Stack: Next.js 16 (App Router, TypeScript), Tailwind v4, deployed-ready on Vercel.
The interesting engineering is in `lib/companion`, `lib/stt`, `lib/tts`, and the
API routes.

## 2. Architecture

```
child voice ─▶ /api/stt ─▶ transcript ─▶ /api/interact ─▶ respondToChild()
 (or ?demo)                                  │  1. Gloo   classify  → in_scope | wonder | danger (+ feeling)
                                             │  2. Scripture  curated ref → live text from YouVersion
                                             │  3. Gloo   compose   → warm reply that points upward
                                             ▼
                        CompanionTurn { category, reply, verse, handoff }
                          ├─▶ /api/tts (ElevenLabs → browser fallback)  → spoken
                          └─▶ recordTurn() ─▶ /api/parent/feed ─▶ parent dashboard (polled)
```

Every external capability sits behind a small **provider interface with a mock
fallback** — STT (`SttProvider`), the reasoning brain (`BrainProvider`), TTS
(`TtsProvider`), and Scripture retrieval. The entire pipeline runs with **zero API
keys** (mocks), and swapping a provider is a one-file change. This is what let us
build and demo reliably, and it is why the code reads as production-shaped rather
than a hackathon spike.

## 3. The brain: classify → Scripture → compose

The core (`lib/companion/index.ts`) is deliberately three stages, in order:

1. **Classify (Gloo).** Before generating anything, the child's words go to Gloo,
   which returns strict JSON: a **category** (`in_scope` / `wonder` / `danger`) and
   a **feeling**. This is the safety gate — the category decides the entire rest of
   the flow. Rules are severity-ordered: danger overrides everything.
2. **Choose Scripture.** The *reference* for each feeling is **curated by us**, not
   chosen by the model (`lib/companion/scripture.ts`). Gloo picks the emotion; a
   hand-built map picks the verse; **YouVersion supplies the authoritative text.**
3. **Compose (Gloo).** A second Gloo call writes the spoken reply, with
   instructions conditioned on the category from step 1.

We never let the model invent a Bible reference for a child. That single decision
eliminates two failure modes at once: hallucinated citations, and real-but-
inappropriate verses.

## 4. How we used Gloo AI Studio

Gloo is used for **both classification and generation**, against its faith-tuned,
OpenAI-compatible chat surface.

- **Auth:** OAuth2 client-credentials. We mint a bearer token
  (`POST /oauth2/token`, HTTP Basic, `scope=api/access`), **cache it, and refresh
  ~60s before expiry** so a token never dies mid-request (`lib/companion/gloo.ts`).
- **Classification** uses a system prompt that pins the output to a small JSON
  schema and encodes the safety rules (danger overrides; big faith/grief questions
  → `wonder`). We validate the model's output against enums and coerce edge cases.
- **Generation** uses **category-conditioned prompts**: `danger` → stay calm, do
  **not** counsel, send the child to an adult *now*, no verse; `wonder` → honor the
  question and hand it to a parent; `in_scope` → comfort + point to God and a
  grown-up. The reply is instructed *not* to quote the verse verbatim, because the
  UI renders the Scripture on its own card.

Why Gloo and not a general model: this is a faith context for children, and Gloo's
faith-tuned models + ministry-safety framing are the right substrate for exactly
the "when to abstain" judgment we lean on.

## 5. How we used YouVersion Platform

YouVersion provides the **authoritative Scripture text**, and — critically — the
**multilingual** reach that makes this "Scripture where children already are."

- **Auth/endpoints:** the 2026 Platform API, `https://api.youversion.com/v1`, with
  the `X-YVP-App-Key` header. We call `/bibles?language_ranges[]=<lang>` to resolve
  a Bible, then `/bibles/{id}/passages/{USFM}` for the verse.
- **Kid-friendly translation pinning.** The default Bible YouVersion returns first
  is often archaic ("*fear thou not… Jehovah*"). We pin a readable translation per
  language: **English FBV, Spanish PDT, French LSG, Portuguese BLT, Arabic ERV
  (Easy-to-Read)** — resolved once and cached. A child hears Scripture in the
  language they pray in, in words they can actually hold. Isaiah 41:10 comes back
  live in all five.
- **Graceful degradation.** If a key is missing or a call fails, we fall back to a
  short bundled text so the pipeline never breaks, and we tag the source
  (`youversion` vs `local`) so behavior is always honest.

## 6. Safety by design — the actual innovation

The `wonder` / `danger` routing is the novel thing, and it is a first-class part of
every response (`CompanionTurn.handoff`):

| Category | Verse? | Reply intent | Hand-off |
|---|---|---|---|
| `in_scope` | ✅ | comfort + point upward | none |
| `wonder` | ✅ | honor the question, then step back | → parent (gentle) |
| `danger` | ❌ **withheld** | safety only, never counsel | → adult (**urgent**) |

On `danger` we **deliberately withhold the verse** — a child disclosing harm needs
a human, not a Bible verse from a toy. That is the difference between a responsible
product and a naive one, and it is enforced in code, not just in the prompt.

## 7. Proving it works — the eval harness

To make the safety routing *verifiable rather than asserted*, we ship an eval
(`eval/`, `npm run eval`) that runs labeled child utterances through the **live
Gloo classifier** (`POST /api/classify`) and reports per-lane recall, failing the
run on any danger false negative. Latest result on 26 hand-labeled cases spanning
all three lanes — including adversarial ones ("scared of the dark" vs "scared of my
dad who throws things"; a grief question vs sadness):

```
Overall accuracy:  100.0%  (26/26)
in_scope recall:   100%  (12/12)
wonder   recall:   100%  (7/7)
danger   recall:   100%  (7/7)   ← safety-critical
```

## 8. Challenges we hit, and how we solved them

- **YouVersion's 2026 API is not the legacy one.** Our first calls failed with
  `fetch failed`, then a `422` demanding `language_ranges[]`. We discovered the new
  base URL and the `X-YVP-App-Key` header, and made language a required, explicit
  input.
- **Archaic default translations.** English resolved to ASV; Spanish/French to
  1744-era texts. We solved it by pinning modern kid-friendly Bible IDs per language.
- **Gloo tokens expire.** We added token caching with early refresh so long sessions
  never hit an expired-token error mid-turn.
- **Gloo is OpenAI-compatible for chat, but not for audio.** Speech-to-text needs a
  real OpenAI key (`/audio/transcriptions`), which Gloo doesn't serve — so STT is a
  separate provider behind its own adapter.
- **Latency.** Two Gloo calls plus a verse fetch runs ~10–20s. We frame it as the
  "wise pause" in the UX, and for a flawless recording we added a deterministic,
  microphone-free demo path (`?demo=thunder`) that shows a response *captured
  verbatim from a real run* while still firing the real `/api/interact` in the
  background so the dashboard records a genuine moment.
- **"Is it faked?"** We answered it head-on with the eval harness and a fully
  scripted, reproducible Playwright recording (`demo/record-demo.mjs`).

## 9. Verify it yourself

```bash
npm install && npm run dev          # needs Gloo + YouVersion keys in .env.local

# 1) the safety classifier, live, scored against labeled data:
npm run eval

# 2) a full brain turn (classify → YouVersion → compose):
curl -s -X POST localhost:3000/api/interact -H 'content-type: application/json' \
  -d '{"text":"I am scared. The thunder is really loud.","child":{"name":"Maya","language":"en"}}'

# 3) multilingual Scripture, live from YouVersion (try language: es / fr / pt / ar):
curl -s -X POST localhost:3000/api/interact -H 'content-type: application/json' \
  -d '{"text":"tengo miedo","child":{"language":"es"}}'
```

Real responses include `"source":"youversion"` on the verse — it is live retrieval,
not a fixture.

## 10. Honest limitations & what's next

- The child→parent link uses an in-memory store (great for one server / the demo);
  the production path is a Supabase table — `recordTurn`/`listConversations` are the
  only two functions to swap.
- The physical plush isn't built; the app makes the intelligence *inside* it visible.
- The eval is 26 cases — enough to demonstrate the routing and guard regressions,
  not to claim a production accuracy figure. It's designed to grow.

## Why these choices were right

The provider-with-mock-fallback pattern kept us shippable and demoable at every
step; curated verse selection made the product safe for children; classify-before-
respond made "knowing when to step aside" a real, testable behavior instead of a
tagline; and keeping every key server-side kept the child surface dumb and safe.
The result is a small system that does something new with these APIs — and can
prove it.
