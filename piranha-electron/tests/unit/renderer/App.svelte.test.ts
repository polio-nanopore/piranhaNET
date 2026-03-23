import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, beforeEach } from "vitest";
import App from "../../../src/renderer/src/App.svelte";
import { mockWindowAPI, expectTranslations } from "../utils";
import { i18n } from "../../../src/renderer/src/lib/i18n.svelte";

// TODO use vitest-browser-svelte (mrc-6911)
describe("App", () => {
  beforeEach(() => {
    mockWindowAPI();
  });

  const expectedInitTranslations = {
    en: "Initializing...",
    fr: "Initialisation...",
    pt: "Inicializando..."
  };

  test("renders as expected before initialized", async () => {
    render(App);
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText("PiranhaNET")).toBeVisible();
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      expectedInitTranslations
    );
  });

  test("renders as expected after initialized", async () => {
    render(App);

    expect(window.api.onInitialized).toHaveBeenCalled();
    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();

    await expectTranslations((text) => expect(screen.getByText(text)).toBeVisible(), {
      en: /Run Piranha/,
      fr: /Courez Piranha/,
      pt: /Corra Piranha/
    });
    await expectTranslations(
      (text) => expect(screen.queryByText(text)).toBeNull(),
      expectedInitTranslations
    );
  });

  test("Stream chunk and end messages are added to log", async () => {
    render(App);

    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();
    await expectTranslations((text) => expect(screen.getByText(text)).toBeVisible(), {
      en: /Run Piranha/
    });
    const log = screen.getByTestId("log");

    expect(window.api.onChunk).toHaveBeenCalled();
    const addChunk = window.api.onChunk.mock.calls[0][0];
    const encoder = new TextEncoder("utf-8");
    addChunk(encoder.encode("test log message"));
    await waitFor(() => expect(log).toHaveTextContent(/test log message/));

    expect(window.api.onEnd).toHaveBeenCalled();
    const end = window.api.onEnd.mock.calls[0][0];
    end();
    await waitFor(() => expect(log).toHaveTextContent("Piranha Run Finished"));
  });

  test("displays error", async () => {
    render(App);
    expect(window.api.onError).toHaveBeenCalled();
    const setError = window.api.onError.mock.calls[0][0];
    setError("test error", "test error detail");
    await waitFor(() => expect(screen.getByText("Error: test error")).toBeVisible());
  });

  test("can change language", async () => {
    i18n.lang = "en";
    render(App);
    expect(screen.getByTestId("welcome")).toHaveTextContent("Welcome to PiranhaNET");
    const select = screen.getByTestId("lang");
    expect(select).toHaveValue("en");

    // change lang to fr
    await userEvent.selectOptions(select, "fr");
    expect(i18n.lang).toBe("fr");
    await waitFor(() =>
      expect(screen.getByTestId("welcome")).toHaveTextContent("Bienvenue à PiranhaNET")
    );
  });
});
