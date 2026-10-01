import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Relative base so the build works from any GitHub Pages project path.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two standalone pages: the HUD app and the Field Guide edition.
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        design: fileURLToPath(new URL("./design.html", import.meta.url)),
      },
    },
  },
});
