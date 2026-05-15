<script setup lang="ts">
import { computed } from "vue";
import { useBreakpoint } from "fluidity-ts/vue";
import { getColumns, getLayoutLabel, type DemoBreakpoint } from "../lib/fluidity";

const bp = useBreakpoint();
const active = computed(() => bp.active.value as DemoBreakpoint);
const columns = computed(() => getColumns(active.value));
const layout = computed(() => getLayoutLabel(active.value));
const checks = computed(() => [
  { label: 'is("xs")', value: bp.is("xs") },
  { label: 'above("md")', value: bp.above("md") },
  { label: 'between("md", "xl")', value: bp.between("md", "xl") },
]);
</script>

<template>
  <article class="island-card">
    <div class="island-header">
      <div>
        <p class="eyebrow">Vue island</p>
        <h2>fluidity-ts/vue</h2>
      </div>
      <span class="badge">{{ active }}</span>
    </div>
    <p>{{ layout }} · {{ columns }} columns</p>
    <ul class="check-list">
      <li v-for="check in checks" :key="check.label">
        <span>{{ check.label }}</span>
        <strong>{{ check.value ? "true" : "false" }}</strong>
      </li>
    </ul>
  </article>
</template>
