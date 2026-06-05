import { defineConfig } from "electron-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    root: path.resolve(__dirname, "piranha-electron/src/main"),
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "piranha-electron/src/main/index.ts")
        }
      }
    }
  },
  preload: {
    root: path.resolve(__dirname, "piranha-electron/src/preload"),
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "piranha-electron/src/preload/index.ts")
        }
      }
    }
  },
  renderer: {
    root: path.resolve(__dirname, "piranha-electron/src/renderer"),
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index:  path.resolve(__dirname, "piranha-electron/src/renderer/index.html")
        }
      }
    },
    plugins: [
      svelte(),
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
  },
});
