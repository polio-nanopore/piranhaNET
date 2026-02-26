import { test, expect, _electron as electron } from "@playwright/test";

let electronApp;

test.beforeEach(async () => {
  // Point Playwright at the built main scripts, not the src ts file. Do not use sandbox - this causes
  // permission-related failures on CI.
  electronApp = await electron.launch({ args: ["out/main/index.js", "--no-sandbox"] });
});

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

test("displays Run button", async () => {
  const firstWindow = await electronApp.firstWindow();
  await expect(await firstWindow.getByText(/PiranhaNET/)).toBeVisible();
  await expect(await firstWindow.getByText(/Run Piranha/)).toBeVisible();
});
