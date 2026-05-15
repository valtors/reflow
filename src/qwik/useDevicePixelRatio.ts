import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";

export function useDevicePixelRatio(serverDefault = 1): Signal<number> {
  const dpr = useSignal(serverDefault);

  useVisibleTask$(({ cleanup }) => {
    dpr.value = getDevicePixelRatio();
    const unsubscribe = observeDevicePixelRatio((next) => {
      dpr.value = next;
    });

    cleanup(unsubscribe);
  });

  return dpr;
}
