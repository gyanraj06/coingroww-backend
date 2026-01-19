import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't satisfy the protection check
  const isPublicPath = path === "/login" || path.startsWith("/api/auth");

  // Check for session cookie
  const adminSession = request.cookies.get("admin_session")?.value;

  // 1. If trying to access a protected route without a session, redirect to login
  if (!isPublicPath && !adminSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If trying to access login page WITH a session, redirect to dashboard
  if (isPublicPath && adminSession && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Configure paths to match
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
