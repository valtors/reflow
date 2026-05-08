import { inject, provide } from "vue";
import {
  type BreakpointMap,
  type BreakpointSystem,
  createBreakpoints,
  defaultBreakpoints,
} from "../core/breakpoints.js";
import { type FluidityStore, createFluidityStore } from "../core/store.js";

export interface FluidityContext<B extends BreakpointMap = BreakpointMap> {
  store: FluidityStore<B>;
  system: BreakpointSystem<B>;
}

export const FLUIDITY_KEY = Symbol("fluidity");

export function createFluidityContext<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options?: { serverWidth?: number; serverHeight?: number },
): FluidityContext<B> {
  const store = createFluidityStore(system, {
    initialWidth: options?.serverWidth,
    initialHeight: options?.serverHeight,
  });

  if (options?.serverWidth !== undefined || options?.serverHeight !== undefined) {
    store.setServerSnapshot({
      width: options?.serverWidth ?? 1024,
      height: options?.serverHeight ?? 768,
    });
  }

  return { store, system };
}

export function provideBreakpoints<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options?: { serverWidth?: number; serverHeight?: number },
): FluidityContext<B> {
  const ctx = createFluidityContext(system, options);
  provide(FLUIDITY_KEY, ctx);
  return ctx;
}

let ambientCtx: FluidityContext<BreakpointMap> | null = null;

export function useFluidityContext<B extends BreakpointMap>(): FluidityContext<B> {
  const ctx = inject<FluidityContext<BreakpointMap> | null>(FLUIDITY_KEY, null);
  if (ctx) return ctx as unknown as FluidityContext<B>;

  if (!ambientCtx) {
    const system = createBreakpoints(
      defaultBreakpoints,
    ) as unknown as BreakpointSystem<BreakpointMap>;
    ambientCtx = createFluidityContext(system);
  }

  return ambientCtx as unknown as FluidityContext<B>;
}
