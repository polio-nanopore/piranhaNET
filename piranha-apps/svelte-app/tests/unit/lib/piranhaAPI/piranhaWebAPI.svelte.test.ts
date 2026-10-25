import { describe, expect, test, vi } from "vitest";
import { PiranhaWebAPI } from "../../../../src/lib/piranhaAPI/piranhaWebAPI.svelte.js";
import zipFiles from "../../../../src/lib/zipFiles";

vi.mock(
  "../../../../src/lib/zipFiles",
  () => ({
    default: vi
      .fn()
      .mockResolvedValue(new Blob(["test zip"], { type: "application/zip" })),
  }),
  { hoisted: true },
);

const testOptions = {
  runName: "Test Name",
  analysisThreads: 10,
  lang: "en",
} as any;

const testBarcodesFile = new File(["test barcodes content"], "barcodes.csv", {
  type: "text/plain",
});

const testMinknowFileList = [
  new File(["AAAA"], "file1.fastq"),
  new File(["TTTT"], "file2.fastq"),
] as any;

const runResponseHeaders = new Headers([["piranhanet-run-id", "testrun-123"]]);

describe("piranhaWebAPI", () => {
  test("gets API versions", async () => {
    const mockJson = {
      api: "1.0.0",
      piranha: "2.0.0"
    };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => mockJson
    } as any;

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);
    const sut = new PiranhaWebAPI("http://test");
    const result = await sut.getAPIVersions();
    expect(result).toBe(mockJson);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "http://test/versions"
    );

  });

  test("posts to run endpoint on run, and records log", async () => {
    const responseLog = [
      "Piranha run started...",
      "Piranha run completed with exit code 0",
    ];
    const mockStreamData = responseLog.join("\n");
    const mockReadableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(mockStreamData));
        controller.close();
      },
    });

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: runResponseHeaders,
      body: mockReadableStream,
    } as any;

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const sut = new PiranhaWebAPI("http://test");
    const runPromise = sut.runPiranha(
      testOptions,
      testBarcodesFile,
      testMinknowFileList,
    );
    expect(sut.running).toBe(true);
    expect(sut.runSucceeded).toBe(false);
    await runPromise;
    expect(sut.running).toBe(false);
    expect(sut.runSucceeded).toBe(true);

    expect(sut.error).toBeNull();
    expect(sut["_runId"]).toBe("testrun-123");
    expect(zipFiles).toHaveBeenCalledWith(testMinknowFileList);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "http://test/run?runName=Test+Name&analysisThreads=10&lang=English",
    );
    const formData = options.body as FormData;
    expect(formData.get("barcodesFile").name).toBe("barcodes.csv");
    expect(await formData.get("barcodesFile").text()).toBe(
      "test barcodes content",
    );
    expect(formData.get("minknowZip").type).toBe("application/zip");
    expect(await formData.get("minknowZip").text()).toBe("test zip");

    expect(sut.log).toStrictEqual([
      "Zipping MinKnow folder",
      "Running Piranha...",
      "Piranha run started...",
      "Piranha run completed with exit code 0",
      "Piranha run finished",
    ]);
  });

  test("clears run", () => {
    const sut = new PiranhaWebAPI("http://test");
    sut["_runId"] = "testrun-123";
    sut["_error"] = { messageKey: "testKey", detail: "test detail" };
    sut.log.push("testmessage");

    sut.clearRun();

    expect(sut["_runId"]).toBeNull();
    expect(sut.error).toBeNull();
    expect(sut.log.length).toBe(0);
  });

  test("runPiranha sets error if run response has error status", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Server Error",
      headers: runResponseHeaders,
    } as any;

    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const sut = new PiranhaWebAPI("http://test");
    const runPromise = sut.runPiranha(
      testOptions,
      testBarcodesFile,
      testMinknowFileList,
    );
    expect(sut.running).toBe(true);
    await runPromise;
    expect(sut.running).toBe(false);
    expect(sut.runSucceeded).toBe(false);

    expect(sut.error).toStrictEqual({
      messageKey: "runError",
      detail: "500: Server Error.",
    });
  });

  test("runPiranha sets error if response body is not readable", async () => {
    const mockResponse = {
      ok: true,
      status: 500,
      statusText: "Server Error",
      headers: runResponseHeaders,
    } as any;

    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const sut = new PiranhaWebAPI("http://test");
    const runPromise = sut.runPiranha(
      testOptions,
      testBarcodesFile,
      testMinknowFileList,
    );
    expect(sut.running).toBe(true);
    await runPromise;
    expect(sut.running).toBe(false);
    expect(sut.runSucceeded).toBe(false);

    expect(sut.error).toStrictEqual({
      messageKey: "runError",
      detail: "Response body is not readable.",
    });
  });

  const prepSutForDownload = (sut): void => {
    // Fake the prerequisites for the sut to attempt download
    sut["_runId"] = "testrun-123";
    sut.log.push("Piranha run completed with exit code 0");
    sut.log.push("Piranha run finished");
  };

  test("downloadZipFile downloads blob from endpoint response", async () => {
    const mockBlob = new Blob(["test blob"], { type: "application/zip" });
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers([
        ["Content-Disposition", 'attachment; filename="results_123.zip"'],
      ]),
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as any;
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

    // avoid jsdom error because navigation not allowed
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, "createElement");
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    const sut = new PiranhaWebAPI("http://test");
    prepSutForDownload(sut);

    await sut.downloadOutputZip();
    expect(sut.error).toBeNull();

    expect(fetchSpy).toHaveBeenCalledWith("http://test/results/testrun-123");

    expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    const tempLink = createElementSpy.mock.results[0].value;

    expect(tempLink.href).toBe("blob:mock-url");
    expect(tempLink.download).toBe("results_123.zip");

    expect(appendChildSpy).toHaveBeenCalledWith(tempLink);
    expect(tempLink.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(tempLink);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  test("downloadZipfile sets error if no run id", async () => {
    const sut = new PiranhaWebAPI("http://test");
    prepSutForDownload(sut); // provide log
    sut["_runId"] = null;
    await sut.downloadOutputZip();
    expect(sut.error).toStrictEqual({
      messageKey: "downloadError",
      detail: "Cannot download results - Piranha has not run.",
    });
  });

  test("downloadZipfile sets error if run not succeeded", async () => {
    const sut = new PiranhaWebAPI("http://test");
    sut["_runId"] = "testrun-123";
    sut.log.push("oh dear");
    sut.log.push("run failed");
    await sut.downloadOutputZip();
    expect(sut.error).toStrictEqual({
      messageKey: "downloadError",
      detail: "Cannot download results - Piranha has not run.",
    });
  });

  test("downloadZipfile sets error if download response has error status", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as any;
    vi.spyOn(global, "fetch").mockResolvedValue(mockResponse);

    const sut = new PiranhaWebAPI("http://test");
    prepSutForDownload(sut);
    await sut.downloadOutputZip();
    expect(sut.error).toStrictEqual({
      messageKey: "downloadError",
      detail: "400: Bad Request.",
    });
  });
});
