import { describe, expect, test, vi, beforeEach } from "vitest";
import { PiranhaAPI } from "../../../../src/renderer/src/lib/piranhaAPI.svelte";

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
    addChunk(encoder.encode("test log message"));
    expect(sut.log).toStrictEqual(["test log message"]);

    const end = window.api.onEnd.mock.calls[0][0];
    end();
    expect(sut.log).toStrictEqual(["test log message", "Piranha Run Finished"]);

    expect(sut.error).toBe("");
    const setError = window.api.onError.mock.calls[0][0];
    setError("New Test Error");
    expect(sut.error).toBe("New Test Error");

    expect(window.api.runPiranha).not.toHaveBeenCalled();
    expect(window.api.testMessage).not.toHaveBeenCalled();
  });

  test("runPiranha calls api", () => {
    expect(sut.running).toBe(false);
    sut.log.push("Earlier run message");
    sut.runPiranha();
    expect(window.api.runPiranha).toHaveBeenCalled();
    expect(sut.log).toStrictEqual([]);
    expect(sut.running).toBe(true);

    // Running should be set to false on end
    const end = window.api.onEnd.mock.calls[0][0];
    end();
    expect(sut.running).toBe(false);
  });

  test("testMessageMain calls api", () => {
    expect(window.api.testMessage).not.toHaveBeenCalled();
    sut.testMessageMain();
    expect(window.api.testMessage).toHaveBeenCalled();
  });
});
