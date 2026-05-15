import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  type BreakpointKey,
  type BreakpointMap,
  type BreakpointSystem,
  createBreakpoints,
  type defaultBreakpoints,
  defaultSystem,
} from "../core/breakpoints.js";
import {
  type FluidityStore,
  type FluidityStoreSnapshot,
  createFluidityStore,
} from "../core/store.js";

export interface FluidityControllerOptions<B extends BreakpointMap> {
  breakpoints?: B;
  system?: BreakpointSystem<B>;
  store?: FluidityStore<B>;
  initialWidth?: number;
  initialHeight?: number;
}

function resolveSystem<B extends BreakpointMap>(
  options: FluidityControllerOptions<B>,
): BreakpointSystem<B> {
  if (options.store) return options.store.system;
  if (options.system) return options.system;
  if (options.breakpoints) return createBreakpoints(options.breakpoints);
  return defaultSystem as unknown as BreakpointSystem<B>;
}

export class FluidityController<B extends BreakpointMap = typeof defaultBreakpoints>
  implements ReactiveController
{
  protected readonly host: ReactiveControllerHost;
  readonly system: BreakpointSystem<B>;
  readonly store: FluidityStore<B>;

  private snapshotInternal: FluidityStoreSnapshot<B>;
  private unsubscribe: (() => void) | undefined;

  constructor(host: ReactiveControllerHost, options: FluidityControllerOptions<B> = {}) {
    this.host = host;
    this.system = resolveSystem(options);
    this.store =
      options.store ??
      createFluidityStore(this.system, {
        initialWidth: options.initialWidth,
        initialHeight: options.initialHeight,
      });
    this.snapshotInternal = this.store.getServerSnapshot();
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof window === "undefined") return;
    this.unsubscribe?.();
    this.updateSnapshot(this.store.getSnapshot(), true);
    this.unsubscribe = this.store.subscribe(() => {
      this.updateSnapshot(this.store.getSnapshot());
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  protected updateSnapshot(snapshot: FluidityStoreSnapshot<B>, force = false): void {
    if (!force && this.snapshotInternal === snapshot) return;
    this.snapshotInternal = snapshot;
    this.host.requestUpdate();
  }

  get snapshot(): FluidityStoreSnapshot<B> {
    return this.snapshotInternal;
  }

  get width(): number {
    return this.snapshotInternal.width;
  }

  get height(): number {
    return this.snapshotInternal.height;
  }

  get orientation(): "portrait" | "landscape" {
    return this.snapshotInternal.orientation;
  }

  get active(): BreakpointKey<B> {
    return this.snapshotInternal.active;
  }

  get keys(): ReadonlyArray<BreakpointKey<B>> {
    return this.system.keys;
  }

  setServerSnapshot(snapshot: Partial<FluidityStoreSnapshot<B>>): void {
    this.store.setServerSnapshot(snapshot);
    if (typeof window === "undefined") {
      this.updateSnapshot(this.store.getServerSnapshot(), true);
    }
  }
}
