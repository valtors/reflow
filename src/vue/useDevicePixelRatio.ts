import { type Ref, getCurrentInstance, onMounted, onUnmounted, readonly, ref } from "vue";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";

/**
 * Track device pixel ratio reactively. SSR-safe.
 */
export function useDevicePixelRatio(serverDefault = 1): Readonly<Ref<number>> {
  const dpr = ref(typeof window !== "undefined" ? getDevicePixelRatio() : serverDefault);

  if (getCurrentInstance()) {
    let unsub: (() => void) | undefined;
    onMounted(() => {
      dpr.value = getDevicePixelRatio();
      unsub = observeDevicePixelRatio(() => {
        dpr.value = getDevicePixelRatio();
      });
    });
    onUnmounted(() => {
      unsub?.();
    });
  }

  return readonly(dpr);
}
