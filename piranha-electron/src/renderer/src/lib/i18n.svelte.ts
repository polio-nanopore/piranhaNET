import { readable } from 'svelte/store';
import { setLocale, getLocale,  } from "../../../paraglide/runtime";

// initialise from local store

export const i18n = $state({
  lang: "en"
});

export const updateLang = () => {
  // update state
  i18n.lang = i18n.lang == "en" ? "fr" : "en";
  //set local store
  // set in paraglide
  setLocale(i18n.lang, {reload: false});
}
