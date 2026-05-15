import {
  DestroyRef,
  PLATFORM_ID,
  type Signal,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEventPattern } from "rxjs";
import { type PreferenceKey, getPreference, observePreference } from "../core/preferences.js";
import { isBrowserPlatform } from "./platform.js";

export const PREFERENCE_KEYS = [
  "reducedMotion",
  "reducedData",
  "moreContrast",
  "lessContrast",
  "forcedColors",
  "invertedColors",
  "dark",
  "light",
] as const satisfies readonly PreferenceKey[];

export function preferenceSignal(key: PreferenceKey, serverDefault = false): Signal<boolean> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const value = signal(serverDefault);

  if (!isBrowserPlatform(platformId)) {
    return value.asReadonly();
  }

  afterNextRender(() => {
    value.set(getPreference(key));

    fromEventPattern<boolean>(
      (handler) => observePreference(key, (matches) => handler(matches)),
      (_handler, unsubscribe) => {
        unsubscribe?.();
      },
    )
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((matches) => {
        value.set(matches);
      });
  });

  return value.asReadonly();
}

export function preferenceSignals() {
  const entries = PREFERENCE_KEYS.map((key) => [key, preferenceSignal(key)] as const);
  const record = Object.fromEntries(entries) as Record<PreferenceKey, Signal<boolean>>;

  return {
    values: record,
    darkMode: computed(() => record.dark()),
    reducedMotion: computed(() => record.reducedMotion()),
  };
}
