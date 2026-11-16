import { createRawSnippet, mount, unmount } from "svelte";
import { expect, vi } from "vitest";
import { i18n } from "$lib//i18n.svelte";
import {
  render,
  screen,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import I18nTestContext from "./components/I18nTestContext.svelte";
import { persistentSettingsStore } from "../../src/lib/persistentSettingsStore";
import { settings } from "../../src/lib/store.svelte";
import { RunSettings, UserSettings } from "../../src/types";

export interface PersistentSettingsStoreMock {
  runSettings: RunSettings | null;
  userSettings: UserSettings | null;
}

const defaultPersistentSettingsStoreMock: PersistentSettingsStoreMock = {
  runSettings: null,
  userSettings: null,
};

export const mockPersistentSettingsStore = (
  values: Partial<PersistentSettingsStoreMock>,
): void => {
  const mockedStore = { ...defaultPersistentSettingsStoreMock, ...values };
  vi.spyOn(persistentSettingsStore, "loadUserSettings").mockImplementation(
    () => mockedStore.userSettings,
  );
  vi.spyOn(persistentSettingsStore, "saveUserSettings");
  vi.spyOn(persistentSettingsStore, "loadRunSettings").mockImplementation(
    () => mockedStore.runSettings,
  );
  vi.spyOn(persistentSettingsStore, "saveRunSettings");
};

type translation = string | RegExp;
export type Translations = Record<Partial<"en" | "fr" | "pt">, translation>;

/**
 * Utility for expecting a number of different translation strings depending on current
 * language.
 * @param expectation Function which accepts a translation string for a language, and expects to find it e.g. in a
 * particular element on screen.
 * @param translations Record of language to translation string. The utility switches the current language to each of
 * the keys of this record, then tests the expectation function for its related translation string. The record does not
 * need to contain every supported language.
 */
export const expectTranslations = async (
  expectation: (text: translation) => void,
  translations: Translations,
): Promise<void> => {
  for (const lang of Object.keys(translations)) {
    i18n.lang = lang;
    await waitFor(() => {
      expectation(translations[lang]);
    });
  }
};

/**
 * Utility to render a component in a context which will be reactive to changes in the current i18n language in order
 * to test translations are correctly rendered. In the app we set this reactivity in the top level App component, so
 * for tests we provide a I18nTestContext component and this method mounts the component under test as a child of that
 * context component.
 * @param component Component to be tested
 * @param options Props and other options to be provided to the component mounted in context
 */
export const renderInI18nTestContext = (
  component,
  options = {} as any,
): RenderResult<any> => {
  const snippet = createRawSnippet(() => ({
    render: () => "<div></div>", // placeholder markup
    setup: (target) => {
      const child = mount(component, { ...options, target });
      return () => unmount(child);
    },
  }));
  return render(I18nTestContext, { children: snippet });
};

export const ERROR_CLASS = "text-destructive";
export const expectNoErrors = (container): void => {
  expect(container.querySelector(`.${ERROR_CLASS}`)).toBeNull();
};

export const expectErrorFor = (
  fieldName: string,
  expectedError = "Required value",
): void => {
  expect(screen.getByTestId(`${fieldName}-label`).classList).toContain(
    ERROR_CLASS,
  );
  const error = screen.getByTestId(`${fieldName}-error`);
  expect(error).toHaveTextContent(expectedError);
  expect(error.classList).toContain(ERROR_CLASS);
};

export const expectNoErrorFor = (fieldName: string): void => {
  expect(screen.queryByTestId(`${fieldName}-error`)).toBeNull();
  expect(screen.getByTestId(`${fieldName}-label`).classList).not.toContain(
    ERROR_CLASS,
  );
};

/*
 * Utility to mock file selection from HTML input (in web mode). When using this in a test, you still need to trigger
 * the click event on the input to in turn trigger the change event.
 */
export const mockChangeEventOnHTMLInputClick = (
  input: HTMLInputElement,
  files: FileList,
): void => {
  // handle click event on input to mock user selecting the given file list, and raising the associated change event
  input.addEventListener("click", () => {
    // Update the files value on the input on click, and trigger the change event
    Object.defineProperty(input, "files", {
      value: files,
      writable: true,
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

/*
/* We may need to bootstrap the settings multiple times to test both web and electron mode, in which
/* case we'll get unexpected settings if we don't clear down the old values first
*/
export const clearSettings = (): void => {
  Object.keys(settings).forEach((k) => delete settings[k]);
};
