import { describe, expect, it } from "vitest";
import { defaultSystem } from "../src/core/breakpoints";
import { containerGrid, responsiveGrid, responsiveStack } from "../src/styles/grid";

describe("grid", () => {
  it("responsiveGrid generates valid CSS with media queries", () => {
    const css = responsiveGrid(defaultSystem, {
      columns: { xs: 1, md: 2, lg: 4 },
      gap: "1rem",
      maxWidth: "80rem",
    });

    expect(css).toContain("display: grid;");
    expect(css).toContain("max-width: 80rem;");
    expect(css).toContain("grid-template-columns: repeat(1, minmax(0, 1fr));");
    expect(css).toContain("@media (min-width: 768px)");
    expect(css).toContain("@media (min-width: 1024px)");
  });

  it("containerGrid uses container query syntax", () => {
    const css = containerGrid({
      breakpoints: {
        base: { minWidth: 0, columns: 1 },
        card: { minWidth: 480, columns: 2 },
      },
      gap: "1.5rem",
    });

    expect(css).toContain("display: grid;");
    expect(css).toContain("container-type: inline-size;");
    expect(css).toContain("@container (min-width: 480px)");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
  });

  it("responsiveStack switches direction at breakpoint", () => {
    const css = responsiveStack(defaultSystem, "md", { gap: "0.75rem" });

    expect(css).toContain("display: flex;");
    expect(css).toContain("gap: 0.75rem;");
    expect(css).toContain("flex-direction: column;");
    expect(css).toContain("@media (min-width: 768px)");
    expect(css).toContain("flex-direction: row;");
  });
});
