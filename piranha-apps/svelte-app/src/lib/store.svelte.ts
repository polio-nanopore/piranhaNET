import type {AppMode, AppState, PiranhaRunParameters, PiranhaSettings } from "../types";
import { PiranhaOrientation, PiranhaProtocol } from "../types";
import { persistentSettingsStore } from "./persistentSettingsStore";

export const routerHelper = $state({
  // Whether we've initialised the router to default route "/" - we need to do this because the router in electron
  // mode defaults to window.location.pathname, which is the local file location...
  initialNavigationDone: false,
});

const defaultUserSettingsWeb = {
  userName: "",
  institute: ""
};

const defaultUserSettingsElectron = {
  ...defaultUserSettingsWeb,
  outputFolderPath: "",
};

const defaultRunSettings = {
  protocol: PiranhaProtocol.Stool,
  positiveControl: "",
  negativeControl: "",
};

export const defaultPiranhaOutputSettingsWeb = {
  orientation: PiranhaOrientation.Vertical,
  outputPrefix: "analysis",
  outputIntermediateFiles: false,
  allMetadataToHeader: false,
};

export const defaultPiranhaOutputSettingsElectron = {
  ...defaultPiranhaOutputSettingsWeb,
  overwriteOutput: false,
  dateStamp: false,
};

export let settings = $state({});

export const appState: AppState = $state({
  mode: null,
  apiUrl: null,
  doneInitialValidate: false,
  doneInitialSubmit: false
});

// When in webmode, we keep references to the uploaded files themselves separately from the name strings displayed
// and used for validation. These are bound to the file selects.
export const webFiles = $state({
  barcodesFileList: null,
  minknowFileList: null
});

// We retain the path parameters in web mode in the paraeters objects for display and validation, but we also use
// FileList value to pass to the API - this is handled in the component
export const defaultRunParameters = (): PiranhaRunParameters => ({
  runName: "",
  notes: "",
  barcodesFilePath: "",
  minKnowFolderPath: "",
  threads: 10,
});

export const runParameters: PiranhaRunParameters = $state(
  defaultRunParameters(),
);

export const isWeb = () => appState.mode === "web";

export const initialiseStore = (mode: AppMode, apiUrl?: string) => {
  appState.mode = mode;
  appState.apiUrl = apiUrl;

  const userSettings =
    persistentSettingsStore.loadUserSettings() ?? (isWeb() ? defaultUserSettingsWeb : defaultUserSettingsElectron);

  const runSettings =
    persistentSettingsStore.loadRunSettings() ?? defaultRunSettings;

  const defaultPiranhaOutputSettings = isWeb() ? defaultPiranhaOutputSettingsWeb : defaultPiranhaOutputSettingsElectron;

  const modeSettings = {
    ...userSettings,
    ...runSettings,
    ...defaultPiranhaOutputSettings,
  };
  Object.entries(modeSettings).forEach(([key, value]) => {
    settings[key] = value;
  });

}

