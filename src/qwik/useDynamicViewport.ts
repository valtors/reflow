import { type Signal, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { readDynamicViewportPx } from "../styles/viewport-units.js";

export interface DynamicViewport {
  dvh: number;
  svh: number;
  lvh: number;
}

export function useDynamicViewport(
  serverDefault: DynamicViewport = { dvh: 0, svh: 0, lvh: 0 },
): { dvh: Signal<number>; svh: Signal<number>; lvh: Signal<number> } {
  const v = useSignal<DynamicViewport>({ ...serverDefault });

  useVisibleTask$(({ cleanup }) => {
    const read = () => {
      v.value = {
        dvh: readDynamicViewportPx("dvh"),
        svh: readDynamicViewportPx("svh"),
        lvh: readDynamicViewportPx("lvh"),
      };
    };
    read();
    let scheduled = false;
    const onResize = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        read();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    cleanup(() => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    });
  });

  return {
    dvh: useComputed$(() => v.value.dvh),
    svh: useComputed$(() => v.value.svh),
    lvh: useComputed$(() => v.value.lvh),
  };
}
