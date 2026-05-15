import { getContext, setContext } from 'svelte';
import { derived } from 'svelte/store';
import { breakpoint, colorScheme, viewport } from 'fluidity-ts/svelte';

const RESPONSIVE_CONTEXT = Symbol('fluidity-responsive');

export function createResponsiveContext() {
  const bp = breakpoint();
  const vp = viewport();
  const theme = colorScheme({ storageKey: 'fluidity-sveltekit-theme' });

  const snapshot = derived([bp, vp, theme.scheme, theme.isDark], ([$bp, $vp, $scheme, $isDark]) => ({
    active: $bp.active,
    ...$vp,
    scheme: $scheme,
    isDark: $isDark
  }));

  return { bp, vp, theme, snapshot };
}

export type ResponsiveContext = ReturnType<typeof createResponsiveContext>;

export function provideResponsiveContext() {
  const context = createResponsiveContext();
  setContext(RESPONSIVE_CONTEXT, context);
  return context;
}

export function getResponsiveContext() {
  return getContext<ResponsiveContext>(RESPONSIVE_CONTEXT);
}
