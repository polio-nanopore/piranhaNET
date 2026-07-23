import { describe, expect, test, vi, beforeEach } from "vitest";
import { PiranhaAPI } from "../../../src/lib/piranhaAPI.svelte.js";

describe("piranhaAPI", () => {
  let sut;
  beforeEach(() => {
    window.api = {
      onInitialized: vi.fn(),
      onChunk: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
      runPiranha: vi.fn(),
      openRunReport: vi.fn(),
      openRunOutputFolder: vi.fn(),
    };
    sut = new PiranhaAPI();
  });

  const testOptions = {
    outputFolderPath: "/test/output",
  } as any;

  test("constructor sets expected handlers", async () => {
    expect(sut.initialized).toBe(false);

    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();
    expect(sut.initialized).toBe(true);

    sut.runPiranha(testOptions);

    // Stream chunk and end messages are added to log
    expect(sut.log).toStrictEqual([]);
    const addChunk = window.api.onChunk.mock.calls[0][0];
    const encoder = new TextEncoder("utf-8");
    // Should split on newlines
    const expectedLog = [
      "test log message 1",
      "test log message 2",
      "Generated: /data/run_data/output/output_1/report.html",
    ];
    addChunk(encoder.encode(expectedLog.join("\n")));

    expect(sut.log).toStrictEqual(expectedLog);
    expect(sut.runSucceeded).toBe(false);

    const end = window.api.onEnd.mock.calls[0][0];
    await end();
    expect(sut.log).toStrictEqual([...expectedLog, "Piranha Run Finished"]);

    //On end, the API should have set the output folder, so runSucceeded should be true...
    expect(sut.runSucceeded).toBe(true);

    //.. and the output folder will be used in open output calls
    await sut.openRunReport();
    expect(window.api.openRunReport).toHaveBeenCalledWith(
      "/test/output",
      "output_1",
    );
    await sut.openRunOutputFolder();
    expect(window.api.openRunOutputFolder).toHaveBeenCalledWith(
      "/test/output",
      "output_1",
    );

    sut.clearRun();
    expect(sut.error).toBe("");
    const setError = window.api.onError.mock.calls[0][0];
    setError("New Test Error", "something went wrong");
    expect(sut.error).toBe("New Test Error");
    expect(sut.log).toStrictEqual([
      "\x1b[1;31mNew Test Error: something went wrong",
    ]);
  });

  test("runPiranha calls api", async () => {
    expect(sut.running).toBe(false);
    sut.log.push("Earlier run message");
    sut.runPiranha(testOptions);
    expect(window.api.runPiranha).toHaveBeenCalledWith(testOptions);
    expect(sut.log).toStrictEqual([]);
    expect(sut.running).toBe(true);

    // Running should be set to false on end
    const end = window.api.onEnd.mock.calls[0][0];
    await end();
    expect(sut.running).toBe(false);
  });

  test("runPiranha throws error if already running", () => {
    sut.runPiranha(testOptions);
    expect(() => sut.runPiranha(testOptions)).toThrow(
      "Piranha is already running",
    );
  });

  test("clears run", () => {
    sut.log.push("log msg 1");
    sut.log.push("log msg 2");
    const setError = window.api.onError.mock.calls[0][0];
    setError("New Test Error", "something went wrong");
    expect(sut.error).toBe("New Test Error");
    expect(sut.log.length).toBe(3);
    sut.clearRun();
    expect(sut.log.length).toBe(0);
    expect(sut.error).toBe("");
    expect(sut.options).toBeNull();
    expect(sut.runOutputFolderName).toBe("");
  });
});
