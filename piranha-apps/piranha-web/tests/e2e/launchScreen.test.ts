import path from "node:path";
import {expect, Locator, Page, test} from "@playwright/test";
import * as shared from "../../../shared/tests/e2e/utils";

const testDataDir = path.join(__dirname, "..", "..", "..", "..", "test-data", "multiple_samples");

const setSampleFileInput = async (page) =>  await page.getByTestId("file-input-Samples file").setInputFiles(
  path.join(testDataDir, "samples.csv")
);

const setMinknowFolderInput = async (page) => await page.getByTestId("folder-input-MinKnow folder").setInputFiles(
  path.join(testDataDir, "minknow")
);

const prepareFileInputs = async (page) => {
  await setSampleFileInput(page);
  await setMinknowFolderInput(page);
};

const getDownloadOutputButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Download output zip/ });

test.beforeEach(async ({page}) => {
  await page.goto("/");
  await shared.clearLocalStorage(page);
});

test("can see welcome screen and run form, fill in parameters form and run Piranha",
  async ({page}) => {
  await shared.completeWelcomeScreenForm(page, true);
  await prepareFileInputs(page);
  await shared.fillRunParameters(page);
  await shared.expectHelpTextOnHover(page);
  await shared.fillRunSettings(page);

  // Open and edit Piranha Output settings
  const settings = await shared.getSettings(page);
  expect(settings).toBeVisible();
  const piranhaOutput = await shared.getOutputSettings(page);
  await piranhaOutput.click();
  const allMetadataToHeader = await shared.getAllMetadataToHeader(page);
  await allMetadataToHeader.click();

  await shared.fillUserSettings(page);
  await shared.startPiranhaRun(page);

  expect(await shared.getProgressSpinner(page)).toBeVisible();

  // Download output button is not visible yet
  expect(await getDownloadOutputButton(page)).toHaveCount(0);

  await shared.expectSuccessfulRunLog(page, true);

  expect(await getDownloadOutputButton(page)).toBeEnabled();
});

test("can see errors when submit incomplete welcome screen settings", async ({page}) => {
  await shared.expectErrorsOnIncompleteWelcomeScreen(page, true);
});

test("can see errors when submit incomplete run parameters", async ({page}) => {
  await shared.completeWelcomeScreenForm(page, true);
  await shared.expectErrorsOnIncompleteRunParameters(page, true, setSampleFileInput, setMinknowFolderInput);
});

test("can see errors when submit incomplete settings", async ({page}) => {
  await shared.completeWelcomeScreenForm(page, true);
  await prepareFileInputs(page);
  await shared.expectErrorsOnIncompleteSettings(page);
});
