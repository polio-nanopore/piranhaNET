import { describe, test, expect } from "vitest";
import {validateSamplesFile} from "../../../src/lib/validation";
import {i18n} from "$lib/i18n.svelte";

const joinRows = (rows: string[]): void => rows.join("\n");

const expectSuccess = (samplesFileRows: string[]): void => {
  expect(validateSamplesFile(joinRows(samplesFileRows))).toStrictEqual({success: true});
};

const expectError = (samplesFileRows: string[], expectedErrorTranslations: {en: string, fr: string, pt: string}): void => {
  for (const lang of Object.keys(expectedErrorTranslations)) {
    i18n.lang = lang;
    expect(validateSamplesFile(joinRows(samplesFileRows))).toStrictEqual({
      success: false,
      message: expectedErrorTranslations[lang]
    });
  }
};

describe("validateSamplesFile", () => {
  test("passes a valid file", () => {
    expectSuccess( [
      "barcode,sample",
      "barcode01,sample01",
      "barcode02,sample02",
      "barcode03,sample03"
    ]);
  });

  test("accepts additional columns", () => {
    expectSuccess([
      "barcode,sample,extra",
      "barcode01,sample01,extra1",
      "barcode02,sample02,extra2",
      "barcode03,sample03,extra3"
    ]);
  });

  test("errors on invalid csv", () => {
    expectError([
        "barcode,sample",
        "csv,with,,",
        "bad,data"
      ],
      {
        en: "Row 1 is invalid. Too many fields: expected 2 fields but parsed 4",
        fr: "La ligne 1 est invalide. Too many fields: expected 2 fields but parsed 4",
        pt: "A linha 1 é inválida. Too many fields: expected 2 fields but parsed 4"
      });
  });

  test("errors if missing value", () => {
    expectError([
        "barcode,sample",
        "barcode01,sample01",
        "barcode02,sample02",
        ",sample03"
      ], {
        en: "File contains missing barcodes or samples",
        fr: "Le fichier contient des codes-barres ou des échantillons manquants",
        pt: "O ficheiro contém códigos de barras ou amostras em falta"
      });
  });

  test("errors if missing column", () => {
    expectError([
      "barcode",
      "barcode01",
      "barcode02",
      "barcode03"
    ], {
      en: "File is missing required columns: sample",
      fr: "Le fichier ne contient pas les colonnes obligatoires suivantes : sample",
      pt: "O ficheiro não tem as colunas obrigatórias: sample"
    });
  });

  test("errors if file contains whitespace", () => {
    expectError([
      "barcode,sample",
      "barcode01, sample01"
    ], {
      en: "File must not contain space characters",
      fr: "Le fichier ne doit pas contenir d'espaces",
      pt: "O ficheiro não deve conter espaços em branco"
    });
  });

  test("errors if file contains invalid chars", () => {
   expectError([
     "barcode,sample",
     "\"barcode01,sample01",
     "barcode02,sample02"
   ], {
     en: "File contains invalid character: \"",
     fr: "Le fichier contient un caractère non valide : \"",
     pt: "O ficheiro contém um caractere inválido: \""
   });

    expectError([
      "barcode,sample","*",
      "barcode01,sample01"
    ], {
      en: "File contains invalid character: *",
      fr: "Le fichier contient un caractère non valide : *",
      pt: "O ficheiro contém um caractere inválido: *"
    });
 });

 test("errors on invalid barcode", () => {
    expectError([
      "barcode,sample",
      "barcode01,sample01",
      "barcode02a,sample02",
      "barcode03,sample03"
      ], {
      en: "Invalid barcode: barcode02a",
      fr: "Code-barres invalide : barcode02a",
      pt: "Código de barras inválido: barcode02a"
    });
  });

  test("errors if 0 non-header rows", () => {
    expectError([
      "barcode,sample",
    ], {
      en: "File contains 0 rows",
      fr: "Le fichier contient 0 lignes",
      pt: "O ficheiro contém 0 linhas"
    });
  });

  test("errors if empty file", () => {
    expectError([], {
      en: "File is missing required columns: sample, barcode",
      fr: "Le fichier ne contient pas les colonnes obligatoires suivantes : sample, barcode",
      pt: "O ficheiro não tem as colunas obrigatórias: sample, barcode"
    });
  });
});
