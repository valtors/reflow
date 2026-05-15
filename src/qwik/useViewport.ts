import { type Signal, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useFluidityContext } from "./context.js";

export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

export function useViewport(): {
  width: Signal<number>;
  height: Signal<number>;
  orientation: Signal<"portrait" | "landscape">;
} {
  const { store } = useFluidityContext();
  const serverSnapshot = store.getServerSnapshot();
  const snapshot = useSignal<ViewportState>({
    width: serverSnapshot.width,
    height: serverSnapshot.height,
    orientation: serverSnapshot.orientation,
  });

  useVisibleTask$(({ cleanup }) => {
    const sync = () => {
      const next = store.getSnapshot();
      snapshot.value = {
        width: next.width,
        height: next.height,
        orientation: next.orientation,
      };
    };

    sync();
    const unsubscribe = store.subscribe(sync);
    cleanup(unsubscribe);
  });

  return {
    width: useComputed$(() => snapshot.value.width),
    height: useComputed$(() => snapshot.value.height),
    orientation: useComputed$(() => snapshot.value.orientation),
  };
}
