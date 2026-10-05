import {PiranhaElectronAPI} from "./piranhaElectronAPI.svelte";
import {appState, isWeb} from "../store.svelte";
import {PiranhaWebAPI} from "./piranhaWebAPI.svelte";

export let piranhaAPI;

export const initialisePIranhaAPI = () => {
  piranhaAPI = isWeb() ? new PiranhaWebAPI(appState.apiUrl) : new PiranhaElectronAPI();
}
