import { describe, expect, test, beforeEach, vi } from "vitest";
import Settings from "../../../../../src/renderer/src/components/run/Settings.svelte";
import { screen, render } from "@testing-library/svelte";
import {PiranhaOrientation, PiranhaProtocol, PiranhaSettings} from "../../../../../src/renderer/src/types";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import {settings} from "../../../../../src/renderer/src/lib/store.svelte";
import {expectTranslations, mockPersistentSettingsStore, renderInI18nTestContext, ERROR_CLASS, expectNoErrors} from "../../../utils";
import {persistentSettingsStore} from "../../../../../src/renderer/src/lib/persistentSettingsStore";
import {i18n} from "*.svelte";

describe("Settings", () => {
  const defaultSettings: PiranhaSettings = {
    // userSettings
    userName: "testUser",
    institute: "testInst",
    outputFolderPath: "/test",
    //runSettings
    protocol: PiranhaProtocol.Stool,
    positiveControl: "pos",
    negativeControl: "neg",
    //piranhaOutputSettings:
    orientation: PiranhaOrientation.Horizontal,
    outputPrefix: "op",
    overwriteOutput: false,
    outputIntermediateFiles: false,
    allMetadataToHeader: true,
    dateStamp: true
  };

  const user = userEvent.setup();
  beforeEach(() => {
    i18n.lang = "en";
    Object.keys(defaultSettings).forEach((key) => {
      settings[key] = settings[key];
    });
  });

  type SectionName = "runSettings" | "userSettings" | "piranhaOutputSettings";

  const expectOpenSections = async (expectedSections: SectionName[]) => {
    await expectTranslations((text) => expect(screen.getByTestId("settings")).toHaveTextContent(text),
      { en: /Settings/, fr: /Paramètres/, pt: /Configurações/},
    );
    // If no sections, don't expect to see the section headings
    if (!expectedSections.length) {
      expect(screen.queryByTestId("runSettings")).toBeNull();
      expect(screen.queryByTestId("userSettings")).toBeNull();
      expect(screen.queryByTestId("piranhaOutputSettings")).toBeNull();
    } else {
      // else, expect to see all section headings
      const runSettings = screen.getByTestId("runSettings");
      const userSettings = screen.getByTestId("userSettings");
      const piranhaOutputSettings = screen.getByTestId("piranhaOutputSettings");
      await expectTranslations((text) => expect(runSettings).toHaveTextContent(text),
        { en: /Run Settings/, fr: /Paramètres d'exécution/, pt: /Configurações de execução/},
      );
      await expectTranslations((text) => expect(userSettings).toHaveTextContent(text),
        { en: /User Settings/, fr: /Options utilisateur/, pt: /Opções do utilizador/},
      );
      await expectTranslations((text) => expect(piranhaOutputSettings).toHaveTextContent(text),
        { en: /Piranha Output Settings/, fr: /Options de Sortie Piranha/, pt: /Configurações de Saída do Piranha/},
      );

      //. Check for a single expected field in each section (or not, if not expected to be open)
      const expectFieldInSection = async (section, sectionEl, translations) => {
        await expectTranslations((text) => {
          if (expectedSections.includes(section)){
            expect(sectionEl).toHaveTextContent(text);
          } else {
            expect(sectionEl).not.toHaveTextContent(text)
          }
        });
      };
      await expectFieldInSection("runSettings", runSettings, {en: "Protocol", fr: "Protocole", pt: "Protocolo"});
      await expectFieldInSection("userSettings", userSettings, {en: "Institute", fr: "Institut", pt: "Instituto"});
      await expectFieldInSection("piranhaOutputSettings", piranhaOutputSettings, {en: "Overwrite output", fr: "Écraser la sortie", pt: "Esmague a saída"});
    }
  };

  interface ExpectedError {
    fieldName: string;
    fieldLabel: string;
    errorText: string;
  }

  const expectErrorsDisplayed = (expectedErrors: Record<SectionName, ExpectedError[]>) => {
    ["runSettings", "userSettings", "piranhaOutputSettings"].forEach((section) => {
      const sectionEl = screen.getByTestId(section);
      const foundErrorEls = [];
      const allErrors = section.querySelector(`.${ERROR_CLASS}`);
      if (Object.keys(expectedErrors).includes(section)) {

        for (const error of expectedErrors[section]) {
          // Expect that for each expected field name in error, you'll find a label which has the error class
``        const label = sectionEl.getByTestId(`${error.fieldName}-label`);
          expect(label).toHaveTextContent(error.fieldLabel);
          expect(label.classList).toContain(ERROR_CLASS);
          foundErrorEls.push(label);s

          //..and the error text in an element which also has the error class
          const errorMsg = sectionEl.getByTestId(`${error.fieldName}-error`);
          expect(errorMsg).toHaveTextContent(error.errorText);
          expect(errorMsg.classList).toContain(ERROR_CLASS);
          foundErrorEls.push(errorMsg);
        }

        //..and that there are no other elements in error in the section
        expect(allErrors).toCheckConsistOf(foundErrorEls);

      } else {
        // Expect no elements with the error class in the section
        expect(allErrors.length).toBe(0);
      }
    });
  };

  test("renders as expected when run settings have been initialised and there are no errors", async () => {
    mockPersistentSettingsStore({runSettings: defaultSettings});
    renderInI18nTestContext(Settings, {props: { errors: {} }});
    // no accordion sections open
    await expectOpenSections([]);
  });

  test("renders as expected when run settings have not been initialised and there are no errors", async () => {
    mockPersistentSettingsStore({});
    const {container} = renderInI18nTestContext(Settings, {props: { errors: {} }});
    // runSettings section should be open, with no errors displayed
    await expectOpenSections(["runSettings"]);
    expectNoErrors(container);
  });

  test("renders expected settings values", () => {
    mockPersistentSettingsStore({});
    render(Settings, {props: { errors: {} }});

    // Open Settings accordion item
    user.click(screen.getByTestId("settings"));

    // Open User Settings accordion item
    user.click(screen.getByTestId("userSettings"));
    expect(screen.getByLabelText("User name").value).toBe("testUser");
    expect(screen.getByLabelText("Institute").value).toBe("testInst");
    expect(screen.getByTestId("output-folder-field-value")).toHaveTextContent("/test");

    // Open Run Settings accordion item
    user.click(screen.getByTestId("runSettings"));
    expect(screen.getByLabelText("Protocol").value).toBe("stool");
    expect(screen.getByLabelText("Positive control").value).toBe("pos");
    expect(screen.getByLabelText("Negative control").value).toBe("neg");

    // Open Piranha Output Settings accordion item
    user.click(screen.getByTestId("piranhaOutputSettings"));
    expect(screen.getByLabelText("Orientation").value).toBe("horizontal");
    expect(screen.getByLabelText("Output prefix").value).toBe("op");
    expect(screen.getByLabelText("Overwrite output")).toHaveAttribute("data-state", "unchecked");
    expect(screen.getByLabelText("Output intermediate files")).toHaveAttribute("data-state", "unchecked");
    expect(screen.getByLabelText("All metadata to header")).toHaveAttribute("data-state", "checked");
    expect(screen.getByLabelText("Date stamp")).toHaveAttribute("data-state", "checked");
  });

  test("renders as expected when there are errors in settings", async () => {
    // any sections with errors should be opened - runSettings and userSettings
    const errors = {
      institute: ["Institute error"],
      positiveControl: ["Positive control error"],
      negativeControl: ["Negative control error"]
    };
    mockPersistentSettingsStore({runSettings: defaultSettings});
    const {rerender, container} = renderInI18nTestContext(Settings, {props: { errors }});

    await expectOpenSections(["runSettings", "userSettings"]);

    const expectedErrors = {
      userSettings: [{fieldName: "Institute", errorText: "Institute error"}],
      runSettings: [{fieldName: "Positive control", errorText: "Positive control error"},
                    {fieldName: "Negative control", errorText: "Negative control error"}]
    };
    expectErrorsDisplayed(expectedErrors);

    // should update to open new error sections when errors update with new sections -
    // add piranhaOutput setting error - all sections should be open
    errors["outputPrefix"] = ["Output prefix error"];
    rerender({errors});
    await expectOpenSections(["runSettings", "userSettings", "piranhaOutputSettings"]);
    expectedErrors["piranhaOutputSettings"] = [{fieldName: "Output prefix", errorText: "Output prefix error"}];
    expectErrorsDisplayed(expectedErrors);

    // correct all errors - should *not* auto-close
    rerender({errors: {}});
    await expectOpenSections(["runSettings", "userSettings", "piranhaOutputSettings"]);
    expectNoErrors(container);
  });

  test("handles updates to run settings by saving settings and calling onchange", () => {
    mockPersistentSettingsStore({runSettings: defaultSettings});
    const onchange = vi.fn();
    render(Settings, {props: { errors: {}, onchange }});

    // Open Settings accordion item
    user.click(screen.getByTestId("settings"));
    // Open User Settings accordion item
    user.click(screen.getByTestId("runSettings"));

    // protocol
    const protocolSelect = screen.getByLabelText("Protocol");
    user.selectOptions(protocolSelect, ["isolate"]);
    expect(onchange).toHaveBeenCalledTimes(1);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "pos",
      negativeControl: "neg",
    });

    // positiveControl
    const posControlInput = screen.getByLabelText("Positive control");
    user.type(posControlInput, "new pos");
    expect(onchange).toHaveBeenCalledTimes(2);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "new pos",
      negativeControl: "neg",
    });

    // negativeControl
    const negControlInput = screen.getByLabelText("Negative control");
    user.type(negControlInput, "new neg");
    expect(onchange).toHaveBeenCalledTimes(3);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "new pos",
      negativeControl: "new neg",
    });

    // Test settings have been updated
    expect(settings.protocol).toBe(PiranhaProtocol.Isolate);
    expect(settings.positiveControl).toBe("new pos");
    expect(settings.negativeControl).toBe("new neg");
  });

  test("handles updates to piranha output settings by calling onchange", () => {
    mockPersistentSettingsStore({runSettings: defaultSettings});
    const onchange = vi.fn();
    render(Settings, {props: { errors: {}, onchange }});

    // Open Settings accordion item
    user.click(screen.getByTestId("settings"));
    // Open Piranha Output Settings accordion item
    user.click(screen.getByTestId("piranhaOutputSettings"));

    user.selectOptions(screen.getByLabelText("Orientation"), ["vertical"]);
    expect(onchange).toHaveBeenCalledTimes(1);

    user.type(screen.getByLabelText("Output prefix"), "new op");
    expect(onchange).toHaveBeenCalledTimes(2);

    user.click(screen.getByLabelText("Overwrite output"));
    expect(onchange).toHaveBeenCalledTimes(3);

    user.click(screen.getByLabelText("Output intermediate files"));
    expect(onchange).toHaveBeenCalledTimes(4);

    user.click(screen.getByLabelText("All metadata to header"));
    expect(onchange).toHaveBeenCalledTimes(5);

    user.click(screen.getByLabelText("Date stamp"));
    expect(onchange).toHaveBeenCalledTimes(6);

    // Test settings have been updated
    expect(settings.orientation).toBe(PiranhaProtocol.Vertical);
    expect(settings.outputPrefix).toBe("new op");
    expect(settings.overwriteOutput).toBe(true);
    expect(settings.outputIntermediateFiles).toBe(true);
    expect(settings.allMetadataToHeader).toBe(false);
    expect(settings.dateStamp).toBe(false);
  });
});
