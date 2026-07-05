<script lang="ts">
  import { breakpoint } from "reflow/svelte";
  import { getColumns, getLayoutLabel, type DemoBreakpoint } from "../lib/fluidity";

  const bp = breakpoint();

  $: active = $bp.active as DemoBreakpoint;
  $: columns = getColumns(active);
  $: layout = getLayoutLabel(active);
  $: checks = [
    { label: 'is("xs")', value: $bp.active === "xs" },
    { label: 'above("md")', value: $bp.active === "md" || $bp.active === "lg" || $bp.active === "xl" || $bp.active === "2xl" },
    { label: 'between("md", "xl")', value: $bp.active === "md" || $bp.active === "lg" },
  ];
</script>

<article class="island-card">
  <div class="island-header">
    <div>
      <p class="eyebrow">Svelte island</p>
      <h2>reflow/svelte</h2>
    </div>
    <span class="badge">{active}</span>
  </div>
  <p>{layout} · {columns} columns</p>
  <ul class="check-list">
    {#each checks as check}
      <li>
        <span>{check.label}</span>
        <strong>{check.value ? "true" : "false"}</strong>
      </li>
    {/each}
  </ul>
</article>
