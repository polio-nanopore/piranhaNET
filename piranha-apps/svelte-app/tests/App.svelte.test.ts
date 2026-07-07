import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "../src/App.svelte";
import { expectTranslations, mockPiranhaAPI } from "./utils";

// TODO use vitest-browser-svelte (mrc-6911)
describe("App", () => {
  const expectedInitTranslations = {
    en: "Initializing...",
    fr: "Initialisation...",
    pt: "Inicializando...",
  };

  const expectRunPage = async (): Promise<void> => {
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /Welcome to PiranhaNET/,
        fr: /Bienvenue sur PiranhaNET/,
        pt: /Bem-vindo ao PiranhaNET/,
      },
    );
  };

  test("renders as expected before initialized", async () => {
    mockPiranhaAPI({});
    render(App);
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText("PiranhaNET")).toBeVisible();
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      expectedInitTranslations,
    );
  });

  test("renders as expected after initialized", async () => {
    mockPiranhaAPI({ initialized: true });
    render(App);

    // Expect to see default page (Run) after initialization
    await expectRunPage();

    await expectTranslations(
      (text) => expect(screen.queryByText(text)).toBeNull(),
      expectedInitTranslations,
    );
  });

  test("routes to About and Run pages", async () => {
    mockPiranhaAPI({ initialized: true });
    render(App);

    // Navigate to About using the Nav menu
    await userEvent.click(screen.getByTestId("nav-about"));
    await waitFor(() => {
      expect(
        screen.getByText("Placeholder for About page text."),
      ).toBeVisible();
    });

    await userEvent.click(screen.getByTestId("nav-run"));
    await expectRunPage();
  });
});
