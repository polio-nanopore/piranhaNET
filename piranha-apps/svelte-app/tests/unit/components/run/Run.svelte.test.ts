import { describe, expect, test } from "vitest";
import {
  expectTranslations,
  mockPersistentSettingsStore,
  renderInI18nTestContext,
} from "../../utils";
import RunComponentInTestContext from "./RunComponentInTestContext.svelte";
import { screen, render } from "@testing-library/svelte";
import { mockPiranhaAPI } from "../../MockPiranhaAPI.svelte";

describe("Run", () => {
  const mockSettings = {
    userSettings: {
      userName: "test_user",
      institute: "test_inst",
      outputFolderPath: "./test",
    },
  };

  test("renders as expected when user settings have not been persisted", async () => {
    mockPersistentSettingsStore({ userSettings: null });
    mockPiranhaAPI({ running: false });
    renderInI18nTestContext(RunComponentInTestContext, {
      props: {
        componentName: "Run"
      }
    });
    await expectTranslations(
      (text) => expect(screen.getByTestId("welcome")).toHaveTextContent(text),
      {
        en: /Welcome to PiranhaNET/,
        fr: /Bienvenue sur PiranhaNET/,
        pt: /Bem-vindo ao PiranhaNET/,
      },
    );
    await expectTranslations(
      (text) => expect(screen.getByTestId("continue")).toHaveTextContent(text),
      {
        en: /Continue/,
        fr: /Continuez/,
        pt: /Continue/,
      },
    );
    expect(screen.queryByTestId("run")).toBeNull();
    expect(screen.queryByTestId("logs")).toBeNull();
  });

  test("renders as expected when piranha has not started running", async () => {
    mockPersistentSettingsStore(mockSettings);
    mockPiranhaAPI({ running: false });
    renderInI18nTestContext(RunComponentInTestContext, {
      props: {
        componentName: "Run"
      }
    });
    await expectTranslations(
      (text) => expect(screen.getByTestId("run")).toHaveTextContent(text),
      {
        en: /Run Piranha/,
        fr: /Courez Piranha/,
        pt: /Corra Piranha/,
      },
    );
    expect(screen.queryByTestId("welcome")).toBeNull();
    expect(screen.queryByTestId("logs")).toBeNull();
  });

  test("render as expected when piranha has started running", async () => {
    mockPiranhaAPI({ running: true, log: ["log entry 1", "log entry 2"] });
    render(RunComponentInTestContext, {
      props: {
        componentName: "Run"
      }
    });
    expect(screen.getByTestId("logs")).toHaveTextContent(
      /log entry 1log entry 2/,
    );
    expect(screen.queryByTestId("run")).toBeNull();
  });
});
