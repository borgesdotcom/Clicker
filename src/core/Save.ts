import type { SaveData, GameState } from '../types';
import { clamp } from '../math/rng';

const SAVE_KEY = 'alien-clicker-save';

export class Save {
  static save(state: GameState): void {
    const saveData: SaveData = {
      points: state.points,
      shipsCount: state.shipsCount,
      attackSpeedLevel: state.attackSpeedLevel,
      autoFireUnlocked: state.autoFireUnlocked,
      pointMultiplierLevel: state.pointMultiplierLevel,
      level: state.level,
      experience: state.experience,
      subUpgrades: state.subUpgrades,
      achievements: state.achievements,
      stats: state.stats,
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
    return {
      points: clamp(data.points ?? 0, 0, 1e15),
      shipsCount: clamp(data.shipsCount ?? 1, 1, 1000),
      attackSpeedLevel: clamp(data.attackSpeedLevel ?? 0, 0, 1000),
      autoFireUnlocked: data.autoFireUnlocked ?? false,
      pointMultiplierLevel: clamp(data.pointMultiplierLevel ?? 0, 0, 1000),
      level: clamp(data.level ?? 1, 1, 10000),
      experience: clamp(data.experience ?? 0, 0, 1e15),
      subUpgrades: data.subUpgrades ?? {},
      achievements: data.achievements ?? {},
      stats: data.stats ?? Save.getDefaultStats(),
    };
  }

  private static getDefault(): GameState {
    return {
      points: 0,
      shipsCount: 1,
      attackSpeedLevel: 0,
      autoFireUnlocked: false,
      pointMultiplierLevel: 0,
      level: 1,
      experience: 0,
      subUpgrades: {},
      achievements: {},
      stats: Save.getDefaultStats(),
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
    };
  }
}

