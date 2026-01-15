import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse, type ProxyConfig } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config: ProxyConfig = {
  matcher: ["/dashboard/:path*"],
};
