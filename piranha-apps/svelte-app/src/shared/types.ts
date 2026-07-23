// TODO: These "shared" types are used by both the electron main process and the front end. Put in svelte-app for now,
// consider if rename tweak or similar would make this clearer
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
  lang: string;
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
