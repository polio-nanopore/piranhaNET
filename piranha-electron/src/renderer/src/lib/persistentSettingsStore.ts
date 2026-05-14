import type { PersistentSettings } from "../types";

const KEY = "persistentSettings";
export class PersistentSettingsStore {
  loadSettings(): PersistentSettings | null {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
  }

  saveSettings(settings: PersistentSettings) {
    // TODO: tidy this up
    // Don't save any extraneous values
    const stored: PersistentSettings = {
      userName: settings.userName,
      institute: settings.institute,
      outputFolderPath: settings.outputFolderPath,
    };
    localStorage.setItem(KEY, JSON.stringify(stored));
  }
}

export const persistentSettingStore = new PersistentSettingsStore();
