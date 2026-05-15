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
import {
  type PointerCapabilities,
  getPointerCapabilities,
  observePointerCapabilities,
} from "../core/pointer.js";
import { isBrowserPlatform } from "./platform.js";

const DEFAULT_POINTER: PointerCapabilities = {
  hover: true,
  anyHover: true,
  coarse: false,
  fine: true,
  none: false,
};

export interface PointerSignalResult {
  state: Signal<PointerCapabilities>;
  hover: Signal<boolean>;
  anyHover: Signal<boolean>;
  coarse: Signal<boolean>;
  fine: Signal<boolean>;
  none: Signal<boolean>;
}

export function pointerSignal(
  serverDefault: Partial<PointerCapabilities> = {},
): PointerSignalResult {
  const platformId = inject(PLATFORM_ID);
  const destroyRef = inject(DestroyRef);
  const state = signal<PointerCapabilities>({
    ...DEFAULT_POINTER,
    ...serverDefault,
  });

  if (isBrowserPlatform(platformId)) {
    afterNextRender(() => {
      state.set(getPointerCapabilities());

      fromEventPattern<PointerCapabilities>(
        (handler) => observePointerCapabilities((value) => handler(value)),
        (_handler, unsubscribe) => {
          unsubscribe?.();
        },
      )
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((value) => {
          state.set(value);
        });
    });
  }

  return {
    state: state.asReadonly(),
    hover: computed(() => state().hover),
    anyHover: computed(() => state().anyHover),
    coarse: computed(() => state().coarse),
    fine: computed(() => state().fine),
    none: computed(() => state().none),
  };
}
