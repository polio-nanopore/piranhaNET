import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { PiranhaRunner } from "../../../src/main/piranhaRunner";
import { Writable } from "node:stream";
import * as AnsiParser from "ansi-parser";

describe("piranhaRunner", () => {
  const getWritableWithBuffer = (): {
    writable: Writable;
    readBuffer: () => string;
  } => {
    const chunks = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });
    const readBuffer = (): string => Buffer.concat(chunks).toString();
    return { writable, readBuffer };
  };

  const runPiranha = async (
    barcodesFileName = "barcodes.csv",
  ): Promise<string[]> => {
    const runner = new PiranhaRunner();

    const pullOutput = getWritableWithBuffer();
    await runner.pullPiranhaImage(pullOutput.writable);
    let outputText = pullOutput.readBuffer();
    expect(outputText).toContain("Pulling from polionanopore/piranha");

    const runOutput = getWritableWithBuffer();
    const testDataPath = join(__dirname, "../../../../../test-data");
    const testOutputPath = join(__dirname, "../../../../../test-results");

    console.log(`testDataPath is ${testDataPath}`);
    console.log(`testOutputPath is ${testOutputPath}`);

    try {
      await runner.runPiranha(
        {
          name: "test_name",
          notes: "test notes",
          barcodesFilePath: join(testDataPath, barcodesFileName),
          minKnowFolderPath: join(testDataPath, "demultiplexed"),
          outputFolderPath: testOutputPath,
          threads: 10,
          //run settings
          positiveControl: "pos",
          negativeControl: "neg",
          protocol: "stool",
          //piranha output settings
          orientation: "horizontal",
          outputPrefix: "testOut",
          overwriteOutput: true,
          outputIntermediateFiles: true,
          allMetadataToHeader: true,
          dateStamp: true,
          //user settings
          institute: "Test Institute",
          userName: "Test User",
          lang: "fr"
        },
        runOutput.writable,
      );
    } catch (e) {
      console.log("Error during Piranha Run test, dumping log:");
      console.log(runOutput.readBuffer());
      throw e;
    }

    outputText = runOutput.readBuffer();

    outputText = AnsiParser.removeAnsi(outputText);
    return outputText;
  };

  test("can pull and run docker image", async () => {
    const outputText = await runPiranha();
    expect(outputText).toContain("Poliovirus Investigation Resource"); //starts run
    expect(outputText).toContain("Setting runname: test_name");
    expect(outputText).toContain("Setting notes: test_notes");
    // run settings
    expect(outputText).toContain("Setting positive_control: pos");
    expect(outputText).toContain("Setting negative_control: neg");
    // piranha output settings
    expect(outputText).toContain("Setting overwrite: True");
    expect(outputText).toContain("Setting no_temp: True");
    expect(outputText).toContain("Setting all_metadata_to_header: True");
    expect(outputText).toContain("Setting datestamp: True");
    // user settings
    expect(outputText).toContain("Setting username: Test_User");
    expect(outputText).toContain("Setting institute: Test_Institute");
    expect(outputText).toContain("Setting language: French");
    expect(outputText).toMatch(
      /Generating: \/data\/run_data\/output\/piranha_output_\d{4}-\d{2}-\d{2}\/report.html/,
    ); //output report
  }, 480_000); // This will take a while!

  test("throws error if piranha run finishes with non-zero exit code", async () => {
    await expect(runPiranha("badBarcodes.csv")).rejects.toThrow(
      "Piranha finished with non-zero exit code 255",
    );
  }, 30_000);
});
