import {
  DestroyRef,
  PLATFORM_ID,
  type Signal,
  type WritableSignal,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEvent } from "rxjs";
import { mediaQuerySignal } from "./media-query.signal.js";
import { isBrowserPlatform } from "./platform.js";

export type ColorScheme = "light" | "dark";

export interface ColorSchemeSignalOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

export interface ColorSchemeSignalResult {
  colorScheme: Signal<ColorScheme>;
  isDark: Signal<boolean>;
  override: Signal<ColorScheme | null>;
  setColorScheme(scheme: ColorScheme | null): void;
}

const DEFAULT_OVERRIDE_KEY = "__fluidity-color-scheme__";
const overrideSignals = new Map<string, WritableSignal<ColorScheme | null>>();

function readStoredScheme(storageKey: string): ColorScheme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function writeStoredScheme(storageKey: string, value: ColorScheme | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, value);
  } catch {
    // Storage access can fail in restricted environments.
  }
}

function getOverrideSignal(key: string) {
  let current = overrideSignals.get(key);
  if (!current) {
    current = signal<ColorScheme | null>(null);
    overrideSignals.set(key, current);
  }
  return current;
}

export function colorSchemeSignal(options: ColorSchemeSignalOptions = {}): ColorSchemeSignalResult {
  const { serverDefault = "light", storageKey } = options;
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const browser = isBrowserPlatform(platformId);
  const systemDark = mediaQuerySignal("(prefers-color-scheme: dark)", serverDefault === "dark");
  const overrideKey = storageKey ?? DEFAULT_OVERRIDE_KEY;
  const overrideState = getOverrideSignal(overrideKey);
  const override = overrideState.asReadonly();

  if (browser && storageKey) {
    overrideState.set(readStoredScheme(storageKey));
  }

  if (browser && storageKey) {
    effect(() => {
      writeStoredScheme(storageKey, overrideState());
    });

    afterNextRender(() => {
      fromEvent<StorageEvent>(window, "storage")
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((event) => {
          if (event.key === storageKey) {
            overrideState.set(readStoredScheme(storageKey));
          }
        });
    });
  }

  const colorScheme = computed<ColorScheme>(() => override() ?? (systemDark() ? "dark" : "light"));

  return {
    colorScheme,
    isDark: computed(() => colorScheme() === "dark"),
    override,
    setColorScheme: (scheme) => {
      overrideState.set(scheme);
    },
  };
}
