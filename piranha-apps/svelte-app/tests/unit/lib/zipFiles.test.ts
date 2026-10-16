import { describe, expect, test, vi} from "vitest";
import JSZip from "jszip";
import zipFiles from "../../../src/lib/zipFiles";

const setWebKitRelativePath = (file: File, value: string) => {
  Object.defineProperty(file, "webkitRelativePath", {
    writable: false,
    value: value
  });
};

describe("zipFiles", () => {
  test("generates expected zip blob", async () => {
    // create files with webkitRelativePath set
    const file1 = new File(["test content"], "file1.txt", { type: "text/plain" });
    setWebKitRelativePath(file1, "testFolder/file1.txt");

    const file2 = new File(["more test content"], "file1.txt", { type: "text/plain" });
    setWebKitRelativePath(file2, "testFolder/file2.txt");

    const fileInSubfolder = new File(["nested test content"], "file3.txt", { type: "text/plain" });
    setWebKitRelativePath(fileInSubfolder, "testFolder/subFolder/file3.txt");

    const result = await zipFiles([file1, file2, fileInSubfolder] as any);

    // use JSZip loadAsync to examine content of returned zip
    const unzip = new JSZip();
    const loaded = await unzip.loadAsync(result);

    const loadedFile1 = loaded.folder("testFolder/").file("file1.txt");
    expect(await loadedFile1.async("string")).toBe("test content");
    const loadedFile2 = loaded.folder("testFolder/").file("file2.txt");
    expect(await loadedFile2.async("string")).toBe("more test content")
    const loadedFile3 = loaded.folder("testFolder/subFolder/").file("file3.txt");
    expect(await loadedFile3.async("string")).toBe("nested test content");
  });
});
