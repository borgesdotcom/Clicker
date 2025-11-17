import type { GameState } from '../types';
import { Config } from '../core/GameConfig';

export interface AscensionUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  getCurrentLevel: (state: GameState) => number;
  effect: string;
}

export class AscensionSystem {
  private ascensionUpgrades: AscensionUpgrade[] = [];

  constructor() {
    this.initializeUpgrades();
  }

  private initializeUpgrades(): void {
    this.ascensionUpgrades = [
      {
        id: 'prestige_damage',
        name: 'Eternal Power',
        description: 'Permanently increase all damage',
        cost: 1,
        maxLevel: 100, // Extended for late game
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_damage ?? 0,
        effect: '+15% damage per level',
      },
      {
        id: 'prestige_points',
        name: 'Cosmic Fortune',
        description: 'Permanently increase point gains',
        cost: 1,
        maxLevel: 100, // Extended for late game
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_points ?? 0,
        effect: '+20% points per level',
      },
      {
        id: 'prestige_xp',
        name: 'Ancient Wisdom',
        description: 'Permanently increase XP gains',
        cost: 1,
        maxLevel: 100, // Extended for late game
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_xp ?? 0,
        effect: '+25% XP per level',
      },
      {
        id: 'prestige_crit',
        name: 'Lucky Stars',
        description: 'Permanently increase critical hit chance',
        cost: 2,
        maxLevel: 50, // Extended for late game
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_crit ?? 0,
        effect: '+2% crit chance per level',
      },
      {
        id: 'prestige_passive',
        name: 'Idle Mastery',
        description: 'Permanently increase passive generation',
        cost: 2,
        maxLevel: 75, // Extended for late game
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_passive ?? 0,
        effect: '+30% passive per level',
      },
      {
        id: 'prestige_speed',
        name: 'Time Dilation',
        description: 'Permanently increase attack speed',
        cost: 3,
        maxLevel: 50, // Extended for late game
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_speed ?? 0,
        effect: '+5% attack speed per level',
      },
      {
        id: 'prestige_starting_level',
        name: 'Head Start',
        description: 'Start at a higher level after ascension',
        cost: 5,
        maxLevel: 20, // Extended to allow starting at level 100
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_starting_level ?? 0,
        effect: 'Start +5 levels per level',
      },
      {
        id: 'prestige_retain_upgrades',
        name: 'Persistent Memory',
        description: 'Retain a percentage of upgrade levels',
        cost: 10,
        maxLevel: 10, // Extended for late game
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_retain_upgrades ?? 0,
        effect: 'Retain +1% upgrades per level',
      },
      {
        id: 'prestige_boss_power',
        name: 'Boss Slayer',
        description: 'Deal extra damage to bosses',
        cost: 3,
        maxLevel: 50,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_boss_power ?? 0,
        effect: '+20% boss damage per level',
      },
      {
        id: 'prestige_combo_boost',
        name: 'Combo Master',
        description: 'Combo multiplier builds faster',
        cost: 5,
        maxLevel: 20,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_combo_boost ?? 0,
        effect: '+0.0005× combo per level (total +0.001×)',
      },
      {
        id: 'prestige_combo_duration',
        name: 'Combo Persistence',
        description: 'Increase combo duration before it resets',
        cost: 4,
        maxLevel: 25,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_combo_duration ?? 0,
        effect: '+1 second duration per level',
      },
      {
        id: 'auto_buy_unlock',
        name: 'Auto-Buy Protocol',
        description: 'Unlock automatic purchase of affordable upgrades',
        cost: 50,
        maxLevel: 1,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.auto_buy_unlock ?? 0,
        effect: 'Unlocks Auto-Buy feature',
      },
      {
        id: 'combo_pause_unlock',
        name: 'Combo Freeze',
        description: 'Unlock ability to pause combo timer for 15 minutes',
        cost: 30,
        maxLevel: 1,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.combo_pause_unlock ?? 0,
        effect: 'Unlocks Combo Pause skill (15min duration, 1hr cooldown)',
      },
    ];
  }

  getUpgrades(): AscensionUpgrade[] {
    return this.ascensionUpgrades;
  }

  calculatePrestigePoints(state: GameState): number {
    const breakdown = this.calculatePrestigePointsBreakdown(state);
    let total = breakdown.base + breakdown.bonus;
    
    // Transcendence upgrade: x2 prestige points
    if (state.subUpgrades?.['transcendence']) {
      total *= 2;
    }
    
    return total;
  }

  calculatePrestigePointsBreakdown(state: GameState): {
    base: number;
    bonus: number;
    previousBest: number;
  } {
    // Part III: Improved prestige calculation following proven patterns
    const config = Config.ascension.prestigePointCalculation;
    
    if (state.level < config.baseLevel) {
      return {
        base: 0,
        bonus: 0,
        previousBest: state.highestLevelReached ?? 0,
      };
    }

    const isFirstAscension = state.prestigeLevel === 0;
    const previousHighest = state.highestLevelReached ?? 0;
    const effectivePreviousBest = previousHighest > 0 ? previousHighest : 0;

    // Part III: Use square root or cube root scaling (like Realm Grinder/Cookie Clicker)
    // Formula: PP = baseMultiplier * root((level - baseLevel) / scalingDivisor)
    // Square root: more generous, cube root: more aggressive
    const levelProgress = state.level - config.baseLevel;
    const scaledProgress = levelProgress / config.scalingDivisor;
    
    let basePoints = 0;
    if (scaledProgress > 0) {
      if (config.useCubeRoot) {
        // Cube root scaling (like Cookie Clicker) - more aggressive
        basePoints = Math.floor(config.baseMultiplier * Math.pow(scaledProgress, 1/3));
      } else {
        // Square root scaling (like Realm Grinder/AdVenture Capitalist) - balanced
        basePoints = Math.floor(config.baseMultiplier * Math.sqrt(scaledProgress));
      }
    }


    // Achievement bonus (always available)
    const achievementBonus = this.calculateAchievementBonus(state);
    basePoints += achievementBonus;

    // Part III: Bonus for surpassing previous best (lifetime-based system)
    // This encourages players to push further each run
    let bonusPoints = 0;
    if (!isFirstAscension && state.level > effectivePreviousBest && config.newLevelBonus.enabled) {
      // Calculate bonus for new levels beyond previous best
      const newLevelProgress = state.level - Math.max(config.baseLevel, effectivePreviousBest);
      const newScaledProgress = newLevelProgress / config.scalingDivisor;
      
      let newLevelPP = 0;
      if (newScaledProgress > 0) {
        if (config.useCubeRoot) {
          newLevelPP = Math.floor(config.baseMultiplier * Math.pow(newScaledProgress, 1/3));
        } else {
          newLevelPP = Math.floor(config.baseMultiplier * Math.sqrt(newScaledProgress));
        }
      }
      
      // Apply bonus multiplier for new levels
      bonusPoints = Math.floor(newLevelPP * (config.newLevelBonus.multiplier - 1));
    }

    return {
      base: Math.max(0, basePoints),
      bonus: Math.max(0, bonusPoints),
      previousBest: effectivePreviousBest,
    };
  }

  private calculateAchievementBonus(state: GameState): number {
    let bonus = 0;

    // Count unlocked achievements for bonus PP
    const achievementCount = Object.values(state.achievements).filter(
      (unlocked) => unlocked,
    ).length;
    bonus += Math.floor(achievementCount / 10); // +1 PP per 10 achievements

    return bonus;
  }

  canAscend(state: GameState): boolean {
    // Can ascend once you reach level 100
    return state.level >= 100;
  }

  getDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_damage ?? 0;
    // Improved scaling: each level gives meaningful boost
    // Following idle game principles: prestige should provide clear acceleration
    return 1 + level * 0.15; // Increased from 0.1 to 0.15 (15% per level)
  }

  getPointsMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_points ?? 0;
    // Points are the primary currency, so they get a good boost
    return 1 + level * 0.2; // Increased from 0.15 to 0.2 (20% per level)
  }

  getXPMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_xp ?? 0;
    // XP helps reach prestige faster, so it's valuable
    return 1 + level * 0.25; // Increased from 0.2 to 0.25 (25% per level)
  }

  getCritBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_crit ?? 0;
    return level * 2;
  }

  getPassiveMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_passive ?? 0;
    // Passive generation is crucial for idle gameplay
    return 1 + level * 0.3; // Increased from 0.25 to 0.3 (30% per level)
  }

  getSpeedMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_speed ?? 0;
    return 1 + level * 0.05;
  }

  getStartingLevel(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_starting_level ?? 0;
    return 1 + level * 5;
  }

  getRetainPercentage(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_retain_upgrades ?? 0;
    return level * 0.01;
  }

  getBossDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_boss_power ?? 0;
    return 1 + level * 0.2;
  }

  getComboBoostMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_combo_boost ?? 0;
    // Adds extra combo multiplier rate
    return 0.0005 + level * 0.00035;
  }

  getComboDurationBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_combo_duration ?? 0;
    // Adds +1 second per level to base combo duration
    return level * 1.0;
  }

  isAutoBuyUnlocked(state: GameState): boolean {
    const level = state.prestigeUpgrades?.auto_buy_unlock ?? 0;
    return level >= 1;
  }

  isComboPauseUnlocked(state: GameState): boolean {
    const level = state.prestigeUpgrades?.combo_pause_unlock ?? 0;
    return level >= 1;
  }

  getUpgradeCost(upgradeId: string, state: GameState): number {
    const upgrade = this.ascensionUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return Infinity;

    const currentLevel = upgrade.getCurrentLevel(state);
    if (currentLevel >= upgrade.maxLevel) return Infinity;

    // Scale cost based on current level: baseCost * (1.15 ^ currentLevel)
    // This makes each level progressively more expensive
    const baseCost = upgrade.cost;
    const scaledCost = Math.floor(baseCost * Math.pow(1.15, currentLevel));

    return scaledCost;
  }

  buyPrestigeUpgrade(state: GameState, upgradeId: string): boolean {
    const upgrade = this.ascensionUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = upgrade.getCurrentLevel(state);
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = this.getUpgradeCost(upgradeId, state);
    if (state.prestigePoints < cost) return false;

    // Initialize prestigeUpgrades if needed
    if (!state.prestigeUpgrades) {
      state.prestigeUpgrades = {};
    }

    state.prestigePoints -= cost;
    state.prestigeUpgrades[upgradeId] = currentLevel + 1;

    // Auto-enable auto-buy when the upgrade is purchased
    if (upgradeId === 'auto_buy_unlock' && currentLevel === 0) {
      state.autoBuyEnabled = true;
    }

    return true;
  }

  /**
   * Get income multiplier from unspent prestige points
   * Each unspent PP gives +1% to all income (points from clicks, kills, and passive generation)
   */
  getUnspentPPMultiplier(state: GameState): number {
    const unspentPP = state.prestigePoints ?? 0;
    // 0.25% per point: 1 + (unspentPP * 0.0025)
    return 1 + unspentPP * 0.0025;
  }
}
