import { renderHook } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import { createSignal } from "solid-js";

describe("debug", () => {
  it("inspect renderHook result", () => {
    const { result } = renderHook(() => {
      const [val] = createSignal(1);
      return val;
    });
    console.log("Result object:", result);
    console.log("Keys of result:", Object.keys(result));
    // @ts-ignore
    console.log("Result.current:", result.current);
    // @ts-ignore
    console.log("Result.get:", result.get);
    // @ts-ignore
    console.log("Result():", typeof result);
  });
});
