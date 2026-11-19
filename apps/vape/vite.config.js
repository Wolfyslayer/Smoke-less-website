import { defineConfig } from "vite";

// This app is served from wolfyslayer.online/vape-calculator/ inside the hub.
export default defineConfig({
  base: "/vape-calculator/",
  build: { outDir: "dist" }
});
