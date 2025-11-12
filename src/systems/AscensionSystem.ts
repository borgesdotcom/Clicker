import type { GameState } from '../types';

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
        effect: '+10% damage per level',
      },
      {
        id: 'prestige_points',
        name: 'Cosmic Fortune',
        description: 'Permanently increase point gains',
        cost: 1,
        maxLevel: 100, // Extended for late game
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.prestige_points ?? 0,
        effect: '+15% points per level',
      },
      {
        id: 'prestige_xp',
        name: 'Ancient Wisdom',
        description: 'Permanently increase XP gains',
        cost: 1,
        maxLevel: 100, // Extended for late game
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_xp ?? 0,
        effect: '+20% XP per level',
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
        effect: '+25% passive per level',
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
        id: 'auto_buy_unlock',
        name: 'Auto-Buy Protocol',
        description: 'Unlock automatic purchase of affordable upgrades',
        cost: 50,
        maxLevel: 1,
        getCurrentLevel: (state) =>
          state.prestigeUpgrades?.auto_buy_unlock ?? 0,
        effect: 'Unlocks Auto-Buy feature',
      },
    ];
  }

  getUpgrades(): AscensionUpgrade[] {
    return this.ascensionUpgrades;
  }

  calculatePrestigePoints(state: GameState): number {
    const breakdown = this.calculatePrestigePointsBreakdown(state);
    return breakdown.base + breakdown.bonus;
  }

  calculatePrestigePointsBreakdown(state: GameState): {
    base: number;
    bonus: number;
    previousBest: number;
  } {
    // Always give base PP for ascending past level 99
    // Bonus PP for surpassing previous best level
    if (state.level < 100) {
      return {
        base: 0,
        bonus: 0,
        previousBest: state.highestLevelReached ?? 0,
      };
    }

    const isFirstAscension = state.prestigeLevel === 0;
    const previousHighest = state.highestLevelReached ?? 0;

    // For first ascension: all points are "base" (no previous best to beat)
    if (isFirstAscension) {
      let basePoints = 0;

      // Minimal PP for early ascension attempts (levels 101-110)
      const earlyLevels = Math.min(state.level, 110);
      if (earlyLevels > 100) {
        basePoints += Math.floor((earlyLevels - 100) / 2);
      }

      for (let level = 111; level <= state.level; level++) {
        const scaledLevel = level - 110;
        const levelPoints = Math.floor(3 + Math.pow(scaledLevel / 22, 1.35));
        basePoints += levelPoints;
      }

      // Milestone bonuses
      const milestones = [
        { level: 1000, bonus: 200 },
        { level: 750, bonus: 100 },
        { level: 500, bonus: 50 },
        { level: 250, bonus: 20 },
      ];

      for (const milestone of milestones) {
        if (state.level >= milestone.level) {
          basePoints += milestone.bonus;
        }
      }

      // Achievement bonus
      const achievementBonus = this.calculateAchievementBonus(state);
      basePoints += achievementBonus;

      return {
        base: Math.max(0, basePoints),
        bonus: 0,
        previousBest: 0,
      };
    }

    // For subsequent ascensions:
    // Base PP: Always given for levels past 99 (scaled by current level)
    // Bonus PP: Extra for surpassing previous best
    let basePoints = 0;
    let bonusPoints = 0;

    // Base PP: Calculate for all levels from 100 to current
    // This ensures players always get something for ascending past 99
    for (let level = 100; level <= state.level; level++) {
      if (level <= 110) continue; // No base PP for minimal pushes
      const scaledLevel = level - 110;
      const baseLevelPoints = Math.floor(1 + Math.pow(scaledLevel / 30, 1.25));
      basePoints += baseLevelPoints;
    }

    // Bonus PP: Only for NEW levels beyond previous best
    // If previousHighest is 0 or undefined, treat it as if they haven't set a record yet
    // (This handles edge cases where highestLevelReached wasn't saved properly)
    const effectivePreviousBest = previousHighest > 0 ? previousHighest : 0;

    if (state.level > effectivePreviousBest) {
      // Calculate bonus for levels beyond previous best
      const startLevel = Math.max(100, effectivePreviousBest + 1);
      for (let level = startLevel; level <= state.level; level++) {
        if (level <= 110) continue;
        const progress = level - Math.max(110, effectivePreviousBest);
        const bonusLevelPoints = Math.floor(4 + Math.pow(progress / 6, 1.35));
        bonusPoints += bonusLevelPoints;
      }

      // Milestone bonuses: only award if we're crossing the milestone for the first time
      const milestones = [
        { level: 1000, bonus: 200 },
        { level: 750, bonus: 100 },
        { level: 500, bonus: 50 },
        { level: 250, bonus: 20 },
      ];

      for (const milestone of milestones) {
        if (
          effectivePreviousBest < milestone.level &&
          state.level >= milestone.level
        ) {
          bonusPoints += milestone.bonus;
        }
      }
    }

    // Achievement bonus goes to base (always available)
    const achievementBonus = this.calculateAchievementBonus(state);
    basePoints += achievementBonus;

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
    return 1 + level * 0.1;
  }

  getPointsMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_points ?? 0;
    return 1 + level * 0.15;
  }

  getXPMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_xp ?? 0;
    return 1 + level * 0.2;
  }

  getCritBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_crit ?? 0;
    return level * 2;
  }

  getPassiveMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_passive ?? 0;
    return 1 + level * 0.25;
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

  isAutoBuyUnlocked(state: GameState): boolean {
    const level = state.prestigeUpgrades?.auto_buy_unlock ?? 0;
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
