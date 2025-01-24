import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  server: {
    host: "127.0.0.1",
  },
  integrations: [react(), tailwind()],
  output: "server",
});
