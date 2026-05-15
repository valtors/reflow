"use client";

import { useEffect, useState } from "preact/hooks";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../core/safe-area.js";

const ZERO: SafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function useSafeArea(serverDefault: SafeAreaInsets = ZERO): SafeAreaInsets {
  const [insets, setInsets] = useState(() =>
    typeof window === "undefined" ? serverDefault : getSafeArea(),
  );

  useEffect(() => {
    setInsets(getSafeArea());
    return observeSafeArea((next) => {
      setInsets(next);
    });
  }, []);

  return insets;
}
