# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.3.0] - 2026-05-15

### Added
- New framework adapters
  - Solid.js adapter (`reflow/solid`)
  - Angular adapter with Signals (`reflow/angular`)
  - Preact adapter (`reflow/preact`)
  - Qwik adapter (`reflow/qwik`)
  - Lit / Web Components adapter (`reflow/lit`)
- Responsive image utilities
  - `generateSrcset()`
  - `generateSizes()`
  - `calculateImageWidths()`
- Motion and animation utilities
  - `responsiveTransition()`
  - `createSpring()`
  - `reduceMotion()`
  - `responsiveDuration()`
- Accessibility utilities
  - `responsiveTouchTarget()`
  - `accessibleFontSize()`
  - `auditResponsiveA11y()`
  - `optimalLineLength()`
- Responsive grid and layout utilities
  - `responsiveGrid()`
  - `containerGrid()`
  - `responsiveStack()`
  - `gridPresets()`
- Debug and DevTools utilities
  - React DevTools overlay component
  - `formatDebugState()`
  - `createPerfMark()`
- `Show` component for Vue
- `Show` component for Svelte
- New examples for Nuxt, SvelteKit, Remix, and Astro

## [1.1.0] - 2026-05-09

### Added
- `useColorScheme()` React hook — SSR-safe dark/light mode detection with optional `localStorage` persistence
- 24 new core module tests covering `dpr`, `pointer`, `preferences`, `container`, `viewport`, and `safe-area`
- 3 new Tailwind tests — inline snapshot, structural validation, and single-breakpoint edge case
- JSDoc documentation for all previously undocumented core and React exports
- GitHub Discussions (Roadmap, Q&A, Show & Tell)
- GitHub Pages documentation site

### Changed
- README completely rewritten with architecture diagrams, API reference, 9 recipes, SSR integration guides
- README refined with quick-nav TOC, section dividers, collapsible sections, branded footer
- Added npm downloads and GitHub stars badges

### Fixed
- Corrected GitHub username references in FUNDING.yml and org profile

## [1.0.0] - Initial Release

### Added
- Core responsive toolkit (`reflow/core`)
  - `createBreakpoints()` — typed breakpoint system
  - `watchMedia()` — SSR-safe matchMedia wrapper
  - `observeContainer()` — container query observation
  - `observeDevicePixelRatio()` — DPR tracking
  - `getPointerCapabilities()` — pointer detection
  - `getPreference()` / `observePreference()` — user preference media
  - `observeViewport()` / `observeVisualViewport()` — viewport tracking
  - `getSafeArea()` / `observeSafeArea()` — safe area insets
- React adapter (`reflow/react`)
  - `ResponsiveProvider` — context provider with SSR support
  - `useBreakpoint()` — typed breakpoint hook
  - `useMediaQuery()` — reactive media query hook
  - `useContainerQuery()` / `useContainerSize()` — container query hooks
  - `useViewport()` — viewport dimensions hook
  - `useDevicePixelRatio()` — DPR hook
  - `usePointer()` — pointer capabilities hook
  - `usePreference()` — user preference hook
  - `useSafeArea()` — safe area insets hook
  - `Show` / `Hide` — conditional rendering components
  - `BreakpointBadge` — debug overlay component
- Styles (`reflow/styles`) — fluid typography with CSS clamp
- Server (`reflow/server`) — SSR utilities for Next.js and Express
- Testing (`reflow/testing`) — test utilities and viewport mocking
- Tailwind (`reflow/tailwind`) — Tailwind CSS preset generation

[1.3.0]: https://github.com/valtors/reflow/compare/v1.1.0...v1.3.0
[1.1.0]: https://github.com/valtors/reflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/valtors/reflow/releases/tag/v1.0.0
