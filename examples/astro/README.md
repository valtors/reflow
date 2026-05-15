# fluidity-ts Astro example

A compact Astro demo showing the same `fluidity-ts` breakpoint logic inside React, Vue, and Svelte islands on one page.

## Setup

```bash
cd examples/astro
npm install
npm run dev
```

Then open `http://localhost:4321`.

## What it demonstrates

- Astro rendering a multi-framework page
- `fluidity-ts/react`, `fluidity-ts/vue`, and `fluidity-ts/svelte` side by side
- A shared breakpoint system in `src/lib/fluidity.ts`
- The same responsive rules producing the same result in every island

## Notes

- Uses the published `fluidity-ts` package plus Astro's React, Vue, and Svelte integrations
- The shared breakpoint-to-layout mapping lives in `src/lib/fluidity.ts`
- Vue and Svelte mount with `client:only` to keep the Astro page simple while still showing true multi-framework islands
- `astro.config.mjs` adds a tiny local alias for `fluidity-ts/svelte` so this monorepo example only pulls the `breakpoint` helper it needs
- Use `npm run build` to verify the production build
