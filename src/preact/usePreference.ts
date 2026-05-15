"use client";

import { useEffect, useState } from "preact/hooks";
import { type PreferenceKey, getPreference, observePreference } from "../core/preferences.js";

export function usePreference(key: PreferenceKey, serverDefault = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? serverDefault : getPreference(key),
  );

  useEffect(() => {
    setMatches(getPreference(key));
    return observePreference(key, (next) => {
      setMatches(next);
    });
  }, [key]);

  return matches;
}
