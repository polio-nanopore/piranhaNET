import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {
  runPiranha: () => ipcRenderer.send("run-piranha"),
  testMessage: () => ipcRenderer.send("test-message"),
  versions: process.versions,
  onInitialized: (callback) =>
    ipcRenderer.on("initialized", (_event) => callback()),
  onChunk: (callback) =>
    ipcRenderer.on("stream-chunk", (_event, value) => callback(value)),
  onEnd: (callback) => ipcRenderer.on("stream-end", (_event) => callback()),
  onError: (callback) =>
    ipcRenderer.on("error", (_event, error, detail) => callback(error, detail)),
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
