import { expect, test } from "@playwright/test";

test("can see versions on about page", async ({ page }) => {
  await page.goto("./about");
  await expect(page.getByText(/About PiranhaNET/)).toBeVisible();
});
