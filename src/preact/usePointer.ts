"use client";

import { useEffect, useState } from "preact/hooks";
import { getPointerCapabilities, observePointerCapabilities } from "../core/pointer.js";

export interface PointerInfo {
  hover: boolean;
  anyHover: boolean;
  coarse: boolean;
  fine: boolean;
}

function getDefaultPointer(serverDefault?: Partial<PointerInfo>): PointerInfo {
  return {
    hover: serverDefault?.hover ?? true,
    anyHover: serverDefault?.anyHover ?? true,
    coarse: serverDefault?.coarse ?? false,
    fine: serverDefault?.fine ?? true,
  };
}

function readPointer(): PointerInfo {
  const { hover, anyHover, coarse, fine } = getPointerCapabilities();
  return { hover, anyHover, coarse, fine };
}

export function usePointer(serverDefault?: Partial<PointerInfo>): PointerInfo {
  const [pointer, setPointer] = useState<PointerInfo>(() =>
    typeof window === "undefined" ? getDefaultPointer(serverDefault) : readPointer(),
  );

  useEffect(() => {
    setPointer(readPointer());
    return observePointerCapabilities((next) => {
      setPointer({
        hover: next.hover,
        anyHover: next.anyHover,
        coarse: next.coarse,
        fine: next.fine,
      });
    });
  }, []);

  return pointer;
}
