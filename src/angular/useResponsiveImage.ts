import type { ResponsiveImageConfig } from "../core/images.js";
import { responsiveImage } from "../core/images.js";

/**
 * Angular helper for responsive `<img>` attributes.
 * Same surface as React `useResponsiveImage` — wraps core `responsiveImage`.
 * Pure from config (safe for SSR defaults; no browser-only subscription).
 */
export function useResponsiveImage(config: ResponsiveImageConfig): {
  srcSet: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
} {
  return responsiveImage(config);
}
