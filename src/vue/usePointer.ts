import type { Ref } from "vue";
import { mq } from "../core/media.js";
import { useMediaQuery } from "./useMediaQuery.js";

export interface PointerInfo {
  hover: Readonly<Ref<boolean>>;
  anyHover: Readonly<Ref<boolean>>;
  coarse: Readonly<Ref<boolean>>;
  fine: Readonly<Ref<boolean>>;
}

/**
 * Detect pointer capabilities reactively. SSR-safe.
 */
export function usePointer(
  serverDefault?: Partial<{ hover: boolean; anyHover: boolean; coarse: boolean; fine: boolean }>,
): PointerInfo {
  return {
    hover: useMediaQuery(mq.hover, serverDefault?.hover ?? true),
    anyHover: useMediaQuery(mq.anyHover, serverDefault?.anyHover ?? true),
    coarse: useMediaQuery(mq.coarseCursor, serverDefault?.coarse ?? false),
    fine: useMediaQuery(mq.fineCursor, serverDefault?.fine ?? true),
  };
}
