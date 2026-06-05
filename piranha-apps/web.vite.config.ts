import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";

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
  )],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "svelte-app/src/lib"),
    },
  },
})
