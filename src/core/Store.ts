import type { GameState } from '../types';

export class Store {
  private state: GameState;
  private listeners: (() => void)[] = [];

  constructor(initialState: GameState) {
    this.state = { ...initialState };
  }

  getState(): GameState {
    return { ...this.state };
  }

  setState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  addPoints(amount: number): void {
    this.state.points += amount;
    this.state.stats.totalDamage += amount;
    this.notifyListeners();
  }

  spendPoints(amount: number): boolean {
    if (this.state.points >= amount) {
      this.state.points -= amount;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  incrementClick(): void {
    this.state.stats.totalClicks++;
  }

  incrementAlienKill(): void {
    this.state.stats.aliensKilled++;
  }

  incrementBossKill(): void {
    this.state.stats.bossesKilled++;
  }

  incrementUpgrade(): void {
    this.state.stats.totalUpgrades++;
  }

  incrementSubUpgrade(): void {
    this.state.stats.totalSubUpgrades++;
  }

  updateMaxLevel(): void {
    if (this.state.level > this.state.stats.maxLevel) {
      this.state.stats.maxLevel = this.state.level;
    }
  }

  addPlayTime(seconds: number): void {
    this.state.stats.playTime += seconds;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

