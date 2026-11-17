import { PiranhaElectronProvider } from "./piranhaElectronProvider.svelte.js";
import { appState, isWeb } from "../store.svelte";
import { PiranhaWebProvider } from "./piranhaWebProvider.svelte.js";

export let piranhaProvider;

export const initialisePiranhaProvider = (): void => {
  piranhaProvider = isWeb()
    ? new PiranhaWebProvider(appState.apiUrl)
    : new PiranhaElectronProvider();
};
