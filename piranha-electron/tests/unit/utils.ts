import { vi } from "vitest";
import { i18n } from "../../src/renderer/src/lib/i18n.svelte";
import { waitFor } from "@testing-library/svelte";
import {piranhaAPI} from "../../src/renderer/src/lib/piranhaAPI.svelte";

export interface APIMock {
  initialized: boolean,
  error: string
}

const defaultAPIMock: APIMock = {
  initialized: false,
  error: ""
}

export const mockPiranhaAPI = (values: Partial<APIMock>): void => {
  const mockedAPI = {...defaultAPIMock, ...values}
  vi.spyOn(piranhaAPI, "initialized", "get").mockImplementation(() => mockedAPI.initialized);
  vi.spyOn(piranhaAPI, "error", "get").mockImplementation(() => mockedAPI.error);
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
  translations: Translations
): Promise<void> => {
  for (const lang of Object.keys(translations)) {
    i18n.lang = lang;
    await waitFor(() => {
      expectation(translations[lang]);
    });
  }
};
