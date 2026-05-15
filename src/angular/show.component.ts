import { Component, computed, input } from "@angular/core";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { breakpointSignal } from "./breakpoint.signal.js";

@Component({
  selector: "flu-show",
  standalone: true,
  template: `
    @if (visible()) {
      <ng-content />
    }
  `,
})
export class FluShowComponent {
  readonly on = input<BreakpointKey<BreakpointMap> | undefined>(undefined);
  readonly above = input<BreakpointKey<BreakpointMap> | undefined>(undefined);
  readonly below = input<BreakpointKey<BreakpointMap> | undefined>(undefined);
  readonly between = input<
    readonly [BreakpointKey<BreakpointMap>, BreakpointKey<BreakpointMap>] | undefined
  >(undefined);

  private readonly breakpoint = breakpointSignal<BreakpointMap>();

  readonly visible = computed(() => {
    let current = true;
    const on = this.on();
    const above = this.above();
    const below = this.below();
    const between = this.between();

    if (on !== undefined) {
      current = current && this.breakpoint.is(on)();
    }

    if (above !== undefined) {
      current = current && this.breakpoint.above(above)();
    }

    if (below !== undefined) {
      current = current && this.breakpoint.below(below)();
    }

    if (between !== undefined) {
      current = current && this.breakpoint.between(between[0], between[1])();
    }

    return current;
  });
}
