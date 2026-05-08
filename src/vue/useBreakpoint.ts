import { type Ref, computed, getCurrentInstance, onMounted, onUnmounted, readonly, ref } from "vue";
import type { BreakpointKey, BreakpointMap, BreakpointSystem } from "../core/breakpoints.js";
import { provideBreakpoints, useFluidityContext } from "./context.js";

export interface UseBreakpointResult<B extends BreakpointMap> {
  /** Currently active breakpoint key. */
  active: Readonly<Ref<BreakpointKey<B>>>;
  /** True if active === key. */
  is(key: BreakpointKey<B>): boolean;
  /** True if viewport is at or above the given key. */
  above(key: BreakpointKey<B>): boolean;
  /** True if viewport is strictly below the given key. */
  below(key: BreakpointKey<B>): boolean;
  /** True if viewport is between [min, max). */
  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean;
}

export { provideBreakpoints };
export type { FluidityContext } from "./context.js";

/**
 * SSR-safe breakpoint composable for Vue 3.
 */
export function useBreakpoint<B extends BreakpointMap>(): UseBreakpointResult<B> {
  const { store, system } = useFluidityContext<B>();
  const keys = (system as unknown as { keys: ReadonlyArray<BreakpointKey<B>> }).keys;
  const active = ref(store.getSnapshot().active as BreakpointKey<B>);

  if (getCurrentInstance()) {
    let unsub: (() => void) | undefined;
    onMounted(() => {
      active.value = store.getSnapshot().active as BreakpointKey<B>;
      unsub = store.subscribe(() => {
        active.value = store.getSnapshot().active as BreakpointKey<B>;
      });
    });
    onUnmounted(() => {
      unsub?.();
    });
  }

  const activeIndex = computed(() => keys.indexOf(active.value));

  return {
    active: readonly(active) as Readonly<Ref<BreakpointKey<B>>>,
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
