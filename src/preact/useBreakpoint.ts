"use client";

import { useEffect, useMemo, useState } from "preact/hooks";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import type { FluidityStoreSnapshot } from "../core/store.js";
import { useFluidityContext } from "./context.js";

export interface UseBreakpointResult<B extends BreakpointMap> {
  active: BreakpointKey<B>;
  is(key: BreakpointKey<B>): boolean;
  above(key: BreakpointKey<B>): boolean;
  below(key: BreakpointKey<B>): boolean;
  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean;
}

function getInitialSnapshot<B extends BreakpointMap>(
  getSnapshot: () => FluidityStoreSnapshot<B>,
  getServerSnapshot: () => FluidityStoreSnapshot<B>,
) {
  return typeof window === "undefined" ? getServerSnapshot() : getSnapshot();
}

export function useBreakpoint<B extends BreakpointMap>(): UseBreakpointResult<B> {
  const { store, system } = useFluidityContext<B>();
  const [snapshot, setSnapshot] = useState(() =>
    getInitialSnapshot(store.getSnapshot, store.getServerSnapshot),
  );

  useEffect(() => {
    setSnapshot(store.getSnapshot());
    return store.subscribe(() => {
      setSnapshot(store.getSnapshot());
    });
  }, [store]);

  const active = snapshot.active as BreakpointKey<B>;
  const keys = system.keys as ReadonlyArray<BreakpointKey<B>>;
  const activeIndex = keys.indexOf(active);

  return useMemo(
    () => ({
      active,
      is: (key) => active === key,
      above: (key) => keys.indexOf(key) <= activeIndex,
      below: (key) => activeIndex < keys.indexOf(key),
      between: (min, max) => {
        const start = keys.indexOf(min);
        const end = keys.indexOf(max);
        return activeIndex >= start && activeIndex < end;
      },
    }),
    [active, activeIndex, keys],
  );
}
