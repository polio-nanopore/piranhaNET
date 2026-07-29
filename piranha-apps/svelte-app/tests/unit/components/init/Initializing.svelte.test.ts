import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/svelte";
import { mockPiranhaAPI } from "../../MockPiranhaAPI.svelte";
import { expectTranslations, renderInI18nTestContext } from "../../utils";
import Initialzing from "../../../../src/components/init/Initializing.svelte";

describe("Initializing", () => {
  test("renders as expected when no API error", async () => {
    mockPiranhaAPI({});
    const { container } = renderInI18nTestContext(Initialzing);
    expect(screen.getByTestId("initializing-spinner")).toBeVisible();
    expect(screen.queryByTestId("initializing-x")).toBeNull();
    await expectTranslations(
      (text) => {
        expect(container).toHaveTextContent(text);
      },
      {
        en: "Initializing: downloading Piranha Docker image. Please wait.",
        fr: "Initialisation: téléchargement de l'image Docker Piranha. Veuillez patienter.",
        pt: "Inicializando: a descarregar a imagem Docker do Piranha. Aguarde.",
      },
    );
  });

  test("renders as expected when API error with detail", async () => {
    mockPiranhaAPI({
      error: { messageKey: "initErrorGuidanceNonWindows", detail: "oh dear" },
    });
    const { container } = renderInI18nTestContext(Initialzing);
    expect(screen.queryByTestId("initializing-spinner")).toBeNull();
    expect(screen.getByTestId("initializing-x")).toBeVisible();
    await expectTranslations(
      (text) => {
        expect(container).toHaveTextContent(text);
      },
      {
        en: "Initialization Error: Docker must be installed and available and you need to have an internet connection to fetch the Piranha image the first time PiranhaNET runs.",
        fr: "Erreur d'initialisation : Docker doit être installé et disponible, et vous devez disposer d'une connexion Internet pour récupérer l'image Piranha lors de la première exécution de PiranhaNET.",
        pt: "Erro de arranque: Docker deve estar instalado e disponível e é necessário ter uma ligação à internet para obter a imagem do Piranha na primeira vez que o PiranhaNET é executado.",
      },
    );
    await expectTranslations(
      (text) => {
        expect(container).toHaveTextContent(text);
      },
      {
        en: "Error detail: oh dear",
        fr: "Détails de l'erreur: oh dear",
        pt: "Detalhes do erro: oh dear",
      },
    );
  });

  test("renders as expected when API error with no detail", async () => {
    mockPiranhaAPI({
      error: { messageKey: "initErrorGuidanceNonWindows", detail: "" },
    });
    const { container } = renderInI18nTestContext(Initialzing);
    expect(screen.getByTestId("initializing-x")).toBeVisible();
    expect(screen.queryByTestId("initializing-spinner")).toBeNull();
    await expectTranslations(
      (text) => {
        expect(container).not.toHaveTextContent(text);
      },
      {
        en: "Error detail",
        fr: "Détails de l'erreur",
        pt: "Detalhes do erro",
      },
    );
  });
});
