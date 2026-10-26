import { expect, test } from "@playwright/test";

test("can see versions on about page", async ({ page }) => {
  await page.goto("./about");
  await expect(page.getByText(/About PiranhaNET/)).toBeVisible();
  // check versions when available to confirm successful fetch from API
  const semanticVersionRegex = /[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+)?$/;
  await expect(page.getByText(new RegExp("Piranha v" + semanticVersionRegex.source))).toBeVisible();
  await expect(page.getByText(new RegExp("PiranhaNET API v" + semanticVersionRegex.source))).toBeVisible();
  await expect(page.getByText(new RegExp("PiranhaNET Web v" + semanticVersionRegex.source))).toBeVisible();
});
