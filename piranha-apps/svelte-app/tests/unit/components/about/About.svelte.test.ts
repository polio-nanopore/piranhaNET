import { describe, expect, test } from "vitest";
import { expectTranslations, renderInI18nTestContext } from "../../utils";
import { mockPiranhaAPI } from "../../MockPiranhaAPI.svelte";
import About from "../../../../src/components/about/About.svelte";
import { screen, within } from "@testing-library/svelte";

describe("About", () => {
  test("renders as expected", async () => {
    mockPiranhaAPI({});
    renderInI18nTestContext(About);
    await expectTranslations(
      (text) =>
        expect(screen.getByTestId("about-header")).toHaveTextContent(text),
      {
        en: /About PiranhaNET/,
        fr: /À propos de PiranhaNET/,
        pt: /Sobre a PiranhaNET/,
      },
    );
    expect(screen.getByText("Piranha v0.1.0-test")).toBeVisible();
    expect(screen.getByText("PiranhaNET v0.2.0-test")).toBeVisible();
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /PiranhaNET is the graphical user interface for Piranha/,
        fr: /PiranhaNET est l'interface graphique de Piranha/,
        pt: /O PiranhaNET é a interface gráfica do utilizador para o Piranha/,
      },
    );
    expect(screen.getByTestId("about-grants")).toHaveTextContent(
      "Poliovirus Sequencing Consortium",
    );
    expect(screen.getByTestId("about-grants")).toHaveTextContent(
      "ARTIC network",
    );

    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /This is open-source software./,
        fr: /Il s'agit de code open source./,
        pt: /Este é um software de código aberto./,
      },
    );
    const githubDiv = screen.getByTestId("about-github");
    const githubLinks = within(githubDiv).queryAllByRole("link");
    expect(githubLinks.length).toBe(2);
    expect(githubLinks[0]).toHaveAttribute(
      "href",
      "https://github.com/polio-nanopore/piranha",
    );
    expect(githubLinks[1]).toHaveAttribute(
      "href",
      "https://github.com/polio-nanopore/piranhaNET",
    );
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /PiranhaNET is the graphical user interface for Piranha/,
        fr: /PiranhaNET est l'interface graphique de Piranha/,
        pt: /O PiranhaNET é a interface gráfica do utilizador para o Piranha/,
      },
    );
    expect(screen.getByTestId("about-credits")).toHaveTextContent("Piranha");
    expect(screen.getByTestId("about-credits")).toHaveTextContent(
      "Áine O’Toole",
    );
  });
});
