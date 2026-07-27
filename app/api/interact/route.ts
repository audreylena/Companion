import { respondToChild, CompanionError, type ChildContext } from "@/lib/companion";

/**
 * POST /api/interact — the brain.
 *
 * Text in (a transcript from /api/stt or any device), a CompanionTurn out:
 * the classified moment, a warm reply, Scripture, and — for the moments a toy
 * must not own — a hand-off back to a human.
 *
 *   curl -X POST http://localhost:3000/api/interact \
 *     -H 'content-type: application/json' \
 *     -d '{"text":"I am scared of the dark","child":{"name":"Maya","language":"en"}}'
 */

const MAX_CHARS = 2000;

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: { text?: unknown; child?: ChildContext };
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body with a 'text' field.", 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return fail("Missing 'text'.", 400);
  if (text.length > MAX_CHARS) return fail(`'text' exceeds ${MAX_CHARS} characters.`, 413);

  try {
    const turn = await respondToChild({ text, ctx: body.child });
    return Response.json(turn);
  } catch (err) {
    console.error("[interact] failed:", err);
    if (err instanceof CompanionError) {
      return fail("The companion is unavailable right now.", 502);
    }
    return fail("Unexpected error.", 500);
  }
}
