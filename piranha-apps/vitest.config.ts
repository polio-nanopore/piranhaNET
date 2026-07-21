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
      include: ["**/src/**/**.{js,ts}"],
      exclude: ["**/tests"],
    },
    projects: [
      {
        plugins: [svelte(), svelteTesting()],
        test: {
          name: "renderer",
          environment: "jsdom",
          globals: true,
          clearMocks: true,
          include: ["svelte-app/tests/unit/**/**.{test,spec}.{js,ts}"],
          setupFiles: ["./vitest-setup-client.ts"],
          testTimeout: 10_000
        },
        resolve: {
          alias: {
            $lib: path.resolve(__dirname, "svelte-app/src/lib"),
          },
        },
      },
      {
        plugins: [],
        test: {
          name: "main",
          environment: "node",
          clearMocks: true,
          include: [
            "piranha-electron/tests/integration/main/**/**.{test,spec}.{js,ts}",
          ],
          setupFiles: [],
        },
      },
    ],
  },
});
