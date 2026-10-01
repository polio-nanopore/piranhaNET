import {BasePiranhaAPI} from "./basePiranhaAPI.svelte";
import type {PiranhaWebRunOptions} from "../../shared/types";
import zipFiles from "../zipFiles";

export class PiranhaWebAPI extends BasePiranhaAPI {
    private readonly _apiUrl;
    constructor(apiUrl: string) {
      super()
      this._apiUrl = apiUrl;
    }

    _buildUrl(relativeUrl: string) {
      return `${this._apiUrl}${relativeUrl}`
    }

    async runPiranha(options: PiranhaWebRunOptions, barcodesFile: File, minknowFiles: FileList): Promise<void> {
      // Zip minknow file
      this.addToLog("Zipping MinKnow folder"); // Piranha logs are always in English, so be consistent with that
      const minknowZipBlob = zipFiles(minknowFiles);

      // Upload to API
      const formData = new FormData();
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value))
      });
      formData.append("barcodesFile", barcodesFile);
      formData.append("minknowZip", minknowZipBlob);

      const response = await fetch(this._buildUrl("/run"), {
        method: "POST",
        body: formData
      });

      // TODO: sort out errors
      if (!response.ok) {
        throw new Error(`Failed to run Piranha: ${response.statusText}`);
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
        this.addToLog("Piranha run finished");
      }
      // TODO: handle error

    }
}
