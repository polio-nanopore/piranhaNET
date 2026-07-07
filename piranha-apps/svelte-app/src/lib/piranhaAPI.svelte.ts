import type { PiranhaRunOptions } from "../shared/types";
import { m } from "../paraglide/messages";

export class PiranhaAPI {
  #initialized = $state(false);
  #running = $state(false);
  #error = $state("");
  #log: string[] = $state([]);
  #decoder = new TextDecoder("utf-8");

  constructor() {
    window.api?.onInitialized(() => {
      this.#initialized = true;
    });

    window.api?.onChunk((chunk) => {
      const textChunk = this.#decoder.decode(chunk, { stream: true });
      const lines = textChunk.split("\n");
      this.#log.push(...lines);
    });
    window.api?.onEnd(() => {
      this.#log.push("Piranha Run Finished");
      this.#running = false;
    });
    window.api?.onError((e, detail) => {
      this.#error = e;
      this.#log.push(`An error occurred while running Piranha: ${e} ${detail}`)
      console.error(detail);
    });
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  get running(): boolean {
    return this.#running;
  }

  get error(): string {
    return this.#error;
  }

  get log(): string[] {
    return this.#log;
  }

  runPiranha(options: PiranhaRunOptions): void {
    if (this.#running) {
      throw new Error(m.apiErrorAlreadyRunning());
    }
    this.#log = [];
    window.api.runPiranha(options);
    this.#running = true;
  }

  clearLog(): void {
    this.#log = [];
  }
}

export const piranhaAPI = new PiranhaAPI();
