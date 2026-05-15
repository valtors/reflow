import {
  $,
  type QRL,
  type Signal,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { mq, watchMedia } from "../core/media.js";

export type ColorScheme = "light" | "dark";

export interface UseColorSchemeOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

export interface UseColorSchemeResult {
  colorScheme: Signal<ColorScheme>;
  isDark: Signal<boolean>;
  setColorScheme: QRL<(scheme: ColorScheme | null) => void>;
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
  } catch {
    // Storage unavailable.
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
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable.
  }
}

export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);
  const systemDark = useSignal(serverDefault === "dark");
  const override = useSignal<ColorScheme | null>(getOverrideScheme(overrideKey));

  useVisibleTask$(({ cleanup }) => {
    syncOverrideScheme(overrideKey, storageKey);
    override.value = getOverrideScheme(overrideKey);

    const watcher = watchMedia(mq.prefersDark);
    systemDark.value = watcher.matches();

    const unsubscribeSystem = watcher.subscribe((next) => {
      systemDark.value = next;
    });
    const onOverrideChange = () => {
      syncOverrideScheme(overrideKey, storageKey);
      override.value = getOverrideScheme(overrideKey);
    };
    const unsubscribeOverride = subscribeOverrideListener(overrideKey, onOverrideChange);

    cleanup(() => {
      unsubscribeSystem();
      unsubscribeOverride();
    });
  });

  const colorScheme = useComputed$<ColorScheme>(
    () => override.value ?? (systemDark.value ? "dark" : "light"),
  );
  const isDark = useComputed$(() => colorScheme.value === "dark");
  const setColorScheme = $((scheme: ColorScheme | null) => {
    setOverrideScheme(overrideKey, scheme);
    override.value = getOverrideScheme(overrideKey);
    writeStorage(storageKey, scheme);
    notifyOverrideListeners(overrideKey);
  });

  return {
    colorScheme,
    isDark,
    setColorScheme,
  };
}
