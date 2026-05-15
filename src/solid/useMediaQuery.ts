import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { watchMedia } from "../core/media.js";

export function useMediaQuery(query: string, serverDefault = false): Accessor<boolean> {
  const [matches, setMatches] = createSignal(
    isServer ? serverDefault : watchMedia(query).matches(),
  );
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    const watcher = watchMedia(query);
    setMatches(watcher.matches());
    unsubscribe = watcher.subscribe((next) => {
      setMatches(next);
    });
  });

  onCleanup(() => {
    unsubscribe?.();
  });

  return matches;
}
