import { join } from "node:path";
import { describe, expect, test, beforeAll } from "vitest";
import { PiranhaRunner } from "../../src/index.js";

describe("piranhaRunner", () => {
    test("can pull docker image", async () => {
        const runner = new PiranhaRunner();
        await runner.pullPiranhaImage();
    }, 60_000);

    test("can run docker image", async () => {
        const runner = new PiranhaRunner();
        const testDataPath = join(__dirname, "../../test-data");
        await runner.runPiranha({
            runPath: testDataPath,
            basecalledPath: join(testDataPath, "demultiplexed"),
            outputPath: join(__dirname, "../../test-results"),
            positiveControl: "Pos1,P2",
            negativeControl: "my negative control",
            threads: 1
        });
    }, 300_000); // This will take a while!
});