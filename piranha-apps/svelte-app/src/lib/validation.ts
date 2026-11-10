import Papa from "papaparse";

type ValidationResult = {
  success: boolean;
  message?: string;
};

type SampleRow = {
  sample: string;
  barcode: string;
};

const invalidChars = new Set(['|', ' ', ';', ':', '"', "'", '*', '<', '>', '?']);
const barcodeRegex = /^barcode\d{2}$/;
const requiredColumns = ["sample", "barcode"];

export const validateSamplesFile = (
  samplesFileText: string
): ValidationResult => {
  // Check the whole text for invalid chars
  for (const char of samplesFileText) {
    if (invalidChars.has(char)) {
      return { success: false, message: `File contains invalid character: ${char}` };
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
      message: `File is missing required columns: ${missingColumns.join(", ")}`,
    };
  }

  // If parse errors, just report the first one
  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    return {
      success: false,
      message: `Row ${(firstError.row ?? 0) + 1} is invalid: ${firstError.message}`,
    };
  }

  if (result.data.length === 0) {
    return { success: false, message: "File contains 0 rows" };
  }

  for (const row of result.data) {
    if (!row.barcode || !row.sample) {
      return { success: false, message: "File contains missing barcodes or samples" };
    }
    if (!barcodeRegex.test(row.barcode)) {
      return { success: false, message: `Invalid barcode: ${row.barcode}` };
    }
  }

  return { success: true };
};
