import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "https://inventory-jj.pages.dev",
  output: "server",
  session: false,
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});