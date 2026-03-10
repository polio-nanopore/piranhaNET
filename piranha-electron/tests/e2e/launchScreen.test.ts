import { test, expect, _electron as electron, Page } from "@playwright/test";

let electronApp;

test.beforeEach(async () => {
  // Point Playwright at the built main scripts, not the src ts file. Do not use sandbox - this causes
  // permission-related failures on CI.
  electronApp = await electron.launch({ args: ["out/main/index.js", "--no-sandbox"] });
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
  await expect(await win.getByText(/PiranhaNET/)).toBeVisible();

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
