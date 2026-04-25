import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes accessible without authentication
const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/privacy", "/terms", "/contact"];

// NextAuth v5 session cookie names (secure/insecure variants)
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIES.some(name => !!req.cookies.get(name)?.value);
}

// API endpoints that are public for specific methods
const PUBLIC_API: { path: string; method: string }[] = [
  { path: "/api/users",     method: "POST" }, // student registration
  { path: "/api/investors", method: "POST" }, // investor registration
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    p => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublic) return NextResponse.next();

  // Allow public API endpoints (registration) without auth
  if (PUBLIC_API.some(({ path, method }) => pathname === path && req.method === method)) {
    return NextResponse.next();
  }

  // No session cookie → redirect to login
  if (!hasSessionCookie(req)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files, _next internals, and favicon
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
