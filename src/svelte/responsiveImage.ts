import type { ResponsiveImageConfig } from "../core/images.js";
import { responsiveImage as buildResponsiveImage } from "../core/images.js";

/**
 * Svelte helper for responsive `<img>` attributes.
 * Mirrors React `useResponsiveImage` — pure function wrapping core `responsiveImage`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { responsiveImage } from "reflow/svelte";
 *   const img = responsiveImage({
 *     alt: "Hero",
 *     sources: [
 *       { src: "/hero-800.jpg", width: 800 },
 *       { src: "/hero-400.jpg", width: 400 },
 *     ],
 *   });
 * </script>
 * <img src={img.src} srcset={img.srcSet} sizes={img.sizes} alt={img.alt} loading={img.loading} />
 * ```
 */
export function responsiveImage(config: ResponsiveImageConfig): {
  srcSet: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
} {
  return buildResponsiveImage(config);
}
