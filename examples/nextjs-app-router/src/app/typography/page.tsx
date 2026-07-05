"use client";

import { createBreakpoints, defaultBreakpoints } from "reflow";
import { useBreakpoint, useResponsiveValue } from "reflow/react";
import { fluidClamp } from "reflow/styles";
import type { AppBreakpoints } from "@/breakpoints";

const panelClass =
  "rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl";
const pillClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]";

const display = fluidClamp({ minPx: 42, maxPx: 96, minVwPx: 360, maxVwPx: 1600 });
const heading = fluidClamp({ minPx: 28, maxPx: 52, minVwPx: 360, maxVwPx: 1440 });
const body = fluidClamp({ minPx: 16, maxPx: 21, minVwPx: 360, maxVwPx: 1280 });
const caption = fluidClamp({ minPx: 12, maxPx: 14, minVwPx: 360, maxVwPx: 1280 });
const defaultSystem = createBreakpoints(defaultBreakpoints);

const scale = [
  { label: "Display", value: display, preview: "Fluid typography can feel cinematic without becoming brittle." },
  { label: "Heading", value: heading, preview: "A shared clamp keeps rhythm across sections and cards." },
  { label: "Body", value: body, preview: "Paragraphs stay readable and steady as the viewport stretches." },
  { label: "Caption", value: caption, preview: "Supporting detail remains compact but legible." },
] as const;

export default function TypographyPage() {
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const measure =
    useResponsiveValue<string, AppBreakpoints>({
      mobile: "32ch",
      tablet: "42ch",
      laptop: "52ch",
      desktop: "60ch",
    }) ?? "32ch";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div className={panelClass}>
          <span className={pillClass}>Fluid typography demo</span>
          <h1 className="mt-4 max-w-4xl text-balance font-semibold leading-[0.92] tracking-[-0.05em]" style={{ fontSize: display }}>
            Build a type system that scales beautifully between small screens and expansive canvases.
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-[var(--muted)]" style={{ fontSize: body }}>
            <code>fluidClamp()</code> lets you describe range and intent once, then reuse the generated clamp token
            across landing pages, dashboards, and editorial content.
          </p>
        </div>

        <aside className={`${panelClass} bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))]`}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Scale signals</p>
          <div className="mt-5 grid gap-3">
            {[
              { label: "Current breakpoint", value: breakpoint.active },
              { label: "Recommended measure", value: measure },
              { label: "Default lg query", value: defaultSystem.up("lg") },
              { label: "Default xl query", value: defaultSystem.up("xl") },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4">
                <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-[var(--text)]">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className={`${panelClass} space-y-5`}>
        <div>
          <span className={pillClass}>Type tokens</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Generated clamp values</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {scale.map((item) => (
            <article key={item.label} className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">{item.label}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.value}</p>
              <p className="mt-5 text-balance font-semibold tracking-[-0.03em]" style={{ fontSize: item.value }}>
                {item.preview}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className={`${panelClass} overflow-hidden`}>
          <div className="rounded-[28px] bg-gradient-to-br from-cyan-500/15 via-sky-500/8 to-indigo-500/10 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Editorial preview</p>
            <h2 className="mt-4 text-balance font-semibold leading-[0.96] tracking-[-0.05em]" style={{ fontSize: heading }}>
              Responsive typography should adapt with subtle confidence, not abrupt jumps.
            </h2>
            <div className="mt-6 max-w-full space-y-5 text-[var(--muted)]" style={{ maxWidth: measure }}>
              <p style={{ fontSize: body, lineHeight: 1.8 }}>
                A fluid scale keeps headlines energetic on phones while preventing them from feeling timid on larger
                screens. It also lets body copy expand just enough to improve reading comfort without forcing manual
                breakpoint overrides for every text role.
              </p>
              <p style={{ fontSize: body, lineHeight: 1.8 }}>
                In design systems, this means fewer hard-coded jumps, better continuity between components, and more
                room to compose interfaces that feel deliberate at any size.
              </p>
              <p style={{ fontSize: caption, lineHeight: 1.8 }}>
                Note · The preview width itself is driven by <code>useResponsiveValue()</code>, so the reading measure
                tightens on small screens and relaxes on larger ones.
              </p>
            </div>
          </div>
        </article>

        <aside className={`${panelClass} space-y-5`}>
          <div>
            <span className={pillClass}>Default breakpoints</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Core presets from reflow</h2>
          </div>
          <div className="grid gap-3">
            {Object.entries(defaultBreakpoints).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] px-4 py-3">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">{key}</span>
                <span className="text-sm font-semibold text-[var(--text)]">{value}px</span>
              </div>
            ))}
          </div>
          <pre className="overflow-x-auto rounded-[22px] bg-[var(--surface-contrast)] p-4 text-sm leading-7 text-slate-200">
{`fluidClamp({ minPx: 42, maxPx: 96, minVwPx: 360, maxVwPx: 1600 })\n// ${display}`}
          </pre>
        </aside>
      </section>
    </main>
  );
}
