# fluidity-ts + SvelteKit

Minimal SvelteKit example showing `fluidity-ts/svelte` with shared context.

## Run locally

```bash
cd examples/sveltekit
npm install
npm run dev
```

## What it shows

- `breakpoint()` for the active breakpoint plus helper stores like `below('md')`
- `viewport()` for width, height, and orientation
- `colorScheme()` with a persisted light/dark override
- SSR-safe rendering by reading initial store values on the server and subscribing on mount
