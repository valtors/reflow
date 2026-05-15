# fluidity-ts — Nuxt 3 example

A minimal Nuxt 3 demo showing how to use the Vue adapter with SSR-safe defaults.

## What it demonstrates

- `plugins/fluidity.ts` installs `createFluidityPlugin()` and provides shared breakpoints
- `composables/useResponsive.ts` wraps `useBreakpoint()`, `useViewport()`, and `useColorScheme()`
- `pages/index.vue` renders breakpoint, viewport, and theme state without hydration mismatch

## Run locally

```bash
cd examples/nuxt
npm install
npm run dev
```

Then open http://localhost:3000.
