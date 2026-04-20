import type {AppState, PiranhaRunParameters, PiranhaSettings} from "../types";

export const routerHelper = $state({
  // Whether we've initialised the router to default route "/" - we need to do this because the router in electron
  // mode defaults to window.location.pathname, which is the local file location...
  initialNavigationDone: false,
});

export const settings: PiranhaSettings = $state({
  positiveControl: "Pos1,P2",
  negativeControl: "my negative control",
});

export const appState: AppState = $state({
  doneInitialSubmit: false
});

const defaultRunParameters = () => ({
  name: "",
  notes: "",
  barcodesFilePath: "",
  minKnowFolderPath: "",
  outputFolderPath: "",
  threads: 10
});

export const runParameters: PiranhaRunParameters = $state(defaultRunParameters());
