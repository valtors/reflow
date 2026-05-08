"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../core/dpr.js";

/**
 * Track the device pixel ratio reactively. Updates when the user zooms
 * or moves the window to a different-DPI monitor. SSR-safe.
 */
export function useDevicePixelRatio(serverDefault = 1): number {
  const subscribe = useCallback(
    (onChange: () => void) => observeDevicePixelRatio(() => onChange()),
    [],
  );
  return useSyncExternalStore(subscribe, getDevicePixelRatio, () => serverDefault);
}
