import { type Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { watchMedia } from "../core/media.js";

export function useMediaQuery(query: string, serverDefault = false): Signal<boolean> {
  const matches = useSignal(serverDefault);

  useVisibleTask$(({ cleanup }) => {
    const watcher = watchMedia(query);
    matches.value = watcher.matches();

    const unsubscribe = watcher.subscribe((next) => {
      matches.value = next;
    });

    cleanup(unsubscribe);
  });

  return matches;
}
