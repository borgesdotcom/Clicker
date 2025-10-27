export interface UserSettings {
  soundEnabled: boolean;
  volume: number;
  highGraphics: boolean;
  showShipLasers: boolean;
  showRipples: boolean;
  showDamageNumbers: boolean;
}

// Partial type for loading from storage
type PartialUserSettings = Partial<UserSettings>;

const SETTINGS_KEY = 'alien-clicker-settings';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Settings {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  static save(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static load(): UserSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const data = JSON.parse(saved) as PartialUserSettings;
        return {
          soundEnabled: data.soundEnabled ?? true,
          volume: data.volume ?? 0.3,
          highGraphics: data.highGraphics ?? true,
          showShipLasers: data.showShipLasers ?? true,
          showRipples: data.showRipples ?? true,
          showDamageNumbers: data.showDamageNumbers ?? true,
        };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return Settings.getDefault();
  }

  static getDefault(): UserSettings {
    return {
      soundEnabled: true,
      volume: 0.3,
      highGraphics: true,
      showShipLasers: true,
      showRipples: true,
      showDamageNumbers: true,
    };
  }
}
