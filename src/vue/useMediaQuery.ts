import { type Ref, getCurrentInstance, onMounted, onUnmounted, readonly, ref } from "vue";
import { watchMedia } from "../core/media.js";

/**
 * SSR-safe reactive media query composable.
 */
export function useMediaQuery(query: string, serverDefault = false): Readonly<Ref<boolean>> {
  const matches = ref(serverDefault);

  if (typeof window !== "undefined") {
    const watcher = watchMedia(query);
    matches.value = watcher.matches();

    if (getCurrentInstance()) {
      let unsub: (() => void) | undefined;
      onMounted(() => {
        matches.value = watcher.matches();
        unsub = watcher.subscribe(() => {
          matches.value = watcher.matches();
        });
      });
      onUnmounted(() => {
        unsub?.();
      });
    }
  }

  return readonly(matches);
}
