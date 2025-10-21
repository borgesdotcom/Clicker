/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { GameState } from '../types';

export class Store {
  private state: GameState;
  private listeners: (() => void)[] = [];
  private pendingNotify = false;
  private lastNotifyPoints = 0;

  constructor(initialState: GameState) {
    this.state = { ...initialState };
    
    // Set up periodic notification for throttled updates
    setInterval(() => {
      if (this.pendingNotify) {
        // Always notify if points changed significantly (>5%)
        const pointDiff = Math.abs(this.state.points - this.lastNotifyPoints);
        const shouldNotify = pointDiff > this.lastNotifyPoints * 0.05;
        
        if (shouldNotify || this.pendingNotify) {
          this.notifyListeners();
          this.lastNotifyPoints = this.state.points;
          this.pendingNotify = false;
        }
      }
    }, 30); // Reduced from 50ms to 30ms for more responsive UI
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
    // Mark that we need to notify, but don't do it immediately (throttled by interval)
    this.pendingNotify = true;
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
    this.listeners.forEach((listener) => { listener(); });
  }
}

