# reflow — Vite + React demo

A live, interactive showcase of [reflow](https://www.npmjs.com/package/reflow).

## ▶️ Open in StackBlitz (no install)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/valtors/reflow/tree/main/examples/vite-react)

## Run locally

```bash
git clone https://github.com/valtors/reflow
cd reflow/examples/vite-react
npm install
npm run dev
```

## What this demo shows

- `useBreakpoint()` — current breakpoint key
- `useViewport()` — width/height with rAF throttling
- `useDevicePixelRatio()`, `usePointer()`, `usePreference("reduced-motion")`
- `useResponsiveValue({ xs, sm, md, lg, xl, "2xl" })` — driving a column count and padding
- `<Show on={…}>` — declarative breakpoint gating
- `useContainerQuery(ref, { minPx })` — try resizing the box, layout updates by container size, not viewport
- `fluidClamp({ minPx, maxPx, minVw, maxVw })` — typed runtime clamp with slope guard
