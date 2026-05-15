"use client";

import { useEffect, useState } from "preact/hooks";
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

export interface ElementRef<T extends Element = Element> {
  current: T | null;
}

export function useContainerQuery(
  ref: ElementRef,
  range: ContainerQueryRange,
  serverDefault = false,
): boolean {
  const [matches, setMatches] = useState(serverDefault);
  const minPx = range.minPx;
  const maxPx = range.maxPx;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const nextRange = { minPx, maxPx };
    setMatches(matchesContainerRange(getContainerSize(element), nextRange));

    return observeContainer(element, (size) => {
      setMatches(matchesContainerRange(size, nextRange));
    });
  }, [ref, minPx, maxPx]);

  return matches;
}

export function useContainerSize(
  ref: ElementRef,
  serverDefault: ContainerSize = { width: 0, height: 0 },
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>(serverDefault);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    setSize(getContainerSize(element));
    return observeContainer(element, setSize);
  }, [ref]);

  return size;
}
