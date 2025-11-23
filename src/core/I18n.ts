export type Language = 'en' | 'pt' | 'es' | 'ja';

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}

const LANGUAGE_KEY = 'alien-clicker-language';

export class I18n {
  private static instance: I18n;
  private currentLanguage: Language = 'en';
  private translations: Map<Language, TranslationStrings> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (
      savedLanguage === 'en' ||
      savedLanguage === 'pt' ||
      savedLanguage === 'es' ||
      savedLanguage === 'ja'
    ) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('pt')) {
        this.currentLanguage = 'pt';
      } else if (browserLang.startsWith('es')) {
        this.currentLanguage = 'es';
      } else if (browserLang.startsWith('ja')) {
        this.currentLanguage = 'ja';
      } else {
        this.currentLanguage = 'en';
      }
      // Save detected language to localStorage for persistence
      localStorage.setItem(LANGUAGE_KEY, this.currentLanguage);
    }
  }

  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }

  async loadTranslations(): Promise<void> {
    // Load all translation files
    const [en, pt, es, ja] = await Promise.all([
      import('../i18n/en.json'),
      import('../i18n/pt.json'),
      import('../i18n/es.json'),
      import('../i18n/jp.json'),
    ]);

    this.translations.set('en', en.default);
    this.translations.set('pt', pt.default);
    this.translations.set('es', es.default);
    this.translations.set('ja', ja.default);
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem(LANGUAGE_KEY, language);

    // Update HTML lang attribute
    document.documentElement.lang = language;

    // Notify all listeners
    this.listeners.forEach((listener) => listener());
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);

    if (!params) {
      return translation;
    }

    // Replace parameters in the translation string
    let result = translation;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(
        new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
        String(paramValue),
      );
    }

    return result;
  }

  private getTranslation(key: string): string {
    const keys = key.split('.');
    let current: any = this.translations.get(this.currentLanguage);

    if (!current) {
      // Fallback to English if current language not loaded
      current = this.translations.get('en');
      if (!current) {
        return key; // Return key if no translations loaded
      }
    }

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English
        const enTranslations = this.translations.get('en');
        if (enTranslations) {
          let fallback: any = enTranslations;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return key if not found even in English
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
        return key;
      }
    }

    return typeof current === 'string' ? current : key;
  }
}

// Export singleton instance getter and convenience function
export const i18n = I18n.getInstance();
export const t = (key: string, params?: Record<string, string | number>) =>
  i18n.t(key, params);
