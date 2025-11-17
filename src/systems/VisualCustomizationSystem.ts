import type { GameState, ThemeCategory } from '../types';

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    glow?: string;
  };
  unlockCondition: {
    type: 'level' | 'prestige' | 'achievement' | 'bossesKilled' | 'always';
    value?: number | string;
  };
  particleStyle?: 'classic' | 'glow' | 'sparkle' | 'trail';
}

export class VisualCustomizationSystem {
  private themes: Theme[] = [];
  private unlockedThemes: Set<string> = new Set([
    'default_ship',
    'default_laser',
    'default_particle',
    'default_background',
  ]);
  private selectedThemes: Record<ThemeCategory, string> = {
    ship: 'default_ship',
    laser: 'default_laser',
    particle: 'default_particle',
    background: 'default_background',
  };

  constructor() {
    this.initializeThemes();
  }

  private initializeThemes(): void {
    // === SHIP THEMES ===
    this.themes.push({
      id: 'default_ship',
      name: 'Classic Fleet',
      description: 'The standard white ships. Clean and reliable.',
      category: 'ship',
      icon: '🛸',
      colors: {
        primary: '#ffffff',
        secondary: '#cccccc',
        glow: 'rgba(255, 255, 255, 0.3)',
      },
      unlockCondition: { type: 'always' },
    });

    this.themes.push({
      id: 'neon_ship',
      name: 'Neon Fleet',
      description: 'Vibrant cyan ships with neon glow. Unlocked at level 25.',
      category: 'ship',
      icon: '💫',
      colors: {
        primary: '#00ffff',
        secondary: '#00aaff',
        accent: '#00ff88',
        glow: 'rgba(0, 255, 255, 0.5)',
      },
      unlockCondition: { type: 'level', value: 25 },
    });

    this.themes.push({
      id: 'fire_ship',
      name: 'Inferno Fleet',
      description: 'Burning red and orange ships. Defeat 10 bosses to unlock.',
      category: 'ship',
      icon: '🔥',
      colors: {
        primary: '#ff4400',
        secondary: '#ff8800',
        accent: '#ffaa00',
        glow: 'rgba(255, 68, 0, 0.6)',
      },
      unlockCondition: { type: 'bossesKilled', value: 10 },
    });

    this.themes.push({
      id: 'cosmic_ship',
      name: 'Cosmic Fleet',
      description:
        'Mysterious purple ships with cosmic energy. Prestige level 3 required.',
      category: 'ship',
      icon: '🌌',
      colors: {
        primary: '#8800ff',
        secondary: '#aa44ff',
        accent: '#ff00ff',
        glow: 'rgba(136, 0, 255, 0.5)',
      },
      unlockCondition: { type: 'prestige', value: 3 },
    });

    this.themes.push({
      id: 'hologram_ship',
      name: 'Hologram Fleet',
      description:
        'Ghostly blue ships with holographic effects. Reach level 100.',
      category: 'ship',
      icon: '👻',
      colors: {
        primary: '#88ffff',
        secondary: '#aaffff',
        accent: '#ffffff',
        glow: 'rgba(136, 255, 255, 0.4)',
      },
      unlockCondition: { type: 'level', value: 100 },
    });

    // === LASER THEMES ===
    this.themes.push({
      id: 'default_laser',
      name: 'Standard Beams',
      description: 'Clean white lasers. Always available.',
      category: 'laser',
      icon: '⚡',
      colors: {
        primary: '#ffffff',
        secondary: '#ffffff',
      },
      unlockCondition: { type: 'always' },
    });

    this.themes.push({
      id: 'rainbow_laser',
      name: 'Rainbow Beam',
      description: 'Colorful rainbow lasers. Unlocked at level 50.',
      category: 'laser',
      icon: '🌈',
      colors: {
        primary: '#ff0088',
        secondary: '#8800ff',
        accent: '#00ff88',
      },
      unlockCondition: { type: 'level', value: 50 },
    });

    this.themes.push({
      id: 'plasma_laser',
      name: 'Plasma Stream',
      description: 'Hot plasma energy beams. Defeat 25 bosses.',
      category: 'laser',
      icon: '⚛️',
      colors: {
        primary: '#ff0044',
        secondary: '#ff8800',
        glow: '#ffaa00',
      },
      unlockCondition: { type: 'bossesKilled', value: 25 },
    });

    this.themes.push({
      id: 'void_laser',
      name: 'Void Beam',
      description: 'Dark energy from the void. Prestige level 5.',
      category: 'laser',
      icon: '🕳️',
      colors: {
        primary: '#4400aa',
        secondary: '#8800ff',
        accent: '#ff00ff',
      },
      unlockCondition: { type: 'prestige', value: 5 },
    });

    // === PARTICLE THEMES ===
    this.themes.push({
      id: 'default_particle',
      name: 'Classic Particles',
      description: 'Standard white particles. Always available.',
      category: 'particle',
      icon: '✨',
      colors: {
        primary: '#ffffff',
        secondary: '#cccccc',
      },
      particleStyle: 'classic',
      unlockCondition: { type: 'always' },
    });

    this.themes.push({
      id: 'sparkle_particle',
      name: 'Sparkle Effect',
      description: 'Golden sparkles on hits. Unlocked at level 30.',
      category: 'particle',
      icon: '💎',
      colors: {
        primary: '#ffdd00',
        secondary: '#ffaa00',
        accent: '#ffffff',
      },
      particleStyle: 'sparkle',
      unlockCondition: { type: 'level', value: 30 },
    });

    this.themes.push({
      id: 'glow_particle',
      name: 'Glowing Particles',
      description: 'Luminous particles with glow effects. Defeat 15 bosses.',
      category: 'particle',
      icon: '🌟',
      colors: {
        primary: '#00ffff',
        secondary: '#0088ff',
        glow: '#00ff88',
      },
      particleStyle: 'glow',
      unlockCondition: { type: 'bossesKilled', value: 15 },
    });

    this.themes.push({
      id: 'trail_particle',
      name: 'Trail Effect',
      description: 'Long-lasting particle trails. Prestige level 2.',
      category: 'particle',
      icon: '🌠',
      colors: {
        primary: '#ff00ff',
        secondary: '#8800ff',
      },
      particleStyle: 'trail',
      unlockCondition: { type: 'prestige', value: 2 },
    });

    // === BACKGROUND THEMES ===
    this.themes.push({
      id: 'default_background',
      name: 'Classic Space',
      description: 'The original starfield background. Always available.',
      category: 'background',
      icon: '🌌',
      colors: {
        primary: '#000000',
        secondary: '#ffffff', // White stars (not #001122 which is too dark)
      },
      unlockCondition: { type: 'always' },
    });

    this.themes.push({
      id: 'nebula_background',
      name: 'Nebula Sky',
      description: 'Colorful nebula clouds and vibrant stars. Reach level 75.',
      category: 'background',
      icon: '🌠',
      colors: {
        primary: '#0a0018',
        secondary: '#440088', // Purple stars for nebula
      },
      unlockCondition: { type: 'level', value: 75 },
    });

    this.themes.push({
      id: 'void_background',
      name: 'Void Realm',
      description: 'Dark void with subtle stars. Defeat 50 bosses.',
      category: 'background',
      icon: '🌑',
      colors: {
        primary: '#000000',
        secondary: '#333366', // Subtle purple-blue stars that are visible on black
      },
      unlockCondition: { type: 'bossesKilled', value: 50 },
    });
  }

  /**
   * Check unlock conditions and update unlocked themes
   */
  updateUnlocks(state: GameState): void {
    for (const theme of this.themes) {
      if (this.unlockedThemes.has(theme.id)) continue;

      let unlocked = false;
      const condition = theme.unlockCondition;

      switch (condition.type) {
        case 'always':
          unlocked = true;
          break;
        case 'level':
          unlocked =
            state.level >=
            (typeof condition.value === 'number' ? condition.value : 0);
          break;
        case 'prestige':
          unlocked =
            state.prestigeLevel >=
            (typeof condition.value === 'number' ? condition.value : 0);
          break;
        case 'bossesKilled':
          unlocked =
            state.stats.bossesKilled >=
            (typeof condition.value === 'number' ? condition.value : 0);
          break;
        case 'achievement':
          unlocked = state.achievements[condition.value as string] ?? false;
          break;
      }

      if (unlocked) {
        this.unlockedThemes.add(theme.id);
      }
    }
  }

  /**
   * Get all themes for a category
   */
  getThemesForCategory(category: ThemeCategory): Theme[] {
    return this.themes.filter((t) => t.category === category);
  }

  /**
   * Get unlocked themes for a category
   */
  getUnlockedThemesForCategory(category: ThemeCategory): Theme[] {
    return this.getThemesForCategory(category).filter((t) =>
      this.isUnlocked(t.id),
    );
  }

  /**
   * Check if a theme is unlocked
   */
  isUnlocked(themeId: string): boolean {
    return this.unlockedThemes.has(themeId);
  }

  /**
   * Get unlock progress for a theme
   */
  getUnlockProgress(
    theme: Theme,
    state: GameState,
  ): { progress: number; max: number; description: string } {
    const condition = theme.unlockCondition;

    switch (condition.type) {
      case 'always':
        return { progress: 1, max: 1, description: 'Unlocked' };
      case 'level':
        return {
          progress: state.level,
          max: typeof condition.value === 'number' ? condition.value : 1,
          description: `Reach level ${typeof condition.value === 'number' ? condition.value.toString() : '1'}`,
        };
      case 'prestige':
        return {
          progress: state.prestigeLevel,
          max: typeof condition.value === 'number' ? condition.value : 1,
          description: `Reach prestige ${typeof condition.value === 'number' ? condition.value.toString() : '1'}`,
        };
      case 'bossesKilled':
        return {
          progress: state.stats.bossesKilled,
          max: typeof condition.value === 'number' ? condition.value : 1,
          description: `Defeat ${typeof condition.value === 'number' ? condition.value.toString() : '1'} bosses`,
        };
      case 'achievement':
        return {
          progress: state.achievements[condition.value as string] ? 1 : 0,
          max: 1,
          description: `Unlock achievement: ${condition.value}`,
        };
      default:
        return { progress: 0, max: 1, description: 'Unknown' };
    }
  }

  /**
   * Select a theme for a category
   */
  selectTheme(category: ThemeCategory, themeId: string): boolean {
    const theme = this.themes.find(
      (t) => t.id === themeId && t.category === category,
    );
    if (!theme || !this.isUnlocked(themeId)) {
      return false;
    }

    this.selectedThemes[category] = themeId;
    return true;
  }

  /**
   * Get currently selected theme for a category
   */
  getSelectedTheme(category: ThemeCategory): Theme | null {
    const themeId = this.selectedThemes[category];
    return this.themes.find((t) => t.id === themeId) ?? null;
  }

  /**
   * Get ship color based on selected theme and special upgrades
   */
  getShipColors(state: GameState): {
    fillColor: string;
    outlineColor: string;
    glowColor: string;
    themeId?: string;
  } {
    // Check for special upgrades that change ship appearance (priority order - most powerful first)
    let upgradeThemeId: string | undefined;
    let upgradeColors:
      | {
          fillColor: string;
          outlineColor: string;
          glowColor: string;
        }
      | undefined;

    // Legendary tier upgrades
    if (state.subUpgrades['cosmic_ascension']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#7b2cbf',
        outlineColor: '#9d4edd',
        glowColor: 'rgba(123, 44, 191, 0.6)',
      };
    } else if (state.subUpgrades['reality_anchor']) {
      upgradeThemeId = 'hologram_ship';
      upgradeColors = {
        fillColor: '#ffffff',
        outlineColor: '#e0e0e0',
        glowColor: 'rgba(255, 255, 255, 0.7)',
      };
    } else if (state.subUpgrades['infinity_gauntlet']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ff1493',
        outlineColor: '#ff69b4',
        glowColor: 'rgba(255, 20, 147, 0.6)',
      };
    } else if (state.subUpgrades['meaning_of_life']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ffff',
        outlineColor: '#00cccc',
        glowColor: 'rgba(0, 255, 255, 0.6)',
      };
    } else if (state.subUpgrades['heart_of_galaxy']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ff0044',
        outlineColor: '#ff3366',
        glowColor: 'rgba(255, 0, 68, 0.6)',
      };
    } else if (state.subUpgrades['singularity_core']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#1a0033',
        outlineColor: '#4b0082',
        glowColor: 'rgba(75, 0, 130, 0.7)',
      };
    }
    // Epic tier upgrades
    else if (state.subUpgrades['antimatter_rounds']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#ff00ff',
        outlineColor: '#ff66ff',
        glowColor: 'rgba(255, 0, 255, 0.6)',
      };
    } else if (state.subUpgrades['photon_amplifier']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ffff',
        outlineColor: '#00cccc',
        glowColor: 'rgba(0, 255, 255, 0.5)',
      };
    } else if (state.subUpgrades['stellar_forge']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ffaa00',
        outlineColor: '#ffcc00',
        glowColor: 'rgba(255, 170, 0, 0.6)',
      };
    } else if (state.subUpgrades['hyper_reactor']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ff0080',
        outlineColor: '#ff3399',
        glowColor: 'rgba(255, 0, 128, 0.6)',
      };
    } else if (state.subUpgrades['dark_matter_engine']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#4b0082',
        outlineColor: '#6a0dad',
        glowColor: 'rgba(75, 0, 130, 0.6)',
      };
    } else if (state.subUpgrades['antimatter_cascade']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#ff00aa',
        outlineColor: '#ff33cc',
        glowColor: 'rgba(255, 0, 170, 0.6)',
      };
    } else if (state.subUpgrades['quantum_entanglement']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ff88',
        outlineColor: '#00cc66',
        glowColor: 'rgba(0, 255, 136, 0.5)',
      };
    } else if (state.subUpgrades['plasma_matrix']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ff4400',
        outlineColor: '#ff6600',
        glowColor: 'rgba(255, 68, 0, 0.6)',
      };
    } else if (state.subUpgrades['nebula_harvester']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#9370db',
        outlineColor: '#ba55d3',
        glowColor: 'rgba(147, 112, 219, 0.5)',
      };
    } else if (state.subUpgrades['cosmic_battery']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#4169e1',
        outlineColor: '#6495ed',
        glowColor: 'rgba(65, 105, 225, 0.5)',
      };
    }
    // Rare tier upgrades
    else if (state.subUpgrades['warp_core']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#9d4edd',
        outlineColor: '#c77dff',
        glowColor: 'rgba(157, 78, 221, 0.5)',
      };
    } else if (state.subUpgrades['quantum_targeting']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ffff',
        outlineColor: '#00ff88',
        glowColor: 'rgba(0, 255, 255, 0.5)',
      };
    } else if (state.subUpgrades['temporal_acceleration']) {
      upgradeThemeId = 'hologram_ship';
      upgradeColors = {
        fillColor: '#66ccff',
        outlineColor: '#99ddff',
        glowColor: 'rgba(102, 204, 255, 0.4)',
      };
    } else if (state.subUpgrades['ai_optimizer']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ff88',
        outlineColor: '#00ffff',
        glowColor: 'rgba(0, 255, 136, 0.5)',
      };
    } else if (state.subUpgrades['holographic_decoys']) {
      upgradeThemeId = 'hologram_ship';
      upgradeColors = {
        fillColor: '#88aaff',
        outlineColor: '#aaccff',
        glowColor: 'rgba(136, 170, 255, 0.4)',
      };
    } else if (state.subUpgrades['overclocked_reactors']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ff6600',
        outlineColor: '#ffaa00',
        glowColor: 'rgba(255, 102, 0, 0.5)',
      };
    } else if (state.subUpgrades['chaos_emeralds']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ff88',
        outlineColor: '#00cc66',
        glowColor: 'rgba(0, 255, 136, 0.5)',
      };
    } else if (state.subUpgrades['void_channeling']) {
      upgradeThemeId = 'cosmic_ship';
      upgradeColors = {
        fillColor: '#8b00ff',
        outlineColor: '#a020f0',
        glowColor: 'rgba(139, 0, 255, 0.6)',
      };
    } else if (state.subUpgrades['nanobots']) {
      upgradeThemeId = 'neon_ship';
      upgradeColors = {
        fillColor: '#00ff00',
        outlineColor: '#00cc00',
        glowColor: 'rgba(0, 255, 0, 0.5)',
      };
    } else if (state.subUpgrades['nuclear_reactor']) {
      upgradeThemeId = 'fire_ship';
      upgradeColors = {
        fillColor: '#ffff00',
        outlineColor: '#ffcc00',
        glowColor: 'rgba(255, 255, 0, 0.5)',
      };
    }

    // If upgrade theme is set, use it instead of customization theme
    if (upgradeThemeId && upgradeColors) {
      return {
        ...upgradeColors,
        themeId: upgradeThemeId,
      };
    }

    // Otherwise use customization theme
    const theme = this.getSelectedTheme('ship');
    if (!theme) {
      // Fallback to default colors
      return {
        fillColor: '#ffffff',
        outlineColor: '#cccccc',
        glowColor: 'rgba(255, 255, 255, 0.3)',
        themeId: 'default_ship',
      };
    }

    // Use theme colors
    const fillColor = theme.colors.primary;
    const glowColor =
      theme.colors.glow ??
      `rgba(${this.hexToRgb(theme.colors.primary).join(', ')}, 0.4)`;

    return {
      fillColor,
      outlineColor: theme.colors.secondary,
      glowColor,
      themeId: theme.id,
    };
  }

  getLaserThemeId(): string {
    const theme = this.getSelectedTheme('laser');
    return theme?.id ?? 'default_laser';
  }

  /**
   * Get laser color based on selected theme
   */
  getLaserColor(_state: GameState, isCrit: boolean): string {
    if (isCrit) {
      return '#ffff00'; // Always yellow for crits
    }

    const theme = this.getSelectedTheme('laser');
    if (!theme) {
      // Fallback to default white
      return '#ffffff';
    }

    // Use theme color ONLY - no upgrade overrides
    return theme.colors.primary;
  }

  /**
   * Get particle style and colors
   */
  getParticleStyle(): {
    style: string;
    colors: { primary: string; secondary?: string };
  } {
    const theme = this.getSelectedTheme('particle');
    if (!theme) {
      return {
        style: 'classic',
        colors: { primary: '#ffffff', secondary: '#cccccc' },
      };
    }

    return {
      style: theme.particleStyle ?? 'classic',
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
      },
    };
  }

  /**
   * Get background colors
   */
  getBackgroundColors(): { primary: string; secondary: string } {
    const theme = this.getSelectedTheme('background');
    if (!theme) {
      return {
        primary: '#000000',
        secondary: '#ffffff', // White stars for default
      };
    }

    return {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary ?? '#ffffff',
    };
  }

  /**
   * Save customization state
   */
  saveState(): Record<ThemeCategory, string> {
    return { ...this.selectedThemes };
  }

  /**
   * Load customization state
   */
  loadState(state: Record<ThemeCategory, string> | undefined): void {
    if (!state) return;

    // Validate and load each category
    for (const category of [
      'ship',
      'laser',
      'particle',
      'background',
    ] as ThemeCategory[]) {
      const themeId = state[category];
      if (themeId && this.isUnlocked(themeId)) {
        this.selectedThemes[category] = themeId;
      }
    }
  }

  /**
   * Get all unlocked theme IDs
   */
  getUnlockedThemeIds(): string[] {
    return Array.from(this.unlockedThemes);
  }

  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1] ?? '0', 16),
          parseInt(result[2] ?? '0', 16),
          parseInt(result[3] ?? '0', 16),
        ]
      : [255, 255, 255];
  }
}
