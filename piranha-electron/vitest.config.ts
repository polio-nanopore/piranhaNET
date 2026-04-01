import { defineConfig } from "vitest/config";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    coverage: {
      provider: "istanbul",
      include: ["src/**/**.{js,ts}"],
      exclude: ["tests"]
    },
    projects: [
      {
        plugins: [svelte(), svelteTesting()],
        test: {
          name: "renderer",
          environment: "jsdom",
          clearMocks: true,
          include: ["tests/unit/renderer/**/**.{test,spec}.{js,ts}"],
          setupFiles: ["./vitest-setup-client.ts"]
        },
        resolve: {
          alias: {
            $lib: path.resolve(__dirname, "src/renderer/src/lib"),
          },
        }
      },
      {
        plugins: [],
        test: {
          name: "main",
          environment: "node",
          clearMocks: true,
          include: ["tests/integration/main/**/**.{test,spec}.{js,ts}"],
          setupFiles: []
        }
      }
    ]
  }
});
