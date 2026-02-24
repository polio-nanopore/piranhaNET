import { test, expect, _electron as electron } from "@playwright/test";

let electronApp;

test.beforeEach(async () => {
  // Point Playwright at the development build, not the src ts file
  electronApp = await electron.launch({ args: ["out/main/index.js"] });
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
