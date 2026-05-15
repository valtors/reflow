import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ResponsiveProvider } from "fluidity-ts/react";
import { clientHintsResponseHeaders, resolveServerBreakpoint } from "fluidity-ts/server";
import { SiteChrome } from "@/components/site-chrome";
import { breakpointSystem } from "../breakpoints";
import "./globals.css";

export const metadata: Metadata = {
  title: "fluidity-ts • Next.js App Router showcase",
  description:
    "Comprehensive responsive showcase for fluidity-ts with SSR breakpoint detection, Client Hints, Tailwind CSS, and interactive demos.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const serverSnapshot = resolveServerBreakpoint(
    {
      headers: requestHeaders,
      userAgent: requestHeaders.get("user-agent") ?? undefined,
    },
    breakpointSystem,
  );
  const serverColorScheme = requestHeaders.get("sec-ch-prefers-color-scheme") === "dark" ? "dark" : "light";
  const ssrSource = requestHeaders.get("x-fluidity-ssr-source") ?? "server-fallback";
  const clientHintMeta = (Object.entries(clientHintsResponseHeaders) as Array<[string, string]>).filter(
    ([key]) => key !== "Vary",
  );

  return (
    <html lang="en" data-theme={serverColorScheme} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {clientHintMeta.map(([key, value]) => (
          <meta key={key} name={`fluidity-${key.toLowerCase()}`} content={value} />
        ))}
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-sky-500/20">
        <ResponsiveProvider system={breakpointSystem} serverWidth={serverSnapshot?.width}>
          <SiteChrome
            serverColorScheme={serverColorScheme}
            ssrSource={ssrSource}
            serverWidth={serverSnapshot?.width}
          >
            {children}
          </SiteChrome>
        </ResponsiveProvider>
      </body>
    </html>
  );
}
