import { describe, expect, test, vi, beforeEach } from "vitest";
import {expectTranslations, mockPiranhaAPI, renderInI18nTestContext} from "../../utils";
import Run from "../../../../src/renderer/src/components/run/Run.svelte";
import {screen} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {piranhaAPI} from "../../../../src/renderer/src/lib/piranhaAPI.svelte";

describe("Run", () => {
  let user;
  beforeEach(() => {
    mockPiranhaAPI({initialized: true, log: ["log entry 1 ", "log entry 2"]});
    renderInI18nTestContext(Run);
    user = userEvent.setup();
  });

  test("renders as expected", async () => {
    await expectTranslations((text) => expect(screen.getByTestId("run")).toHaveTextContent(text), {
      en: /Run Piranha/,
      fr: /Courez Piranha/,
      pt: /Corra Piranha/
    });

    expect(screen.getByTestId("logs")).toHaveTextContent(/log entry 1 log entry 2/);
  });

  test("calls runPiranha on api", async () => {
    const runButton = screen.getByTestId("run");
    await userEvent.click(runButton);
    expect(piranhaAPI.runPiranha).toHaveBeenCalled();
  });

  test("calls testMessageMain on api", async () => {
    const msgButton = screen.getByTestId("test-msg");
    await userEvent.click(msgButton);
    expect(piranhaAPI.testMessageMain).toHaveBeenCalled();
  });
});
