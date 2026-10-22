import { defineConfig } from "vite";

// Relative base so the same build works on GitHub Pages project sites,
// custom domains, and local preview without rewriting asset URLs.
export default defineConfig({
  base: "./",
});
