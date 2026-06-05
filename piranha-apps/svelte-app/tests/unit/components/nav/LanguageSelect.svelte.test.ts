import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, beforeEach } from "vitest";
import { i18n } from "$lib/i18n.svelte";
import NavComponentInTestContext from "./NavComponentInTestContext.svelte";

describe("LanguageSelect", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
    i18n.lang = "en";
    render(NavComponentInTestContext, {
      props: {
        componentName: "LanguageSelect",
      },
    });
  });

  test("displays current language", async () => {
    const menuButton = screen.getByRole("button");
    expect(menuButton).toHaveTextContent("en");
  });

  test("can show all available languages on click", async () => {
    const menuButton = screen.getByRole("button");
    await user.click(menuButton);
    const en = await screen.findByTestId("lang-en");
    expect(en).toHaveTextContent("en");
    expect(en).toBeChecked();
    expect(screen.getByTestId("lang-fr")).toHaveTextContent("fr");
    expect(screen.getByTestId("lang-pt")).toHaveTextContent("pt");
  });

  test("can update language", async () => {
    const menuButton = screen.getByRole("button");
    await user.click(menuButton);
    const fr = await screen.findByTestId("lang-fr");
    await user.click(fr);
    await waitFor(() => expect(i18n.lang).toBe("fr"));
  });
});
