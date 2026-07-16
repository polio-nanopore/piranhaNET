import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "piranha-electron/tests/e2e",
  timeout: 600_000,
  use: {
    screenshot: "only-on-failure",
  },
  retries: 5 // can be flaky picking up API stream on CI..
});
