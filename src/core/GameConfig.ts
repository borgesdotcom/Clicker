/**
 * GameConfig.ts - Centralized game balancing configuration system
 *
 * This system provides a professional way to tune all gameplay values
 * without touching game logic code. All values are organized by system
 * and can be easily modified here or loaded from a JSON file.
 *
 * Usage:
 * - Import: import { GameConfig } from './core/GameConfig';
 * - Access: GameConfig.upgrades.baseDamage
 * - Override: GameConfig.loadFromJson(customJson) // optional
 */

export interface GameConfigData {
  // Core gameplay values
  upgrades: UpgradeConfig;
  ascension: AscensionConfig;
  enemies: EnemyConfig;
  missions: MissionConfig;
  combo: ComboConfig;
  progression: ProgressionConfig;
  powerUps: PowerUpConfig;
  visual: VisualConfig;
}

export interface UpgradeConfig {
  baseDamage: number;
  damagePerLevel: number; // Percentage per point multiplier level
  costScaling: {
    baseMultiplier: number; // Base cost multiplier per level
    exponentialFactor: number; // Cost exponential scaling (should be 1.07-1.15 for idle game balance)
  };
  speedScaling: {
    baseInterval: number; // Base fire interval in seconds
    reductionPerLevel: number; // Percentage reduction per level
    minInterval: number; // Minimum possible interval
  };
  critChance: {
    baseChance: number; // Base crit chance (%)
    perLevel: number; // Percentage increase per level
    maxChance: number; // Maximum crit chance (%)
    critMultiplier: number; // Damage multiplier on crit
  };
  passiveGeneration: {
    basePerSecond: number; // Base passive points/sec
    perLevel: number; // Additional points/sec per level
  };
  cosmicKnowledge: {
    discountPerLevel: number; // Percentage discount per level
    maxDiscount: number; // Maximum discount (%)
  };
}

export interface AscensionConfig {
  minLevelRequired: number; // Minimum level to ascend
  prestigePointCalculation: {
    // Part III: Improved prestige formula following proven patterns
    baseLevel: number; // Minimum level to ascend
    baseMultiplier: number; // Base multiplier for prestige points
    scalingDivisor: number; // Divisor for scaling (higher = slower growth)
    useCubeRoot: boolean; // Use cube root (true) or square root (false) scaling
    achievementBonus: {
      achievementsPerPP: number; // Achievement count per prestige point
    };
    newLevelBonus: {
      enabled: boolean; // Enable bonus for surpassing previous best
      multiplier: number; // Multiplier for new levels (e.g., 2.0 = 2x bonus)
    };
  };
  upgrades: {
    damage: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number; // Percentage per level (e.g., 0.1 = 10%)
    };
    points: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number;
    };
    xp: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number;
    };
    crit: {
      costPerLevel: number;
      maxLevel: number;
      bonusPerLevel: number; // Percentage per level
    };
    passive: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number;
    };
    speed: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number;
    };
    startingLevel: {
      costPerLevel: number;
      maxLevel: number;
      levelsPerUpgrade: number;
    };
    retainUpgrades: {
      costPerLevel: number;
      maxLevel: number;
      percentagePerLevel: number; // Percentage retained per level
    };
    bossPower: {
      costPerLevel: number;
      maxLevel: number;
      multiplierPerLevel: number;
    };
    comboBoost: {
      costPerLevel: number;
      maxLevel: number;
      baseMultiplier: number; // Base combo multiplier per hit
      bonusPerLevel: number; // Additional multiplier per level
    };
    comboDuration: {
      costPerLevel: number;
      maxLevel: number;
      secondsPerLevel: number;
    };
    autoBuyUnlock: {
      cost: number;
    };
    comboPauseUnlock: {
      cost: number;
    };
  };
  unspentPPMultiplier: {
    percentagePerPP: number; // Percentage income boost per unspent PP (e.g., 0.25 = 0.25%)
  };
  costScaling: {
    exponentialBase: number; // Base for exponential cost scaling (e.g., 1.15)
  };
}

export interface EnemyConfig {
  types: {
    normal: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: number;
    };
    scout: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: { base: number; max: number; scaleDivisor: number };
    };
    tank: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: { base: number; max: number; scaleDivisor: number };
    };
    healer: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: { base: number; max: number; scaleDivisor: number };
      healInterval: number;
      healPercent: number;
    };
    guardian: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: { base: number; max: number; scaleDivisor: number };
    };
    hoarder: {
      hpMultiplier: number;
      pointsMultiplier: number;
      spawnWeight: { base: number; max: number; scaleDivisor: number };
    };
  };
  hpScaling: {
    baseHp: number;
    tiers: Array<{
      maxLevel: number;
      multiplier: number; // Growth multiplier per level (e.g., 1.18)
    }>;
    ramp: {
      startLevel: number;
      linearComponent: number; // Linear growth per level
      exponentialBase: number; // Exponential base (e.g., 1.003)
      exponentialCap: number; // Maximum exponential levels
      maxRamp: number; // Maximum ramp multiplier
    };
  };
  boss: {
    hpMultiplier: number; // Base boss HP multiplier
    nerfFactor: number; // Global nerf factor
    hpTiers: Array<{
      minLevel: number;
      maxLevel?: number;
      bonusMultiplier: number; // Additional multiplier
    }>;
    timeLimit: {
      baseSeconds: number;
      tiers: Array<{
        minLevel: number;
        maxLevel?: number;
        secondsPer10Levels: number;
        baseBonus?: number;
      }>;
    };
    intervals: {
      early: number; // Boss every N levels (early game)
      mid: number; // Boss every N levels (mid game)
      late: number; // Boss every N levels (late game)
      earlyThreshold: number; // Level threshold for early game
      midThreshold: number; // Level threshold for mid game
    };
    milestones: number[]; // Special boss milestone levels
  };
  xpScaling: {
    noReductionLevel: number; // Level before XP reduction starts
    linearDrop: {
      divisorPerLevel: number; // Divisor per extra level (e.g., 0.02)
    };
    exponentialDrop: {
      base: number; // Exponential base (e.g., 0.995)
      maxLevels: number; // Maximum levels to apply exponential drop
    };
    minMultiplier: number; // Minimum XP multiplier
  };
}

export interface MissionConfig {
  regular: {
    count: number; // Number of regular missions
  };
  daily: {
    count: number; // Number of daily missions
    rewardMultiplier: number; // Multiplier for daily mission rewards
  };
  templates: {
    clicks: {
      targetBase: number;
      targetMultiplier: number;
      pointsMultiplier: number;
      xpPerLevel: number;
    };
    damage: {
      targetBase: number;
      targetMultiplier: number;
      pointsMultiplier: number;
      shipsPer10Levels: number;
    };
    kills: {
      targetBase: number;
      targetMultiplier: number;
      pointsMultiplier: number;
      xpPerLevel: number;
    };
    boss_kills: {
      targetCount: number;
      pointsMultiplier: number;
      shipsPer5Levels: number;
      minShips: number;
    };
    upgrades: {
      targetBase: number;
      targetDivisor: number;
      pointsMultiplier: number;
    };
    level: {
      levelsAhead: number;
      pointsMultiplier: number;
      xpPerLevel: number;
    };
    ships: {
      targetBase: number;
      targetDivisor: number;
      pointsMultiplier: number;
    };
    combo: {
      targetBase: number;
      targetMultiplier: number;
      pointsMultiplier: number;
      xpPerLevel: number;
    };
  };
}

export interface ComboConfig {
  baseMultiplier: number; // Combo multiplier per hit (e.g., 0.0005)
  timeout: number; // Time in seconds before combo resets
  maxMultiplier: number | null; // Maximum combo multiplier (null = unlimited)
  colorThresholds: Array<{ minMultiplier: number; color: string }>; // Color thresholds for display
}

export interface ProgressionConfig {
  xp: {
    base: number; // Base XP required
    growthRate: number; // Exponential growth rate (e.g., 1.1)
    softcaps: Array<{
      minLevel: number;
      multiplier: number; // Multiplier to apply (e.g., 0.9 = 10% reduction)
    }>;
    damping: {
      base: number; // Logarithmic base for damping
      divisor: number; // Divisor for damping calculation
    };
  };
  levelCap: number | null; // Maximum level (null = unlimited)
}

export interface PowerUpConfig {
  damageBoost: {
    multiplier: number; // Damage multiplier when active
    duration: number; // Duration in seconds
  };
  speedBoost: {
    multiplier: number; // Speed multiplier when active
    duration: number;
  };
  multishot: {
    shotMultiplier: number; // Shot count multiplier
    duration: number;
  };
}

export interface VisualConfig {
  combo: {
    animation: {
      duration: number; // Animation duration in seconds
      scaleAmount: number; // Scale multiplier during animation
    };
    bar: {
      width: number;
      height: number;
    };
  };
}

// Default configuration values
const DEFAULT_CONFIG: GameConfigData = {
  upgrades: {
    baseDamage: 1,
    damagePerLevel: 0.1, // 10% per level
    costScaling: {
      baseMultiplier: 1,
      exponentialFactor: 1.15, // Standard idle game scaling
    },
    speedScaling: {
      baseInterval: 1.0,
      reductionPerLevel: 0.05, // 5% reduction per level
      minInterval: 0.1,
    },
    critChance: {
      baseChance: 5,
      perLevel: 2,
      maxChance: 100,
      critMultiplier: 2,
    },
    passiveGeneration: {
      basePerSecond: 0,
      perLevel: 1,
    },
    cosmicKnowledge: {
      discountPerLevel: 0.5,
      maxDiscount: 90,
    },
  },
  ascension: {
    minLevelRequired: 100,
    prestigePointCalculation: {
      // Part III: Improved prestige formula following proven patterns
      // Using square root scaling (like Realm Grinder/AdVenture Capitalist)
      // Formula: PP = baseMultiplier * sqrt((level - baseLevel) / scalingDivisor)
      // This creates proper diminishing returns while maintaining progression
      baseLevel: 100, // Minimum level to ascend
      baseMultiplier: 10, // Base multiplier for prestige points
      scalingDivisor: 10, // Divisor for scaling (higher = slower growth)
      // Alternative: cube root scaling (like Cookie Clicker) - more aggressive
      // Set useCubeRoot to true for cube root, false for square root
      useCubeRoot: false,
      // Achievement bonus adds extra progression path
      achievementBonus: {
        achievementsPerPP: 10,
      },
      // Bonus for surpassing previous best (encourages progression)
      // Following Part III: lifetime-based systems reward pushing further
      newLevelBonus: {
        enabled: true,
        multiplier: 2.0, // 2x bonus for levels beyond previous best
      },
    },
    upgrades: {
      damage: { costPerLevel: 1, maxLevel: 100, multiplierPerLevel: 0.15 }, // 15% per level
      points: { costPerLevel: 1, maxLevel: 100, multiplierPerLevel: 0.2 }, // 20% per level
      xp: { costPerLevel: 1, maxLevel: 100, multiplierPerLevel: 0.25 }, // 25% per level
      crit: { costPerLevel: 2, maxLevel: 50, bonusPerLevel: 2 },
      passive: { costPerLevel: 2, maxLevel: 75, multiplierPerLevel: 0.3 }, // 30% per level
      speed: { costPerLevel: 3, maxLevel: 50, multiplierPerLevel: 0.05 },
      startingLevel: { costPerLevel: 5, maxLevel: 20, levelsPerUpgrade: 5 },
      retainUpgrades: { costPerLevel: 10, maxLevel: 10, percentagePerLevel: 1 },
      bossPower: { costPerLevel: 3, maxLevel: 50, multiplierPerLevel: 0.2 },
      comboBoost: {
        costPerLevel: 5,
        maxLevel: 20,
        baseMultiplier: 0.0005,
        bonusPerLevel: 0.00035,
      },
      comboDuration: { costPerLevel: 4, maxLevel: 25, secondsPerLevel: 1 },
      autoBuyUnlock: { cost: 50 },
      comboPauseUnlock: { cost: 30 },
    },
    unspentPPMultiplier: {
      percentagePerPP: 0.25, // 0.25% per unspent PP
    },
    costScaling: {
      exponentialBase: 1.15,
    },
  },
  enemies: {
    types: {
      normal: { hpMultiplier: 1, pointsMultiplier: 1, spawnWeight: 0.6 },
      scout: {
        hpMultiplier: 0.35,
        pointsMultiplier: 1.8,
        spawnWeight: { base: 0.22, max: 0.42, scaleDivisor: 220 },
      },
      tank: {
        hpMultiplier: 4,
        pointsMultiplier: 3,
        spawnWeight: { base: 0.12, max: 0.3, scaleDivisor: 320 },
      },
      healer: {
        hpMultiplier: 0.9,
        pointsMultiplier: 3.5,
        spawnWeight: { base: 0.08, max: 0.2, scaleDivisor: 420 },
        healInterval: 2,
        healPercent: 5,
      },
      guardian: {
        hpMultiplier: 2.2,
        pointsMultiplier: 1.5,
        spawnWeight: { base: 0.08, max: 0.2, scaleDivisor: 450 },
      },
      hoarder: {
        hpMultiplier: 1.1,
        pointsMultiplier: 8,
        spawnWeight: { base: 0.005, max: 0.015, scaleDivisor: 1200 },
      },
    },
    boss: {
      hpMultiplier: 2,
      nerfFactor: 0.65,
      hpTiers: [
        { minLevel: 0, maxLevel: 50, bonusMultiplier: 1 },
        { minLevel: 50, maxLevel: 75, bonusMultiplier: 1.1 },
        { minLevel: 75, maxLevel: 99, bonusMultiplier: 1 },
        { minLevel: 100, maxLevel: 149, bonusMultiplier: 1 },
        { minLevel: 300, maxLevel: 600, bonusMultiplier: 1 },
        { minLevel: 600, bonusMultiplier: 1.06 },
      ],
      timeLimit: {
        baseSeconds: 30,
        tiers: [
          { minLevel: 0, maxLevel: 50, secondsPer10Levels: 0, baseBonus: 0 },
          { minLevel: 50, maxLevel: 200, secondsPer10Levels: 5 },
          {
            minLevel: 200,
            maxLevel: 500,
            secondsPer10Levels: 10,
            baseBonus: 75,
          },
          { minLevel: 500, secondsPer10Levels: 15, baseBonus: 375 },
        ],
      },
      intervals: {
        early: 25,
        mid: 50,
        late: 100,
        earlyThreshold: 100,
        midThreshold: 500,
      },
      milestones: [50, 100, 250, 500, 750, 1000],
    },
    xpScaling: {
      noReductionLevel: 30,
      linearDrop: { divisorPerLevel: 0.02 },
      exponentialDrop: { base: 0.995, maxLevels: 600 },
      minMultiplier: 0.15,
    },
    hpScaling: {
      baseHp: 10,
      tiers: [
        { maxLevel: 50, multiplier: 1.18 },
        { maxLevel: 59, multiplier: 1.21 }, // Levels 1-59
        { maxLevel: 65, multiplier: 1.25 }, // Levels 60-70: gradual increase starts
        { maxLevel: 70, multiplier: 1.3 },
        { maxLevel: 74, multiplier: 1.4 },
        { maxLevel: 75, multiplier: 1.5 },
        // { maxLevel: 75, multiplier: 1.31 },
        { maxLevel: 85, multiplier: 1.65 },
        { maxLevel: 90, multiplier: 1.8 },
        { maxLevel: 95, multiplier: 2.0 },
        { maxLevel: 99, multiplier: 1.75 },
        { maxLevel: 100, multiplier: 8 },
        { maxLevel: 110, multiplier: 2.4 },
        { maxLevel: Infinity, multiplier: 1.1 },
      ],
      ramp: {
        startLevel: 30,
        linearComponent: 0.008,
        exponentialBase: 1.003,
        exponentialCap: 700,
        maxRamp: 75,
      },
    },
  },
  missions: {
    regular: { count: 5 },
    daily: { count: 3, rewardMultiplier: 2 },
    templates: {
      clicks: {
        targetBase: 100,
        targetMultiplier: 50,
        pointsMultiplier: 500,
        xpPerLevel: 15,
      },
      damage: {
        targetBase: 5000,
        targetMultiplier: 2000,
        pointsMultiplier: 750,
        shipsPer10Levels: 1,
      },
      kills: {
        targetBase: 10,
        targetMultiplier: 3,
        pointsMultiplier: 400,
        xpPerLevel: 12,
      },
      boss_kills: {
        targetCount: 3,
        pointsMultiplier: 2500,
        shipsPer5Levels: 1,
        minShips: 2,
      },
      upgrades: { targetBase: 5, targetDivisor: 2, pointsMultiplier: 600 },
      level: { levelsAhead: 5, pointsMultiplier: 1000, xpPerLevel: 30 },
      ships: { targetBase: 5, targetDivisor: 3, pointsMultiplier: 1500 },
      combo: {
        targetBase: 10,
        targetMultiplier: 2,
        pointsMultiplier: 1250,
        xpPerLevel: 25,
      },
    },
  },
  combo: {
    baseMultiplier: 0.0005,
    timeout: 10.0,
    maxMultiplier: null, // null = unlimited
    colorThresholds: [
      { minMultiplier: 2.0, color: '#ff00ff' },
      { minMultiplier: 1.6, color: '#ff0000' },
      { minMultiplier: 1.35, color: '#ffaa00' },
      { minMultiplier: 1.15, color: '#ffff00' },
      { minMultiplier: 1.03, color: '#00ff00' },
      { minMultiplier: 0, color: '#ffffff' },
    ],
  },
  progression: {
    xp: {
      base: 10,
      growthRate: 1.1,
      softcaps: [
        { minLevel: 200, multiplier: 0.9 },
        { minLevel: 500, multiplier: 0.85 },
        { minLevel: 800, multiplier: 0.75 },
      ],
      damping: {
        base: 10,
        divisor: 11,
      },
    },
    levelCap: null,
  },
  powerUps: {
    damageBoost: { multiplier: 2, duration: 30 },
    speedBoost: { multiplier: 2, duration: 30 },
    multishot: { shotMultiplier: 2, duration: 30 },
  },
  visual: {
    combo: {
      animation: { duration: 0.3, scaleAmount: 0.3 },
      bar: { width: 120, height: 4 },
    },
  },
};

/**
 * GameConfig - Centralized game configuration system
 *
 * This is a singleton class that provides access to all game balancing values.
 * It supports loading custom configurations from JSON files for easy tuning.
 */
export class GameConfig {
  private static instance: GameConfig;
  private config: GameConfigData;

  private constructor(config?: GameConfigData) {
    this.config = config
      ? this.mergeConfig(DEFAULT_CONFIG, config)
      : DEFAULT_CONFIG;
  }

  /**
   * Get the singleton instance of GameConfig
   */
  static getInstance(): GameConfig {
    if (!GameConfig.instance) {
      GameConfig.instance = new GameConfig();
    }
    return GameConfig.instance;
  }

  /**
   * Load configuration from a JSON object
   * This allows partial overrides - only provided values will override defaults
   */
  static loadFromJson(json: Partial<GameConfigData>): void {
    const instance = GameConfig.getInstance();
    instance.config = instance.mergeConfig(DEFAULT_CONFIG, json);
  }

  /**
   * Reset to default configuration
   */
  static reset(): void {
    GameConfig.instance = new GameConfig();
  }

  /**
   * Deep merge two configuration objects
   */
  private mergeConfig(
    defaultConfig: GameConfigData,
    override: Partial<GameConfigData>,
  ): GameConfigData {
    const merged = { ...defaultConfig };

    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        const typedKey = key as keyof GameConfigData;
        const overrideValue = override[typedKey];
        const defaultValue = merged[typedKey];

        if (overrideValue !== undefined) {
          if (
            typeof overrideValue === 'object' &&
            !Array.isArray(overrideValue) &&
            overrideValue !== null
          ) {
            // Recursively merge objects
            merged[typedKey] = this.mergeConfig(
              defaultValue as any,
              overrideValue as any,
            ) as any;
          } else {
            // Direct assignment for primitives and arrays
            merged[typedKey] = overrideValue as any;
          }
        }
      }
    }

    return merged;
  }

  // Accessor properties for easy access to configuration sections
  get upgrades(): UpgradeConfig {
    return this.config.upgrades;
  }

  get ascension(): AscensionConfig {
    return this.config.ascension;
  }

  get enemies(): EnemyConfig {
    return this.config.enemies;
  }

  get missions(): MissionConfig {
    return this.config.missions;
  }

  get combo(): ComboConfig {
    return this.config.combo;
  }

  get progression(): ProgressionConfig {
    return this.config.progression;
  }

  get powerUps(): PowerUpConfig {
    return this.config.powerUps;
  }

  get visual(): VisualConfig {
    return this.config.visual;
  }

  /**
   * Get the full configuration object (useful for serialization)
   */
  getConfig(): GameConfigData {
    return JSON.parse(JSON.stringify(this.config)); // Deep clone
  }
}

// Export singleton instance for convenient access
export const Config = GameConfig.getInstance();
