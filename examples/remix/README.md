# fluidity-ts — Remix example

Minimal Remix + Vite example showing `fluidity-ts` with SSR-safe breakpoints.

## What it demonstrates

- `FluidityProvider` wrapping the app in `app/root.tsx`
- `useBreakpoint()`, `useViewport()`, and `useColorScheme()` on the index route
- `entry.server.tsx` sending `Accept-CH`, `Critical-CH`, and `Vary` for `Sec-CH-Viewport-Width`
- `root.tsx` resolving the server width and passing it into the provider
- Fluid typography with `fluidClamp()`

## Run locally

```bash
cd ../..
npm install
npm run build

cd examples/remix
npm install
npm run dev
```

Open the local Remix URL printed by Vite.

## Notes

- This example depends on the local package via `"fluidity-ts": "file:../../"`.
- On the first request, the browser may not have sent `Sec-CH-Viewport-Width` yet; `resolveServerBreakpoint()` falls back to a coarse user-agent guess until the hint is available.
- In the current package, the provider export is `ResponsiveProvider`; this example aliases it to `FluidityProvider` for readability.
