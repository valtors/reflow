import { describe, expect, it } from "vitest";
import {
  accessibleFontSize,
  auditResponsiveA11y,
  optimalLineLength,
  responsiveTouchTarget,
} from "../src/core/a11y";

const px = (value: string): number => Number.parseFloat(value);

describe("a11y", () => {
  it("responsiveTouchTarget meets WCAG minimums", () => {
    expect(responsiveTouchTarget(1280)).toBeGreaterThanOrEqual(24);
    expect(responsiveTouchTarget(375, { level: "AAA" })).toBeGreaterThanOrEqual(44);
  });

  it("accessibleFontSize stays within bounds", () => {
    const result = accessibleFontSize(14, 375, { minPx: 16, maxPx: 20 });

    expect(px(result.fontSize)).toBeGreaterThanOrEqual(16);
    expect(px(result.fontSize)).toBeLessThanOrEqual(20);
    expect(px(result.lineHeight)).toBeGreaterThan(px(result.fontSize));
  });

  it("auditResponsiveA11y reports correct pass/fail", () => {
    const passing = auditResponsiveA11y({
      touchTargetPx: 44,
      fontSizePx: 16,
      tapSpacingPx: 12,
      level: "AAA",
    });
    const failing = auditResponsiveA11y({ touchTargetPx: 20, fontSizePx: 14, tapSpacingPx: 4 });

    expect(passing.touchTarget.passes).toBe(true);
    expect(passing.fontSize.passes).toBe(true);
    expect(passing.tapSpacing.passes).toBe(true);
    expect(failing.touchTarget.passes).toBe(false);
    expect(failing.fontSize.passes).toBe(false);
    expect(failing.tapSpacing.passes).toBe(false);
  });

  it("optimalLineLength stays in 45-75 char range", () => {
    const tablet = optimalLineLength(768, 16);
    const desktop = optimalLineLength(1280, 16);

    expect(tablet.chars).toBeGreaterThanOrEqual(45);
    expect(tablet.chars).toBeLessThanOrEqual(75);
    expect(desktop.chars).toBeGreaterThanOrEqual(45);
    expect(desktop.chars).toBeLessThanOrEqual(75);
  });
});
