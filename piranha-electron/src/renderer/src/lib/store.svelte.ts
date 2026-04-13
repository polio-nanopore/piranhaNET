import type {PiranhaRunParameters, PiranhaSettings} from "../types";

export const routerHelper = $state({
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
