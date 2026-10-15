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
    console.log("FILES")
    console.log(loaded.files)
    // TODO: test expected file paths and content - use above log for this
  });
});
