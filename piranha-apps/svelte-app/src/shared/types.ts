// TODO: These "shared" types are used by both the electron main process and the front end. Put in svelte-app for now,
// consider if rename tweak or similar would make this clearer

export interface PiranhaRunOptionsWeb {
  runName: string;
  notes: string;
  threads?: number;
  protocol: "stool" | "environmental" | "isolate";
  positiveControl?: string;
  negativeControl?: string;
  orientation: "vertical" | "horizontal";
  outputPrefix?: string;
  outputIntermediateFiles: boolean;
  allMetadataToHeader: boolean;
  userName: string;
  institute: string;
  lang: string;
}

export interface PiranhaRunOptionsElectron extends PiranhaRunOptionsWeb {
  barcodesFilePath: string;
  minKnowFolderPath: string;
  outputFolderPath: string;
  overwriteOutput: boolean;
  dateStamp: boolean;
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

export interface PiranhaVersions {
  piranha: string;
  piranhaNET: string;
}
