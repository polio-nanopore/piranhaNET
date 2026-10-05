import {PiranhaElectronAPI} from "./piranhaElectronAPI.svelte";
import type {BasePiranhaAPI} from "./basePiranhaAPI.svelte";
import {appState, isWeb} from "../store.svelte";
import {PiranhaWebAPI} from "./piranhaWebAPI.svelte";


export const piranhaAPI: BasePiranhaAPI = isWeb() ?  new PiranhaWebAPI(appState.apiUrl) : new PiranhaElectronAPI();
