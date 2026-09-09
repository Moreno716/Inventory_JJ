import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://inventory-jj.pages.dev",
  output: "server",
  adapter: cloudflare(),
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});