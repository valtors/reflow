import { describe, expect, it } from "vitest";
import { useResponsiveImage } from "../src/angular";

describe("Angular adapter", () => {
  it("useResponsiveImage() mirrors core responsiveImage attrs", () => {
    const config = {
      alt: "Forest path",
      sizes: "50vw",
      loading: "eager" as const,
      sources: [
        { src: "/forest-800.jpg", width: 800 },
        { src: "/forest-400.jpg", width: 400 },
      ],
    };
    expect(useResponsiveImage(config)).toEqual({
      srcSet: "/forest-400.jpg 400w, /forest-800.jpg 800w",
      sizes: "50vw",
      src: "/forest-400.jpg",
      alt: "Forest path",
      loading: "eager",
    });
  });
});
