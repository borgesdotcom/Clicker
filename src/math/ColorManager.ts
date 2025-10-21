import type { BallColor } from '../types';

export class ColorManager {
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
    return this.colors[index] ?? this.colors[this.colors.length - 1]!;
  }

  static getExpRequired(level: number): number {
    // Smoother exponential XP requirements - balanced for better progression
    // Changed from 1.15 to 1.12 and added logarithmic damping for high levels
    const baseXP = 10 * Math.pow(1.12, level);
    const dampingFactor = Math.max(1, Math.log10(level + 1));
    return Math.floor(baseXP / dampingFactor);
  }

  static isBossLevel(level: number): boolean {
    // Boss battles only at levels 50 and 100
    return level === 50 || level === 100;
  }

  static getBossHp(level: number): number {
    return Math.floor(5000 * Math.pow(1.5, (level / 5) - 1));
  }
}

