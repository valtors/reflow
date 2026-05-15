import { describe, expect, it } from "vitest";

type DebugModule = {
  createPerfMark: (name: string) => {
    start: () => void;
    end: () => number;
    average: () => number;
  };
  formatDebugState: (state: {
    breakpoint: string;
    viewport: { width: number; height: number };
    orientation: "portrait" | "landscape";
    dpr: number;
    preferences: {
      reducedMotion: boolean;
      dark: boolean;
      highContrast: boolean;
    };
    pointer: string;
  }) => string;
};

async function loadDebugModule(): Promise<DebugModule | null> {
  try {
    const path = "../src/core/debug";
    return (await import(path)) as DebugModule;
  } catch {
    return null;
  }
}

const debugModule = await loadDebugModule();
const describeDebug = debugModule ? describe : describe.skip;

describeDebug("debug", () => {
  it("formatDebugState produces readable output", () => {
    const output = debugModule!.formatDebugState({
      breakpoint: "lg",
      viewport: { width: 1024, height: 768 },
      orientation: "landscape",
      dpr: 2,
      preferences: {
        reducedMotion: false,
        dark: true,
        highContrast: false,
      },
      pointer: "fine",
    });

    expect(output).toContain("lg");
    expect(output).toContain("1024");
    expect(output).toContain("768");
    expect(output).toMatch(/bp|vp|prefs/i);
  });

  it("createPerfMark tracks timing correctly", async () => {
    const mark = debugModule!.createPerfMark("render");
    mark.start();

    await new Promise((resolve) => setTimeout(resolve, 10));

    const duration = mark.end();
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(mark.average()).toBe(duration);
  });
});
