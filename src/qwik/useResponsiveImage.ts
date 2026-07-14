import type { ResponsiveImageConfig } from "../core/images.js";
import { responsiveImage } from "../core/images.js";

/**
 * Qwik helper for responsive `<img>` attributes.
 * Same surface as React `useResponsiveImage` — wraps core `responsiveImage`.
 * Pure from config (srcset/sizes do not subscribe to viewport).
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
