import { describe, expect, test, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { expectTranslations, renderInI18nTestContext } from "../../../utils";
import FileSelect from "../../../../src/components/forms/FileSelect.svelte";

describe("FileSelect", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });
  test("renders as expected for folder select", async () => {
    renderInI18nTestContext(FileSelect, {
      props: {
        selectFolder: true,
        filters: [],
        value: "/default",
      },
    });
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /Choose folder/,
        fr: /Choisir un dossier/,
        pt: /Selecione a pasta/,
      },
    );
    expect(screen.getByText("/default")).toBeVisible();
  });

  test("renders as expected for file select", async () => {
    renderInI18nTestContext(FileSelect, {
      props: {
        selectFolder: false,
        filters: [],
        value: "/default/barcodes.csv",
      },
    });
    await expectTranslations(
      (text) => expect(screen.getByText(text)).toBeVisible(),
      {
        en: /Choose file/,
        fr: /Choisir un fichier/,
        pt: /Selecione o ficheiro/,
      },
    );
    expect(screen.getByText("/default/barcodes.csv")).toBeVisible();
  });

  test("shows dialog, updates values and calls onchange", async () => {
    const mockOnChange = vi.fn();
    const mockShowFileDialog = vi
      .fn()
      .mockImplementation(() => "/selected/file.csv");
    window.api = {
      showFileDialog: mockShowFileDialog,
    };
    renderInI18nTestContext(FileSelect, {
      props: {
        title: "Test Title",
        selectFolder: false,
        filters: [{ name: "csv", extensions: ["csv"] }],
        onchange: mockOnChange,
        value: "/default/barcodes.csv",
      },
    });

    const button = screen.getByRole("button");
    await user.click(button);
    expect(mockShowFileDialog).toHaveBeenCalledWith({
      title: "Test Title",
      selectFolder: false,
      filters: [{ name: "csv", extensions: ["csv"] }],
      defaultPath: "/default/barcodes.csv",
    });

    expect(mockOnChange).toHaveBeenCalled();
    expect(screen.getByText("/selected/file.csv")).toBeVisible();
  });

  test("does no update if dialog is cancelled", async () => {
    const mockOnChange = vi.fn();
    const mockShowFileDialog = vi.fn().mockImplementation(() => null);
    window.api = {
      showFileDialog: mockShowFileDialog,
    };
    renderInI18nTestContext(FileSelect, {
      props: {
        title: "Test Title",
        selectFolder: false,
        filters: [{ name: "csv", extensions: ["csv"] }],
        onchange: mockOnChange,
        value: "/default/barcodes.csv",
      },
    });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText("/default/barcodes.csv")).toBeVisible();
  });
});
