<script setup lang="ts">
const { renderedColorScheme } = useResponsive();
</script>

<template>
  <div :data-theme="renderedColorScheme" class="app-shell">
    <NuxtPage />
  </div>
</template>

<style>
:root {
  color-scheme: light dark;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html,
body,
#__nuxt {
  margin: 0;
  min-height: 100%;
}

body {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

.app-shell {
  min-height: 100vh;
  transition: background 0.2s ease, color 0.2s ease;
}

.app-shell[data-theme="light"] {
  background: #f8fafc;
  color: #0f172a;
}

.app-shell[data-theme="dark"] {
  background: #0f172a;
  color: #e2e8f0;
}

a {
  color: inherit;
}
</style>
