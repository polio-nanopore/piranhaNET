import type { PiranhaRunOptions } from "../shared/types";
import { m } from "../paraglide/messages";

export class PiranhaAPI {
  #initialized = $state(false);
  #running = $state(false);
  #error = $state("");
  #log: string[] = $state([]);
  #decoder = new TextDecoder("utf-8");
  #options: PiranhaRunOptions | null = $state(null);
  #reportPath = $state("");

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
      await this.#findReportPathFromLog();
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

  get error(): string {
    return this.#error;
  }

  get log(): string[] {
    return this.#log;
  }

  get reportPath(): string {
    return this.#reportPath;
  }

  async #findReportPathFromLog() {
    // Find local report path from docker volume path in written in log, if run was successful
    const fullLog = this.#log.join(" ");
    console.log("Here is the full log");
    console.log(fullLog);
    const match = fullLog.match(/\/data\/run_data\/output\/(.*)\/report\.html/);
    if (match) {
      console.log("found match")
      const outputFolder = match[1];
      this.#reportPath = await this.getFileUrl(this.#options.outputFolderPath, outputFolder, "report.html");
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
    this.#reportPath = "";
  }

  async getFileUrl(...parts): Promise<string> {
    return window.api.getFileUrl(parts);
  }
}

export const piranhaAPI = new PiranhaAPI();
