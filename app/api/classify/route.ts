import { getBrainProvider, CompanionError, type ChildContext } from "@/lib/companion";

/**
 * POST /api/classify — the safety classifier, exposed on its own.
 *
 * Text in → { provider, category, feeling, tone }. This is the first stage of
 * the brain (one Gloo call, no Scripture, no compose), used by the eval harness
 * (eval/run.mjs) to measure the classifier against labeled data — proof that
 * the safety routing is real and works, not hand-waved for the demo.
 */
export async function POST(request: Request) {
  let body: { text?: unknown; child?: ChildContext };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON with a 'text' field." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "Missing 'text'." }, { status: 400 });

  try {
    const provider = getBrainProvider();
    const classification = await provider.classify(text, body.child ?? {});
    return Response.json({ provider: provider.name, ...classification });
  } catch (err) {
    console.error("[classify] failed:", err);
    if (err instanceof CompanionError) {
      return Response.json({ error: "Classifier unavailable." }, { status: 502 });
    }
    return Response.json({ error: "Unexpected error." }, { status: 500 });
  }
}
