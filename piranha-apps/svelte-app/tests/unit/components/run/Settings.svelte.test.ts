import { describe, expect, test, beforeEach, vi } from "vitest";
import Settings from "../../../../src/components/run/Settings.svelte";
import { screen, render, within, fireEvent } from "@testing-library/svelte";
import {
  PiranhaOrientation,
  PiranhaProtocol,
  PiranhaSettings,
} from "../../../../src/types";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { settings } from "../../../../src/lib/store.svelte.js";
import {
  expectTranslations,
  mockPersistentSettingsStore,
  renderInI18nTestContext,
  ERROR_CLASS,
  expectNoErrors,
} from "../../../utils";
import { persistentSettingsStore } from "../../../../src/lib/persistentSettingsStore";
import { i18n } from "$lib/i18n.svelte";

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
    dateStamp: true,
  };

  const user = userEvent.setup();
  beforeEach(() => {
    i18n.lang = "en";
    Object.keys(defaultSettings).forEach((key) => {
      settings[key] = defaultSettings[key];
    });
  });

  type SectionName = "runSettings" | "userSettings" | "piranhaOutputSettings";

  const expectOpenSections = async (
    expectedSections: SectionName[],
  ): Promise<void> => {
    await expectTranslations(
      (text) => expect(screen.getByTestId("settings")).toHaveTextContent(text),
      { en: /Settings/, fr: /Paramètres/, pt: /Configurações/ },
    );
    // If no sections, don't expect to see the section headings
    const runSettings = (): HTMLElement => screen.getByTestId("runSettings");
    const userSettings = (): HTMLElement => screen.getByTestId("userSettings");
    const piranhaOutputSettings = (): HTMLElement =>
      screen.getByTestId("piranhaOutputSettings");

    if (!expectedSections.length) {
      expect(runSettings()).not.toBeVisible();
      expect(userSettings()).not.toBeVisible();
      expect(piranhaOutputSettings()).not.toBeVisible();
    } else {
      // else, expect to see all section headings
      expect(runSettings()).toBeVisible();
      expect(userSettings()).toBeVisible();
      expect(piranhaOutputSettings()).toBeVisible();

      await expectTranslations(
        (text) => expect(runSettings()).toHaveTextContent(text),
        {
          en: /Run Settings/,
          fr: /Paramètres d'exécution/,
          pt: /Configurações de execução/,
        },
      );
      await expectTranslations(
        (text) => expect(userSettings()).toHaveTextContent(text),
        {
          en: /User Settings/,
          fr: /Options utilisateur/,
          pt: /Opções do utilizador/,
        },
      );
      await expectTranslations(
        (text) => expect(piranhaOutputSettings()).toHaveTextContent(text),
        {
          en: /Piranha Output Settings/,
          fr: /Options de Sortie Piranha/,
          pt: /Configurações de Saída do Piranha/,
        },
      );

      // Check for a single expected field in each section (or not, if not expected to be open)
      const expectFieldInSection = async (
        section,
        sectionFn,
        translations,
      ): void => {
        await expectTranslations((text) => {
          if (expectedSections.includes(section)) {
            expect(within(sectionFn()).getByText(text)).toBeVisible();
          } else {
            expect(within(sectionFn()).getByText(text)).not.toBeVisible();
          }
        }, translations);
      };
      await expectFieldInSection("runSettings", runSettings, {
        en: "Protocol",
        fr: "Protocole",
        pt: "Protocolo",
      });
      await expectFieldInSection("userSettings", userSettings, {
        en: "Institute",
        fr: "Institut",
        pt: "Instituto",
      });
      await expectFieldInSection(
        "piranhaOutputSettings",
        piranhaOutputSettings,
        {
          en: "Overwrite output",
          fr: "Écraser la sortie",
          pt: "Esmague a saída",
        },
      );
    }
  };

  interface ExpectedError {
    fieldName: string;
    fieldLabel: string;
    errorText: string;
  }

  const expectErrorsDisplayed = (
    expectedErrors: Record<SectionName, ExpectedError[]>,
  ): void => {
    ["runSettings", "userSettings", "piranhaOutputSettings"].forEach(
      (section) => {
        const sectionEl = screen.getByTestId(section);
        const foundErrorEls = [];
        const allErrors = sectionEl.querySelectorAll(`.${ERROR_CLASS}`);
        if (Object.keys(expectedErrors).includes(section)) {
          for (const error of expectedErrors[section]) {
            // Expect that for each expected field name in error, you'll find a label which has the error class
            const label = within(sectionEl).getByTestId(
              `${error.fieldName}-label`,
            );
            expect(label).toHaveTextContent(error.fieldLabel);
            expect(label.classList).toContain(ERROR_CLASS);
            foundErrorEls.push(label);

            //..and the error text in an element which also has the error class
            const errorMsg = within(sectionEl).getByTestId(
              `${error.fieldName}-error`,
            );
            expect(errorMsg).toHaveTextContent(error.errorText);
            expect(errorMsg.classList).toContain(ERROR_CLASS);
            foundErrorEls.push(errorMsg);
          }

          //..and that there are no other elements in error in the section
          expect(allErrors.length).toBe(foundErrorEls.length);
        } else {
          // Expect no elements with the error class in the section
          expect(allErrors.length).toBe(0);
        }
      },
    );
  };

  test("renders as expected when run settings have been initialised and there are no errors", async () => {
    mockPersistentSettingsStore({ runSettings: defaultSettings });
    renderInI18nTestContext(Settings, { props: { errors: {} } });
    // no accordion sections open
    await expectOpenSections([]);
  });

  test("renders as expected when run settings have not been initialised and there are no errors", async () => {
    mockPersistentSettingsStore({});
    const { container } = renderInI18nTestContext(Settings, {
      props: { errors: {} },
    });
    // runSettings section should be open, with no errors displayed
    await expectOpenSections(["runSettings"]);
    expectNoErrors(container);
  });

  test("renders expected settings values", async () => {
    mockPersistentSettingsStore({});
    const { container } = render(Settings, { props: { errors: {} } });

    // Open Settings accordion item
    await user.click(screen.getByTestId("settings"));

    // Open User Settings accordion item
    await user.click(screen.getByTestId("userSettings"));
    expect(screen.getByLabelText("User name").value).toBe("testUser");
    expect(screen.getByLabelText("Institute").value).toBe("testInst");
    expect(screen.getByTestId("output-folder-field-value")).toHaveTextContent(
      "/test",
    );

    // Open Run Settings accordion item
    await user.click(screen.getByTestId("runSettings"));
    expect(container.querySelector("#protocol-field")).toHaveTextContent(
      "stool",
    );
    expect(screen.getByLabelText("Positive control").value).toBe("pos");
    expect(screen.getByLabelText("Negative control").value).toBe("neg");

    // Open Piranha Output Settings accordion item
    await user.click(screen.getByTestId("piranhaOutputSettings"));
    expect(container.querySelector("#orientation-field")).toHaveTextContent(
      "horizontal",
    );
    expect(screen.getByLabelText("Output prefix").value).toBe("op");
    expect(screen.getByLabelText("Overwrite output")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
    expect(screen.getByLabelText("Output intermediate files")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
    expect(screen.getByLabelText("All metadata to header")).toHaveAttribute(
      "data-state",
      "checked",
    );
    expect(screen.getByLabelText("Date stamp")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  const testErrors = (): Record<string, string[]> => ({
    institute: ["Institute error"],
    positiveControl: ["Positive control error"],
    negativeControl: ["Negative control error"],
  });
  test("renders with expected open sections when there are errors in settings", async () => {
    // any sections with errors should be opened - runSettings and userSettings
    mockPersistentSettingsStore({ runSettings: defaultSettings });
    const errors = testErrors();
    const { rerender } = renderInI18nTestContext(Settings, {
      props: { errors },
    });
    await expectOpenSections(["runSettings", "userSettings"]);

    // should update to open new error sections when errors update with new sections -
    // add piranhaOutput setting error - all sections should be open
    errors["outputPrefix"] = ["Output prefix error"];
    rerender({ errors });
    await expectOpenSections([
      "runSettings",
      "userSettings",
      "piranhaOutputSettings",
    ]);

    // correct all errors - should *not* auto-close
    rerender({ errors: {} });
    await expectOpenSections([
      "runSettings",
      "userSettings",
      "piranhaOutputSettings",
    ]);
  });

  test("renders with expected errors when there are errors in settings", async () => {
    const errors = testErrors();
    const expectedErrors = {
      userSettings: [
        {
          fieldName: "institute-field",
          fieldLabel: "Institute",
          errorText: "Institute error",
        },
      ],
      runSettings: [
        {
          fieldName: "positive-control-field",
          fieldLabel: "Positive control",
          errorText: "Positive control error",
        },
        {
          fieldName: "negative-control-field",
          fieldLabel: "Negative control",
          errorText: "Negative control error",
        },
      ],
    };

    const { rerender, container } = render(Settings, { props: { errors } });
    expectErrorsDisplayed(expectedErrors);

    // should update to open new error sections when errors update with new sections -
    // add piranhaOutput setting error - new error should be displayed
    errors["outputPrefix"] = ["Output prefix error"];
    rerender({ errors });
    expectedErrors["piranhaOutputSettings"] = [
      {
        fieldName: "output-prefix-field",
        fieldLabel: "Output prefix",
        errorText: "Output prefix error",
      },
    ];
    expectErrorsDisplayed(expectedErrors);

    // correct all errors
    rerender({ errors: {} });
    expectNoErrors(container);
  });

  test("handles updates to run settings by saving settings and calling onchange", async () => {
    mockPersistentSettingsStore({ runSettings: defaultSettings });
    const onchange = vi.fn();
    const { container } = render(Settings, { props: { errors: {}, onchange } });

    // Open Settings accordion item
    await user.click(screen.getByTestId("settings"));
    // Open User Settings accordion item
    await user.click(screen.getByTestId("runSettings"));

    // protocol
    await user.click(container.querySelector("#protocol-field"));
    expect(container.querySelector("#protocol-field")).toHaveAttribute(
      "data-state",
      "open",
    );
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    await user.keyboard("{Tab}");
    expect(settings.protocol).toBe(PiranhaProtocol.Isolate);
    expect(onchange).toHaveBeenCalledTimes(1);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      ...defaultSettings,
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "pos",
      negativeControl: "neg",
    });

    // positiveControl
    const posControlInput = screen.getByLabelText("Positive control");
    await user.clear(posControlInput);
    await user.type(posControlInput, "new pos");
    expect(onchange).toHaveBeenCalledTimes(9); // get one change per keystroke...
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      ...defaultSettings,
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "new pos",
      negativeControl: "neg",
    });

    // negativeControl
    const negControlInput = screen.getByLabelText("Negative control");
    await user.clear(negControlInput);
    await user.type(negControlInput, "new neg");
    expect(onchange).toHaveBeenCalledTimes(17);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      ...defaultSettings,
      protocol: PiranhaProtocol.Isolate,
      positiveControl: "new pos",
      negativeControl: "new neg",
    });

    // Test settings have been updated
    expect(settings.protocol).toBe(PiranhaProtocol.Isolate);
    expect(settings.positiveControl).toBe("new pos");
    expect(settings.negativeControl).toBe("new neg");
  });

  test("handles updates to piranha output settings by calling onchange", async () => {
    mockPersistentSettingsStore({ runSettings: defaultSettings });
    const onchange = vi.fn();
    const { container } = render(Settings, { props: { errors: {}, onchange } });

    // Open Settings accordion item
    await user.click(screen.getByTestId("settings"));
    // Open Piranha Output Settings accordion item
    await user.click(screen.getByTestId("piranhaOutputSettings"));

    const outputPrefixInput = screen.getByLabelText("Output prefix");
    await user.clear(outputPrefixInput);
    await user.type(outputPrefixInput, "new op");
    expect(onchange).toHaveBeenCalledTimes(7);

    expect(settings.orientation).toBe(PiranhaOrientation.Horizontal);
    await user.click(container.querySelector("#orientation-field"));
    expect(container.querySelector("#orientation-field")).toHaveAttribute(
      "data-state",
      "open",
    );
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Enter}");
    expect(settings.orientation).toBe(PiranhaOrientation.Vertical);
    expect(onchange).toHaveBeenCalledTimes(8);

    // using fireEvent here rather than userEvent, which objects to pointer-events:none on this element
    fireEvent.click(screen.getByLabelText("Overwrite output"));
    expect(onchange).toHaveBeenCalledTimes(9);

    fireEvent.click(screen.getByLabelText("Output intermediate files"));
    expect(onchange).toHaveBeenCalledTimes(10);

    fireEvent.click(screen.getByLabelText("All metadata to header"));
    expect(onchange).toHaveBeenCalledTimes(11);

    fireEvent.click(screen.getByLabelText("Date stamp"));
    expect(onchange).toHaveBeenCalledTimes(12);

    // Test settings have been updated
    expect(settings.orientation).toBe(PiranhaOrientation.Vertical);
    expect(settings.outputPrefix).toBe("new op");
    expect(settings.overwriteOutput).toBe(true);
    expect(settings.outputIntermediateFiles).toBe(true);
    expect(settings.allMetadataToHeader).toBe(false);
    expect(settings.dateStamp).toBe(false);
  });
});
