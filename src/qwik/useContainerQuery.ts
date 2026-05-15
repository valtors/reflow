import { type Signal, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  type ContainerSize,
  getContainerSize,
  matchesContainerRange,
  observeContainer,
} from "../core/container.js";

export interface ContainerQueryRange {
  minPx?: number;
  maxPx?: number;
}

type ContainerTarget = Signal<Element | null | undefined>;

export function useContainerQuery(
  target: ContainerTarget,
  range: ContainerQueryRange,
  serverDefault = false,
): Signal<boolean> {
  const matches = useSignal(serverDefault);

  useVisibleTask$(({ track, cleanup }) => {
    const element = track(() => target.value);

    if (!element) {
      matches.value = serverDefault;
      return;
    }

    const currentRange = { minPx: range.minPx, maxPx: range.maxPx };
    matches.value = matchesContainerRange(getContainerSize(element), currentRange);

    const unsubscribe = observeContainer(element, (size) => {
      matches.value = matchesContainerRange(size, currentRange);
    });

    cleanup(unsubscribe);
  });

  return matches;
}

export function useContainerSize(
  target: ContainerTarget,
  serverDefault: ContainerSize = { width: 0, height: 0 },
): { width: Signal<number>; height: Signal<number> } {
  const size = useSignal<ContainerSize>({ ...serverDefault });

  useVisibleTask$(({ track, cleanup }) => {
    const element = track(() => target.value);

    if (!element) {
      size.value = { ...serverDefault };
      return;
    }

    size.value = getContainerSize(element);
    const unsubscribe = observeContainer(element, (nextSize) => {
      size.value = nextSize;
    });

    cleanup(unsubscribe);
  });

  return {
    width: useComputed$(() => size.value.width),
    height: useComputed$(() => size.value.height),
  };
}
