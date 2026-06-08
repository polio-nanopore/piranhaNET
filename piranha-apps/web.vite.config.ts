import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import {paraglideVitePlugin} from "@inlang/paraglide-js";

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "piranha-web"),
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(
          __dirname,
          "piranha-web/index.html",
        ),
      },
    },
  },
  plugins: [svelte(
    {
      configFile: "../svelte.config.mjs" // This is relative to index path
    }
  ),
    tailwindcss(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./svelte-app/src/paraglide",
    }),
  ],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "svelte-app/src/lib"),
    },
  },
})
