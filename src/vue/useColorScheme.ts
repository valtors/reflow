import { type Ref, computed, getCurrentInstance, onMounted, onUnmounted, readonly, ref } from "vue";
import { mq, watchMedia } from "../core/media.js";

export type ColorScheme = "light" | "dark";

export interface UseColorSchemeOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

export interface UseColorSchemeResult {
  colorScheme: Readonly<Ref<ColorScheme>>;
  isDark: Readonly<Ref<boolean>>;
  setColorScheme: (scheme: ColorScheme | null) => void;
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

function notifyOverride(overrideKey: string) {
  for (const listener of overrideListeners.get(overrideKey) ?? []) listener();
}

function writeStorage(key?: string, value?: ColorScheme | null) {
  if (!isBrowser || !key) return;
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable.
  }
}

/**
 * SSR-safe color scheme composable with optional persistence.
 */
export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeResult {
  const { serverDefault = "light", storageKey } = options;
  const overrideKey = getOverrideKey(storageKey);

  syncOverrideScheme(overrideKey, storageKey);

  const systemWatcher = isBrowser ? watchMedia(mq.prefersDark) : null;
  const systemDark = ref(systemWatcher ? systemWatcher.matches() : serverDefault === "dark");
  const override = ref<ColorScheme | null>(getOverrideScheme(overrideKey));

  const colorScheme = computed<ColorScheme>(
    () => override.value ?? (systemDark.value ? "dark" : "light"),
  );
  const isDark = computed(() => colorScheme.value === "dark");

  if (getCurrentInstance()) {
    let unsubSystem: (() => void) | undefined;
    let unsubOverride: (() => void) | undefined;
    const onOverrideChange = () => {
      override.value = getOverrideScheme(overrideKey);
    };

    onMounted(() => {
      if (systemWatcher) {
        systemDark.value = systemWatcher.matches();
        unsubSystem = systemWatcher.subscribe(() => {
          systemDark.value = systemWatcher.matches();
        });
      }
      unsubOverride = subscribeOverrideListener(overrideKey, onOverrideChange);
      onOverrideChange();
    });

    onUnmounted(() => {
      unsubSystem?.();
      unsubOverride?.();
    });
  }

  const setColorScheme = (scheme: ColorScheme | null) => {
    setOverrideScheme(overrideKey, scheme);
    override.value = getOverrideScheme(overrideKey);
    writeStorage(storageKey, scheme);
    notifyOverride(overrideKey);
  };

  return {
    colorScheme: readonly(colorScheme) as Readonly<Ref<ColorScheme>>,
    isDark: readonly(isDark) as Readonly<Ref<boolean>>,
    setColorScheme,
  };
}
