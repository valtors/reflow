import { type Signal, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { provideBreakpoints, useFluidityContext } from "./context.js";

export interface UseBreakpointResult<B extends BreakpointMap> {
  active: Signal<BreakpointKey<B>>;
  is(key: BreakpointKey<B>): boolean;
  above(key: BreakpointKey<B>): boolean;
  below(key: BreakpointKey<B>): boolean;
  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean;
}

export { provideBreakpoints };
export type { FluidityContext } from "./context.js";

export function useBreakpoint<B extends BreakpointMap>(): UseBreakpointResult<B> {
  const { store, system } = useFluidityContext<B>();
  const keys = (system as unknown as { keys: ReadonlyArray<BreakpointKey<B>> }).keys;
  const active = useSignal(store.getServerSnapshot().active as BreakpointKey<B>);

  useVisibleTask$(({ cleanup }) => {
    const sync = () => {
      active.value = store.getSnapshot().active as BreakpointKey<B>;
    };

    sync();
    const unsubscribe = store.subscribe(sync);
    cleanup(unsubscribe);
  });

  const activeIndex = useComputed$(() => keys.indexOf(active.value));

  return {
    active,
    is: (key) => active.value === key,
    above: (key) => keys.indexOf(key) <= activeIndex.value,
    below: (key) => activeIndex.value < keys.indexOf(key),
    between: (min, max) => {
      const minIndex = keys.indexOf(min);
      const maxIndex = keys.indexOf(max);
      return activeIndex.value >= minIndex && activeIndex.value < maxIndex;
    },
  };
}
