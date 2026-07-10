import { describe, expect, test, vi, beforeEach } from "vitest";
import { PiranhaAPI } from "../../src/lib/piranhaAPI.svelte.js";

describe("piranhaAPI", () => {
  let sut;
  beforeEach(() => {
    window.api = {
      onInitialized: vi.fn(),
      onChunk: vi.fn(),
      onEnd: vi.fn(),
      onError: vi.fn(),
      runPiranha: vi.fn(),
      testMessage: vi.fn(),
    };
    sut = new PiranhaAPI();
  });

  test("constructor sets expected handlers", () => {
    expect(sut.initialized).toBe(false);

    const initialize = window.api.onInitialized.mock.calls[0][0];
    initialize();
    expect(sut.initialized).toBe(true);

    // Stream chunk and end messages are added to log
    expect(sut.log).toStrictEqual([]);
    const addChunk = window.api.onChunk.mock.calls[0][0];
    const encoder = new TextEncoder("utf-8");
    // Should split on newlines
    addChunk(encoder.encode("test log message 1\ntest log message 2"));
    const expectedLog = ["test log message 1", "test log message 2"];
    expect(sut.log).toStrictEqual(expectedLog);

    const end = window.api.onEnd.mock.calls[0][0];
    end();
    expect(sut.log).toStrictEqual([...expectedLog, "Piranha Run Finished"]);

    expect(sut.error).toBe("");
    const setError = window.api.onError.mock.calls[0][0];
    setError("New Test Error", "something went wrong");
    expect(sut.error).toBe("New Test Error");
    expect(sut.log).toStrictEqual(["\x1b[1;31mNew Test Error: something went wrong"]);

    expect(window.api.runPiranha).not.toHaveBeenCalled();
    expect(window.api.testMessage).not.toHaveBeenCalled();
  });

  test("runPiranha calls api", () => {
    expect(sut.running).toBe(false);
    sut.log.push("Earlier run message");
    const testOptions = { test: "value" } as any;
    sut.runPiranha(testOptions);
    expect(window.api.runPiranha).toHaveBeenCalledWith(testOptions);
    expect(sut.log).toStrictEqual([]);
    expect(sut.running).toBe(true);

    // Running should be set to false on end
    const end = window.api.onEnd.mock.calls[0][0];
    end();
    expect(sut.running).toBe(false);
  });

  test("runPiranha throws error if already running", () => {
    const testOptions = { test: "value" } as any;
    sut.runPiranha(testOptions);
    expect(() => sut.runPiranha(testOptions)).toThrow(
      "Piranha is already running",
    );
  });

  test("clears log", () => {
    expect(window.api.testMessage).not.toHaveBeenCalled();
    sut.log.push("log msg 1");
    sut.log.push("log msg 2");
    sut.error = "TEST ERROR";
    expect(sut.log.length).toBe(2);
    sut.clearLog();
    expect(sut.log.length).toBe(0);
    expect(sut.error).toBe("");
  });
});
