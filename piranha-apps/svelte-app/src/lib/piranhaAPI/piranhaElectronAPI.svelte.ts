import {BasePiranhaAPI} from "./basePiranhaAPI.svelte";
import type { PiranhaRunOptionsElectron, PiranhaVersions} from "../../shared/types";
import { m } from "../../paraglide/messages";

export class PiranhaElectronAPI extends BasePiranhaAPI {
  private _initialized = $state(false);
  // TODO: distinguish electron from web options
  private _options: PiranhaRunOptionsElectron | null = $state(null);
  private _runOutputFolderName = $state("");
  private _cancelling = $state(false);
  private _abortId = "";

  constructor() {
    window.api?.onInitialized(() => {
      this._initialized = true;
    });

    window.api?.onChunk((chunk) => {
      const textChunk = this._decoder.decode(chunk, { stream: true });
      const lines = textChunk.split("\n");
      this._log.push(...lines);
    });
    window.api?.onEnd(async () => {
      this._log.push("Piranha Run Finished");
      await this.findOutputFolderFromLog();
      this._running = false;
    });
    window.api?.onError((messageKey, detail) => {
      this._error = { messageKey, detail };
      this.addToLog(`${m[messageKey]()}: ${detail}`, true);
    });
    window.api?.onRunCancelled(() => {
      this._cancelling = false;
      this._running = false;
      this._error = { messageKey: "runCancelled", detail: "" };
      this.addToLog(m.runCancelled(), true);
    });

    super();
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // TODO: will need to find a way to do the equivalent for web mode, and then maybe update here too
  get runSucceeded(): boolean {
    return !!this._runOutputFolderName;
  }

  get cancelling(): boolean {
    return this._cancelling;
  }

  private async findOutputFolderFromLog(): Promise<void> {
    // Find local report path from docker volume path written in log, if run was successful
    const fullLog = this._log.join(" ");
    const match = fullLog.match(/\/data\/run_data\/output\/(.*)\/report\.html/);
    if (match) {
      this._runOutputFolderName = match[1];
    }
  }

  async runPiranha(options: PiranhaRunOptionsElectron): Promise<void> {
    if (this._running) {
      throw new Error(m.apiErrorAlreadyRunning());
    }
    this._log = [];
    this._options = options;
    this._abortId = await window.api.runPiranha(options);
    this._running = true;
  }

  clearRun(): void {
    super.clearRun();
    this._options = null;
    this._runOutputFolderName = "";
    this._cancelling = false;
    this._abortId = "";
  }

  cancelRun(): void {
    this._cancelling = true;
    window.api.cancelRun(this._abortId);
  }

  async openRunReport(): Promise<void> {
    await window.api.openRunReport(
      this._options.outputFolderPath,
      this._runOutputFolderName,
    );
  }

  async openRunOutputFolder(): Promise<void> {
    await window.api.openRunOutputFolder(
      this._options.outputFolderPath,
      this._runOutputFolderName,
    );
  }

  async piranhaVersions(): Promise<PiranhaVersions> {
    return await window.api.piranhaVersions();
  }
}
