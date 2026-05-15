import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { getPreference, observePreference } from "../core/preferences.js";

export type ColorScheme = "light" | "dark";

export interface UseColorSchemeOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

export interface UseColorSchemeResult {
  colorScheme: Accessor<ColorScheme>;
  isDark: Accessor<boolean>;
  setColorScheme: (scheme: ColorScheme | null) => void;
}

const DEFAULT_OVERRIDE_KEY = "__fluidity-color-scheme__";
const overrideSchemes = new Map<string, ColorScheme | null>();
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
  if (isServer || !storageKey) return;

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
    // Storage unavailable.
  }
}

function setOverrideScheme(overrideKey: string, scheme: ColorScheme | null) {
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
  for (const listener of overrideListeners.get(overrideKey) ?? []) {
    listener();
  }
}

function writeStorage(storageKey: string | undefined, scheme: ColorScheme | null) {
  if (isServer || !storageKey) return;

  try {
    if (scheme === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, scheme);
    }
  } catch {
    // Storage unavailable.
  }
}

export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);

  syncOverrideScheme(overrideKey, storageKey);

  const [systemIsDark, setSystemIsDark] = createSignal(
    isServer ? serverDefault === "dark" : getPreference("dark"),
  );
  const [override, setOverride] = createSignal<ColorScheme | null>(getOverrideScheme(overrideKey));
  let unsubscribePreference: (() => void) | undefined;
  let unsubscribeOverride: (() => void) | undefined;

  onMount(() => {
    setSystemIsDark(getPreference("dark"));
    setOverride(getOverrideScheme(overrideKey));

    unsubscribePreference = observePreference("dark", (matches) => {
      setSystemIsDark(matches);
    });

    unsubscribeOverride = subscribeOverrideListener(overrideKey, () => {
      setOverride(getOverrideScheme(overrideKey));
    });
  });

  onCleanup(() => {
    unsubscribePreference?.();
    unsubscribeOverride?.();
  });

  const colorScheme = () => override() ?? (systemIsDark() ? "dark" : "light");
  const isDark = () => colorScheme() === "dark";

  const setColorScheme = (scheme: ColorScheme | null) => {
    setOverrideScheme(overrideKey, scheme);
    setOverride(getOverrideScheme(overrideKey));
    writeStorage(storageKey, scheme);
    notifyOverrideListeners(overrideKey);
  };

  return {
    colorScheme,
    isDark,
    setColorScheme,
  };
}
