import { describe, expect, test } from "vitest";
import {
  expectTranslations,
  mockPiranhaAPI,
  renderInI18nTestContext,
} from "../../../utils";
import Run from "../../../../../src/renderer/src/components/run/Run.svelte";
import { screen, render } from "@testing-library/svelte";

describe("Run", () => {
  test("renders as expected when piranha has not started running", async () => {
    mockPiranhaAPI({ running: false });
    renderInI18nTestContext(Run);
    await expectTranslations(
      (text) => expect(screen.getByTestId("run")).toHaveTextContent(text),
      {
        en: /Run Piranha/,
        fr: /Courez Piranha/,
        pt: /Corra Piranha/,
      },
    );

    expect(screen.queryByTestId("logs")).toBeNull();
  });

  test("render as expected when piranha has started running", async () => {
    mockPiranhaAPI({ running: true, log: ["log entry 1", "log entry 2"] });
    render(Run);
    expect(screen.getByTestId("logs")).toHaveTextContent(
      /log entry 1log entry 2/,
    );
    expect(screen.queryByTestId("run")).toBeNull();
  });
});
