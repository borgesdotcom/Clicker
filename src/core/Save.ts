import type { SaveData, GameState } from '../types';
import { clamp } from '../math/rng';

const SAVE_KEY = 'alien-clicker-save';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Save {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  static save(state: GameState): void {
    const saveData: SaveData = {
      points: state.points,
      shipsCount: state.shipsCount,
      attackSpeedLevel: state.attackSpeedLevel,
      autoFireUnlocked: state.autoFireUnlocked,
      pointMultiplierLevel: state.pointMultiplierLevel,
      critChanceLevel: state.critChanceLevel,
      resourceGenLevel: state.resourceGenLevel,
      xpBoostLevel: state.xpBoostLevel,
      level: state.level,
      experience: state.experience,
      subUpgrades: state.subUpgrades,
      achievements: state.achievements,
      stats: state.stats,
      prestigeLevel: state.prestigeLevel,
      prestigePoints: state.prestigePoints,
      prestigeUpgrades: state.prestigeUpgrades,
      blockedOnBossLevel: state.blockedOnBossLevel,
      // v3.0: New upgrades
      weaponMasteryLevel: state.weaponMasteryLevel,
      fleetCommandLevel: state.fleetCommandLevel,
      mutationEngineLevel: state.mutationEngineLevel,
      energyCoreLevel: state.energyCoreLevel,
      cosmicKnowledgeLevel: state.cosmicKnowledgeLevel,
      discoveredUpgrades: state.discoveredUpgrades,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }

  static load(): GameState {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        return Save.validate(data);
      }
    } catch (error) {
      console.error('Failed to load save:', error);
    }
    return Save.getDefault();
  }

  static clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  private static validate(data: SaveData): GameState {
    const defaultStats = Save.getDefaultStats();
    return {
      points: clamp(data.points ?? 0, 0, 1e15),
      shipsCount: clamp(data.shipsCount ?? 1, 1, 1000),
      attackSpeedLevel: clamp(data.attackSpeedLevel ?? 0, 0, 1000),
      autoFireUnlocked: data.autoFireUnlocked ?? false,
      pointMultiplierLevel: clamp(data.pointMultiplierLevel ?? 0, 0, 1000),
      critChanceLevel: clamp(data.critChanceLevel ?? 0, 0, 1000),
      resourceGenLevel: clamp(data.resourceGenLevel ?? 0, 0, 1000),
      xpBoostLevel: clamp(data.xpBoostLevel ?? 0, 0, 1000),
      level: clamp(data.level ?? 1, 1, 10000),
      experience: clamp(data.experience ?? 0, 0, 1e15),
      subUpgrades: data.subUpgrades ?? {},
      achievements: data.achievements ?? {},
      stats: {
        ...defaultStats,
        ...data.stats,
        criticalHits: data.stats?.criticalHits ?? 0,
        totalPrestige: data.stats?.totalPrestige ?? 0,
        milestonesReached: data.stats?.milestonesReached ?? 0,
      },
      prestigeLevel: clamp(data.prestigeLevel ?? 0, 0, 1000),
      prestigePoints: clamp(data.prestigePoints ?? 0, 0, 1e15),
      prestigeUpgrades: data.prestigeUpgrades ?? {},
      blockedOnBossLevel: data.blockedOnBossLevel ?? null,
      // v3.0: New upgrades
      weaponMasteryLevel: data.weaponMasteryLevel ?? 0,
      fleetCommandLevel: data.fleetCommandLevel ?? 0,
      mutationEngineLevel: data.mutationEngineLevel ?? 0,
      energyCoreLevel: data.energyCoreLevel ?? 0,
      cosmicKnowledgeLevel: data.cosmicKnowledgeLevel ?? 0,
      discoveredUpgrades: data.discoveredUpgrades ?? { ship: true }, // Ship is always visible
    };
  }

  private static getDefault(): GameState {
    return {
      points: 0,
      shipsCount: 1,
      attackSpeedLevel: 0,
      autoFireUnlocked: false,
      pointMultiplierLevel: 0,
      critChanceLevel: 0,
      resourceGenLevel: 0,
      xpBoostLevel: 0,
      level: 1,
      experience: 0,
      subUpgrades: {},
      achievements: {},
      stats: Save.getDefaultStats(),
      prestigeLevel: 0,
      prestigePoints: 0,
      prestigeUpgrades: {},
      blockedOnBossLevel: null,
      // v3.0: New upgrades
      weaponMasteryLevel: 0,
      fleetCommandLevel: 0,
      mutationEngineLevel: 0,
      energyCoreLevel: 0,
      cosmicKnowledgeLevel: 0,
      discoveredUpgrades: { ship: true }, // Ship is always visible
    };
  }

  private static getDefaultStats() {
    return {
      totalClicks: 0,
      totalDamage: 0,
      aliensKilled: 0,
      bossesKilled: 0,
      totalUpgrades: 0,
      totalSubUpgrades: 0,
      maxLevel: 1,
      playTime: 0,
      criticalHits: 0,
      totalPrestige: 0,
      milestonesReached: 0,
    };
  }
}
