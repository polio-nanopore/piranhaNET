import {parseString} from "@fast-csv/parse";

type ValidationResult = {
  success: boolean,
  message?: string
}

type SampleRow = {
  sample: string,
  barcode: string
};

const invalidChars = new Set(['|', ' ', ';', ':', '"', "'", '*', '<', '>', '?']);
const barcodeRegex = /^barcode[\d]{2}$/;

export const validateSamplesFile = async (samplesFileText: string): ValidationResult => {
  return new Promise((resolve) => {
    // check the whole text for invalid chars
    for (const char of samplesFileText) {
      if (invalidChars.has(char)) {
        resolve({success: false, message: `File contains invalid character: ${char}`});
      }
    }
    // TODO: test that an error raised if expected columns not found
    // TODO: translate!
    const parseOptions = {
      headers: true,
      quote: null, // quote chars are not expected
      escape: null,
      strictColumnHandling: true
    };
    parseString<SampleRow, SampleRow>(samplesFileText, parseOptions)
      .on("data", (row: SampleRow) => {
        if (!row.barcode || !row.sample) {
          resolve({success: false, message: "File contains missing barcodes or samples"});
        }
        // check for invalid barcode
        if (!barcodeRegex.test(row.barcode)) {
          resolve({success: false, message: `Invalid barcode: ${row.barcode}`});
        }
      })
      .on("data-invalid", (_, rowNumber) => resolve({success: false, message: `Row ${rowNumber} is invalid`}))
      .on("error", (error) => resolve({success: false, message: error}))
      .on("end", () =>  resolve({success: true}));
  });
}
