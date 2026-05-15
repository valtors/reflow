import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type PreferenceKey, getPreference, observePreference } from "../core/preferences.js";

export function usePreference(key: PreferenceKey, serverDefault = false): Signal<boolean> {
  const active = useSignal(serverDefault);

  useVisibleTask$(({ cleanup }) => {
    active.value = getPreference(key);
    const unsubscribe = observePreference(key, (next) => {
      active.value = next;
    });

    cleanup(unsubscribe);
  });

  return active;
}
