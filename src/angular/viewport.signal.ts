import { type Signal, computed, inject } from "@angular/core";
import type { BreakpointMap } from "../core/breakpoints.js";
import type { ViewportState } from "../core/viewport.js";
import { FluidityService } from "./fluidity.service.js";

export interface ViewportSignalResult {
  state: Signal<ViewportState>;
  width: Signal<number>;
  height: Signal<number>;
  orientation: Signal<ViewportState["orientation"]>;
}

export function viewportSignal<B extends BreakpointMap = BreakpointMap>(
  service = inject(FluidityService) as unknown as FluidityService<B>,
): ViewportSignalResult {
  const width = computed(() => service.width());
  const height = computed(() => service.height());
  const orientation = computed(() => service.orientation());
  const state = computed<ViewportState>(() => ({
    width: width(),
    height: height(),
    orientation: orientation(),
  }));

  return {
    state,
    width,
    height,
    orientation,
  };
}
