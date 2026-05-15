import { type ComponentChildren, h, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ResponsiveProvider,
  useBreakpoint,
  useMediaQuery,
  usePreference,
  useViewport,
} from "../src/preact";
import {
  type MatchMediaMockController,
  installMatchMediaMock,
  setWindowSize,
} from "../src/testing";

interface RenderHookResult<T> {
  readonly current: T;
  rerender(): void;
  unmount(): void;
}

function renderPreactHook<T>(
  hook: () => T,
  wrapper?: (children: ComponentChildren) => ComponentChildren,
): RenderHookResult<T> {
  let current!: T;
  const container = document.createElement("div");
  document.body.appendChild(container);

  const HookHarness = () => {
    current = hook();
    return null;
  };

  const Root = () => (wrapper ? wrapper(h(HookHarness, {})) : h(HookHarness, {}));

  act(() => {
    render(h(Root, {}), container);
  });

  return {
    get current() {
      return current;
    },
    rerender() {
      act(() => {
        render(h(Root, {}), container);
      });
    },
    unmount() {
      act(() => {
        render(null, container);
      });
      container.remove();
    },
  };
}

describe("Preact adapter", () => {
  let mm: MatchMediaMockController;

  beforeEach(() => {
    mm = installMatchMediaMock();
    setWindowSize(1024, 768);
  });

  afterEach(() => {
    mm.uninstall();
  });

  it("useBreakpoint() returns active key + helpers", () => {
    const result = renderPreactHook(
      () => useBreakpoint(),
      (children) => h(ResponsiveProvider, { serverWidth: 1024, serverHeight: 768 }, children),
    );

    expect(result.current.active).toBe("lg");
    expect(result.current.is("lg")).toBe(true);
    expect(result.current.above("md")).toBe(true);
    expect(result.current.below("xl")).toBe(true);
    expect(result.current.between("sm", "xl")).toBe(true);

    result.unmount();
  });

  it("useBreakpoint() updates on resize", () => {
    const result = renderPreactHook(
      () => useBreakpoint(),
      (children) => h(ResponsiveProvider, { serverWidth: 1024, serverHeight: 768 }, children),
    );

    expect(result.current.active).toBe("lg");

    act(() => {
      setWindowSize(400, 800);
    });
    expect(result.current.active).toBe("xs");

    act(() => {
      setWindowSize(800, 600);
    });
    expect(result.current.active).toBe("md");

    result.unmount();
  });

  it("useViewport() reflects window dimensions", () => {
    const result = renderPreactHook(
      () => useViewport(),
      (children) => h(ResponsiveProvider, {}, children),
    );

    act(() => {
      setWindowSize(800, 600);
    });

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
    expect(result.current.orientation).toBe("landscape");

    result.unmount();
  });

  it("useMediaQuery() flips when match-media mock changes", () => {
    const result = renderPreactHook(() => useMediaQuery("(prefers-color-scheme: dark)"));

    expect(result.current).toBe(false);

    act(() => {
      mm.set("(prefers-color-scheme: dark)", true);
    });

    expect(result.current).toBe(true);

    result.unmount();
  });

  it("usePreference() reflects reducedMotion", () => {
    const result = renderPreactHook(() => usePreference("reducedMotion"));

    expect(result.current).toBe(false);

    act(() => {
      mm.set("(prefers-reduced-motion: reduce)", true);
    });

    expect(result.current).toBe(true);

    result.unmount();
  });

  it("works without a provider via ambient store", () => {
    const result = renderPreactHook(() => useViewport());

    expect(typeof result.current.width).toBe("number");

    result.unmount();
  });
});
