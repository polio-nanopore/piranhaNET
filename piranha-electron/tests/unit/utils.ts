import { vi } from "vitest";
import { i18n } from "../../src/renderer/src/lib/i18n.svelte";
import { waitFor } from "@testing-library/svelte";

export const mockWindowAPI = (): void => {
  (window as any).api = {
    onInitialized: vi.fn(),
    onChunk: vi.fn(),
    onEnd: vi.fn(),
    onError: vi.fn(),
    versions: {
      electron: "1.1.1",
      chrome: "2.2.2",
      node: "3.3.3"
    }
  };
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
