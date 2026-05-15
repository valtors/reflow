import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../core/safe-area.js";

const ZERO: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function useSafeArea(serverDefault: SafeAreaInsets = ZERO): Signal<SafeAreaInsets> {
  const insets = useSignal<SafeAreaInsets>({ ...serverDefault });

  useVisibleTask$(({ cleanup }) => {
    insets.value = getSafeArea();
    const unsubscribe = observeSafeArea((next) => {
      insets.value = next;
    });

    cleanup(unsubscribe);
  });

  return insets;
}
