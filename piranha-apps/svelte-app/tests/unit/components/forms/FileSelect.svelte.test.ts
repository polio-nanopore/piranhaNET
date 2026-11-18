import { describe, expect, test, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {
  expectTranslations,
  renderInI18nTestContext,
  mockChangeEventOnHTMLInputClick,
} from "../../utils";
import FileSelect from "../../../../src/components/forms/FileSelect.svelte";

const expectChooseFolderTranslations = async (): Promise<void> => {
  await expectTranslations(
    (text) => expect(screen.getByText(text)).toBeVisible(),
    {
      en: /Choose folder/,
      fr: /Choisir un dossier/,
      pt: /Selecione a pasta/,
    },
  );
};

const expectChooseFileTranslations = async (): Promise<void> => {
  await expectTranslations(
    (text) => expect(screen.getByText(text)).toBeVisible(),
    {
      en: /Choose file/,
      fr: /Choisir un fichier/,
      pt: /Selecione o ficheiro/,
    },
  );
};

describe("FileSelect", () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("electron mode", () => {
    test("renders as expected for folder select", async () => {
      renderInI18nTestContext(FileSelect, {
        props: {
          mode: "electron",
          selectFolder: true,
          filters: [],
          value: "/default",
        },
      });
      await expectChooseFolderTranslations();
      expect(screen.getByText("/default")).toBeVisible();
    });

    test("renders as expected for file select", async () => {
      renderInI18nTestContext(FileSelect, {
        props: {
          mode: "electron",
          selectFolder: false,
          filters: [],
          value: "/default/samples.csv",
        },
      });
      await expectChooseFileTranslations();
      expect(screen.getByText("/default/samples.csv")).toBeVisible();
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
          mode: "electron",
          title: "Test Title",
          selectFolder: false,
          filters: [{ name: "csv", extensions: ["csv"] }],
          onchange: mockOnChange,
          value: "/default/samples.csv",
        },
      });

      const button = screen.getByRole("button");
      await user.click(button);
      expect(mockShowFileDialog).toHaveBeenCalledWith({
        title: "Test Title",
        selectFolder: false,
        filters: [{ name: "csv", extensions: ["csv"] }],
        defaultPath: "/default/samples.csv",
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
          mode: "electron",
          title: "Test Title",
          selectFolder: false,
          filters: [{ name: "csv", extensions: ["csv"] }],
          onchange: mockOnChange,
          value: "/default/samples.csv",
        },
      });

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(screen.getByText("/default/samples.csv")).toBeVisible();
    });
  });

  describe("web mode", () => {
    const renderFolderSelect = (onchange = null): void => {
      renderInI18nTestContext(FileSelect, {
        props: {
          mode: "web",
          selectFolder: true,
          filters: [],
          value: "/default",
          title: "test",
          onchange,
        },
      });
    };

    const renderFileSelect = (onchange = null): void => {
      renderInI18nTestContext(FileSelect, {
        props: {
          mode: "web",
          selectFolder: false,
          filters: [],
          value: "/default/samples.csv",
          title: "test",
          onchange,
        },
      });
    };

    test("renders as expected for folder select", async () => {
      renderFolderSelect();
      await expectChooseFolderTranslations();
      expect(screen.getByText("/default")).toBeVisible();
      expect(screen.getByTestId("folder-input-test")).not.toBeVisible();
    });

    test("renders as expected for file select", async () => {
      renderFileSelect();
      await expectChooseFileTranslations();
      expect(screen.getByText("/default/samples.csv")).toBeVisible();
      expect(screen.getByTestId("file-input-test")).not.toBeVisible();
    });

    test("updates value and calls onchange for file select", async () => {
      const mockOnChange = vi.fn();
      renderFileSelect(mockOnChange);
      const input = screen.getByTestId("file-input-test");
      const fakeFileList = [
        new File(["test content"], "file1.txt", { type: "text/plain" }),
      ];
      mockChangeEventOnHTMLInputClick(input, fakeFileList);
      const button = screen.getByRole("button");
      await user.click(button);
      expect(input.files).toBe(fakeFileList);
      expect(mockOnChange).toHaveBeenCalledWith("file1.txt", fakeFileList);
    });

    test("updates value and calls onchange for folder select", async () => {
      const mockOnChange = vi.fn();
      renderFolderSelect(mockOnChange);
      const input = screen.getByTestId("folder-input-test");
      const fakeFileList = [
        new File(["test content"], "file1.txt", { type: "text/plain" }),
        new File(["more test content"], "file2.txt", { type: "text/plain" }),
      ];

      fakeFileList.forEach((f) => {
        Object.defineProperty(f, "webkitRelativePath", {
          writable: false,
          value: `testFolder/subFolder/${f.name}`,
        });
      });

      mockChangeEventOnHTMLInputClick(input, fakeFileList);
      const button = screen.getByRole("button");
      await user.click(button);

      expect(input.files).toBe(fakeFileList);
      expect(mockOnChange).toHaveBeenCalledWith("testFolder", fakeFileList);
    });

    test("updates value and calls on change when no files selected", async () => {
      const mockOnChange = vi.fn();
      renderFolderSelect(mockOnChange);
      const input = screen.getByTestId("folder-input-test");
      const fakeFileList = [];
      mockChangeEventOnHTMLInputClick(input, fakeFileList);
      const button = screen.getByRole("button");
      await user.click(button);

      expect(input.files).toBe(fakeFileList);
      expect(mockOnChange).toHaveBeenCalledWith(null, []);
    });
  });
});
