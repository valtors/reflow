"use client";

import { Show, useBreakpoint, useResponsiveValue, useViewport } from "reflow/react";
import type { AppBreakpoints } from "@/breakpoints";

const panelClass =
  "rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl";
const pillClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]";

const kpis = [
  { label: "Net revenue", value: "$842k", trend: "+14.2%" },
  { label: "Trial activation", value: "68%", trend: "+6.1%" },
  { label: "Retention", value: "92.4%", trend: "+1.8%" },
  { label: "NPS", value: "61", trend: "+4" },
] as const;

const activity = [
  { title: "West region exceeded target", meta: "Pipeline score +18% · 6 min ago" },
  { title: "Design review approved", meta: "Typography rollout moved to launch queue" },
  { title: "Enterprise cohort onboarded", meta: "12 accounts converted from pilot" },
  { title: "API latency stabilized", meta: "P95 recovered after infra rebalance" },
] as const;

const campaigns = [42, 68, 54, 77, 88, 63, 94] as const;
const latency = [28, 32, 30, 24, 22, 20, 21, 18] as const;

export default function DashboardPage() {
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const viewport = useViewport();
  const chartHeight = useResponsiveValue<number, AppBreakpoints>({
    mobile: 180,
    tablet: 220,
    laptop: 260,
    desktop: 300,
  }) ?? 180;
  const density = breakpoint.above("desktop") ? 4 : breakpoint.above("tablet") ? 2 : 1;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div className={panelClass}>
          <span className={pillClass}>Responsive dashboard demo</span>
          <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            A dashboard layout that gets richer as space becomes available.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            This page uses the same responsive state to reorganize navigation, charts, and secondary panels. On
            smaller screens it becomes a focused operational summary; on wider canvases it grows into a complete
            workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <article key={item.label} className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold tracking-[-0.04em]">{item.value}</p>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-500">
                    {item.trend}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={`${panelClass} bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))]`}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Live layout state</p>
          <div className="mt-5 grid gap-3">
            {[
              { label: "Breakpoint", value: breakpoint.active },
              { label: "Viewport", value: `${viewport.width}px wide` },
              { label: "Charts", value: `${chartHeight}px tall` },
              { label: "Grid density", value: `${density} column${density > 1 ? "s" : ""}` },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
                <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Show<AppBreakpoints>
          above="laptop"
          fallback={
            <div className={`${panelClass} space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={pillClass}>Compact mode</span>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Mobile-first summary rail</h2>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-500">Adaptive</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Pin revenue, pipeline, and support metrics at the top.",
                  "Keep actions and alerts visible before charts and feeds.",
                ].map((item) => (
                  <div key={item} className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4 text-sm leading-7 text-[var(--muted)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <aside className={`${panelClass} flex flex-col justify-between`}>
            <div>
              <span className={pillClass}>Desktop navigation</span>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Workspace rail</h2>
              <div className="mt-5 grid gap-2">
                {[
                  "Overview",
                  "Revenue",
                  "Lifecycle",
                  "Automations",
                  "Team performance",
                  "Settings",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-[18px] px-4 py-3 text-sm font-semibold ${
                      index === 0
                        ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white"
                        : "border border-[color:var(--border)] bg-[var(--surface-strong)] text-[var(--text)]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-medium text-[var(--muted)]">Layout note</p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                <code>Show above="laptop"</code> reveals a full navigation rail only when the viewport can support it.
              </p>
            </div>
          </aside>
        </Show>

        <div className="grid gap-6">
          <section className={`${panelClass} space-y-5`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className={pillClass}>Acquisition performance</span>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Channel mix and conversion lift</h2>
              </div>
              <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-sm font-medium text-[var(--muted)]">
                Updated 2 min ago
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--muted)]">Campaign performance</p>
                  <span className="text-sm font-semibold text-emerald-500">+12% WoW</span>
                </div>
                <div className="mt-6 flex items-end gap-3" style={{ height: `${chartHeight}px` }}>
                  {campaigns.map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className="w-full rounded-t-[20px] bg-gradient-to-t from-cyan-500 via-sky-500 to-indigo-500"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        W{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm font-medium text-[var(--muted)]">Latency trend</p>
                <div className="mt-6 flex items-end gap-2" style={{ height: `${chartHeight}px` }}>
                  {latency.map((value, index) => (
                    <div key={index} className="flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-[16px] bg-gradient-to-t from-emerald-400 to-cyan-400"
                        style={{ height: `${value * 4}px` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  The chart height itself is responsive via <code>useResponsiveValue()</code>.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className={`${panelClass} space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className={pillClass}>Lifecycle view</span>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Journey health</h2>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-500">
                  Forecasting stable
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Awareness", "18.4k visitors", "62% qualified"],
                  ["Activation", "3.2k trials", "41% completed setup"],
                  ["Expansion", "$214k pipeline", "27 accounts in negotiation"],
                ].map(([title, value, note]) => (
                  <div key={title} className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
                    <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className={`${panelClass} space-y-4`}>
              <div>
                <span className={pillClass}>Activity feed</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Operational pulse</h2>
              </div>
              <div className="grid gap-3">
                {activity.map((item) => (
                  <article key={item.title} className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.meta}</p>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
