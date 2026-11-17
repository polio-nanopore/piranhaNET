import { vi } from "vitest";
import {
  initialisePiranhaProvider,
  PiranhaError,
} from "../../src/lib/piranhaProvider/piranhaProvider.svelte.js";
import { WebVersions } from "../../src/lib/versions";

export interface ProviderMock {
  initialized: boolean;
  error: PiranhaError | null;
  log: string[];
  running: boolean;
  runSucceeded: boolean;
  cancelling: boolean;
  apiVersions: WebVersions;
  downloadError: PiranhaError | null;
}

const defaultProviderMock: ProviderMock = {
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
  downloadError: null,
};

let initialized = $state(false);
let running = $state(false);
let error = $state(null);
let log = $state([]);
let runSucceeded = $state(false);
let cancelling = $state(false);
let downloadError = $state(null);

export const mockPiranhaProvider = async (
  values: Partial<ProviderMock>,
): void => {
  // initialiseStore should have been called prior to mocking the API, as the mode
  // (web or electron) selected for the store determines the API class which is
  // initialised.
  initialisePiranhaProvider();
  initialized = values.initialized || defaultProviderMock.initialized;
  error = values.error || defaultProviderMock.error;
  log = values.log || defaultProviderMock.log;
  running = values.running || defaultProviderMock.running;
  cancelling = values.cancelling || defaultProviderMock.cancelling;
  runSucceeded = values.runSucceeded || defaultProviderMock.runSucceeded;
  downloadError = values.downloadError || defaultProviderMock.downloadError;
  const apiVersions = values.apiVersions || defaultProviderMock.apiVersions;

  const { piranhaProvider } =
    await import("$lib/piranhaProvider/piranhaProvider.svelte");

  const spyOnProviderProp = (propName: string, value: unknown): void => {
    if (propName in piranhaProvider) {
      vi.spyOn(piranhaProvider, propName, "get").mockImplementation(
        () => value,
      );
    }
  };
  const spyOnProviderMethod = (methodName: string, implementation): void => {
    if (!implementation) {
      implementation = () => {};
    }
    if (methodName in piranhaProvider) {
      vi.spyOn(piranhaProvider, methodName).mockImplementation(implementation);
    }
  };
  spyOnProviderProp("initialized", initialized);
  spyOnProviderProp("error", error);
  spyOnProviderProp("log", log);
  spyOnProviderProp("running", running);
  spyOnProviderProp("cancelling", cancelling);
  spyOnProviderProp("runSucceeded", runSucceeded);
  spyOnProviderProp("downloadError", downloadError);

  spyOnProviderMethod("runPiranha");
  spyOnProviderMethod("clearRun");
  spyOnProviderMethod("cancelRun");
  spyOnProviderMethod("openRunReport");
  spyOnProviderMethod("openRunOutputFolder");
  spyOnProviderMethod("downloadOutputZip");
  spyOnProviderMethod("readTextFile");
  spyOnProviderMethod("getAPIVersions", () => apiVersions);

  return piranhaProvider;
};
