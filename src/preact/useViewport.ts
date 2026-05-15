"use client";

import { useEffect, useState } from "preact/hooks";
import type { BreakpointMap } from "../core/breakpoints.js";
import type { FluidityStoreSnapshot } from "../core/store.js";
import { useFluidityContext } from "./context.js";

export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

function getInitialSnapshot<B extends BreakpointMap>(
  getSnapshot: () => FluidityStoreSnapshot<B>,
  getServerSnapshot: () => FluidityStoreSnapshot<B>,
) {
  return typeof window === "undefined" ? getServerSnapshot() : getSnapshot();
}

export function useViewport(): ViewportState {
  const { store } = useFluidityContext();
  const [snapshot, setSnapshot] = useState(() =>
    getInitialSnapshot(store.getSnapshot, store.getServerSnapshot),
  );

  useEffect(() => {
    setSnapshot(store.getSnapshot());
    return store.subscribe(() => {
      setSnapshot(store.getSnapshot());
    });
  }, [store]);

  return {
    width: snapshot.width,
    height: snapshot.height,
    orientation: snapshot.orientation,
  };
}
