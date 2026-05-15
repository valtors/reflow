"use client";

import { useEffect, useState } from "preact/hooks";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";

export function useDevicePixelRatio(serverDefault = 1): number {
  const [dpr, setDpr] = useState(() =>
    typeof window === "undefined" ? serverDefault : getDevicePixelRatio(),
  );

  useEffect(() => {
    setDpr(getDevicePixelRatio());
    return observeDevicePixelRatio((next) => {
      setDpr(next);
    });
  }, []);

  return dpr;
}
