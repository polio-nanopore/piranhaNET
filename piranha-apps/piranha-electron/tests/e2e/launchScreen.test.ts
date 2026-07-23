import {
  test,
  expect,
  _electron as electron,
  Locator,
  Page,
  ElectronApplication,
} from "@playwright/test";

let electronApp;

const launchApp = async (): Promise<ElectronApplication> =>
  await electron.launch({ args: ["out/main/index.js", "--no-sandbox"] });

const initialiseFileDialogHandler = async (): Promise<void> => {
  await electronApp.evaluate(({ app, ipcMain }) => {
    ipcMain.removeHandler("show-file-dialog");
    ipcMain.handle("show-file-dialog", async (_event, options) => {
      const currentDir = app.getAppPath();

      const join = (...args): string => {
        return args.join("/");
      };

      const sourceDir = join(...currentDir.split("/").slice(0, -3));

      const testDataDir = join(sourceDir, "test-data");
      if (options.title === "Barcodes file") {
        return join(testDataDir, "barcodes.csv");
      }
      if (options.title === "MinKnow folder") {
        return join(testDataDir, "demultiplexed");
      }
      if (options.title === "Output folder") {
        return join(sourceDir, "test-results");
      }
      //throw new Error("unknown title");
      return "unknown title";
    });
  });
};

test.beforeEach(async () => {
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
  electronApp = await launchApp();
  await initialiseFileDialogHandler();
});

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

const getWindow = async (app = electronApp): Promise<Page> => {
  return await app.firstWindow();
};

// Run Parameters
const getNameInput = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Name/);
const getBarcodesFileButton = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Barcodes file/);
const getMinKnowFolderButton = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/MinKnow folder/);
const getNotesInput = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Notes/);
// User Settings
const getUserSettings = async (win: Page): Promise<Locator> =>
  await win.getByTestId("userSettings");
const getUserNameInput = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/User name/);
const getInstituteInput = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Institute/);
const getOutputFolderButton = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Output folder/);
// Run Settings
const getRunSettings = async (win: Page): Promise<Locator> =>
  await win.getByTestId("runSettings");
const getProtocol = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Protocol/);
const getPositiveControl = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Positive control/);
const getNegativeControl = async (win: Page): Promise<Locator> =>
  await win.getByLabel(/Negative control/);

const getContinueButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Continue/ });
const getRunButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Run Piranha/ });

const getOpenReportButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Open report/ });
const getOpenOutputFolderButton = async (win: Page): Promise<Locator> =>
  await win.getByRole("button", { name: /Open output folder/ });

const getFieldFromDialogButton = (buttonElement: Locator): Locator =>
  buttonElement.locator("..");
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

const completeWelcomeScreenForm = async (win: Page): Promise<void> => {
  await expect(await win.getByText(/Initializing.../)).toBeVisible();
  await expect(
    await win.getByText("PiranhaNET", { exact: true }),
  ).toBeVisible();

  // need to wait for button to become visible when docker image has downloaded
  await expect(await getContinueButton(win)).toBeVisible({
    timeout: 300_000,
  });

  const userNameInput = await getUserNameInput(win);
  await userNameInput.fill("Test User");
  const instituteInput = await getInstituteInput(win);
  await instituteInput.fill("Test Institute");
  const outputFolderButton = await getOutputFolderButton(win);
  await outputFolderButton.click();
  const continueButton = await getContinueButton(win);
  await continueButton.click();
};

test("can see welcome screen and run form, fill in parameters form and run Piranha", async () => {
  const win = await getWindow();
  await completeWelcomeScreenForm(win);

  // Fill in Run parameters
  const nameInput = await getNameInput(win);
  await nameInput.fill("Test Name");

  const barcodesFileButton = await getBarcodesFileButton(win);
  await barcodesFileButton.click();

  const minKnowFolderButton = await getMinKnowFolderButton(win);
  await minKnowFolderButton.click();

  const notesInput = await getNotesInput(win);
  await notesInput.fill("some test notes");

  // Also fill in run settings
  const settings = await win.getByTestId("settings");
  const posControl = await getPositiveControl(win);
  await posControl.fill("pos");
  const negControl = await getNegativeControl(win);
  await negControl.fill("neg");

  // Open and edit Piranha Output settings
  const piranhaOutput = await settings.getByTestId("piranhaOutputSettings");
  await piranhaOutput.click();
  const overwriteOutput = await piranhaOutput.getByLabel("Overwrite output");
  await overwriteOutput.click();
  const allMetadataToHeader = await piranhaOutput.getByLabel(
    "All metadata to header",
  );
  await allMetadataToHeader.click();

  // Open and edit User Settings (these were the ones we originally entered in the Welcome screen)
  const userSettings = await getUserSettings(win);
  await userSettings.click();
  const userNameInput = await getUserNameInput(win);
  await userNameInput.fill("New Test User");

  // A wait seems to necessary here to allow updates before submitting run
  await win.waitForTimeout(2000);
  const runButton = await getRunButton(win);
  await runButton.click();

  // See progress spinner
  expect(await win.getByTestId("run-progress-spinner")).toBeVisible();

  // Open output buttons are not visible yet
  expect(await getOpenReportButton(win)).toHaveCount(0);
  expect(await getOpenOutputFolderButton(win)).toHaveCount(0);

  // See expected start run text in log
  const log = await win.getByTestId("logs");
  await expect(log).toHaveText(/Building DAG of jobs.../, { timeout: 15_000 });
  console.log("Run has started");

  // Expect to see parameters and settings being used in log
  await expect(log).toHaveText(/Setting username: New_Test_User/);
  await expect(log).toHaveText(/Setting institute: Test_Institute/);
  await expect(log).toHaveText(/Setting runname: Test_Name/);
  await expect(log).toHaveText(/Setting notes: some_test_notes/);
  await expect(log).toHaveText(/Setting positive_control: pos/);
  await expect(log).toHaveText(/Setting negative_control: neg/);
  await expect(log).toHaveText(/Setting overwrite: True/);
  await expect(log).toHaveText(/Setting all_metadata_to_header: True/);

  // Eventually see run completed successfully
  await expect(win.getByTestId("run-progress-check")).toBeVisible({
    timeout: 300_000,
  });

  await expect(log).toHaveText(
    /Generating: \/data\/run_data\/output\/piranha_output\/report\.html/,
  );
  await expect(log).toHaveText(/Piranha Run Finished/);

  expect(await getOpenReportButton(win)).toBeEnabled();
  expect(await getOpenOutputFolderButton(win)).toBeEnabled();
});

test("can see errors when submit incomplete welcome screen settings", async () => {
  const win = await getWindow();
  await expect(await getContinueButton(win)).toBeVisible({
    timeout: 300_000,
  });
  const continueButton = await getContinueButton(win);
  await continueButton.click();

  const userNameInput = await getUserNameInput(win);
  await expectErrorMessage(userNameInput);

  const instituteInput = await getInstituteInput(win);
  await expectErrorMessage(instituteInput);

  const outputFolderButton = await getOutputFolderButton(win);
  const outputFolderField = getFieldFromDialogButton(outputFolderButton);
  await expectErrorMessage(outputFolderField);
});

test("can see errors when submit incomplete run parameters", async () => {
  const win = await getWindow();
  await completeWelcomeScreenForm(win);

  // click run on next screen - should get errors on all parameters except threads, and also on run settings
  const runButton = await getRunButton(win);
  await runButton.click();

  const nameInput = await getNameInput(win);
  await expectErrorMessage(nameInput);

  const barcodesFileButton = await getBarcodesFileButton(win);
  const barcodesFileField = getFieldFromDialogButton(barcodesFileButton);
  await expectErrorMessage(barcodesFileField);

  const minKnowFolderButton = await getMinKnowFolderButton(win);
  const minKnowFolderField = getFieldFromDialogButton(minKnowFolderButton);
  await expectErrorMessage(minKnowFolderField);

  const notesInput = await getNotesInput(win);
  await expectErrorMessage(notesInput);

  // correct values and see errors disappear
  await nameInput.fill("test name");
  // Need to lose focus for update to occur
  await nameInput.blur();
  await expectErrorMessage(nameInput, false);

  await barcodesFileButton.click();
  await expectErrorMessage(barcodesFileField, false);

  await minKnowFolderButton.click();
  await expectErrorMessage(minKnowFolderField, false);

  await notesInput.fill("test notes");
  await notesInput.blur();
  await expectErrorMessage(notesInput, false);

  // put in an invalid threads value - see threads error
  const threadsInput = await win.locator("#threads-field");
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
});

test("can see errors when submit incomplete settings", async () => {
  const win = await getWindow();
  await completeWelcomeScreenForm(win);
  const userSettings = await getUserSettings(win);
  await userSettings.click();
  // Clear username and institute - should see errors on both when press Run
  const userNameInput = await getUserNameInput(win);
  await userNameInput.fill("");
  const instituteInput = await getInstituteInput(win);
  await instituteInput.fill("");

  const runButton = await getRunButton(win);
  await runButton.click();

  await expectErrorMessage(userNameInput);
  await expectErrorMessage(instituteInput);

  await userNameInput.fill("Test User");
  await userNameInput.blur();
  await expectErrorMessage(userNameInput, false);
  await instituteInput.fill("Test Institute");
  await instituteInput.blur();
  await expectErrorMessage(instituteInput, false);
});

test("can change language", async () => {
  let win = await getWindow();
  let title = await win.getByTestId("welcome");
  await expect(title).toHaveText(/Welcome to PiranhaNET/);

  //change to French
  let langLink = await win.getByRole("button", { name: "en", exact: true });
  await langLink.click();
  const frItem = await win.getByTestId("lang-fr");
  await frItem.click();
  await expect(title).toHaveText(/Bienvenue sur PiranhaNET/);
  const userNameLabel = await win.getByTestId("user-name-field-label");
  await expect(userNameLabel).toHaveText(/Nom d'utilisateur/);

  //change to Portuguese
  langLink = await win.getByRole("button", { name: "fr" });
  await langLink.click();
  const ptItem = await win.getByTestId("lang-pt");
  await ptItem.click();
  await expect(title).toHaveText(/Bem-vindo ao PiranhaNET/);
  await expect(userNameLabel).toHaveText(/Nome de utilizador/);

  // Test language is retained on restart
  await electronApp.close();
  electronApp = await launchApp();
  win = await getWindow();
  langLink = await win.getByRole("button", { name: "pt" });
  expect(langLink).toBeEnabled();
  title = await win.getByTestId("welcome");
  await expect(title).toHaveText(/Bem-vindo ao PiranhaNET/);

  // change back to English
  await langLink.click();
  const enItem = await win.getByTestId("lang-en");
  await enItem.click();
  await expect(title).toHaveText(/Welcome to PiranhaNET/);
  await expect(await win.getByTestId("user-name-field-label")).toHaveText(
    /User name/,
  );
});

test("user and run settings are persisted", async () => {
  let win = await getWindow();
  await completeWelcomeScreenForm(win);
  let protocol = await getProtocol(win);
  await protocol.click();
  const environmental = await win.getByText(/environmental/);
  await environmental.click();
  let posControl = await getPositiveControl(win);
  await posControl.fill("test pos");
  await posControl.blur();
  let negControl = await getNegativeControl(win);
  await negControl.fill("test neg");
  await negControl.blur();

  // restart app and test values have been persisted.
  await electronApp.close();
  const newApp = await launchApp();
  win = await getWindow(newApp);

  // should be taken to run screen immediately
  const run = await getRunButton(win);
  expect(run).toBeVisible();

  const settings = await win.getByTestId("settings");
  await settings.click();

  // check user settings
  const userSettings = await getUserSettings(win);
  await userSettings.scrollIntoViewIfNeeded();
  expect(userSettings).toBeVisible();
  await userSettings.click();
  const userNameInput = await getUserNameInput(win);
  await expect(userNameInput).toHaveValue("Test User");
  const instituteInput = await getInstituteInput(win);
  await expect(instituteInput).toHaveValue("Test Institute");
  const outputFolderField = await win.getByTestId("output-folder-field-value");
  await expect(outputFolderField).toHaveText(/\/test-results/);

  // check run settings
  const runSettings = await getRunSettings(win);
  await runSettings.click();
  protocol = await getProtocol(win);
  await expect(protocol).toHaveText(/environmental/);
  posControl = await getPositiveControl(win);
  await expect(posControl).toHaveValue("test pos");
  negControl = await getNegativeControl(win);
  await expect(negControl).toHaveValue("test neg");
});
