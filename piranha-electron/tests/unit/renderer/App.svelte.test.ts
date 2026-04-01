import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, beforeEach } from "vitest";
import App from "../../../src/renderer/src/App.svelte";
import { expectTranslations, mockPiranhaAPI} from "../utils";
import { i18n } from "../../../src/renderer/src/lib/i18n.svelte";

// TODO use vitest-browser-svelte (mrc-6911)
describe("App", () => {
  const expectedInitTranslations = {
    en: "Initializing...",
    fr: "Initialisation...",
    pt: "Inicializando..."
  };

  const expectRunPage = async () => {
    await expectTranslations((text) => expect(screen.getByText(text)).toBeVisible(), {
      en: /Run Piranha/,
      fr: /Courez Piranha/,
      pt: /Corra Piranha/
    });
  };

  test("renders as expected before initialized", async () => {
    mockPiranhaAPI({})
    render(App);
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText("PiranhaNET")).toBeVisible();
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      expectedInitTranslations
    );
  });

  test("renders as expected after initialized", async () => {
    mockPiranhaAPI({initialized: true});
    render(App);

    // Expect to see default page (Run) after initialization
    await expectRunPage();

    await expectTranslations(
      (text) => expect(screen.queryByText(text)).toBeNull(),
      expectedInitTranslations
    );
  });

  test("routes to About and Run pages", async () => {
    mockPiranhaAPI({initialized: true});
    render(App);

    // Navigate to About using the Nav menu
    await userEvent.click(screen.getByTestId("nav-about"));
    await waitFor(() => {
      expect(screen.getByText("Placeholder for About page text.")).toBeVisible();
    });

    await userEvent.click(screen.getByTestId("nav-run"));
    await expectRunPage();
  });

  test("displays error", () => {
    mockPiranhaAPI({error: "test error"});
    render(App);
    expect(screen.getByText("Error: test error")).toBeVisible();
  });

  /*test("Stream chunk and end messages are added to log", async () => {
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
  });*/
});
