import { contextBridge, ipcRenderer } from "electron";
import {
  FileDialogOptions,
  PiranhaRunOptions,
} from "../../../svelte-app/src/shared/types";

// Custom APIs for renderer
const api = {
  piranhaVersions: () => {
    return ipcRenderer.invoke("piranha-versions");
  },
  runPiranha: (options: PiranhaRunOptions) =>
    ipcRenderer.send("run-piranha", options),
  cancelRun: (abortId: string) =>
    ipcRenderer.send("cancel-run", abortId),
  versions: process.versions,
  showFileDialog: (options: FileDialogOptions) =>
    ipcRenderer.invoke("show-file-dialog", options),
  openRunReport: (outputFolderBasePath: string, runOutputFolderName: string) =>
    ipcRenderer.invoke(
      "open-run-report",
      outputFolderBasePath,
      runOutputFolderName,
    ),
  openRunOutputFolder: (
    outputFolderBasePath: string,
    runOutputFolderName: string,
  ) =>
    ipcRenderer.invoke(
      "open-run-output-folder",
      outputFolderBasePath,
      runOutputFolderName,
    ),
  onInitialized: (callback) =>
    ipcRenderer.on("initialized", (_event) => callback()),
  onChunk: (callback) =>
    ipcRenderer.on("stream-chunk", (_event, value) => callback(value)),
  onEnd: (callback) => ipcRenderer.on("stream-end", (_event) => callback()),
  onError: (callback) =>
    ipcRenderer.on("error", (_event, error, detail) => callback(error, detail)),
  onRunCancelled: (callback) =>
    ipcRenderer.on("run-cancelled", (_event) => callback())
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api;
}
