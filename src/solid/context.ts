import { type ParentProps, createContext, useContext } from "solid-js";
import { createComponent, isServer } from "solid-js/web";
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

export type ResponsiveProviderProps<B extends BreakpointMap = DefaultBreakpoints> = ParentProps<{
  system?: BreakpointSystem<B>;
  serverWidth?: number;
  serverHeight?: number;
}>;

function createFluidityContext<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options?: { serverWidth?: number; serverHeight?: number },
): FluidityContextValue<B> {
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

function createDefaultContext(): FluidityContextValue<BreakpointMap> {
  const system = createBreakpoints(
    defaultBreakpoints,
  ) as unknown as BreakpointSystem<BreakpointMap>;
  return createFluidityContext(system);
}

let ambientContext: FluidityContextValue<BreakpointMap> | null = null;

export function ResponsiveProvider<B extends BreakpointMap = DefaultBreakpoints>(
  props: ResponsiveProviderProps<B>,
) {
  const system = (props.system ??
    createBreakpoints(defaultBreakpoints)) as unknown as BreakpointSystem<BreakpointMap>;
  const context = createFluidityContext(system, {
    serverWidth: props.serverWidth,
    serverHeight: props.serverHeight,
  });

  return createComponent(FluidityContext.Provider, {
    value: context,
    get children() {
      return props.children;
    },
  });
}

export function useFluidityContext<
  B extends BreakpointMap = DefaultBreakpoints,
>(): FluidityContextValue<B> {
  const context = useContext(FluidityContext);
  if (context) return context as unknown as FluidityContextValue<B>;

  if (isServer) {
    return createDefaultContext() as unknown as FluidityContextValue<B>;
  }

  if (!ambientContext) {
    ambientContext = createDefaultContext();
  }

  return ambientContext as unknown as FluidityContextValue<B>;
}
