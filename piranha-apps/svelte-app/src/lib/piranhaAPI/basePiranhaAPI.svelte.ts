import type {PiranhaVersions} from "../../shared/types";

export interface PiranhaError {
  messageKey: string;
  detail: string;
}

export abstract class BasePiranhaAPI {
  protected _running = $state(false);
  protected _error: PiranhaError | null = $state(null);
  protected _log: string[] = $state([]);
  protected _decoder = new TextDecoder("utf-8");

  get running(): boolean {
    return this._running;
  }

  get error(): PiranhaError {
    return this._error;
  }

  get log(): string[] {
    return this._log;
  }

  protected addToLog(line: string, error = false): void {
    if (error) {
      this._log.push(`\x1b[1;31m${line}`);
    } else {
      this._log.push(line);
    }
  }

  clearRun(): void {
    this._log = [];
    this._error = null;
  }

  abstract async piranhaVersions(): Promise<PiranhaVersions>;
  abstract get runSucceeded(): boolean
}
