// Task 1 spike — proves both required APIs are alive BEFORE we build anything.
// Run with:  node --env-file=.env.local scripts/spike.mjs
//
// Success = you see a real Bible verse from YouVersion AND a real completion
// from a Gloo faith-tuned model. Each test is isolated so one failing does not
// hide the other.

import OpenAI from "openai";

const {
  // --- YouVersion ---
  YOUVERSION_TOKEN,
  YOUVERSION_BASE = "https://developers.youversionapi.com/1.0", // confirm vs 2026 Platform base in your portal
  // --- Gloo ---
  GLOO_CLIENT_ID,
  GLOO_CLIENT_SECRET,
  GLOO_TOKEN_URL, // from docs.gloo.com/api-reference  (OAuth2 token endpoint)
  GLOO_BASE_URL, // OpenAI-compatible base, e.g. .../ai/v1  (from docs)
  GLOO_MODEL, // pick one from Gloo's supported-models list
  GLOO_SCOPE = "api/access", // confirmed scope
} = process.env;

const ok = (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`);
const bad = (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`);

const YV_BASE = "https://api.youversion.com/v1"; // 2026 YouVersion Platform API

async function testYouVersion() {
  console.log("\n— YouVersion —");
  if (!YOUVERSION_TOKEN) return bad("YOUVERSION_TOKEN missing in .env.local (this holds your App Key)");
  const headers = {
    "accept": "application/json",
    "X-YVP-App-Key": YOUVERSION_TOKEN, // identifies the app, NOT the user
    "user-agent": "companion-spike/0.1",
  };
  try {
    // 1) list available Bibles — proves the App Key authenticates
        const bres = await fetch(`${YV_BASE}/bibles?language_ranges[]=eng`, { headers });
    if (!bres.ok) return bad(`YouVersion /bibles ${bres.status}: ${(await bres.text()).slice(0, 300)}`);
    const bibles = await bres.json();
    ok("YouVersion /bibles responded 200");
    const list = bibles?.data ?? bibles?.bibles ?? bibles;
    const first = Array.isArray(list) ? list[0] : undefined;
    console.log(`Bibles available: ${Array.isArray(list) ? list.length : "?"}; first: ${JSON.stringify(first)?.slice(0, 200)}`);

    // 2) pull John 3:16 from the first Bible — proves we can fetch real Scripture
    const bibleId = first?.id ?? first?.bible_id;
    if (bibleId) {
      const pres = await fetch(`${YV_BASE}/bibles/${bibleId}/passages/JHN.3.16`, { headers });
      if (!pres.ok) return bad(`YouVersion passage ${pres.status}: ${(await pres.text()).slice(0, 300)}`);
      const passage = await pres.json();
      ok("YouVersion passage responded 200");
      console.log(JSON.stringify(passage, null, 2).slice(0, 600));
    }
  } catch (e) {
    bad(`YouVersion threw: ${e.message}`);
  }
}

async function getGlooToken() {
  // OAuth2 client-credentials. Gloo expects Basic auth (client_id:client_secret)
  // with grant_type=client_credentials and scope=api/access. If your portal shows
  // a different shape, adjust here — this is the one place auth details live.
  const basic = Buffer.from(`${GLOO_CLIENT_ID}:${GLOO_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(GLOO_TOKEN_URL, {
    method: "POST",
    headers: {
      "authorization": `Basic ${basic}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: GLOO_SCOPE }),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { access_token } = await res.json();
  if (!access_token) throw new Error("no access_token in token response");
  return access_token;
}

async function testGloo() {
  console.log("\n— Gloo —");
  if (!GLOO_CLIENT_ID || !GLOO_CLIENT_SECRET || !GLOO_TOKEN_URL || !GLOO_BASE_URL || !GLOO_MODEL)
    return bad("Missing one of GLOO_CLIENT_ID / GLOO_CLIENT_SECRET / GLOO_TOKEN_URL / GLOO_BASE_URL / GLOO_MODEL");
  try {
    const token = await getGlooToken();
    ok("Got Gloo access token");
    const gloo = new OpenAI({ baseURL: GLOO_BASE_URL, apiKey: token });
    const completion = await gloo.chat.completions.create({
      model: GLOO_MODEL,
      messages: [
        { role: "system", content: "You are a gentle faith companion for young children." },
        { role: "user", content: "In one warm sentence, comfort a child who is scared of the dark." },
      ],
    });
    ok("Gloo completion returned");
    console.log(`Model said: ${completion.choices[0]?.message?.content}`);
  } catch (e) {
    bad(`Gloo threw: ${e.message}`);
  }
}

console.log("=== Companion API spike ===");
await testYouVersion();
await testGloo();
console.log("\nDone.");
