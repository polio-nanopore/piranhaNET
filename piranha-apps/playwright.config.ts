import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 600_000,
  use: {
    screenshot: "only-on-failure",
  },
  retries: 5, // can be flaky picking up API stream on CI..
  projects: [
    {
      name: "electron",
      testDir: "piranha-electron/tests/e2e",
    },
    {
      name: "web-smoke",
      testDir: "piranha-web/tests/e2e",
      use: {
        baseURL: "http://localhost:5173",
      },
    },
  ],
});
