import type { AppState, PiranhaRunParameters, PiranhaSettings } from "../types";
import { PiranhaOrientation, PiranhaProtocol } from "../types";
import { persistentSettingsStore } from "./persistentSettingsStore";

export const routerHelper = $state({
  // Whether we've initialised the router to default route "/" - we need to do this because the router in electron
  // mode defaults to window.location.pathname, which is the local file location...
  initialNavigationDone: false,
});

const defaultUserSettings = {
  userName: "",
  institute: "",
  outputFolderPath: "",
};

const defaultRunSettings = {
  protocol: PiranhaProtocol.Stool,
  positiveControl: "",
  negativeControl: "",
};

export const defaultPiranhaOutputSettings = {
  orientation: PiranhaOrientation.Vertical,
  outputPrefix: "analysis",
  overwriteOutput: false,
  outputIntermediateFiles: false,
  allMetadataToHeader: false,
  dateStamp: false,
};

const userSettings =
  persistentSettingsStore.loadUserSettings() ?? defaultUserSettings;

const runSettings =
  persistentSettingsStore.loadRunSettings() ?? defaultRunSettings;

export const settings: PiranhaSettings = $state({
  ...userSettings,
  ...runSettings,
  ...defaultPiranhaOutputSettings,
});

export const appState: AppState = $state({
  doneInitialValidate: false,
  doneInitialSubmit: false,
});

export const defaultRunParameters = (): PiranhaRunParameters => ({
  name: "",
  notes: "",
  barcodesFilePath: "",
  minKnowFolderPath: "",
  threads: 10,
});

export const runParameters: PiranhaRunParameters = $state(
  defaultRunParameters(),
);
