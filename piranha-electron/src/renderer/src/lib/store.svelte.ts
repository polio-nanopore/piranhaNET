import type {PiranhaRunParameters, PiranhaSettings} from "../types";

export const routerHelper = $state({
  // Whether we've initialised the router to default route "/" - we need to do this because the router in electron
  // mode defaults to window.location.pathname, which is the local file location...
  initialNavigationDone: false,
});

export const settings: PiranhaSettings = $state({
  positiveControl: "Pos1,P2",
  negativeControl: "my negative control",
});

export const runParameters: PiranhaRunParameters = $state({
  name: "",
  notes: "",
  barcodesFilePath: "",
  minKnowFolderPath: "",
  outputFolderPath: "",
  threads: 10
});
