import { describe, expect, test, beforeEach } from "vitest";
import {
  expectTranslations,
  mockPiranhaAPI,
  renderInI18nTestContext,
} from "../../../utils";
import { screen } from "@testing-library/svelte";
import RunProgress from "../../../../src/components/run/RunProgress.svelte";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import { settings, runParameters } from "$lib/store.svelte";

describe("RunProgress", () => {
  beforeEach(() => {
    settings.outputFolderPath = "/test/output"
    runParameters.name = "Test Run";
    runParameters.barcodesFilePath = "/test/input/barcodes.csv";
    runParameters.minKnowFolderPath = "/test/input/minknow";
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
        expect(screen.getByText(`${text}: /test/input/barcodes.csv`)).toBeVisible()
      }, {
        en: "Barcodes file",
        fr: "Fichier de codes-barres",
        pt: "Ficheiro de códigos de barras"
      }
    );

    expect(screen.getByTestId("logs")).toHaveTextContent(
      /log entry 1 log entry 2/,
    );

    //No New Run button before run completes
    expect(screen.queryByRole("button")).toBeNull();

    // Can see spinner and not complete icons before run completes
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
    expect(piranhaAPI.clearLog).toHaveBeenCalled();
  });
});
