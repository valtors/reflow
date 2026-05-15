import type { BreakpointKey, BreakpointMap, BreakpointSystem } from "./breakpoints.js";

export interface ResponsiveImageSource {
  src: string;
  width: number;
  format?: "webp" | "avif" | "jpg" | "png";
}

export interface ResponsiveImageConfig {
  sources: ResponsiveImageSource[];
  sizes?: string;
  alt: string;
  loading?: "lazy" | "eager";
}

export interface ArtDirectionVariant {
  media: string;
  src: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface ResponsiveImageAttributes {
  srcSet: string;
  sizes: string;
  src: string;
  alt: string;
  loading: "lazy" | "eager";
}

export interface ArtDirectionSourceAttributes {
  media: string;
  srcSet: string;
  type?: string;
  width?: number;
  height?: number;
}

export interface ArtDirectionAttributes {
  sources: ArtDirectionSourceAttributes[];
  fallback: {
    src: string;
    width?: number;
    height?: number;
  };
}

const DEFAULT_LOADING = "lazy";
const DEFAULT_SIZES = "100vw";
const DEFAULT_DEVICE_PIXEL_RATIOS = [1, 2];

const MIME_TYPES: Readonly<Record<string, string>> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

function assertValidWidth(width: number, context: string): void {
  if (!Number.isFinite(width) || width <= 0) {
    throw new Error(`${context}: width must be a positive number`);
  }
}

function normalizeSources(sources: ResponsiveImageSource[]): ResponsiveImageSource[] {
  if (sources.length === 0) {
    throw new Error("responsiveImage: at least one source is required");
  }

  return sources
    .map((source) => {
      assertValidWidth(source.width, "responsiveImage");
      return source;
    })
    .slice()
    .sort((a, b) => a.width - b.width);
}

function normalizeDevicePixelRatios(devicePixelRatios: number[]): number[] {
  const ratios = Array.from(
    new Set(
      devicePixelRatios.map((ratio) => {
        if (!Number.isFinite(ratio) || ratio <= 0) {
          throw new Error("calculateImageWidths: devicePixelRatios must be positive numbers");
        }
        return ratio;
      }),
    ),
  ).sort((a, b) => a - b);

  if (ratios.length === 0) {
    throw new Error("calculateImageWidths: at least one device pixel ratio is required");
  }

  return ratios;
}

function resolveMimeType(format?: string): string | undefined {
  if (!format) return undefined;
  return MIME_TYPES[format.toLowerCase()] ?? `image/${format.toLowerCase()}`;
}

export function generateSrcset(sources: ResponsiveImageSource[]): string {
  return normalizeSources(sources)
    .map(({ src, width }) => `${src} ${width}w`)
    .join(", ");
}

export function generateSizes<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  config: Partial<Record<BreakpointKey<B>, string>>,
): string {
  const firstDefined = system.keys.find((key) => config[key] !== undefined);
  if (!firstDefined) return DEFAULT_SIZES;

  const effective: Array<{ key: BreakpointKey<B>; size: string }> = [];
  let activeSize = config[firstDefined]!;

  for (const key of system.keys) {
    const nextSize = config[key];
    if (nextSize !== undefined) {
      activeSize = nextSize;
    }
    effective.push({ key, size: activeSize });
  }

  const changes = effective.filter(
    (entry, index) => index === 0 || entry.size !== effective[index - 1]!.size,
  );
  const fallback = changes[0]!.size;
  const conditional = changes
    .slice(1)
    .reverse()
    .map(({ key, size }) => `${system.up(key)} ${size}`);

  return [...conditional, fallback].join(", ");
}

export function calculateImageWidths<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options: { devicePixelRatios?: number[]; maxWidth?: number } = {},
): number[] {
  const devicePixelRatios = normalizeDevicePixelRatios(
    options.devicePixelRatios ?? DEFAULT_DEVICE_PIXEL_RATIOS,
  );
  const maxWidth = options.maxWidth;

  if (maxWidth !== undefined) {
    assertValidWidth(maxWidth, "calculateImageWidths");
  }

  const widths = new Set<number>();

  system.keys.forEach((key, index) => {
    const nextKey = system.keys[index + 1];
    const nextBreakpoint = nextKey ? system.breakpoints[nextKey] : undefined;
    const rangeWidth = nextBreakpoint ?? maxWidth ?? system.breakpoints[key];

    if (!rangeWidth || rangeWidth <= 0) {
      return;
    }

    for (const ratio of devicePixelRatios) {
      const candidate = Math.round(rangeWidth * ratio);
      widths.add(maxWidth === undefined ? candidate : Math.min(candidate, maxWidth));
    }
  });

  return Array.from(widths)
    .filter((width) => width > 0)
    .sort((a, b) => a - b);
}

export function responsiveImage(config: ResponsiveImageConfig): ResponsiveImageAttributes {
  const sources = normalizeSources(config.sources);

  return {
    srcSet: generateSrcset(sources),
    sizes: config.sizes ?? DEFAULT_SIZES,
    src: sources[0]!.src,
    alt: config.alt,
    loading: config.loading ?? DEFAULT_LOADING,
  };
}

export function artDirection(variants: ArtDirectionVariant[]): ArtDirectionAttributes {
  if (variants.length === 0) {
    throw new Error("artDirection: at least one variant is required");
  }

  const sources = variants.map((variant) => ({
    media: variant.media,
    srcSet: variant.width ? `${variant.src} ${variant.width}w` : variant.src,
    type: resolveMimeType(variant.format),
    width: variant.width,
    height: variant.height,
  }));
  const fallback = variants[variants.length - 1]!;

  return {
    sources,
    fallback: {
      src: fallback.src,
      width: fallback.width,
      height: fallback.height,
    },
  };
}

export function imageBreakpoints<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  options?: { devicePixelRatios?: number[]; maxWidth?: number },
): number[] {
  return calculateImageWidths(system, options);
}
