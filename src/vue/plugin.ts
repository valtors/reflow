import type { App } from "vue";
import type { BreakpointMap, BreakpointSystem } from "../core/breakpoints.js";
import { createBreakpoints, defaultBreakpoints } from "../core/breakpoints.js";
import { FLUIDITY_KEY, createFluidityContext } from "./context.js";

export interface FluidityPluginOptions<B extends BreakpointMap = BreakpointMap> {
  system?: BreakpointSystem<B>;
  serverWidth?: number;
  serverHeight?: number;
}

/**
 * Vue plugin to provide fluidity context app-wide.
 *
 * @example
 * ```ts
 * import { createFluidityPlugin } from "reflow/vue";
 * import { createBreakpoints } from "reflow";
 *
 * const app = createApp(App);
 * app.use(
 *   createFluidityPlugin({
 *     system: createBreakpoints({ mobile: 0, tablet: 768, desktop: 1024 }),
 *   }),
 * );
 * ```
 */
export function createFluidityPlugin<B extends BreakpointMap>(
  options: FluidityPluginOptions<B> = {},
) {
  return {
    install(app: App) {
      const system = (options.system ??
        createBreakpoints(defaultBreakpoints)) as unknown as BreakpointSystem<BreakpointMap>;
      const ctx = createFluidityContext(system, {
        serverWidth: options.serverWidth,
        serverHeight: options.serverHeight,
      });
      app.provide(FLUIDITY_KEY, ctx);
    },
  };
}
