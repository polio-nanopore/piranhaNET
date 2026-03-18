import { defineConfig } from "electron-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [
      svelte(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
      })
    ]
  }
});
