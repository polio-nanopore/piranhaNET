import { test, expect, Locator, Page } from "@playwright/test";
import { initialiseTest, launchApp, getWindow } from "./utils";
import * as shared from "../../../shared/tests/e2e/utils";
import Docker from "dockerode";
import {expectErrorsOnIncompleteWelcomeScreen} from "../../../shared/tests/e2e/utils";

let electronApp;
const docker = new Docker();

const initialiseFileDialogHandler = async (): Promise<void> => {
  await electronApp.evaluate(({ app, ipcMain }) => {
    ipcMain.removeHandler("show-file-dialog");
    ipcMain.handle("show-file-dialog", async (_event, options) => {
      const currentDir = app.getAppPath();

      const join = (...args): string => {
        return args.join("/");
      };

      const sourceDir = join(...currentDir.split("/").slice(0, -3));

      const testDataDir = join(sourceDir, "test-data", "multiple_samples");
      if (options.title === "Samples file") {
        return join(testDataDir, "samples.csv");
      }
      if (options.title === "MinKnow folder") {
        return join(testDataDir, "minknow");
      }
      if (options.title === "Output folder") {
        return join(sourceDir, "test-results");
      }
      throw new Error("unknown title");
    });
  });
};

const relaunchApp = async () => {
  await electronApp.close();
  electronApp = await launchApp();
  return await getWindow(electronApp);
};

test.beforeEach(async () => {
  electronApp = await initialiseTest();
  await initialiseFileDialogHandler();
});

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

const getOpenReportButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Open report/ });
const getOpenOutputFolderButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Open output folder/ });

const piranhaIsRunning = async (): Promise<boolean> => {
  const containers = await docker.listContainers();
  return containers.some((c) => c.Image.startsWith("polionanopore/piranha:"));
};

test("can see welcome screen and run form, fill in parameters form and run Piranha", async () => {
  const win = await getWindow(electronApp);
  await shared.completeWelcomeScreenForm(win);

  await shared.fillRunParameters(win);

  await shared.expectHelpTextOnHover(page);

  await fillRunSettings(win);

  // Open and edit Piranha Output settings
  const settings = await shared.getSettings(win);
  expect(settings).toBeVisible();
  const piranhaOutput = await shared.getOutputSettings(win);
  await piranhaOutput.click();
  const overwriteOutput = await piranhaOutput.getByLabel("Overwrite output");
  await overwriteOutput.click();
  const allMetadataToHeader = await shared.getAllMetadataToHeader(win);
  await allMetadataToHeader.click();

  // Open and edit User Settings (these were the ones we originally entered in the Welcome screen)
  await shared.fillUserSettings(win);

  await shared.startPiranhaRun(win);

  expect(await shared.getProgressSpinner(win)).toBeVisible();

  // Open output buttons are not visible yet
  expect(await getOpenReportButton(win)).toHaveCount(0);
  expect(await getOpenOutputFolderButton(win)).toHaveCount(0);

  await shared.expectSuccessfulRunLog(win);

  expect(await getOpenReportButton(win)).toBeEnabled();
  expect(await getOpenOutputFolderButton(win)).toBeEnabled();
});

test("can see errors when submit incomplete welcome screen settings", async () => {
  const win = await getWindow(electronApp);
  await shared.expectErrorsOnIncompleteWelcomeScreen(win);
});

test("can see errors when submit incomplete run parameters", async () => {
  const win = await getWindow(electronApp);
  await shared.completeWelcomeScreenForm(win);
  await expectErrorsOnIncompleteRunParameters(win);
});

test("can see errors when submit incomplete settings", async () => {
  const win = await getWindow(electronApp);
  await shared.completeWelcomeScreenForm(win);
  await shared.expectErrorsOnIncompleteSettings(win);
});

test("can change language", async () => {
  let win = await getWindow(electronApp);
  await shared.testCanChangeLanguage(win, relaunchApp);
});

test("user and run settings are persisted", async () => {
  let win = await getWindow(electronApp);
  await shared.testUserAndRunSettingsArePersisted(win, false, relaunchApp);
});

test("cancel button ends run and kills docker container", async () => {
  // Cancel button is currently only implemented in Electron
  // Run job
  const win = await getWindow(electronApp);
  await completeWelcomeScreenForm(win);
  await fillRunParameters(win);
  await fillRunSettings(win);
  const runButton = await getRunButton(win);
  await runButton.click();
  await expect(await win.getByTestId("run-progress-spinner")).toBeVisible();

  // Test docker container is running
  await win.waitForTimeout(2000);
  expect(await piranhaIsRunning()).toBe(true);

  const cancelButton = await getCancelButton(win);
  await cancelButton.click();
  const cancelling = await win.getByTestId("cancelling");
  await expect(cancelling).toBeVisible();
  const log = await win.getByTestId("logs");
  await expect(log).toHaveText(/Run cancelled by user/, { timeout: 30_000 });
  await expect(await getNewRunButton(win)).toBeEnabled();
  await expect(await win.getByTestId("run-progress-x")).toBeVisible;

  // Confirm docker no longer running
  expect(await piranhaIsRunning()).toBe(false);
});
