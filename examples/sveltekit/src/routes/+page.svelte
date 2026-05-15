<script>
  import { onMount } from 'svelte';
  import { getResponsiveContext } from '../lib/responsive';

  const { bp, vp, theme, snapshot } = getResponsiveContext();
  const isCompact = bp.below('md');
  const isDesktop = bp.above('lg');
  const scheme = theme.scheme;

  let live = {
    active: 'xs',
    width: 0,
    height: 0,
    orientation: 'portrait',
    scheme: 'light'
  };

  onMount(() => {
    const unsubscribers = [
      bp.subscribe(($bp) => {
        live = { ...live, active: $bp.active };
      }),
      vp.subscribe(($vp) => {
        live = { ...live, width: $vp.width, height: $vp.height, orientation: $vp.orientation };
      }),
      theme.scheme.subscribe(($scheme) => {
        live = { ...live, scheme: $scheme };
      })
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  });
</script>

<svelte:head>
  <title>fluidity-ts + SvelteKit</title>
</svelte:head>

<main>
  <h1>fluidity-ts + SvelteKit</h1>
  <p>
    These values render with SSR-friendly defaults first, then stay in sync through store
    subscriptions after hydration.
  </p>

  <div class="grid">
    <article>
      <span>Breakpoint</span>
      <strong>{$snapshot.active}</strong>
      <small>{$isCompact ? 'below md' : $isDesktop ? 'lg and up' : 'between md and lg'}</small>
    </article>

    <article>
      <span>Viewport</span>
      <strong>{$snapshot.width} × {$snapshot.height}</strong>
      <small>{$snapshot.orientation}</small>
    </article>

    <article>
      <span>Color scheme</span>
      <strong>{$scheme}</strong>
      <small>{$snapshot.isDark ? 'dark UI' : 'light UI'}</small>
    </article>
  </div>

  <div class="actions">
    <button on:click={() => theme.set($scheme === 'dark' ? 'light' : 'dark')}>
      Toggle {$scheme === 'dark' ? 'light' : 'dark'} mode
    </button>
  </div>

  <section>
    <h2>Live client snapshot</h2>
    <pre>{JSON.stringify(live, null, 2)}</pre>
  </section>
</main>

<style>
  main {
    max-width: 48rem;
    margin: 0 auto;
    padding: 3rem 1.25rem;
  }

  h1 {
    margin: 0 0 0.75rem;
    font-size: clamp(2rem, 3vw, 3rem);
  }

  p,
  small {
    color: var(--muted);
  }

  .grid {
    display: grid;
    gap: 1rem;
    margin: 2rem 0;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  article,
  pre {
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--panel);
    padding: 1rem;
  }

  article {
    display: grid;
    gap: 0.25rem;
  }

  strong {
    font-size: 1.25rem;
  }

  .actions {
    margin-bottom: 2rem;
  }

  button {
    border: 0;
    border-radius: 999px;
    background: var(--accent);
    color: white;
    padding: 0.75rem 1rem;
    cursor: pointer;
  }

  pre {
    overflow: auto;
    white-space: pre-wrap;
  }
</style>
