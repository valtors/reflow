import type { ReactiveController, ReactiveControllerHost } from "lit";
import { type PreferenceKey, getPreference, observePreference } from "../core/preferences.js";

export interface PreferenceControllerOptions {
  serverDefault?: boolean;
}

export class PreferenceController<K extends PreferenceKey = PreferenceKey>
  implements ReactiveController
{
  private readonly host: ReactiveControllerHost;
  private unsubscribe: (() => void) | undefined;
  private connected = false;
  private keyInternal: K;
  private activeInternal: boolean;

  constructor(host: ReactiveControllerHost, key: K, options: PreferenceControllerOptions = {}) {
    this.host = host;
    this.keyInternal = key;
    this.activeInternal =
      typeof window === "undefined" ? (options.serverDefault ?? false) : getPreference(key);
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

  private start(): void {
    this.unsubscribe?.();
    if (!this.connected || typeof window === "undefined") return;
    this.updateActive(getPreference(this.keyInternal));
    this.unsubscribe = observePreference(this.keyInternal, (active) => this.updateActive(active));
  }

  private updateActive(active: boolean): void {
    if (this.activeInternal === active) return;
    this.activeInternal = active;
    this.host.requestUpdate();
  }

  get key(): K {
    return this.keyInternal;
  }

  get active(): boolean {
    return this.activeInternal;
  }

  get value(): boolean {
    return this.activeInternal;
  }

  setKey(key: K): void {
    if (this.keyInternal === key) return;
    this.keyInternal = key;
    this.start();
  }
}
