/** Layout viewport dimensions and orientation. */
export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
}

/** Visual viewport state — accounts for pinch-zoom, on-screen keyboard. */
export interface VisualViewportState {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
  scale: number;
}

export type ViewportListener = (state: ViewportState) => void;

const isBrowser = (): boolean => typeof window !== "undefined";

function read(): ViewportState {
  if (!isBrowser()) {
    return { width: 0, height: 0, orientation: "landscape" };
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    width: w,
    height: h,
    orientation: h >= w ? "portrait" : "landscape",
  };
}

/**
 * Observe viewport size + orientation. Throttled to animation frames.
 * Returns an unsubscribe function. SSR-safe.
 */
export function observeViewport(
  listener: ViewportListener,
  options: { immediate?: boolean; debounce?: number; throttle?: number } = {},
): () => void {
  if (!isBrowser()) return () => {};

  let scheduled = false;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastFire = 0;

  const fire = () => {
    scheduled = false;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastFire = Date.now();
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w === lastWidth && h === lastHeight) return;
    lastWidth = w;
    lastHeight = h;
    listener({
      width: w,
      height: h,
      orientation: h >= w ? "portrait" : "landscape",
    });
  };

  const onResize = () => {
    if (options.debounce) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(fire, options.debounce);
    } else if (options.throttle) {
      const elapsed = Date.now() - lastFire;
      if (elapsed >= options.throttle) {
        fire();
      } else if (!timeoutId) {
        timeoutId = setTimeout(fire, options.throttle - elapsed);
      }
    } else if (!scheduled) {
      scheduled = true;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(fire);
      } else {
        setTimeout(fire, 16);
      }
    }
  };

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  if (options.immediate) listener(read());

  return () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/** Snapshot of current viewport state. SSR-safe. */
export function getViewport(): ViewportState {
  return read();
}

/**
 * Read the visual viewport (accounts for on-screen keyboard, pinch-zoom).
 * Falls back to layout viewport when `visualViewport` API is unavailable.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
 */
export function getVisualViewport(): VisualViewportState {
  if (!isBrowser()) {
    return { width: 0, height: 0, offsetTop: 0, offsetLeft: 0, scale: 1 };
  }
  const vv = window.visualViewport;
  if (vv) {
    return {
      width: vv.width,
      height: vv.height,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
      scale: vv.scale,
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 1,
  };
}

/**
 * Subscribe to visual viewport changes (pinch-zoom, on-screen keyboard).
 * Falls back to no-op when `window.visualViewport` is unavailable.
 */
export function observeVisualViewport(listener: (state: VisualViewportState) => void): () => void {
  if (!isBrowser() || !window.visualViewport) return () => {};
  const vv = window.visualViewport;
  let scheduled = false;
  const fire = () => {
    scheduled = false;
    listener(getVisualViewport());
  };
  const onChange = () => {
    if (scheduled) return;
    scheduled = true;
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(fire);
    else setTimeout(fire, 16);
  };
  vv.addEventListener("resize", onChange);
  vv.addEventListener("scroll", onChange);
  return () => {
    vv.removeEventListener("resize", onChange);
    vv.removeEventListener("scroll", onChange);
  };
}
