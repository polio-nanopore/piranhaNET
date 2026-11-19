import { expect, test } from "@playwright/test";
import * as shared from "../../../shared/tests/e2e/utils";

test("can navigate to About screen and see expected versions", async ({page}) => {
  await page.goto("/");
  const aboutLink = await shared.getAboutLink(page);
  await aboutLink.click();

  await shared.expectAboutTitle(page);
  await shared.expectPiranhaVersion(page)

  const expectedPiranhaNETVersion = shared.piranhaNETVersion();
  const expectedVersionText = `PiranhaNET Web v${expectedPiranhaNETVersion}`;
  await expect(await page.getByText(expectedVersionText)).toBeVisible();

  await expect(
    page.getByText(
      new RegExp("PiranhaNET API v" + shared.semanticVersionRegex.source),
    ),
  ).toBeVisible();
});
