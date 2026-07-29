import { expect, test } from "@playwright/test";
import { initialiseTest, getWindow, piranhaNETVersion } from "./utils";

let electronApp;

test.beforeEach(async () => {
  electronApp = await initialiseTest();
});

test("can navigate to About screen and see expected versions", async () => {
  const win = await getWindow(electronApp);
  const aboutLink = win.getByTestId("nav-about");
  await aboutLink.click();

  await expect(await win.getByText("About PiranhaNET")).toBeVisible();

  await expect(await win.getByText("Piranha v1.6.3")).toBeVisible();

  const expectedPiranhaNETVersion = piranhaNETVersion();
  expect(expectedPiranhaNETVersion.length).toBeGreaterThan(4); //sanity check
  await expect(
    await win.getByText(`PiranhaNET v${expectedPiranhaNETVersion}`),
  ).toBeVisible();
});
