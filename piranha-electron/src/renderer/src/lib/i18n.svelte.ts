import { setLocale, locales } from "../../../paraglide/runtime";

const LANG_KEY = "lang";

// Use a class so we can implement a setter which updates local storage and paraglide
// before updating the reactive state value so paraglide is ready to serve new translated strings
class I18n {
  #lang: string;

  constructor() {
    this.#lang = $state("");
  }

  get lang(): string {
    return this.#lang;
  }

  set lang(newValue) {
    // TODO: check value is valid
    setLocale(newValue, { reload: false });
    localStorage.setItem(LANG_KEY, newValue);
    this.#lang = newValue;
  }

  get allLanguages(): string[] {
    return locales;
  }
}

export const i18n = new I18n();

// initialise from local storage
i18n.lang = localStorage.getItem(LANG_KEY) ?? "en";
