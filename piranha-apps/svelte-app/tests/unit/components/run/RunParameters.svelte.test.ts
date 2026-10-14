import { describe, expect, test, beforeEach, beforeAll, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/svelte";
import RunRelatedComponentInTestContext from "./RunRelatedComponentInTestContext.svelte";
import {clearSettings, expectTranslations, mockChangeEventOnHTMLInputClick, renderInI18nTestContext } from "../../utils";
import { mockPiranhaAPI } from "../../MockPiranhaAPI.svelte";
import { screen } from "@testing-library/svelte";
import { i18n } from "$lib/i18n.svelte";
import {
  defaultRunParameters,
  runParameters,
  settings,
  appState,
  defaultPiranhaOutputSettingsElectron,
  defaultPiranhaOutputSettingsWeb,
  initialiseStore,
  isWeb
} from "../../../../src/lib/store.svelte.js";
import { PiranhaProtocol } from "../../../../src/types";

describe("RunParameters", () => {
  const user = userEvent.setup();

  let piranhaAPI;

   const initialiseParameters = () => {
    i18n.lang = "en";
    // reset runParameters in store
    const defaultValues = defaultRunParameters();
    // set user and run settings - they are tested elsewhere
    settings.userName = "Test User";
    settings.institute = "Test Institute";
    settings.positiveControl = "pos";
    settings.negativeControl = "neg";

    if (!isWeb()) {
      settings.outputFolderPath = "/test/output";
    }

    Object.keys(defaultValues).forEach((key) => {
      runParameters[key] = defaultValues[key];
    });
  };

   const testRendersAsExpected = async () => {
     renderInI18nTestContext(RunRelatedComponentInTestContext, {
       props: { componentName: "RunParameters" },
     });
     await expectTranslations(
       (text) =>
         expect(screen.getByLabelText(text)).toHaveAttribute("id", "name-field"),
       {
         en: "Name",
         fr: "Nom",
         pt: "Nome",
       },
     );
     await expectTranslations(
       (text) =>
         expect(screen.getByLabelText(text)).toHaveAttribute(
           "id",
           "barcodes-file-field",
         ),
       {
         en: /Barcodes file/,
         fr: /Fichier de codes-barres/,
         pt: /Ficheiro de códigos de barras/,
       },
     );
     await expectTranslations(
       (text) =>
         expect(screen.getByLabelText(text)).toHaveAttribute(
           "id",
           "minknow-folder-field",
         ),
       {
         en: /MinKnow folder/,
         fr: /Dossier MinKnow/,
         pt: /Pasta MinKnow/,
       },
     );
     await expectTranslations(
       (text) =>
         expect(screen.getByLabelText(text)).toHaveAttribute(
           "id",
           "notes-field",
         ),
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
         fr: /Lancer/,
         pt: /Corra/,
       },
     );

     await expectTranslations(
       (text) => expect(screen.getByTestId("settings")).toHaveTextContent(text),
       {
         en: /Settings/,
         fr: /Paramètres/,
         pt: /Configurações/,
       },
     );
   };

   const testValidationWhenInvalid = async () => {
     render(RunRelatedComponentInTestContext, {
       props: { componentName: "RunParameters" },
     });
     const expectNoErrors = (): void =>
       expect(screen.queryByText(/Required value/)).toBeNull();

     await expectNoErrors();

     // Fill in one value and blur - should see no error message for others
     await user.type(screen.getByLabelText("Name"), "test name for errors");
     await expectNoErrors();

     // Press Run button - should see errors
     await user.click(screen.getByTestId("run"));
     expect(screen.getAllByText(/Required value/).length).toBe(3);
     expect(piranhaAPI.runPiranha).not.toHaveBeenCalled();
   };

   beforeEach(() => {
     appState.doneInitialSubmit = false;
   });

   describe("electron mode", () => {
    beforeAll(async () => {
      clearSettings();
      initialiseStore("electron");
      piranhaAPI =  await mockPiranhaAPI({});
    });

    beforeEach(async () => {
      initialiseParameters();
    });

    test("renders as expected", async () => {
      await testRendersAsExpected();
    });

    test("does not validate before Run button pressed, and does not submit Run if form is not valid", async () => {
      await testValidationWhenInvalid();
    });

    test("submits run if form is validly completed", async () => {
      const mockShowFileDialog = vi.fn().mockImplementation((options) => {
        if (options.title == "Barcodes file") {
          return "/test/barcodes.csv";
        }
        if (options.title == "MinKnow folder") {
          return "/test/MinKnow";
        }
        throw new Error("unexpected title");
      });
      window.api = {
        showFileDialog: mockShowFileDialog,
      };

      render(RunRelatedComponentInTestContext, {
        props: { componentName: "RunParameters" },
      });
      await user.type(screen.getByLabelText("Name"), "test name");
      await user.click(screen.getByLabelText("Barcodes file"));
      await user.click(screen.getByLabelText("MinKnow folder"));
      await user.type(screen.getByLabelText("Notes"), "test notes");
      await user.click(screen.getByTestId("run"));
      expect(piranhaAPI.runPiranha).toHaveBeenCalledOnce();
      expect(piranhaAPI.runPiranha).toHaveBeenCalledWith({
        runName: "test name",
        notes: "test notes",
        barcodesFilePath: "/test/barcodes.csv",
        minKnowFolderPath: "/test/MinKnow",
        threads: 10,
        protocol: PiranhaProtocol.Stool,
        positiveControl: "pos",
        negativeControl: "neg",
        userName: "Test User",
        institute: "Test Institute",
        outputFolderPath: "/test/output",
        lang: "en",
        ...defaultPiranhaOutputSettingsElectron,
      });
    });

    test("gets run parameters from store", () => {
      runParameters.runName = "store name";
      runParameters.notes = "store notes";
      runParameters.barcodesFilePath = "/store/barcodes.csv";
      runParameters.minKnowFolderPath = "/store/MinKnow";
      runParameters.threads = 11;
      render(RunRelatedComponentInTestContext, {
        props: { componentName: "RunParameters" },
      });
      expect(screen.getByLabelText("Name").value).toBe("store name");
      expect(screen.getByTestId("barcodes-file-field-value")).toHaveTextContent(
        "/store/barcodes.csv",
      );
      expect(screen.getByTestId("minknow-folder-field-value")).toHaveTextContent(
        "/store/MinKnow",
      );
      expect(screen.getByLabelText("Notes").value).toBe("store notes");
      expect(screen.getByLabelText("Analysis threads").value).toBe("11");
    });

    test("Shows error if analysis threads value is too low, too high or not an integer", async () => {
      render(RunRelatedComponentInTestContext, {
        props: { componentName: "RunParameters" },
      });
      await user.click(screen.getByTestId("run")); // Do initial run click to trigger auto validation on value change

      const threadsInput = screen.getByLabelText("Analysis threads");
      await user.clear(threadsInput);
      await user.type(threadsInput, "-1");
      expect(screen.getByTestId("threads-field-error")).toHaveTextContent(
        /Value must be between 1 and 20/,
      );

      await user.clear(threadsInput);
      await user.type(threadsInput, "5.5");
      expect(screen.getByTestId("threads-field-error")).toHaveTextContent(
        /Value must be a whole number/,
      );

      await user.clear(threadsInput);
      await user.type(threadsInput, "21");
      expect(screen.getByTestId("threads-field-error")).toHaveTextContent(
        /Value must be between 1 and 20/,
      );
    });

    test("validates on load if initial submit has been done", async () => {
      runParameters.threads = 21;
      appState.doneInitialSubmit = true;
      render(RunRelatedComponentInTestContext, {
        props: { componentName: "RunParameters" },
      });
      expect(screen.getByTestId("threads-field-error")).toHaveTextContent(
        /Value must be between 1 and 20/,
      );
    });
  });

   describe("web mode", () => {
    beforeAll(async () => {
      clearSettings();
      initialiseStore("web");
      piranhaAPI =  await mockPiranhaAPI({});
    });

    beforeEach(async () => {
      initialiseParameters();
    });

    test("renders as expected", async () => {
      await testRendersAsExpected();
    });

    test("does not validate before Run button pressed, and does not submit Run if form is not valid", async () => {
      await testValidationWhenInvalid();
    });

    test("submits run if form is validly completed", async () => {
      render(RunRelatedComponentInTestContext, {
        props: { componentName: "RunParameters" },
      });

      // Set up the FileSelect values
      const barcodesInput = screen.getByTestId("file-input-Barcodes file");
      const barcodesFile = new File(["test content"], "barcodes.csv", { type: "text/plain" });
      mockChangeEventOnHTMLInputClick(barcodesInput, [barcodesFile]);

      const miknowFolderInput = screen.getByTestId("folder-input-MinKnow folder");
      const minknowFileList = [
        new File(["test content"], "file1.fastq", { type: "text/plain" }),
        new File(["more test content"], "file2.fastq", { type: "text/plain" })
      ];
      minknowFileList.forEach((f) => {
        Object.defineProperty(f, "webkitRelativePath", {
          writable: false,
          value: `testFolder/${f.name}`
        });
      });
      mockChangeEventOnHTMLInputClick(miknowFolderInput, minknowFileList)

      await user.type(screen.getByLabelText("Name"), "test name");
      await user.click(screen.getByLabelText("Barcodes file"));
      await user.click(screen.getByLabelText("MinKnow folder"));
      await user.type(screen.getByLabelText("Notes"), "test notes");
      await user.click(screen.getByTestId("run"));


      expect(piranhaAPI.runPiranha).toHaveBeenCalledOnce();
      const expectedOptions = {
        runName: "test name",
        notes: "test notes",
        threads: 10,
        protocol: PiranhaProtocol.Stool,
        positiveControl: "pos",
        negativeControl: "neg",
        userName: "Test User",
        institute: "Test Institute",
        lang: "en",
        ...defaultPiranhaOutputSettingsWeb,
      };
      expect(piranhaAPI.runPiranha).toHaveBeenCalledWith(expectedOptions, barcodesFile, minknowFileList);
    });
  });
});
