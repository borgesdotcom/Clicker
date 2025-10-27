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
        effect: 'Retain +10% upgrades per level',
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
    ];
  }

  getUpgrades(): AscensionUpgrade[] {
    return this.ascensionUpgrades;
  }

  calculatePrestigePoints(state: GameState): number {
    // Enhanced prestige point formula for levels 100-1000+
    // IMPORTANT: Only award points for NEW levels beyond previous highest

    if (state.level < 100) return 0;

    // Get the highest level previously reached (default to 99 if first ascension)
    const previousHighest = state.highestLevelReached ?? 99;

    // If current level doesn't exceed previous highest, no points awarded
    if (state.level <= previousHighest) {
      return 0;
    }

    // Calculate points only for the NEW levels (previousHighest + 1 to current level)
    let totalPoints = 0;

    // Add points for each new level reached
    for (
      let level = Math.max(100, previousHighest + 1);
      level <= state.level;
      level++
    ) {
      const levelPast100 = level - 100;
      const levelPoints = Math.floor(5 + Math.pow(levelPast100 / 12, 1.45));
      totalPoints += levelPoints;
    }

    // Milestone bonuses: only award if we're crossing the milestone for the first time
    const milestones = [
      { level: 1000, bonus: 200 },
      { level: 750, bonus: 100 },
      { level: 500, bonus: 50 },
      { level: 250, bonus: 20 },
    ];

    for (const milestone of milestones) {
      // Award milestone bonus if we just crossed it (prev < milestone <= current)
      if (previousHighest < milestone.level && state.level >= milestone.level) {
        totalPoints += milestone.bonus;
      }
    }

    // Boss bonus: only count NEW bosses killed since last ascension
    // This is tracked separately, so we skip it for now to keep it simple
    // (bosses killed is cumulative and doesn't reset on ascension)

    // Achievement bonus: certain achievements grant extra PP (one-time bonuses)
    const achievementBonus = this.calculateAchievementBonus(state);
    totalPoints += achievementBonus;

    return Math.max(0, totalPoints);
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
    return level * 0.1;
  }

  getBossDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_boss_power ?? 0;
    return 1 + level * 0.2;
  }

  getComboBoostMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_combo_boost ?? 0;
    // Adds extra combo multiplier rate
    return 0.001 + level * 0.0005;
  }

  buyPrestigeUpgrade(state: GameState, upgradeId: string): boolean {
    const upgrade = this.ascensionUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = upgrade.getCurrentLevel(state);
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = upgrade.cost;
    if (state.prestigePoints < cost) return false;

    // Initialize prestigeUpgrades if needed
    if (!state.prestigeUpgrades) {
      state.prestigeUpgrades = {};
    }

    state.prestigePoints -= cost;
    state.prestigeUpgrades[upgradeId] = currentLevel + 1;

    return true;
  }
}
