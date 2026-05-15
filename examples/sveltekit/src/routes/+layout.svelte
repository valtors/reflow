<script>
  import { provideResponsiveContext } from '../lib/responsive';

  const { theme } = provideResponsiveContext();
  const scheme = theme.scheme;
  const isDark = theme.isDark;
</script>

<svelte:head>
  <meta name="color-scheme" content={$isDark ? 'dark' : 'light'} />
</svelte:head>

<div class="app-shell" data-theme={$scheme}>
  <slot />
</div>

<style>
  :global(html, body) {
    margin: 0;
    min-height: 100%;
  }

  :global(body) {
    font-family: Inter, system-ui, sans-serif;
  }

  .app-shell {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  [data-theme='light'] {
    --bg: #f8fafc;
    --panel: #ffffff;
    --text: #0f172a;
    --muted: #475569;
    --border: #cbd5e1;
    --accent: #2563eb;
  }

  [data-theme='dark'] {
    --bg: #020617;
    --panel: #0f172a;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --border: #1e293b;
    --accent: #60a5fa;
  }
</style>
