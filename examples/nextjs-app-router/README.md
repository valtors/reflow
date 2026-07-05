# reflow — Next.js App Router showcase

A polished App Router example that turns `reflow` into a full responsive playground: SSR breakpoint detection, negotiated Client Hints, a dark-mode toggle, a hooks lab, a dashboard layout, and a fluid typography demo.

## What it demonstrates

- `src/middleware.ts` negotiates Client Hints and forwards a request-level viewport fallback for first-request SSR breakpoint detection
- `src/app/layout.tsx` reads `headers()` and calls `resolveServerBreakpoint(...)`
- `ResponsiveProvider` receives `serverWidth` so the first hydrated snapshot matches the server render
- `useColorScheme()` powers a persisted light/dark toggle in the global app chrome
- `/hooks` showcases breakpoint, viewport, media query, color scheme, container query, pointer, preference, safe area, DPR, responsive value, and `Show`
- `/dashboard` demonstrates a practical responsive analytics workspace
- `/typography` demonstrates `fluidClamp()` with a multi-step type scale and editorial preview
- Tailwind CSS is layered on top for a production-quality visual presentation

## Pages to explore

- `/` — landing page and SSR flow overview
- `/hooks` — complete hook showcase with live state panels
- `/dashboard` — responsive dashboard shell with adaptive panes
- `/typography` — fluid scale, clamp output, and reading experience demo

## Setup

This example resolves `reflow` directly from the repository source, so you can start it without building the package first:

```bash
cd examples/nextjs-app-router
npm install
npm run dev
```

Open http://localhost:3000.

## Suggested screenshots

If you want to document the example visually, these are the most useful captures:

1. **Landing page hero** — the aurora-style hero, live telemetry card, and route cards.
2. **Hooks lab** — the full instrumentation grid plus the interactive container query slider.
3. **Dashboard page** — the desktop layout with sidebar, KPI strip, charts, and activity feed.
4. **Typography page** — the fluid type scale cards and editorial preview.
5. **Dark mode** — any page with the persisted dark theme toggle enabled.

## Notes

- This example depends on the local package via `"reflow": "file:../../"` and uses local path aliases so the demo can compile directly from the repository source.
- On the first request the browser may not have sent viewport Client Hints yet, so middleware injects a UA-based width fallback and upgrades to real hints once the browser starts sending them.
- `Sec-CH-Prefers-Color-Scheme` is also read on the server so the first paint can align with the user&apos;s preferred theme when available.
