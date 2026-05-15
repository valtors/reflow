import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  type PointerCapabilities,
  getPointerCapabilities,
  observePointerCapabilities,
} from "../core/pointer.js";

const DEFAULT_CAPABILITIES: PointerCapabilities = {
  hover: false,
  anyHover: false,
  coarse: false,
  fine: false,
  none: false,
};

export class PointerController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private unsubscribe: (() => void) | undefined;
  private capabilitiesInternal: PointerCapabilities;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.capabilitiesInternal =
      typeof window === "undefined" ? DEFAULT_CAPABILITIES : getPointerCapabilities();
    host.addController(this);
  }

  hostConnected(): void {
    if (typeof window === "undefined") return;
    this.unsubscribe?.();
    this.updateCapabilities(getPointerCapabilities(), true);
    this.unsubscribe = observePointerCapabilities((capabilities) => {
      this.updateCapabilities(capabilities);
    });
  }

  hostDisconnected(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private updateCapabilities(capabilities: PointerCapabilities, force = false): void {
    if (
      !force &&
      this.capabilitiesInternal.hover === capabilities.hover &&
      this.capabilitiesInternal.anyHover === capabilities.anyHover &&
      this.capabilitiesInternal.coarse === capabilities.coarse &&
      this.capabilitiesInternal.fine === capabilities.fine &&
      this.capabilitiesInternal.none === capabilities.none
    ) {
      return;
    }

    this.capabilitiesInternal = capabilities;
    this.host.requestUpdate();
  }

  get capabilities(): PointerCapabilities {
    return this.capabilitiesInternal;
  }

  get hover(): boolean {
    return this.capabilitiesInternal.hover;
  }

  get anyHover(): boolean {
    return this.capabilitiesInternal.anyHover;
  }

  get coarse(): boolean {
    return this.capabilitiesInternal.coarse;
  }

  get fine(): boolean {
    return this.capabilitiesInternal.fine;
  }

  get none(): boolean {
    return this.capabilitiesInternal.none;
  }
}
