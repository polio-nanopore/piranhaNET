import {semanticVersionRegex, expectAboutTitle} from "../../../shared/tests/e2e/utils";
import { expect, test } from "@playwright/test";

test("can see versions on about page", async ({ page }) => {
  await page.goto("./about");
  await expectAboutTitle(page);
  // check versions when available to confirm successful fetch from API
  await expect(
    page.getByText(new RegExp("Piranha v" + semanticVersionRegex.source)),
  ).toBeVisible();
  await expect(
    page.getByText(
      new RegExp("PiranhaNET API v" + semanticVersionRegex.source),
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      new RegExp("PiranhaNET Web v" + semanticVersionRegex.source),
    ),
  ).toBeVisible();
});
