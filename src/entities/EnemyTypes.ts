import { AlienBall } from './AlienBall';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';
import { t } from '../core/I18n';
import { ColorManager } from '../math/ColorManager';
import { getSpriteForType } from '../render/AlienSprites';

export type EnemyType =
  | 'normal'
  | 'scout'
  | 'tank'
  | 'healer'
  | 'guardian'
  | 'hoarder';

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

const GUARDIAN_COLORS = [
  { color: '#66ccff', glow: 'rgba(102, 204, 255, 0.5)' },
  { color: '#3388ff', glow: 'rgba(51, 136, 255, 0.5)' },
  { color: '#00b3ff', glow: 'rgba(0, 179, 255, 0.5)' },
];

const HOARDER_COLORS = [
  { color: '#ffd84d', glow: 'rgba(255, 216, 77, 0.5)' },
  { color: '#ffc107', glow: 'rgba(255, 193, 7, 0.5)' },
  { color: '#ffb347', glow: 'rgba(255, 179, 71, 0.5)' },
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
    hpMultiplier: 0.35,
    pointsMultiplier: 1.8,
    color: '#ffff66',
    glowColor: 'rgba(255, 255, 102, 0.5)',
    size: 0.6,
  },
  tank: {
    type: 'tank',
    hpMultiplier: 4,
    pointsMultiplier: 3,
    color: '#ff6666',
    glowColor: 'rgba(255, 102, 102, 0.5)',
    size: 1.6,
  },
  healer: {
    type: 'healer',
    hpMultiplier: 0.9,
    pointsMultiplier: 3.5,
    color: '#66ff99',
    glowColor: 'rgba(102, 255, 153, 0.5)',
    size: 1,
  },
  guardian: {
    type: 'guardian',
    hpMultiplier: 2.2,
    pointsMultiplier: 1.5,
    color: '#66ccff',
    glowColor: 'rgba(102, 204, 255, 0.5)',
    size: 1.2,
  },
  hoarder: {
    type: 'hoarder',
    hpMultiplier: 1.1,
    pointsMultiplier: 8,
    color: '#ffd84d',
    glowColor: 'rgba(255, 216, 77, 0.5)',
    size: 1.1,
  },
};

export class EnhancedAlienBall extends AlienBall {
  public enemyType: EnemyType;
  private stats: EnemyStats;
  private healTimer = 0;
  private healInterval = 2;
  // animationTime is inherited from parent (protected)

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
      case 'guardian':
        colorData = getRandomColor(GUARDIAN_COLORS);
        break;
      case 'hoarder':
        colorData = getRandomColor(HOARDER_COLORS);
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

  public override takeDamage(
    amount: number,
    hitDirection?: Vec2,
    combo?: number,
    isBeam?: boolean,
  ): boolean {
    // Call parent takeDamage
    return super.takeDamage(amount, hitDirection, combo, isBeam);
  }

  public override update(
    dt: number,
    _canvasWidth?: number,
    _canvasHeight?: number,
  ): void {
    super.update(dt);

    // Update animation time for all enemy types (inherited from parent)
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

    // Disable deformation on mobile for performance
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

    // Calculate deformation effect - different for beams vs lasers (same as parent)
    let deformationAmount = 0;

    if (!isMobile && (this as any).deformationTime > 0) {
      if ((this as any).isBeamDeformation) {
        // For beams: continuous pulsing sine wave for sustained effect
        // Pulse at ~4Hz (4 cycles per second) for smooth, noticeable pulsing
        const pulseSpeed = 4 * 2 * Math.PI; // 4 Hz = 4 complete cycles per second = 8π radians/sec
        const pulseValue = Math.sin(
          (this as any).beamDeformationTime * pulseSpeed,
        );
        // Map sine wave (-1 to 1) to (0 to 1) with some base intensity
        const normalizedPulse = (pulseValue + 1) / 2; // 0 to 1
        // Apply pulse with some base deformation (30% to 100% of intensity)
        deformationAmount =
          (0.3 + normalizedPulse * 0.7) * (this as any).deformationIntensity;
      } else {
        // For regular lasers: smooth ease-out curve
        const deformationProgress =
          1 - (this as any).deformationTime / (this as any).deformationDuration;
        const easeOut = 1 - Math.pow(1 - deformationProgress, 2);
        deformationAmount = easeOut * (this as any).deformationIntensity;
      }
    }

    // Calculate deformation displacement and scales
    const pushDistance = deformationAmount * this.radius * 0.3;
    const deformationX = (this as any).deformationDirection.x * pushDistance;
    const deformationY = (this as any).deformationDirection.y * pushDistance;

    const squashAmount = deformationAmount * 0.15;
    const stretchAmount = deformationAmount * 0.1;

    const perpendicularScale = 1 - squashAmount;
    const parallelScale = 1 + stretchAmount;

    let scaleX = 1;
    let scaleY = 1;

    if (
      Math.abs((this as any).deformationDirection.x) >
      Math.abs((this as any).deformationDirection.y)
    ) {
      scaleX = parallelScale;
      scaleY = perpendicularScale;
    } else {
      scaleX = perpendicularScale;
      scaleY = parallelScale;
    }

    // Add pulsing animation for visual variety
    const basePulseValue = Math.sin((this as any).animationTime * 1.5) * 0.02;
    const currentRadius = this.radius * (1 + basePulseValue);

    const centerX = this.x + deformationX + (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);
    const centerY = this.y + deformationY + (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);

    const spriteWidth = currentRadius * 2 * scaleX;
    const spriteHeight = currentRadius * 2 * scaleY;

    // Draw Sprite
    const sprite = getSpriteForType(this.enemyType);
    this.drawPixelSprite(ctx, centerX, centerY, spriteWidth, spriteHeight, sprite, this.stats.color);

    // Flash effect
    if ((this as any).flashTime > 0) {
      const flashAlpha = (this as any).flashTime / (this as any).flashDuration;
      this.drawPixelSprite(ctx, centerX, centerY, spriteWidth, spriteHeight, sprite, '#ffffff', flashAlpha * 0.7);
    }

    // Draw speech bubble if visible
    if ((this as any).speechBubbleVisible && this.currentHp > 0) {
      this.drawSpeechBubble(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    }

    // Draw special effects based on enemy type
    if (this.enemyType === 'guardian') {
      this.drawShieldEffect(ctx, centerX, centerY, Math.max(spriteWidth, spriteHeight) / 2);
    }

    // Draw Health Bar
    this.drawHealthBar(ctx, centerX, centerY, spriteWidth / 2, spriteHeight / 2);
  }

  private drawShieldEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Rotating shield rings
    const rotationSpeed = 1.5; // rotations per second
    const rotation = (this as any).animationTime * rotationSpeed * Math.PI * 2;

    // Outer shield ring - pulsing
    const pulse = Math.sin((this as any).animationTime * 3) * 0.15 + 0.85;
    const outerRadius = radius * 1.4 * pulse;

    ctx.strokeStyle = this.stats.glowColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;

    // Draw rotating shield segments
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      const startAngle = angle - Math.PI / segments * 0.8;
      const endAngle = angle + Math.PI / segments * 0.8;

      ctx.beginPath();
      ctx.arc(x, y, outerRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // Inner shield ring - counter-rotating
    const innerRotation = -rotation * 0.7;
    const innerRadius = radius * 1.2;

    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + innerRotation;
      const startAngle = angle - Math.PI / segments * 0.6;
      const endAngle = angle + Math.PI / segments * 0.6;

      ctx.beginPath();
      ctx.arc(x, y, innerRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // Central glow
    const glowPulse = Math.sin((this as any).animationTime * 4) * 0.2 + 0.8;
    ctx.globalAlpha = 0.3 * glowPulse;
    ctx.fillStyle = this.stats.glowColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    deformedRadiusX?: number,
    deformedRadiusY?: number,
  ): void {
    const barWidth = this.radius * 2;
    const barHeight = 6;
    const barX = centerX - barWidth / 2;
    // Adjust position based on enemy type for better spacing
    const extraOffset = this.enemyType === 'tank' ? 5 : 0; // Tanks need more space due to armor
    const maxRadius =
      deformedRadiusX && deformedRadiusY
        ? Math.max(deformedRadiusX, deformedRadiusY)
        : this.radius;
    const barY = centerY - maxRadius - 18 - extraOffset;

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

    // No border - removed container

    this.drawEffectInfo(ctx, centerX, barWidth, barY);
  }

  private drawEffectInfo(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    barWidth: number,
    barY: number,
  ): void {
    if (this.enemyType === 'normal') return;

    const effectInfo = this.getEffectInfo();
    if (!effectInfo) return;

    const label = `${effectInfo.label} • ${effectInfo.description}`;

    ctx.save();
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(label).width;
    const paddingX = 10;
    const paddingY = 4;
    const boxWidth = Math.max(textWidth + paddingX * 2, barWidth);
    const boxHeight = 22;
    const boxX = centerX - boxWidth / 2;
    const boxY = barY - boxHeight - paddingY;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;

    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = '#fffae5';
    ctx.fillText(label, centerX, boxY + boxHeight / 2);

    ctx.restore();
  }

  private getEffectInfo(): { label: string; description: string } | null {
    switch (this.enemyType) {
      case 'scout':
        return {
          label: t('enemyTypes.scout.name'),
          description: t('enemyTypes.scout.effect'),
        };
      case 'tank':
        return {
          label: t('enemyTypes.tank.name'),
          description: t('enemyTypes.tank.effect'),
        };
      case 'healer':
        return {
          label: t('enemyTypes.healer.name'),
          description: t('enemyTypes.healer.effect'),
        };
      case 'guardian':
        return {
          label: t('enemyTypes.guardian.name'),
          description: t('enemyTypes.guardian.effect'),
        };
      case 'hoarder':
        return {
          label: t('enemyTypes.hoarder.name'),
          description: t('enemyTypes.hoarder.effect'),
        };
      default:
        return null;
    }
  }
}

export function selectEnemyType(level: number): EnemyType {
  // Always allow all enemy archetypes from level 1.
  // Keep the core probabilities but bias scout/tank/healer based on level.
  const rand = Math.random();

  if (rand < 0.6) {
    return 'normal';
  }

  // Adjust weighting so tougher enemies are still rarer at very low levels.
  let scoutWeight = 0.22 + Math.min(level / 220, 0.2);
  let tankWeight = 0.12 + Math.min(level / 320, 0.18);
  let healerWeight = 0.08 + Math.min(level / 420, 0.12);
  let guardianWeight = 0.08 + Math.min(level / 450, 0.12);
  let hoarderWeight = 0.005 + Math.min(level / 1200, 0.01);

  // Normalize weights
  const total =
    scoutWeight + tankWeight + healerWeight + guardianWeight + hoarderWeight;
  scoutWeight /= total;
  tankWeight /= total;
  healerWeight /= total;
  guardianWeight /= total;
  hoarderWeight /= total;

  const specialRoll = Math.random();
  if (specialRoll < scoutWeight) return 'scout';
  if (specialRoll < scoutWeight + tankWeight) return 'tank';
  if (specialRoll < scoutWeight + tankWeight + healerWeight) return 'healer';
  if (specialRoll < scoutWeight + tankWeight + healerWeight + guardianWeight) {
    return 'guardian';
  }
  return 'hoarder';
}
