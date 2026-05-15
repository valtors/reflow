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
import { watchMedia } from "../core/media.js";
import { isBrowserPlatform } from "./platform.js";

export function mediaQuerySignal(query: string, serverDefault = false): Signal<boolean> {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const matches = signal(serverDefault);

  if (!isBrowserPlatform(platformId)) {
    return matches.asReadonly();
  }

  afterNextRender(() => {
    const watcher = watchMedia(query);
    matches.set(watcher.matches());

    fromEventPattern<boolean>(
      (handler) => watcher.subscribe((value) => handler(value)),
      (_handler, unsubscribe) => {
        unsubscribe?.();
      },
    )
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((value) => {
        matches.set(value);
      });
  });

  return matches.asReadonly();
}
