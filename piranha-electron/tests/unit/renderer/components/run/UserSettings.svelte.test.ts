import { describe, expect, test, beforeEach, vi } from "vitest";
import UserSettings from "../../../../../src/renderer/src/components/run/UserSettings.svelte";
import {settings} from "../../../../../src/renderer/src/lib/store.svelte";
import { i18n } from "$lib/i18n.svelte";
import {expectTranslations, mockPersistentSettingsStore, renderInI18nTestContext, ERROR_CLASS, expectErrorFor} from "../../../utils";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import {render} from "@testing-library/svelte";
import {persistentSettingsStore} from "../../../../../src/renderer/src/lib/persistentSettingsStore";

describe("UserSettings", () => {
  beforeEach(() => {
    i18n.lang = "en";
    settings.userName = "Test User";
    settings.institute = "Test Inst";
    settings.outputFolderPath = "/testOut";
  });

  test("renders values as expected", async () => {
    renderInI18nTestContext(UserSettings);
    await expectTranslations((text) => expect(screen.getByLabelText(text).value).toBe("Test User"),
      { en: /User name/, fr: /Nom d'utilisateur/, pt: /Nome de utilizador/},
    );
    await expectTranslations((text) => expect(screen.getByLabelText(text).value).toBe("Test Inst"),
      { en: /Institute/, fr: /Institut/, pt: /Instituto/},
    );
    expect(screen.getByTestId("output-folder-field-value").value).toBe("/testOut");
    await expectTranslations((text) => {
        expect(screen.getByLabelText(text)).toHaveAttribute("role", "button");
      },
      { en: /Output folder/, fr: /Dossier de sortie/, pt: /Pasta de saída/}
    );
  });

  test("renders errors as expected", () => {
    const errors = {
      userName: ["User name error"],
      institute: ["Institute error"],
      outputFolderPath: ["Output error"]
    };
    const {container} = renderInI18nTestContext(UserSettings, {props: {errors}});

    expectErrorFor(container, "user-name-field", "User name error");
    expectErrorFor(container, "institute-field", "Institute error");
    expectErrorFor(container, "output-folder-field", "Output error");
  });

  test("handles updates as expected", () => {
    const onchange = vi.fn();
    const user = userEvent.setup();
    mockPersistentSettingsStore({});

    const mockShowFileDialog = vi
      .fn()
      .mockImplementation(() => "/newOut");
    window.api = {
      showFileDialog: mockShowFileDialog,
    };

    render(UserSettings, {props: {onchange}})
    user.type(screen.getByLabel("User name"), "New name");
    expect(settings.userName).toBe("New name");
    expect(onchange).toHaveBeenCalledTime(1);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      userName: "New name",
      institute: "Test Inst",
      outputFolderPath: "/testOut"
    });

    user.type(screen.getByLabel("Institute"), "New Inst");
    expect(settings.institute).toBe("New Inst");
    expect(onchange).toHaveBeenCalledTime(2);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      userName: "New name",
      institute: "New Inst",
      outputFolderPath: "/testOut"
    });

    user.click(screen.getByLabel("Output folder"));
    expect(settings.outputFolderPath).toBe("/newOut");
    expect(onchange).toHaveBeenCalledTime(3);
    expect(persistentSettingsStore.saveRunSettings).toHaveBeenLastCalledWith({
      userName: "New name",
      institute: "New Inst",
      outputFolderPath: "/newOut"
    });
  });
});
