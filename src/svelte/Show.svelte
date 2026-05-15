<script lang="ts">
import type { BreakpointKey, BreakpointMap } from "../core/breakpoints.js";
import { defaultBreakpoints } from "../core/breakpoints.js";
import { breakpoint } from "./breakpoint.js";

type Key = BreakpointKey<BreakpointMap>;

/* biome-ignore lint/style/useConst: Svelte component props must use export let. */
export let is: Key | undefined = undefined;
/* biome-ignore lint/style/useConst: Svelte component props must use export let. */
export let above: Key | undefined = undefined;
/* biome-ignore lint/style/useConst: Svelte component props must use export let. */
export let below: Key | undefined = undefined;
/* biome-ignore lint/style/useConst: Svelte component props must use export let. */
export let between: [Key, Key] | undefined = undefined;

const bp = breakpoint();
const keys = Object.keys(defaultBreakpoints).sort(
  (a, b) =>
    defaultBreakpoints[a as keyof typeof defaultBreakpoints] -
    defaultBreakpoints[b as keyof typeof defaultBreakpoints],
) as Key[];

const indexOf = (key: Key) => keys.indexOf(key);

$: activeIndex = indexOf($bp.active as Key);
$: visible =
  (is === undefined || $bp.active === is) &&
  (above === undefined || activeIndex >= indexOf(above)) &&
  (below === undefined || activeIndex < indexOf(below)) &&
  (between === undefined ||
    (activeIndex >= indexOf(between[0]) && activeIndex < indexOf(between[1])));
</script>

{#if visible}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
