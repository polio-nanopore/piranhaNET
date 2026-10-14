import { vi } from "vitest";
import {initialisePiranhaAPI, PiranhaError } from "../../src/lib/piranhaAPI/piranhaAPI.svelte.js";
import { PiranhaVersions } from "../../src/shared/types";

export interface APIMock {
  initialized: boolean;
  error: PiranhaError | null;
  log: string[];
  running: boolean;
  runSucceeded: boolean;
  cancelling: boolean;
  piranhaVersions: PiranhaVersions;
}

const defaultAPIMock: APIMock = {
  initialized: false,
  error: null,
  log: [],
  running: false,
  runSucceeded: false,
  cancelling: false,
  piranhaVersions: {
    piranha: "0.1.0-test",
    piranhaNET: "0.2.0-test",
  },
};

let initialized = $state(false);
let running = $state(false);
let error = $state(null);
let log = $state([]);
let runSucceeded = $state(false);
let cancelling = $state(false);

export const mockPiranhaAPI = async (values: Partial<APIMock>): void => {
  initialisePiranhaAPI(); // TODO: explain need to initialise store prior to this
  initialized = values.initialized || defaultAPIMock.initialized;
  error = values.error || defaultAPIMock.error;
  log = values.log || defaultAPIMock.log;
  running = values.running || defaultAPIMock.running;
  cancelling = values.cancelling || defaultAPIMock.cancelling;
  runSucceeded = values.runSucceeded || defaultAPIMock.runSucceeded;
  const piranhaVersions =
    values.piranhaVersions || defaultAPIMock.piranhaVersions;

  const {piranhaAPI} = await import("$lib/piranhaAPI/piranhaAPI.svelte");

  const spyOnAPIProp = (propName: string, value: unknown) => {
    if (propName in piranhaAPI) {
      vi.spyOn(piranhaAPI, propName, "get").mockImplementation(
        () => value
      );
    }
  };
  const spyOnAPIMethod = (methodName: string, implementation) => {
    if (!implementation) {
      implementation = () => {};
    }
    if (methodName in piranhaAPI) {
      vi.spyOn(piranhaAPI, methodName).mockImplementation(implementation);
    }
  };
  spyOnAPIProp("initialized", initialized);
  spyOnAPIProp("error", error);
  spyOnAPIProp("log", log);
  spyOnAPIProp("running", running);
  spyOnAPIProp("cancelling", cancelling);
  spyOnAPIProp("runSucceeded", runSucceeded);

  spyOnAPIMethod("runPiranha");
  spyOnAPIMethod("clearRun");
  spyOnAPIMethod("cancelRun");
  spyOnAPIMethod("openRunReport");
  spyOnAPIMethod("openRunOutputFolder");
  spyOnAPIMethod("downloadOutputZip");
  spyOnAPIMethod("piranhaVersions", () => piranhaVersions);

  return piranhaAPI;
};
