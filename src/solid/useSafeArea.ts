import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../core/safe-area.js";

const ZERO: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export interface UseSafeAreaResult {
  insets: Accessor<SafeAreaInsets>;
  top: Accessor<number>;
  right: Accessor<number>;
  bottom: Accessor<number>;
  left: Accessor<number>;
}

export function useSafeArea(serverDefault: SafeAreaInsets = ZERO): UseSafeAreaResult {
  const [insets, setInsets] = createSignal<SafeAreaInsets>(
    isServer ? serverDefault : getSafeArea(),
  );
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setInsets(getSafeArea());
    unsubscribe = observeSafeArea((nextInsets) => {
      setInsets(nextInsets);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return {
    insets,
    top: () => insets().top,
    right: () => insets().right,
    bottom: () => insets().bottom,
    left: () => insets().left,
  };
}
