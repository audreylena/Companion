// Automated demo recording for Companion (Playwright).
//
// Records a SILENT .webm (Playwright never captures audio) so you can lay your
// own voiceover over it. Follows the approved click-by-click sequence from
// docs/DEMO_PLAN.md against the deterministic ?demo=thunder scenario.
//
//   node demo/record-demo.mjs         → records demo-output/companion-demo.webm
//   DRY=1 node demo/record-demo.mjs   → dry run: verifies the flow fast, no video
//   DEMO_BASE=http://localhost:3000 node demo/record-demo.mjs   → override URL
//
// Requires the app running (npm run dev) and at least one recorded thunder
// moment in the dashboard (the runner script seeds this first).

import { chromium } from "playwright";
import { rename, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.DEMO_BASE ?? "http://localhost:3000";
const DRY = process.env.DRY === "1";
const OUT_DIR = "demo-output";
const VIEWPORT = { width: 1440, height: 900 };

// In dry mode, scale every pause way down so verification is quick.
const S = DRY ? 0.05 : 1;
const wait = (ms) => new Promise((r) => setTimeout(r, ms * S));

// A visible cursor: Playwright's video doesn't render the OS pointer, so we
// draw one that follows the synthetic mouse events.
async function installCursor(page) {
  await page.addStyleTag({
    content: `#pw-cursor{position:fixed;left:-50px;top:-50px;z-index:2147483647;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(47,92,147,.30);border:2px solid rgba(47,92,147,.85);box-shadow:0 2px 8px rgba(0,0,0,.18);pointer-events:none;transition:left .04s linear,top .04s linear}`,
  });
  await page.evaluate(() => {
    const c = document.createElement("div");
    c.id = "pw-cursor";
    document.body.appendChild(c);
    const move = (e) => {
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move, true);
    window.addEventListener("pointermove", move, true);
  });
}

async function go(page, route) {
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await wait(800);
  await installCursor(page);
}

const moveTo = (page, x, y) => page.mouse.move(x, y, { steps: 30 });

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ...(DRY ? {} : { recordVideo: { dir: OUT_DIR, size: VIEWPORT } }),
  });
  const page = await context.newPage();

  // ── Scene 1 — the calm companion, idle (VO: the frontier + the vision) ──
  await go(page, "/device/talk?demo=thunder");
  await moveTo(page, 720, 780);
  await wait(18000);

  // ── Scene 2 — the child squeezes the bear and speaks ──
  const btn = await page.waitForSelector("button.talk-button", { timeout: 15000 });
  const box = await btn.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await moveTo(page, cx, cy);
  await wait(1200);
  await page.mouse.down();     // squeeze
  await new Promise((r) => setTimeout(r, 3000)); // real hold so the squeeze registers
  await page.mouse.up();       // release → thinking
  await moveTo(page, cx, cy + 280);

  // ── Scene 3 — thinking → gentle response + Scripture (let it breathe) ──
  await page.waitForSelector("text=Isaiah 41:10", { timeout: 15000 });
  await wait(24000);

  // ── Scene 4 — technical proof beat (hold on the response) ──
  await wait(14000);

  // ── Scene 5 — the parent briefing ──
  await go(page, "/parent");
  await page.waitForSelector("text=Most recent reflection", { timeout: 15000 }).catch(() => {});
  await moveTo(page, 700, 320);
  await wait(16000);
  const follow = await page.$("text=A way to follow up");
  if (follow) {
    const fb = await follow.boundingBox();
    if (fb) await moveTo(page, fb.x + 60, fb.y + 12);
  }
  await wait(7000);

  // ── Scene 6 — return to the companion (closing frame) ──
  await go(page, "/device/talk?demo=thunder");
  await moveTo(page, 720, 500);
  await wait(22000);

  const video = page.video();
  await context.close(); // flushes the recording to disk
  await browser.close();

  if (!DRY && video) {
    const src = await video.path();
    const dest = path.join(OUT_DIR, "companion-demo.webm");
    await rename(src, dest);
    console.log("VIDEO SAVED:", path.resolve(dest));
  } else {
    console.log(DRY ? "DRY RUN OK — flow verified, no video written." : "No video handle produced.");
  }
}

main().catch((e) => {
  console.error("DEMO FAILED:", e);
  process.exit(1);
});
