import { defineConfig } from "electron-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(__dirname, "piranha-electron");

export default defineConfig({
  main: {
    root,
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
    root,
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
    root,
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
