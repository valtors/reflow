import {
  DestroyRef,
  type EnvironmentProviders,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  type Signal,
  afterNextRender,
  computed,
  inject,
  makeEnvironmentProviders,
  signal,
} from "@angular/core";
import {
  type BreakpointKey,
  type BreakpointMap,
  type BreakpointSystem,
  defaultSystem,
} from "../core/breakpoints.js";
import {
  type FluidityStore,
  type FluidityStoreSnapshot,
  createFluidityStore,
} from "../core/store.js";
import { isBrowserPlatform } from "./platform.js";

export interface FluidityConfig<B extends BreakpointMap = BreakpointMap> {
  system?: BreakpointSystem<B>;
  serverWidth?: number;
  serverHeight?: number;
}

export const FLUIDITY_CONFIG = new InjectionToken<FluidityConfig<BreakpointMap>>(
  "FLUIDITY_CONFIG",
  {
    factory: () => ({
      system: defaultSystem as unknown as BreakpointSystem<BreakpointMap>,
    }),
  },
);

export function provideFluidity<B extends BreakpointMap = BreakpointMap>(
  config: FluidityConfig<B> = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: FLUIDITY_CONFIG,
      useValue: config as unknown as FluidityConfig<BreakpointMap>,
    },
  ]);
}

@Injectable({ providedIn: "root" })
export class FluidityService<B extends BreakpointMap = BreakpointMap> {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(FLUIDITY_CONFIG) as unknown as FluidityConfig<B>;

  readonly isBrowser = isBrowserPlatform(this.platformId);
  readonly system = (this.config.system ?? defaultSystem) as BreakpointSystem<B>;
  readonly store: FluidityStore<B> = createFluidityStore(this.system, {
    initialWidth: this.config.serverWidth,
    initialHeight: this.config.serverHeight,
  });

  private readonly snapshotState = signal<FluidityStoreSnapshot<B>>(this.store.getServerSnapshot());

  readonly snapshot = this.snapshotState.asReadonly();
  readonly width = computed(() => this.snapshot().width);
  readonly height = computed(() => this.snapshot().height);
  readonly active = computed(() => this.snapshot().active);
  readonly orientation = computed(() => this.snapshot().orientation);
  readonly keys = this.system.keys;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    afterNextRender(() => {
      this.snapshotState.set(this.store.getSnapshot());
      const unsubscribe = this.store.subscribe(() => {
        this.snapshotState.set(this.store.getSnapshot());
      });
      this.destroyRef.onDestroy(unsubscribe);
    });
  }

  setServerSnapshot(snapshot: Partial<FluidityStoreSnapshot<B>>): void {
    this.store.setServerSnapshot(snapshot);
    this.snapshotState.set(this.store.getServerSnapshot());
  }

  is(key: BreakpointKey<B>): boolean {
    return this.active() === key;
  }

  above(key: BreakpointKey<B>): boolean {
    return this.keys.indexOf(key) <= this.keys.indexOf(this.active());
  }

  below(key: BreakpointKey<B>): boolean {
    return this.keys.indexOf(this.active()) < this.keys.indexOf(key);
  }

  between(min: BreakpointKey<B>, max: BreakpointKey<B>): boolean {
    const activeIndex = this.keys.indexOf(this.active());
    const minIndex = this.keys.indexOf(min);
    const maxIndex = this.keys.indexOf(max);
    return activeIndex >= minIndex && activeIndex < maxIndex;
  }

  viewport(): Signal<FluidityStoreSnapshot<B>> {
    return this.snapshot;
  }
}
