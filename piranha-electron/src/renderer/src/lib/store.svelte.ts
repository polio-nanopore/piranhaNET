import type {AppState, PiranhaRunParameters, PiranhaSettings} from "../types";
import {PiranhaOrientation, PiranhaProtocol} from "../types";

export const routerHelper = $state({
  // Whether we've initialised the router to default route "/" - we need to do this because the router in electron
  // mode defaults to window.location.pathname, which is the local file location...
  initialNavigationDone: false,
});

export const settings: PiranhaSettings = $state({
  protocol: PiranhaProtocol.Stool,
  positiveControl: "positive",
  negativeControl: "negative",
  orientation: PiranhaOrientation.Vertical,
  outputPrefix: "analysis",
  overwriteOutput: false,
  outputIntermediateFiles: false,
  allMetadataToHeader: false,
  dateStamp: false
});

export const appState: AppState = $state({
  doneInitialSubmit: false,
});

export const defaultRunParameters = (): PiranhaRunParameters => ({
  name: "",
  notes: "",
  barcodesFilePath: "",
  minKnowFolderPath: "",
  outputFolderPath: "",
  threads: 10,
});

export const runParameters: PiranhaRunParameters = $state(
  defaultRunParameters(),
);
