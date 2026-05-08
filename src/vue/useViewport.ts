import { type Ref, computed, getCurrentInstance, onMounted, onUnmounted, shallowRef } from "vue";
import { useFluidityContext } from "./context.js";

export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

/**
 * Reactive viewport dimensions composable. SSR-safe.
 */
export function useViewport(): {
  readonly width: Ref<number>;
  readonly height: Ref<number>;
  readonly orientation: Ref<"portrait" | "landscape">;
} {
  const { store } = useFluidityContext();
  const snapshot = shallowRef(store.getSnapshot());

  if (getCurrentInstance()) {
    let unsub: (() => void) | undefined;
    onMounted(() => {
      snapshot.value = store.getSnapshot();
      unsub = store.subscribe(() => {
        snapshot.value = store.getSnapshot();
      });
    });
    onUnmounted(() => {
      unsub?.();
    });
  }

  return {
    width: computed(() => snapshot.value.width) as Ref<number>,
    height: computed(() => snapshot.value.height) as Ref<number>,
    orientation: computed(() => snapshot.value.orientation) as Ref<"portrait" | "landscape">,
  };
}
