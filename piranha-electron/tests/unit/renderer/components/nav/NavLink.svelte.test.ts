import {render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";
import NavComponentInTestContext from "./NavComponentInTestContext.svelte";
import {expectTranslations} from "../../../utils";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";

const mockRouter = {
  navigate: vi.fn(),
  path: "/the-current-route"
};

const renderNavLink = (route = "/test-route") => {
  render(NavComponentInTestContext, {
    props:{
      componentName: "NavLink",
      router: mockRouter,
      route,
      textKey: "about"
    }
  })
};

const getLinkElement = () => screen.getByTestId("nav-about");

describe("NavLink", () => {
  test("displays translations of textKey prop", async () => {
    renderNavLink();
    await expectTranslations((text) => expect(getLinkElement()).toBeVisible(), {
      en: "About",
      fr: "À propos",
      pt: "Sobre"
    });
  });

  test("navigates to route on click", async () => {
    renderNavLink();
    const user = userEvent.setup();
    await user.click(getLinkElement());
    expect(mockRouter.navigate).toHaveBeenCalledWith("/test-route")
  });

  test("applies current-nav-route class for current route", async () => {
    renderNavLink("/the-current-route");
    const link = getLinkElement();
    expect(link.classList).toContain("current-nav-route");
  });

  test("does not apply current-nav-route class for non-current route", async () => {
    renderNavLink();
    const link = getLinkElement();
    expect(link.classList).not.toContain("current-nav-route");
  });
});
