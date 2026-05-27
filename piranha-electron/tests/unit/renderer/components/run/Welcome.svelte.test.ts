import { describe, expect, test, beforeEach, vi } from "vitest";
import { i18n } from "$lib/i18n.svelte";
import Welcome from "../../../../../src/renderer/src/components/run/Welcome.svelte";
import {expectTranslations, renderInI18nTestContext} from "../../../utils";
import {render} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";

describe("Welcome", () => {
  let user;
  beforeEach(() => {
    i18n.lang = "en";
    user = userEvent.setup();
  });

  const expectNoErrors = () => {
    expect(screen.locator(`.${ERROR_CLASS}`)).toBeNull();
  };

  const errorLocator = "//following-sibling::p";
  const expectErrorFor = (field: HTMLElement) => {
    expect(field.locator(errorLocator)).toHaveTextContent("Required field");
  };

  const expectNoErrorFor = (field: HTMLElement) => {
    expect(field.locator(errorLocator)).toBeNull();
  }

  test("renders as expected", async () => {
    renderInI18nTestContext(Welcome);
    await expectTranslations((text) => {
      expect(screen.getByTestId("welcome")).toHaveTextContent(text);
      },
      {
        en: /Welcome to PiranhaNET/,
        fr: /Bienvenue sur PiranhaNET/,
        pt: /Bem-vindo ao PiranhaNET/,
      }
      );
    await expectTranslations((text) => {
      expect(screen.getByLabelText(text)).toBeInTheDocument();
    }, {
      en: /User name/,
      fr: /Nom d'utilisateur/,
      pt: /Nome de utilizador/
    });
    await expectTranslations((text) => {
      expect(screen.getByRole("button")).toHaveTextContent(text);
    }, {
      en: /Continue/,
      fr: /Continuez/,
      pt: /Continue/,
    })

    expectNoErrors();
  });

  test("submit form persists when valid", () => {
    const mockShowFileDialog = vi
      .fn()
      .mockImplementation(() => "/newOut");
    window.api = {
      showFileDialog: mockShowFileDialog,
    };

    const onpersist = vi.fn();

    render(Welcome, {props: {onpersist}});
    user.type(screen.getByLabelText("User name"), "New name");
    user.type(screen.getByLabelText("Institute"), "New Inst");
    user.click(screen.getByLabelText("Output folder"));
    user.click(screen.getByRole("button"));

    expect(onpersist).toHaveBeenCalled();
    expectNoErrors();
  });

  test("submit form displays errors when invalid, and updates on every change", () => {
    const onpersist = vi.fn();
    render(Welcome, {props: {onpersist}});
    user.click(screen.getByRole("button"));

    const nameField = screen.getByLabelText("User name")
    const instField = screen.getByLabelText("Institute")
    const outField = screen.getByLabelText("Output folder")
    expectErrorFor(nameField);
    expectErrorFor(instField  );
    expectErrorFor(outField);

    user.type(nameField, "New name");
    expectNoErrorFor(nameField)
    expectErrorFor(instField);
    expectErrorFor(outField);

    user.type(instField, "New Inst");
    expectNoErrorFor(nameField);
    expectNoErrorFor(instField);
    expectErrorFor(outField);

    user.click(outField);
    expectNoErrors();
    user.click(screen.getByRole("button"));
    expect(onpersist).toHaveBeenCalled();
  });
});
