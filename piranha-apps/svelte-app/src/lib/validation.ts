import Papa from "papaparse";
import { m } from "../paraglide/messages";

type ValidationResult = {
  success: boolean;
  message?: string;
};

type SampleRow = {
  sample: string;
  barcode: string;
};

const invalidChars = new Set(['|', ';', ':', '"', "'", '*', '<', '>', '?']);
const barcodeRegex = /^barcode\d{2}$/;
const requiredColumns = ["sample", "barcode"];

export const validateSamplesFile = (
  samplesFileText: string
): ValidationResult => {
  // Check for whitespace separately from other invalid chars to allow for less confusing error message
  if (samplesFileText.includes(" ")) {
    return {success: false, message: m.formsErrorSpacesInFile()}
  }

  // Check the whole text for invalid chars
  for (const char of samplesFileText) {
    if (invalidChars.has(char)) {
      return { success: false, message: m.formsErrorInvalidCharInFile({char}) };
    }
  }

  const result = Papa.parse<SampleRow>(samplesFileText, {
    header: true,
    skipEmptyLines: true,
  });

  // Check for the expected columns
  const fields = result.meta.fields ?? [];
  const missingColumns = requiredColumns.filter((column) => !fields.includes(column));
  if (missingColumns.length > 0) {
    return {
      success: false,
      message: m.formsErrorMissingColumns({columns: missingColumns.join(", ")}),
    };
  }

  // If parse errors, just report the first one
  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    const rowIdx = (firstError.row ?? 0) + 1;
    return {
      success: false,
      message: `${m.formsErrorInvalidRow({index: rowIdx})} ${firstError.message}`,
    };
  }

  if (result.data.length === 0) {
    return { success: false, message: m.formsErrorZeroRows() };
  }

  for (const row of result.data) {
    if (!row.barcode || !row.sample) {
      return { success: false, message: m.formsErrorSamplesFileMissingData() };
    }
    if (!barcodeRegex.test(row.barcode)) {
      return { success: false, message: m.formsErrorSamplesFileInvalidBarcode({barcode: row.barcode}) };
    }
  }

  return { success: true };
};
