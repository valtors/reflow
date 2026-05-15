import type { BreakpointKey, BreakpointMap, BreakpointSystem } from "../core/breakpoints.js";

export interface GridConfig<B extends BreakpointMap> {
  /** Number of columns at each breakpoint */
  columns: Partial<Record<BreakpointKey<B>, number>>;
  /** Gap between items (CSS value) */
  gap?: string | Partial<Record<BreakpointKey<B>, string>>;
  /** Row gap if different from column gap */
  rowGap?: string;
  /** Max container width */
  maxWidth?: string;
  /** Auto-placement algorithm */
  autoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
}

interface RuleCollector {
  base: string[];
  nested: Map<string, string[]>;
  order: string[];
}

function createCollector(): RuleCollector {
  return { base: [], nested: new Map(), order: [] };
}

function pushRule(collector: RuleCollector, atRule: string | null, declaration: string): void {
  if (!atRule) {
    collector.base.push(declaration);
    return;
  }

  if (!collector.nested.has(atRule)) {
    collector.nested.set(atRule, []);
    collector.order.push(atRule);
  }

  collector.nested.get(atRule)!.push(declaration);
}

function serializeCss(collector: RuleCollector): string {
  return [
    ...collector.base,
    ...collector.order.map((atRule) => `${atRule} { ${collector.nested.get(atRule)!.join(" ")} }`),
  ].join("\n");
}

function validateColumns(source: string, columns: number): void {
  if (!Number.isInteger(columns) || columns < 1) {
    throw new Error(`${source}: columns must be a positive integer`);
  }
}

function gridTemplate(columns: number): string {
  return `grid-template-columns: repeat(${columns}, minmax(0, 1fr));`;
}

function addResponsiveDeclarations<B extends BreakpointMap, V>(
  system: BreakpointSystem<B>,
  values: Partial<Record<BreakpointKey<B>, V>>,
  declaration: (value: V) => string,
  collector: RuleCollector,
): void {
  for (const key of system.keys) {
    const value = values[key];
    if (value === undefined) continue;
    const query = system.up(key);
    pushRule(collector, query === "all" ? null : `@media ${query}`, declaration(value));
  }
}

/** Generate responsive CSS Grid styles as a media-query-wrapped CSS string */
export function responsiveGrid<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  config: GridConfig<B>,
): string {
  const collector = createCollector();
  const columnEntries = Object.entries(config.columns);

  if (columnEntries.length === 0) {
    throw new Error("responsiveGrid: at least one column breakpoint is required");
  }

  pushRule(collector, null, "display: grid;");

  if (config.maxWidth) pushRule(collector, null, `max-width: ${config.maxWidth};`);
  if (config.autoFlow) pushRule(collector, null, `grid-auto-flow: ${config.autoFlow};`);
  if (config.rowGap) pushRule(collector, null, `row-gap: ${config.rowGap};`);

  if (typeof config.gap === "string") {
    pushRule(collector, null, `gap: ${config.gap};`);
  } else if (config.gap) {
    addResponsiveDeclarations(system, config.gap, (gap) => `gap: ${gap};`, collector);
  }

  addResponsiveDeclarations(
    system,
    config.columns,
    (columns) => {
      validateColumns("responsiveGrid", columns);
      return gridTemplate(columns);
    },
    collector,
  );

  return serializeCss(collector);
}

/** Generate a container query based grid (element-level responsive) */
export function containerGrid(config: {
  breakpoints: Record<string, { minWidth: number; columns: number }>;
  gap?: string;
}): string {
  const collector = createCollector();
  const entries = Object.values(config.breakpoints)
    .slice()
    .sort((a, b) => a.minWidth - b.minWidth);

  if (entries.length === 0) {
    throw new Error("containerGrid: at least one breakpoint is required");
  }

  pushRule(collector, null, "display: grid;");
  pushRule(collector, null, "container-type: inline-size;");
  if (config.gap) pushRule(collector, null, `gap: ${config.gap};`);

  for (const { minWidth, columns } of entries) {
    if (!Number.isFinite(minWidth) || minWidth < 0) {
      throw new Error("containerGrid: minWidth must be a non-negative number");
    }

    validateColumns("containerGrid", columns);
    pushRule(
      collector,
      minWidth <= 0 ? null : `@container (min-width: ${minWidth}px)`,
      gridTemplate(columns),
    );
  }

  return serializeCss(collector);
}

type PresetBreakpointMap = Record<string, number>;

type PresetGridConfig = GridConfig<PresetBreakpointMap>;

/** Common grid presets */
export const gridPresets: {
  /** 1 → 2 → 3 → 4 columns */
  standard: PresetGridConfig;
  /** Sidebar + main content */
  sidebar: PresetGridConfig;
  /** Magazine-style masonry approximation */
  magazine: PresetGridConfig;
  /** Dashboard cards */
  dashboard: PresetGridConfig;
} = {
  standard: {
    columns: { xs: 1, sm: 2, lg: 3, xl: 4 },
    gap: "1.5rem",
  },
  sidebar: {
    columns: { xs: 1, lg: 12 },
    gap: "1.5rem",
  },
  magazine: {
    columns: { xs: 1, sm: 2, lg: 4 },
    gap: "1rem",
    rowGap: "1.5rem",
    autoFlow: "dense",
  },
  dashboard: {
    columns: { xs: 1, sm: 2, xl: 4 },
    gap: "1.25rem",
  },
};

/** Generate CSS for a responsive stack (vertical on mobile, horizontal on desktop) */
export function responsiveStack<B extends BreakpointMap>(
  system: BreakpointSystem<B>,
  switchAt: BreakpointKey<B>,
  options: { gap?: string; align?: string; reverse?: boolean } = {},
): string {
  const collector = createCollector();
  const mobileDirection = options.reverse ? "column-reverse" : "column";
  const desktopDirection = options.reverse ? "row-reverse" : "row";
  const query = system.up(switchAt);

  pushRule(collector, null, "display: flex;");
  if (options.gap) pushRule(collector, null, `gap: ${options.gap};`);
  if (options.align) pushRule(collector, null, `align-items: ${options.align};`);
  pushRule(
    collector,
    null,
    `flex-direction: ${query === "all" ? desktopDirection : mobileDirection};`,
  );

  if (query !== "all") {
    pushRule(collector, `@media ${query}`, `flex-direction: ${desktopDirection};`);
  }

  return serializeCss(collector);
}
