import { getPreference } from "./preferences.js";

/**
 * Accessibility utilities for responsive design.
 * Helps ensure responsive layouts remain accessible across all viewports.
 */

/** Minimum touch target size per WCAG 2.2 Success Criterion 2.5.8 */
export const MIN_TOUCH_TARGET = 24;
export const RECOMMENDED_TOUCH_TARGET = 44;

const DEFAULT_FONT_MIN = 16;
const DEFAULT_LINE_HEIGHT_RATIO = 1.5;
const DEFAULT_TAP_SPACING = 8;
const DEFAULT_TAP_SPACING_AAA = 12;
const DEFAULT_CONTAINER_PADDING = 16;
const DEFAULT_MIN_CHARS = 45;
const DEFAULT_MAX_CHARS = 75;
const MIN_VIEWPORT = 320;
const MAX_VIEWPORT = 1440;
const AVERAGE_CHARACTER_WIDTH_RATIO = 0.52;

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

const toFiniteNumber = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const interpolate = (
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
): number => {
  if (inputMax === inputMin) return outputMin;
  const progress = (clamp(value, inputMin, inputMax) - inputMin) / (inputMax - inputMin);
  return outputMin + (outputMax - outputMin) * progress;
};

const targetForLevel = (level: "AA" | "AAA" = "AA"): number =>
  level === "AAA" ? RECOMMENDED_TOUCH_TARGET : MIN_TOUCH_TARGET;

const formatPx = (value: number): string => `${roundToTwo(value)}px`;

const normalizeBreakpoint = (breakpoint: string): string =>
  breakpoint.trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

/** Calculate responsive touch target size that meets WCAG requirements */
export function responsiveTouchTarget(
  viewportWidth: number,
  options?: { level?: "AA" | "AAA"; scaleFactor?: number },
): number {
  const required = targetForLevel(options?.level);
  const width = toFiniteNumber(viewportWidth, MIN_VIEWPORT);
  const scaleFactor = clamp(toFiniteNumber(options?.scaleFactor ?? 1, 1), 0.5, 2);
  const viewportScale = interpolate(width, MIN_VIEWPORT, MAX_VIEWPORT, 1.15, 1);
  return Math.max(required, Math.round(required * viewportScale * scaleFactor));
}

/** Generate responsive font size that maintains readability (WCAG 1.4.4) */
export function accessibleFontSize(
  basePx: number,
  viewportWidth: number,
  options?: { minPx?: number; maxPx?: number; lineHeightRatio?: number },
): { fontSize: string; lineHeight: string } {
  const normalizedBase = Math.max(toFiniteNumber(basePx, DEFAULT_FONT_MIN), 1);
  const readableBase = Math.max(normalizedBase, DEFAULT_FONT_MIN);
  const optionMin = toFiniteNumber(options?.minPx ?? Number.NaN, Number.NaN);
  const optionMax = toFiniteNumber(options?.maxPx ?? Number.NaN, Number.NaN);
  const minPx = Number.isNaN(optionMin)
    ? Math.max(DEFAULT_FONT_MIN, roundToTwo(readableBase * 0.95))
    : Math.max(optionMin, 1);
  const maxPx = Number.isNaN(optionMax)
    ? Math.max(minPx, roundToTwo(readableBase * 1.15))
    : Math.max(optionMax, minPx);
  const width = toFiniteNumber(viewportWidth, MIN_VIEWPORT);
  const scaledPx = interpolate(width, MIN_VIEWPORT, MAX_VIEWPORT, minPx, maxPx);
  const lineHeightRatio = Math.max(
    toFiniteNumber(
      options?.lineHeightRatio ?? DEFAULT_LINE_HEIGHT_RATIO,
      DEFAULT_LINE_HEIGHT_RATIO,
    ),
    1.2,
  );
  const fontSizePx = clamp(roundToTwo(scaledPx), minPx, maxPx);
  const lineHeightPx = roundToTwo(fontSizePx * lineHeightRatio);

  return {
    fontSize: formatPx(fontSizePx),
    lineHeight: formatPx(lineHeightPx),
  };
}

/** Check if a responsive value meets minimum contrast/size requirements */
export interface A11yAuditResult {
  touchTarget: { passes: boolean; actual: number; required: number };
  fontSize: { passes: boolean; actual: number; minRequired: number };
  tapSpacing: { passes: boolean; actual: number; required: number };
}

export function auditResponsiveA11y(config: {
  touchTargetPx: number;
  fontSizePx: number;
  tapSpacingPx?: number;
  level?: "AA" | "AAA";
}): A11yAuditResult {
  const requiredTouchTarget = targetForLevel(config.level);
  const requiredTapSpacing = config.level === "AAA" ? DEFAULT_TAP_SPACING_AAA : DEFAULT_TAP_SPACING;
  const actualTouchTarget = toFiniteNumber(config.touchTargetPx, 0);
  const actualFontSize = toFiniteNumber(config.fontSizePx, 0);
  const actualTapSpacing = toFiniteNumber(config.tapSpacingPx ?? 0, 0);

  return {
    touchTarget: {
      passes: actualTouchTarget >= requiredTouchTarget,
      actual: actualTouchTarget,
      required: requiredTouchTarget,
    },
    fontSize: {
      passes: actualFontSize >= DEFAULT_FONT_MIN,
      actual: actualFontSize,
      minRequired: DEFAULT_FONT_MIN,
    },
    tapSpacing: {
      passes: actualTapSpacing >= requiredTapSpacing,
      actual: actualTapSpacing,
      required: requiredTapSpacing,
    },
  };
}

/** Returns 'true' if user has indicated a preference for high contrast */
export function prefersHighContrast(): boolean {
  return getPreference("moreContrast") || getPreference("forcedColors");
}

/** Generates aria-live region content for breakpoint announcements */
export function announceBreakpoint(breakpoint: string, previousBreakpoint?: string): string {
  const current = normalizeBreakpoint(breakpoint) || "default";
  const previous = previousBreakpoint ? normalizeBreakpoint(previousBreakpoint) : "";

  if (!previous || previous === current) {
    return `Layout adjusted to ${current} breakpoint.`;
  }

  return `Layout adjusted from ${previous} to ${current} breakpoint.`;
}

/** Calculate optimal line length (45-75 chars) for a given viewport width and font size */
export function optimalLineLength(
  viewportWidth: number,
  fontSizePx: number,
  options?: { containerPadding?: number; minChars?: number; maxChars?: number },
): { maxWidth: string; chars: number } {
  const containerPadding = Math.max(toFiniteNumber(options?.containerPadding ?? 0, 0), 0);
  const requestedMinChars = Math.max(
    toFiniteNumber(options?.minChars ?? DEFAULT_MIN_CHARS, DEFAULT_MIN_CHARS),
    1,
  );
  const requestedMaxChars = Math.max(
    toFiniteNumber(options?.maxChars ?? DEFAULT_MAX_CHARS, DEFAULT_MAX_CHARS),
    1,
  );
  const maxChars = requestedMaxChars;
  const minChars = Math.min(requestedMinChars, maxChars);
  const width = Math.max(toFiniteNumber(viewportWidth, MIN_VIEWPORT), 0);
  const effectiveFontSize = Math.max(toFiniteNumber(fontSizePx, DEFAULT_FONT_MIN), 1);
  const padding = options?.containerPadding == null ? DEFAULT_CONTAINER_PADDING : containerPadding;
  const availableWidth = Math.max(width - padding * 2, effectiveFontSize);
  const characterWidth = effectiveFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const rawChars = Math.max(1, Math.round(availableWidth / characterWidth));
  const chars = rawChars < minChars ? rawChars : clamp(rawChars, minChars, maxChars);
  const maxWidth = roundToTwo(chars * characterWidth);

  return {
    maxWidth: formatPx(Math.min(maxWidth, availableWidth)),
    chars,
  };
}
