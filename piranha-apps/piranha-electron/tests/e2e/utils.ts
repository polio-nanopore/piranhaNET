import {
  _electron as electron,
  ElectronApplication,
  Page,
} from "@playwright/test";
import pkg from "../../../package.json" with { type: "json" };

export const launchApp = async (): Promise<ElectronApplication> =>
  await electron.launch({ args: ["out/main/index.js", "--no-sandbox"] });

export const initialiseTest = async (): Promise<ElectronApplication> => {
  // Initialise to default language (English) for all tests, and remove any saved settings
  const app = await launchApp();
  const win = await app.firstWindow();
  await win.evaluate(() => {
    localStorage.removeItem("lang");
    localStorage.removeItem("userSettings");
    localStorage.removeItem("runSettings");
  });
  await app.close(); // We'll need to re-open to get back to Welcome screen

  // Point Playwright at the built main scripts, not the src ts file. Do not use sandbox - this causes
  // permission-related failures on CI.
  const electronApp = await launchApp();
  await electronApp.firstWindow(); // wait for window to be available
  return electronApp;
};

export const getWindow = async (app: ElectronApplication): Promise<Page> => {
  return await app.firstWindow();
};

export const piranhaNETVersion = (): string => pkg.version;
