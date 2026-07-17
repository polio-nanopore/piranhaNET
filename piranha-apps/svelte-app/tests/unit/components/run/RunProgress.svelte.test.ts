import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import {
  expectTranslations,
  renderInI18nTestContext,
} from "../../utils";
import { screen, within, render } from "@testing-library/svelte";
import RunProgress from "../../../../src/components/run/RunProgress.svelte";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import { settings, runParameters } from "$lib/store.svelte";
import {mockPiranhaAPI} from "../../MockPiranhaAPI.svelte";

describe("RunProgress", () => {
  beforeEach(() => {
    settings.outputFolderPath = "/test/output";
    runParameters.name = "Test Run";
    runParameters.barcodesFilePath = "/test/input/barcodes.csv";
    runParameters.minKnowFolderPath = "/test/input/minknow";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders as expected", async () => {
    mockPiranhaAPI({
      initialized: true,
      log: ["log entry 1 ", "log entry 2"],
      running: true,
    });
    renderInI18nTestContext(RunProgress);

    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("run-progress")).toHaveTextContent(text);
      },
      {
        en: "Sequencing run progress",
        fr: "État d'avancement du séquençage",
        pt: "Progresso da execução do sequenciamento",
      },
    );

    expect(screen.getByText("Test Run")).toBeVisible();
    await expectTranslations(
      (text) => {
        const parent = screen.getByText(text);
        expect(
          within(parent).getByText(/\/test\/input\/barcodes\.csv/),
        ).toBeVisible();
      },
      {
        en: /Barcodes file/,
        fr: /Fichier de codes-barres/,
        pt: /Ficheiro de códigos de barras/,
      },
    );

    await expectTranslations(
      (text) => {
        const parent = screen.getByText(text);
        expect(
          within(parent).getByText(/\/test\/input\/minknow/),
        ).toBeVisible();
      },
      {
        en: /MinKnow folder/,
        fr: /Dossier MinKnow/,
        pt: /Pasta MinKnow/,
      },
    );

    await expectTranslations(
      (text) => {
        const parent = screen.getByText(text);
        expect(within(parent).getByText(/\/test\/output/)).toBeVisible();
      },
      {
        en: /Output folder/,
        fr: /Dossier de sortie/,
        pt: /Pasta de saída/,
      },
    );

    expect(screen.getByTestId("logs")).toHaveTextContent(
      /log entry 1 log entry 2/,
    );

    //No New Run button before run completes
    expect(screen.queryByRole("button")).toBeNull();

    // Can see spinner and not complete icons before run completes
    expect(screen.getByTestId("run-progress-spinner")).toBeVisible();
    expect(screen.queryByTestId("run-progress-x")).toBeNull();
    expect(screen.queryByTestId("run-progress-check")).toBeNull();

    expect(screen.queryByTestId("open-report")).toBeNull();
    expect(screen.queryByTestId("open-output-folder")).toBeNull();
  });

  test("see check and open results button when running is complete with no error", async () => {
    mockPiranhaAPI({
      initialized: true,
      log: ["log entry 1 ", "log entry 2"],
      running: false,
      runSucceeded: true
    });
    renderInI18nTestContext(RunProgress);
    expect(screen.getByTestId("run-progress-check")).toBeVisible();
    expect(screen.queryByTestId("run-progress-x")).toBeNull();
    expect(screen.queryByTestId("run-progress-spinner")).toBeNull();
    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("open-report")).toHaveTextContent(text);
      },
      {
        en: /Open report/,
        fr: /Ouvrir le rapport/,
        pt: /Abra o relatório/,
      },
    );

    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("open-output-folder")).toHaveTextContent(text);
      },
      {
        en: /Open output folder/,
        fr: /Ouvrir e dossier de sortie/,
        pt: /Abra a pasta de saída/,
      },
    );
  });

  test("Open report button calls expected method on piranha API", async () => {
    mockPiranhaAPI({
      initialized: true,
      running: false,
      runSucceeded: true
    });
    await screen.getByTestId("open-report").click();
    expect(piranhaAPI.openRunReport).toHaveBeenCalled();
    expect(piranhaAPI.openRunOutputFolder).not.toHaveBeenCalled();
  });

  test("Open output folder calls expected method on piranhaAPI", async () => {
    mockPiranhaAPI({
      initialized: true,
      running: false,
      runSucceeded: true
    });
    await screen.getByTestId("open-output-folder").click();
    expect(piranhaAPI.openRunReport).not.toHaveBeenCalled();
    expect(piranhaAPI.openRunOutputFolder).toHaveBeenCalled();
  });

  test("see x when running is complete with error", () => {
    mockPiranhaAPI({
      initialized: true,
      log: ["log entry 1 ", "log entry 2"],
      running: false,
      error: "oh no",
    });
    renderInI18nTestContext(RunProgress);
    expect(screen.getByTestId("run-progress-x")).toBeVisible();
    expect(screen.queryByTestId("run-progress-check")).toBeNull();
    expect(screen.queryByTestId("run-progress-spinner")).toBeNull();
    expect(screen.queryByTestId("open-report")).toBeNull();
    expect(screen.queryByTestId("open-output-folder")).toBeNull();
  });

  test("new run clears log", async () => {
    mockPiranhaAPI({
      initialized: true,
      log: ["log entry 1 ", "log entry 2"],
      running: false,
    });
    renderInI18nTestContext(RunProgress);
    await expectTranslations(
      (text) => {
        expect(screen.getByRole("button")).toHaveTextContent(text);
      },
      {
        en: "New Run",
        fr: "Nouvelle course",
        pt: "Nova corrida",
      },
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    expect(piranhaAPI.clearRun).toHaveBeenCalled();
  });

  test("updating log triggers scroll to end", async () => {
    mockPiranhaAPI({
      initialized: true,
      log: ["log entry 1 ", "log entry 2"],
      running: false,
    });

    const { container } = render(RunProgress);
    const logEl = container.querySelector("code[data-testid='logs']");
    const scrollHeightSpy = vi.spyOn(logEl, "scrollHeight", "get").mockImplementation(() => 500);
    let scrollTopToUpdate = 0;
    vi.spyOn(logEl, "scrollTop", "set").mockImplementation((value) => scrollTopToUpdate = value);

    piranhaAPI.log.push(["more", "log", "content"]);

    // Wait for debounce to trigger update
    await vi.advanceTimersByTimeAsync(1000);
    expect(scrollHeightSpy).toHaveBeenCalled();
    expect(scrollTopToUpdate).toBe(500);
  });
});
