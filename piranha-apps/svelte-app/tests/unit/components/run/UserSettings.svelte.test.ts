import { describe, expect, test, beforeEach, vi } from "vitest";
import UserSettings from "../../../../src/components/run/UserSettings.svelte";
import { settings } from "../../../../src/lib/store.svelte.js";
import { i18n } from "$lib/i18n.svelte";
import {
  expectTranslations,
  mockPersistentSettingsStore,
  renderInI18nTestContext,
  expectErrorFor,
} from "../../../utils";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { render, screen } from "@testing-library/svelte";
import { persistentSettingsStore } from "../../../../src/lib/persistentSettingsStore";

describe("UserSettings", () => {
  beforeEach(() => {
    i18n.lang = "en";
    settings.userName = "Test User";
    settings.institute = "Test Inst";
    settings.outputFolderPath = "/testOut";
  });

  test("renders values as expected", async () => {
    renderInI18nTestContext(UserSettings, { props: { errors: {} } });
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text).value).toBe("Test User"),
      { en: /User name/, fr: /Nom d'utilisateur/, pt: /Nome de utilizador/ },
    );
    await expectTranslations(
      (text) => expect(screen.getByLabelText(text).value).toBe("Test Inst"),
      { en: /Institute/, fr: /Institut/, pt: /Instituto/ },
    );
    expect(screen.getByTestId("output-folder-field-value")).toHaveTextContent(
      "/testOut",
    );
    await expectTranslations(
      (text) => {
        expect(screen.getByLabelText(text)).toHaveAttribute(
          "id",
          "output-folder-field",
        );
      },
      { en: /Output folder/, fr: /Dossier de sortie/, pt: /Pasta de saída/ },
    );
  });

  test("renders errors as expected", () => {
    const errors = {
      userName: ["User name error"],
      institute: ["Institute error"],
      outputFolderPath: ["Output error"],
    };
    renderInI18nTestContext(UserSettings, { props: { errors } });
    expectErrorFor("user-name-field", "User name error");
    expectErrorFor("institute-field", "Institute error");
    expectErrorFor("output-folder-field", "Output error");
  });

  test("handles updates as expected", async () => {
    const onchange = vi.fn();
    const user = userEvent.setup();
    mockPersistentSettingsStore({});

    const mockShowFileDialog = vi.fn().mockImplementation(() => "/newOut");
    window.api = {
      showFileDialog: mockShowFileDialog,
    };

    render(UserSettings, { props: { onchange, errors: {} } });

    const nameField = screen.getByLabelText("User name");
    await user.clear(nameField);
    await user.type(nameField, "New name");
    expect(settings.userName).toBe("New name");
    expect(onchange).toHaveBeenCalledTimes(9);
    expect(persistentSettingsStore.saveUserSettings).toHaveBeenLastCalledWith({
      ...settings,
      userName: "New name",
      institute: "Test Inst",
      outputFolderPath: "/testOut",
    });

    const instField = screen.getByLabelText("Institute");
    await user.clear(instField);
    await user.type(instField, "New Inst");
    expect(settings.institute).toBe("New Inst");
    expect(onchange).toHaveBeenCalledTimes(18);
    expect(persistentSettingsStore.saveUserSettings).toHaveBeenLastCalledWith({
      ...settings,
      userName: "New name",
      institute: "New Inst",
      outputFolderPath: "/testOut",
    });

    await user.click(screen.getByLabelText("Output folder"));
    expect(settings.outputFolderPath).toBe("/newOut");
    expect(onchange).toHaveBeenCalledTimes(19);
    expect(persistentSettingsStore.saveUserSettings).toHaveBeenLastCalledWith({
      ...settings,
      userName: "New name",
      institute: "New Inst",
      outputFolderPath: "/newOut",
    });
  });
});
