import { describe, expect, test, afterEach, beforeAll, vi } from "vitest";
import { expectTranslations, renderInI18nTestContext } from "../../utils";
import { screen, within, render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import RunProgress from "../../../../src/components/run/RunProgress.svelte";
import { settings, runParameters } from "$lib/store.svelte";
import { mockPiranhaAPI } from "../../MockPiranhaAPI.svelte";
import { initialiseStore } from "../../../../src/lib/store.svelte";

describe("RunProgress", () => {
  const user = userEvent.setup();

  const expectCommonElementsWhileRunning = async (): Promise<void> => {
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
          within(parent).getByText(/\/test\/input\/samples\.csv/),
        ).toBeVisible();
      },
      {
        en: /Samples file/,
        fr: /Fichier d’échantillons/,
        pt: /Ficheiro de amostras/,
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

    expect(screen.getByTestId("logs")).toHaveTextContent(
      /log entry 1 log entry 2/,
    );

    expect(screen.getByTestId("run-progress-spinner")).toBeVisible();
    expect(screen.queryByTestId("run-progress-x")).toBeNull();
    expect(screen.queryByTestId("run-progress-check")).toBeNull();
  };

  const testNewRunClearsLog = async (piranhaAPI): Promise<void> => {
    renderInI18nTestContext(RunProgress);
    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("new-run")).toHaveTextContent(text);
      },
      {
        en: "New Run",
        fr: "Nouvelle analyse",
        pt: "Nova corrida",
      },
    );
    const button = screen.getByTestId("new-run");
    await user.click(button);
    expect(piranhaAPI.clearRun).toHaveBeenCalled();
  };

  describe("electron mode", () => {
    beforeAll(async () => {
      initialiseStore("electron");
      settings.outputFolderPath = "/test/output";
      runParameters.runName = "Test Run";
      runParameters.samplesFilePath = "/test/input/samples.csv";
      runParameters.minKnowFolderPath = "/test/input/minknow";
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("renders as expected", async () => {
      await mockPiranhaAPI({
        initialized: true,
        log: ["log entry 1 ", "log entry 2"],
        running: true,
      });
      renderInI18nTestContext(RunProgress);

      await expectCommonElementsWhileRunning();

      await expectTranslations(
        (text) => {
          const parent = screen.getByText(text);
          expect(within(parent).getByText(/\/test\/output/)).toBeVisible();
        },
        {
          en: /Output folder/,
          fr: /Dossier de résultats/,
          pt: /Pasta de saída/,
        },
      );

      //The only button before completion should be Cancel Run
      await expectTranslations(
        (text) => {
          expect(screen.getByRole("button")).toHaveTextContent(text);
        },
        {
          en: "Cancel Run",
          fr: "Annuler l'exécution",
          pt: "Cancelar execução",
        },
      );
      expect(screen.queryByTestId("cancelling")).toBeNull();

      expect(screen.queryByTestId("open-report")).toBeNull();
      expect(screen.queryByTestId("open-output-folder")).toBeNull();
    });

    test("see Check and Open Results buttons when running is complete with no error", async () => {
      await mockPiranhaAPI({
        initialized: true,
        log: ["log entry 1 ", "log entry 2"],
        running: false,
        runSucceeded: true,
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
          expect(screen.getByTestId("open-output-folder")).toHaveTextContent(
            text,
          );
        },
        {
          en: /Open output folder/,
          fr: /Ouvrir le dossier de résultats/,
          pt: /Abra a pasta de saída/,
        },
      );

      expect(screen.queryByTestId("donwload-output-zip")).toBeNull();

      expect(screen.queryByTestId("cancelling")).toBeNull();
    });

    test("Cancel Run button calls expected method on piranha API", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        initialized: true,
        log: ["log entry 1 ", "log entry 2"],
        running: true,
      });
      render(RunProgress);

      const cancelButton = screen.getByRole("button");
      await user.click(cancelButton);
      expect(piranhaAPI.cancelRun).toHaveBeenCalled();
    });

    test("Open report button calls expected method on piranha API", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        initialized: true,
        running: false,
        runSucceeded: true,
      });
      render(RunProgress);

      const button = screen.getByTestId("open-report");
      await user.click(button);
      expect(piranhaAPI.openRunReport).toHaveBeenCalled();
      expect(piranhaAPI.openRunOutputFolder).not.toHaveBeenCalled();
    });

    test("Open output folder calls expected method on piranhaAPI", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        initialized: true,
        running: false,
        runSucceeded: true,
      });
      render(RunProgress);
      const button = screen.getByTestId("open-output-folder");
      await user.click(button);
      expect(piranhaAPI.openRunReport).not.toHaveBeenCalled();
      expect(piranhaAPI.openRunOutputFolder).toHaveBeenCalled();
    });

    test("see x when running is complete with error", async () => {
      await mockPiranhaAPI({
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

    test("see cancelling text and spinner while piranha is being cancelled", async () => {
      await mockPiranhaAPI({
        initialized: true,
        running: true,
        cancelling: true,
      });
      renderInI18nTestContext(RunProgress);
      expect(screen.getByTestId("cancelling-spinner")).toBeVisible();
      expect(screen.queryByRole("button")).toBeNull();
      await expectTranslations(
        (text) => {
          expect(screen.getByTestId("cancelling")).toHaveTextContent(text);
        },
        {
          en: /Cancelling/,
          fr: /Annulation en cours/,
          pt: /Cancelando/,
        },
      );
    });

    test("new run clears log", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        initialized: true,
        log: ["log entry 1 ", "log entry 2"],
        running: false,
      });
      await testNewRunClearsLog(piranhaAPI);
    });

    test("updating log triggers scroll to end", async () => {
      // Use fake timers only in this test where we need them, as otherwise they cause userEvent to hang
      vi.useFakeTimers();

      const piranhaAPI = await mockPiranhaAPI({
        initialized: true,
        log: ["log entry 1 ", "log entry 2"],
        running: false,
      });

      const { container } = render(RunProgress);
      const logEl = container.querySelector("code[data-testid='logs']");
      const scrollHeightSpy = vi
        .spyOn(logEl, "scrollHeight", "get")
        .mockImplementation(() => 500);
      let scrollTopToUpdate = 0;
      vi.spyOn(logEl, "scrollTop", "set").mockImplementation(
        (value) => (scrollTopToUpdate = value),
      );

      piranhaAPI.log.push(["more", "log", "content"]);

      // Wait for debounce to trigger update
      await vi.advanceTimersByTimeAsync(300);
      expect(scrollHeightSpy).toHaveBeenCalled();
      expect(scrollTopToUpdate).toBe(500);
    });
  });

  describe("web mode", () => {
    beforeAll(async () => {
      initialiseStore("web");
      settings.outputFolderPath = "/test/output";
      runParameters.samplesFilePath = "/test/input/samples.csv";
      runParameters.minKnowFolderPath = "/test/input/minknow";
    });

    test("renders as expected", async () => {
      await mockPiranhaAPI({
        log: ["log entry 1 ", "log entry 2"],
        running: true,
      });
      renderInI18nTestContext(RunProgress);

      await expectCommonElementsWhileRunning();

      expect(screen.queryByTestId("run-progress-output-folder")).toBeNull();
      // No Cancel button
      expect(screen.queryByRole("button")).toBeNull();

      expect(screen.queryByTestId("download-output-zip")).toBeNull();
    });

    test("see Check and Open Results buttons when running is complete with no error", async () => {
      await mockPiranhaAPI({
        log: ["log entry 1 ", "log entry 2"],
        running: false,
        runSucceeded: true,
      });
      renderInI18nTestContext(RunProgress);
      expect(screen.getByTestId("run-progress-check")).toBeVisible();
      expect(screen.queryByTestId("run-progress-x")).toBeNull();
      expect(screen.queryByTestId("run-progress-spinner")).toBeNull();

      await expectTranslations(
        (text) => {
          expect(screen.getByTestId("download-output-zip")).toHaveTextContent(
            text,
          );
        },
        {
          en: /Download output zip/,
          fr: /Télécharger le fichier ZIP de sortie/,
          pt: /Baixar arquivo ZIP de saída/,
        },
      );

      expect(screen.queryByTestId("open-output-folder")).toBeNull();
      expect(screen.queryByTestId("open-report")).toBeNull();

      expect(screen.queryByTestId("cancelling")).toBeNull();
    });

    test("new run clears log", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        log: ["log entry 1 ", "log entry 2"],
        running: false,
      });
      await testNewRunClearsLog(piranhaAPI);
    });

    test("downloas output zip button calls expected method on piranha API", async () => {
      const piranhaAPI = await mockPiranhaAPI({
        running: false,
        runSucceeded: true,
      });
      render(RunProgress);

      const button = screen.getByTestId("download-output-zip");
      await user.click(button);
      expect(piranhaAPI.downloadOutputZip).toHaveBeenCalled();
    });
  });
});
