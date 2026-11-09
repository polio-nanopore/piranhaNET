import { describe, test, expect } from "vitest";
import {validateSamplesFile} from "../../../src/lib/validation";
import { EOL } from "os";

const joinRows = (rows: string[]) => rows.join(EOL);

describe("validateSamplesFile", () => {
  test("passes a valid file", async () => {
    const rows = [
      "barcode,sample",
      "barcode01,sample01",
      "barcode02,sample02",
      "barcode03,sample03"
    ];
    expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({success: true});
  });

  test("errors on invalid csv", async () => {
    const rows = [
      "barcode,sample",
      "csv,with,,",
      "bad,data"
    ];
    expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
      success: false, message: "Row 1 is invalid"
    });
  });

  test("errors if missing barcodes", async() => {
    const rows = [
      "barcode,sample",
      "barcode01,sample01",
      "barcode02,sample02",
      ",sample03"
    ];
    expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
      success: false, message: "File contains missing barcodes or samples"
    });
  });

  test("errors if missing samples", async() => {
    const rows = [
      "barcode",
      "barcode01",
      "barcode02",
      "barcode03"
    ];
    expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
      success: false, message: "File contains missing barcodes or samples"
    });
  });
 test("errors if file contains invalid chars", async () => {
   let rows = [
     "barcode,sample",
     "\"barcode01,sample01",
     "barcode02,sample02"
   ];
   expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
     success: false,
     message: "File contains invalid character: \""
   });

   rows = [
     "barcode,sample","*",
     "barcode01,sample01"
   ];
   expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
     success: false,
     message: "File contains invalid character: *"
   });
 });
  test("errors on invalid barcode", async () => {
    const rows = [
      "barcode,sample",
      "barcode01,sample01",
      "barcode02a,sample02",
      "barcode03,sample03"
    ];
    expect(await validateSamplesFile(joinRows(rows))).toStrictEqual({
      success: false, message: "Invalid barcode: barcode02a"
    });
  });
  // error if 0 rows
  // TEST TRANSLATIONS
});
