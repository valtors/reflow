import { Fragment, type PropType, computed, defineComponent, h } from "vue";
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { useBreakpoint } from "./useBreakpoint.js";

export interface ShowProps<B extends BreakpointMap> {
  /** Show only at this exact breakpoint. */
  is?: BreakpointKey<B>;
  /** Show at this breakpoint or larger. */
  above?: BreakpointKey<B>;
  /** Show below this breakpoint. */
  below?: BreakpointKey<B>;
  /** Show in `[min, max)`. */
  between?: [BreakpointKey<B>, BreakpointKey<B>];
}

/**
 * Conditionally render based on the active breakpoint.
 *
 * @example
 *   <Show above="md"><Sidebar /></Show>
 */
export const Show = defineComponent({
  name: "Show",
  props: {
    is: String as PropType<BreakpointKey<BreakpointMap>>,
    above: String as PropType<BreakpointKey<BreakpointMap>>,
    below: String as PropType<BreakpointKey<BreakpointMap>>,
    between: Array as unknown as PropType<
      [BreakpointKey<BreakpointMap>, BreakpointKey<BreakpointMap>]
    >,
  },
  setup(props, { slots }) {
    const bp = useBreakpoint<BreakpointMap>();
    const visible = computed(() => {
      let matches = true;
      if (props.is !== undefined) matches = matches && bp.is(props.is);
      if (props.above !== undefined) matches = matches && bp.above(props.above);
      if (props.below !== undefined) matches = matches && bp.below(props.below);
      if (props.between !== undefined)
        matches = matches && bp.between(props.between[0], props.between[1]);
      return matches;
    });

    return () => h(Fragment, visible.value ? slots.default?.() : slots.fallback?.());
  },
});
