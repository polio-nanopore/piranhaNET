import { expect, test } from "@playwright/test";
import { initialiseTest, getWindow } from "./utils";
import * as shared from "../../../shared/tests/e2e/utils";

let electronApp;

test.beforeEach(async () => {
  electronApp = await initialiseTest();
});

test("can navigate to About screen and see expected versions", async () => {
  const win = await getWindow(electronApp);
  const aboutLink = await shared.getAboutLink(win);
  await aboutLink.click();

  await shared.expectAboutTitle(page);
  await shared.expectPiranhaVersion(page);

  const expectedPiranhaNETVersion = shared.piranhaNETVersion();
  expect(expectedPiranhaNETVersion.length).toBeGreaterThan(4); //sanity check
  const expectedVersionText = `PiranhaNET Electron v${expectedPiranhaNETVersion}`;
  await expect(await win.getByText(expectedVersionText)).toBeVisible();
});
