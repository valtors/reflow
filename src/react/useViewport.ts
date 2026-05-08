"use client";

import { useSyncExternalStore } from "react";
import { useFluidityContext } from "./context.js";

/** Viewport dimensions and orientation from the fluidity store. */
export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

/** Current viewport dimensions + orientation from the shared fluidity store. */
export function useViewport(): ViewportState {
  const { store } = useFluidityContext();
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return {
    width: snap.width,
    height: snap.height,
    orientation: snap.orientation,
  };
}
