# Automated demo recording

Records a **silent** `.webm` walkthrough of the Companion demo (the `?demo=thunder`
scenario) for you to add a voiceover to. Playwright never captures audio, so the
output is inherently audio-free — there is no separate "muted" version to make.

**Output:** `demo-output/companion-demo.webm` (~112s, 1440×900)

## One-time setup (already done in this repo)

```bash
npm install -D playwright
npx playwright install chromium
```

## Rerun the recording

The app must be running and the dashboard should hold at least one thunder moment.

```bash
# 1. start the app (in one terminal)
npm run dev            # serves http://localhost:3000

# 2. seed a thunder moment so /parent is populated (in another terminal)
curl -s -X POST http://localhost:3000/api/interact \
  -H 'content-type: application/json' \
  -d '{"text":"I am scared. The thunder is really loud.","childId":"maya","child":{"name":"Maya","companionName":"Companion","guardian":"Mom or Dad","language":"en"}}'

# 3. (optional) verify the flow fast, without writing a video
DRY=1 node demo/record-demo.mjs

# 4. record the final video
node demo/record-demo.mjs
# → prints: VIDEO SAVED: .../demo-output/companion-demo.webm
```

Override the target URL (e.g. a deployed build):

```bash
DEMO_BASE=https://your-app.vercel.app node demo/record-demo.mjs
```

## Seeded / deterministic data

- The child line is fixed by the app's `?demo=thunder` scenario:
  *"I'm scared. The thunder is really loud."*
- The on-screen reply is a response **captured verbatim from a real Gloo +
  YouVersion run** (Isaiah 41:10, FBV). The demo screen also fires the real
  `/api/interact` in the background, so the parent dashboard records a genuine
  moment. Only the *input* is deterministic — the intelligence is real.

## Pacing

Pause lengths live at the top of each scene in `record-demo.mjs`. Adjust the
`await wait(...)` values to lengthen/shorten sections; the total is ~112s. The
"hold" (press-and-hold) is intentionally un-scaled so the squeeze always
registers.

## Notes

- Headless Chromium records video with no display needed.
- A soft blue cursor is drawn in-page (Playwright video doesn't capture the OS
  pointer). It follows the synthetic mouse so movement reads as deliberate.
- Convert to MP4 if your editor prefers it:
  `ffmpeg -i demo-output/companion-demo.webm demo-output/companion-demo.mp4`
