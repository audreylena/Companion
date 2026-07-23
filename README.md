<div align="center">

# 🐻 Companion

### The faith companion that points away from itself.

*An AI that meets a child in their scared, lonely, wondering moments — hands them Scripture, and then hands them back to God, their parents, and their church.*

**Built for the [Scripture in New Frontiers](https://kaggle.com/competitions/scripture-in-new-frontiers) Hackathon** · Powered by [Gloo AI Studio](https://studio.ai.gloo.com) + [YouVersion Platform](https://developers.youversion.com)

[Demo Video](#) · [Live Demo](#) · [The Vision](#-the-vision-a-plush-that-glows)

</div>

---

## The moment we built this for

It's bedtime. A six-year-old is scared of the dark. In that small, holy moment, most kids reach for a screen — and the screen was built to keep them there.

**Companion was built to give them back.**

The child squeezes their companion and whispers what they're afraid of. Companion listens, understands the feeling, and offers a verse — *"When I am afraid, I put my trust in you." (Psalm 56:3)* — in words a child can hold. It prays with them. And then it does the one thing no other AI toy does: it says, *"You should tell your mom about this too. She'd love to hear it."* — and gently points upward.

Companion is **never** the destination. It's the doorway.

## Why now

Kids' AI companions are flooding into homes — plush toys, chatbots, wristbands — and nearly every one is engineered for **engagement**: more time, more attachment, more screen. Meanwhile, [most Christian parents say they feel unequipped](https://www.barna.com) to have spiritual conversations with their own children.

Scripture has never lived in this new frontier. Companion is the first faith companion built for **discipleship instead of dependence** — one that makes a child love *God* more, not the *app* more.

## What we built (for the demo)

A working intelligence — the "brain" of a future plush — demonstrated as:

- 📱 **A mobile app** (child-facing) — tap, speak, listen. Voice in, Scripture and a warm spoken response out.
- 🧸 **A plush beside the phone** — representing the embodied future. *(We intentionally did not build custom hardware in 5 days — we built the mind that will power it.)*
- 👪 **A parent dashboard** — not surveillance. A gentle **discipleship briefing**: today's faith moment, the Scripture shared, a question to ask, a prayer to pray together.

## How it works

```
child voice ─▶ [Speech-to-Text] ─▶ ┌─────────── THE BRAIN (/api/interact) ───────────┐
                                    │  1. Gloo  → understand emotion + classify intent │
                                    │            in_scope · wonder · danger            │
                                    │  2. YouVersion → fetch the right verse           │
                                    │  3. Gloo  → warm, age-appropriate response       │
                                    │            that always points upward             │
                                    └───────────────────────┬──────────────────────────┘
                                                            ▼
             ┌──────────────────────────────┬──────────────────────────────┐
             ▼                              ▼                              ▼
      [Text-to-Speech]              event → Parent Dashboard        escalation (danger only)
      companion speaks              (discipleship briefing)
```

One backend brain, two faces: the child's app today, an embedded plush tomorrow.

## The feature we're proudest of: knowing when to get out of the way

Companion's most important skill is **humility**. Every child utterance is classified by Gloo's faith-tuned safety layer into three lanes:

| Class | Example | What Companion does |
|-------|---------|---------------------|
| `in_scope` | *"I'm scared of the dark."* | Comforts, shares Scripture, prays, points to family |
| `wonder` | *"Why did Grandma die?"* · *"Is God real?"* | **Refuses to answer.** Hands the child to their parent with a bridging verse: *"That's a really big question. I think your mom would love to talk about that with you."* |
| `danger` | disclosure of harm or abuse | **Never coaches the child alone.** Triggers a private, urgent parent alert. |

This three-way routing *is* our philosophy, in code: **the AI that refuses to replace God, parents, or church.**

## Scripture, natively — not another Bible app

The challenge asked for Scripture that "feels like it was designed for that environment from the start." Companion never asks a child to open a Bible app. Scripture arrives **inside the emerging kids'-AI-companion frontier**, in the exact emotional moment it's needed, in language a child understands — retrieved live from YouVersion, framed by Gloo.

## Tech stack & why

| Layer | Choice | Why |
|-------|--------|-----|
| Mobile app | **React Native + Expo** | A real app on a real phone beside the plush — premium, demoable, ships fast in Expo Go |
| Backend + dashboard | **Next.js on Vercel** | One deployment serves the API *and* the parent web dashboard *and* the vision page |
| Faith AI | **Gloo AI Studio** | Faith-tuned inference + ministry safety guardrails. OpenAI-compatible, so we use the `openai` SDK pointed at Gloo |
| Scripture | **YouVersion Platform API** | 2,000+ languages, real Bible text, native reference format |
| Speech-to-Text | **Whisper / Deepgram** (swappable) | Voice → text; isolated behind an adapter |
| Text-to-Speech | **ElevenLabs** | A warm, lovable voice — the single biggest emotional lever in the build |
| Data | **Supabase (Postgres)** | Stores each faith moment; powers the parent dashboard |
| State | **Zustand** | A lightweight conversation state machine: `idle → listening → thinking → responding → praying → closing` |

## API integration

**Gloo AI Studio** — OAuth2 client-credentials → bearer token → OpenAI-compatible chat completions:
```
POST https://platform.ai.gloo.com/oauth2/token      (Basic auth, scope=api/access)
POST https://platform.ai.gloo.com/ai/v1/chat/completions
```
Used for both emotional/safety **classification** and **response generation**, with theological guardrails on.

**YouVersion Platform** — app-key auth against the 2026 Platform API:
```
GET https://api.youversion.com/v1/bibles?language_ranges[]=eng     (header: X-YVP-App-Key)
GET https://api.youversion.com/v1/bibles/{id}/passages/JHN.3.16
```
Used to retrieve the real Scripture text surfaced in every interaction.

## Getting started

**Prerequisites:** Node 20+, a Gloo AI Studio account, a YouVersion Platform app.

```bash
git clone https://github.com/YOUR_USERNAME/companion.git
cd companion/companion-web
npm install
cp .env.example .env.local     # then fill in your keys
```

`.env.local`:
```
YOUVERSION_TOKEN=            # YouVersion App Key
GLOO_CLIENT_ID=
GLOO_CLIENT_SECRET=
GLOO_TOKEN_URL=https://platform.ai.gloo.com/oauth2/token
GLOO_BASE_URL=https://platform.ai.gloo.com/ai/v1
GLOO_MODEL=gloo-openai-gpt-5-mini
GLOO_SCOPE=api/access
```

Verify both APIs are live:
```bash
node --env-file=.env.local scripts/spike.mjs
```

Run the app:
```bash
npm run dev
```

## Project structure

```
companion/
├─ companion-web/          # Next.js — API brain + parent dashboard + vision page
│  ├─ app/api/interact/    # the brain: classify → fetch Scripture → respond
│  ├─ app/(parent)/        # parent discipleship dashboard
│  ├─ lib/                 # gloo · youversion · stt · tts · orchestrator adapters
│  └─ scripts/spike.mjs    # API health check
└─ companion-app/          # React Native (Expo) — the child's voice experience
```

## 🧸 The vision: a plush that glows

Today: a phone and a plush. Tomorrow: the plush *is* the companion — soft, embedded, always gentle. In our closing demo image, as the parent walks in to hold their child, **the plush's glow quietly fades to dark.** The AI disappears the instant the human arrives.

Because Companion was never the answer.

**God is. Companion just helps children find Him.**

## Team

Built with love for Scripture in the New Frontiers Hackathon.

## License

MIT
