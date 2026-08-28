import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import { vi } from "vitest";
import { PiranhaError } from "../../src/lib/piranhaAPI.svelte";
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

export const mockPiranhaAPI = (values: Partial<APIMock>): void => {
  initialized = values.initialized || defaultAPIMock.initialized;
  error = values.error || defaultAPIMock.error;
  log = values.log || defaultAPIMock.log;
  running = values.running || defaultAPIMock.running;
  cancelling = values.cancelling || defaultAPIMock.cancelling;
  runSucceeded = values.runSucceeded || defaultAPIMock.runSucceeded;
  const piranhaVersions =
    values.piranhaVersions || defaultAPIMock.piranhaVersions;

  vi.spyOn(piranhaAPI, "initialized", "get").mockImplementation(
    () => initialized,
  );
  vi.spyOn(piranhaAPI, "error", "get").mockImplementation(() => error);
  vi.spyOn(piranhaAPI, "log", "get").mockImplementation(() => log);
  vi.spyOn(piranhaAPI, "running", "get").mockImplementation(() => running);
  vi.spyOn(piranhaAPI, "cancelling", "get").mockImplementation(
    () => cancelling,
  );
  vi.spyOn(piranhaAPI, "runSucceeded", "get").mockImplementation(
    () => runSucceeded,
  );
  vi.spyOn(piranhaAPI, "runPiranha").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "clearRun").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "cancelRun").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "openRunReport").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "openRunOutputFolder").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "piranhaVersions").mockImplementation(
    () => piranhaVersions,
  );
};
