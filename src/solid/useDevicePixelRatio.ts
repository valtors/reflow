import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";

export function useDevicePixelRatio(serverDefault = 1): Accessor<number> {
  const [devicePixelRatio, setDevicePixelRatio] = createSignal(
    isServer ? serverDefault : getDevicePixelRatio(),
  );
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setDevicePixelRatio(getDevicePixelRatio());
    unsubscribe = observeDevicePixelRatio((next) => {
      setDevicePixelRatio(next);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return devicePixelRatio;
}
