import { NextResponse, type NextRequest } from "next/server";

//CSP avec un nonce unique par requete 
export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production"; //CSP plus fort pour production
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const devSocket =
    isDev && socketUrl ? ` ${socketUrl} ${socketUrl.replace(/^http/, "ws")}` : "";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${devSocket}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      //les pages sauf l'API, les fichiers statiques et le favicon sont concernes par la protection
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
