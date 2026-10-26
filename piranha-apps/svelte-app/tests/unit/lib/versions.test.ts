import {describe, test, expect} from "vitest";
import getVersions from "../../../src/lib/versions";
import {initialiseStore} from "../../../src/lib/store.svelte";
import {mockPiranhaAPI} from "../MockPiranhaAPI.svelte";
import pkg from "../../../../package.json";

describe("versions", () => {
  test("check package", () => {
    expect(pkg.version.length).toBeGreaterThan(4);
    expect(pkg.piranhaVersion.length).toBeGreaterThan(4);
  });

  test("in web mode", async () => {
    initialiseStore("web", "http://test");
    await mockPiranhaAPI({
      apiVersions: {api: "1.0.0", piranha: "2.0.0"}
    });

    const result = await getVersions();
    expect(result.piranha).toBe("2.0.0");
    expect(result.piranhaNetApi).toBe("1.0.0");
    expect(result.piranhaNetWeb).toBe(pkg.version);
  });

  test("in electron mode", async () => {
    initialiseStore("electron");
    const result = await getVersions();
    expect(result.piranha).toBe(pkg.piranhaVersion);
    expect(result.piranhaNet).toBe(pkg.version);
  })
});
