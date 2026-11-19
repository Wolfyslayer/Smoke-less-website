import { defineConfig } from "vite";

// This mirrored source is bundled from the single-domain website repository.
export default defineConfig({
  root: "apps/vape-calculator",
  base: "/vape-calculator/",
  build: { outDir: "../../dist/vape-calculator", emptyOutDir: false }
});
