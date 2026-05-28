import { describe, expect, test, beforeEach, vi } from "vitest";
import { persistentSettingsStore } from "$lib/persistentSettingsStore";

describe("persistentSettingsStore", () => {
  const mockSetItem = vi.spyOn(Storage.prototype, "setItem");

  const testUserSettings = {
    userName: "Test User",
    institute: "Test Inst",
    outputFolderPath: "/testOut"
  };

  const testRunSettings = {
    protocol: "isolate",
    positiveControl: "pos",
    negativeControl: "neg",
  };

  test("can save userSettings", () => {
    persistentSettingsStore.saveUserSettings({
      ...testUserSettings,
      someOtherKey: "some value"
    });
    expect(mockSetItem).toHaveBeenCalledWith("userSettings", JSON.stringify(testUserSettings))
  });

  test("can load userSettings", () => {
    const mockGetItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => JSON.stringify(testUserSettings));
    const result = persistentSettingsStore.loadUserSettings();
    expect(result).toStrictEqual(testUserSettings);
    expect(mockGetItem).toHaveBeenCalledWith("userSettings");
  });

  test("returns null on load userSettings if none are stored", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);
    const result = persistentSettingsStore.loadUserSettings();
    expect(result).toBeNull();
  });

  test("can save runSettings", () => {
    persistentSettingsStore.saveRunSettings({
      ...testRunSettings,
      someOtherKey: "some value"
    });
    expect(mockSetItem).toHaveBeenCalledWith("runSettings", JSON.stringify(testRunSettings));
  });

  test("can load runSettings", () => {
    const mockGetItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => JSON.stringify(testRunSettings));
    const result = persistentSettingsStore.loadRunSettings();
    expect(result).toStrictEqual(testRunSettings);
    expect(mockGetItem).toHaveBeenCalledWith("runSettings");
  });

  test("returns null on load runSettings if none are stored", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);
    const result = persistentSettingsStore.loadRunSettings();
    expect(result).toBeNull();
  });
});
