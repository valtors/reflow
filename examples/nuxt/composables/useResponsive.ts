import { computed, onMounted, ref } from "vue";
import { useBreakpoint, useColorScheme, useViewport } from "fluidity-ts/vue";
import type { AppBreakpoints } from "~/plugins/fluidity";

const serverColorScheme = "light" as const;

export function useResponsive() {
  const breakpoint = useBreakpoint<AppBreakpoints>();
  const viewport = useViewport();
  const { colorScheme, isDark, setColorScheme } = useColorScheme({
    serverDefault: serverColorScheme,
    storageKey: "fluidity-ts-nuxt-color-scheme",
  });

  const hydrated = ref(false);

  onMounted(() => {
    hydrated.value = true;
  });

  const renderedColorScheme = computed(() =>
    hydrated.value ? colorScheme.value : serverColorScheme,
  );

  const toggleColorScheme = () => {
    setColorScheme(renderedColorScheme.value === "dark" ? "light" : "dark");
  };

  return {
    breakpoint,
    viewport,
    colorScheme,
    renderedColorScheme,
    isDark,
    hydrated,
    setColorScheme,
    toggleColorScheme,
  };
}
