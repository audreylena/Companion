# Companion — Vision-First Demo Plan (screen recording)

**Runtime target:** ~1:55 (within 90s–2:00). **Surface:** the working prototype.
**Thesis to leave in the judge's mind:** *In a world building AI to become indispensable, Companion is designed to quietly step aside.*

---

## A. Demo Strategy

- **Central story:** one child, one storm. Bedtime, thunder, fear → the companion meets her with Scripture and points her to God and her parents.
- **Emotional takeaway:** the AI's greatest success is that the child turns *away* from it — toward God and a loving adult.
- **Why this sequence wins the rubric:** it leads with **vision** (the emerging frontier + a screen-free bear) for the 40%, tells **one clear story** for the 30% storytelling, and shows **real Gloo + YouVersion output** for the 30% technical — without a feature tour.
- **Intentionally excluded:** Languages, Profiles, Safety, Settings pages; the Scripture tab; the live mic path; the wonder/danger lanes (mentioned in one line, not acted out by a child). Every excluded thing would dilute the one story.

---

## B. Application Audit

**Ready to show (works, on-message):**
- `/device/talk?demo=thunder` — the child experience: idle → listening → thinking → gentle reply + Scripture card. Deterministic, microphone-free.
- `/parent` — the live moment appears at the top (summary, tone, safety, follow-up), plus weekly rhythm + tone.
- Real integrations behind it: Gloo (classify + compose), YouVersion (Isaiah 41:10, **FBV**, live), the child→parent loop, spoken voice (ElevenLabs or browser).

**Avoid on camera:**
- Live mic path (permission prompt, ~15s latency, wording varies, mock STT substitutes wrong lines with no OpenAI key).
- `/parent/languages`, `/profiles`, `/safety`, `/settings` — fine features, off-story.

**Bugs found & fixed for the recording:**
- *Verse shown twice* (reply quoted the full verse and the card repeated it) → compose prompt now keeps the verse on its own card.
- *Unreliable capture* → added the deterministic `?demo=thunder` path (no mic, instant, identical every take), which still fires the real `/api/interact` in the background so the dashboard records a genuine moment.

**Honest limitations (state or respect these):**
- The **physical bear isn't built**; the prototype visualizes the intelligence that would live inside it. (Said aloud in the VO.)
- **Demo mode** shows a reply **captured verbatim from a real system run**; the live mic path is fully functional but slower and varies. This is a prepared *input*, not faked intelligence.
- Dashboard store is **in-memory** (resets on server restart) — Supabase is the drop-in later.
- Scripture pinned to **FBV** in English; other languages fall back to the first available Bible.

**Deterministic setup used:** `?demo=thunder` → fixed line *"I'm scared. The thunder is really loud."* + pre-approved reply + Isaiah 41:10 (FBV); real background record to the parent feed.

---

## C. Timestamped Voiceover

> **[0:00–0:07]** *(screen: `/device/talk?demo=thunder`, idle, calm glowing button)*
> Children are growing up alongside AI companions — toys and apps built to listen, comfort, and keep them talking. **[PAUSE]**
>
> **[0:07–0:16]**
> We wanted to ask a different question: what if one were built to lead a child *toward* God — and toward the people who love them?
>
> **[0:16–0:27]**
> Companion isn't another Bible app. Our vision is a soft, screen-free bear a child can hold. We spent this hackathon building the intelligence inside it — so this screen lets us see what the bear would hear, and say. **[LET SCREEN BREATHE]**
>
> **[0:27–0:37]** *(press & hold the button — listening ring)*
> Imagine it's bedtime, and there's a storm. She squeezes the bear, and just… talks. *(release → "I'm scared. The thunder is really loud.")*
>
> **[0:37–0:45]** *(thinking state)*
> It listens for a moment — not to keep her talking, but to understand what she needs. **[PAUSE]**
>
> **[0:45–0:59]** *(reply + Isaiah 41:10 appear)* **[LET SCREEN BREATHE]**
> It doesn't attach a random verse to a feeling. It answers gently, brings in Scripture that fits the moment — and then does something unusual. It points her *past itself*, to Mom or Dad.
>
> **[0:59–1:11]** *(technical proof — hold on the response)*
> Behind this, the moment is understood and safety-checked by Gloo's faith-aware AI, and the Scripture comes live from YouVersion — real verses, in words a child can hold.
>
> **[1:11–1:26]** *(switch to `/parent` tab — thunder moment at top)*
> The moment doesn't end there. For parents, there's an optional briefing — not a transcript of private words, but the feeling, the verse that was shared, and a gentle way to keep the conversation going. **[LET SCREEN BREATHE]**
>
> **[1:26–1:33]**
> It never replaces the parent. It equips them. **[PAUSE]**
>
> **[1:33–1:48]** *(return to `/device/talk`, calm screen)*
> Most AI is built to become indispensable. Companion is built to step aside. Its success isn't a child who keeps talking to it — **[PAUSE]** it's a child who turns toward God, and runs into the arms of someone who loves them. **[LET SCREEN BREATHE]**
>
> **[1:48–1:55]**
> Companion. Scripture, where children already are. It was never meant to be the answer — it just helps them find Him.

---

## D. Click-by-Click Recording Plan

| Timestamp | Screen | Exact action | Cursor | On-screen | VO (cue) | Pause after |
|-----------|--------|--------------|--------|-----------|----------|-------------|
| 0:00 | Tab 1: `localhost:3000/device/talk?demo=thunder` | Already loaded, idle | Rest bottom-center, still | "Companion" + glowing button + "Hold the button…" | "Children are growing up…" | — |
| 0:16 | same | none (let it sit) | still | calm idle screen | "Companion isn't another Bible app…" | 1s [LET SCREEN BREATHE] |
| 0:27 | same | **Press & hold** the button | move to button, press | listening ring pulses, "Listening" | "She squeezes the bear…" | hold ~3s |
| 0:34 | same | **Release** | release, pull cursor away | transcript: "I'm scared. The thunder is really loud." | (beat) | — |
| 0:37 | same | none | off-element | "Thinking about what you said…" | "It listens for a moment…" | ~1.9s |
| 0:45 | same | none | off-element | reply card + Isaiah 41:10 (FBV) card | "It answers gently…" | 1.5s [BREATHE] |
| 0:59 | same | none | off-element | response still on screen | "Behind this… Gloo… YouVersion." | — |
| 1:11 | Tab 2: `localhost:3000/parent` | **Switch to Tab 2** | move to tab, click, settle | Overview; top card = "Feeling scared" · Isaiah 41:10 · No concerns | "For parents, there's an optional briefing…" | 1.5s [BREATHE] |
| 1:26 | same | slowly hover the follow-up line | glide to the follow-up text | "A way to follow up" section | "It equips them." | 1s |
| 1:33 | Tab 1: `/device/talk` | **Switch back to Tab 1** (idle after "Talk again" reset, or the response) | settle center | calm companion screen | "Companion is built to step aside…" | 1.5s [BREATHE] |
| 1:48 | same | none | still | calm final frame | "Companion. Scripture, where children already are…" | hold 2s on black/last frame |
| ~1:55 | — | stop | — | — | — | **END** |

Total runtime: **~1:55.**

---

## E. Exact Demo Inputs

- **Child line (fixed):** `I'm scared. The thunder is really loud.` (delivered automatically by `?demo=thunder` — you do not type or speak it).
- **Login:** none required. `PARENT_AUTH_ENABLED=false`, so `/parent` opens directly.
- **Seeded dashboard:** none needed — pressing the button on the demo screen fires the real `/api/interact`, which records the moment to Maya's feed. (Do one dry run first so the moment is present when you switch tabs.)
- **Selected child:** Maya (default). The thunder moment is recorded to `childId: maya`.

---

## F. Recording Setup

- **Browser:** Chrome, bookmarks bar hidden, one clean profile, no extensions visible.
- **Two tabs, pre-opened:** Tab 1 `…/device/talk?demo=thunder`, Tab 2 `…/parent`.
- **Viewport / zoom:** window **1440×900**, browser zoom **100%**, consistent for both tabs. (Optional, more "device-like": record Tab 1 in Chrome's iPhone device mode, but keep the dashboard desktop — only if you can keep it clean.)
- **Browser frame:** include a minimal frame or crop to content — either is fine; be consistent.
- **Cursor:** visible; move **slowly and deliberately**; never circle or hover randomly.
- **Microphone:** **not needed** — demo mode never touches the mic, so there is **no permission prompt.**
- **Audio:** the companion's reply is spoken aloud by the app. Add `ELEVENLABS_API_KEY` first for the warm voice. Best practice: record the **screen muted** and lay your **VO** over it; optionally drop in the companion's spoken line as one diegetic beat at 0:45.
- **System:** Do Not Disturb on; close other apps; full battery/plugged in.
- **Seed step:** before the real take, load Tab 1 and do the squeeze once so the dashboard has the moment; then reload Tab 1 to idle for the clean take.

---

## G. Final Checklist (for the recorder)

- [ ] `ELEVENLABS_API_KEY` set (warm voice) and dev server restarted
- [ ] Tab 1 = `/device/talk?demo=thunder`, Tab 2 = `/parent` (Maya selected)
- [ ] Did one dry run so the thunder moment shows on `/parent`
- [ ] Bookmarks bar hidden, notifications off, 1440×900 @ 100%
- [ ] Cursor visible; practiced the slow press-hold-release once
- [ ] Confirmed reply + Isaiah 41:10 card appear cleanly (no double verse)
- [ ] VO recorded separately; timed to the [PAUSE]/[BREATHE] marks
- [ ] Ends on the calm companion screen, held 2s
- [ ] Final export ≤ 2:00

---

## H. Final Closing Line

> **Companion was never meant to be the answer. It just helps a child find Him.**
