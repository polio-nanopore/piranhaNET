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

  test("can pull and run docker image", async () => {
    const runner = new PiranhaRunner();

    const pullOutput = getWritableWithBuffer();
    await runner.pullPiranhaImage(pullOutput.writable);
    let outputText = pullOutput.readBuffer();
    expect(outputText).toContain("Pulling from polionanopore/piranha");

    const runOutput = getWritableWithBuffer();
    const testDataPath = join(__dirname, "../../../../test-data");
    await runner.runPiranha(
      {
        name: "test_name",
        notes: "test notes",
        barcodesFilePath: join(testDataPath, "barcodes.csv"),
        minKnowFolderPath: join(testDataPath, "demultiplexed"),
        outputFolderPath: join(__dirname, "../../../../test-results"),
        positiveControl: "Pos1,P2",
        negativeControl: "my negative control",
        threads: 10,
      },
      runOutput.writable,
    );

    outputText = runOutput.readBuffer();
    outputText = AnsiParser.removeAnsi(outputText);
    expect(outputText).toContain("Poliovirus Investigation Resource"); //starts run
    expect(outputText).toContain("Setting runname: test_name");
    expect(outputText).toContain("Setting notes: test_notes");
    expect(outputText).toMatch(
      /\/data\/run_data\/output\/piranha_output_?\d*\/report\.html/,
    ); //output report
  }, 300_000); // This will take a while!
});
