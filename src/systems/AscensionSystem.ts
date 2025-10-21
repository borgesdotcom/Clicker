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
        maxLevel: 50,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_damage ?? 0,
        effect: '+10% damage per level',
      },
      {
        id: 'prestige_points',
        name: 'Cosmic Fortune',
        description: 'Permanently increase point gains',
        cost: 1,
        maxLevel: 50,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_points ?? 0,
        effect: '+15% points per level',
      },
      {
        id: 'prestige_xp',
        name: 'Ancient Wisdom',
        description: 'Permanently increase XP gains',
        cost: 1,
        maxLevel: 50,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_xp ?? 0,
        effect: '+20% XP per level',
      },
      {
        id: 'prestige_crit',
        name: 'Lucky Stars',
        description: 'Permanently increase critical hit chance',
        cost: 2,
        maxLevel: 25,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_crit ?? 0,
        effect: '+2% crit chance per level',
      },
      {
        id: 'prestige_passive',
        name: 'Idle Mastery',
        description: 'Permanently increase passive generation',
        cost: 2,
        maxLevel: 30,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_passive ?? 0,
        effect: '+25% passive per level',
      },
      {
        id: 'prestige_speed',
        name: 'Time Dilation',
        description: 'Permanently increase attack speed',
        cost: 3,
        maxLevel: 20,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_speed ?? 0,
        effect: '+5% attack speed per level',
      },
      {
        id: 'prestige_starting_level',
        name: 'Head Start',
        description: 'Start at a higher level after ascension',
        cost: 5,
        maxLevel: 10,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_starting_level ?? 0,
        effect: 'Start +5 levels per level',
      },
      {
        id: 'prestige_retain_upgrades',
        name: 'Persistent Memory',
        description: 'Retain a percentage of upgrade levels',
        cost: 10,
        maxLevel: 5,
        getCurrentLevel: (state) => state.prestigeUpgrades?.prestige_retain_upgrades ?? 0,
        effect: 'Retain +10% upgrades per level',
      },
    ];
  }

  getUpgrades(): AscensionUpgrade[] {
    return this.ascensionUpgrades;
  }

  calculatePrestigePoints(state: GameState): number {
    // Clicker game formula: generous early gains, exponential growth
    // Formula based on level milestones
    if (state.level < 100) return 0;
    
    // Base formula: levels past 100 give prestige points
    // Level 100 = 5 PP, Level 150 = 10 PP, Level 200 = 20 PP
    const levelPast100 = state.level - 100;
    const levelBonus = Math.floor(5 + Math.pow(levelPast100 / 10, 1.5));
    
    // Boss bonus
    const bossBonus = Math.floor(state.stats.bossesKilled / 2);
    
    return Math.max(5, levelBonus + bossBonus);
  }

  canAscend(state: GameState): boolean {
    // Can ascend once you reach level 100
    return state.level >= 100;
  }

  getDamageMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_damage ?? 0;
    return 1 + (level * 0.1);
  }

  getPointsMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_points ?? 0;
    return 1 + (level * 0.15);
  }

  getXPMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_xp ?? 0;
    return 1 + (level * 0.2);
  }

  getCritBonus(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_crit ?? 0;
    return level * 2;
  }

  getPassiveMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_passive ?? 0;
    return 1 + (level * 0.25);
  }

  getSpeedMultiplier(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_speed ?? 0;
    return 1 + (level * 0.05);
  }

  getStartingLevel(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_starting_level ?? 0;
    return 1 + (level * 5);
  }

  getRetainPercentage(state: GameState): number {
    const level = state.prestigeUpgrades?.prestige_retain_upgrades ?? 0;
    return level * 0.1;
  }

  buyPrestigeUpgrade(state: GameState, upgradeId: string): boolean {
    const upgrade = this.ascensionUpgrades.find(u => u.id === upgradeId);
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

