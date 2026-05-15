import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { useFluidityContext } from "./context.js";

export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

export interface UseViewportResult {
  width: Accessor<number>;
  height: Accessor<number>;
  orientation: Accessor<"portrait" | "landscape">;
}

export function useViewport(): UseViewportResult {
  const { store } = useFluidityContext();
  const [snapshot, setSnapshot] = createSignal(store.getSnapshot());
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setSnapshot(store.getSnapshot());
    unsubscribe = store.subscribe(() => {
      setSnapshot(store.getSnapshot());
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return {
    width: () => snapshot().width,
    height: () => snapshot().height,
    orientation: () => snapshot().orientation,
  };
}
