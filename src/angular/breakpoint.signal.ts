import { type Signal, computed, inject } from "@angular/core";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { FluidityService } from "./fluidity.service.js";

export interface BreakpointSignalResult<B extends BreakpointMap = BreakpointMap> {
  active: Signal<BreakpointKey<B>>;
  is(key: BreakpointKey<B>): Signal<boolean>;
  above(key: BreakpointKey<B>): Signal<boolean>;
  below(key: BreakpointKey<B>): Signal<boolean>;
  between(min: BreakpointKey<B>, max: BreakpointKey<B>): Signal<boolean>;
  only(key: BreakpointKey<B>): Signal<boolean>;
}

export function breakpointSignal<B extends BreakpointMap = BreakpointMap>(
  service = inject(FluidityService) as unknown as FluidityService<B>,
): BreakpointSignalResult<B> {
  const active = computed(() => service.active() as BreakpointKey<B>);
  const keys = service.keys as ReadonlyArray<BreakpointKey<B>>;

  const indexOf = (key: BreakpointKey<B>) => keys.indexOf(key);

  return {
    active,
    is: (key) => computed(() => active() === key),
    above: (key) => computed(() => indexOf(key) <= indexOf(active())),
    below: (key) => computed(() => indexOf(active()) < indexOf(key)),
    between: (min, max) =>
      computed(() => {
        const activeIndex = indexOf(active());
        return activeIndex >= indexOf(min) && activeIndex < indexOf(max);
      }),
    only: (key) => computed(() => active() === key),
  };
}
