<div align="center">

# 🧸 Companion

### The faith companion that points away from itself.

*An AI that meets a child in their scared, lonely, wondering moments — hands them Scripture, and then hands them back to God, their parents, and their church.*

**Built for the [Scripture in New Frontiers](https://kaggle.com/competitions/scripture-in-new-frontiers) Hackathon** · Powered by [Gloo AI Studio](https://studio.ai.gloo.com) + [YouVersion Platform](https://developers.youversion.com)

[🎬 Demo Video](#) · [🌐 Live Demo](#) · [🧸 The Vision](#-the-vision-a-plush-that-glows)

</div>

---

## The moment we built this for

It's bedtime, and there's a thunderstorm. A child is scared. In that small, holy moment, most kids reach for a screen — and the screen was built to keep them there.

**Companion was built to give them back.**

The child squeezes the companion and says what they're afraid of. Companion listens, understands the feeling, meets it with Scripture in words a child can hold — *"Don't be afraid, for I am with you." (Isaiah 41:10)* — **reads it aloud**, and then does the one thing no other AI toy does: it points the child *past itself* — *"Ask Mom or Dad to come sit with you and pray."*

Companion is **never** the destination. It's the doorway.

## Why now

Kids' AI companions are flooding into homes — plush toys, chatbots, wristbands — nearly all engineered for **engagement**: more time, more attachment, more screen. The question isn't *whether* AI will shape childhood. It's *what* will shape it. Companion is the first faith companion built for **discipleship instead of dependence** — one whose success is a child who turns toward God and the people who love them.

## What we built

A working intelligence — the "brain" of a future screen-free plush — with two surfaces in one Next.js app:

- 🧸 **The child experience** (`/device/talk`) — squeeze-to-talk. Voice in → Scripture and a warm **spoken** reply out. A stand-in for the plush (we built the mind, not the hardware, in the time we had).
- 👪 **The parent dashboard** (`/parent`) — not surveillance. A gentle **discipleship briefing**: the emotional theme, the Scripture shared, and a way to follow up. Never a transcript of a child's private words.

## How it works

```
child voice ─▶ /api/stt ─▶ transcript ─▶ /api/interact ─▶ respondToChild()
                                            1. Gloo   classify → in_scope | wonder | danger
                                            2. Scripture  curated ref → live text (YouVersion)
                                            3. Gloo   compose  → warm reply that points upward
                                                ▼
                        CompanionTurn { category, reply, verse, handoff }
                          ├─▶ /api/tts (ElevenLabs → browser fallback) → spoken aloud
                          └─▶ recorded → /api/parent/feed → parent dashboard
```

Every external capability (speech-to-text, the reasoning brain, text-to-speech, Scripture retrieval) sits behind a small **provider interface with a mock fallback** — so the whole pipeline runs with zero API keys, and swapping a provider is a one-file change.

## The feature we're proudest of: knowing when to get out of the way

Every child utterance is classified by Gloo's faith-tuned model into three lanes:

| Class | Example | What Companion does |
|-------|---------|---------------------|
| `in_scope` | *"I'm scared of the dark."* | Comforts, shares Scripture, points to God and a parent |
| `wonder` | *"Why did Grandma die?"* · *"Is God real?"* | **Doesn't answer alone.** Hands the big question to a parent, with a bridging verse |
| `danger` | disclosure of harm or self-harm | **Withholds the verse, never counsels.** Points the child to a trusted adult immediately |

On `danger` it *deliberately* withholds Scripture — a child disclosing harm needs a human, not a verse from a toy. This three-way routing *is* our philosophy, in code.

## Proven, not mocked

Judges review code — so we made the claims verifiable:

- **Safety classifier: 100%** on a labeled eval of 26 utterances (`npm run eval`, against the **live** Gloo API), including adversarial cases — *"scared of the dark"* is comfort; *"scared of my dad, he throws things"* is danger.
- **Multilingual Scripture, live from YouVersion in 5 languages**, each in a kid-friendly translation (Isaiah 41:10 in English `FBV`, Spanish `PDT`, French `LSG`, Portuguese `BLT`, Arabic `ERV`).

```bash
npm run eval        # runs the labeled set through the live Gloo classifier

curl -s -X POST localhost:3000/api/interact -H 'content-type: application/json' \
  -d '{"text":"tengo miedo","child":{"language":"es"}}'   # live Spanish Scripture
```
Real responses tag the verse `"source":"youversion"` — live retrieval, not a fixture.

## Scripture, natively — not another Bible app

The challenge asked for Scripture that "feels like it was designed for that environment from the start." Companion never asks a child to open a Bible app. Scripture arrives **inside the emerging kids'-AI-companion frontier**, in the exact moment it's needed, in the language a child prays in — retrieved live from YouVersion, framed by Gloo.

## Tech stack

| Layer | Choice |
|-------|--------|
| App (both surfaces + API) | **Next.js 16** (App Router, TypeScript), **Tailwind v4** |
| Faith AI | **Gloo AI Studio** — OAuth2, OpenAI-compatible chat (classification + generation) |
| Scripture | **YouVersion Platform API** — live verse retrieval, 5 kid-friendly translations |
| Speech-to-text | **OpenAI Whisper** (adapter + mock fallback) |
| Text-to-speech | **ElevenLabs** (adapter + browser-voice fallback) |
| Faith-moment store | **In-memory** (demo stand-in; Supabase is the drop-in for production) |
| Deploy | **Vercel** |

## API integration

**Gloo AI Studio** — OAuth2 client-credentials → bearer token → OpenAI-compatible chat, with token caching:
```
POST https://platform.ai.gloo.com/oauth2/token           (Basic auth, scope=api/access)
POST https://platform.ai.gloo.com/ai/v1/chat/completions
```
Used for **classification** (structured JSON) and **response generation** (category-conditioned).

**YouVersion Platform** — app-key auth against the 2026 Platform API:
```
GET https://api.youversion.com/v1/bibles?language_ranges[]=eng   (header: X-YVP-App-Key)
GET https://api.youversion.com/v1/bibles/{id}/passages/ISA.41.10
```
The verse *reference* is curated per feeling (never hallucinated by the model); YouVersion supplies the authoritative *text*.

## Getting started

**Prerequisites:** Node 20+, a Gloo AI Studio account, a YouVersion Platform app.

```bash
git clone https://github.com/audreylena/Companion.git
cd Companion
npm install
cp .env.example .env.local     # then fill in your keys
npm run dev                    # http://localhost:3000
```

`.env.local`:
```
YOUVERSION_TOKEN=              # YouVersion App Key (X-YVP-App-Key)
GLOO_CLIENT_ID=
GLOO_CLIENT_SECRET=
GLOO_TOKEN_URL=https://platform.ai.gloo.com/oauth2/token
GLOO_BASE_URL=https://platform.ai.gloo.com/ai/v1
GLOO_MODEL=gloo-openai-gpt-5-mini
GLOO_SCOPE=api/access
OPENAI_API_KEY=               # optional — real mic transcription (else mock)
ELEVENLABS_API_KEY=           # optional — warm voice (else browser voice)
ELEVENLABS_VOICE_ID=
```

Without any keys, the app still runs on mock providers. With Gloo + YouVersion keys, it's fully real.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run the app locally |
| `npm run build` | Production build |
| `npm run eval` | Score the safety classifier against `eval/dataset.mjs` (live Gloo) |
| `node demo/record-demo.mjs` | Record the automated demo walkthrough (silent `.webm`) |

## Project structure

```
app/
  device/talk/        # the child experience (squeeze-to-talk)
  parent/             # parent dashboard (overview, discussions, advice, …)
  api/
    interact/         # the brain: classify → Scripture → compose
    classify/         # the classifier alone (used by the eval)
    stt/  tts/        # speech-to-text, text-to-speech
    parent/feed/      # live faith moments for the dashboard
lib/
  companion/          # gloo · scripture · mock · orchestrator · store
  stt/  tts/          # provider adapters (+ mocks / fallbacks)
  mock.ts             # dashboard data layer
eval/                 # safety-classifier eval harness (npm run eval)
demo/                 # Playwright demo recorder
docs/                 # technical writeup, Kaggle writeup, demo plan
```

## 🧸 The vision: a plush that glows

Today: a phone and a plush. Tomorrow: the plush *is* the companion — soft, embedded, always gentle. In our closing image, as the parent walks in to hold their child, **the plush's glow quietly fades to dark.** The AI disappears the instant the human arrives.

**What's next:** the physical plush (mic, speaker, gentle glow), real-time family persistence (Supabase), short curated Bible *stories* per feeling, more heart-languages, and connection to a family's own church — always *strengthening* the relationships that shape a child's faith, never replacing them.

Because Companion was never the answer.

**God is. Companion just helps children find Him.**

## License

MIT
