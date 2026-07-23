import type { PiranhaRunOptions } from "./shared/types";

export interface AppState {
  doneInitialSubmit: boolean;
  doneInitialValidate: boolean;
}

export interface PiranhaRunParameters {
  name: string;
  notes: string;
  barcodesFilePath: string;
  minKnowFolderPath: string;
  threads: number;
}

export enum PiranhaProtocol {
  Stool = "stool",
  Environmental = "environmental",
  Isolate = "isolate",
}

export enum PiranhaOrientation {
  Vertical = "vertical",
  Horizontal = "horizontal",
}

export interface UserSettings {
  userName: string;
  institute: string;
  outputFolderPath: string;
}

export interface RunSettings {
  protocol: PiranhaProtocol;
  positiveControl?: string;
  negativeControl?: string;
}

export interface PiranhaSettings extends UserSettings, RunSettings {
  // Piranha Output Settings - unlike UserSettings and RunSetttings these are not persisted between runs
  orientation: PiranhaOrientation;
  outputPrefix?: string;
  overwriteOutput: boolean;
  outputIntermediateFiles: boolean;
  allMetadataToHeader: boolean;
  dateStamp: boolean;
}

/**
 * Combine settings and per-run parameters to make the full Piranha options required by the runner
 */
export const createPiranhaRunOptions = (
  params: PiranhaRunParameters,
  settings: PiranhaSettings,
  lang: string,
): PiranhaRunOptions => {
  return {
    ...params,
    ...settings,
    lang,
  };
};
