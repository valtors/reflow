import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";

export default defineConfig({
  integrations: [react(), svelte(), vue()],
  vite: {
    resolve: {
      alias: {
        "reflow/svelte": fileURLToPath(new URL("./src/lib/fluidity-svelte.ts", import.meta.url)),
      },
    },
  },
});
