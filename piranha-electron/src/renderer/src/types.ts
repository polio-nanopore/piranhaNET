import type { PiranhaRunOptions } from "../../shared/types";

export interface PiranhaRunParameters {
  name: string;
  notes: string;
  barcodesFilePath: string;
  minKnowFolderPath: string;
  outputFolderPath: string; // This will eventually move into settings, but it's easier to provide in form for now
  threads: number;
}

export interface PiranhaSettings {
  positiveControl?: string;
  negativeControl?: string;
}

/**
 * Combine settings and per-run parameters to make the full Piranha options required by the runner
 */
export const createPiranhaRunOptions = (params: PiranhaRunParameters, settings: PiranhaSettings): PiranhaRunOptions => {
  return {
    ...params,
    ...settings
  };
};
