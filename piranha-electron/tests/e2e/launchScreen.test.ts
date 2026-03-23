import { test, expect, _electron as electron, Page, ElectronApplication } from "@playwright/test";

let electronApp;

const launchApp = async (): Promise<ElectronApplication> =>
  await electron.launch({ args: ["out/main/index.js", "--no-sandbox"] });

test.beforeAll(async () => {
  // Initialise to default language (English) for all subsequent tests
  const app = await launchApp();
  const win = await app.firstWindow();
  await win.evaluate(() => {
    localStorage.removeItem("lang");
  });
  await app.close();
});

test.beforeEach(async () => {
  // Point Playwright at the built main scripts, not the src ts file. Do not use sandbox - this causes
  // permission-related failures on CI.
  electronApp = await launchApp();
});

test.afterEach(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

const getWindow = async (): Promise<Page> => {
  return await electronApp.firstWindow();
};

test("can see main window and run Piranha", async () => {
  const win = await getWindow();
  await expect(await win.getByText(/Initializing.../)).toBeVisible();
  await expect(await win.getByText("PiranhaNET", { exact: true })).toBeVisible();

  // need to wait for button to become visible when docker image has downloaded
  await expect(await win.getByText(/Run Piranha/)).toBeVisible({ timeout: 300_000 });

  // click run button
  await win.getByRole("button", { name: /Run Piranha/ }).click();

  // See expected start run text in log
  const log = await win.getByTestId("log");
  await expect(log).toHaveText(/Building DAG of jobs.../);

  // Eventually see run finished messages
  await expect(log).toHaveText(/\/data\/run_data\/output\/piranha_output_\d+\/report\.html/, {
    timeout: 300_000
  });
  await expect(log).toHaveText(/Piranha Run Finished/);
});

test("can change language", async () => {
  let win = await getWindow();
  let welcome = await win.getByTestId("welcome");
  await expect(welcome).toHaveText(/Welcome to Piranha/);

  //change to French
  let select = await win.getByTestId("lang");
  await select.selectOption("fr");
  await expect(welcome).toHaveText(/Bienvenue à PiranhaNET/);
  const run = await win.getByTestId("run");
  await expect(run).toHaveText(/Courez Piranha/);
  const testMsg = await win.getByTestId("test-msg");
  await expect(testMsg).toHaveText(/Envoyer un message de test/);

  //change to Portuguese
  await select.selectOption("pt");
  await expect(welcome).toHaveText(/Bem-vindo ao PiranhaNET/);
  await expect(run).toHaveText(/Corra Piranha/);
  await expect(run).toHaveText(/Corra Piranha/);
  await expect(testMsg).toHaveText(/Enviar mensagem de teste/);

  // Test language is retained on restart
  await electronApp.close();
  electronApp = await launchApp();
  win = await getWindow();
  select = await win.getByTestId("lang");
  await expect(select).toHaveValue("pt");
  welcome = await win.getByTestId("welcome");
  await expect(welcome).toHaveText(/Bem-vindo ao PiranhaNET/);

  // change back to English
  await select.selectOption("en");
  await expect(welcome).toHaveText(/Welcome to Piranha/);
  await expect(await win.getByTestId("run")).toHaveText(/Run Piranha/);
  await expect(await win.getByTestId("test-msg")).toHaveText(/Send test message/);
});
