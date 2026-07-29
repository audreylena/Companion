import { listConversations } from "@/lib/companion/store";

/**
 * GET /api/parent/feed?childId=maya
 *
 * The live faith moments recorded from /device/talk, newest first. The parent
 * dashboard polls this and merges it with the seeded sample data.
 */
export async function GET(request: Request) {
  const childId = new URL(request.url).searchParams.get("childId") ?? undefined;
  return Response.json(
    { conversations: listConversations(childId) },
    { headers: { "cache-control": "no-store" } },
  );
}
