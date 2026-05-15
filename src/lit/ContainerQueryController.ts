import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  type ContainerSize,
  getContainerSize,
  matchesContainerRange,
  observeContainer,
} from "../core/container.js";

export interface ContainerQueryRange {
  minPx?: number;
  maxPx?: number;
}

export interface ContainerQueryControllerOptions {
  target?: Element | null;
  range?: ContainerQueryRange;
  serverDefault?: boolean;
  serverSize?: ContainerSize;
}

export class ContainerQueryController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private unsubscribe: (() => void) | undefined;
  private connected = false;
  private targetInternal: Element | null;
  private rangeInternal: ContainerQueryRange;
  private sizeInternal: ContainerSize;
  private matchesInternal: boolean;

  constructor(host: ReactiveControllerHost, options: ContainerQueryControllerOptions = {}) {
    this.host = host;
    this.targetInternal = options.target ?? null;
    this.rangeInternal = {
      minPx: options.range?.minPx,
      maxPx: options.range?.maxPx,
    };
    this.sizeInternal = options.serverSize ?? { width: 0, height: 0 };
    this.matchesInternal =
      options.serverDefault ?? matchesContainerRange(this.sizeInternal, this.rangeInternal);
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof window === "undefined") return;
    this.connected = true;
    this.start();
  }

  hostDisconnected(): void {
    this.connected = false;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private resolveTarget(): Element | null {
    if (this.targetInternal) return this.targetInternal;
    return this.host instanceof Element ? this.host : null;
  }

  private start(): void {
    this.unsubscribe?.();
    if (!this.connected || typeof window === "undefined") return;
    const target = this.resolveTarget();
    if (!target) return;
    this.updateSize(getContainerSize(target), true);
    this.unsubscribe = observeContainer(target, (size) => this.updateSize(size));
  }

  private updateSize(size: ContainerSize, force = false): void {
    const matches = matchesContainerRange(size, this.rangeInternal);
    if (
      !force &&
      this.sizeInternal.width === size.width &&
      this.sizeInternal.height === size.height &&
      this.matchesInternal === matches
    ) {
      return;
    }

    this.sizeInternal = size;
    this.matchesInternal = matches;
    this.host.requestUpdate();
  }

  get target(): Element | null {
    return this.resolveTarget();
  }

  get size(): ContainerSize {
    return this.sizeInternal;
  }

  get width(): number {
    return this.sizeInternal.width;
  }

  get height(): number {
    return this.sizeInternal.height;
  }

  get matches(): boolean {
    return this.matchesInternal;
  }

  setTarget(target: Element | null | undefined): void {
    this.targetInternal = target ?? null;
    this.start();
  }

  setRange(range: ContainerQueryRange): void {
    this.rangeInternal = {
      minPx: range.minPx,
      maxPx: range.maxPx,
    };
    const target = this.resolveTarget();
    if (typeof window !== "undefined" && target) {
      this.updateSize(getContainerSize(target), true);
    } else {
      this.matchesInternal = matchesContainerRange(this.sizeInternal, this.rangeInternal);
      this.host.requestUpdate();
    }
  }
}
