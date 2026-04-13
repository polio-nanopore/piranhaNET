export interface PiranhaRunOptions {
  name: string;
  notes: string;
  barcodesFilePath: string;
  minKnowFolderPath: string;
  outputFolderPath: string;
  threads?: number;
  positiveControl?: string;
  negativeControl?: string;
}

export interface FileDialogOptions {
  selectFolder: boolean
}
