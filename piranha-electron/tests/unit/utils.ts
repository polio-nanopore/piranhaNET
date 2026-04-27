import { createRawSnippet, mount, unmount } from "svelte";
import { vi } from "vitest";
import { i18n } from "$lib//i18n.svelte";
import { render, waitFor } from "@testing-library/svelte";
import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import I18nTestContext from "./renderer/components/I18nTestContext.svelte";

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
): void => {
  const snippet = createRawSnippet(() => ({
    render: () => "<div></div>", // placeholder markup
    setup: (target) => {
      const child = mount(component, { ...options, target });
      return () => unmount(child);
    },
  }));
  render(I18nTestContext, { children: snippet });
};
