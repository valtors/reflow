import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { type PreferenceKey, getPreference, observePreference } from "../core/preferences.js";

export function usePreference(key: PreferenceKey, serverDefault = false): Accessor<boolean> {
  const [matches, setMatches] = createSignal(isServer ? serverDefault : getPreference(key));
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    setMatches(getPreference(key));
    unsubscribe = observePreference(key, (next) => {
      setMatches(next);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return matches;
}
