import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/svelte";
import { expectTranslations, renderInI18nTestContext } from "../utils";
import I18nMessageWithLinks from "../../../src/components/I18nMessageWithLinks.svelte";

describe("I18nMessageWithLinks", () => {
  test("renders translations as expected, including links", async () => {
    const { container } = renderInI18nTestContext(I18nMessageWithLinks, {
      props: { messageKey: "initErrorGuidanceWindows" },
    });

    await expectTranslations(
      (text) => {
        expect(container).toHaveTextContent(text);
      },
      {
        en: "Initialization Error: Docker Desktop must be installed and running, and you need to have an internet connection to fetch the Piranha image the first time PiranhaNET runs.",
        fr: "Erreur d'initialisation : Docker Desktop doit être installé et en cours d'exécution, et vous devez disposer d'une connexion Internet pour récupérer l'image Piranha lors de la première exécution de PiranhaNET.",
        pt: "Erro de arranque: O Docker Desktop deve estar instalado e em execução, e necessita de uma ligação à Internet para obter a imagem do Piranha na primeira vez que o PiranhaNET é executado.",
      },
    );

    await expectTranslations(
      (text) => {
        const link = screen.getByRole("link");
        expect(link).toHaveTextContent(text);
        expect(link).toHaveAttribute(
          "href",
          "https://docs.docker.com/desktop/setup/install/windows-install/",
        );
      },
      {
        en: "Docker Desktop",
        fr: "Docker Desktop",
        pt: "O Docker Desktop",
      },
    );
  });
});
