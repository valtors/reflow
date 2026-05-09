"use client";

import { useCallback, useSyncExternalStore } from "react";
import { watchMedia } from "../core/media.js";

/**
 * Color scheme values: system-detected or user-overridden.
 *
 * - `"light"` — light mode active
 * - `"dark"` — dark mode active
 */
export type ColorScheme = "light" | "dark";

export interface UseColorSchemeOptions {
  /** Value returned during SSR and before hydration. Default `"light"`. */
  serverDefault?: ColorScheme;
  /**
   * `localStorage` key to persist user overrides. When set, calling
   * `setColorScheme()` writes to storage and the value survives reloads.
   * Pass `undefined` (or omit) to rely purely on the system preference.
   */
  storageKey?: string;
}

export interface UseColorSchemeResult {
  /** The resolved color scheme: user override if set, else system preference. */
  colorScheme: ColorScheme;
  /** `true` when the resolved scheme is `"dark"`. */
  isDark: boolean;
  /** Override the system preference. Pass `null` to clear the override. */
  setColorScheme: (scheme: ColorScheme | null) => void;
}

const isBrowser = typeof window !== "undefined";

type ColorSchemeOverride = ColorScheme | null;

const DEFAULT_OVERRIDE_KEY = "__fluidity-color-scheme__";
const overrideSchemes = new Map<string, ColorSchemeOverride>();
const overrideListeners = new Map<string, Set<() => void>>();

function getOverrideKey(storageKey: string | undefined) {
  return storageKey ?? DEFAULT_OVERRIDE_KEY;
}

function getOverrideScheme(overrideKey: string) {
  return overrideSchemes.get(overrideKey) ?? null;
}

function getOverrideListenerSet(overrideKey: string) {
  let listeners = overrideListeners.get(overrideKey);
  if (!listeners) {
    listeners = new Set<() => void>();
    overrideListeners.set(overrideKey, listeners);
  }
  return listeners;
}

function syncOverrideScheme(overrideKey: string, storageKey: string | undefined) {
  if (!isBrowser || !storageKey) return;
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "dark" || value === "light") {
      overrideSchemes.set(overrideKey, value);
      return;
    }
    if (!overrideListeners.get(overrideKey)?.size) {
      overrideSchemes.delete(overrideKey);
    }
  } catch {
    // Storage unavailable (SSR, iframe, privacy mode)
  }
}

function setOverrideScheme(overrideKey: string, scheme: ColorSchemeOverride) {
  if (scheme === null) {
    overrideSchemes.delete(overrideKey);
    return;
  }
  overrideSchemes.set(overrideKey, scheme);
}

function subscribeOverrideListener(overrideKey: string, listener: () => void) {
  const listeners = getOverrideListenerSet(overrideKey);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      overrideListeners.delete(overrideKey);
    }
  };
}

function notifyOverrideListeners(overrideKey: string) {
  for (const fn of overrideListeners.get(overrideKey) ?? []) fn();
}

function writeStorage(key: string | undefined, value: ColorScheme | null) {
  if (!isBrowser || !key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable
  }
}

/**
 * SSR-safe color scheme hook with optional user override persistence.
 *
 * Without `storageKey`, it simply tracks `prefers-color-scheme` reactively.
 * With `storageKey`, calling `setColorScheme("dark")` persists the override
 * and survives page reloads. Call `setColorScheme(null)` to revert to the
 * system preference.
 *
 * @example
 * ```tsx
 * const { colorScheme, isDark, setColorScheme } = useColorScheme({
 *   storageKey: "theme",
 * });
 *
 * <button onClick={() => setColorScheme(isDark ? "light" : "dark")}>
 *   Toggle {colorScheme}
 * </button>
 * ```
 */
export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);

  syncOverrideScheme(overrideKey, storageKey);

  // System preference via matchMedia
  const systemSubscribe = useCallback(
    (onChange: () => void) => watchMedia("(prefers-color-scheme: dark)").subscribe(onChange),
    [],
  );
  const systemSnapshot = useCallback(
    () => watchMedia("(prefers-color-scheme: dark)").matches(),
    [],
  );
  const systemServerSnapshot = useCallback(() => serverDefault === "dark", [serverDefault]);
  const systemIsDark = useSyncExternalStore(systemSubscribe, systemSnapshot, systemServerSnapshot);

  // Override subscription
  const overrideSubscribe = useCallback(
    (onChange: () => void) => subscribeOverrideListener(overrideKey, onChange),
    [overrideKey],
  );
  const overrideSnapshot = useCallback(() => getOverrideScheme(overrideKey), [overrideKey]);
  const overrideServerSnapshot = useCallback(() => null, []);
  const currentOverride = useSyncExternalStore(
    overrideSubscribe,
    overrideSnapshot,
    overrideServerSnapshot,
  );

  const resolved: ColorScheme = currentOverride ?? (systemIsDark ? "dark" : "light");

  const setColorScheme = useCallback(
    (scheme: ColorScheme | null) => {
      setOverrideScheme(overrideKey, scheme);
      writeStorage(storageKey, scheme);
      notifyOverrideListeners(overrideKey);
    },
    [overrideKey, storageKey],
  );

  return {
    colorScheme: resolved,
    isDark: resolved === "dark",
    setColorScheme,
  };
}
