import { describe, expect, test, beforeEach, vi } from "vitest";
import { i18n } from "$lib/i18n.svelte";
import Welcome from "../../../../../src/renderer/src/components/run/Welcome.svelte";
import {
  expectTranslations,
  renderInI18nTestContext,
  expectErrorFor,
  expectNoErrors,
  expectNoErrorFor,
} from "../../../utils";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";
import { settings } from "../../../../../src/renderer/src/lib/store.svelte";

describe("Welcome", () => {
  let user;
  beforeEach(() => {
    i18n.lang = "en";
    user = userEvent.setup();

    settings.userName = "";
    settings.institute = "";
    settings.outputFolderPath = "";
  });

  test("renders as expected", async () => {
    const { container } = renderInI18nTestContext(Welcome);
    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("welcome")).toHaveTextContent(text);
      },
      {
        en: /Welcome to PiranhaNET/,
        fr: /Bienvenue sur PiranhaNET/,
        pt: /Bem-vindo ao PiranhaNET/,
      },
    );
    await expectTranslations(
      (text) => {
        expect(screen.getByLabelText(text)).toBeInTheDocument();
      },
      {
        en: /User name/,
        fr: /Nom d'utilisateur/,
        pt: /Nome de utilizador/,
      },
    );
    await expectTranslations(
      (text) => {
        expect(screen.getByTestId("continue")).toHaveTextContent(text);
      },
      {
        en: /Continue/,
        fr: /Continuez/,
        pt: /Continue/,
      },
    );

    expectNoErrors(container);
  });

  test("submit form persists when valid", async () => {
    const mockShowFileDialog = vi.fn().mockImplementation(() => "/newOut");
    window.api = {
      showFileDialog: mockShowFileDialog,
    };

    const onpersist = vi.fn();

    const { container } = render(Welcome, { props: { onpersist } });
    await user.type(screen.getByLabelText("User name"), "New name");
    await user.type(screen.getByLabelText("Institute"), "New Inst");
    await user.click(screen.getByLabelText("Output folder"));
    expect(mockShowFileDialog).toHaveBeenCalled();

    await user.click(screen.getByTestId("continue"));
    expect(onpersist).toHaveBeenCalled();
    expectNoErrors(container);
  });

  test("submit form displays errors when invalid, and updates on every change", async () => {
    const onpersist = vi.fn();
    const { container } = render(Welcome, { props: { onpersist } });
    await user.click(screen.getByTestId("continue"));

    const nameField = screen.getByLabelText("User name");
    const instField = screen.getByLabelText("Institute");
    const outField = screen.getByLabelText("Output folder");

    const nameFieldName = "user-name-field";
    const instituteFieldName = "institute-field";
    const outputFolderFieldName = "output-folder-field";

    expectErrorFor(nameFieldName);
    expectErrorFor(instituteFieldName);
    expectErrorFor(outputFolderFieldName);

    await user.type(nameField, "New name");
    expectNoErrorFor(nameFieldName);
    expectErrorFor(instituteFieldName);
    expectErrorFor(outputFolderFieldName);

    await user.type(instField, "New Inst");
    expectNoErrorFor(nameFieldName);
    expectNoErrorFor(instituteFieldName);
    expectErrorFor(outputFolderFieldName);

    await user.click(outField);
    expectNoErrors(container);
    await user.click(screen.getByTestId("continue"));
    expect(onpersist).toHaveBeenCalled();
  });
});
