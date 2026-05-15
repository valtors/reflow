import { LitElement } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BreakpointController,
  ColorSchemeController,
  ContainerQueryController,
  MediaQueryController,
  PointerController,
  PreferenceController,
  ViewportController,
  responsiveMixin,
} from "../src/lit";
import {
  type MatchMediaMockController,
  type ResizeObserverMockController,
  installMatchMediaMock,
  installResizeObserverMock,
  setWindowSize,
} from "../src/testing";

function defineOnce(name: string, ctor: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
}

function setElementSize(el: Element, width: number, height: number) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  } as DOMRect);
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

class BreakpointHost extends LitElement {
  readonly breakpointController = new BreakpointController(this);
}

defineOnce("fluidity-lit-breakpoint-host", BreakpointHost);

class SignalsHost extends LitElement {
  readonly viewportController = new ViewportController(this);
  readonly mediaQueryController = new MediaQueryController(this, "(prefers-color-scheme: dark)");
  readonly preferenceController = new PreferenceController(this, "reducedMotion");
  readonly pointerController = new PointerController(this);
}

defineOnce("fluidity-lit-signals-host", SignalsHost);

class ThemeHost extends LitElement {
  readonly colorSchemeController = new ColorSchemeController(this, { storageKey: "theme" });
}

defineOnce("fluidity-lit-theme-host", ThemeHost);

class ContainerHost extends LitElement {
  readonly containerController = new ContainerQueryController(this, {
    range: { minPx: 300, maxPx: 600 },
  });
}

defineOnce("fluidity-lit-container-host", ContainerHost);

const ResponsiveBase = responsiveMixin(LitElement);

class ResponsiveHost extends ResponsiveBase {}

defineOnce("fluidity-lit-responsive-host", ResponsiveHost);

describe("Lit adapter", () => {
  let mm: MatchMediaMockController;
  let ro: ResizeObserverMockController;

  beforeEach(() => {
    mm = installMatchMediaMock();
    ro = installResizeObserverMock();
    setWindowSize(1024, 768);
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    localStorage.clear();
    ro.uninstall();
    mm.uninstall();
  });

  it("BreakpointController reacts to viewport changes", async () => {
    const el = document.createElement("fluidity-lit-breakpoint-host") as BreakpointHost;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.breakpointController.active).toBe("lg");
    expect(el.breakpointController.is("lg")).toBe(true);
    expect(el.breakpointController.above("md")).toBe(true);
    expect(el.breakpointController.below("xl")).toBe(true);

    setWindowSize(400, 800);
    await flush();
    await el.updateComplete;

    expect(el.breakpointController.active).toBe("xs");
    expect(el.breakpointController.between("sm", "xl")).toBe(false);
  });

  it("media, preference, pointer, and viewport controllers stay reactive", async () => {
    const el = document.createElement("fluidity-lit-signals-host") as SignalsHost;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.viewportController.width).toBe(1024);
    expect(el.viewportController.orientation).toBe("landscape");
    expect(el.mediaQueryController.matches).toBe(false);
    expect(el.preferenceController.active).toBe(false);
    expect(el.pointerController.coarse).toBe(false);

    mm.set("(prefers-color-scheme: dark)", true);
    mm.set("(prefers-reduced-motion: reduce)", true);
    mm.set("(pointer: coarse)", true);
    setWindowSize(500, 900);
    await flush();
    await el.updateComplete;

    expect(el.viewportController.width).toBe(500);
    expect(el.viewportController.orientation).toBe("portrait");
    expect(el.mediaQueryController.matches).toBe(true);
    expect(el.preferenceController.active).toBe(true);
    expect(el.pointerController.coarse).toBe(true);
  });

  it("ColorSchemeController resolves system state and local overrides", async () => {
    mm.set("(prefers-color-scheme: dark)", true);
    const el = document.createElement("fluidity-lit-theme-host") as ThemeHost;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.colorSchemeController.colorScheme).toBe("dark");
    expect(el.colorSchemeController.isDark).toBe(true);

    el.colorSchemeController.setColorScheme("light");
    await el.updateComplete;

    expect(el.colorSchemeController.colorScheme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    mm.set("(prefers-color-scheme: dark)", false);
    await flush();
    await el.updateComplete;
    expect(el.colorSchemeController.colorScheme).toBe("light");

    el.colorSchemeController.setColorScheme(null);
    await el.updateComplete;

    expect(el.colorSchemeController.colorScheme).toBe("light");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("ContainerQueryController tracks element size", async () => {
    const el = document.createElement("fluidity-lit-container-host") as ContainerHost;
    setElementSize(el, 320, 200);
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.containerController.matches).toBe(true);
    expect(el.containerController.width).toBe(320);

    setElementSize(el, 640, 200);
    ro.resize(el, { width: 640, height: 200 });
    await flush();
    await el.updateComplete;

    expect(el.containerController.matches).toBe(false);
    expect(el.containerController.width).toBe(640);
  });

  it("responsiveMixin adds breakpoint helpers to Lit elements", async () => {
    const el = document.createElement("fluidity-lit-responsive-host") as ResponsiveHost;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.breakpoint).toBe("lg");
    expect(el.viewportWidth).toBe(1024);
    expect(el.aboveBreakpoint("md")).toBe(true);
    expect(el.belowBreakpoint("xl")).toBe(true);

    setWindowSize(768, 1024);
    await flush();
    await el.updateComplete;

    expect(el.breakpoint).toBe("md");
    expect(el.orientation).toBe("portrait");
    expect(el.isBreakpoint("md")).toBe(true);
  });
});
