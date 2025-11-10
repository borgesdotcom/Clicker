import { AlienBall } from './AlienBall';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';
import { t } from '../core/I18n';
import { ColorManager } from '../math/ColorManager';

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

    const deformedRadiusX = currentRadius * scaleX;
    const deformedRadiusY = currentRadius * scaleY;

    const centerX = this.x + deformationX;
    const centerY = this.y + deformationY;

    // Draw enhanced glow effect - space-themed pulsing aura
    const glowRadius =
      Math.max(deformedRadiusX, deformedRadiusY) * (1.3 + basePulseValue * 0.1);
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius,
    );
    const glowAlpha = 0.2 + Math.sin((this as any).animationTime * 2) * 0.05;
    const r = parseInt(this.stats.color.substring(1, 3), 16);
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);
    glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha})`);
    glowGradient.addColorStop(
      0.5,
      `rgba(${r}, ${g}, ${b}, ${glowAlpha * 0.5})`,
    );
    glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = glowGradient;
    ctx.fillRect(
      centerX - glowRadius,
      centerY - glowRadius,
      glowRadius * 2,
      glowRadius * 2,
    );

    // Draw enemy-specific effects
    switch (this.enemyType) {
      case 'scout':
        this.drawScout(
          ctx,
          centerX,
          centerY,
          scaleX,
          scaleY,
          deformedRadiusX,
          deformedRadiusY,
        );
        break;
      case 'tank':
        this.drawTank(
          ctx,
          centerX,
          centerY,
          scaleX,
          scaleY,
          deformedRadiusX,
          deformedRadiusY,
        );
        break;
      case 'healer':
        this.drawHealer(
          ctx,
          centerX,
          centerY,
          scaleX,
          scaleY,
          deformedRadiusX,
          deformedRadiusY,
        );
        break;
      case 'guardian':
        this.drawGuardian(
          ctx,
          centerX,
          centerY,
          scaleX,
          scaleY,
          deformedRadiusX,
          deformedRadiusY,
        );
        break;
      case 'hoarder':
        this.drawHoarder(
          ctx,
          centerX,
          centerY,
          scaleX,
          scaleY,
          deformedRadiusX,
          deformedRadiusY,
        );
        break;
      default:
        super.draw(drawer);
    }
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

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

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

  private drawGuardian(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scaleX: number,
    scaleY: number,
    deformedRadiusX: number,
    deformedRadiusY: number,
  ): void {
    this.drawHealthBar(ctx, centerX, centerY, deformedRadiusX, deformedRadiusY);

    const animationTime = this.animationTime;
    const baseRadius =
      this.radius * (1 + Math.sin(animationTime * 1.3) * 0.015);

    const r = parseInt(this.stats.color.substring(1, 3), 16);
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);

    // Outer shield ring
    const shieldPulse = 0.08 + Math.sin(animationTime * 4) * 0.03;
    const shieldGradient = ctx.createRadialGradient(
      0,
      0,
      baseRadius * 0.85,
      0,
      0,
      baseRadius * (1.3 + shieldPulse),
    );
    shieldGradient.addColorStop(
      0,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`,
    );
    shieldGradient.addColorStop(
      0.7,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.15)`,
    );
    shieldGradient.addColorStop(
      1,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`,
    );
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * (1.35 + shieldPulse), 0, Math.PI * 2);
    ctx.fill();

    // Rotating shield segments
    ctx.save();
    ctx.rotate(animationTime * 1.2);
    ctx.strokeStyle = `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.65)`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.7)`;
    for (let i = 0; i < 6; i++) {
      const startAngle = (i / 6) * Math.PI * 2;
      const endAngle = startAngle + Math.PI / 6;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.15, startAngle, endAngle);
      ctx.stroke();
    }
    ctx.restore();

    // Main body
    const bodyGradient = ctx.createRadialGradient(
      -baseRadius * 0.2,
      -baseRadius * 0.2,
      baseRadius * 0.05,
      0,
      0,
      baseRadius,
    );
    bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    bodyGradient.addColorStop(
      0.4,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.65)`,
    );
    bodyGradient.addColorStop(
      1,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.5)`,
    );

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Core
    const coreRadius = baseRadius * 0.35;
    const corePulse = Math.sin(animationTime * 3) * 0.07;
    ctx.fillStyle = `rgba(255, 255, 255, ${String(0.4 + corePulse * 0.5)})`;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * (1 + corePulse), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawHoarder(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scaleX: number,
    scaleY: number,
    deformedRadiusX: number,
    deformedRadiusY: number,
  ): void {
    this.drawHealthBar(ctx, centerX, centerY, deformedRadiusX, deformedRadiusY);

    const animationTime = this.animationTime;
    const baseRadius = this.radius * (1 + Math.sin(animationTime * 1.8) * 0.02);

    const r = parseInt(this.stats.color.substring(1, 3), 16);
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);

    // Sparkling aura
    ctx.fillStyle = `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.12)`;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Gold shimmer particles
    const shimmerCount = 10;
    for (let i = 0; i < shimmerCount; i++) {
      const angle = (i / shimmerCount) * Math.PI * 2 + animationTime;
      const distance =
        baseRadius * (1 + Math.sin(animationTime * 2 + i) * 0.15);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const alpha = 0.25 + Math.sin(animationTime * 3 + i) * 0.15;
      ctx.fillStyle = `rgba(255, 215, 120, ${String(alpha)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main body
    const bodyGradient = ctx.createRadialGradient(
      -baseRadius * 0.25,
      -baseRadius * 0.25,
      baseRadius * 0.1,
      0,
      0,
      baseRadius,
    );
    bodyGradient.addColorStop(0, 'rgba(255, 240, 200, 0.75)');
    bodyGradient.addColorStop(
      0.4,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.7)`,
    );
    bodyGradient.addColorStop(
      1,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.6)`,
    );

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Coin stacks inside
    ctx.save();
    ctx.rotate(animationTime * 0.5);
    const stacks = 3;
    for (let i = 0; i < stacks; i++) {
      const angle = (i / stacks) * Math.PI * 2;
      const stackX = Math.cos(angle) * baseRadius * 0.45;
      const stackY = Math.sin(angle) * baseRadius * 0.45;

      ctx.fillStyle = 'rgba(255, 225, 140, 0.9)';
      ctx.beginPath();
      ctx.ellipse(
        stackX,
        stackY,
        baseRadius * 0.18,
        baseRadius * 0.12,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 205, 90, 0.85)';
      ctx.beginPath();
      ctx.ellipse(
        stackX,
        stackY - baseRadius * 0.05,
        baseRadius * 0.16,
        baseRadius * 0.09,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();

    // Sparkle highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + animationTime * 2;
      const sparkleX = Math.cos(angle) * baseRadius * 0.7;
      const sparkleY = Math.sin(angle) * baseRadius * 0.7;
      ctx.beginPath();
      ctx.moveTo(sparkleX, sparkleY - 4);
      ctx.lineTo(sparkleX + 4, sparkleY);
      ctx.lineTo(sparkleX, sparkleY + 4);
      ctx.lineTo(sparkleX - 4, sparkleY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawScout(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scaleX: number,
    scaleY: number,
    deformedRadiusX: number,
    deformedRadiusY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY, deformedRadiusX, deformedRadiusY);

    // Enhanced scout glow - faster energy with multi-layer
    const glowRadius = Math.max(deformedRadiusX, deformedRadiusY) * 1.4;
    const animationTime = this.animationTime;
    const pulseValue = Math.sin(animationTime * 2) * 0.015; // Faster pulse for scout
    const currentRadius = this.radius * (1 + pulseValue);
    const glowAlpha = 0.25 + Math.sin(animationTime * 3) * 0.05;
    const r = parseInt(this.stats.color.substring(1, 3), 16);
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);

    // Multi-layer glow
    for (let glowLayer = 0; glowLayer < 2; glowLayer++) {
      const layerRadius = glowRadius * (0.85 + glowLayer * 0.3);
      const layerAlpha = glowAlpha * (1 - glowLayer * 0.25);
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        layerRadius,
      );
      glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layerAlpha})`);
      glowGradient.addColorStop(
        0.5,
        `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.5})`,
      );
      glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbiting energy particles (scout is fast!)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + animationTime * 3;
      const distance =
        currentRadius * (1.15 + Math.sin(animationTime * 6 + i) * 0.08);
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      const particleAlpha = 0.4 + Math.sin(animationTime * 8 + i) * 0.3;
      const particleSize = 2 + Math.sin(animationTime * 4 + i) * 0.8;

      ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Main bubble body with enhanced gradient - apply deformation
    const gradient = ctx.createRadialGradient(
      centerX - deformedRadiusX * 0.3,
      centerY - deformedRadiusY * 0.3,
      Math.min(deformedRadiusX, deformedRadiusY) * 0.08,
      centerX,
      centerY,
      Math.max(deformedRadiusX, deformedRadiusY),
    );
    gradient.addColorStop(
      0,
      `rgba(255, 255, 255, ${0.7 + Math.sin(animationTime * 4) * 0.1})`,
    );
    gradient.addColorStop(0.15, this.stats.color + 'dd');
    gradient.addColorStop(0.4, this.stats.color + 'bb');
    gradient.addColorStop(0.65, this.stats.color + '99');
    gradient.addColorStop(0.85, this.stats.color + 'aa');
    gradient.addColorStop(1, this.stats.color + 'cc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Speed lines effect (scout is fast!) - enhanced with trailing effect
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(animationTime * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + pulseValue * 3})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const startRadius = currentRadius * 0.7;
      const endRadius = currentRadius * 0.95;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
      ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Additional speed trail particles
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(animationTime * 2 + Math.PI / 4);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const trailDistance =
        currentRadius * (0.75 + Math.sin(animationTime * 6 + i) * 0.1);
      const trailAlpha = 0.15 + Math.sin(animationTime * 8 + i) * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * trailDistance,
        Math.sin(angle) * trailDistance,
        1.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();

    // Enhanced glossy highlight - also deformed with secondary highlight
    const highlightAlpha = 0.35 + Math.sin(animationTime * 2) * 0.1;

    // Main highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.35,
      -currentRadius * 0.35,
      currentRadius * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Secondary highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha * 0.5})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.25,
      -currentRadius * 0.25,
      currentRadius * 0.25,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Energy border with glow - also deformed with multiple layers
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Secondary outer border
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + pulseValue * 3})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 3;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 1.05, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawTank(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scaleX: number,
    scaleY: number,
    deformedRadiusX: number,
    deformedRadiusY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY, deformedRadiusX, deformedRadiusY);

    // Tank = heavily armored reinforced bubble! - apply deformation
    const animationTime = this.animationTime;
    const shieldPulse = Math.sin(animationTime * 1.5) * 2;
    const pulseValue = Math.sin(animationTime * 1.2) * 0.01; // Slower, stronger pulse
    const currentRadius = this.radius * (1 + pulseValue);

    // Enhanced tank glow - stronger, more menacing multi-layer
    const glowRadius =
      Math.max(deformedRadiusX, deformedRadiusY) * (1.5 + pulseValue * 0.15);
    const r = parseInt(this.stats.color.substring(1, 3), 16);
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);

    // Multi-layer menacing glow
    for (let glowLayer = 0; glowLayer < 3; glowLayer++) {
      const layerRadius = glowRadius * (0.7 + glowLayer * 0.2);
      const layerAlpha =
        0.25 -
        glowLayer * 0.05 +
        Math.sin(animationTime * 1.5 + glowLayer) * 0.03;
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        layerRadius,
      );
      glowGradient.addColorStop(
        0,
        `rgba(${r}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)}, ${layerAlpha})`,
      );
      glowGradient.addColorStop(
        0.4,
        `rgba(${r}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${layerAlpha * 0.7})`,
      );
      glowGradient.addColorStop(
        0.7,
        `rgba(${r}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${layerAlpha * 0.4})`,
      );
      glowGradient.addColorStop(
        1,
        `rgba(${r}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0)`,
      );
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor plating particles - defensive energy field
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + animationTime * 0.8;
      const distance =
        currentRadius * (1.25 + Math.sin(animationTime * 2 + i) * 0.08);
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      const particleAlpha = 0.25 + Math.sin(animationTime * 3 + i) * 0.15;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleAlpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw outer shield layers (multiple reinforced bubble layers) - also deformed
    for (let layer = 0; layer < 3; layer++) {
      const layerRadius =
        Math.max(deformedRadiusX, deformedRadiusY) +
        12 +
        layer * 6 +
        shieldPulse;
      const layerAlpha = 0.2 - layer * 0.04;
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
        `rgba(${r}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)}, ${String(layerAlpha + 0.25)})`,
      );
      layerGradient.addColorStop(
        0.4,
        `rgba(${r}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${String(layerAlpha + 0.15)})`,
      );
      layerGradient.addColorStop(
        0.7,
        `rgba(${r}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${String(layerAlpha)})`,
      );
      layerGradient.addColorStop(
        1,
        `rgba(${r}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0)`,
      );
      ctx.fillStyle = layerGradient;
      ctx.beginPath();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scaleX, scaleY);
      ctx.arc(0, 0, layerRadius / Math.max(scaleX, scaleY), 0, Math.PI * 2);
      ctx.restore();
      ctx.fill();
    }

    // Main reinforced bubble body (larger, thicker) - apply deformation with enhanced gradient
    const bodyScale = 1 + Math.sin(animationTime * 1.2) * 0.02;
    const gradient = ctx.createRadialGradient(
      centerX - deformedRadiusX * 0.3,
      centerY - deformedRadiusY * 0.3,
      Math.min(deformedRadiusX, deformedRadiusY) * 0.08,
      centerX,
      centerY,
      Math.max(deformedRadiusX, deformedRadiusY) * bodyScale,
    );
    gradient.addColorStop(
      0,
      `rgba(255, 255, 255, ${0.6 + Math.sin(animationTime * 2) * 0.1})`,
    );
    gradient.addColorStop(0.12, this.stats.color + 'ee');
    gradient.addColorStop(0.3, this.stats.color + 'dd');
    gradient.addColorStop(0.5, this.stats.color + 'bb');
    gradient.addColorStop(0.7, this.stats.color + '99');
    gradient.addColorStop(0.85, this.stats.color + 'aa');
    gradient.addColorStop(1, this.stats.color + 'cc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * bodyScale, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Armor plating pattern - rotating hexagon pattern with enhanced detail
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(animationTime * 0.5);

    // Main hexagon
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.35 + pulseValue * 2})`;
    ctx.lineWidth = 2;
    const hexSize = currentRadius * 0.75;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * hexSize;
      const y = Math.sin(angle) * hexSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner hexagon for layered armor effect
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.25 + pulseValue * 1.5})`;
    ctx.lineWidth = 1.5;
    const innerHexSize = currentRadius * 0.55;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * innerHexSize;
      const y = Math.sin(angle) * innerHexSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Armor plate segments
    for (let segment = 0; segment < 6; segment++) {
      const angle = (segment / 6) * Math.PI * 2;
      const segmentAlpha = 0.2 + Math.sin(animationTime * 2 + segment) * 0.1;
      ctx.fillStyle = `rgba(0, 0, 0, ${segmentAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * hexSize, Math.sin(angle) * hexSize);
      ctx.lineTo(
        Math.cos(angle + Math.PI / 3) * hexSize,
        Math.sin(angle + Math.PI / 3) * hexSize,
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Extra thick glossy highlight - also deformed with triple highlight
    const highlightAlpha = 0.4 + Math.sin(animationTime * 1.5) * 0.1;

    // Main highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.35,
      -currentRadius * 0.35,
      currentRadius * 0.45,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Secondary highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha * 0.65})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.28,
      -currentRadius * 0.28,
      currentRadius * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Tertiary highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha * 0.4})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.22,
      -currentRadius * 0.22,
      currentRadius * 0.18,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Thick energy border with strong glow - also deformed
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * bodyScale, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner reinforcement rings - also deformed
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 + pulseValue * 3})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 0.88, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();

    // Second reinforcement ring
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.25 + pulseValue * 2})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 0.92, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
  }

  private drawHealer(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    scaleX: number,
    scaleY: number,
    deformedRadiusX: number,
    deformedRadiusY: number,
  ): void {
    // Draw HP bar
    this.drawHealthBar(ctx, centerX, centerY, deformedRadiusX, deformedRadiusY);

    // Enhanced healing aura - soothing pulsing energy field with multi-layer
    const animationTime = this.animationTime;
    const pulseSize = Math.sin(animationTime * 1.8) * 8;
    const pulseValue = Math.sin(animationTime * 1.5) * 0.015;
    const currentRadius = this.radius * (1 + pulseValue);

    // Extract green and blue for healing colors (healer uses green/teal palette)
    const g = parseInt(this.stats.color.substring(3, 5), 16);
    const b = parseInt(this.stats.color.substring(5, 7), 16);

    // Multiple healing aura layers with enhanced pulsing
    for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
      const auraRadius =
        Math.max(deformedRadiusX, deformedRadiusY) +
        10 +
        auraLayer * 7 +
        pulseSize;
      const auraAlpha = 0.28 - auraLayer * 0.08;
      const auraPulse = Math.sin(animationTime * 2 + auraLayer * 0.5) * 0.05;
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        auraRadius,
      );
      auraGradient.addColorStop(
        0,
        `rgba(0, ${g + 50}, ${b + 50}, ${auraAlpha + auraPulse})`,
      );
      auraGradient.addColorStop(
        0.4,
        `rgba(0, ${g + 30}, ${b + 30}, ${(auraAlpha + auraPulse) * 0.7})`,
      );
      auraGradient.addColorStop(
        0.7,
        `rgba(0, ${g + 15}, ${b + 15}, ${(auraAlpha + auraPulse) * 0.4})`,
      );
      auraGradient.addColorStop(1, `rgba(0, ${g}, ${b}, 0)`);
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scaleX, scaleY);
      ctx.arc(0, 0, auraRadius / Math.max(scaleX, scaleY), 0, Math.PI * 2);
      ctx.restore();
      ctx.fill();
    }

    // Healing energy particles orbiting
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + animationTime * 1.5;
      const distance =
        currentRadius * (1.2 + Math.sin(animationTime * 4 + i) * 0.1);
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      const particleAlpha = 0.35 + Math.sin(animationTime * 6 + i) * 0.25;

      ctx.fillStyle = `rgba(0, ${g + 40}, ${b + 40}, ${particleAlpha})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `rgba(0, ${g + 50}, ${b + 50}, 0.7)`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Main healing bubble body with enhanced gradient - apply deformation
    const gradient = ctx.createRadialGradient(
      centerX - deformedRadiusX * 0.3,
      centerY - deformedRadiusY * 0.3,
      Math.min(deformedRadiusX, deformedRadiusY) * 0.08,
      centerX,
      centerY,
      Math.max(deformedRadiusX, deformedRadiusY),
    );
    gradient.addColorStop(
      0,
      `rgba(255, 255, 255, ${0.7 + Math.sin(animationTime * 3) * 0.1})`,
    );
    gradient.addColorStop(0.15, this.stats.color + 'dd');
    gradient.addColorStop(0.35, this.stats.color + 'bb');
    gradient.addColorStop(0.55, this.stats.color + 'aa');
    gradient.addColorStop(0.75, this.stats.color + '99');
    gradient.addColorStop(0.9, this.stats.color + 'aa');
    gradient.addColorStop(1, this.stats.color + 'cc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Healing energy rings - rotating pattern with enhanced glow
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(animationTime * 0.8);
    for (let ring = 1; ring <= 3; ring++) {
      const ringRadius = currentRadius * (0.45 + ring * 0.12);
      const ringAlpha = 0.25 + Math.sin(animationTime * 2 + ring) * 0.1;
      const ringPulse = Math.sin(animationTime * 3 + ring * 0.7) * 0.03;

      ctx.strokeStyle = `rgba(0, 255, 136, ${ringAlpha})`;
      ctx.lineWidth = 2 + ringPulse;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(0, ${g + 40}, ${b + 40}, 0.6)`;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing segments on rings
      if (ring <= 2) {
        for (let segment = 0; segment < 3; segment++) {
          const segmentAngle =
            (segment / 3) * Math.PI * 2 + animationTime * 0.8;
          const segmentAlpha =
            0.3 + Math.sin(animationTime * 4 + segment) * 0.2;
          ctx.fillStyle = `rgba(0, 255, 136, ${segmentAlpha})`;
          ctx.beginPath();
          ctx.arc(
            Math.cos(segmentAngle) * ringRadius,
            Math.sin(segmentAngle) * ringRadius,
            ringRadius * 0.12,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Enhanced glossy highlight with pulsing - also deformed with dual highlights
    const highlightAlpha = 0.4 + Math.sin(animationTime * 2) * 0.15;

    // Main highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.35,
      -currentRadius * 0.35,
      currentRadius * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Secondary highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha * 0.6})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.28,
      -currentRadius * 0.28,
      currentRadius * 0.25,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Energy border with healing glow - also deformed with multiple layers
    ctx.strokeStyle = this.stats.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(0, ${g + 50}, ${b + 50}, 0.7)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Secondary outer border
    ctx.strokeStyle = `rgba(0, ${g + 40}, ${b + 40}, ${0.5 + pulseValue * 2})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = `rgba(0, ${g + 50}, ${b + 50}, 0.5)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 1.05, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Enhanced healing cross - glowing energy symbol
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(Math.sin(animationTime * 1.2) * 0.1); // Subtle rotation
    const crossAlpha = 0.85 + Math.sin(animationTime * 2.5) * 0.1;
    ctx.strokeStyle = `rgba(0, 255, 136, ${crossAlpha})`;
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0, 255, 136, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Healing particles (tiny bubbles)
    if (
      this.currentHp < this.maxHp &&
      (this as any).healTimer > (this as any).healInterval * 0.5
    ) {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + Date.now() * 0.001;
        const distance = Math.max(deformedRadiusX, deformedRadiusY) + 20;
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
