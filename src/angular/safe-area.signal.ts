import {
  DestroyRef,
  PLATFORM_ID,
  type Signal,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEventPattern } from "rxjs";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../core/safe-area.js";
import { isBrowserPlatform } from "./platform.js";

const ZERO_SAFE_AREA: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function safeAreaSignal(
  serverDefault: SafeAreaInsets = ZERO_SAFE_AREA,
): Signal<SafeAreaInsets> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const insets = signal<SafeAreaInsets>(serverDefault);

  if (!isBrowserPlatform(platformId)) {
    return insets.asReadonly();
  }

  afterNextRender(() => {
    insets.set(getSafeArea());

    fromEventPattern<SafeAreaInsets>(
      (handler) => observeSafeArea((value) => handler(value)),
      (_handler, unsubscribe) => {
        unsubscribe?.();
      },
    )
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((value) => {
        insets.set(value);
      });
  });

  return insets.asReadonly();
}
