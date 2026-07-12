# Changelog

## Unreleased

- Added `useResponsiveValue` for Solid
- Added `useDynamicViewport` for Solid
- Solid adapter upgraded from core-only to core + responsive hooks
- CONTRIBUTING.md expanded with AI agent contribution guide
- Issue and PR templates added
- Docs site deployed at valtors.github.io/reflow
- Landing page rebranded and cleaned up

## [1.3.0] - 2026-07-11

First GitHub release of Reflow, the SSR-safe responsive toolkit for TypeScript.

### Added

#### Framework adapters

- Solid.js adapter (signals-based)
- Angular 17+ adapter (standalone signals, `inject`, `DestroyRef`)
- Preact adapter (hooks-based)
- Qwik adapter (resumable, `useVisibleTask$`)
- Lit adapter (`ReactiveController` pattern)
- Full adapter set now covers React, Vue, Svelte, Solid, Qwik, Preact, Angular, and Lit

#### Core modules

- **Motion** — spring physics, responsive transitions, reduce-motion support
- **Images** — `srcset` generation, art direction, optimal widths; `useElementSize` for ResizeObserver-based element tracking
- **A11y** — WCAG touch targets, font sizing, line length helpers, audit utilities
- **Debug** — devtools overlay, performance marks, `formatDebugState`

#### Style utilities

- Responsive CSS Grid (`responsiveGrid`, `containerGrid`, `gridPresets`)
- Responsive Stack layout

#### Components

- Vue `<Show>` conditional component
- Svelte `<Show>` conditional component
- React DevTools floating panel

#### Examples and docs

- Nuxt 3 example (plugin + composables)
- SvelteKit example (stores + SSR)
- Remix example (client hints + fluid typography)
- Astro example (multi-framework islands)
- Next.js App Router example (Tailwind, dashboard, hooks lab)
- Starlight documentation site
- Next.js App Router SSR example path

#### Infrastructure

- Performance benchmarks (mitata) and bundle size comparison tool
- GitHub community files (issue templates, PR template, discussions)
- Enhanced README (framework grid, ecosystem, star history)
- npm keywords and funding field for discoverability
- CI: typecheck, lint, test, build, publint, attw, size-limit

### Fixed

- Color-scheme override now uses a per-key `Map` to prevent cross-instance leaks
- CI failure from a debug test that imported a missing dependency

### Notes

- Zero runtime dependencies; core remains ~2.4 KB gzipped
- SSR-safe by default (`useSyncExternalStore` where applicable)
- Container queries, fluid typography, viewport tracking, and user preferences remain first-class

## [1.2.0]

See git history for details prior to the expanded 1.3.0 notes.
