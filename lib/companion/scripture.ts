import type { Feeling, Verse } from "./types";

/**
 * Scripture selection + retrieval.
 *
 * The *reference* for each feeling is curated here — deliberately not left to
 * the model — so a child always receives an age-appropriate verse. YouVersion
 * supplies the authoritative *text*; if no key is configured or the call fails,
 * we fall back to the short text bundled below so the pipeline never breaks.
 */

interface BankEntry {
  ref: string;
  usfm: string; // YouVersion passage id, e.g. "ISA.41.10"
  text: string; // offline fallback, kept short for young children
}

const BANK: Record<Feeling, BankEntry> = {
  fear: { ref: "Isaiah 41:10", usfm: "ISA.41.10", text: "So do not be afraid. I am with you." },
  worry: { ref: "Philippians 4:6", usfm: "PHP.4.6", text: "Do not worry. Tell God what you need, and thank him." },
  sadness: { ref: "Psalm 34:18", usfm: "PSA.34.18", text: "The Lord is close to people whose hearts are hurting." },
  loneliness: { ref: "Deuteronomy 31:6", usfm: "DEU.31.6", text: "The Lord your God is with you. He will never leave you." },
  anger: { ref: "Colossians 3:13", usfm: "COL.3.13", text: "Be gentle with each other. Forgive one another." },
  gratitude: { ref: "1 Thessalonians 5:18", usfm: "1TH.5.18", text: "Give thanks no matter what happens." },
  sleep: { ref: "Psalm 4:8", usfm: "PSA.4.8", text: "In peace I will lie down and sleep." },
  identity: { ref: "Psalm 139:14", usfm: "PSA.139.14", text: "I am wonderfully made. God's works are wonderful." },
  wonder: { ref: "Psalm 145:18", usfm: "PSA.145.18", text: "The Lord is near to all who call out to him." },
  other: { ref: "Psalm 56:3", usfm: "PSA.56.3", text: "When I am afraid, I put my trust in you." },
};

const YV_BASE = "https://api.youversion.com/v1";

// BCP-47 → YouVersion's 3-letter language filter.
const LANG3: Record<string, string> = {
  en: "eng", fr: "fra", es: "spa", pt: "por", sw: "swa", ar: "arb",
};

interface BibleRef {
  id: string;
  abbr: string;
}

// Pinned, kid-friendly translations. FBV (Free Bible Version) reads naturally
// for children — "Don't be afraid, for I am with you!" — far better than the
// archaic public-domain default that YouVersion returns first (ASV). Add a
// per-language entry here as kid-friendly translations become available.
const PREFERRED: Record<string, BibleRef> = {
  eng: { id: "1932", abbr: "FBV" }, // Free Bible Version — natural, kid-friendly
  spa: { id: "3365", abbr: "PDT" }, // Palabra de Dios para Todos — simple Spanish
  fra: { id: "93", abbr: "LSG" }, // Louis Segond — the readable French standard
  por: { id: "3254", abbr: "BLT" }, // Bíblia Livre para Todos — modern Portuguese
  arb: { id: "195", abbr: "ERV" }, // Easy-to-Read Translation — Arabic
};

// Resolve a Bible once per language, then reuse it. YouVersion requires an id
// for passage lookups and we don't want to pay for /bibles on every turn.
const bibleCache = new Map<string, BibleRef>();

async function resolveBible(lang: string): Promise<BibleRef | null> {
  const token = process.env.YOUVERSION_TOKEN;
  if (!token) return null;
  const lang3 = LANG3[lang] ?? "eng";
  if (bibleCache.has(lang3)) return bibleCache.get(lang3)!;

  // Prefer a pinned kid-friendly translation when we have one for this language.
  const pinned = PREFERRED[lang3];
  if (pinned) {
    bibleCache.set(lang3, pinned);
    return pinned;
  }

  // Otherwise fall back to the first available Bible in that language.
  try {
    const res = await fetch(`${YV_BASE}/bibles?language_ranges[]=${lang3}`, {
      headers: { accept: "application/json", "X-YVP-App-Key": token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = data?.data ?? data?.bibles ?? data;
    const first = Array.isArray(list) ? list[0] : undefined;
    const id = first?.id ?? first?.bible_id;
    if (id != null) {
      const ref: BibleRef = {
        id: String(id),
        abbr: String(first?.abbreviation ?? first?.localized_abbreviation ?? "").toUpperCase(),
      };
      bibleCache.set(lang3, ref);
      return ref;
    }
  } catch {
    /* fall through to null → local fallback */
  }
  return null;
}

// Best-effort text extraction: the passage payload shape can vary, so pull the
// first plausible string and strip any markup rather than assume one schema.
function extractText(payload: unknown): string | null {
  const candidate =
    (payload as { content?: string; text?: string; passage?: { content?: string } })
      ?.content ??
    (payload as { text?: string })?.text ??
    (payload as { passage?: { content?: string } })?.passage?.content;
  if (typeof candidate !== "string") return null;
  const clean = candidate.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length ? clean : null;
}

export async function getVerse(feeling: Feeling, language = "en"): Promise<Verse> {
  const entry = BANK[feeling] ?? BANK.other;

  const bible = await resolveBible(language);
  if (bible) {
    try {
      const res = await fetch(
        `${YV_BASE}/bibles/${bible.id}/passages/${entry.usfm}`,
        { headers: { accept: "application/json", "X-YVP-App-Key": process.env.YOUVERSION_TOKEN! } },
      );
      if (res.ok) {
        const text = extractText(await res.json());
        if (text) {
          return { ref: entry.ref, text, translation: bible.abbr || undefined, language, source: "youversion" };
        }
      }
    } catch {
      /* fall through to local */
    }
  }

  return { ref: entry.ref, text: entry.text, language, source: "local" };
}
