import {PiranhaAPI, PiranhaError} from "./piranhaAPI.svelte";
import { PiranhaRunOptions } from "../../shared/types";
import { m } from "../../paraglide/messages";

export class PiranhaElectronAPI extends PiranhaAPI {
  private initialized = $state(false);
  // TODO: distinguish electron from web options
  private optionps: PiranhaRunOptions | null = $state(null);
  private runOutputFolderName = $state("");
  private cancelling = $state(false);
  private abortId = "";

  constructor() {
    window.api?.onInitialized(() => {
      this.initialized = true;
    });

    window.api?.onChunk((chunk) => {
      const textChunk = this.decoder.decode(chunk, { stream: true });
      const lines = textChunk.split("\n");
      this.log.push(...lines);
    });
    window.api?.onEnd(async () => {
      this.log.push("Piranha Run Finished");
      await this.findOutputFolderFromLog();
      this.running = false;
    });
    window.api?.onError((messageKey, detail) => {
      this.error = { messageKey, detail };
      // Add error to log, including ansi sequence to show in Red
      this.addErrorToLog(`${m[messageKey]()}: ${detail}`);
    });
    window.api?.onRunCancelled(() => {
      this.cancelling = false;
      this.running = false;
      this.error = { messageKey: "runCancelled", detail: "" };
      this.addErrorToLog(m.runCancelled());
    });

    super();
  }

  get initialized(): boolean {
    return this.initialized;
  }

  // TODO: will need to find a way to do the equivalent for web mode
  get runSucceeded(): boolean {
    return !!this.runOutputFolderName;
  }

  get cancelling(): boolean {
    return this.cancelling;
  }

  private async findOutputFolderFromLog(): Promise<void> {
    // Find local report path from docker volume path written in log, if run was successful
    const fullLog = this.log.join(" ");
    const match = fullLog.match(/\/data\/run_data\/output\/(.*)\/report\.html/);
    if (match) {
      this.runOutputFolderName = match[1];
    }
  }

  async runPiranha(options: PiranhaRunOptions): void {
    if (this.running) {
      throw new Error(m.apiErrorAlreadyRunning());
    }
    this.#log = [];
    this.#options = options;
    this.#abortId = await window.api.runPiranha(options);
    this.#running = true;
  }
}
