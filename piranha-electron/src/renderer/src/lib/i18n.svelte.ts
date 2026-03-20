import { setLocale, locales } from "../../../paraglide/runtime";

const LANG_KEY = "lang";

export const i18n = $state({
  lang: "",
  allLanguages: locales
});

export const initialiseI18n = () => {
  // effects should be created from component initialisation
  $effect(() => {
    setLocale(i18n.lang, {reload: false});
    localStorage.setItem(LANG_KEY, i18n.lang);
  });

  // initialise from local storage
  i18n.lang = localStorage.getItem(LANG_KEY) ?? "en";
};


