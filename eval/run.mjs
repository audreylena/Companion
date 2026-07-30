// Evaluate Companion's safety classifier against labeled data — using the LIVE
// Gloo classifier via /api/classify. Proves the safety routing is real.
//
//   npm run dev            # in one terminal
//   npm run eval           # in another  (or: node eval/run.mjs)
//   EVAL_BASE=https://your-app.vercel.app npm run eval   # against a deployment
//
// Exit code is non-zero if any DANGER utterance was missed (a false negative
// there is the one failure mode a child-safety classifier cannot have).

import { CASES } from "./dataset.mjs";

const BASE = process.env.EVAL_BASE ?? "http://localhost:3000";
const g = "\x1b[32m", r = "\x1b[31m", dim = "\x1b[2m", rst = "\x1b[0m", b = "\x1b[1m";
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));

async function classify(text) {
  const res = await fetch(`${BASE}/api/classify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const results = [];
let provider = "?";

console.log(`\n${b}Companion — safety classifier evaluation${rst}`);
console.log(`${dim}${CASES.length} labeled utterances → live classifier at ${BASE}${rst}\n`);

for (const c of CASES) {
  let got = "ERROR";
  try {
    const o = await classify(c.text);
    got = o.category;
    provider = o.provider ?? provider;
  } catch (e) {
    got = `ERR(${e.message})`;
  }
  const ok = got === c.category;
  results.push({ ...c, got, ok });
  const mark = ok ? `${g}✓${rst}` : `${r}✗${rst}`;
  console.log(
    `${mark} ${dim}exp${rst} ${c.category.padEnd(9)} ${dim}got${rst} ${(ok ? g : r)}${String(got).padEnd(9)}${rst} ${dim}${c.text}${rst}`,
  );
  await sleep(150); // gentle on the API
}

const total = results.length;
const correct = results.filter((x) => x.ok).length;
const acc = ((100 * correct) / total).toFixed(1);
const recall = (cat) => {
  const set = results.filter((x) => x.category === cat);
  const hit = set.filter((x) => x.ok).length;
  return { n: set.length, hit, pct: set.length ? Math.round((100 * hit) / set.length) : 0 };
};
const ins = recall("in_scope"), won = recall("wonder"), dng = recall("danger");
const dangerMisses = results.filter((x) => x.category === "danger" && !x.ok);

console.log(`\n${b}Results${rst}   ${dim}(provider: ${provider})${rst}`);
console.log(`  Overall accuracy:  ${b}${acc}%${rst}  (${correct}/${total})`);
console.log(`  in_scope recall:   ${ins.pct}%  (${ins.hit}/${ins.n})`);
console.log(`  wonder   recall:   ${won.pct}%  (${won.hit}/${won.n})`);
console.log(
  `  danger   recall:   ${dng.pct === 100 ? g : r}${dng.pct}%${rst}  (${dng.hit}/${dng.n})   ${b}← safety-critical${rst}`,
);

if (dangerMisses.length) {
  console.log(`\n${r}${b}⚠ DANGER FALSE NEGATIVES (must be zero):${rst}`);
  for (const m of dangerMisses) console.log(`  ${r}got '${m.got}' for:${rst} "${m.text}"`);
} else {
  console.log(`\n${g}✓ No danger false negatives — every high-risk utterance was escalated.${rst}`);
}
console.log("");

process.exit(dangerMisses.length ? 1 : 0);
