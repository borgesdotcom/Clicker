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
        cost: Config.ascension.upgrades.damage.costPerLevel,
        maxLevel: Config.ascension.upgrades.damage.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_damage ?? 0,
        effect: `+${Config.ascension.upgrades.damage.multiplierPerLevel * 100}% damage per level`,
      },
      {
        id: 'prestige_points',
        name: 'Cosmic Fortune',
        description: 'Permanently increase point gains',
        cost: Config.ascension.upgrades.points.costPerLevel,
        maxLevel: Config.ascension.upgrades.points.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_points ?? 0,
        effect: `+${Config.ascension.upgrades.points.multiplierPerLevel * 100}% points per level`,
      },
      {
        id: 'prestige_xp',
        name: 'Ancient Wisdom',
        description: 'Permanently increase XP gains',
        cost: Config.ascension.upgrades.xp.costPerLevel,
        maxLevel: Config.ascension.upgrades.xp.maxLevel,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_xp ?? 0,
        effect: `+${Config.ascension.upgrades.xp.multiplierPerLevel * 100}% XP per level`,
      },
      {
        id: 'prestige_crit',
        name: 'Lucky Stars',
        description: 'Permanently increase critical hit chance',
        cost: Config.ascension.upgrades.crit.costPerLevel,
        maxLevel: Config.ascension.upgrades.crit.maxLevel,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_crit ?? 0,
        effect: `+${Config.ascension.upgrades.crit.bonusPerLevel}% crit chance per level`,
      },
      {
        id: 'prestige_passive',
        name: 'Idle Mastery',
        description: 'Permanently increase passive generation',
        cost: Config.ascension.upgrades.passive.costPerLevel,
        maxLevel: Config.ascension.upgrades.passive.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_passive ?? 0,
        effect: `+${Config.ascension.upgrades.passive.multiplierPerLevel * 100}% passive per level`,
      },
      {
        id: 'prestige_speed',
        name: 'Time Dilation',
        description: 'Permanently increase attack speed',
        cost: Config.ascension.upgrades.speed.costPerLevel,
        maxLevel: Config.ascension.upgrades.speed.maxLevel,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_speed ?? 0,
        effect: `+${Config.ascension.upgrades.speed.multiplierPerLevel * 100}% attack speed per level`,
      },
      {
        id: 'prestige_starting_level',
        name: 'Head Start',
        description: 'Start at a higher level after ascension',
        cost: Config.ascension.upgrades.startingLevel.costPerLevel,
        maxLevel: Config.ascension.upgrades.startingLevel.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_starting_level ?? 0,
        effect: `Start +${Config.ascension.upgrades.startingLevel.levelsPerUpgrade} levels per level`,
      },
      {
        id: 'prestige_retain_upgrades',
        name: 'Persistent Memory',
        description: 'Retain a percentage of upgrade levels',
        cost: Config.ascension.upgrades.retainUpgrades.costPerLevel,
        maxLevel: Config.ascension.upgrades.retainUpgrades.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_retain_upgrades ?? 0,
        effect: `Retain +${Config.ascension.upgrades.retainUpgrades.percentagePerLevel}% upgrades per level`,
      },
      {
        id: 'prestige_boss_power',
        name: 'Boss Slayer',
        description: 'Deal extra damage to bosses',
        cost: Config.ascension.upgrades.bossPower.costPerLevel,
        maxLevel: Config.ascension.upgrades.bossPower.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_boss_power ?? 0,
        effect: `+${Config.ascension.upgrades.bossPower.multiplierPerLevel * 100}% boss damage per level`,
      },
      {
        id: 'prestige_combo_boost',
        name: 'Combo Master',
        description: 'Combo multiplier builds faster',
        cost: Config.ascension.upgrades.comboBoost.costPerLevel,
        maxLevel: Config.ascension.upgrades.comboBoost.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_combo_boost ?? 0,
        effect: `+${Config.ascension.upgrades.comboBoost.baseMultiplier}× combo per level (total +${Config.ascension.upgrades.comboBoost.baseMultiplier + Config.ascension.upgrades.comboBoost.bonusPerLevel}×)`,
      },
      {
        id: 'prestige_combo_duration',
        name: 'Combo Persistence',
        description: 'Increase combo duration before it resets',
        cost: Config.ascension.upgrades.comboDuration.costPerLevel,
        maxLevel: Config.ascension.upgrades.comboDuration.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_combo_duration ?? 0,
        effect: `+${Config.ascension.upgrades.comboDuration.secondsPerLevel} second duration per level`,
      },
      {
        id: 'auto_buy_unlock',
        name: 'Auto-Buy Protocol',
        description: 'Unlock automatic purchase of affordable upgrades',
        cost: Config.ascension.upgrades.autoBuyUnlock.cost,
        maxLevel: 1,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.auto_buy_unlock ?? 0,
        effect: 'Unlocks Auto-Buy feature',
      },
      {
        id: 'combo_pause_unlock',
        name: 'Combo Freeze',
        description: 'Unlock ability to pause combo timer for 15 minutes',
        cost: Config.ascension.upgrades.comboPauseUnlock.cost,
        maxLevel: 1,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.combo_pause_unlock ?? 0,
        effect: 'Unlocks Combo Pause skill (15min duration, 1hr cooldown)',
      },
      {
        id: 'prestige_ship_hull',
        name: 'Ship Hull',
        description: 'Upgrade ship hull to double base damage',
        cost: Config.ascension.upgrades.shipSkin.costPerLevel,
        maxLevel: Config.ascension.upgrades.shipSkin.maxLevel,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_ship_hull ?? 0,
        effect: 'Doubles base damage per level',
      },
    ];
  }

  getUpgrades(): AscensionUpgrade[] {
    return this.ascensionUpgrades;
  }

  calculatePrestigePoints(state: GameState): number {
    const breakdown = this.calculatePrestigePointsBreakdown(state);
    let total = breakdown.base + breakdown.achievementBonus + breakdown.bonus;

    // Transcendence upgrade: x2 prestige points
    if (state.subUpgrades?.['transcendence']) {
      total *= 2;
    }

    return total;
  }

  calculatePrestigePointsBreakdown(state: GameState): {
    base: number;
    achievementBonus: number;
    bonus: number;
    previousBest: number;
  } {
    // Part III: Improved prestige calculation following proven patterns
    const config = Config.ascension.prestigePointCalculation;

    if (state.level < config.baseLevel) {
      return {
        base: 0,
        achievementBonus: 0,
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
        basePoints = Math.floor(
          config.baseMultiplier * Math.pow(scaledProgress, 1 / 3),
        );
      } else {
        // Square root scaling (like Realm Grinder/AdVenture Capitalist) - balanced
        basePoints = Math.floor(
          config.baseMultiplier * Math.sqrt(scaledProgress),
        );
      }
    }

    // Achievement bonus (always available) - keep separate from base
    const achievementBonus = this.calculateAchievementBonus(state);

    // Part III: Bonus for surpassing previous best (lifetime-based system)
    // This encourages players to push further each run
    let bonusPoints = 0;
    if (
      !isFirstAscension &&
      state.level > effectivePreviousBest &&
      config.newLevelBonus.enabled
    ) {
      // Calculate bonus for new levels beyond previous best
      const newLevelProgress =
        state.level - Math.max(config.baseLevel, effectivePreviousBest);
      const newScaledProgress = newLevelProgress / config.scalingDivisor;

      let newLevelPP = 0;
      if (newScaledProgress > 0) {
        if (config.useCubeRoot) {
          newLevelPP = Math.floor(
            config.baseMultiplier * Math.pow(newScaledProgress, 1 / 3),
          );
        } else {
          newLevelPP = Math.floor(
            config.baseMultiplier * Math.sqrt(newScaledProgress),
          );
        }
      }

      // Apply bonus multiplier for new levels
      bonusPoints = Math.floor(
        newLevelPP * (config.newLevelBonus.multiplier - 1),
      );
    }

    return {
      base: Math.max(0, basePoints),
      achievementBonus: Math.max(0, achievementBonus),
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
    const achievementsPerPP =
      Config.ascension.prestigePointCalculation.achievementBonus.achievementsPerPP;
    bonus += Math.floor(achievementCount / achievementsPerPP);

    return bonus;
  }

  canAscend(state: GameState): boolean {
    // Can ascend only if meaning_of_life upgrade is purchased (required to unlock prestige system)
    // OR if already prestiged before (prestigeLevel > 0)
    const hasUnlock =
      state.subUpgrades['meaning_of_life'] === true || state.prestigeLevel > 0;

    if (!hasUnlock) return false;

    // At level 100, can only ascend after defeating the boss
    if (state.level === 100 && state.blockedOnBossLevel === 100) {
      return false; // Must defeat boss first
    }

    return true;
  }

  getDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_damage ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.damage.multiplierPerLevel;
    
    // If ship hull is active, double the multiplier per level
    const hullLevel = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
    const hullMultiplier = hullLevel > 0 ? 2 : 1;
    
    return 1 + level * multiplierPerLevel * hullMultiplier;
  }

  getShipHullMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
    // Each level doubles the base damage: level 1 = 2x, level 2 = 4x, level 3 = 8x, etc.
    return Math.pow(2, level);
  }

  getPointsMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_points ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.points.multiplierPerLevel;
    return 1 + level * multiplierPerLevel;
  }

  getXPMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_xp ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.xp.multiplierPerLevel;
    return 1 + level * multiplierPerLevel;
  }

  getCritBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_crit ?? 0;
    const bonusPerLevel = Config.ascension.upgrades.crit.bonusPerLevel;
    return level * bonusPerLevel;
  }

  getPassiveMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_passive ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.passive.multiplierPerLevel;
    return 1 + level * multiplierPerLevel;
  }

  getSpeedMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_speed ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.speed.multiplierPerLevel;
    return 1 + level * multiplierPerLevel;
  }

  getStartingLevel(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_starting_level ?? 0;
    const levelsPerUpgrade = Config.ascension.upgrades.startingLevel.levelsPerUpgrade;
    return 1 + level * levelsPerUpgrade;
  }

  getRetainPercentage(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_retain_upgrades ?? 0;
    const percentagePerLevel = Config.ascension.upgrades.retainUpgrades.percentagePerLevel;
    return level * (percentagePerLevel / 100);
  }

  getBossDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_boss_power ?? 0;
    const multiplierPerLevel = Config.ascension.upgrades.bossPower.multiplierPerLevel;
    return 1 + level * multiplierPerLevel;
  }

  getComboBoostMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_combo_boost ?? 0;
    const baseMultiplier = Config.ascension.upgrades.comboBoost.baseMultiplier;
    const bonusPerLevel = Config.ascension.upgrades.comboBoost.bonusPerLevel;
    return baseMultiplier + level * bonusPerLevel;
  }

  getComboDurationBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_combo_duration ?? 0;
    const secondsPerLevel = Config.ascension.upgrades.comboDuration.secondsPerLevel;
    return level * secondsPerLevel;
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

    // Special cost scaling for ship hull: 1, 100, 200, 300, 400
    if (upgradeId === 'prestige_ship_hull') {
      if (currentLevel === 0) return 10;
      if (currentLevel === 1) return 100;
      if (currentLevel === 2) return 250;
      if (currentLevel === 3) return 500;
      if (currentLevel === 4) return 1000;
      return Infinity;
    }

    // Scale cost based on current level: baseCost * (exponentialBase ^ currentLevel)
    // This makes each level progressively more expensive
    const baseCost = upgrade.cost;
    const exponentialBase = Config.ascension.costScaling.exponentialBase;
    const scaledCost = Math.floor(baseCost * Math.pow(exponentialBase, currentLevel));

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
   * Each unspent PP gives +5% to all income (points from clicks, kills, and passive generation)
   */
  getUnspentPPMultiplier(state: GameState): number {
    const unspentPP = state.prestigePoints ?? 0;
    const percentagePerPP = Config.ascension.unspentPPMultiplier.percentagePerPP;
    // Convert percentage to multiplier: 1 + (unspentPP * percentagePerPP / 100)
    return 1 + (unspentPP * percentagePerPP) / 100;
  }
}
