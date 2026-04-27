import { describe, expect, test, beforeEach, vi} from "vitest";
import userEvent from "@testing-library/user-event";
import {cleanup, render } from "@testing-library/svelte";
import RunParameters from "../../../../../src/renderer/src/components/run/RunParameters.svelte";
import {expectTranslations, renderInI18nTestContext, mockPiranhaAPI} from "../../../utils";
import {screen} from "@testing-library/svelte";
import { i18n } from "$lib/i18n.svelte";
import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import {defaultRunParameters, runParameters, appState} from "../../../../../src/renderer/src/lib/store.svelte"

describe("RunParameters", () => {
  let user = userEvent.setup();
  beforeEach(() => {
    i18n.lang = "en";
    mockPiranhaAPI({});
    // reset runParameters in store
    const defaultValues = defaultRunParameters();
    Object.keys(defaultValues).forEach((key) => {
      runParameters[key] = defaultValues[key];
    });
  });

  test("renders as expected", async () => {
    renderInI18nTestContext(RunParameters);
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text)).toHaveAttribute("id", "name-field"),
      {
        en: /Name/,
        fr: /Nom/,
        pt: /Nome/,
      },
    );
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text)).toHaveAttribute("id", "barcodes-file-field"),
      {
        en: /Barcodes file/,
        fr: /Fichier de codes-barres/,
        pt: /Ficheiro de códigos de barras/,
      },
    );
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text)).toHaveAttribute("id", "minknow-folder-field"),
      {
        en: /MinKnow folder/,
        fr: /Dossier MinKnow/,
        pt: /Pasta MinKnow/,
      },
    );
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text)).toHaveAttribute("id", "notes-field"),
      {
        en: /Notes/,
        fr: /Notes/,
        pt: /Notas/,
      },
    );
    await expectTranslations(
      (text) => {
        const threadsInput = screen.getByLabelText(text);
        expect(threadsInput).toHaveAttribute("id", "threads-field");
        expect(threadsInput.value).toBe("10");
      },
      {
        en: /Analysis threads/,
        fr: /Threads d'analyse/,
        pt: /Fios de execução de análise/,
      },
    );
    await expectTranslations(
      (text) => expect(screen.getByTestId("run")).toHaveTextContent(text),
      {
        en: /Run/,
        fr: /Courez/,
        pt: /Corra/,
      },
    );
  });

  test("does not validate before Run button pressed, and does not submit Run if form is not valid", async () => {
    render(RunParameters);
    const expectNoErrors =  () => expect(screen.queryByText(/Required value/)).toBeNull();

    await expectNoErrors();

    // Fill in one value and blur - should see no error message for others
    await user.type(screen.getByLabelText("Name"), "test name for errors[Tab]");
    await expectNoErrors();

    // Press Run button - should see errors
    await user.click(screen.getByTestId("run"));
    expect(screen.getAllByText(/Required value/).length).toBe(4);
    expect(piranhaAPI.runPiranha).not.toHaveBeenCalled();
  });

  test("submits run if form is validly completed", async () => {
    const mockShowFileDialog = vi.fn().mockImplementation((options) =>  {
      if (options.title == "Barcodes file") {
        return "/test/barcodes.csv"
      }
      if (options.title == "MinKnow folder") {
        return "/test/MinKnow";
      }
      if (options.title == "Output folder") {
        return "/test/output"
      }
      throw new Error("unexpected title")
    });
    window.api = {
      showFileDialog: mockShowFileDialog
    };

    render(RunParameters);
    await user.type(screen.getByLabelText("Name"), "test name");
    await user.click(screen.getByLabelText("Barcodes file"));
    await user.click(screen.getByLabelText("MinKnow folder"));
    await user.click(screen.getByLabelText("Output folder"));
    await user.type(screen.getByLabelText("Notes"), "test notes");
    await user.click(screen.getByTestId("run"));
    expect(piranhaAPI.runPiranha).toHaveBeenCalledWith({
      name: "test name",
      notes: "test notes",
      barcodesFilePath: "/test/barcodes.csv",
      minKnowFolderPath: "/test/MinKnow",
      outputFolderPath: "/test/output",
      threads: 10,
      positiveControl: "Pos1,P2",
      negativeControl: "my negative control"
    });
  });

  test("gets run parameters from store", () => {
    runParameters.name = "store name";
    runParameters.notes = "store notes";
    runParameters.barcodesFilePath = "/store/barcodes.csv";
    runParameters.minKnowFolderPath = "/store/MinKnow";
    runParameters.outputFolderPath = "/store/output";
    runParameters.threads = 11;
    render(RunParameters);
    expect(screen.getByLabelText("Name").value).toBe("store name");
    // This gets the button element, we actually want to check the div which is its sibling
    expect(screen.getByTestId("barcodes-file-field-value")).toHaveTextContent("/store/barcodes.csv");
    expect(screen.getByTestId("minknow-folder-field-value")).toHaveTextContent("/store/MinKnow");
    expect(screen.getByTestId("output-folder-field-value")).toHaveTextContent("/store/output");
    expect(screen.getByLabelText("Notes").value).toBe("store notes");
    expect(screen.getByLabelText("Analysis threads").value).toBe("11");
  });

  test("Shows error if analysis threads value is too low, too high or not an integer", async () => {
    render(RunParameters);
    await user.click(screen.getByTestId("run")); // Do initial run click to trigger auto validation on value change

    const threadsInput = screen.getByLabelText("Analysis threads");
    await user.clear(threadsInput);
    await user.type(threadsInput, "-1[Tab]");
    expect(screen.getByTestId("threads-field-error")).toHaveTextContent(/Value must be between 1 and 20/);

    await user.clear(threadsInput);
    await user.type(threadsInput, "5.5[Tab]");
    expect(screen.getByTestId("threads-field-error")).toHaveTextContent(/Value must be a whole number/);

    await user.clear(threadsInput);
    await user.type(threadsInput, "21[Tab]");
    expect(screen.getByTestId("threads-field-error")).toHaveTextContent(/Value must be between 1 and 20/);
  });

  test("validates on load if initial submit has been done", async () => {
    runParameters.threads = 21;
    appState.doneInitialSubmit = true;
    render(RunParameters);
    expect(screen.getByTestId("threads-field-error")).toHaveTextContent(/Value must be between 1 and 20/);
  });
});
