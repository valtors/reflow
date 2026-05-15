export type DemoBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function getColumns(active: DemoBreakpoint) {
  switch (active) {
    case "2xl":
      return 4;
    case "xl":
    case "lg":
      return 3;
    case "md":
      return 2;
    default:
      return 1;
  }
}

export function getLayoutLabel(active: DemoBreakpoint) {
  switch (active) {
    case "2xl":
      return "Wide dashboard";
    case "xl":
    case "lg":
      return "Roomy three-column";
    case "md":
      return "Balanced two-column";
    default:
      return "Stacked mobile";
  }
}
