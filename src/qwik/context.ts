import {
  createContextId,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
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

export interface ProvideBreakpointsOptions {
  serverWidth?: number;
  serverHeight?: number;
}

export const FLUIDITY_CONTEXT = createContextId<FluidityContext<BreakpointMap>>("fluidity-ts.qwik");

export function createFluidityContext<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options?: ProvideBreakpointsOptions,
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
  options?: ProvideBreakpointsOptions,
): FluidityContext<B> {
  const ctx = useSignal<FluidityContext<B> | undefined>(undefined);

  if (!ctx.value) {
    ctx.value = createFluidityContext(system, options);
  }

  useTask$(() => {
    if (!ctx.value) return;
    if (options?.serverWidth === undefined && options?.serverHeight === undefined) return;

    ctx.value.store.setServerSnapshot({
      width: options?.serverWidth ?? 1024,
      height: options?.serverHeight ?? 768,
    });
  });

  useContextProvider(FLUIDITY_CONTEXT, ctx.value as unknown as FluidityContext<BreakpointMap>);

  return ctx.value;
}

let ambientCtx: FluidityContext<BreakpointMap> | null = null;

export function useFluidityContext<B extends BreakpointMap>(): FluidityContext<B> {
  try {
    const ctx = useContext(FLUIDITY_CONTEXT);
    if (ctx) return ctx as unknown as FluidityContext<B>;
  } catch {
    // No provider mounted.
  }

  if (!ambientCtx) {
    const system = createBreakpoints(
      defaultBreakpoints,
    ) as unknown as BreakpointSystem<BreakpointMap>;
    ambientCtx = createFluidityContext(system);
  }

  return ambientCtx as unknown as FluidityContext<B>;
}
