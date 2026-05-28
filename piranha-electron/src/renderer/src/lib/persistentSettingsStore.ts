import type { UserSettings, RunSettings } from "../types";

const USER_SETTINGS_KEY = "userSettings";
const RUN_SETTINGS_KEY = "runSettings";
export class PersistentSettingsStore {
  loadUserSettings(): UserSettings | null {
    const stored = localStorage.getItem(USER_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  saveUserSettings(settings: UserSettings): void {
    // Don't save any extraneous values
    const { userName, institute, outputFolderPath } = settings;
    localStorage.setItem(
      USER_SETTINGS_KEY,
      JSON.stringify({ userName, institute, outputFolderPath }),
    );
  }

  loadRunSettings(): RunSettings | null {
    const stored = localStorage.getItem(RUN_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  saveRunSettings(settings: RunSettings): void{
    // Don't save any extraneous values
    const { protocol, positiveControl, negativeControl } = settings;
    localStorage.setItem(
      RUN_SETTINGS_KEY,
      JSON.stringify({ protocol, positiveControl, negativeControl }),
    );
  }
}

export const persistentSettingsStore = new PersistentSettingsStore();
