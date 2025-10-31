import { AlienBall } from './AlienBall';
import type { Draw } from '../render/Draw';
import { ColorManager } from '../math/ColorManager';

export type EnemyType = 'normal' | 'scout' | 'tank' | 'healer';

export interface EnemyStats {
  type: EnemyType;
  hpMultiplier: number;
  pointsMultiplier: number;
  color: string;
  glowColor: string;
  size: number;
}

// Color pools for variety
const NORMAL_COLORS = [
  { color: '#ff6666', glow: 'rgba(255, 102, 102, 0.5)' }, // Soft red
  { color: '#ff9966', glow: 'rgba(255, 153, 102, 0.5)' }, // Orange
  { color: '#ffcc66', glow: 'rgba(255, 204, 102, 0.5)' }, // Yellow-orange
  { color: '#66ff66', glow: 'rgba(102, 255, 102, 0.5)' }, // Soft green
  { color: '#66ffcc', glow: 'rgba(102, 255, 204, 0.5)' }, // Teal
  { color: '#6699ff', glow: 'rgba(102, 153, 255, 0.5)' }, // Soft blue
  { color: '#9966ff', glow: 'rgba(153, 102, 255, 0.5)' }, // Purple
  { color: '#ff66cc', glow: 'rgba(255, 102, 204, 0.5)' }, // Pink
];

const SCOUT_COLORS = [
  { color: '#ffff66', glow: 'rgba(255, 255, 102, 0.5)' }, // Soft yellow
  { color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.5)' }, // Gold
];

const TANK_COLORS = [
  { color: '#ff6666', glow: 'rgba(255, 102, 102, 0.5)' }, // Soft red
  { color: '#cc4444', glow: 'rgba(204, 68, 68, 0.5)' }, // Dark red
  { color: '#ff9944', glow: 'rgba(255, 153, 68, 0.5)' }, // Orange-red
  { color: '#cc6633', glow: 'rgba(204, 102, 51, 0.5)' }, // Burnt orange
  { color: '#ff7755', glow: 'rgba(255, 119, 85, 0.5)' }, // Coral
  { color: '#dd5533', glow: 'rgba(221, 85, 51, 0.5)' }, // Dark coral
];

const HEALER_COLORS = [
  { color: '#66ff99', glow: 'rgba(102, 255, 153, 0.5)' }, // Soft green
  { color: '#00cc88', glow: 'rgba(0, 204, 136, 0.5)' }, // Teal green
];

function getRandomColor(colors: Array<{ color: string; glow: string }>): {
  color: string;
  glow: string;
} {
  const index = Math.floor(Math.random() * colors.length);
  const selected = colors[index];
  return (
    selected ??
    colors[0] ?? { color: '#ff6666', glow: 'rgba(255, 102, 102, 0.5)' }
  );
}

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  normal: {
    type: 'normal',
    hpMultiplier: 1,
    pointsMultiplier: 1,
    color: '#ff6666', // Will be randomized
    glowColor: 'rgba(255, 102, 102, 0.5)',
    size: 1,
  },
  scout: {
    type: 'scout',
    hpMultiplier: 0.5,
    pointsMultiplier: 1.5,
    color: '#ffff66',
    glowColor: 'rgba(255, 255, 102, 0.5)',
    size: 0.7,
  },
  tank: {
    type: 'tank',
    hpMultiplier: 3,
    pointsMultiplier: 2.5,
    color: '#ff6666',
    glowColor: 'rgba(255, 102, 102, 0.5)',
    size: 1.4,
  },
  healer: {
    type: 'healer',
    hpMultiplier: 0.8,
    pointsMultiplier: 3,
    color: '#66ff99',
    glowColor: 'rgba(102, 255, 153, 0.5)',
    size: 1,
  },
};

export class EnhancedAlienBall extends AlienBall {
  public enemyType: EnemyType;
  private stats: EnemyStats;
  private healTimer = 0;
  private healInterval = 2;
  private animationTime = 0; // For visual animations

  constructor(
    x: number,
    y: number,
    radius: number,
    level: number,
    enemyType: EnemyType = 'normal',
  ) {
    // Get stats first to determine color
    const stats = { ...ENEMY_TYPES[enemyType] };

    // Randomize color based on enemy type
    let colorData;
    switch (enemyType) {
      case 'scout':
        colorData = getRandomColor(SCOUT_COLORS);
        break;
      case 'tank':
        colorData = getRandomColor(TANK_COLORS);
        break;
      case 'healer':
        colorData = getRandomColor(HEALER_COLORS);
        break;
      default:
        colorData = getRandomColor(NORMAL_COLORS);
    }

    stats.color = colorData.color;
    stats.glowColor = colorData.glow;

    // Create a color based on enemy type
    const color = {
      fill: stats.color,
      stroke: '#ffffff',
      hp: 100,
    };

    // Call parent constructor
    super(x, y, radius, color);

    this.enemyType = enemyType;
    this.stats = stats;

    // Use ColorManager for consistent HP scaling
    const baseHp = ColorManager.getHp(level);

    this.maxHp = Math.floor(baseHp * this.stats.hpMultiplier);
    this.currentHp = this.maxHp;

    // Apply size modifier
    this.radius = radius * this.stats.size;
  }

  public getPointsReward(basePoints: number): number {
    return Math.floor(basePoints * this.stats.pointsMultiplier);
  }

  public override takeDamage(amount: number): boolean {
    // Call parent takeDamage
    return super.takeDamage(amount);
  }

  public override update(
    dt: number,
    _canvasWidth?: number,
    _canvasHeight?: number,
  ): void {
    super.update(dt);

    // Update animation time for all enemy types
    this.animationTime += dt;

    // Healer ability: slowly regenerates health
    if (this.enemyType === 'healer' && this.currentHp < this.maxHp) {
      this.healTimer += dt;
      if (this.healTimer >= this.healInterval) {
        const healAmount = this.maxHp * 0.05; // 5% heal
        this.currentHp = Math.min(this.maxHp, this.currentHp + healAmount);
        this.healTimer = 0;
      }
    }
  }

  public override draw(drawer: Draw): void {
    const ctx = drawer.getContext();
    const centerX = this.x;
    const centerY = this.y;

    // Draw glow effect
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      this.radius * 2,
    );
    gradient.addColorStop(0, this.stats.glowColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      centerX - this.radius * 2,
      centerY - this.radius * 2,
      this.radius * 4,
      this.radius * 4,
    );

    // Draw enemy-specific effects
    switch (this.enemyType) {
      case 'scout':
        this.drawScout(ctx, centerX, centerY);
        break;
      case 'tank':
        this.drawTank(ctx, centerX, centerY);
        break;
      case 'healer':
        this.drawHealer(ctx, centerX, centerY);
        break;
      default:
        super.draw(drawer);
    }
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    const barWidth = this.radius * 2;
    const barHeight = 6;
    const barX = centerX - barWidth / 2;
    // Adjust position based on enemy type for better spacing
    const extraOffset = this.enemyType === 'tank' ? 5 : 0; // Tanks need more space due to armor
    const barY = centerY - this.radius - 18 - extraOffset;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill - color changes based on health percentage
    const healthPercent = this.currentHp / this.maxHp;

    let fillColor = '#00ff00'; // Green
    if (healthPercent < 0.3)
      fillColor = '#ff0000'; // Red
    else if (healthPercent < 0.6) fillColor = '#ffaa00'; // Orange

    ctx.fillStyle = fillColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  private drawScout(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY);

    // Main bubble body (smaller, faster bubble)
    const gradient = ctx.createRadialGradient(
      centerX - this.radius * 0.3,
      centerY - this.radius * 0.3,
      this.radius * 0.1,
      centerX,
      centerY,
      this.radius,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.3, this.stats.color + '99');
    gradient.addColorStop(1, this.stats.color + 'cc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glossy highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      centerX - this.radius * 0.35,
      centerY - this.radius * 0.35,
      this.radius * 0.35,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Bubble edge
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawTank(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY);

    // Tank = thick reinforced bubble!
    const shieldPulse = Math.sin(this.animationTime * 2) * 2;

    // Draw outer shield layers (multiple bubble layers)
    for (let layer = 0; layer < 3; layer++) {
      const layerRadius = this.radius + 10 + layer * 5 + shieldPulse;
      const layerAlpha = 0.15 - layer * 0.03;
      const layerGradient = ctx.createRadialGradient(
        centerX - layerRadius * 0.3,
        centerY - layerRadius * 0.3,
        layerRadius * 0.1,
        centerX,
        centerY,
        layerRadius,
      );
      layerGradient.addColorStop(
        0,
        `rgba(255, 100, 100, ${String(layerAlpha + 0.2)})`,
      );
      layerGradient.addColorStop(
        0.5,
        `rgba(255, 68, 68, ${String(layerAlpha)})`,
      );
      layerGradient.addColorStop(1, `rgba(255, 68, 68, 0)`);
      ctx.fillStyle = layerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main reinforced bubble body (larger, thicker)
    const bodyScale = 1 + Math.sin(this.animationTime * 1.5) * 0.02;
    const gradient = ctx.createRadialGradient(
      centerX - this.radius * 0.3,
      centerY - this.radius * 0.3,
      this.radius * 0.1,
      centerX,
      centerY,
      this.radius * bodyScale,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    gradient.addColorStop(0.3, this.stats.color + 'aa');
    gradient.addColorStop(1, this.stats.color + 'dd');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius * bodyScale, 0, Math.PI * 2);
    ctx.fill();

    // Extra thick glossy highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(
      centerX - this.radius * 0.35,
      centerY - this.radius * 0.35,
      this.radius * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Thick bubble edge
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius * bodyScale, 0, Math.PI * 2);
    ctx.stroke();

    // Inner reinforcement rings
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawHealer(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY);

    // Healing aura (soothing green bubble glow)
    const pulseSize = Math.sin(Date.now() * 0.003) * 5;
    const auraGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      this.radius + 15 + pulseSize,
    );
    auraGradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
    auraGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.15)');
    auraGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius + 15 + pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Main healing bubble body
    const gradient = ctx.createRadialGradient(
      centerX - this.radius * 0.3,
      centerY - this.radius * 0.3,
      this.radius * 0.1,
      centerX,
      centerY,
      this.radius,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.3, this.stats.color + '99');
    gradient.addColorStop(1, this.stats.color + 'cc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Glossy highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      centerX - this.radius * 0.35,
      centerY - this.radius * 0.35,
      this.radius * 0.35,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Bubble edge
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Healing cross inside bubble
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();

    // Healing particles (tiny bubbles)
    if (
      this.currentHp < this.maxHp &&
      this.healTimer > this.healInterval * 0.5
    ) {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + Date.now() * 0.001;
        const distance = this.radius + 20;
        const px = centerX + Math.cos(angle) * distance;
        const py = centerY + Math.sin(angle) * distance;

        // Draw tiny healing bubbles
        const tinyGradient = ctx.createRadialGradient(px, py, 0, px, py, 3);
        tinyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        tinyGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.8)');
        tinyGradient.addColorStop(1, 'rgba(0, 255, 136, 0.3)');
        ctx.fillStyle = tinyGradient;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

}

export function selectEnemyType(level: number): EnemyType {
  // Unlock enemy types based on level
  if (level < 10) return 'normal';

  // Build list of available special enemy types
  const specialTypes: EnemyType[] = [];
  if (level >= 10) specialTypes.push('scout');
  if (level >= 20) specialTypes.push('tank');
  if (level >= 30) specialTypes.push('healer');

  // 60% normal, 40% special enemies
  const rand = Math.random();
  if (rand < 0.6 || specialTypes.length === 0) {
    return 'normal';
  }

  // Select random special enemy type
  const index = Math.floor(Math.random() * specialTypes.length);
  return specialTypes[index] ?? 'normal';
}
