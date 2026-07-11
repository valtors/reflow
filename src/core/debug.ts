/**
 * Debug utilities for development. Shows current breakpoint, viewport,
 * preferences, and other responsive state in a compact overlay.
 * Tree-shaken in production builds.
 */

export interface DebugState {
  breakpoint: string;
  viewport: { width: number; height: number };
  orientation: "portrait" | "landscape";
  dpr: number;
  preferences: {
    reducedMotion: boolean;
    dark: boolean;
    highContrast: boolean;
  };
  pointer: string;
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const isProduction = () => typeof process !== "undefined" && process.env?.NODE_ENV === "production";

/** Format debug state as a compact string for logging */
export function formatDebugState(state: DebugState): string {
  const preferences = [
    state.preferences.reducedMotion ? "reduced-motion" : null,
    state.preferences.dark ? "dark" : null,
    state.preferences.highContrast ? "high-contrast" : null,
  ].filter((value): value is string => value !== null);

  return [
    `bp=${state.breakpoint}`,
    `vp=${state.viewport.width}x${state.viewport.height}`,
    `orientation=${state.orientation}`,
    `dpr=${Number(state.dpr.toFixed(2))}`,
    `prefs=${preferences.length > 0 ? preferences.join(",") : "none"}`,
    `pointer=${state.pointer}`,
  ].join(" ");
}

/** Console logger that only logs in development */
export function debugLog(label: string, data: unknown): void {
  if (isProduction()) return;
  console.debug(`[fluidity:${label}]`, data);
}

/** Performance measurement for responsive recalculations */
export interface PerfMark {
  start(): void;
  end(): number;
  average(): number;
}

/**
 * Create a performance marker that tracks elapsed time across multiple samples.
 * Useful for profiling responsive recalculations during development.
 *
 * @param _name - Label for the perf mark (currently unused but reserved for future logging).
 * @returns `{ start, end, average }` methods for measuring code execution.
 */
export function createPerfMark(_name: string): PerfMark {
  let startedAt: number | null = null;
  let total = 0;
  let samples = 0;

  return {
    start() {
      startedAt = now();
    },
    end() {
      if (startedAt === null) return 0;
      const elapsed = now() - startedAt;
      startedAt = null;
      total += elapsed;
      samples += 1;
      return elapsed;
    },
    average() {
      return samples === 0 ? 0 : total / samples;
    },
  };
}
