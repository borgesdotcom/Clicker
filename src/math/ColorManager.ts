import type { BallColor } from '../types';
import { Config } from '../core/GameConfig';

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
    const xpConfig = Config.progression.xp;

    // Calculate base XP with exponential growth
    let baseXP = xpConfig.base * Math.pow(xpConfig.growthRate, level);

    // Apply softcaps at configured thresholds
    for (const softcap of xpConfig.softcaps) {
      if (level >= softcap.minLevel) {
        baseXP *= softcap.multiplier;
      }
    }

    // Add logarithmic damping for very high levels
    const dampingConfig = xpConfig.damping;
    const dampingFactor = Math.max(
      1,
      Math.log10(level + dampingConfig.base) /
        Math.log10(dampingConfig.divisor),
    );

    return Math.floor(baseXP / dampingFactor);
  }

  static isBossLevel(level: number): boolean {
    if (level < 1) return false;

    const bossConfig = Config.enemies.boss;

    // Check milestone bosses first
    if (bossConfig.milestones.includes(level)) {
      return true;
    }

    // Check regular boss intervals
    const intervals = bossConfig.intervals;
    if (level <= intervals.earlyThreshold) {
      return level % intervals.early === 0;
    } else if (level <= intervals.midThreshold) {
      return level % intervals.mid === 0;
    } else {
      return level % intervals.late === 0;
    }
  }

  // New method: Get alien HP with proper scaling for level 1-1000
  // Rebalanced to prevent exponential explosion at high levels
  static getHp(level: number): number {
    const hpConfig = Config.enemies.hpScaling;
    const baseHp = hpConfig.baseHp;

    let hpBase = baseHp;
    let previousTierHp = baseHp;
    let previousMaxLevel = 1;

    // Calculate HP using configured tiers
    for (const tier of hpConfig.tiers) {
      const tierMaxLevel =
        tier.maxLevel === null || tier.maxLevel === Infinity
          ? Infinity
          : tier.maxLevel;

      if (level <= tierMaxLevel) {
        const levelsInTier = level - previousMaxLevel;
        hpBase = previousTierHp * Math.pow(tier.multiplier, levelsInTier);
        break;
      }

      // Calculate HP at end of this tier for next tier
      const levelsInTier = tierMaxLevel - previousMaxLevel;
      previousTierHp = previousTierHp * Math.pow(tier.multiplier, levelsInTier);
      previousMaxLevel = tierMaxLevel;
    }

    // Apply HP ramp
    const ramp = this.getHpRamp(level);
    return Math.floor(hpBase * ramp);
  }

  static getBossHp(level: number): number {
    const bossConfig = Config.enemies.boss;
    const baseHp = this.getHp(level) * bossConfig.hpMultiplier;
    const nerfFactor = bossConfig.nerfFactor;

    let hpBonus = 1;
    let previousMinLevel = 0;

    // Calculate HP bonus using configured tiers
    for (const tier of bossConfig.hpTiers) {
      if (tier.maxLevel !== undefined && level >= tier.maxLevel) {
        // Calculate bonus up to maxLevel
        const levelsInTier =
          tier.maxLevel - Math.max(tier.minLevel, previousMinLevel);
        hpBonus *= Math.pow(tier.bonusMultiplier, levelsInTier);
        previousMinLevel = tier.maxLevel;
        continue;
      }

      // Apply bonus for current tier
      if (level >= tier.minLevel) {
        const levelsInTier = level - Math.max(tier.minLevel, previousMinLevel);
        hpBonus *= Math.pow(tier.bonusMultiplier, levelsInTier);
        break;
      }
    }

    return Math.floor(baseHp * hpBonus * nerfFactor);
  }

  // Get boss timer limit (scales with level)
  static getBossTimeLimit(level: number): number {
    const timeConfig = Config.enemies.boss.timeLimit;
    let time = timeConfig.baseSeconds;

    // Apply time bonuses from tiers
    for (const tier of timeConfig.tiers) {
      if (tier.maxLevel !== undefined && level >= tier.maxLevel) {
        // Apply full bonus for this tier
        const levelsInTier = tier.maxLevel - tier.minLevel;
        time += Math.floor(levelsInTier / 10) * tier.secondsPer10Levels;
        if (tier.baseBonus !== undefined) {
          time += tier.baseBonus;
        }
        continue;
      }

      if (level >= tier.minLevel) {
        // Apply partial bonus for current tier
        const levelsInTier = level - tier.minLevel;
        time += Math.floor(levelsInTier / 10) * tier.secondsPer10Levels;
        if (tier.baseBonus !== undefined) {
          time += tier.baseBonus;
        }
        break;
      }
    }

    return time;
  }

  private static getHpRamp(level: number): number {
    const rampConfig = Config.enemies.hpScaling.ramp;

    if (level <= rampConfig.startLevel) {
      return 1;
    }

    const extraLevels = level - rampConfig.startLevel;
    const linearComponent = 1 + extraLevels * rampConfig.linearComponent;
    const exponentialComponent = Math.pow(
      rampConfig.exponentialBase,
      Math.min(extraLevels, rampConfig.exponentialCap),
    );

    // Clamp to avoid runaway values at extremely high levels
    return Math.min(linearComponent * exponentialComponent, rampConfig.maxRamp);
  }
}
