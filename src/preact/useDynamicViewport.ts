"use client";

import { useEffect, useState } from "preact/hooks";
import { readDynamicViewportPx } from "../styles/viewport-units.js";

export interface DynamicViewport {
  dvh: number;
  svh: number;
  lvh: number;
}

export function useDynamicViewport(
  serverDefault: DynamicViewport = { dvh: 0, svh: 0, lvh: 0 },
): DynamicViewport {
  const [v, setV] = useState<DynamicViewport>(serverDefault);
  useEffect(() => {
    const read = () => {
      setV({
        dvh: readDynamicViewportPx("dvh"),
        svh: readDynamicViewportPx("svh"),
        lvh: readDynamicViewportPx("lvh"),
      });
    };
    read();
    let scheduled = false;
    const onResize = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        read();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return v;
}
