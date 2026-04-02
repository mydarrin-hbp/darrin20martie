import { NextRequest, NextResponse } from "next/server";

const canonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST;
const forceHttps = process.env.NEXT_PUBLIC_FORCE_HTTPS === "true";

export function middleware(request: NextRequest) {
  if (!canonicalHost && !forceHttps) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const host = request.headers.get("host") ?? "";
  const isHttps = url.protocol === "https:";

  if (canonicalHost && host && host !== canonicalHost) {
    url.host = canonicalHost;
    if (forceHttps) {
      url.protocol = "https:";
    }
    return NextResponse.redirect(url, 301);
  }

  if (forceHttps && !isHttps) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico).*)"],
};
