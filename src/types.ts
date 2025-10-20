export interface Vec2 {
  x: number;
  y: number;
}

export interface SaveData {
  points: number;
  shipsCount: number;
  attackSpeedLevel: number;
  autoFireUnlocked: boolean;
  pointMultiplierLevel: number;
  level: number;
  experience: number;
  subUpgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  stats: GameStats;
}

export interface GameStats {
  totalClicks: number;
  totalDamage: number;
  aliensKilled: number;
  bossesKilled: number;
  totalUpgrades: number;
  totalSubUpgrades: number;
  maxLevel: number;
  playTime: number; // seconds
}

export interface GameState {
  points: number;
  shipsCount: number;
  attackSpeedLevel: number;
  autoFireUnlocked: boolean;
  pointMultiplierLevel: number;
  level: number;
  experience: number;
  subUpgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  stats: GameStats;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  getCost: (level: number) => number;
  canBuy: (state: GameState) => boolean;
  buy: (state: GameState) => void;
  getLevel: (state: GameState) => number;
  getDisplayText: (state: GameState) => string;
  subUpgrades?: SubUpgrade[];
}

export type GameMode = 'normal' | 'boss' | 'transition';

export interface BallColor {
  fill: string;
  stroke: string;
  hp: number;
}

export interface SubUpgrade {
  id: string;
  name: string;
  description: string;
  flavor: string;
  cost: number;
  owned: boolean;
  requires: (state: GameState) => boolean;
  isVisible: (state: GameState) => boolean;
  buy: (state: GameState) => void;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'progression' | 'collection' | 'mastery' | 'secret';
  unlocked: boolean;
  check: (state: GameState) => boolean;
  hidden?: boolean; // Don't show unlock condition until unlocked
}

