import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, beforeAll } from "vitest";
import AppRouter from "../../../src/components/AppRouter.svelte";
import { expectTranslations } from "../utils";
import { mockPiranhaAPI } from "../MockPiranhaAPI.svelte.js";
import { i18n } from "$lib/i18n.svelte";
import { tick } from "svelte";
import { initialiseStore } from "../../../src/lib/store.svelte";

describe("App", () => {
  const expectedInitTranslations = {
    en: "Initializing: downloading Piranha Docker image. Please wait.",
    fr: "Initialisation: téléchargement de l'image Docker Piranha. Veuillez patienter.",
    pt: "Inicializando: a descarregar a imagem Docker do Piranha. Aguarde.",
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

  beforeAll(() => {
    initialiseStore("electron");
  });

  beforeEach(() => {
    i18n.lang = "en";
  });

  const renderSut = (isWeb = false): void => {
    const props = isWeb
      ? { mode: "web", apiUrl: "http://testAPI" }
      : { mode: "electron" };
    render(AppRouter, { props });
  };

  test("renders as expected before initialized", async () => {
    await mockPiranhaAPI({});
    renderSut();
    expect(screen.getByRole("img")).toHaveClass("logo");
    expect(screen.getByText("PiranhaNET")).toBeVisible();
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      expectedInitTranslations,
    );
  });

  test("renders as expected after initialized", async () => {
    await mockPiranhaAPI({ initialized: true });
    renderSut();
    await tick();

    // Expect to see default page (Run) after initialization
    await expectRunPage();

    await expectTranslations(
      (text) => expect(screen.queryByText(text)).toBeNull(),
      expectedInitTranslations,
    );
  });

  test("routes to About and Run pages", async () => {
    await mockPiranhaAPI({ initialized: true });
    renderSut();

    // Navigate to About using the Nav menu
    await userEvent.click(screen.getByTestId("nav-about"));
    await waitFor(() => {
      expect(screen.getByText("About PiranhaNET")).toBeVisible();
    });

    await userEvent.click(screen.getByTestId("nav-run"));
    await expectRunPage();
  });
});
