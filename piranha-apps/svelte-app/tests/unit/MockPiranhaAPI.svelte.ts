import { piranhaAPI } from "$lib/piranhaAPI.svelte";
import { vi } from "vitest";

export interface APIMock {
  initialized: boolean;
  error: string;
  log: string[];
  running: boolean;
  runSucceeded: boolean;
}

const defaultAPIMock: APIMock = {
  initialized: false,
  error: "",
  log: [],
  running: false,
  runSucceeded: false
};

let initialized = $state(false);
let running = $state(false);
let error = $state("");
let log = $state([]);
let runSucceeded = $state(false);

export const mockPiranhaAPI = (values: Partial<APIMock>) => {
  initialized = values.initialized || defaultAPIMock.initialized;
  error = values.error || defaultAPIMock.error;
  log = values.log || defaultAPIMock.log;
  running = values.running || defaultAPIMock.running;
  runSucceeded = values.runSucceeded || defaultAPIMock.runSucceeded;

  vi.spyOn(piranhaAPI, "initialized", "get").mockImplementation(
    () => initialized,
  );
  vi.spyOn(piranhaAPI, "error", "get").mockImplementation(
    () => error,
  );
  vi.spyOn(piranhaAPI, "log", "get").mockImplementation(() => log);
  vi.spyOn(piranhaAPI, "running", "get").mockImplementation(
    () => running,
  );
  vi.spyOn(piranhaAPI, "runSucceeded", "get").mockImplementation(() => runSucceeded);
  vi.spyOn(piranhaAPI, "runPiranha").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "clearRun").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "openRunReport").mockImplementation(() => {});
  vi.spyOn(piranhaAPI, "openRunOutputFolder").mockImplementation(() => {});
};
