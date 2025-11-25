/**
 * Centralized game constants
 * All magic numbers and configuration values should be defined here
 */

/**
 * Combat-related constants
 */
export const COMBAT = {
  /** Time between space key attacks in seconds (150ms) */
  SPACE_ATTACK_RATE: 0.15,
  /** Damage batch application interval in seconds */
  DAMAGE_BATCH_INTERVAL: 0.075,
  /** Flash duration when entity takes damage */
  FLASH_DURATION: 0.15,
  /** Break animation duration when entity dies */
  BREAK_ANIMATION_DURATION: 0.4,
  /** Deformation animation duration */
  DEFORMATION_DURATION: 0.15,
} as const;

/**
 * Frame-based timing intervals for throttling expensive operations
 */
export const FRAME_INTERVALS = {
  /** Update boss timer every N frames */
  BOSS_TIMER_UPDATE: 3,
  /** Check achievements every N frames (~1 second at 60fps) */
  ACHIEVEMENT_CHECK: 60,
  /** Update HUD stats every N frames (~2 times per second at 60fps) */
  HUD_STATS_UPDATE: 30,
  /** Recalculate beam damage every N frames (~1s at 120fps) */
  BEAM_RECALC: 120,
} as const;

/**
 * Save system constants
 */
export const SAVE = {
  /** Auto-save interval in seconds */
  AUTO_SAVE_INTERVAL: 3,
  /** LocalStorage key for save data */
  STORAGE_KEY: 'alien-clicker-save',
  /** LocalStorage key for user settings */
  SETTINGS_KEY: 'alien-clicker-settings',
} as const;

/**
 * Auto-buy system constants
 */
export const AUTO_BUY = {
  /** Check interval in seconds */
  CHECK_INTERVAL: 0.5,
} as const;

/**
 * Boss battle constants
 */
export const BOSS = {
  /** Transition duration when entering/exiting boss mode */
  TRANSITION_DURATION: 2,
  /** XP penalty percentage when boss escapes (0.2 = 20%) */
  ESCAPE_XP_PENALTY: 0.2,
  /** Boss levels occur every N levels */
  LEVEL_INTERVAL: 5,
} as const;

/**
 * Combo pause skill constants
 */
export const COMBO_PAUSE = {
  /** Active duration in seconds (15 minutes) */
  DURATION: 15 * 60,
  /** Cooldown duration in seconds (1 hour) */
  COOLDOWN: 60 * 60,
} as const;

/**
 * UI update throttling
 */
export const UI_THROTTLE = {
  /** Store notification interval in ms */
  STORE_NOTIFICATION_INTERVAL: 30,
  /** Shop update throttle in ms */
  SHOP_UPDATE_INTERVAL: 30,
  /** Title update interval in seconds */
  TITLE_UPDATE_INTERVAL: 1,
} as const;

/**
 * Visual effect constants
 */
export const VISUAL = {
  /** Particle system default max particles */
  DEFAULT_MAX_PARTICLES: 500,
  /** Alien speech bubble show delay in seconds */
  SPEECH_BUBBLE_DELAY: 15,
  /** Alien speech bubble duration in seconds */
  SPEECH_BUBBLE_DURATION: 8,
  /** Alien speech bubble cooldown in seconds */
  SPEECH_BUBBLE_COOLDOWN: 30,
  /** Chance for alien to speak (0-1) */
  SPEECH_BUBBLE_CHANCE: 0.15,
} as const;

/**
 * God Mode (debug autopilot) constants
 */
export const GOD_MODE = {
  CLICK_INTERVAL: { min: 0.08, max: 0.22 },
  BURST_CHANCE: 0.18,
  BURST_COOLDOWN: { min: 4.2, max: 7.5 },
  JITTER_RADIUS: 28,
  UPGRADE_INTERVAL: { min: 0.8, max: 1.8 },
  POWER_UP_REACTION: { min: 0.12, max: 0.35 },
  METRICS_INTERVAL: 1,
  LOG_INTERVAL: { min: 14, max: 22 },
  BREAK_INTERVAL: { min: 20, max: 45 },
  BREAK_DURATION: { min: 1.4, max: 3.3 },
  BOSS_CHECK_INTERVAL: { min: 0.15, max: 0.35 },
  BOSS_RETRY_DELAY: 300,
  COMBO_CAP_MULTIPLIER: 3,
} as const;

/**
 * Performance mode presets
 */
export const PERFORMANCE_MODES = {
  low: {
    maxParticles: 100,
    particleMultiplier: 0.3,
    showDamageNumbers: false,
    showShipLasers: false,
  },
  medium: {
    maxParticles: 300,
    particleMultiplier: 0.6,
    showDamageNumbers: true,
    showShipLasers: true,
  },
  high: {
    maxParticles: 500,
    particleMultiplier: 1.0,
    showDamageNumbers: true,
    showShipLasers: true,
  },
} as const;

/**
 * Keyboard shortcuts
 */
export const HOTKEYS = {
  ACHIEVEMENTS: 'h',
  SETTINGS: 's',
  AUTO_BUY: 'a',
  DEBUG_PANEL: '`',
} as const;

