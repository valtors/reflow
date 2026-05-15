"use client";

import Link from "next/link";
import { Show, useBreakpoint, useResponsiveValue, useViewport } from "fluidity-ts/react";
import { fluidClamp } from "fluidity-ts/styles";
import type { AppBreakpoints } from "../breakpoints";

const panelClass =
  "rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl";
const pillClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]";

const displayClamp = fluidClamp({ minPx: 42, maxPx: 88, minVwPx: 360, maxVwPx: 1600 });
const leadClamp = fluidClamp({ minPx: 17, maxPx: 22, minVwPx: 360, maxVwPx: 1440 });

const showcasePages = [
  {
    href: "/hooks",
    title: "All hooks in one place",
    description:
      "Breakpoint, viewport, color scheme, media queries, container queries, pointer detection, safe areas, DPR, responsive values, and Show — all live.",
    accent: "Instrumentation",
  },
  {
    href: "/dashboard",
    title: "Responsive dashboard layout",
    description:
      "See a practical analytics shell adapt from a compact mobile stack to a denser desktop workspace without hydration flicker.",
    accent: "Product UI",
  },
  {
    href: "/typography",
    title: "Fluid typography system",
    description:
      "Generate polished clamp() scales and preview how editorial content feels across breakpoints.",
    accent: "Design systems",
  },
] as const;

const ssrSteps = [
  {
    title: "Middleware forwards viewport context",
    body: "Client Hints are negotiated and a viewport-width fallback is injected onto the request for the very first SSR render.",
  },
  {
    title: "Layout resolves the server snapshot",
    body: "App Router reads headers() and calls resolveServerBreakpoint(...) before any client component renders.",
  },
  {
    title: "ResponsiveProvider hydrates safely",
    body: "The first client snapshot matches the server guess, so the dashboard and hooks demos render without breakpoint pop-in.",
  },
] as const;

const metrics = [
  { label: "SSR breakpoint", value: "Resolved on the server" },
  { label: "Theme", value: "Persisted with useColorScheme" },
  { label: "Styling", value: "Tailwind CSS + fluidClamp()" },
  { label: "Coverage", value: "Hooks, dashboard, typography" },
] as const;

export default function DemoClient() {
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const viewport = useViewport();
  const layoutMood =
    useResponsiveValue<string, AppBreakpoints>({
      mobile: "single-column clarity",
      tablet: "balanced storytelling",
      laptop: "multi-panel orchestration",
      desktop: "command-center density",
    }) ?? "single-column clarity";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className={`${panelClass} overflow-hidden`}>
          <div className="inline-flex flex-wrap items-center gap-3">
            <span className={pillClass}>Next.js App Router showcase</span>
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-[var(--accent-strong)]">
              Active breakpoint: {breakpoint.active}
            </span>
          </div>
          <div className="mt-6 max-w-4xl space-y-5">
            <h1 className="max-w-3xl text-balance font-semibold leading-[0.95] tracking-[-0.04em]" style={{ fontSize: displayClamp }}>
              Build responsive interfaces that already know their layout before hydration.
            </h1>
            <p className="max-w-2xl text-balance leading-8 text-[var(--muted)]" style={{ fontSize: leadClamp }}>
              This example turns fluidity-ts into a full product-quality playground: negotiated Client Hints,
              Tailwind-powered visuals, a live hooks lab, a responsive analytics dashboard, and a fluid type
              system you can copy into production.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/hooks"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
            >
              Explore every hook
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-sky-400/40 hover:text-sky-500"
            >
              Open dashboard demo
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <p className="text-sm font-medium text-[var(--muted)]">{metric.label}</p>
                <p className="mt-2 text-base font-semibold text-[var(--text)]">{metric.value}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={`${panelClass} bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))]`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                Live telemetry
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Current responsive snapshot</h2>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-500">
              Ready
            </div>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
              <dt className="text-sm text-[var(--muted)]">Viewport</dt>
              <dd className="mt-2 text-lg font-semibold">
                {viewport.width} × {viewport.height}
              </dd>
            </div>
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
              <dt className="text-sm text-[var(--muted)]">Orientation</dt>
              <dd className="mt-2 text-lg font-semibold capitalize">{viewport.orientation}</dd>
            </div>
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
              <dt className="text-sm text-[var(--muted)]">Layout mood</dt>
              <dd className="mt-2 text-lg font-semibold capitalize">{layoutMood}</dd>
            </div>
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
              <dt className="text-sm text-[var(--muted)]">Breakpoint helper</dt>
              <dd className="mt-2 text-lg font-semibold">
                {breakpoint.above("laptop") ? "Dense mode" : "Adaptive mode"}
              </dd>
            </div>
          </dl>
          <pre className="mt-6 overflow-x-auto rounded-[24px] border border-slate-800 bg-[var(--surface-contrast)] p-4 text-sm leading-7 text-slate-200">
{`resolveServerBreakpoint({
  headers,
  userAgent: headers.get("user-agent") ?? undefined,
}, breakpointSystem)`}
          </pre>
        </aside>
      </section>

      <section className={`${panelClass} space-y-6`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className={pillClass}>What&apos;s inside</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">A practical showcase, not a toy landing page</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--muted)]">
            Every route is designed to demonstrate a production use case while surfacing the responsive state
            that fluidity-ts exposes.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {showcasePages.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5 transition hover:-translate-y-1 hover:border-sky-400/40"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">{item.accent}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] group-hover:text-sky-500">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-sky-500">Open demo →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className={`${panelClass} space-y-5`}>
          <div>
            <span className={pillClass}>Client Hints pipeline</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">SSR-aware from the very first request</h2>
          </div>
          <div className="grid gap-4">
            {ssrSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 font-semibold text-sky-500">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-[var(--muted)]">{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={pillClass}>Adaptive preview</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Show different experiences by breakpoint</h2>
            </div>
            <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-sm font-medium text-[var(--muted)]">
              Current: {breakpoint.active}
            </span>
          </div>
          <div className="mt-6 rounded-[28px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
            <Show<AppBreakpoints>
              above="laptop"
              fallback={
                <div className="grid gap-4">
                  <div className="rounded-[22px] bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                      Mobile + tablet preview
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">Stacked, readable, fast to scan</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                      The interface prioritizes hero copy, action buttons, and a concise telemetry card before richer
                      panels appear.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['Hero', 'Telemetry', 'Feature links', 'SSR flow'].map((item) => (
                      <div key={item} className="rounded-[20px] border border-[color:var(--border)] p-4">
                        <p className="text-sm font-medium text-[var(--muted)]">{item}</p>
                        <div className="mt-3 h-20 rounded-2xl border border-[color:var(--border)] bg-[var(--surface-strong)]" />
                      </div>
                    ))}
                  </div>
                </div>
              }
            >
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/20 via-sky-500/12 to-indigo-500/10 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Desktop preview
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">Dense layout with multiple decision surfaces</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Once space is available, the same data expands into a dashboard-style surface with secondary
                    analytics, live feed widgets, and richer comparisons.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Navigation rail', 'Performance chart', 'KPI strip', 'Activity feed'].map((item) => (
                    <div key={item} className="rounded-[20px] border border-[color:var(--border)] p-4">
                      <p className="text-sm font-medium text-[var(--muted)]">{item}</p>
                      <div className="mt-3 h-24 rounded-2xl border border-[color:var(--border)] bg-[var(--surface-strong)]" />
                    </div>
                  ))}
                </div>
              </div>
            </Show>
          </div>
        </div>
      </section>
    </main>
  );
}
