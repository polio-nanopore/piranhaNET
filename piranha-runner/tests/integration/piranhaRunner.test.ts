import { describe, expect, test, beforeAll } from "vitest";
import { PiranhaRunner } from "../../src/index.js";

describe("piranhaRunner", () => {
    test("can pull docker container", async () => {
        const runner = new PiranhaRunner();
        await runner.pullPiranha();
    }, 60_000);
});