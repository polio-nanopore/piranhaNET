import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { PiranhaRunner } from "./piranhaRunner";
import { Writable } from "node:stream";
import {FileDialogOptions, PiranhaRunOptions } from "../shared/types";

const runner = new PiranhaRunner();
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", async () => {
    mainWindow.show();

    try {
      await runner.pullPiranhaImage();
      mainWindow.webContents.send("initialized");
    } catch (e) {
      mainWindow.webContents.send(
        "error",
        "Initialization error",
        (e as Error).message,
      );
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  /**
   * Display a native file dialog and return selection to renderer
   */
  ipcMain.handle("show-file-dialog", async (_event, options: FileDialogOptions) => {
    const openType = options.selectFolder ? "openDirectory" : "openFile";
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title,
      defaultPath: options.defaultPath,
      properties: [ openType ],
      filters: options.filters || []
    });
    return result.filePaths.length ? result.filePaths[0] : null;
  });

  /**
   * Handles request from renderer to run Piranha and stream logs back to the main window
   */
  ipcMain.on("run-piranha", async (_event, options: PiranhaRunOptions) => {
    const writable = new Writable({
      write(chunk, _, callback) {
        // Send each chunk to the renderer
        mainWindow.webContents.send("stream-chunk", chunk);
        callback();
      },
      final(callback) {
        console.log("finished running piranha");
        mainWindow.webContents.send("stream-end");
        callback();
      },
    });

    try {
      await runner.runPiranha(options, writable);
    } catch (e) {
      mainWindow.webContents.send(
        "error",
        "Piranha Run error",
        (e as Error).message,
      );
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
