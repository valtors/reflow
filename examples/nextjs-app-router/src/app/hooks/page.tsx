"use client";

import { useRef, useState } from "react";
import {
  Show,
  useBreakpoint,
  useColorScheme,
  useContainerQuery,
  useDevicePixelRatio,
  useMediaQuery,
  usePointer,
  usePreference,
  useResponsiveValue,
  useSafeArea,
  useViewport,
} from "reflow/react";
import { fluidClamp } from "reflow/styles";
import type { AppBreakpoints } from "@/breakpoints";

const panelClass =
  "rounded-[28px] border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] backdrop-blur-xl";
const pillClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]";

const heroClamp = fluidClamp({ minPx: 34, maxPx: 66, minVwPx: 360, maxVwPx: 1440 });
const bodyClamp = fluidClamp({ minPx: 16, maxPx: 20, minVwPx: 360, maxVwPx: 1280 });

export default function HooksPage() {
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const viewport = useViewport();
  const { colorScheme } = useColorScheme({
    storageKey: "fluidity-next-theme",
  });
  const pointer = usePointer();
  const reducedMotion = usePreference("reducedMotion");
  const moreContrast = usePreference("moreContrast");
  const widescreen = useMediaQuery("(min-width: 1280px)");
  const dpr = useDevicePixelRatio();
  const safeArea = useSafeArea();
  const density =
    useResponsiveValue<string, AppBreakpoints>({
      mobile: "Compact stack",
      tablet: "Balanced split",
      laptop: "Multi-panel studio",
      desktop: "High-density workspace",
    }) ?? "Compact stack";

  const [containerWidth, setContainerWidth] = useState(520);
  const containerRef = useRef<HTMLDivElement>(null);
  const compactContainer = useContainerQuery(containerRef, { maxPx: 420 });
  const roomyContainer = useContainerQuery(containerRef, { minPx: 720 });

  const telemetryCards = [
    { label: "Active breakpoint", value: breakpoint.active },
    { label: "Viewport", value: `${viewport.width} × ${viewport.height}` },
    { label: "Color scheme", value: colorScheme },
    { label: "Pointer", value: pointer.coarse ? "coarse" : pointer.fine ? "fine" : "mixed" },
    { label: "DPR", value: dpr.toFixed(2) },
    {
      label: "Safe area",
      value: `${safeArea.top}px / ${safeArea.right}px / ${safeArea.bottom}px / ${safeArea.left}px`,
    },
    { label: "Reduced motion", value: reducedMotion ? "on" : "off" },
    { label: "Responsive value", value: density },
  ] as const;

  const containerNarrative = compactContainer
    ? "Container query collapses into a focused, mobile-style summary."
    : roomyContainer
      ? "The container has enough width for secondary actions, stats, and richer density."
      : "This mid-range width keeps a balanced two-column arrangement.";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className={panelClass}>
          <span className={pillClass}>Complete hooks lab</span>
          <h1 className="mt-4 max-w-3xl text-balance font-semibold leading-[0.98] tracking-[-0.04em]" style={{ fontSize: heroClamp }}>
            Every reflow signal, surfaced in a single live dashboard.
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-[var(--muted)]" style={{ fontSize: bodyClamp }}>
            Resize the window, toggle the theme, change the container width, or move between displays to watch
            hooks update in place. This page is meant to be a living inspection surface for responsive state.
          </p>
        </div>
        <aside className={`${panelClass} bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))]`}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Highlights</p>
          <div className="mt-4 grid gap-3">
            {[
              "useBreakpoint() and useViewport() for layout state",
              "useColorScheme(), usePreference(), and useMediaQuery() for environment signals",
              "useContainerQuery(), usePointer(), useSafeArea(), and useDevicePixelRatio() for device-aware UX",
              "useResponsiveValue() and <Show /> for declarative rendering",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-4 text-sm leading-7 text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className={`${panelClass} space-y-5`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className={pillClass}>Hook telemetry</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Live responsive state</h2>
          </div>
          <div className="rounded-full border border-[color:var(--border)] px-3 py-1 text-sm font-medium text-[var(--muted)]">
            widescreen query: {widescreen ? "matched" : "not matched"}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {telemetryCards.map((card) => (
            <article key={card.label} className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">{card.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`${panelClass} space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className={pillClass}>Container queries</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Resize a component, not the viewport</h2>
            </div>
            <label className="flex items-center gap-3 rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]">
              <span>{containerWidth}px</span>
              <input
                type="range"
                min={280}
                max={900}
                value={containerWidth}
                onChange={(event) => setContainerWidth(Number(event.target.value))}
                className="w-40 accent-sky-500"
              />
            </label>
          </div>
          <div className="overflow-x-auto rounded-[24px] border border-dashed border-[color:var(--border)] p-3">
            <div
              ref={containerRef}
              style={{ width: `${containerWidth}px` }}
              className="mx-auto rounded-[24px] bg-[var(--surface-strong)] p-4 transition-[width] duration-300"
            >
              <div className={`grid gap-4 ${compactContainer ? "grid-cols-1" : "md:grid-cols-[1.1fr_0.9fr]"}`}>
                <div className="rounded-[22px] bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    Container snapshot
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{compactContainer ? "Compact" : roomyContainer ? "Expanded" : "Balanced"}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{containerNarrative}</p>
                </div>
                <div className="grid gap-3">
                  {[compactContainer, roomyContainer, breakpoint.above("laptop")].map((value, index) => (
                    <div key={index} className="rounded-[20px] border border-[color:var(--border)] p-4">
                      <p className="text-sm font-medium text-[var(--muted)]">
                        {index === 0 ? "max-width < 420px" : index === 1 ? "min-width ≥ 720px" : 'above("laptop")'}
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--text)]">{value ? "true" : "false"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${panelClass} space-y-5`}>
          <div>
            <span className={pillClass}>Fluid typography</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Type that scales with the viewport</h2>
          </div>
          <div className="rounded-[26px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Generated clamp</p>
            <h3 className="mt-4 max-w-2xl font-semibold tracking-[-0.04em]" style={{ fontSize: heroClamp }}>
              Fluid sizing keeps hierarchy expressive without breakpoints for every text token.
            </h3>
            <p className="mt-4 max-w-2xl leading-8 text-[var(--muted)]" style={{ fontSize: bodyClamp }}>
              The same type token can carry a page title from compact phones to large desktop canvases while preserving rhythm and legibility.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-[22px] bg-[var(--surface-contrast)] p-4 text-sm leading-7 text-slate-200">
{`fluidClamp({ minPx: 34, maxPx: 66, minVwPx: 360, maxVwPx: 1440 })\n// → ${heroClamp}`}
            </pre>
          </div>
        </div>
      </section>

      <section className={`${panelClass} space-y-5`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className={pillClass}>Declarative rendering</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Show richer UI only when there is room</h2>
          </div>
          <div className="text-sm text-[var(--muted)]">Current density: {density}</div>
        </div>
        <Show<AppBreakpoints>
          above="laptop"
          fallback={
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5 text-sm leading-7 text-[var(--muted)]">
              Below laptop, the page keeps a cleaner, single-column explanation. <code>&lt;Show /&gt;</code> lets you swap
              in simpler components without manually wiring media queries.
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              "Desktop-only annotation rail",
              "Secondary chart callout",
              "Large-screen quick actions",
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">Shown with &lt;Show above=&quot;laptop&quot; /&gt;</p>
                <h3 className="mt-3 text-xl font-semibold">{item}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Render larger-screen enhancements only when the layout can support them.
                </p>
              </div>
            ))}
          </div>
        </Show>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">hover / any-hover</p>
            <p className="mt-2 text-base font-semibold">{pointer.hover ? "hover" : "no hover"} / {pointer.anyHover ? "any-hover" : "touch only"}</p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">contrast preference</p>
            <p className="mt-2 text-base font-semibold">{moreContrast ? "more contrast" : "default contrast"}</p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">orientation</p>
            <p className="mt-2 text-base font-semibold capitalize">{viewport.orientation}</p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--border)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">media query</p>
            <p className="mt-2 text-base font-semibold">(min-width: 1280px) → {widescreen ? "true" : "false"}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
