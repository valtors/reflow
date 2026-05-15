import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createBreakpoints, defaultSystem } from "../src/core/breakpoints";
import {
  artDirection,
  calculateImageWidths,
  generateSizes,
  generateSrcset,
  imageBreakpoints,
  responsiveImage,
} from "../src/core/images";
import { useResponsiveImage } from "../src/react";

describe("images", () => {
  it("generateSrcset() sorts widths ascending", () => {
    expect(
      generateSrcset([
        { src: "/hero-1280.jpg", width: 1280 },
        { src: "/hero-640.jpg", width: 640 },
        { src: "/hero-960.jpg", width: 960 },
      ]),
    ).toBe("/hero-640.jpg 640w, /hero-960.jpg 960w, /hero-1280.jpg 1280w");
  });

  it("generateSizes() composes mobile-first sizes", () => {
    expect(
      generateSizes(defaultSystem, {
        xs: "100vw",
        md: "50vw",
        lg: "33vw",
      }),
    ).toBe("(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw");
  });

  it("generateSizes() falls back to the first configured size", () => {
    const system = createBreakpoints({ sm: 640, md: 768, lg: 1024 });

    expect(
      generateSizes(system, {
        md: "60vw",
        lg: "40vw",
      }),
    ).toBe("(min-width: 1024px) 40vw, 60vw");
  });

  it("calculateImageWidths() returns unique DPR-aware widths", () => {
    expect(
      calculateImageWidths(defaultSystem, {
        devicePixelRatios: [1, 2],
        maxWidth: 1600,
      }),
    ).toEqual([640, 768, 1024, 1280, 1536, 1600]);
  });

  it("imageBreakpoints() aliases calculateImageWidths()", () => {
    expect(imageBreakpoints(defaultSystem, { maxWidth: 1600 })).toEqual(
      calculateImageWidths(defaultSystem, { maxWidth: 1600 }),
    );
  });

  it("responsiveImage() returns img attrs with defaults", () => {
    expect(
      responsiveImage({
        alt: "A mountain lake",
        sources: [
          { src: "/lake-1280.jpg", width: 1280 },
          { src: "/lake-640.jpg", width: 640 },
        ],
      }),
    ).toEqual({
      srcSet: "/lake-640.jpg 640w, /lake-1280.jpg 1280w",
      sizes: "100vw",
      src: "/lake-640.jpg",
      alt: "A mountain lake",
      loading: "lazy",
    });
  });

  it("artDirection() returns <picture> source helpers", () => {
    expect(
      artDirection([
        {
          media: "(min-width: 1024px)",
          src: "/hero-wide.avif",
          width: 1440,
          height: 900,
          format: "avif",
        },
        {
          media: "(max-width: 1023.98px)",
          src: "/hero-tall.webp",
          width: 768,
          height: 1024,
          format: "webp",
        },
      ]),
    ).toEqual({
      sources: [
        {
          media: "(min-width: 1024px)",
          srcSet: "/hero-wide.avif 1440w",
          type: "image/avif",
          width: 1440,
          height: 900,
        },
        {
          media: "(max-width: 1023.98px)",
          srcSet: "/hero-tall.webp 768w",
          type: "image/webp",
          width: 768,
          height: 1024,
        },
      ],
      fallback: {
        src: "/hero-tall.webp",
        width: 768,
        height: 1024,
      },
    });
  });

  it("useResponsiveImage() mirrors responsiveImage() output", () => {
    const config = {
      alt: "Forest path",
      sizes: "50vw",
      loading: "eager" as const,
      sources: [
        { src: "/forest-800.jpg", width: 800 },
        { src: "/forest-400.jpg", width: 400 },
      ],
    };

    const { result } = renderHook(() => useResponsiveImage(config));

    expect(result.current).toEqual({
      srcSet: "/forest-400.jpg 400w, /forest-800.jpg 800w",
      sizes: "50vw",
      src: "/forest-400.jpg",
      alt: "Forest path",
      loading: "eager",
    });
  });
});
