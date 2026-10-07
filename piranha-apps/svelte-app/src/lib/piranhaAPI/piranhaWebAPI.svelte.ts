import {BasePiranhaAPI} from "./basePiranhaAPI.svelte";
import type {PiranhaRunOptionsWeb} from "../../shared/types";
import zipFiles from "../zipFiles";
import { m } from "../../paraglide/messages";

export class PiranhaWebAPI extends BasePiranhaAPI {
    private readonly _apiUrl;
    private _runId: string | null;
    constructor(apiUrl: string) {
      super()
      this._apiUrl = apiUrl;
      this._runId = null;
    }

    _buildUrl(relativeUrl: string) {
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

        this._runId = response.headers.get("piranhanet-run-id");

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

  get runSucceeded(): boolean {
    // TODO: make this more efficient, it should be the last line in the log
    return this._log.join("").includes("Piranha run completed with exit code 0");
  }

    async downloadOutputZip() {
      // TODO: error if ! runSucceeded

      // TODO: deal with errors
      // TODO: deeal with !response.ok
      const response =  await fetch(this._buildUrl(`/results/${this._runId}`));

      const cdHeader = response.headers.get("Content-Disposition");
      /*console.log("CONTENT DISP")
      console.log(cdHeader)
      const parts = cdHeader!.split(";");
      const filename = parts[1].split("=")[1];*/
      const filename = cdHeader.match(/filename="([^"]+)"/)[1];
      console.log("filename")
      console.log(filename)

      const zipBlob = await response.blob();
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }

   clearRun(): void {
     super.clearRun();
     this._runId = null;
   }
}
