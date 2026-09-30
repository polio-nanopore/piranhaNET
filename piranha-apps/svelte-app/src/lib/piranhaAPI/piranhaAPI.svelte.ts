import type { PiranhaVersions } from "../../shared/types";
import { m } from "../../paraglide/messages";

export interface PiranhaError {
  messageKey: string;
  detail: string;
}

export class PiranhaAPI {
  protected running = $state(false);
  protected error: PiranhaError | null = $state(null);
  protected log: string[] = $state([]);
  protected decoder = new TextDecoder("utf-8");


  get running(): boolean {
    return this.running;
  }

  get error(): PiranhaError {
    return this.error;
  }

  get log(): string[] {
    return this.log;
  }

  protected addErrorToLog(error: string): void {
    this.log.push(`\x1b[1;31m${error}`);
  }

  // TODO: overload this to clear the cancelling stuff for electron
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
