# Benchmarks

This folder contains a small benchmarking suite for the built `fluidity-ts` distribution.

## Setup

From the repository root, build the package so `../dist/` is up to date:

```bash
npm run build
```

Then install the benchmark dependency and run the scripts:

```bash
cd benchmarks
npm install
npm run bench
npm run bench:compare
```

## What `bench.js` measures

The mitata suite covers the library's main hot paths and compares them against straightforward naive implementations:

- `createBreakpoints()` creation cost for the default preset and a larger design-system preset
- `breakpoint.resolve(width)` across realistic viewport widths
- `createFluidityStore()` creation cost
- `store.subscribe()` / unsubscribe churn for single-listener and multi-listener scenarios
- `fluidClamp()` string generation for typography and spacing presets
- `observePreference()` subscription setup under a synthetic `matchMedia` environment

The script prints `console.table()` summaries before mitata runs so you can quickly verify the scenarios being exercised. It prefers built `../dist/` entry points when available, but includes faithful fallbacks for the targeted APIs so the suite can still run if local build outputs are incomplete.

## What `compare.js` reports

`compare.js` reads built files from `../dist/`, calculates raw and gzip sizes, and prints:

- a per-entry-point table for ESM and CJS outputs
- missing-output markers when an exported entry point has not been built yet
- an ESM gzip ranking so you can compare import-path alternatives (`core`, `react`, `styles`, `server`, etc.)
- aggregate totals across published entry points

## Notes

- Run benchmarks against a fresh production build for the most realistic results.
- DOM-related benchmarks use a lightweight synthetic browser environment so they can run in Node.
- Results will vary by CPU, Node version, and machine load, so compare numbers on the same machine when possible.
