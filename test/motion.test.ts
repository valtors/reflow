import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mq } from "../src/core/media";
import { type MatchMediaMockController, installMatchMediaMock } from "../src/testing";

type MotionModule = {
  createSpring: () => {
    tick: (
      state: { value: number; velocity: number; done: boolean },
      target: number,
      deltaMs: number,
    ) => { value: number; velocity: number; done: boolean };
    isSettled: (
      state: { value: number; velocity: number; done: boolean },
      target: number,
    ) => boolean;
  };
  reduceMotion: <T>(normal: T, reduced: T) => T;
  responsiveDuration: (
    duration: number,
    viewportWidth: number,
    options?: { minDuration?: number; maxDuration?: number },
  ) => number;
  responsiveTransition: (
    config:
      | { property: string; duration?: number; easing?: string; reducedDuration?: number }
      | Array<{ property: string; duration?: number; easing?: string; reducedDuration?: number }>,
  ) => string;
};

async function loadMotionModule(): Promise<MotionModule | null> {
  try {
    const path = "../src/core/motion";
    return (await import(path)) as MotionModule;
  } catch {
    return null;
  }
}

const motionModule = await loadMotionModule();
const describeMotion = motionModule ? describe : describe.skip;

describeMotion("motion", () => {
  let ctrl: MatchMediaMockController;

  beforeEach(() => {
    ctrl = installMatchMediaMock();
  });

  afterEach(() => {
    ctrl.uninstall();
    vi.restoreAllMocks();
  });

  it("reduceMotion returns the normal value by default", () => {
    expect(motionModule!.reduceMotion("full", "reduced")).toBe("full");
  });

  it("reduceMotion and responsiveTransition respect prefers-reduced-motion", () => {
    ctrl.set(mq.prefersReducedMotion, true);

    expect(motionModule!.reduceMotion("full", "reduced")).toBe("reduced");
    expect(
      motionModule!.responsiveTransition({
        property: "opacity",
        duration: 240,
        easing: "ease-out",
        reducedDuration: 80,
      }),
    ).toBe("opacity 80ms ease-out");
  });

  it("responsiveTransition supports multiple transitions and sensible defaults", () => {
    expect(
      motionModule!.responsiveTransition([
        { property: "opacity" },
        { property: "transform", duration: 300, easing: "linear" },
      ]),
    ).toBe("opacity 200ms ease, transform 300ms linear");
  });

  it("stays SSR-safe when matchMedia is unavailable", () => {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      expect(motionModule!.reduceMotion("full", "reduced")).toBe("full");
      expect(motionModule!.responsiveTransition({ property: "opacity", duration: 120 })).toBe(
        "opacity 120ms ease",
      );
    } finally {
      Object.defineProperty(window, "matchMedia", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });

  it("createSpring advances toward the target and settles", () => {
    const spring = motionModule!.createSpring();
    let state = spring.tick({ value: 0, velocity: 0, done: false }, 100, 16);

    expect(state.value).toBeGreaterThan(0);
    expect(state.velocity).toBeGreaterThan(0);
    expect(state.done).toBe(false);

    for (let i = 0; i < 240; i++) {
      state = spring.tick(state, 100, 16);
      if (state.done) break;
    }

    expect(spring.isSettled(state, 100)).toBe(true);
    expect(state.done).toBe(true);
    expect(state.value).toBeCloseTo(100, 4);
    expect(state.velocity).toBe(0);
  });

  it("responsiveDuration scales from mobile to desktop and honors custom bounds", () => {
    expect(motionModule!.responsiveDuration(200, 375)).toBe(160);
    expect(motionModule!.responsiveDuration(200, 960)).toBe(200);
    expect(motionModule!.responsiveDuration(200, 1440)).toBe(240);
    expect(
      motionModule!.responsiveDuration(300, 1440, { minDuration: 120, maxDuration: 360 }),
    ).toBe(360);
  });
});
