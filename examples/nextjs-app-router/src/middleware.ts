import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clientHintsResponseHeaders } from "fluidity-ts/server";

const MOBILE_WIDTH = 390;
const TABLET_WIDTH = 834;
const DESKTOP_WIDTH = 1366;

function inferViewportWidth(request: NextRequest) {
  const hintedWidth = Number.parseInt(
    request.headers.get("sec-ch-viewport-width") ?? request.headers.get("viewport-width") ?? "",
    10,
  );

  if (Number.isFinite(hintedWidth) && hintedWidth > 0) {
    return { width: hintedWidth, source: "client-hint" };
  }

  if (request.headers.get("sec-ch-ua-mobile") === "?1") {
    return { width: MOBILE_WIDTH, source: "ua-mobile-hint" };
  }

  const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";

  if (/ipad|tablet|android(?!.*mobile)|kindle|silk/.test(userAgent)) {
    return { width: TABLET_WIDTH, source: "user-agent-tablet" };
  }

  if (/mobi|iphone|ipod|android.+mobile|blackberry|iemobile|opera mini/.test(userAgent)) {
    return { width: MOBILE_WIDTH, source: "user-agent-mobile" };
  }

  return { width: DESKTOP_WIDTH, source: "desktop-fallback" };
}

export function middleware(request: NextRequest) {
  const inferredViewport = inferViewportWidth(request);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("viewport-width", String(inferredViewport.width));
  requestHeaders.set("x-fluidity-ssr-source", inferredViewport.source);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const [key, value] of Object.entries(clientHintsResponseHeaders) as Array<[string, string]>) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
