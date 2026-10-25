import {isWeb} from "./store.svelte";
import {piranhaAPI} from "$lib/piranhaAPI/piranhaAPI.svelte";
import {PiranhaWebAPI} from "$lib/piranhaAPI/piranhaWebAPI.svelte";
import pkg from "../../../package.json" with { type: "json" };

export interface ElectronVersions {
  piranhaNet: string,
  piranha: string
}

export interface WebVersions {
  piranhaNetApi: string,
  piranhaNetWeb: string,
  piranha: string
}

export type Versions = ElectronVersions | WebVersions;

export default async (): Versions => {
  const npmVersion = pkg.version;
  // In the Electron mode, the version of piranha we use is specified by the
  // piranhaVersion in package.json, whereas in web mode, we get it from piranha
  // itself via the python API.
  if (isWeb()) {
    const apiVersions = await (piranhaAPI as PiranhaWebAPI).getAPIVersions();
    return {
      piranhaNetApi: apiVersions.api,
      piranhaNetWeb: npmVersion,
      piranha: apiVersions.piranha
    } as WebVersions;
  } else {
    const piranhaVersion = pkg.piranhaVersion;
    return {
      piranhaNet: npmVersion,
      piranha: piranhaVersion
    } as ElectronVersions;
  }
}
