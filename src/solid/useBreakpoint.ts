import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { useFluidityContext } from "./context.js";

export interface UseBreakpointResult<B extends BreakpointMap> {
  active: Accessor<BreakpointKey<B>>;
  is(key: BreakpointKey<B>): boolean;
  above(key: BreakpointKey<B>): boolean;
  below(key: BreakpointKey<B>): boolean;
  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean;
}

export function useBreakpoint<B extends BreakpointMap>(): UseBreakpointResult<B> {
  const { store, system } = useFluidityContext<B>();
  const [active, setActive] = createSignal<BreakpointKey<B>>(
    store.getSnapshot().active as BreakpointKey<B>,
  );
  const keys = (system as unknown as { keys: ReadonlyArray<BreakpointKey<B>> }).keys;

  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setActive(() => store.getSnapshot().active as BreakpointKey<B>);
    unsubscribe = store.subscribe(() => {
      setActive(() => store.getSnapshot().active as BreakpointKey<B>);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  const activeIndex = () => keys.indexOf(active());

  return {
    active,
    is: (key) => active() === key,
    above: (key) => keys.indexOf(key) <= activeIndex(),
    below: (key) => activeIndex() < keys.indexOf(key),
    between: (min, max) => {
      const minIndex = keys.indexOf(min);
      const maxIndex = keys.indexOf(max);
      return activeIndex() >= minIndex && activeIndex() < maxIndex;
    },
  };
}
