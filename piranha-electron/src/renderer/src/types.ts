import type { PiranhaRunOptions } from "../../shared/types";

export interface AppState {
  doneInitialSubmit: boolean;
}

export interface PiranhaRunParameters {
  name: string;
  notes: string;
  barcodesFilePath: string;
  minKnowFolderPath: string;
  threads: number;
}

// Protocol does not correspond to a single input into Piranha but maps to a set of default option values. It is still
// tbd where this mapping takes place
export enum PiranhaProtocol {
  Stool = "stool",
  Environmental = "environmental",
  Isolate = "isolate",
}

export enum PiranhaOrientation {
  Vertical = "vertical",
  Horizontal = "horizontal",
}

export interface PersistentSettings {
  userName: string;
  institute: string;
  outputFolderPath: string;
}

export interface PiranhaSettings extends PersistentSettings {
  // Run Settings
  protocol: PiranhaProtocol;
  positiveControl?: string;
  negativeControl?: string;
  // Piranha Output Settings
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
): PiranhaRunOptions => {
  return {
    ...params,
    ...settings,
  };
};
