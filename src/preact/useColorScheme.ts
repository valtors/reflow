"use client";

import { useCallback, useEffect, useState } from "preact/hooks";
import { usePreference } from "./usePreference.js";

export type ColorScheme = "light" | "dark";

export interface UseColorSchemeOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

export interface UseColorSchemeResult {
  colorScheme: ColorScheme;
  isDark: boolean;
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
    const value = window.localStorage.getItem(storageKey);
    if (value === "dark" || value === "light") {
      overrideSchemes.set(overrideKey, value);
      return;
    }
    if (!overrideListeners.get(overrideKey)?.size) {
      overrideSchemes.delete(overrideKey);
    }
  } catch {
    // Storage unavailable
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
  for (const listener of overrideListeners.get(overrideKey) ?? []) listener();
}

function writeStorage(key: string | undefined, value: ColorScheme | null) {
  if (!isBrowser || !key) return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable
  }
}

function readOverride(overrideKey: string, storageKey: string | undefined) {
  syncOverrideScheme(overrideKey, storageKey);
  return getOverrideScheme(overrideKey);
}

export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);
  const systemIsDark = usePreference("dark", serverDefault === "dark");
  const [override, setOverride] = useState<ColorSchemeOverride>(() =>
    readOverride(overrideKey, storageKey),
  );

  useEffect(() => {
    const sync = () => {
      syncOverrideScheme(overrideKey, storageKey);
      setOverride(getOverrideScheme(overrideKey));
    };

    sync();
    const unsubscribe = subscribeOverrideListener(overrideKey, sync);

    if (!isBrowser || !storageKey) {
      return unsubscribe;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      syncOverrideScheme(overrideKey, storageKey);
      notifyOverrideListeners(overrideKey);
    };

    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [overrideKey, storageKey]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme | null) => {
      setOverrideScheme(overrideKey, scheme);
      writeStorage(storageKey, scheme);
      notifyOverrideListeners(overrideKey);
    },
    [overrideKey, storageKey],
  );

  const colorScheme = override ?? (systemIsDark ? "dark" : "light");
  return {
    colorScheme,
    isDark: colorScheme === "dark",
    setColorScheme,
  };
}
