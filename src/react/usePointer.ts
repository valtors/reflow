"use client";

import { mq } from "../core/media.js";
import { useMediaQuery } from "./useMediaQuery.js";

/** Pointer and hover capabilities for the current device. */
export interface PointerInfo {
  hover: boolean;
  anyHover: boolean;
  coarse: boolean;
  fine: boolean;
}

/** Detect pointer capabilities (hover, touch, fine). SSR-safe with configurable defaults. */
export function usePointer(serverDefault?: Partial<PointerInfo>): PointerInfo {
  return {
    hover: useMediaQuery(mq.hover, serverDefault?.hover ?? true),
    anyHover: useMediaQuery(mq.anyHover, serverDefault?.anyHover ?? true),
    coarse: useMediaQuery(mq.coarseCursor, serverDefault?.coarse ?? false),
    fine: useMediaQuery(mq.fineCursor, serverDefault?.fine ?? true),
  };
}
