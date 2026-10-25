import { vi } from "vitest";
import {
  initialisePiranhaAPI,
  PiranhaError,
} from "../../src/lib/piranhaAPI/piranhaAPI.svelte.js";
import {WebVersions} from "../../src/lib/versions";

export interface APIMock {
  initialized: boolean;
  error: PiranhaError | null;
  log: string[];
  running: boolean;
  runSucceeded: boolean;
  cancelling: boolean;
  apiVersions: WebVersions;
}

const defaultAPIMock: APIMock = {
  initialized: false,
  error: null,
  log: [],
  running: false,
  runSucceeded: false,
  cancelling: false,
  apiVersions: {
    piranha: "0.1.0-test",
    api: "0.2.0-test",
  },
};

let initialized = $state(false);
let running = $state(false);
let error = $state(null);
let log = $state([]);
let runSucceeded = $state(false);
let cancelling = $state(false);

export const mockPiranhaAPI = async (values: Partial<APIMock>): void => {
  // initialiseStore should have been called prior to mocking the API, as the mode
  // (web or electron) selected for the store determines the API class which is
  // initialised.
  initialisePiranhaAPI();
  initialized = values.initialized || defaultAPIMock.initialized;
  error = values.error || defaultAPIMock.error;
  log = values.log || defaultAPIMock.log;
  running = values.running || defaultAPIMock.running;
  cancelling = values.cancelling || defaultAPIMock.cancelling;
  runSucceeded = values.runSucceeded || defaultAPIMock.runSucceeded;
  const apiVersions =
    values.apiVersions || defaultAPIMock.apiVersions;

  const { piranhaAPI } = await import("$lib/piranhaAPI/piranhaAPI.svelte");

  const spyOnAPIProp = (propName: string, value: unknown): void => {
    if (propName in piranhaAPI) {
      vi.spyOn(piranhaAPI, propName, "get").mockImplementation(() => value);
    }
  };
  const spyOnAPIMethod = (methodName: string, implementation): void => {
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
  spyOnAPIMethod("getAPIVersions", () => apiVersions);

  return piranhaAPI;
};
