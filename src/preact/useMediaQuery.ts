"use client";

import { useEffect, useState } from "preact/hooks";
import { watchMedia } from "../core/media.js";

export function useMediaQuery(query: string, serverDefault = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? serverDefault : watchMedia(query).matches(),
  );

  useEffect(() => {
    const watcher = watchMedia(query);
    setMatches(watcher.matches());
    return watcher.subscribe((next) => {
      setMatches(next);
    });
  }, [query]);

  return matches;
}
