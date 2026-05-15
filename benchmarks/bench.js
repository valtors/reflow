import { bench, do_not_optimize, group, run } from "mitata";

const fallbackDefaultBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const fallbackMq = {
  prefersDark: "(prefers-color-scheme: dark)",
  prefersLight: "(prefers-color-scheme: light)",
  prefersReducedMotion: "(prefers-reduced-motion: reduce)",
  prefersReducedData: "(prefers-reduced-data: reduce)",
  prefersMoreContrast: "(prefers-contrast: more)",
  prefersLessContrast: "(prefers-contrast: less)",
  forcedColors: "(forced-colors: active)",
  invertedColors: "(inverted-colors: inverted)",
  hover: "(hover: hover)",
  noHover: "(hover: none)",
  anyHover: "(any-hover: hover)",
  fineCursor: "(pointer: fine)",
  coarseCursor: "(pointer: coarse)",
  noPointer: "(pointer: none)",
  anyFinePointer: "(any-pointer: fine)",
  anyCoarsePointer: "(any-pointer: coarse)",
  portrait: "(orientation: portrait)",
  landscape: "(orientation: landscape)",
  retina: "(min-resolution: 2dppx)",
  fastUpdate: "(update: fast)",
  slowUpdate: "(update: slow)",
  noUpdate: "(update: none)",
  print: "print",
  screen: "screen",
  horizontalFold: "(horizontal-viewport-segments: 2)",
  verticalFold: "(vertical-viewport-segments: 2)",
};

function fallbackCreateBreakpoints(breakpoints) {
  const keys = Object.keys(breakpoints)
    .slice()
    .sort((left, right) => breakpoints[left] - breakpoints[right]);

  if (keys.length === 0) {
    throw new Error("createBreakpoints: at least one breakpoint is required");
  }

  const indexOf = (key) => keys.indexOf(key);
  const up = (key) => {
    const value = breakpoints[key];
    if (value === undefined) throw new Error(`Unknown breakpoint: ${String(key)}`);
    return value <= 0 ? "all" : `(min-width: ${value}px)`;
  };
  const down = (key) => {
    const value = breakpoints[key];
    if (value === undefined) throw new Error(`Unknown breakpoint: ${String(key)}`);
    return `(max-width: ${Math.max(0, value - 0.02)}px)`;
  };
  const between = (min, max) => {
    const lower = breakpoints[min];
    const upper = breakpoints[max];
    if (lower === undefined || upper === undefined) {
      throw new Error(`Unknown breakpoint in between(${String(min)}, ${String(max)})`);
    }
    return `(min-width: ${lower}px) and (max-width: ${Math.max(0, upper - 0.02)}px)`;
  };
  const only = (key) => {
    const index = indexOf(key);
    if (index === -1) throw new Error(`Unknown breakpoint: ${String(key)}`);
    const next = keys[index + 1];
    return next ? between(key, next) : up(key);
  };
  const resolve = (width) => {
    let active = keys[0];
    for (const key of keys) {
      if (width >= breakpoints[key]) active = key;
      else break;
    }
    return active;
  };

  return { breakpoints, keys, resolve, up, down, between, only };
}

const fallbackDefaultSystem = fallbackCreateBreakpoints(fallbackDefaultBreakpoints);

function fallbackWatchMedia(query) {
  const isBrowser = typeof window !== "undefined" && typeof window.matchMedia === "function";
  if (!isBrowser) {
    return {
      query,
      matches: () => false,
      subscribe: () => () => {},
    };
  }

  const mql = window.matchMedia(query);
  return {
    query,
    matches: () => mql.matches,
    subscribe(listener) {
      const handler = (event) => listener(event.matches);
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      }
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    },
  };
}

function fallbackObservePreference(key, listener) {
  const queryByKey = {
    dark: fallbackMq.prefersDark,
    forcedColors: fallbackMq.forcedColors,
    invertedColors: fallbackMq.invertedColors,
    lessContrast: fallbackMq.prefersLessContrast,
    light: fallbackMq.prefersLight,
    moreContrast: fallbackMq.prefersMoreContrast,
    reducedData: fallbackMq.prefersReducedData,
    reducedMotion: fallbackMq.prefersReducedMotion,
  };

  return fallbackWatchMedia(queryByKey[key]).subscribe(listener);
}

function fallbackCreateFluidityStore(system, options = {}) {
  const isBrowser = () => typeof window !== "undefined";
  const buildSnapshot = (width, height) => ({
    width,
    height,
    active: system.resolve(width),
    orientation: height >= width ? "portrait" : "landscape",
  });
  const initialWidth = options.initialWidth ?? (isBrowser() ? window.innerWidth : 1024);
  const initialHeight = options.initialHeight ?? (isBrowser() ? window.innerHeight : 768);

  let snapshot = buildSnapshot(initialWidth, initialHeight);
  let serverSnapshot = snapshot;
  const listeners = new Set();
  let resizeAttached = false;
  let detach = null;

  const recompute = () => {
    if (!isBrowser()) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === snapshot.width && height === snapshot.height) return;
    snapshot = buildSnapshot(width, height);
    for (const listener of listeners) listener();
  };

  const attach = () => {
    if (resizeAttached || !isBrowser()) return;
    resizeAttached = true;
    let scheduled = false;
    const onResize = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        recompute();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    recompute();
    detach = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      resizeAttached = false;
    };
  };

  return {
    system,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    setServerSnapshot(partial) {
      const merged = { ...serverSnapshot, ...partial };
      if (partial.width !== undefined || partial.height !== undefined) {
        serverSnapshot = buildSnapshot(merged.width, merged.height);
      } else {
        serverSnapshot = merged;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      attach();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          detach?.();
          detach = null;
        }
      };
    },
  };
}

function round(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function fallbackFluidClamp(opts) {
  const {
    minPx,
    maxPx,
    minVwPx = 320,
    maxVwPx = 1280,
    rootPx = 16,
    unit = "rem",
    precision = 4,
  } = opts;

  if (maxVwPx === minVwPx) {
    throw new Error("fluidClamp: minVwPx and maxVwPx must differ");
  }
  if (maxVwPx < minVwPx) {
    throw new Error(
      `fluidClamp: maxVwPx must be greater than minVwPx (got min=${minVwPx}, max=${maxVwPx}). Did you swap the arguments?`,
    );
  }

  const lower = Math.min(minPx, maxPx);
  const upper = Math.max(minPx, maxPx);
  const slope = (maxPx - minPx) / (maxVwPx - minVwPx);
  const interceptPx = minPx - slope * minVwPx;
  const slopeVw = slope * 100;
  const format = (value) =>
    unit === "px" ? `${round(value, precision)}px` : `${round(value / rootPx, precision)}rem`;

  return `clamp(${format(lower)}, ${format(interceptPx)} + ${round(slopeVw, precision)}vw, ${format(upper)})`;
}

async function loadRuntime() {
  let core = {};
  let styles = {};

  try {
    core = await import("../dist/index.js");
  } catch {}

  try {
    styles = await import("../dist/styles/index.js");
  } catch {}

  return {
    createBreakpoints: core.createBreakpoints ?? fallbackCreateBreakpoints,
    createFluidityStore: core.createFluidityStore ?? fallbackCreateFluidityStore,
    defaultBreakpoints: core.defaultBreakpoints ?? fallbackDefaultBreakpoints,
    defaultSystem: core.defaultSystem ?? fallbackDefaultSystem,
    mq: core.mq ?? fallbackMq,
    observePreference: core.observePreference ?? fallbackObservePreference,
    fluidClamp: styles.fluidClamp ?? fallbackFluidClamp,
  };
}

const {
  createBreakpoints,
  createFluidityStore,
  defaultBreakpoints,
  defaultSystem,
  mq,
  observePreference,
  fluidClamp,
} = await loadRuntime();

const noop = () => {};

const realisticBreakpoints = {
  watch: 0,
  compact: 360,
  phone: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
  cinema: 1920,
};

const widthCases = [320, 375, 640, 768, 1024, 1280, 1536, 1920];

const clampCases = [
  {
    name: "body copy",
    opts: { minPx: 16, maxPx: 22, minVwPx: 360, maxVwPx: 1440 },
  },
  {
    name: "display heading",
    opts: { minPx: 32, maxPx: 72, minVwPx: 375, maxVwPx: 1600, precision: 5 },
  },
  {
    name: "dense spacing",
    opts: { minPx: 8, maxPx: 24, minVwPx: 320, maxVwPx: 1280, unit: "px" },
  },
];

const preferenceQueries = {
  dark: mq.prefersDark,
  reducedMotion: mq.prefersReducedMotion,
  forcedColors: mq.forcedColors,
};

function createNaiveBreakpoints(breakpoints) {
  const entries = Object.entries(breakpoints).sort(([, left], [, right]) => left - right);

  return {
    keys: entries.map(([key]) => key),
    resolve(width) {
      let active = entries[0]?.[0] ?? "unknown";
      for (let index = 0; index < entries.length; index += 1) {
        const [key, minWidth] = entries[index];
        if (width >= minWidth) active = key;
        else break;
      }
      return active;
    },
  };
}

function createNaiveStore(system, options = {}) {
  const width = options.initialWidth ?? 1024;
  const height = options.initialHeight ?? 768;
  const snapshot = {
    width,
    height,
    active: system.resolve(width),
    orientation: height >= width ? "portrait" : "landscape",
  };
  const listeners = [];

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      };
    },
  };
}

function naiveFluidClamp(opts) {
  const {
    minPx,
    maxPx,
    minVwPx = 320,
    maxVwPx = 1280,
    rootPx = 16,
    unit = "rem",
    precision = 4,
  } = opts;
  const lower = Math.min(minPx, maxPx);
  const upper = Math.max(minPx, maxPx);
  const slope = (maxPx - minPx) / (maxVwPx - minVwPx);
  const interceptPx = minPx - slope * minVwPx;
  const format = (value) => {
    const scaled = unit === "px" ? value : value / rootPx;
    const suffix = unit === "px" ? "px" : "rem";
    return `${Number(scaled.toFixed(precision))}${suffix}`;
  };

  return `clamp(${format(lower)}, ${format(interceptPx)} + ${Number((slope * 100).toFixed(precision))}vw, ${format(upper)})`;
}

function naiveObservePreference(key, listener) {
  const mql = window.matchMedia(preferenceQueries[key]);
  const handler = (event) => listener(event.matches);

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }

  mql.addListener(handler);
  return () => mql.removeListener(handler);
}

function installFakeBrowser() {
  const originalWindow = globalThis.window;
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancelRaf = globalThis.cancelAnimationFrame;
  const mediaWatchers = new Map();
  const windowListeners = new Map();

  const fakeWindow = {
    innerWidth: 1440,
    innerHeight: 900,
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, new Set());
      windowListeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      windowListeners.get(type)?.delete(listener);
    },
    matchMedia(query) {
      if (!mediaWatchers.has(query)) {
        mediaWatchers.set(query, {
          matches: query.includes("dark") || query.includes("reduce") || query.includes("forced"),
          listeners: new Set(),
        });
      }

      const record = mediaWatchers.get(query);

      return {
        media: query,
        get matches() {
          return record.matches;
        },
        addEventListener(type, listener) {
          if (type === "change") record.listeners.add(listener);
        },
        removeEventListener(type, listener) {
          if (type === "change") record.listeners.delete(listener);
        },
        addListener(listener) {
          record.listeners.add(listener);
        },
        removeListener(listener) {
          record.listeners.delete(listener);
        },
      };
    },
  };

  globalThis.window = fakeWindow;
  globalThis.requestAnimationFrame = (callback) => {
    callback(Date.now());
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};

  return {
    restore() {
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;

      if (originalRaf === undefined) delete globalThis.requestAnimationFrame;
      else globalThis.requestAnimationFrame = originalRaf;

      if (originalCancelRaf === undefined) delete globalThis.cancelAnimationFrame;
      else globalThis.cancelAnimationFrame = originalCancelRaf;
    },
    getDiagnostics() {
      return {
        matchMediaQueries: mediaWatchers.size,
        windowEventTypes: windowListeners.size,
      };
    },
  };
}

const fakeBrowser = installFakeBrowser();
const naiveDefaultSystem = createNaiveBreakpoints(defaultBreakpoints);
const listenerBatch = Array.from({ length: 25 }, (_, index) => () => index);

console.log("Benchmark scenarios");
console.table([
  { benchmark: "createBreakpoints()", dataset: "default preset", sampleSize: Object.keys(defaultBreakpoints).length },
  { benchmark: "createBreakpoints()", dataset: "larger design-system preset", sampleSize: Object.keys(realisticBreakpoints).length },
  { benchmark: "breakpoint.resolve(width)", dataset: widthCases.join(", "), sampleSize: widthCases.length },
  { benchmark: "createFluidityStore()", dataset: "1440x900 browser snapshot", sampleSize: 1 },
  { benchmark: "store subscribe/unsubscribe", dataset: "single listener and 25-listener churn", sampleSize: listenerBatch.length },
  { benchmark: "fluidClamp()", dataset: clampCases.map(({ name }) => name).join(", "), sampleSize: clampCases.length },
  { benchmark: "observePreference()", dataset: Object.keys(preferenceQueries).join(", "), sampleSize: Object.keys(preferenceQueries).length },
]);

console.log("Resolution sanity check");
console.table(
  widthCases.map((width) => ({
    width: `${width}px`,
    fluidity: defaultSystem.resolve(width),
    naive: naiveDefaultSystem.resolve(width),
  })),
);

console.log("Synthetic DOM diagnostics");
console.table([fakeBrowser.getDiagnostics()]);

group("createBreakpoints()", () => {
  bench("fluidity default preset", () => {
    do_not_optimize(createBreakpoints(defaultBreakpoints));
  });

  bench("naive default preset", () => {
    do_not_optimize(createNaiveBreakpoints(defaultBreakpoints));
  });

  bench("fluidity larger preset", () => {
    do_not_optimize(createBreakpoints(realisticBreakpoints));
  });

  bench("naive larger preset", () => {
    do_not_optimize(createNaiveBreakpoints(realisticBreakpoints));
  });
});

group("breakpoint.resolve(width)", () => {
  for (const width of widthCases) {
    bench(`fluidity ${width}px`, () => {
      do_not_optimize(defaultSystem.resolve(width));
    });

    bench(`naive ${width}px`, () => {
      do_not_optimize(naiveDefaultSystem.resolve(width));
    });
  }
});

group("createFluidityStore()", () => {
  bench("fluidity store", () => {
    do_not_optimize(createFluidityStore(defaultSystem, { initialWidth: 1440, initialHeight: 900 }));
  });

  bench("naive store", () => {
    do_not_optimize(createNaiveStore(naiveDefaultSystem, { initialWidth: 1440, initialHeight: 900 }));
  });
});

group("store subscribe/unsubscribe churn", () => {
  bench("fluidity single listener", () => {
    const store = createFluidityStore(defaultSystem, { initialWidth: 1440, initialHeight: 900 });
    const unsubscribe = store.subscribe(noop);
    unsubscribe();
  });

  bench("naive single listener", () => {
    const store = createNaiveStore(naiveDefaultSystem, { initialWidth: 1440, initialHeight: 900 });
    const unsubscribe = store.subscribe(noop);
    unsubscribe();
  });

  bench("fluidity 25 listeners", () => {
    const store = createFluidityStore(defaultSystem, { initialWidth: 1440, initialHeight: 900 });
    const unsubscribers = listenerBatch.map((listener) => store.subscribe(listener));
    for (const unsubscribe of unsubscribers) unsubscribe();
  });

  bench("naive 25 listeners", () => {
    const store = createNaiveStore(naiveDefaultSystem, { initialWidth: 1440, initialHeight: 900 });
    const unsubscribers = listenerBatch.map((listener) => store.subscribe(listener));
    for (const unsubscribe of unsubscribers) unsubscribe();
  });
});

group("fluidClamp() generation", () => {
  for (const { name, opts } of clampCases) {
    bench(`fluidity ${name}`, () => {
      do_not_optimize(fluidClamp(opts));
    });

    bench(`naive ${name}`, () => {
      do_not_optimize(naiveFluidClamp(opts));
    });
  }
});

group("observePreference() subscription setup", () => {
  for (const key of Object.keys(preferenceQueries)) {
    bench(`fluidity ${key}`, () => {
      const unsubscribe = observePreference(key, noop);
      unsubscribe();
    });

    bench(`naive ${key}`, () => {
      const unsubscribe = naiveObservePreference(key, noop);
      unsubscribe();
    });
  }
});

try {
  await run();
} finally {
  fakeBrowser.restore();
}
