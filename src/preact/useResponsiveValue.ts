"use client";

import { useEffect, useState } from "preact/hooks";
import type { BreakpointMap } from "../core/breakpoints.js";
import { type ResponsiveValue, resolveResponsive } from "../core/responsive-value.js";
import { useFluidityContext } from "./context.js";

export function useResponsiveValue<T, B extends BreakpointMap>(
  value: ResponsiveValue<T, B>,
): T | undefined {
  const { store, system } = useFluidityContext<B>();
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? store.getServerSnapshot().width : store.getSnapshot().width,
  );

  useEffect(() => {
    setWidth(store.getSnapshot().width);
    return store.subscribe(() => {
      setWidth(store.getSnapshot().width);
    });
  }, [store]);

  return resolveResponsive(
    system as unknown as Parameters<typeof resolveResponsive<T, B>>[0],
    value,
    width,
  );
}
