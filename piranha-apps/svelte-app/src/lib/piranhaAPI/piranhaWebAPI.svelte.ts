import {BasePiranhaAPI} from "./basePiranhaAPI.svelte";
import type {PiranhaRunOptionsWeb} from "../../shared/types";
import zipFiles from "../zipFiles";
import { m } from "../../paraglide/messages";

export class PiranhaWebAPI extends BasePiranhaAPI {
    private readonly _apiUrl;
    constructor(apiUrl: string) {
      super()
      this._apiUrl = apiUrl;
    }

    _buildUrl(relativeUrl: string) {
      console.log(`API URL IS ${this._apiUrl}`)
      console.log(`RELATIVE URL IS ${relativeUrl}`)
      return `${this._apiUrl}${relativeUrl}`
    }

    async runPiranha(options: PiranhaRunOptionsWeb, barcodesFile: File, minknowFiles: FileList): Promise<void>
    {
      if (this._running) {
        throw new Error(m.apiErrorAlreadyRunning());
      }
      this._running = true;

      try {
        // Zip minknow file
        this.addToLog("Zipping MinKnow folder"); // Piranha logs are always in English, so be consistent with that
        const minknowZipBlob = await zipFiles(minknowFiles);

        // Upload to API
        const formData = new FormData();
        formData.append("barcodesFile", barcodesFile, barcodesFile.name);
        formData.append("minknowZip", minknowZipBlob, "minknow.zip");

        const params = {
          ...options,
          lang: options.lang === "fr" ? "French" : "English"
        };
        const queryParams = new URLSearchParams(params).toString();

        this.addToLog("Running Piranha...");
        const response = await fetch(this._buildUrl(`/run?${queryParams}`), {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to run Piranha with status ${response.status}: ${response.statusText}.`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Response body is not readable");

        try {
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += this._decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");

            // Process complete lines, keep potentially incomplete line in buffer
            for (let i = 0; i < lines.length - 1; i++) {
              this._log.push(lines[i]);
            }
            buffer = lines[lines.length - 1];
          }

          // Handle any remaining data
          if (buffer.trim()) {
           this.addToLog(buffer);
          }
        } finally {
          reader.releaseLock();
        }
      }
      catch (e) {
        const messageKey = "runError";
        const detail = e.message;
        this._error = { messageKey, detail };
        this.addToLog(`${m[messageKey]()}: ${detail}`, true);
      }
      finally {
        this._running = false;
        this.addToLog("Piranha run finished");
      }

    }
}
