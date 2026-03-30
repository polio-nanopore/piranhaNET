import { describe, expect, test, vi } from "vitest";
import * as paraglide from "../../../../src/paraglide/runtime";
import { i18n } from "../../../../src/renderer/src/lib/i18n.svelte";

const { setItemSpy } = vi.hoisted(() => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => "fr");
  return {
    setItemSpy: vi.spyOn(Storage.prototype, "setItem")
  };
});

const setLocaleSpy = vi.spyOn(paraglide, "setLocale");

describe("i18n", () => {
  test("initialises from local storage", () => {
    expect(i18n.lang).toBe("fr");
  });

  test("lang update sets local storage and paraglide locale", () => {
    i18n.lang = "pt";
    expect(i18n.lang).toBe("pt");
    expect(setItemSpy).toHaveBeenCalledWith("lang", "pt");
    expect(setLocaleSpy).toHaveBeenCalledWith("pt", { reload: false });
  });

  test("throws error when set nonexistent language", () => {
    expect(() => (i18n.lang = "zz")).toThrow("Unknown language");
  });

  test("can get all languages", () => {
    expect(i18n.allLanguages).toStrictEqual(["en", "fr", "pt"]);
  });
});
