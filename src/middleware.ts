import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPathPrefixes = ["/login", "/register", "/api/auth"];
const ignoredPathPrefixes = ["/_next", "/favicon.ico", "/logo.svg"];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    ignoredPathPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api")) {
    return withSecurityHeaders(NextResponse.next());
  }

  const token =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
