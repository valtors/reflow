import {
  DestroyRef,
  Directive,
  type EmbeddedViewRef,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { type ContainerSize, matchesContainerRange, observeContainer } from "../core/container.js";
import { isBrowserPlatform } from "./platform.js";

export interface ContainerQueryRange {
  minPx?: number;
  maxPx?: number;
}

export interface FluidityContainerQueryContext {
  $implicit: ContainerSize;
  fluContainerQuery: ContainerSize;
  matches: boolean;
}

@Directive({
  selector: "[fluContainerQuery]",
  standalone: true,
})
export class FluContainerQueryDirective {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly templateRef = inject<TemplateRef<FluidityContainerQueryContext>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly fluContainerQuery = input<ContainerQueryRange | "">("");
  readonly fluContainerQueryMin = input<number | undefined>(undefined);
  readonly fluContainerQueryMax = input<number | undefined>(undefined);
  readonly fluContainerQueryElse = input<TemplateRef<FluidityContainerQueryContext> | null>(null);

  private readonly size = signal<ContainerSize>({ width: 0, height: 0 });
  private readonly context: FluidityContainerQueryContext = {
    $implicit: this.size(),
    fluContainerQuery: this.size(),
    matches: false,
  };

  private thenViewRef: EmbeddedViewRef<FluidityContainerQueryContext> | null = null;
  private elseViewRef: EmbeddedViewRef<FluidityContainerQueryContext> | null = null;
  private lastMatch: boolean | null = null;

  private readonly range = computed<ContainerQueryRange>(() => {
    const value = this.fluContainerQuery();
    return {
      ...(typeof value === "object" ? value : {}),
      minPx: this.fluContainerQueryMin() ?? (typeof value === "object" ? value.minPx : undefined),
      maxPx: this.fluContainerQueryMax() ?? (typeof value === "object" ? value.maxPx : undefined),
    };
  });

  private readonly matches = computed(() => matchesContainerRange(this.size(), this.range()));

  constructor() {
    effect(() => {
      const size = this.size();
      const matches = this.matches();
      this.context.$implicit = size;
      this.context.fluContainerQuery = size;
      this.context.matches = matches;
      this.render(matches);
    });

    if (!isBrowserPlatform(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      const target = this.resolveTarget();
      if (!target) {
        return;
      }

      this.size.set(this.readTarget(target));
      const unsubscribe = observeContainer(target, (nextSize) => {
        this.size.set(nextSize);
      });
      this.destroyRef.onDestroy(unsubscribe);
    });
  }

  private resolveTarget(): Element | null {
    const anchor = this.viewContainerRef.element.nativeElement as Node | null;
    return anchor?.parentElement ?? null;
  }

  private readTarget(target: Element): ContainerSize {
    const rect = target.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  private render(matches: boolean): void {
    if (this.lastMatch === matches) {
      if (matches) {
        this.thenViewRef?.detectChanges();
      } else {
        this.elseViewRef?.detectChanges();
      }
      return;
    }

    this.lastMatch = matches;
    this.viewContainerRef.clear();
    this.thenViewRef = null;
    this.elseViewRef = null;

    if (matches) {
      this.thenViewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
      return;
    }

    const fallback = this.fluContainerQueryElse();
    if (fallback) {
      this.elseViewRef = this.viewContainerRef.createEmbeddedView(fallback, this.context);
    }
  }

  static ngTemplateContextGuard(
    _dir: FluContainerQueryDirective,
    ctx: unknown,
  ): ctx is FluidityContainerQueryContext {
    return true;
  }
}
