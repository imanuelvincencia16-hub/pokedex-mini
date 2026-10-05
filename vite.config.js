import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the repository name so assets resolve under the Pages project path.
export default defineConfig({
  base: "/pokedex-mini/",
  plugins: [react()],
});
