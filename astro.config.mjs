import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: "http://localhost:4321",
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
