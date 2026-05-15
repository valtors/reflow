import type { BreakpointKey, BreakpointMap, defaultBreakpoints } from "../core/breakpoints.js";
import { FluidityController, type FluidityControllerOptions } from "./FluidityController.js";

export class BreakpointController<
  B extends BreakpointMap = typeof defaultBreakpoints,
> extends FluidityController<B> {
  get activeIndex(): number {
    return this.keys.indexOf(this.active);
  }

  is(key: BreakpointKey<B>): boolean {
    return this.active === key;
  }

  above(key: BreakpointKey<B>): boolean {
    return this.activeIndex >= this.keys.indexOf(key);
  }

  below(key: BreakpointKey<B>): boolean {
    return this.activeIndex < this.keys.indexOf(key);
  }

  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean {
    const start = this.keys.indexOf(min);
    const end = this.keys.indexOf(max);
    return this.activeIndex >= start && this.activeIndex < end;
  }
}

export type { FluidityControllerOptions };
