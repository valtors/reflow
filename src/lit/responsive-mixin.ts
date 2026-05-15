import type { ReactiveControllerHost } from "lit";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { BreakpointController } from "./BreakpointController.js";
import type { FluidityControllerOptions } from "./FluidityController.js";

// biome-ignore lint/suspicious/noExplicitAny: TypeScript mixin constructors require any[].
type Constructor<T = object> = abstract new (...args: any[]) => T;

export interface ResponsiveElement<B extends BreakpointMap> extends ReactiveControllerHost {
  readonly breakpointController: BreakpointController<B>;
  readonly breakpoint: BreakpointKey<B>;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly orientation: "portrait" | "landscape";
  isBreakpoint(key: BreakpointKey<B>): boolean;
  aboveBreakpoint(key: BreakpointKey<B>): boolean;
  belowBreakpoint(key: BreakpointKey<B>): boolean;
  betweenBreakpoints(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean;
}

export function responsiveMixin<
  B extends BreakpointMap,
  TBase extends Constructor<ReactiveControllerHost>,
>(Base: TBase, options: FluidityControllerOptions<B> = {}) {
  abstract class ResponsiveMixinClass extends Base {
    readonly breakpointController = new BreakpointController<B>(this, options);

    get breakpoint(): BreakpointKey<B> {
      return this.breakpointController.active;
    }

    get viewportWidth(): number {
      return this.breakpointController.width;
    }

    get viewportHeight(): number {
      return this.breakpointController.height;
    }

    get orientation(): "portrait" | "landscape" {
      return this.breakpointController.orientation;
    }

    isBreakpoint(key: BreakpointKey<B>): boolean {
      return this.breakpointController.is(key);
    }

    aboveBreakpoint(key: BreakpointKey<B>): boolean {
      return this.breakpointController.above(key);
    }

    belowBreakpoint(key: BreakpointKey<B>): boolean {
      return this.breakpointController.below(key);
    }

    betweenBreakpoints(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean {
      return this.breakpointController.between(min, max);
    }
  }

  return ResponsiveMixinClass as TBase & Constructor<ResponsiveElement<B>>;
}
