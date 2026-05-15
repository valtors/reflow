import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import {
  type PointerCapabilities,
  getPointerCapabilities,
  observePointerCapabilities,
} from "../core/pointer.js";

export interface PointerInfo {
  hover: Accessor<boolean>;
  anyHover: Accessor<boolean>;
  coarse: Accessor<boolean>;
  fine: Accessor<boolean>;
}

function getServerCapabilities(
  serverDefault?: Partial<{ hover: boolean; anyHover: boolean; coarse: boolean; fine: boolean }>,
): PointerCapabilities {
  return {
    hover: serverDefault?.hover ?? true,
    anyHover: serverDefault?.anyHover ?? true,
    coarse: serverDefault?.coarse ?? false,
    fine: serverDefault?.fine ?? true,
    none: false,
  };
}

export function usePointer(
  serverDefault?: Partial<{ hover: boolean; anyHover: boolean; coarse: boolean; fine: boolean }>,
): PointerInfo {
  const [capabilities, setCapabilities] = createSignal<PointerCapabilities>(
    isServer ? getServerCapabilities(serverDefault) : getPointerCapabilities(),
  );
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setCapabilities(getPointerCapabilities());
    unsubscribe = observePointerCapabilities((next) => {
      setCapabilities(next);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return {
    hover: () => capabilities().hover,
    anyHover: () => capabilities().anyHover,
    coarse: () => capabilities().coarse,
    fine: () => capabilities().fine,
  };
}
