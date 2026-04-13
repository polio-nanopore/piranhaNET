export interface PiranhaRunOptions {
  name: string;
  notes: string;
  barcodesFilePath: string;
  baseCalledPath: string;
  outputPath: string;
  threads?: number;
  positiveControl?: string;
  negativeControl?: string;
}

export interface FileDialogOptions {
  selectFolder: boolean
}
