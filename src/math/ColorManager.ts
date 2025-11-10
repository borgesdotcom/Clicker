import type { BallColor } from '../types';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ColorManager {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  private static colors: BallColor[] = [
    { fill: '#fff', stroke: '#ccc', hp: 10 },
    { fill: '#ddd', stroke: '#aaa', hp: 20 },
    { fill: '#bbb', stroke: '#888', hp: 35 },
    { fill: '#999', stroke: '#666', hp: 55 },
    { fill: '#ff4444', stroke: '#cc0000', hp: 120 },
    { fill: '#ff8800', stroke: '#cc6600', hp: 180 },
    { fill: '#ffdd00', stroke: '#ccaa00', hp: 260 },
    { fill: '#88ff00', stroke: '#66cc00', hp: 360 },
    { fill: '#00ff88', stroke: '#00cc66', hp: 480 },
    { fill: '#0088ff', stroke: '#0066cc', hp: 620 },
    { fill: '#8800ff', stroke: '#6600cc', hp: 780 },
    { fill: '#ff0088', stroke: '#cc0066', hp: 960 },
    { fill: '#ff6600', stroke: '#cc4400', hp: 1160 },
    { fill: '#ffaa00', stroke: '#cc8800', hp: 1380 },
    { fill: '#00ffff', stroke: '#00cccc', hp: 1620 },
    { fill: '#ff00ff', stroke: '#cc00cc', hp: 1880 },
    { fill: '#66ff66', stroke: '#44cc44', hp: 2160 },
    { fill: '#ff6666', stroke: '#cc4444', hp: 2460 },
    { fill: '#6666ff', stroke: '#4444cc', hp: 2780 },
    { fill: '#ffff00', stroke: '#cccc00', hp: 3120 },
  ];

  static getColorForLevel(level: number): BallColor {
    const index = Math.min(level - 1, this.colors.length - 1);
    const color = this.colors[index];
    if (!color) {
      return (
        this.colors[this.colors.length - 1] ||
        this.colors[0] || { fill: '#fff', stroke: '#ccc', hp: 10 }
      );
    }
    return color;
  }

  static getExpRequired(level: number): number {
    // Smooth exponential XP requirements for levels 1-1000+
    // Uses softcaps to prevent runaway growth at high levels

    let baseXP = 10 * Math.pow(1.1, level);

    // Apply softcaps at specific thresholds
    if (level >= 800) {
      // Severe softcap: reduce by 25%
      baseXP *= 0.75;
    } else if (level >= 500) {
      // Major softcap: reduce by 15%
      baseXP *= 0.85;
    } else if (level >= 200) {
      // Minor softcap: reduce by 10%
      baseXP *= 0.9;
    }

    // Add logarithmic damping for very high levels
    const dampingFactor = Math.max(1, Math.log10(level + 10) / Math.log10(11));

    return Math.floor(baseXP / dampingFactor);
  }

  static isBossLevel(level: number): boolean {
    // Boss battles at regular intervals throughout progression
    // Early game: every 25 levels
    // Mid game: every 50 levels after 100
    // Late game: every 100 levels after 500

    if (level < 1) return false;

    // Special milestone bosses
    if (
      level === 50 ||
      level === 100 ||
      level === 250 ||
      level === 500 ||
      level === 750 ||
      level === 1000
    ) {
      return true;
    }

    // Regular boss intervals
    if (level <= 100) {
      return level % 25 === 0; // Bosses at 25, 50, 75, 100
    } else if (level <= 500) {
      return level % 50 === 0; // Bosses at 150, 200, 250, etc.
    } else {
      return level % 100 === 0; // Bosses at 600, 700, 800, etc.
    }
  }

  // New method: Get alien HP with proper scaling for level 1-1000
  // Rebalanced to prevent exponential explosion at high levels
  static getHp(level: number): number {
    const baseHp = 120;

    // Tier 1: Levels 1-100 - Mildly faster growth to set the pace
    if (level <= 100) {
      return Math.floor(baseHp * Math.pow(1.18, level - 1));
    }

    // Tier 2: Levels 101-300 - Steeper ramp to slow mid-game snowballing
    const tier1Hp = baseHp * Math.pow(1.18, 99);
    if (level <= 300) {
      return Math.floor(tier1Hp * Math.pow(1.16, level - 100));
    }

    // Tier 3: Levels 301-600 - Continue increasing but slightly softer
    const tier2Hp = tier1Hp * Math.pow(1.16, 200);
    if (level <= 600) {
      return Math.floor(tier2Hp * Math.pow(1.13, level - 300));
    }

    // Tier 4: 601+ - Still growing, but controlled to avoid impossible numbers
    const tier3Hp = tier2Hp * Math.pow(1.13, 300);
    return Math.floor(tier3Hp * Math.pow(1.1, level - 600));
  }

  static getBossHp(level: number): number {
    // Boss HP: tougher multiplier plus additional scaling tiers
    const baseHp = this.getHp(level) * 18;

    if (level < 50) {
      return Math.floor(baseHp);
    }

    if (level < 150) {
      return Math.floor(baseHp * Math.pow(1.08, level - 50));
    }

    const tier1Bonus = Math.pow(1.08, 100);
    if (level < 300) {
      return Math.floor(baseHp * tier1Bonus * Math.pow(1.1, level - 150));
    }

    const tier2Bonus = tier1Bonus * Math.pow(1.1, 150);
    if (level < 600) {
      return Math.floor(baseHp * tier2Bonus * Math.pow(1.08, level - 300));
    }

    const tier3Bonus = tier2Bonus * Math.pow(1.08, 300);
    return Math.floor(baseHp * tier3Bonus * Math.pow(1.06, level - 600));
  }

  // Get boss timer limit (scales with level)
  static getBossTimeLimit(level: number): number {
    const baseTime = 30;

    if (level < 50) {
      return baseTime;
    } else if (level < 200) {
      // +5s per 10 levels
      return baseTime + Math.floor((level - 50) / 10) * 5;
    } else if (level < 500) {
      // Previous bonus + 10s per 10 levels
      return baseTime + 75 + Math.floor((level - 200) / 10) * 10;
    } else {
      // Previous bonuses + 15s per 10 levels
      return baseTime + 75 + 300 + Math.floor((level - 500) / 10) * 15;
    }
  }
}
