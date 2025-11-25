/**
 * Core modules barrel export
 * These are the foundational systems that the game depends on
 */

export { Config } from './GameConfig';
export { i18n, t } from './I18n';
export { Input } from './Input';
export { Loop } from './Loop';
export { Save } from './Save';
export { Settings } from './Settings';
export { Store } from './Store';

// Re-export types from Settings
export type { UserSettings } from './Settings';

