import type { PiranhaRunOptions } from "../shared/types";
import { m } from "../paraglide/messages";

export class PiranhaAPI {
  #initialized = $state(false);
  #running = $state(false);
  #error = $state("");
  #log: string[] = $state([]);
  #decoder = new TextDecoder("utf-8");
  #options: PiranhaRunOptions | null = $state(null);
  #runOutputFolderName = $state("");

  constructor() {
    window.api?.onInitialized(() => {
      this.#initialized = true;
    });

    window.api?.onChunk((chunk) => {
      const textChunk = this.#decoder.decode(chunk, { stream: true });
      const lines = textChunk.split("\n");
      this.#log.push(...lines);
    });
    window.api?.onEnd(async () => {
      this.#log.push("Piranha Run Finished");
      await this.#findOutputFolderFromLog();
      this.#running = false;
    });
    window.api?.onError((e, detail) => {
      this.#error = e;
      // Add error to log, including ansi sequence to show in Red
      this.#log.push(`\x1b[1;31m${e}: ${detail}`);
    });
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  get running(): boolean {
    return this.#running;
  }

  get runSucceeded(): boolean {
    return !!this.#runOutputFolderName;
  }

  get error(): string {
    return this.#error;
  }

  get log(): string[] {
    return this.#log;
  }

  async #findOutputFolderFromLog(): Promise<void> {
    // Find local report path from docker volume path in written in log, if run was successful
    const fullLog = this.#log.join(" ");
    const match = fullLog.match(/\/data\/run_data\/output\/(.*)\/report\.html/);
    if (match) {
      this.#runOutputFolderName = match[1];
    }
  }

  runPiranha(options: PiranhaRunOptions): void {
    if (this.#running) {
      throw new Error(m.apiErrorAlreadyRunning());
    }
    this.#log = [];
    this.#options = options;
    window.api.runPiranha(options);
    this.#running = true;
  }

  clearRun(): void {
    this.#log = [];
    this.#error = "";
    this.#options = null;
    this.#runOutputFolderName = "";
  }

  async openRunReport(): Promise<void> {
    await window.api.openRunReport(
      this.#options.outputFolderPath,
      this.#runOutputFolderName,
    );
  }

  async openRunOutputFolder(): Promise<void> {
    await window.api.openRunOutputFolder(
      this.#options.outputFolderPath,
      this.#runOutputFolderName,
    );
  }
}

export const piranhaAPI = new PiranhaAPI();
