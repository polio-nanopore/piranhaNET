export interface PiranhaRunOptions {
  runPath: string;
  baseCalledPath: string;
  outputPath: string;
  threads?: number;
  positiveControl?: string;
  negativeControl?: string;
}
