import { type Ref, getCurrentInstance, onMounted, onUnmounted, readonly, shallowRef } from "vue";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../core/safe-area.js";

const ZERO: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Read `env(safe-area-inset-*)` values reactively. SSR-safe.
 */
export function useSafeArea(serverDefault: SafeAreaInsets = ZERO): Readonly<Ref<SafeAreaInsets>> {
  const insets = shallowRef<SafeAreaInsets>({ ...serverDefault });

  if (getCurrentInstance()) {
    let unsub: (() => void) | undefined;
    onMounted(() => {
      insets.value = getSafeArea();
      unsub = observeSafeArea(() => {
        insets.value = getSafeArea();
      });
    });
    onUnmounted(() => {
      unsub?.();
    });
  }

  return readonly(insets) as Readonly<Ref<SafeAreaInsets>>;
}
