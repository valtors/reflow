"use client";

import { type ComponentChildren, createContext, h } from "preact";
import { useContext, useMemo, useRef } from "preact/hooks";
import {
  type BreakpointMap,
  type BreakpointSystem,
  type DefaultBreakpoints,
  createBreakpoints,
  defaultBreakpoints,
} from "../core/breakpoints.js";
import { type FluidityStore, createFluidityStore } from "../core/store.js";

export interface FluidityContextValue<B extends BreakpointMap = BreakpointMap> {
  store: FluidityStore<B>;
  system: BreakpointSystem<B>;
}

const FluidityContext = createContext<FluidityContextValue<BreakpointMap> | null>(null);

export interface ResponsiveProviderProps<B extends BreakpointMap = DefaultBreakpoints> {
  system?: BreakpointSystem<B>;
  serverWidth?: number;
  serverHeight?: number;
  children?: ComponentChildren;
}

export function ResponsiveProvider<B extends BreakpointMap = DefaultBreakpoints>({
  system,
  serverWidth,
  serverHeight,
  children,
}: ResponsiveProviderProps<B>) {
  const storeRef = useRef<FluidityContextValue<BreakpointMap> | null>(null);

  if (!storeRef.current) {
    const resolvedSystem = (system ??
      createBreakpoints(defaultBreakpoints)) as unknown as BreakpointSystem<BreakpointMap>;
    const store = createFluidityStore(resolvedSystem, {
      initialWidth: serverWidth,
      initialHeight: serverHeight,
    });

    if (serverWidth !== undefined || serverHeight !== undefined) {
      store.setServerSnapshot({
        width: serverWidth ?? 1024,
        height: serverHeight ?? 768,
      });
    }

    storeRef.current = { store, system: resolvedSystem };
  }

  const value = useMemo(() => storeRef.current!, []);
  return h(FluidityContext.Provider, { value }, children);
}

let ambientStore: FluidityContextValue<BreakpointMap> | null = null;

export function useFluidityContext<
  B extends BreakpointMap = BreakpointMap,
>(): FluidityContextValue<B> {
  const context = useContext(FluidityContext);
  if (context) return context as unknown as FluidityContextValue<B>;

  if (!ambientStore) {
    const system = createBreakpoints(
      defaultBreakpoints,
    ) as unknown as BreakpointSystem<BreakpointMap>;
    ambientStore = { store: createFluidityStore(system), system };
  }

  return ambientStore as unknown as FluidityContextValue<B>;
}
