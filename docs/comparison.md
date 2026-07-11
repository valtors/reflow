# reflow vs other responsive libraries

## Quick comparison

| Feature | reflow | react-responsive | @vueuse/core | usehooks-ts |
|---|---|---|---|---|
| SSR-safe by default | Yes | No (needs workaround) | Partial | Partial |
| Frameworks | 8 (React, Vue, Svelte, Solid, Qwik, Preact, Angular, Lit) | React only | Vue only | React only |
| Container queries | Yes | No | No | No |
| Fluid typography | Yes (fluidClamp) | No | No | No |
| Breakpoint system | Typed, configurable | Hardcoded | Configurable | None |
| User preferences | Yes (reduced-motion, dark, contrast) | No | Partial | No |
| Tailwind preset | Yes | No | No | No |
| Test utilities | Yes | No | No | No |
| Runtime deps | 0 | 0 | Many | 0 |
| Bundle size (core) | ~2.4 KB | ~1.5 KB | Large | ~1-2 KB per hook |
| Bundle size (React) | ~3.3 KB | ~1.5 KB | N/A | N/A |

## reflow vs react-responsive

### SSR

react-responsive requires `MediaQuery` context or `useMediaQuery` with manual SSR handling. Hydration mismatches are common.

```tsx
// react-responsive - manual SSR handling needed
import { useMediaQuery } from "react-responsive";

function Component() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  // SSR renders one thing, client may render another -> hydration mismatch
  return isMobile ? <Mobile /> : <Desktop />;
}
```

```tsx
// reflow - SSR-safe by default
import { useBreakpoint, ResponsiveProvider } from "reflow/react";

function Component() {
  const bp = useBreakpoint();
  // SSR and client agree because ResponsiveProvider sets serverWidth
  return bp.below("md") ? <Mobile /> : <Desktop />;
}

export default () => (
  <ResponsiveProvider serverWidth={1024}>
    <Component />
  </ResponsiveProvider>
);
```

### Container queries

react-responsive has no container query support. reflow ships `useContainerQuery` and `useContainerSize`.

### Fluid typography

react-responsive has no fluid typography. reflow ships `fluidClamp()`:

```ts
import { fluidClamp } from "reflow/styles";

const fontSize = fluidClamp({ minPx: 16, maxPx: 22 });
// => "clamp(1rem, 0.875rem + 0.625vw, 1.375rem)"
```

## reflow vs @vueuse/core

@vueuse/core is a general-purpose Vue utility library. reflow focuses on responsive design only, but does it better:

- SSR-safe by default (no hydration mismatch)
- Container queries (not in @vueuse)
- Fluid typography (not in @vueuse)
- 8 framework adapters (Vue is just one)
- Zero runtime deps (@vueuse has many)
- Typed breakpoint system with mobile-first cascade

### Mapping

| @vueuse/core | reflow |
|---|---|
| `useMediaQuery(query)` | `useMediaQuery(query)` from `reflow/vue` |
| `useWindowSize()` | `useViewport()` from `reflow/vue` |
| `useBreakpoints(breakpoints)` | `useBreakpoint()` from `reflow/vue` |
| `usePreferredColorScheme()` | `useColorScheme()` from `reflow/vue` |
| `useElementSize(el)` | `useElementSize(ref)` from `reflow/react` * |

*useElementSize is React-only for now. Vue adapter for it is a good first issue.

## reflow vs usehooks-ts

usehooks-ts is a general React hooks collection. reflow is purpose-built for responsive design:

- 8 framework adapters (usehooks-ts is React only)
- Container queries (not in usehooks-ts)
- Fluid typography (not in usehooks-ts)
- SSR-safe with `useSyncExternalStore` (usehooks-ts uses `typeof window` checks)
- Typed breakpoint system (usehooks-ts has none)
- Tailwind preset (not in usehooks-ts)
- Test utilities for mocking matchMedia and ResizeObserver

## When to use reflow

- You need SSR-safe responsive behavior without hydration warnings
- You work across multiple frameworks and want one API
- You need container queries, fluid typography, or user preference detection
- You want a typed breakpoint system
- You care about bundle size

## When to use something else

- You only need a single `useMediaQuery` hook and nothing else (react-responsive is smaller)
- You already use @vueuse/core extensively and just need basic viewport (stick with @vueuse)
- You need non-responsive hooks (usehooks-ts is broader)
