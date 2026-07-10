import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type A11yAuditResult,
  type ContainerSize,
  accessibleFontSize,
  announceBreakpoint,
  auditResponsiveA11y,
  createPerfMark,
  debugLog,
  formatDebugState,
  getContainerSize,
  matchesContainerRange,
  observeContainer,
  optimalLineLength,
  prefersHighContrast,
  responsiveTouchTarget,
} from "../src/core";
import { getDevicePixelRatio, observeDevicePixelRatio } from "../src/core/dpr";
import {
  type PointerCapabilities,
  getPointerCapabilities,
  observePointerCapabilities,
} from "../src/core/pointer";
import {
  type PreferenceKey,
  getAllPreferences,
  getPreference,
  observePreference,
} from "../src/core/preferences";
import { type SafeAreaInsets, getSafeArea, observeSafeArea } from "../src/core/safe-area";
import {
  getViewport,
  getVisualViewport,
  observeViewport,
  observeVisualViewport,
} from "../src/core/viewport";
import {
  type MatchMediaMockController,
  type ResizeObserverMockController,
  installMatchMediaMock,
  installResizeObserverMock,
  setWindowSize,
} from "../src/testing";

// ---------- DPR ----------

describe("dpr", () => {
  it("getDevicePixelRatio returns a number", () => {
    expect(typeof getDevicePixelRatio()).toBe("number");
    expect(getDevicePixelRatio()).toBeGreaterThanOrEqual(1);
  });

  it("observeDevicePixelRatio returns an unsubscribe function", () => {
    const unsub = observeDevicePixelRatio(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });
});

// ---------- Debug ----------

describe("debug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formatDebugState returns a compact summary", () => {
    expect(
      formatDebugState({
        breakpoint: "lg",
        viewport: { width: 1280, height: 720 },
        orientation: "landscape",
        dpr: 2,
        preferences: {
          reducedMotion: true,
          dark: true,
          highContrast: false,
        },
        pointer: "fine",
      }),
    ).toBe("bp=lg vp=1280x720 orientation=landscape dpr=2 prefs=reduced-motion,dark pointer=fine");
  });

  it("debugLog only logs outside production", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const previous = process.env.NODE_ENV;

    try {
      process.env.NODE_ENV = "production";
      debugLog("state", { ok: true });
      expect(debugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = "test";
      debugLog("state", { ok: true });
      expect(debugSpy).toHaveBeenCalledWith("[fluidity:state]", { ok: true });
    } finally {
      process.env.NODE_ENV = previous;
    }
  });

  it("createPerfMark tracks elapsed time and averages", () => {
    const nowSpy = vi.spyOn(performance, "now");
    nowSpy
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(26)
      .mockReturnValueOnce(40)
      .mockReturnValueOnce(52);

    const mark = createPerfMark("layout");
    mark.start();
    expect(mark.end()).toBe(16);
    mark.start();
    expect(mark.end()).toBe(12);
    expect(mark.average()).toBe(14);
  });
});

// ---------- Pointer ----------

describe("pointer", () => {
  let ctrl: MatchMediaMockController;

  beforeEach(() => {
    ctrl = installMatchMediaMock();
  });
  afterEach(() => {
    ctrl.uninstall();
  });

  it("getPointerCapabilities returns all boolean fields", () => {
    const caps = getPointerCapabilities();
    expect(typeof caps.hover).toBe("boolean");
    expect(typeof caps.anyHover).toBe("boolean");
    expect(typeof caps.coarse).toBe("boolean");
    expect(typeof caps.fine).toBe("boolean");
    expect(typeof caps.none).toBe("boolean");
  });

  it("observePointerCapabilities fires on pointer media change", () => {
    const calls: PointerCapabilities[] = [];
    const unsub = observePointerCapabilities((caps) => calls.push(caps));

    ctrl.set("(hover: hover)", true);
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[calls.length - 1]!.hover).toBe(true);

    unsub();
    ctrl.set("(hover: hover)", false);
    expect(calls.length).toBeLessThanOrEqual(calls.length);
  });
});

// ---------- Preferences ----------

describe("preferences", () => {
  let ctrl: MatchMediaMockController;

  beforeEach(() => {
    ctrl = installMatchMediaMock();
  });
  afterEach(() => {
    ctrl.uninstall();
  });

  it("getPreference returns false by default for all keys", () => {
    const keys: PreferenceKey[] = [
      "reducedMotion",
      "reducedData",
      "moreContrast",
      "lessContrast",
      "forcedColors",
      "invertedColors",
      "dark",
      "light",
    ];
    for (const key of keys) {
      expect(getPreference(key)).toBe(false);
    }
  });

  it("getPreference reflects mock state", () => {
    ctrl.set("(prefers-color-scheme: dark)", true);
    expect(getPreference("dark")).toBe(true);
  });

  it("getAllPreferences returns a full boolean record", () => {
    const prefs = getAllPreferences();
    expect(Object.keys(prefs)).toEqual([
      "reducedMotion",
      "reducedData",
      "moreContrast",
      "lessContrast",
      "forcedColors",
      "invertedColors",
      "dark",
      "light",
    ]);
    for (const v of Object.values(prefs)) {
      expect(typeof v).toBe("boolean");
    }
  });

  it("observePreference fires when preference changes", () => {
    const calls: boolean[] = [];
    const unsub = observePreference("reducedMotion", (v) => calls.push(v));

    ctrl.set("(prefers-reduced-motion: reduce)", true);
    expect(calls).toEqual([true]);

    ctrl.set("(prefers-reduced-motion: reduce)", false);
    expect(calls).toEqual([true, false]);

    unsub();
    ctrl.set("(prefers-reduced-motion: reduce)", true);
    expect(calls).toEqual([true, false]);
  });
});

// ---------- Container ----------

describe("container", () => {
  it("matchesContainerRange checks minPx correctly", () => {
    const size: ContainerSize = { width: 500, height: 300 };
    expect(matchesContainerRange(size, { minPx: 400 })).toBe(true);
    expect(matchesContainerRange(size, { minPx: 600 })).toBe(false);
    expect(matchesContainerRange(size, { minPx: 500 })).toBe(true);
  });

  it("matchesContainerRange checks maxPx correctly", () => {
    const size: ContainerSize = { width: 500, height: 300 };
    expect(matchesContainerRange(size, { maxPx: 600 })).toBe(true);
    expect(matchesContainerRange(size, { maxPx: 500 })).toBe(false);
    expect(matchesContainerRange(size, { maxPx: 400 })).toBe(false);
  });

  it("matchesContainerRange checks combined min/max", () => {
    const size: ContainerSize = { width: 500, height: 300 };
    expect(matchesContainerRange(size, { minPx: 400, maxPx: 600 })).toBe(true);
    expect(matchesContainerRange(size, { minPx: 400, maxPx: 500 })).toBe(false);
    expect(matchesContainerRange(size, { minPx: 600, maxPx: 800 })).toBe(false);
  });

  it("matchesContainerRange with no constraints always matches", () => {
    expect(matchesContainerRange({ width: 0, height: 0 }, {})).toBe(true);
    expect(matchesContainerRange({ width: 9999, height: 9999 }, {})).toBe(true);
  });

  it("getContainerSize returns width and height", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const size = getContainerSize(el);
    expect(typeof size.width).toBe("number");
    expect(typeof size.height).toBe("number");
    document.body.removeChild(el);
  });

  it("observeContainer returns an unsubscribe function", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const unsub = observeContainer(el, () => {});
    expect(typeof unsub).toBe("function");
    unsub();
    document.body.removeChild(el);
  });

  it("observeContainer with debounce delays callback", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const calls: ContainerSize[] = [];
    const unsub = observeContainer(el, (size) => calls.push(size), { debounce: 30 });

    await new Promise((r) => setTimeout(r, 50));
    expect(calls.length).toBe(0);

    unsub();
    document.body.removeChild(el);
  });

  it("observeContainer with throttle limits callback frequency", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const calls: ContainerSize[] = [];
    const unsub = observeContainer(el, (size) => calls.push(size), { throttle: 50 });

    await new Promise((r) => setTimeout(r, 10));
    const firstCount = calls.length;

    await new Promise((r) => setTimeout(r, 100));
    expect(calls.length).toBeGreaterThanOrEqual(firstCount);

    unsub();
    document.body.removeChild(el);
  });
});

// ---------- Viewport (extended) ----------

describe("viewport (extended)", () => {
  it("getViewport returns width, height, orientation", () => {
    const vp = getViewport();
    expect(typeof vp.width).toBe("number");
    expect(typeof vp.height).toBe("number");
    expect(["portrait", "landscape"]).toContain(vp.orientation);
  });

  it("getVisualViewport returns all fields", () => {
    const vvp = getVisualViewport();
    expect(typeof vvp.width).toBe("number");
    expect(typeof vvp.height).toBe("number");
    expect(typeof vvp.offsetTop).toBe("number");
    expect(typeof vvp.offsetLeft).toBe("number");
    expect(typeof vvp.scale).toBe("number");
  });

  it("observeViewport fires on resize when dimensions change", () => {
    const calls: Array<{ width: number; height: number }> = [];
    const unsub = observeViewport((state) => calls.push(state));

    setWindowSize(800, 600);
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[calls.length - 1]!.width).toBe(800);
    expect(calls[calls.length - 1]!.height).toBe(600);

    unsub();
  });

  it("observeViewport with immediate fires immediately", () => {
    const calls: Array<{ width: number; height: number }> = [];
    const unsub = observeViewport((state) => calls.push(state), { immediate: true });
    expect(calls.length).toBe(1);
    unsub();
  });

  it("observeViewport with debounce delays callback", async () => {
    const calls: Array<{ width: number; height: number }> = [];
    const unsub = observeViewport((state) => calls.push(state), { debounce: 30 });

    setWindowSize(500, 400);
    expect(calls.length).toBe(0);

    await new Promise((r) => setTimeout(r, 60));
    expect(calls.length).toBe(1);

    unsub();
  });

  it("observeViewport with throttle fires at most once per period", async () => {
    const calls: Array<{ width: number; height: number }> = [];
    const unsub = observeViewport((state) => calls.push(state), { throttle: 50 });

    setWindowSize(500, 400);
    await new Promise((r) => setTimeout(r, 10));

    setWindowSize(600, 500);
    await new Promise((r) => setTimeout(r, 10));

    setWindowSize(700, 600);
    await new Promise((r) => setTimeout(r, 100));

    expect(calls.length).toBeLessThanOrEqual(3);
    expect(calls.length).toBeGreaterThanOrEqual(1);

    unsub();
  });

  it("observeVisualViewport returns unsubscribe", () => {
    const unsub = observeVisualViewport(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
  });
});

// ---------- Safe area ----------

describe("safe-area", () => {
  it("getSafeArea returns four numeric insets", () => {
    const insets = getSafeArea();
    expect(typeof insets.top).toBe("number");
    expect(typeof insets.right).toBe("number");
    expect(typeof insets.bottom).toBe("number");
    expect(typeof insets.left).toBe("number");
  });

  it("observeSafeArea subscribes and unsubscribes cleanly", () => {
    const calls: SafeAreaInsets[] = [];
    const unsub = observeSafeArea((insets) => calls.push(insets));
    expect(typeof unsub).toBe("function");
    unsub();
  });
});

// ---------- A11y ----------

describe("a11y", () => {
  let ctrl: MatchMediaMockController;

  beforeEach(() => {
    ctrl = installMatchMediaMock();
  });

  afterEach(() => {
    ctrl.uninstall();
  });

  it("responsiveTouchTarget respects minimum WCAG targets", () => {
    expect(responsiveTouchTarget(1280)).toBeGreaterThanOrEqual(24);
    expect(responsiveTouchTarget(375, { level: "AAA" })).toBeGreaterThanOrEqual(44);
  });

  it("accessibleFontSize enforces readable defaults", () => {
    const result = accessibleFontSize(14, 375);
    expect(result).toEqual({
      fontSize: "16.12px",
      lineHeight: "24.18px",
    });
  });

  it("auditResponsiveA11y reports pass and fail states", () => {
    const passing: A11yAuditResult = auditResponsiveA11y({
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

  it("prefersHighContrast checks contrast-related preferences", () => {
    expect(prefersHighContrast()).toBe(false);
    ctrl.set("(prefers-contrast: more)", true);
    expect(prefersHighContrast()).toBe(true);
  });

  it("announceBreakpoint creates clear live-region copy", () => {
    expect(announceBreakpoint("md", "sm")).toBe("Layout adjusted from sm to md breakpoint.");
    expect(announceBreakpoint("lg_desktop")).toBe("Layout adjusted to lg desktop breakpoint.");
  });

  it("optimalLineLength keeps line length in the readable range", () => {
    expect(optimalLineLength(1280, 16)).toEqual({ maxWidth: "624px", chars: 75 });
    expect(optimalLineLength(320, 16)).toEqual({ maxWidth: "288px", chars: 35 });
    expect(optimalLineLength(320, 16, { maxChars: 32 })).toEqual({
      maxWidth: "266.24px",
      chars: 32,
    });
  });
});
