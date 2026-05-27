import { createRawSnippet, mount, unmount } from "svelte";
import {expect, test, vi } from "vitest";
import { i18n } from "$lib//i18n.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import I18nTestContext from "./renderer/components/I18nTestContext.svelte";
import {PersistentSettingsStore, persistentSettingsStore} from "../../src/renderer/src/lib/persistentSettingsStore";
import {RunSettings, UserSettings} from "../../src/renderer/src/types";

export interface APIMock {
  initialized: boolean;
  error: string;
  log: string[];
  running: boolean;
}

const defaultAPIMock: APIMock = {
  initialized: false,
  error: "",
  log: [],
  running: false,
};

export const mockPiranhaAPI = (values: Partial<APIMock>): void => {
  const mockedAPI = { ...defaultAPIMock, ...values };
  vi.spyOn(piranhaAPI, "initialized", "get").mockImplementation(
    () => mockedAPI.initialized,
  );
  vi.spyOn(piranhaAPI, "error", "get").mockImplementation(
    () => mockedAPI.error,
  );
  vi.spyOn(piranhaAPI, "log", "get").mockImplementation(() => mockedAPI.log);
  vi.spyOn(piranhaAPI, "running", "get").mockImplementation(
    () => mockedAPI.running,
  );
  vi.spyOn(piranhaAPI, "runPiranha").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "clearLog");
};

export interface PersistentSettingsStoreMock {
  runSettings: RunSettings | null,
  userSettings: UserSettings | null
}

const defaultPersistentSettingsStoreMock: PersistentSettingsStoreMock = {
  runSettings: null,
  userSettings: null
};

export const mockPersistentSettingsStore = (values: Partial<PersistentSettingsStoreMock>): void => {
  const mockedStore = {...defaultPersistentSettingsStoreMock, ...values};
  vi.spyOn(persistentSettingsStore, "loadUserSettings").mockImplementation(() => mockedStore.userSettings);
  vi.spyOn(persistentSettingsStore, "saveUserSettings");
  vi.spyOn(persistentSettingsStore, "loadRunSettings").mockImplementation(() => mockedStore.runSettings);
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
) => {
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
export const expectNoErrors = (container) => {
  expect(container.querySelector(`.${ERROR_CLASS}`)).toBeNull();
};

//TODO: remove these container params
export const expectErrorFor = (container: HTMLElement, fieldName: string, expectedError = "Required value") => {
  expect(screen.getByTestId(`${fieldName}-label`).classList).toContain(ERROR_CLASS);
  const error = screen.getByTestId(`${fieldName}-error`);
  expect(error).toHaveTextContent(expectedError);
  expect(error.classList).toContain(ERROR_CLASS);
};

export const expectNoErrorFor = (container: HTMLElement, fieldName: string) => {
  expect(screen.queryByTestId(`${fieldName}-error`)).toBeNull();
  expect(screen.getByTestId(`${fieldName}-label`).classList).not.toContain(ERROR_CLASS);
}
