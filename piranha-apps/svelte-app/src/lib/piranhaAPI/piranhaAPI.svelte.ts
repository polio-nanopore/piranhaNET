import {PiranhaElectronAPI} from "./piranhaElectronAPI.svelte";
import type {PiranhaAPI} from "./basePiranhaAPI.svelte";

// TODO: select class to create based on appState mode
export const piranhaAPI: PiranhaAPI = new PiranhaElectronAPI();
