import { mq, watchMedia } from "./media.js";

/**
 * User preference media features. Each is SSR-safe (returns `false` on the
 * server unless overridden via a server-rendered cookie/header hint).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media#user_preference_media_features
 */
export type PreferenceKey =
  | "reducedMotion"
  | "reducedData"
  | "moreContrast"
  | "lessContrast"
  | "forcedColors"
  | "invertedColors"
  | "dark"
  | "light";

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

/** Read the current boolean state of a user preference. SSR-safe (returns `false`). */
export function getPreference(key: PreferenceKey): boolean {
  return watchMedia(QUERY_BY_KEY[key]).matches();
}

/** Subscribe to changes in a user preference media feature. Returns an unsubscribe function. */
export function observePreference(
  key: PreferenceKey,
  listener: (active: boolean) => void,
): () => void {
  return watchMedia(QUERY_BY_KEY[key]).subscribe(listener);
}

export type Preferences = Record<PreferenceKey, boolean>;

/** Snapshot of every tracked user preference as a boolean record. */
export function getAllPreferences(): Preferences {
  return {
    reducedMotion: getPreference("reducedMotion"),
    reducedData: getPreference("reducedData"),
    moreContrast: getPreference("moreContrast"),
    lessContrast: getPreference("lessContrast"),
    forcedColors: getPreference("forcedColors"),
    invertedColors: getPreference("invertedColors"),
    dark: getPreference("dark"),
    light: getPreference("light"),
  };
}
