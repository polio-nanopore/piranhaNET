import type { PiranhaRunOptionsElectron, PiranhaRunOptionsWeb } from "./shared/types";

export type AppMode = "web" | "electron";

export interface AppState {
  mode: AppMode;
  apiUrl: string | null;
  doneInitialSubmit: boolean;
  doneInitialValidate: boolean;
}

export interface PiranhaRunParametersCommon {
  runName: string;
  notes: string;
  threads: number;
}

export interface PiranhaRunParametersElectron extends PiranhaRunParametersCommon {
  barcodesFilePath: string;
  minKnowFolderPath: string;
}

export interface PiranhaRunParametersWeb extends PiranhaRunParametersCommon{
  barcodesFile: File;
  minKnowFolder: FileList;
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

export interface UserSettingsCommon {
  userName: string;
  institute: string;
}

export interface UserSettingsElectron extends UserSettingsCommon {
  outputFolderPath: string;
}

export interface UserSettingsWeb extends UserSettingsCommon {}

export interface RunSettings {
  protocol: PiranhaProtocol;
  positiveControl?: string;
  negativeControl?: string;
}

// Piranha Output Settings - unlike UserSettings and RunSettings these are not persisted between runs
export interface PiranhaSettingsCommon {
  orientation: PiranhaOrientation;
  outputPrefix?: string;
  outputIntermediateFiles: boolean;
  allMetadataToHeader: boolean;
}

export interface PiranhaSettingsElectron extends PiranhaSettingsCommon, UserSettingsElectron, RunSettings {
  overwriteOutput: boolean;
  dateStamp: boolean;
}

export interface PiranhaSettingsWeb extends PiranhaSettingsCommon, UserSettingsWeb, RunSettings {}

/**
 * Combine settings and per-run parameters to make the full Piranha options required by the electron runner
 */
export const createPiranhaRunOptionsElectron = (
  params: PiranhaRunParametersElectron,
  settings: PiranhaSettingsElectron,
  lang: string,
): PiranhaRunOptionsElectron => {
  return {
    ...params,
    ...settings,
    lang,
  };
};

/**
 * Combine settings and per-run parameters to make the full Piranha options required by the web API runner
 */
export const createPiranhaRunOptionsWeb = (
  params: PiranhaRunParametersWeb,
  settings: PiranhaSettingsWeb,
  lang: string,
): PiranhaRunOptionsWeb => {
  return {
    runName: params.runName,
    notes: params.notes,
    threads: params.threads,
    ...settings,
    lang,
  };
};
