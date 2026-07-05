<script setup lang="ts">
const {
  breakpoint,
  viewport,
  renderedColorScheme,
  hydrated,
  setColorScheme,
  toggleColorScheme,
} = useResponsive();

const { $breakpoints } = useNuxtApp();

const viewportLabel = computed(
  () => `${viewport.width.value}px × ${viewport.height.value}px`,
);

const matches = computed(() => ({
  mobile: breakpoint.is("mobile"),
  tabletUp: breakpoint.above("tablet"),
  laptopOnly: breakpoint.between("laptop", "desktop"),
}));
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Nuxt 3 + reflow/vue</p>
      <h1>SSR-safe responsive state in a single composable.</h1>
      <p class="lede">
        This page uses <code>useBreakpoint()</code>, <code>useViewport()</code>, and
        <code>useColorScheme()</code> via <code>useResponsive()</code>. The server renders
        stable defaults first, then syncs the real client values after mount to avoid
        hydration mismatch.
      </p>

      <div class="actions">
        <button type="button" @click="toggleColorScheme">Toggle theme</button>
        <button type="button" @click="setColorScheme(null)">Use system theme</button>
      </div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Breakpoint</h2>
        <strong>{{ breakpoint.active }}</strong>
        <ul>
          <li>mobile: {{ matches.mobile }}</li>
          <li>tablet and up: {{ matches.tabletUp }}</li>
          <li>laptop only: {{ matches.laptopOnly }}</li>
        </ul>
      </article>

      <article class="card">
        <h2>Viewport</h2>
        <strong>{{ viewportLabel }}</strong>
        <p>{{ viewport.orientation }}</p>
      </article>

      <article class="card">
        <h2>Color scheme</h2>
        <strong>{{ renderedColorScheme }}</strong>
        <p>{{ hydrated ? "Client-synced" : "Server fallback" }}</p>
      </article>

      <article class="card">
        <h2>Provided breakpoints</h2>
        <ul>
          <li v-for="(value, name) in $breakpoints" :key="name">
            {{ name }}: {{ value }}px
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page {
  margin: 0 auto;
  max-width: 960px;
  padding: 3rem 1.5rem 4rem;
}

.hero {
  display: grid;
  gap: 1rem;
}

.eyebrow {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

h1,
.lede,
.card h2,
.card p,
.card ul {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.05;
}

.lede {
  max-width: 65ch;
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  background: #2563eb;
  border: 0;
  border-radius: 999px;
  color: white;
  cursor: pointer;
  font: inherit;
  padding: 0.8rem 1.1rem;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 2rem;
}

.card {
  background: rgb(148 163 184 / 0.12);
  border: 1px solid rgb(148 163 184 / 0.2);
  border-radius: 1rem;
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
}

.card strong {
  font-size: 1.5rem;
}

.card ul {
  padding-left: 1.2rem;
}

code {
  font-family: "Cascadia Code", "Fira Code", monospace;
}
</style>
