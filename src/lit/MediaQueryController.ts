import type { ReactiveController, ReactiveControllerHost } from "lit";
import { watchMedia } from "../core/media.js";

export interface MediaQueryControllerOptions {
  serverDefault?: boolean;
}

export class MediaQueryController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private unsubscribe: (() => void) | undefined;
  private connected = false;
  private queryInternal: string;
  private matchesInternal: boolean;

  constructor(
    host: ReactiveControllerHost,
    query: string,
    options: MediaQueryControllerOptions = {},
  ) {
    this.host = host;
    this.queryInternal = query;
    this.matchesInternal =
      typeof window === "undefined"
        ? (options.serverDefault ?? false)
        : watchMedia(query).matches();
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
    const watcher = watchMedia(this.queryInternal);
    this.updateMatches(watcher.matches());
    this.unsubscribe = watcher.subscribe((matches) => this.updateMatches(matches));
  }

  private updateMatches(matches: boolean): void {
    if (this.matchesInternal === matches) return;
    this.matchesInternal = matches;
    this.host.requestUpdate();
  }

  get query(): string {
    return this.queryInternal;
  }

  get matches(): boolean {
    return this.matchesInternal;
  }

  get value(): boolean {
    return this.matchesInternal;
  }

  setQuery(query: string): void {
    if (this.queryInternal === query) return;
    this.queryInternal = query;
    this.start();
  }
}
