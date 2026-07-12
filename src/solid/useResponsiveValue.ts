import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import type { BreakpointMap } from "../core/breakpoints.js";
import { type ResponsiveValue, resolveResponsive } from "../core/responsive-value.js";
import { useFluidityContext } from "./context.js";

/**
 * Resolve a responsive value (`T | Partial<Record<BreakpointKey, T>>`) to
 * the value matching the current breakpoint, with mobile-first fallback.
 */
export function useResponsiveValue<T, B extends BreakpointMap>(
  value: ResponsiveValue<T, B>,
): Accessor<T | undefined> {
  const { store, system } = useFluidityContext<B>();
  const [result, setResult] = createSignal<T | undefined>(
    resolveResponsive(
      system as unknown as Parameters<typeof resolveResponsive<T, B>>[0],
      value,
      store.getSnapshot().width,
    ),
  );

  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setResult(() =>
      resolveResponsive(
        system as unknown as Parameters<typeof resolveResponsive<T, B>>[0],
        value,
        store.getSnapshot().width,
      ),
    );
    unsubscribe = store.subscribe(() => {
      setResult(() =>
        resolveResponsive(
          system as unknown as Parameters<typeof resolveResponsive<T, B>>[0],
          value,
          store.getSnapshot().width,
        ),
      );
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return result;
}
