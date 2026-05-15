import { createBreakpoints } from "fluidity-ts";
import { createFluidityPlugin } from "fluidity-ts/vue";

export const breakpointValues = {
  mobile: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export type AppBreakpoints = typeof breakpointValues;

export default defineNuxtPlugin((nuxtApp) => {
  const system = createBreakpoints(breakpointValues);

  nuxtApp.vueApp.use(
    createFluidityPlugin({
      system,
      serverWidth: breakpointValues.desktop,
      serverHeight: 800,
    }),
  );

  return {
    provide: {
      breakpoints: breakpointValues,
      breakpointSystem: system,
    },
  };
});
