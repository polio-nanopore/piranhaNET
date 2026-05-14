import { PiranhaOrientation } from "../renderer/src/types";

export interface PiranhaRunOptions {
  name: string;
  notes: string;
  barcodesFilePath: string;
  minKnowFolderPath: string;
  outputFolderPath: string;
  threads?: number;
  protocol: "stool" | "environmental" | "isolate";
  positiveControl?: string;
  negativeControl?: string;
  orientation: "vertical" | "horizontal";
  outputPrefix?: string;
  overwriteOutput: boolean;
  outputIntermediateFiles: boolean;
  allMetadataToHeader: boolean;
  dateStamp: boolean;
  userName: string;
  institute: string;
}

export interface FileDialogOptions {
  title: string;
  defaultPath: string;
  selectFolder: boolean;
  filters?: {
    name: string;
    extensions: string[];
  }[];
}
