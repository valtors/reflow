import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { BreakpointMap } from "../core/breakpoints.js";
import { type ResponsiveValue, resolveResponsive } from "../core/responsive-value.js";
import { useFluidityContext } from "./context.js";

export function useResponsiveValue<T, B extends BreakpointMap>(
  value: ResponsiveValue<T, B>,
): Signal<T | undefined> {
  const { store, system } = useFluidityContext();
  const result = useSignal<T | undefined>(undefined);

  useVisibleTask$(({ cleanup }) => {
    const sync = () => {
      const snap = store.getSnapshot();
      result.value = resolveResponsive(
        system as unknown as Parameters<typeof resolveResponsive<T, B>>[0],
        value,
        snap.width,
      );
    };
    sync();
    const unsubscribe = store.subscribe(sync);
    cleanup(unsubscribe);
  });

  return result;
}
