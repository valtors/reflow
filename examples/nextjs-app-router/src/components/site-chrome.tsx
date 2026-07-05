"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { type ColorScheme, useBreakpoint, useColorScheme, useViewport } from "reflow/react";
import type { AppBreakpoints } from "@/breakpoints";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/hooks", label: "Hooks" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/typography", label: "Typography" },
] as const;

interface SiteChromeProps {
  children: ReactNode;
  serverColorScheme: ColorScheme;
  serverWidth?: number;
  ssrSource: string;
}

export function SiteChrome({ children, serverColorScheme, serverWidth, ssrSource }: SiteChromeProps) {
  const pathname = usePathname();
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const viewport = useViewport();
  const { colorScheme, setColorScheme } = useColorScheme({
    serverDefault: serverColorScheme,
    storageKey: "fluidity-next-theme",
  });

  useEffect(() => {
    document.documentElement.dataset.theme = colorScheme;
  }, [colorScheme]);

  return (
    <div className="relative isolate min-h-screen w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-aurora opacity-90 blur-3xl" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-40 mb-6 rounded-[30px] border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link href="/" className="text-lg font-semibold tracking-[-0.03em] text-[var(--text)]">
                  reflow <span className="text-[var(--accent-strong)]">showcase</span>
                </Link>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  App Router demo with SSR-aware breakpoints, Client Hints, Tailwind CSS, and persistent theme state.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <nav className="flex flex-wrap gap-2">
                  {navItems.map((item) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-glow"
                            : "border border-[color:var(--border)] bg-[var(--surface-strong)] text-[var(--text)] hover:border-sky-400/40 hover:text-sky-500"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  >
                    Toggle {colorScheme === "dark" ? "light" : "dark"} mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorScheme(null)}
                    className="rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-sky-400/40 hover:text-sky-500"
                  >
                    Use system
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">SSR width</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">{serverWidth ?? viewport.width}px</p>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Source</p>
                <p className="mt-1 text-sm font-semibold capitalize text-[var(--text)]">{ssrSource.replace(/-/g, " ")}</p>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Breakpoint</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">{breakpoint.active}</p>
              </div>
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Theme</p>
                <p className="mt-1 text-sm font-semibold capitalize text-[var(--text)]">{colorScheme}</p>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
