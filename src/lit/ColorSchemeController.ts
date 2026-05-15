import type { ReactiveController, ReactiveControllerHost } from "lit";
import { mq, watchMedia } from "../core/media.js";

export type ColorScheme = "light" | "dark";

export interface ColorSchemeControllerOptions {
  serverDefault?: ColorScheme;
  storageKey?: string;
}

type ColorSchemeOverride = ColorScheme | null;

const isBrowser = typeof window !== "undefined";
const DEFAULT_OVERRIDE_KEY = "__fluidity-color-scheme__";
const overrideSchemes = new Map<string, ColorSchemeOverride>();
const overrideListeners = new Map<string, Set<() => void>>();

function getOverrideKey(storageKey?: string): string {
  return storageKey ?? DEFAULT_OVERRIDE_KEY;
}

function getOverrideScheme(overrideKey: string): ColorSchemeOverride {
  return overrideSchemes.get(overrideKey) ?? null;
}

function getOverrideListeners(overrideKey: string): Set<() => void> {
  let listeners = overrideListeners.get(overrideKey);
  if (!listeners) {
    listeners = new Set<() => void>();
    overrideListeners.set(overrideKey, listeners);
  }
  return listeners;
}

function syncOverrideScheme(overrideKey: string, storageKey?: string): void {
  if (!isBrowser || !storageKey) return;
  try {
    const value = localStorage.getItem(storageKey);
    if (value === "dark" || value === "light") {
      overrideSchemes.set(overrideKey, value);
      return;
    }

    if (!overrideListeners.get(overrideKey)?.size) {
      overrideSchemes.delete(overrideKey);
    }
  } catch {
    // Storage unavailable.
  }
}

function setOverrideScheme(overrideKey: string, scheme: ColorSchemeOverride): void {
  if (scheme === null) {
    overrideSchemes.delete(overrideKey);
    return;
  }
  overrideSchemes.set(overrideKey, scheme);
}

function subscribeOverride(overrideKey: string, listener: () => void): () => void {
  const listeners = getOverrideListeners(overrideKey);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      overrideListeners.delete(overrideKey);
    }
  };
}

function notifyOverride(overrideKey: string): void {
  for (const listener of overrideListeners.get(overrideKey) ?? []) {
    listener();
  }
}

function writeStorage(storageKey: string | undefined, scheme: ColorSchemeOverride): void {
  if (!isBrowser || !storageKey) return;
  try {
    if (scheme === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, scheme);
    }
  } catch {
    // Storage unavailable.
  }
}

export class ColorSchemeController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly serverDefault: ColorScheme;
  private readonly storageKey: string | undefined;
  private readonly overrideKey: string;

  private unsubscribeSystem: (() => void) | undefined;
  private unsubscribeOverride: (() => void) | undefined;
  private systemDark: boolean;
  private override: ColorSchemeOverride;

  constructor(host: ReactiveControllerHost, options: ColorSchemeControllerOptions = {}) {
    this.host = host;
    this.serverDefault = options.serverDefault ?? "light";
    this.storageKey = options.storageKey;
    this.overrideKey = getOverrideKey(this.storageKey);

    syncOverrideScheme(this.overrideKey, this.storageKey);
    this.override = getOverrideScheme(this.overrideKey);
    this.systemDark = isBrowser
      ? watchMedia(mq.prefersDark).matches()
      : this.serverDefault === "dark";

    host.addController(this);
  }

  hostConnected(): void {
    if (typeof window === "undefined") return;
    syncOverrideScheme(this.overrideKey, this.storageKey);
    this.updateOverride(getOverrideScheme(this.overrideKey));

    const watcher = watchMedia(mq.prefersDark);
    this.updateSystemDark(watcher.matches(), true);
    this.unsubscribeSystem?.();
    this.unsubscribeSystem = watcher.subscribe((matches) => this.updateSystemDark(matches));

    this.unsubscribeOverride?.();
    this.unsubscribeOverride = subscribeOverride(this.overrideKey, () => {
      syncOverrideScheme(this.overrideKey, this.storageKey);
      this.updateOverride(getOverrideScheme(this.overrideKey));
    });
  }

  hostDisconnected(): void {
    this.unsubscribeSystem?.();
    this.unsubscribeOverride?.();
    this.unsubscribeSystem = undefined;
    this.unsubscribeOverride = undefined;
  }

  private updateSystemDark(next: boolean, force = false): void {
    if (!force && this.systemDark === next) return;
    this.systemDark = next;
    this.host.requestUpdate();
  }

  private updateOverride(next: ColorSchemeOverride): void {
    if (this.override === next) return;
    this.override = next;
    this.host.requestUpdate();
  }

  get colorScheme(): ColorScheme {
    return this.override ?? (this.systemDark ? "dark" : "light");
  }

  get isDark(): boolean {
    return this.colorScheme === "dark";
  }

  setColorScheme(scheme: ColorSchemeOverride): void {
    setOverrideScheme(this.overrideKey, scheme);
    writeStorage(this.storageKey, scheme);
    this.updateOverride(getOverrideScheme(this.overrideKey));
    notifyOverride(this.overrideKey);
  }
}
