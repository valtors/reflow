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
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";
import { isBrowserPlatform } from "./platform.js";

export function devicePixelRatioSignal(serverDefault = 1): Signal<number> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const dpr = signal(serverDefault);

  if (!isBrowserPlatform(platformId)) {
    return dpr.asReadonly();
  }

  afterNextRender(() => {
    dpr.set(getDevicePixelRatio());

    fromEventPattern<number>(
      (handler) => observeDevicePixelRatio((value) => handler(value)),
      (_handler, unsubscribe) => {
        unsubscribe?.();
      },
    )
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((value) => {
        dpr.set(value);
      });
  });

  return dpr.asReadonly();
}
