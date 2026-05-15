import type { ReactiveController, ReactiveControllerHost } from "lit";
import { type ViewportState, getViewport, observeViewport } from "../core/viewport.js";

export interface ViewportControllerOptions {
  initialWidth?: number;
  initialHeight?: number;
}

function createInitialState(options: ViewportControllerOptions): ViewportState {
  if (typeof window !== "undefined") {
    return getViewport();
  }

  const width = options.initialWidth ?? 0;
  const height = options.initialHeight ?? 0;
  return {
    width,
    height,
    orientation: height >= width ? "portrait" : "landscape",
  };
}

export class ViewportController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly options: ViewportControllerOptions;
  private unsubscribe: (() => void) | undefined;
  private stateInternal: ViewportState;

  constructor(host: ReactiveControllerHost, options: ViewportControllerOptions = {}) {
    this.host = host;
    this.options = options;
    this.stateInternal = createInitialState(options);
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof window === "undefined") return;
    this.unsubscribe?.();
    this.updateState(getViewport(), true);
    this.unsubscribe = observeViewport((state) => {
      this.updateState(state);
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private updateState(state: ViewportState, force = false): void {
    if (
      !force &&
      this.stateInternal.width === state.width &&
      this.stateInternal.height === state.height &&
      this.stateInternal.orientation === state.orientation
    ) {
      return;
    }

    this.stateInternal = state;
    this.host.requestUpdate();
  }

  get state(): ViewportState {
    return this.stateInternal;
  }

  get width(): number {
    return this.stateInternal.width;
  }

  get height(): number {
    return this.stateInternal.height;
  }

  get orientation(): "portrait" | "landscape" {
    return this.stateInternal.orientation;
  }
}
