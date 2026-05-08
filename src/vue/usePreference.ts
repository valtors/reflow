import type { Ref } from "vue";
import { mq } from "../core/media.js";
import type { PreferenceKey } from "../core/preferences.js";
import { useMediaQuery } from "./useMediaQuery.js";

const QUERY_BY_KEY: Record<PreferenceKey, string> = {
  reducedMotion: mq.prefersReducedMotion,
  reducedData: mq.prefersReducedData,
  moreContrast: mq.prefersMoreContrast,
  lessContrast: mq.prefersLessContrast,
  forcedColors: mq.forcedColors,
  invertedColors: mq.invertedColors,
  dark: mq.prefersDark,
  light: mq.prefersLight,
};

/**
 * SSR-safe user preference composable.
 */
export function usePreference(key: PreferenceKey, serverDefault = false): Readonly<Ref<boolean>> {
  return useMediaQuery(QUERY_BY_KEY[key], serverDefault);
}
