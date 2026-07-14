import { describe, expect, it } from "vitest";
import { useResponsiveImage } from "../src/lit/useResponsiveImage.ts";

describe("lit useResponsiveImage", () => {
  it("mirrors core", () => {
    const r = useResponsiveImage({
      alt: "Forest",
      sizes: "50vw",
      loading: "eager" as const,
      sources: [
        { src: "/forest-800.jpg", width: 800 },
        { src: "/forest-400.jpg", width: 400 },
      ],
    });
    expect(r).toEqual({
      srcSet: "/forest-400.jpg 400w, /forest-800.jpg 800w",
      sizes: "50vw",
      src: "/forest-400.jpg",
      alt: "Forest",
      loading: "eager",
    });
  });
});
