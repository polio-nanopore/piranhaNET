import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { PiranhaRunner } from "../../src/index.js";
import {Writable} from "node:stream";

describe("piranhaRunner", () => {
    const getWritableWithBuffer = () => {
        const chunks = [];
        const writable = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });
        const readBuffer = () => Buffer.concat(chunks).toString();
        return {writable, readBuffer};
    };

    test("can pull and run docker image", async () => {
        const runner = new PiranhaRunner();

        const pullOutput = getWritableWithBuffer();
        await runner.pullPiranhaImage(pullOutput.writable);
        let outputText = pullOutput.readBuffer();
        expect(outputText).toContain("Pulling from polionanopore/piranha");

        const runOutput = getWritableWithBuffer();
        const testDataPath = join(__dirname, "../../test-data");
        await runner.runPiranha({
            runPath: testDataPath,
            basecalledPath: join(testDataPath, "demultiplexed"),
            outputPath: join(__dirname, "../../test-results"),
            positiveControl: "Pos1,P2",
            negativeControl: "my negative control",
            threads: 1
        }, runOutput.writable);

        outputText = runOutput.readBuffer();
        expect(outputText).toContain("Poliovirus Investigation Resource"); //starts run
        expect(outputText).toMatch(/\/data\/run_data\/output\/piranha_output_\d+\/report\.html/); //output report

    }, 300_000); // This will take a while!
});