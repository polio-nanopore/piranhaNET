import { join } from "node:path";
import { describe, expect, test, beforeAll } from "vitest";
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

    // TODO: combine into one test
    test("can pull docker image", async () => {
        const runner = new PiranhaRunner();
        await runner.pullPiranhaImage();
    }, 60_000);

    test("can run docker image", async () => {
        const runner = new PiranhaRunner();
        const testDataPath = join(__dirname, "../../test-data");

        // Default output stream is stdout, but let's test we
        // can capture to an arbitrary stream
        /*const chunks = [];
        const outputStream = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });*/
        const runOutput = getWritableWithBuffer();

        await runner.runPiranha({
            runPath: testDataPath,
            basecalledPath: join(testDataPath, "demultiplexed"),
            outputPath: join(__dirname, "../../test-results"),
            positiveControl: "Pos1,P2",
            negativeControl: "my negative control",
            threads: 1
        }, runOutput.writable);

        // outputText = Buffer.concat(chunks).toString();
        const outputText = runOutput.readBuffer();
        expect(outputText).toContain("Poliovirus Investigation Resource");
        expect(outputText).toContain(/Generating: \/data\/run_data\/output\/piranha_output_\d+\/report.html/);

    }, 300_000); // This will take a while!
});