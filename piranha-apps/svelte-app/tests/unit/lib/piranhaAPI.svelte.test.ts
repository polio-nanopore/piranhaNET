import { describe, expect, test, vi, beforeEach } from "vitest";
import { i18n } from "../../../src/lib/i18n.svelte";
import { PiranhaAPI } from "../../../src/lib/piranhaAPI.svelte.js";

describe("piranhaAPI", () => {
  let sut;
  beforeEach(() => {
    i18n.lang = "en";
    window.api = {
      onInitialized: vi.fn(),
      onChunk: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
      onRunCancelled: vi.fn(),
      runPiranha: vi.fn().mockImplementation(async () => "123"),
      cancelRun: vi.fn(),
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

    await sut.runPiranha(testOptions);

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
    expect(sut.error).toBe(null);
    const setError = window.api.onError.mock.calls[0][0];
    setError("runError", "something went wrong");
    expect(sut.error).toStrictEqual({
      messageKey: "runError",
      detail: "something went wrong",
    });
    expect(sut.log).toStrictEqual([
      "\x1b[1;31mPiranha Run Error: something went wrong",
    ]);
  })

  test("runPiranha calls api", async () => {
    expect(sut.running).toBe(false);
    sut.log.push("Earlier run message");
    await sut.runPiranha(testOptions);
    expect(window.api.runPiranha).toHaveBeenCalledWith(testOptions);
    expect(sut.log).toStrictEqual([]);
    expect(sut.running).toBe(true);

    // Running should be set to false on end
    const end = window.api.onEnd.mock.calls[0][0];
    await end();
    expect(sut.running).toBe(false);
  });

  test("cancelRun and onRunCancelled set expected values", async () => {
    await sut.runPiranha(testOptions);
    sut.cancelRun();
    expect(sut.cancelling).toBe(true);
    expect(window.api.cancelRun).toHaveBeenCalledWith("123");
    const cancelled = window.api.onRunCancelled.mock.calls[0][0];
    await cancelled();
    expect(sut.cancelling).toBe(false);
    expect(sut.running).toBe(false);
    expect(sut.error).toStrictEqual({messageKey: "runCancelled", detail: ""});
    expect(sut.log).toContain("\x1b[1;31mRun cancelled by user");
  });

  test("runPiranha throws error if already running", async () => {
    await sut.runPiranha(testOptions);
    await expect(sut.runPiranha(testOptions)).rejects.toThrow(
      "Piranha is already running",
    );
  });

  test("clears run", () => {
    sut.log.push("log msg 1");
    sut.log.push("log msg 2");
    const setError = window.api.onError.mock.calls[0][0];
    setError("initErrorGuidanceWindows", "something went wrong");
    expect(sut.error).toStrictEqual({
      messageKey: "initErrorGuidanceWindows",
      detail: "something went wrong",
    });
    expect(sut.log.length).toBe(3);
    sut.clearRun();
    expect(sut.log.length).toBe(0);
    expect(sut.error).toBe(null);
  });
});
