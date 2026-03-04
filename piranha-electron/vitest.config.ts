import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
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
