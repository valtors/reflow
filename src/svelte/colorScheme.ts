import { derived, readable } from "svelte/store";
import type { Readable } from "svelte/store";
import { watchMedia } from "../core/media.js";

export type ColorScheme = "light" | "dark";

export interface ColorSchemeOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

const isBrowser = typeof window !== "undefined";

type ColorSchemeOverride = ColorScheme | null;

const DEFAULT_OVERRIDE_KEY = "__fluidity-color-scheme__";
const overrideSchemes = new Map<string, ColorSchemeOverride>();
const overrideListeners = new Map<string, Set<() => void>>();

function getOverrideKey(storageKey?: string) {
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

function syncOverrideScheme(overrideKey: string, storageKey?: string) {
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
  } catch {}
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
  for (const listener of overrideListeners.get(overrideKey) ?? []) listener();
}

function writeStorage(key?: string, value?: ColorScheme | null) {
  if (!isBrowser || !key) return;
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

/**
 * Color scheme store with optional persistence.
 *
 * @example
 * ```svelte
 * <script>
 *   import { colorScheme } from 'fluidity-ts/svelte';
 *   const { scheme, isDark, set } = colorScheme({ storageKey: 'theme' });
 * </script>
 * <button on:click={() => set($isDark ? 'light' : 'dark')}>
 *   {$scheme}
 * </button>
 * ```
 */
export function colorScheme(options: ColorSchemeOptions = {}) {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);

  syncOverrideScheme(overrideKey, storageKey);

  const systemDark: Readable<boolean> = readable(
    isBrowser ? watchMedia("(prefers-color-scheme: dark)").matches() : serverDefault === "dark",
    (set) => {
      if (!isBrowser) return;
      const watcher = watchMedia("(prefers-color-scheme: dark)");
      set(watcher.matches());
      return watcher.subscribe(() => set(watcher.matches()));
    },
  );

  const override: Readable<ColorScheme | null> = readable(getOverrideScheme(overrideKey), (set) => {
    const onChange = () => set(getOverrideScheme(overrideKey));
    const unsubscribe = subscribeOverrideListener(overrideKey, onChange);
    onChange();
    return unsubscribe;
  });
  const scheme = derived(
    [override, systemDark],
    ([$override, $systemDark]) => ($override ?? ($systemDark ? "dark" : "light")) as ColorScheme,
  );
  const isDark = derived(scheme, ($scheme) => $scheme === "dark");

  const set = (value: ColorScheme | null) => {
    setOverrideScheme(overrideKey, value);
    writeStorage(storageKey, value);
    notifyOverrideListeners(overrideKey);
  };

  return { scheme, isDark, set };
}
