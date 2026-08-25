import type { PiranhaRunOptions, PiranhaVersions } from "../shared/types";
import { m } from "../paraglide/messages";

export interface PiranhaError {
  messageKey: string;
  detail: string;
}

export class PiranhaAPI {
  #initialized = $state(false);
  #running = $state(false);
  #error: PiranhaError | null = $state(null);
  #log: string[] = $state([]);
  #decoder = new TextDecoder("utf-8");
  #options: PiranhaRunOptions | null = $state(null);
  #runOutputFolderName = $state("");
  #cancelling = $state(false);
  #abortId = "";

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
    window.api?.onError((messageKey, detail) => {
      this.#error = { messageKey, detail };
      // Add error to log, including ansi sequence to show in Red
      this.#addErrorToLog(`${m[messageKey]()}: ${detail}`);
    });
    window.api?.onRunCancelled(() => {
      this.#cancelling = false;
      this.#running = false;
      this.#error = { messageKey: "runCancelled", detail: "" };
      this.#addErrorToLog(m.runCancelled());
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

  get error(): PiranhaError {
    return this.#error;
  }

  get log(): string[] {
    return this.#log;
  }

  get cancelling(): boolean {
    return this.#cancelling;
  }

  #addErrorToLog(error: string): void {
    this.#log.push(`\x1b[1;31m${error}`);
  }

  async #findOutputFolderFromLog(): Promise<void> {
    // Find local report path from docker volume path written in log, if run was successful
    const fullLog = this.#log.join(" ");
    const match = fullLog.match(/\/data\/run_data\/output\/(.*)\/report\.html/);
    if (match) {
      this.#runOutputFolderName = match[1];
    }
  }

  async runPiranha(options: PiranhaRunOptions): void {
    if (this.#running) {
      throw new Error(m.apiErrorAlreadyRunning());
    }
    this.#log = [];
    this.#options = options;
    this.#abortId = await window.api.runPiranha(options);
    this.#running = true;
  }

  clearRun(): void {
    this.#log = [];
    this.#error = null;
    this.#options = null;
    this.#runOutputFolderName = "";
    this.#cancelling = false;
    this.#abortId = "";
  }

  cancelRun(): void {
    this.#cancelling = true;
    window.api.cancelRun(this.#abortId);
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

  async piranhaVersions(): Promise<PiranhaVersions> {
    return await window.api.piranhaVersions();
  }
}

export const piranhaAPI = new PiranhaAPI();
