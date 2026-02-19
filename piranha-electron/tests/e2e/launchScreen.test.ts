import { test, expect, _electron as electron } from "@playwright/test";

let electronApp;

test.beforeEach(async () => {
  electronApp = await electron.launch({ args: ['src/main/index.ts'] });
});

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

test("displays Run button", async () => {
  const firstWindow = await electronApp.firstWindow();
  await expect(await firstWindow.getByText("PiranhaNET")).toBeVisible();
  await expect(await firstWindow.getByRole("button")).toHaveText(/Run Piranha/);
});
