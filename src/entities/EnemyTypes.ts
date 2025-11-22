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
  | 'hoarder'
  | 'void_walker'
  | 'plasma_born'
  | 'nebula_jelly';

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

const VOID_WALKER_COLORS = [
  { color: '#2a0a3b', glow: 'rgba(138, 43, 226, 0.6)' }, // Deep purple
  { color: '#4b0082', glow: 'rgba(75, 0, 130, 0.6)' }, // Indigo
  { color: '#1a1a2e', glow: 'rgba(100, 100, 255, 0.5)' }, // Dark blue-black
];

const PLASMA_BORN_COLORS = [
  { color: '#00ffff', glow: 'rgba(0, 255, 255, 0.9)' }, // Cyan
  { color: '#00ffaa', glow: 'rgba(0, 255, 170, 0.9)' }, // Electric Cyan
  { color: '#00ddff', glow: 'rgba(0, 221, 255, 0.9)' }, // Bright Cyan
  { color: '#66ffff', glow: 'rgba(102, 255, 255, 0.9)' }, // Light Electric
];

const NEBULA_JELLY_COLORS = [
  { color: '#ff69b4', glow: 'rgba(255, 105, 180, 0.6)' }, // Hot Pink
  { color: '#da70d6', glow: 'rgba(218, 112, 214, 0.6)' }, // Orchid
  { color: '#9370db', glow: 'rgba(147, 112, 219, 0.6)' }, // Medium Purple
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
  void_walker: {
    type: 'void_walker',
    hpMultiplier: 5,
    pointsMultiplier: 6,
    color: '#2a0a3b',
    glowColor: 'rgba(138, 43, 226, 0.6)',
    size: 1.6,
  },
  plasma_born: {
    type: 'plasma_born',
    hpMultiplier: 2.5,
    pointsMultiplier: 4,
    color: '#00ffff',
    glowColor: 'rgba(0, 255, 255, 0.8)',
    size: 1.2,
  },
  nebula_jelly: {
    type: 'nebula_jelly',
    hpMultiplier: 3.5,
    pointsMultiplier: 5,
    color: '#ff69b4',
    glowColor: 'rgba(255, 105, 180, 0.6)',
    size: 1.3,
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
      case 'void_walker':
        colorData = getRandomColor(VOID_WALKER_COLORS);
        break;
      case 'plasma_born':
        colorData = getRandomColor(PLASMA_BORN_COLORS);
        break;
      case 'nebula_jelly':
        colorData = getRandomColor(NEBULA_JELLY_COLORS);
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

    // Idle Animation (Breathing/Floating)
    const idlePulse = Math.sin((this as any).animationTime * 2) * 0.05;
    const idleY = Math.sin((this as any).animationTime * 1.5) * (this.radius * 0.1);

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

    const centerX =
      this.x +
      deformationX +
      (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);
    const centerY =
      this.y +
      deformationY +
      idleY + // Add idle floating
      (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);

    const spriteWidth = currentRadius * 2 * scaleX * (1 + idlePulse); // Add idle breathing
    const spriteHeight = currentRadius * 2 * scaleY * (1 + idlePulse);

    // Draw special effects based on enemy type (Background/Underlay)
    // Some effects look better behind the alien
    if (this.enemyType === 'tank') {
      this.drawTankEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'healer') {
      this.drawHealerEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'normal') {
      this.drawNormalEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'void_walker') {
      // Void walker background effect
      this.drawVoidWalkerBackground(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    }

    // Draw Sprite
    const sprite = getSpriteForType(this.enemyType);

    if (this.enemyType === 'void_walker') {
      // Chromatic Aberration for Void Walker
      this.drawGlitchSprite(
        ctx,
        centerX,
        centerY,
        spriteWidth,
        spriteHeight,
        sprite,
      );
    } else {
      this.drawPixelSprite(
        ctx,
        centerX,
        centerY,
        spriteWidth,
        spriteHeight,
        sprite,
        this.stats.color,
      );
    }

    // Flash effect
    if ((this as any).flashTime > 0) {
      const flashAlpha = (this as any).flashTime / (this as any).flashDuration;
      this.drawPixelSprite(
        ctx,
        centerX,
        centerY,
        spriteWidth,
        spriteHeight,
        sprite,
        '#ffffff',
        flashAlpha * 0.7,
      );
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

    // Draw special effects based on enemy type (Foreground/Overlay)
    if (this.enemyType === 'guardian') {
      this.drawShieldEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'scout') {
      this.drawScoutEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'hoarder') {
      this.drawHoarderEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'void_walker') {
      this.drawVoidWalkerEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'plasma_born') {
      this.drawPlasmaBornEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    } else if (this.enemyType === 'nebula_jelly') {
      this.drawNebulaJellyEffect(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    }

    // Draw Health Bar
    this.drawHealthBar(
      ctx,
      centerX,
      centerY,
      spriteWidth / 2,
      spriteHeight / 2,
    );
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

    // Enhanced visibility: Brighter, thicker lines
    ctx.strokeStyle = this.stats.glowColor;
    ctx.lineWidth = 4; // Thicker
    ctx.globalAlpha = 0.8; // More opaque

    // Draw rotating shield segments
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      const startAngle = angle - (Math.PI / segments) * 0.8;
      const endAngle = angle + (Math.PI / segments) * 0.8;

      ctx.beginPath();
      ctx.arc(x, y, outerRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // Inner shield ring - counter-rotating
    const innerRotation = -rotation * 0.7;
    const innerRadius = radius * 1.2;

    ctx.lineWidth = 3; // Thicker
    ctx.globalAlpha = 0.6; // More opaque

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + innerRotation;
      const startAngle = angle - (Math.PI / segments) * 0.6;
      const endAngle = angle + (Math.PI / segments) * 0.6;

      ctx.beginPath();
      ctx.arc(x, y, innerRadius, startAngle, endAngle);
      ctx.stroke();
    }

    // Central glow - stronger
    const glowPulse = Math.sin((this as any).animationTime * 4) * 0.2 + 0.8;
    ctx.globalAlpha = 0.4 * glowPulse;
    ctx.fillStyle = this.stats.glowColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawNormalEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();
    // Subtle inner glow pulse
    const pulse = Math.sin((this as any).animationTime * 3) * 0.1 + 0.5;
    ctx.globalAlpha = 0.2 * pulse;
    ctx.fillStyle = this.stats.glowColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Faint trail/aura
    const trailPulse = Math.sin((this as any).animationTime * 2 + Math.PI) * 0.1 + 1.0;
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.1 * trailPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawScoutEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Radar/Sonar pulse effect
    // Multiple expanding rings
    const pulseSpeed = 2.0;
    const numRings = 3;

    for (let i = 0; i < numRings; i++) {
      // Offset each ring
      const offset = i / numRings;
      const t = ((this as any).animationTime * pulseSpeed + offset) % 1;

      // Radius expands from 1.0 to 2.5x
      const ringRadius = radius * (1.0 + t * 1.5);
      // Alpha fades out as it expands
      const alpha = (1 - t) * 0.4;

      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.stats.glowColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = alpha;
      ctx.stroke();
    }

    // Rotating Scanner Cone
    const scanRotation = (this as any).animationTime * 2 * Math.PI;
    ctx.translate(x, y);
    ctx.rotate(scanRotation);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.5);
    gradient.addColorStop(0, this.stats.glowColor);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius * 2.5, -0.4, 0.4);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Target Reticle
    ctx.rotate(-scanRotation); // Reset rotation for reticle
    const reticleRotation = -(this as any).animationTime * Math.PI;
    ctx.rotate(reticleRotation);

    ctx.strokeStyle = this.stats.glowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    const reticleRadius = radius * 1.8;
    const bracketSize = Math.PI / 4;

    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, reticleRadius, -bracketSize / 2, bracketSize / 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawTankEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Heavy Armor / Forcefield effect
    // Rotating hexagon barrier
    const rotation = (this as any).animationTime * 0.5; // Slow rotation
    const sides = 6;
    const armorRadius = radius * 1.3;

    ctx.strokeStyle = this.stats.glowColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;

    // Draw Hexagon
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation;
      const px = x + Math.cos(angle) * armorRadius;
      const py = y + Math.sin(angle) * armorRadius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Floating Armor Plates
    const numPlates = 3;
    const plateRotation = -(this as any).animationTime * 0.8;
    const plateDist = radius * 1.6;

    ctx.fillStyle = this.stats.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    for (let i = 0; i < numPlates; i++) {
      const angle = (i / numPlates) * Math.PI * 2 + plateRotation;
      const px = x + Math.cos(angle) * plateDist;
      const py = y + Math.sin(angle) * plateDist;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);

      // Draw trapezoid plate
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.lineTo(6, -3);
      ctx.lineTo(4, 3);
      ctx.lineTo(-4, 3);
      ctx.closePath();

      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Shield Shimmer (on damage or random)
    if (Math.random() < 0.05) {
      ctx.fillStyle = this.stats.glowColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const px = x + Math.cos(angle) * armorRadius;
        const py = y + Math.sin(angle) * armorRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }

  private drawHealerEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Healing Aura
    // Soft glowing pulse background
    const pulse = Math.sin((this as any).animationTime * 2) * 0.1 + 1.0;
    const auraRadius = radius * 1.5 * pulse;

    const gradient = ctx.createRadialGradient(x, y, radius, x, y, auraRadius);
    gradient.addColorStop(0, 'rgba(102, 255, 153, 0.0)');
    gradient.addColorStop(0.5, 'rgba(102, 255, 153, 0.2)');
    gradient.addColorStop(1, 'rgba(102, 255, 153, 0.0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rising "+" Particles
    const numParticles = 5;
    const time = (this as any).animationTime;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;

    for (let i = 0; i < numParticles; i++) {
      const offset = i * (Math.PI * 2 / numParticles);
      const pTime = (time + offset) % 2; // 2 second cycle

      // Spiral up motion
      const pAngle = time * 2 + offset;
      const pY = y + radius - (pTime * radius * 2.5);
      const pX = x + Math.cos(pAngle) * (radius * 0.5);

      const size = 4 * (1 - pTime / 2);
      const alpha = 1 - (pTime / 2);

      if (pTime < 2) {
        ctx.globalAlpha = alpha;
        // Draw Plus
        ctx.fillRect(pX - size / 2, pY - size / 6, size, size / 3);
        ctx.fillRect(pX - size / 6, pY - size / 2, size / 3, size);
      }
    }

    ctx.restore();
    ctx.restore();
  }

  private drawHoarderEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Treasure Glow / Sparkles
    // Orbiting gold coins/particles
    const numCoins = 6;
    const orbitSpeed = 1.5;

    for (let i = 0; i < numCoins; i++) {
      const phase = (i / numCoins) * Math.PI * 2;
      // Elliptical orbit for 3D feel
      const angle = (this as any).animationTime * orbitSpeed + phase;
      const orbitRadiusX = radius * 1.8;
      const orbitRadiusY = radius * 0.8;

      const cx = x + Math.cos(angle) * orbitRadiusX;
      const cy = y + Math.sin(angle) * orbitRadiusY;

      // Sparkle/Coin
      ctx.fillStyle = '#ffd700'; // Gold
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.9;

      // Twinkle size
      const twinkle =
        Math.sin((this as any).animationTime * 10 + i) * 0.3 + 0.7;
      const size = 3 * twinkle;

      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fill();

      // Occasional Sparkle (4-point star)
      if (Math.sin(angle * 3) > 0.8) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 2);
        ctx.quadraticCurveTo(cx, cy, cx + size * 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + size * 2);
        ctx.quadraticCurveTo(cx, cy, cx - size * 2, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - size * 2);
        ctx.fill();
      }
    }

    // Central shine
    ctx.globalAlpha = 0.4 + Math.sin((this as any).animationTime * 5) * 0.2;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 215, 0, 0.4)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  private drawVoidWalkerBackground(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();
    // Digital Noise Background
    const time = Date.now() / 50;
    if (Math.floor(time) % 3 === 0) {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.2;
      const w = radius * 2.5;
      const h = 2;
      const ny = y + (Math.random() - 0.5) * radius * 2;
      ctx.fillRect(x - w / 2, ny, w, h);
    }
    ctx.restore();
  }

  private drawVoidWalkerEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();
    // Glitch effect - random rectangles
    const time = Date.now() / 100;
    if (Math.floor(time) % 2 === 0) {
      ctx.fillStyle = this.stats.glowColor;
      ctx.globalAlpha = 0.4;
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;
      const w = (Math.random() * 10) + 5;
      const h = (Math.random() * 5) + 2;
      ctx.fillRect(x - radius + offsetX, y - radius + offsetY, w, h);
    }

    // Data Stream
    ctx.fillStyle = '#00ff00';
    ctx.font = '8px monospace';
    ctx.globalAlpha = 0.3;
    if (Math.random() < 0.1) {
      ctx.fillText((Math.random() > 0.5 ? '1' : '0'), x + radius, y - radius + Math.random() * radius * 2);
    }

    ctx.restore();
  }

  private drawGlitchSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    sprite: any,
  ): void {
    // Draw Red Channel Offset
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.7;
    const offset = 2;

    // Red
    this.drawPixelSprite(ctx, x - offset, y, w, h, sprite, '#ff0000');

    // Blue
    this.drawPixelSprite(ctx, x + offset, y, w, h, sprite, '#0000ff');

    // Green (Center)
    this.drawPixelSprite(ctx, x, y, w, h, sprite, '#00ff00');

    ctx.restore();
    ctx.restore();
  }

  private drawPlasmaBornEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    const time = (this as any).animationTime || 0;

    // Pulsing outer glow
    const pulse = Math.sin(time * 2.5) * 0.15 + 1;
    const glowGradient = ctx.createRadialGradient(
      x, y, 0, 
      x, y, radius * 1.5 * pulse
    );
    glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.25)');
    glowGradient.addColorStop(0.6, 'rgba(0, 255, 255, 0.15)');
    glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 4 Orbiting energy particles
    const orbCount = 4;
    for (let i = 0; i < orbCount; i++) {
      const angle = (i / orbCount) * Math.PI * 2 + time * 2;
      const orbitRadius = radius * 1.2;
      const orbX = x + Math.cos(angle) * orbitRadius;
      const orbY = y + Math.sin(angle) * orbitRadius;
      const orbSize = 3 + Math.sin(time * 4 + i) * 1;

      // Simple orb with glow
      ctx.fillStyle = 'rgba(200, 255, 255, 0.8)';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Single pulsing ring
    const ringRadius = radius * (1 + Math.sin(time * 3) * 0.2);
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + Math.sin(time * 3) * 0.15})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Electric sparks (4 sparks, flickering)
    const sparkCount = 4;
    for (let i = 0; i < sparkCount; i++) {
      if (Math.random() > 0.6) continue; // Flicker
      
      const angle = (i / sparkCount) * Math.PI * 2 + time;
      const startDist = radius * 0.3;
      const endDist = radius * 1.1;
      
      const startX = x + Math.cos(angle) * startDist;
      const startY = y + Math.sin(angle) * startDist;
      const endX = x + Math.cos(angle) * endDist + (Math.random() - 0.5) * 8;
      const endY = y + Math.sin(angle) * endDist + (Math.random() - 0.5) * 8;
      
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Subtle pulsing core (matched to other aliens' brightness)
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.6);
    coreGradient.addColorStop(0, 'rgba(200, 255, 255, 0.6)');
    coreGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
    coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = coreGradient;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawNebulaJellyEffect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    const time = (this as any).animationTime || 0;

    // Layered Cosmic Background Gradients (nebula clouds)
    const outerNebula = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    outerNebula.addColorStop(0, 'rgba(255, 105, 180, 0.15)');
    outerNebula.addColorStop(0.3, 'rgba(147, 112, 219, 0.2)');
    outerNebula.addColorStop(0.6, 'rgba(75, 0, 130, 0.15)');
    outerNebula.addColorStop(1, 'transparent');
    ctx.fillStyle = outerNebula;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Rotating nebula clouds
    const cloudCount = 3;
    for (let i = 0; i < cloudCount; i++) {
      const angle = (i / cloudCount) * Math.PI * 2 + time * 0.3;
      const cloudDist = radius * 0.6;
      const cloudX = x + Math.cos(angle) * cloudDist;
      const cloudY = y + Math.sin(angle) * cloudDist;
      const cloudSize = radius * 0.5;
      
      const cloudGradient = ctx.createRadialGradient(
        cloudX, cloudY, 0,
        cloudX, cloudY, cloudSize
      );
      cloudGradient.addColorStop(0, 'rgba(218, 112, 214, 0.3)');
      cloudGradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.2)');
      cloudGradient.addColorStop(1, 'rgba(75, 0, 130, 0)');
      
      ctx.fillStyle = cloudGradient;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Multiple pulsing aura rings
    for (let i = 0; i < 3; i++) {
      const pulse = Math.sin(time * 1.5 + i * 1) * 0.15 + 1;
      const ringRadius = radius * (1 + i * 0.2) * pulse;
      const alpha = 0.4 - i * 0.1;
      
      ctx.strokeStyle = this.stats.glowColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // Floating cosmic particles (20 particles)
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
      const orbitRadius = radius * 0.7 + Math.sin(time * 2 + i) * radius * 0.3;
      const px = x + Math.cos(angle) * orbitRadius;
      const py = y + Math.sin(angle) * orbitRadius;
      const size = 1 + Math.sin(time * 3 + i) * 0.5;
      const particleAlpha = 0.4 + Math.sin(time * 2 + i * 0.5) * 0.3;
      
      // Particle with color variation
      const colors = [
        'rgba(255, 105, 180, ',  // Hot Pink
        'rgba(218, 112, 214, ',  // Orchid
        'rgba(147, 112, 219, ',  // Medium Purple
        'rgba(186, 85, 211, ',   // Medium Orchid
      ];
      const colorIndex = i % colors.length;
      const selectedColor = colors[colorIndex] ?? colors[0] ?? 'rgba(255, 105, 180, ';
      ctx.fillStyle = selectedColor + particleAlpha + ')';
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Twinkling stars - increased to 12 with varying sizes
    const numStars = 12;
    for (let i = 0; i < numStars; i++) {
      const starTime = time * 2 + i;
      const alpha = (Math.sin(starTime) + 1) / 2; // 0 to 1

      if (alpha > 0.2) {
        const angle = i * (Math.PI * 2 / numStars) + time * 0.2;
        const dist = radius * (0.6 + (i % 3) * 0.15);
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        const starSize = 1 + (i % 3) * 0.5;

        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Four-point star shape for larger stars
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(sx, sy - starSize * 2);
          ctx.lineTo(sx + starSize * 0.5, sy - starSize * 0.5);
          ctx.lineTo(sx + starSize * 2, sy);
          ctx.lineTo(sx + starSize * 0.5, sy + starSize * 0.5);
          ctx.lineTo(sx, sy + starSize * 2);
          ctx.lineTo(sx - starSize * 0.5, sy + starSize * 0.5);
          ctx.lineTo(sx - starSize * 2, sy);
          ctx.lineTo(sx - starSize * 0.5, sy - starSize * 0.5);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
      }
    }

    // Trailing wisps (tentacle-like cosmic trails)
    const wispCount = 6;
    for (let i = 0; i < wispCount; i++) {
      const baseAngle = (i / wispCount) * Math.PI * 2 - time * 0.5;
      const wispLength = radius * 0.8;
      
      ctx.strokeStyle = `rgba(218, 112, 214, ${0.3 + Math.sin(time * 2 + i) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#da70d6';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Curved wisp path
      for (let j = 1; j <= 3; j++) {
        const progress = j / 3;
        const angle = baseAngle + Math.sin(time * 3 + i + j) * 0.3;
        const dist = wispLength * progress;
        const wx = x + Math.cos(angle) * dist;
        const wy = y + Math.sin(angle) * dist;
        ctx.lineTo(wx, wy);
      }
      
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

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
      case 'void_walker':
        return {
          label: 'Void Walker',
          description: 'High HP & Points',
        };
      case 'plasma_born':
        return {
          label: 'Plasma Born',
          description: 'Fast & Valuable',
        };
      case 'nebula_jelly':
        return {
          label: 'Nebula Jelly',
          description: 'Cosmic Entity',
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

  // Level 100+ weights
  let voidWalkerWeight = 0;
  let plasmaBornWeight = 0;
  let nebulaJellyWeight = 0;

  if (level >= 100) {
    voidWalkerWeight = 0.05 + Math.min((level - 100) / 500, 0.1);
    plasmaBornWeight = 0.05 + Math.min((level - 100) / 500, 0.1);
    nebulaJellyWeight = 0.05 + Math.min((level - 100) / 500, 0.1);
  }

  // Normalize weights
  const total =
    scoutWeight +
    tankWeight +
    healerWeight +
    guardianWeight +
    hoarderWeight +
    voidWalkerWeight +
    plasmaBornWeight +
    nebulaJellyWeight;

  scoutWeight /= total;
  tankWeight /= total;
  healerWeight /= total;
  guardianWeight /= total;
  hoarderWeight /= total;
  voidWalkerWeight /= total;
  plasmaBornWeight /= total;
  nebulaJellyWeight /= total;

  const specialRoll = Math.random();
  let currentThreshold = 0;

  currentThreshold += scoutWeight;
  if (specialRoll < currentThreshold) return 'scout';

  currentThreshold += tankWeight;
  if (specialRoll < currentThreshold) return 'tank';

  currentThreshold += healerWeight;
  if (specialRoll < currentThreshold) return 'healer';

  currentThreshold += guardianWeight;
  if (specialRoll < currentThreshold) return 'guardian';

  currentThreshold += hoarderWeight;
  if (specialRoll < currentThreshold) return 'hoarder';

  if (level >= 100) {
    currentThreshold += voidWalkerWeight;
    if (specialRoll < currentThreshold) return 'void_walker';

    currentThreshold += plasmaBornWeight;
    if (specialRoll < currentThreshold) return 'plasma_born';

    currentThreshold += nebulaJellyWeight;
    if (specialRoll < currentThreshold) return 'nebula_jelly';
  }

  return 'hoarder'; // Fallback
}
