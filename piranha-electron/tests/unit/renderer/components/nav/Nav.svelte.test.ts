import {render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Nav from "../../../../../src/renderer/src/components/nav/Nav.svelte";
import {expectTranslations, renderInI18nTestContext} from "../../../utils";

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
  let user;
  beforeEach(() => {
    mockRouter.path = "/";
    user = userEvent.setup();
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

  test("navigates to current route on load, if not default route", () => {
    mockRouter.path = "/test";
    render(Nav);
    expect(mockRouter.navigate).toHaveBeenCalledWith("/test");
  });

  test("navigates to run on load, if default route", () => {
    render(Nav);
    expect(mockRouter.navigate).toHaveBeenCalledWith("/run")
  });

  test("navigates to run on click run link", async () => {
    mockRouter.path = "/test";
    render(Nav);
    await user.click(screen.getByTestId("nav-run"));
    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    expect(mockRouter.navigate.mock.calls[1]).toStrictEqual(["/run"]);
  });

  test("navigate to about on click about link", async () => {
    render(Nav);
    await user.click(screen.getByTestId("nav-about"));
    expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    expect(mockRouter.navigate.mock.calls[1]).toStrictEqual(["/about"]);
  });
});
