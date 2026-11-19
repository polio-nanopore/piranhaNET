import {expect, Locator, Page } from "@playwright/test";
import pkg from "../../../package.json" with { type: "json" };
import {getWindow, launchApp} from "../../../piranha-electron/tests/e2e/utils";

export const piranhaNETVersion = (): string => pkg.version;
export const semanticVersionRegex = /[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+)?$/;

export const clearLocalStorage = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.removeItem("lang");
    localStorage.removeItem("userSettings");
    localStorage.removeItem("runSettings");
  });
};

export const getAboutLink = async (page: Page): Promise<Locator> =>
  await page.getByTestId("nav-about");

export const expectAboutTitle = async (page:Page): Promise<void> =>
  await expect(await page.getByText("About PiranhaNET")).toBeVisible();

export const expectPiranhaVersion = async (page:Page): Promise<void> =>
  await expect(await page.getByText("Piranha v1.6.3")).toBeVisible();

// Run Parameters
const getNameInput = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Name/);
const getSamplesFileButton = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Samples file/);
const getMinKnowFolderButton = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/MinKnow folder/);
const getNotesInput = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Notes/);
// Settings
export const getSettings = async (page: Page): Promise<Locator> =>
  await page.getByTestId("settings");
// Output Settings
export const getOutputSettings = async (page: Page): Promise<Locator> =>
  await page.getByTestId("piranhaOutputSettings");
export const getAllMetadataToHeader = async (page: Page): Promise<Locator> =>
  await page.getByLabel("All metadata to header");
// User Settings
const getUserSettings = async (page: Page): Promise<Locator> =>
  await page.getByTestId("userSettings");
const getUserNameInput = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/User name/);
const getInstituteInput = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Institute/);
const getOutputFolderButton = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Output folder/);
// Run Settings
const getRunSettings = async (page: Page): Promise<Locator> =>
  await page.getByTestId("runSettings");
const getProtocol = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Protocol/);
const getPositiveControl = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Positive control/);
const getNegativeControl = async (page: Page): Promise<Locator> =>
  await page.getByLabel(/Negative control/);

const getContinueButton = async (page: Page): Promise<Locator> =>
  await page.getByRole("button", { name: /Continue/ });
const getRunButton = async (page: Page): Promise<Locator> =>
  await page.getByRole("button", { name: /Run Piranha/ });
export const getLog = async (page: Page): Promise<Locator> =>
  await page.getByTestId("logs");
const getCancelButton = async (page: Page): Promise<Locator> =>
  await page.getByRole("button", { name: /Cancel Run/ });
const getNewRunButton = async (page: Page): Promise<Locator> =>
  await page.getByRole("button", { name: "New Run" });

const expectErrorMessage = async (
  fieldElement: Locator,
  expectError = true,
  expectedErrorMsg = "Required value",
): Promise<void> => {
  // error is in <p> following field
  const errorEl = fieldElement.locator("//following-sibling::p");
  if (expectError) {
    await expect(errorEl).toHaveText(expectedErrorMsg);
  } else {
    await expect(errorEl).not.toBeVisible();
  }
};

export const getProgressSpinner = async (page: Page): Promise<Locator> =>
  await page.getByTestId("run-progress-spinner")


const getFieldFromDialogButton = (buttonElement: Locator): Locator =>
  buttonElement.locator("..");

export const completeWelcomeScreenForm = async (page: Page, isWeb = false): Promise<void> => {
  await expect(
    await page.getByText("PiranhaNET", { exact: true }),
  ).toBeVisible();

  // need to wait for button to become visible when docker image has downloaded
  await expect(await getContinueButton(page)).toBeVisible({
    timeout: 300_000,
  });

  const userNameInput = await getUserNameInput(page);
  await userNameInput.fill("Test User");
  const instituteInput = await getInstituteInput(page);
  await instituteInput.fill("Test Institute");
  if (!isWeb) {
    const outputFolderButton = await getOutputFolderButton(page);
    await outputFolderButton.click();
  }
  const continueButton = await getContinueButton(page);
  await continueButton.click();
};

export const fillRunParameters = async (win: Page): Promise<void> => {
  const nameInput = await getNameInput(win);
  await nameInput.fill("Test Name");

  const samplesFileButton = await getSamplesFileButton(win);
  await samplesFileButton.click();

  const minKnowFolderButton = await getMinKnowFolderButton(win);
  await minKnowFolderButton.click();

  const notesInput = await getNotesInput(win);
  await notesInput.fill("some test notes");
};

export const expectHelpTextOnHover = async (page: Page) => {
  const tooltipTrigger = await page
    .locator("button[data-slot='tooltip-trigger']")
    .nth(0);
  await tooltipTrigger.hover();
  expect(
    await page.locator("div[data-bits-floating-content-wrapper]"),
  ).toHaveText(/Run name to appear in report/);
};

export const fillRunSettings = async (page: Page): Promise<void> => {
  const posControl = await getPositiveControl(page);
  await posControl.fill("pos");
  const negControl = await getNegativeControl(page);
  await negControl.fill("neg");
};

export const fillUserSettings = async (page: Page): Promise<void> => {
  const userSettings = await getUserSettings(page);
  await userSettings.click();
  const userNameInput = await getUserNameInput(page);
  await userNameInput.fill("New Test User");
};

export const startPiranhaRun = async (page: Page): Promise<void> => {
  // A wait seems to necessary here to allow updates before submitting run
  await page.waitForTimeout(2000);
  const runButton = await getRunButton(page);
  await runButton.click();
};

export const expectSuccessfulRunLog = async (page: Page, isWeb = false): Promise<void> => {
  // See expected start run text in log
  const log = await getLog(page);
  await expect(log).toHaveText(/Building DAG of jobs.../, { timeout: 15_000 });
  console.log("Run has started");

  // Expect to see parameters and settings being used in log
  await expect(log).toHaveText(/Setting username: New_Test_User/);
  await expect(log).toHaveText(/Setting institute: Test_Institute/);
  await expect(log).toHaveText(/Setting runname: Test_Name/);
  await expect(log).toHaveText(/Setting notes: some_test_notes/);
  await expect(log).toHaveText(/Setting positive_control: pos/);
  await expect(log).toHaveText(/Setting negative_control: neg/);
  if (!isWeb) {
    // This setting is not available in web mode
    await expect(log).toHaveText(/Setting overwrite: True/);
  }
  await expect(log).toHaveText(/Setting all_metadata_to_header: True/);

  // Eventually see run completed successfully
  await expect(page.getByTestId("run-progress-check")).toBeVisible({
    timeout: 600_000,
  });
  if (isWeb) {
    // Web server writes output to location named after run id
    await expect(log).toHaveText(
      /Generating: \/requests-data\/output\/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_[a-zA-Z0-9]{22}\/report.html/,
    );
  } else {
    await expect(log).toHaveText(
      /Generating: \/data\/run_data\/output\/piranha_output\/report\.html/,
    );
  }
  await expect(log).toHaveText(/Piranha run finished/);
};

export const expectErrorsOnIncompleteWelcomeScreen = async (page: Page, isWeb = false) => {
  await expect(await getContinueButton(page)).toBeVisible({
    timeout: 300_000,
  });
  const continueButton = await getContinueButton(page);
  await continueButton.click();

  const userNameInput = await getUserNameInput(page);
  await expectErrorMessage(userNameInput);

  const instituteInput = await getInstituteInput(page);
  await expectErrorMessage(instituteInput);

  if (!isWeb) {
    const outputFolderButton = await getOutputFolderButton(page);
    const outputFolderField = getFieldFromDialogButton(outputFolderButton);
    await expectErrorMessage(outputFolderField);
  }
};

export const expectErrorsOnIncompleteRunParameters = async (page: Page, isWeb = false,
                                                            setSamplesFileInput,
                                                            setMinknowFolderInput) => {
  // click run on next screen - should get errors on all parameters except threads, and also on run settings
  const runButton = await getRunButton(page);
  await runButton.click();

  const nameInput = await getNameInput(page);
  await expectErrorMessage(nameInput);

  const samplesFileButton = await getSamplesFileButton(page);
  const samplesFileField = getFieldFromDialogButton(samplesFileButton);
  await expectErrorMessage(samplesFileField);

  const minKnowFolderButton = await getMinKnowFolderButton(page);
  const minKnowFolderField = getFieldFromDialogButton(minKnowFolderButton);
  await expectErrorMessage(minKnowFolderField);

  const notesInput = await getNotesInput(page);
  await expectErrorMessage(notesInput);

  // correct values and see errors disappear
  await nameInput.fill("test name");
  // Need to lose focus for update to occur
  await nameInput.blur();
  await expectErrorMessage(nameInput, false);

  if (isWeb) {
    await setSamplesFileInput(page);
  } else {
    await samplesFileButton.click();
  }
  await expectErrorMessage(samplesFileField, false);

  if (isWeb) {
    await setMinknowFolderInput(page);
  } else {
    await minKnowFolderButton.click();
  }
  await expectErrorMessage(minKnowFolderField, false);

  await notesInput.fill("test notes");
  await notesInput.blur();
  await expectErrorMessage(notesInput, false);

  // put in an invalid threads value - see threads error
  const threadsInput = await page.locator("#threads-field");
  await threadsInput.fill("-1");
  await threadsInput.blur();
  await expectErrorMessage(
    threadsInput,
    true,
    "Value must be between 1 and 20",
  );
  await threadsInput.fill("");
  await threadsInput.blur();
  await expectErrorMessage(threadsInput, true, "Value must be a whole number");
  await threadsInput.fill("21");
  await threadsInput.blur();
  await expectErrorMessage(
    threadsInput,
    true,
    "Value must be between 1 and 20",
  );

  // correct value and see threads error disappear
  await threadsInput.fill("20");
  await threadsInput.blur();
  await expectErrorMessage(threadsInput, false);
};

export const expectErrorsOnIncompleteSettings = async (page: Page) => {
  const userSettings = await getUserSettings(page);
  await userSettings.click();
  // Clear username and institute - should see errors on both when press Run
  const userNameInput = await getUserNameInput(page);
  await userNameInput.fill("");
  const instituteInput = await getInstituteInput(page);
  await instituteInput.fill("");

  const runButton = await getRunButton(page);
  await runButton.click();

  await expectErrorMessage(userNameInput);
  await expectErrorMessage(instituteInput);

  // We haven't provided control values, so should also see error for those
  const posInput = await getPositiveControl(page);
  await expectErrorMessage(posInput);
  const negInput = await getNegativeControl(page);
  await expectErrorMessage(negInput);

  await userNameInput.fill("Test User");
  await userNameInput.blur();
  await expectErrorMessage(userNameInput, false);
  await instituteInput.fill("Test Institute");
  await instituteInput.blur();
  await expectErrorMessage(instituteInput, false);
};

export const testCanChangeLanguage = async (page: Page, relaunchApp) => {
  let title = await page.getByTestId("welcome");
  await expect(title).toHaveText(/Welcome to PiranhaNET/);

  //change to French
  let langLink = await page.getByRole("button", { name: "en", exact: true });
  await langLink.click();
  const frItem = await page.getByTestId("lang-fr");
  await frItem.click();
  await expect(title).toHaveText(/Bienvenue sur PiranhaNET/);
  const userNameLabel = await page.getByTestId("user-name-field-label");
  await expect(userNameLabel).toHaveText(/Nom d'utilisateur/);

  //change to Portuguese
  langLink = await page.getByRole("button", { name: "fr" });
  await langLink.click();
  const ptItem = await page.getByTestId("lang-pt");
  await ptItem.click();
  await expect(title).toHaveText(/Bem-vindo ao PiranhaNET/);
  await expect(userNameLabel).toHaveText(/Nome de utilizador/);

  // Test language is retained on restart
  page = await relaunchApp(page);
  langLink = await page.getByRole("button", { name: "pt" });
  expect(langLink).toBeEnabled();
  title = await page.getByTestId("welcome");
  await expect(title).toHaveText(/Bem-vindo ao PiranhaNET/);

  // change back to English
  await langLink.click();
  const enItem = await page.getByTestId("lang-en");
  await enItem.click();
  await expect(title).toHaveText(/Welcome to PiranhaNET/);
  await expect(await page.getByTestId("user-name-field-label")).toHaveText(
    /User name/,
  );
};

export const testUserAndRunSettingsArePersisted =  async (page: Page, isWeb: boolean, relaunchApp) => {
  await completeWelcomeScreenForm(page, isWeb);
  let protocol = await getProtocol(page);
  await protocol.click();
  const environmental = await page.getByText(/environmental/);
  await environmental.click();
  let posControl = await getPositiveControl(page);
  await posControl.fill("test pos");
  await posControl.blur();
  let negControl = await getNegativeControl(page);
  await negControl.fill("test neg");
  await negControl.blur();

  // restart app and test values have been persisted.
  page = await relaunchApp(page);

  // should be taken to run screen immediately
  const run = await getRunButton(page);
  await expect(run).toBeVisible();

  const settings = await page.getByTestId("settings");
  await settings.click();

  // check user settings
  const userSettings = await getUserSettings(page);
  await userSettings.scrollIntoViewIfNeeded();
  await expect(userSettings).toBeVisible();
  await userSettings.click();
  const userNameInput = await getUserNameInput(page);
  await expect(userNameInput).toHaveValue("Test User");
  const instituteInput = await getInstituteInput(page);
  await expect(instituteInput).toHaveValue("Test Institute");
  if (!isWeb) {
    const outputFolderField = await page.getByTestId("output-folder-field-value");
    await expect(outputFolderField).toHaveText(/\/test-results/);
  }

  // check run settings
  const runSettings = await getRunSettings(page);
  await runSettings.click();
  protocol = await getProtocol(page);
  await expect(protocol).toHaveText(/environmental/);
  posControl = await getPositiveControl(page);
  await expect(posControl).toHaveValue("test pos");
  negControl = await getNegativeControl(page);
  await expect(negControl).toHaveValue("test neg");
};
