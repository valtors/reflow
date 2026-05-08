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

let overrideScheme: ColorScheme | null = null;
const overrideListeners = new Set<() => void>();

function notifyOverride() {
  for (const listener of overrideListeners) listener();
}

function readStorage(key?: string): ColorScheme | null {
  if (!isBrowser || !key) return null;
  try {
    const value = localStorage.getItem(key);
    if (value === "dark" || value === "light") return value;
  } catch {
    // Storage unavailable.
  }
  return null;
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

  if (isBrowser && overrideScheme === null && storageKey) {
    overrideScheme = readStorage(storageKey);
  }

  const systemWatcher = isBrowser ? watchMedia(mq.prefersDark) : null;
  const systemDark = ref(systemWatcher ? systemWatcher.matches() : serverDefault === "dark");
  const override = ref<ColorScheme | null>(overrideScheme);

  const colorScheme = computed<ColorScheme>(
    () => override.value ?? (systemDark.value ? "dark" : "light"),
  );
  const isDark = computed(() => colorScheme.value === "dark");

  if (getCurrentInstance()) {
    let unsubSystem: (() => void) | undefined;
    const onOverrideChange = () => {
      override.value = overrideScheme;
    };

    onMounted(() => {
      if (systemWatcher) {
        systemDark.value = systemWatcher.matches();
        unsubSystem = systemWatcher.subscribe(() => {
          systemDark.value = systemWatcher.matches();
        });
      }
      overrideListeners.add(onOverrideChange);
      onOverrideChange();
    });

    onUnmounted(() => {
      unsubSystem?.();
      overrideListeners.delete(onOverrideChange);
    });
  }

  const setColorScheme = (scheme: ColorScheme | null) => {
    overrideScheme = scheme;
    override.value = scheme;
    writeStorage(storageKey, scheme);
    notifyOverride();
  };

  return {
    colorScheme: readonly(colorScheme) as Readonly<Ref<ColorScheme>>,
    isDark: readonly(isDark) as Readonly<Ref<boolean>>,
    setColorScheme,
  };
}
