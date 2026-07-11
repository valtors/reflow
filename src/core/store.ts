import type { BreakpointKey, BreakpointMap, BreakpointSystem } from "./breakpoints.js";
import type { Preferences } from "./preferences.js";

/**
 * Snapshot of the current responsive state held by a fluidity store.
 */
export interface FluidityStoreSnapshot<B extends BreakpointMap> {
  width: number;
  height: number;
  active: BreakpointKey<B>;
  orientation: "portrait" | "landscape";
}

/**
 * Shared reactive store backing all framework hooks. Designed for
 * `useSyncExternalStore` — `getSnapshot` returns a referentially-stable
 * object until something actually changes.
 */
export interface FluidityStore<B extends BreakpointMap> {
  readonly system: BreakpointSystem<B>;
  getSnapshot(): FluidityStoreSnapshot<B>;
  /** Server snapshot — must be referentially stable. */
  getServerSnapshot(): FluidityStoreSnapshot<B>;
  subscribe(listener: () => void): () => void;
  /** Update the server snapshot at SSR time (provider sets this). */
  setServerSnapshot(snap: Partial<FluidityStoreSnapshot<B>>): void;
}

const isBrowser = (): boolean => typeof window !== "undefined";

function buildSnapshot<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  width: number,
  height: number,
): FluidityStoreSnapshot<B> {
  return {
    width,
    height,
    active: system.resolve(width),
    orientation: height >= width ? "portrait" : "landscape",
  };
}

/**
 * Create a shared fluidity store that tracks viewport, breakpoint,
 * and orientation changes. Used internally by every framework adapter.
 *
 * @param system - A breakpoint system created by `createBreakpoints`.
 * @param options - Optional `{ initialWidth, initialHeight, debounce }`.
 * @returns A `FluidityStore` instance for `useSyncExternalStore`.
 */
export function createFluidityStore<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options: {
    initialWidth?: number;
    initialHeight?: number;
    debounce?: number;
  } = {},
): FluidityStore<B> {
  const initialWidth = options.initialWidth ?? (isBrowser() ? window.innerWidth : 1024);
  const initialHeight = options.initialHeight ?? (isBrowser() ? window.innerHeight : 768);

  let snapshot: FluidityStoreSnapshot<B> = buildSnapshot(system, initialWidth, initialHeight);
  let serverSnapshot: FluidityStoreSnapshot<B> = snapshot;
  const listeners = new Set<() => void>();
  let resizeAttached = false;
  let detach: (() => void) | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const recompute = () => {
    if (!isBrowser()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === snapshot.width && h === snapshot.height) return;
    snapshot = buildSnapshot(system, w, h);
    for (const l of listeners) l();
  };

  const attach = () => {
    if (resizeAttached || !isBrowser()) return;
    resizeAttached = true;

    const onResize = () => {
      if (options.debounce) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(recompute, options.debounce);
      } else {
        requestAnimationFrame(recompute);
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    recompute();
    detach = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (timeoutId) clearTimeout(timeoutId);
      resizeAttached = false;
    };
  };

  return {
    system,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    setServerSnapshot(partial) {
      const merged: FluidityStoreSnapshot<B> = {
        ...serverSnapshot,
        ...partial,
      };
      if (partial.width !== undefined || partial.height !== undefined) {
        serverSnapshot = buildSnapshot(system, merged.width, merged.height);
      } else {
        serverSnapshot = merged;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      attach();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          detach?.();
          detach = null;
        }
      };
    },
  };
}

export type { Preferences };
