import { NextResponse, type NextRequest } from "next/server";

/**
 * Trust boundary between the two surfaces (Next.js "proxy" convention).
 *
 *   /parent/*  — the parent dashboard. Requires a parent session.
 *   /device/*  — the child's plushie stand-in. No parent auth; a device
 *                token check belongs here once hardware exists.
 *
 * Enforcement is gated behind PARENT_AUTH_ENABLED so local dev and the demo
 * keep working with no login wired up. Flip it on once /login and a real
 * session exist.
 */

const PARENT_SESSION_COOKIE = "companion_parent_session";
const AUTH_ENABLED = process.env.PARENT_AUTH_ENABLED === "true";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Child device surface — never gated behind parent auth.
  if (pathname.startsWith("/device")) {
    // TODO: verify a signed device token here (X-Device-Token / cookie).
    return NextResponse.next();
  }

  // Parent dashboard — require a parent session when auth is enabled.
  if (pathname.startsWith("/parent")) {
    if (!AUTH_ENABLED) return NextResponse.next();

    const hasSession = Boolean(req.cookies.get(PARENT_SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run only on the two app surfaces; static assets and /api are untouched.
  matcher: ["/parent/:path*", "/device/:path*"],
};
