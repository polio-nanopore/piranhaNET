import {render, screen } from "@testing-library/svelte";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Nav from "../../../../../src/renderer/src/components/nav/Nav.svelte";
import {expectTranslations, renderInI18nTestContext} from "../../../utils";

// TODO: use svelte-htm to do nested jsx style rendering of I18 context - should also be able to use this to do
// away with the Nav context test component

const { mockRouter} = vi.hoisted(() => {
  const mockRouter = {
    path: "/",
    navigate: vi.fn()
  };
  return {mockRouter}
});

vi.mock("svelte-tiny-router", () => ({
  useTinyRouter: () => mockRouter
}));

describe("Nav", () => {
  beforeEach(() => {
    mockRouter.path = "/";
  });

  test("renders as expected", async () => {
    renderInI18nTestContext(Nav);
    expect(screen.getByText("PiranhaNET")).toBeVisible();
    await expectTranslations((text) => expect(screen.getByTestId("nav-about")).toHaveTextContent(text), {
      en: /About/,
      fr: /À propos/,
      pt: /Sobre/
    });
    await expectTranslations((text) => expect(screen.getByTestId("nav-run")).toHaveTextContent(text), {
      en: /Run/,
      fr: /Courez/,
      pt: /Corra/
    });
  });

  /*test("navigates to current route on load, if not default route", () => {
    mockRouter.path = "/test";
    render(Nav);
    expect(mockRouter.navigate).toHaveBeenCalledWith("/test");
  });*/

  //test("navigates to run on load, if default route");

  //test("navigates to run on click run link");

  //test("navigate to about on clikc about link");
});
