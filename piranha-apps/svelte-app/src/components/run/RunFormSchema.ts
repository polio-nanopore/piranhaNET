import { z, type ZodString, type ZodObject, type ZodRawShape } from "zod";
import { m } from "../../paraglide/messages";

const THREADS_MIN = 1;
const THREADS_MAX = 20;

const requiredString = (): ZodString =>
  z.string().nonempty(m.formsErrorRequiredValue());

const threadsRangeError = m.formsErrorRange({
  min: THREADS_MIN,
  max: THREADS_MAX,
});

export const userSettingsFormSchemaWeb = (): ZodRawShape => ({
  userName: requiredString(),
  institute: requiredString()
});

export const userSettingsFormSchemaElectron = (): ZodRawShape => ({
  ...userSettingsFormSchemaWeb(),
  outputFolderPath: requiredString(),
});

export const runSettingsFormSchema = (): ZodRawShape => ({
  protocol: requiredString(),
  positiveControl: requiredString(),
  negativeControl: requiredString(),
});

export const piranhaOutputSettingsFormSchemaWeb = (): ZodRawShape => ({
  orientation: requiredString(),
  outputPrefix: z.string(),
  outputIntermediateFiles: z.boolean(),
  allMetadataToHeader: z.boolean()
});

export const piranhaOutputSettingsFormSchemaElectron = (): ZodRawShape => ({
  ...piranhaOutputSettingsFormSchemaWeb(),
  overwriteOutput: z.boolean(),
  dateStamp: z.boolean(),
});

const settingsFormSchemaElectron = (): ZodRawShape => ({
  ...runSettingsFormSchema(),
  ...piranhaOutputSettingsFormSchemaElectron(),
  ...userSettingsFormSchemaElectron(),
});

const settingsFormSchemaWeb = (): ZodRawShape => ({
  ...runSettingsFormSchema(),
  ...piranhaOutputSettingsFormSchemaWeb(),
  ...userSettingsFormSchemaWeb(),
});

const perRunParametersSchema = (): ZodRawShape => ({
  runName: requiredString(),
  barcodesFilePath: requiredString(),
  minKnowFolderPath: requiredString(),
  notes: requiredString(),
  threads: z
    .int(m.formsErrorNumberRequired())
    .min(THREADS_MIN, { error: threadsRangeError })
    .max(THREADS_MAX, { error: threadsRangeError }),
});

export const runParametersSchemaElectron = (): ZodObject => {
    console.log("constructing electron schema")
    return z.object({
      ...perRunParametersSchema(),
      ...settingsFormSchemaElectron(),
  });
}

export const runParametersSchemaWeb = (): ZodObject => {
  console.log("constructing web schema")
  return z.object({
    ...perRunParametersSchema(),
    ...settingsFormSchemaWeb(),
  });
}
