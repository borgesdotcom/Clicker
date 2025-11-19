import { Draw } from '../render/Draw';
import { getPowerUpSprite } from '../render/AlienSprites';

export type PowerUpType =
  | 'points'
  | 'damage'
  | 'speed'
  | 'multishot'
  | 'critical';

export interface PowerUp {
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  lifetime: number;
  maxLifetime: number;
  pulseTime: number;
}

export interface ActiveBuff {
  type: PowerUpType;
  duration: number;
  maxDuration: number;
}

interface PowerUpConfig {
  color: string;
  icon: string;
  name: string;
  description: string;
  duration: number;
}

const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  points: {
    color: '#00ff88',
    icon: '💰',
    name: 'Points Boost',
    description: '+100% points earned',
    duration: 15,
  },
  damage: {
    color: '#ff4444',
    icon: '⚔️',
    name: 'Damage Boost',
    description: '+200% damage',
    duration: 15,
  },
  speed: {
    color: '#ffff00',
    icon: '⚡',
    name: 'Speed Boost',
    description: '+100% attack speed',
    duration: 12,
  },
  multishot: {
    color: '#ff00ff',
    icon: '✨',
    name: 'Multishot',
    description: 'All ships fire together',
    duration: 8,
  },
  critical: {
    color: '#ff8800',
    icon: '💥',
    name: 'Critical Surge',
    description: '+50% crit chance',
    duration: 10,
  },
};

export class PowerUpSystem {
  private powerUps: PowerUp[] = [];
  private activeBuffs: ActiveBuff[] = [];
  private spawnTimer = 0;
  private spawnInterval = 180; // Spawn every 180 seconds (3 minutes) - very rare like Cookie Clicker
  private canvasWidth: number;
  private canvasHeight: number;
  private onPowerUpSpawnCallback: ((type: PowerUpType) => void) | null = null;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Set callback for when a power-up spawns
   */
  setOnPowerUpSpawn(callback: (type: PowerUpType) => void): void {
    this.onPowerUpSpawnCallback = callback;
  }

  public resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public update(dt: number): void {
    // Update spawn timer - power-ups spawn very rarely (like Cookie Clicker golden cookies)
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.powerUps.length < 2) {
      // Only allow max 2 power-ups on screen at once to keep them special
      this.spawnRandomPowerUp();
      this.spawnTimer = 0;
    }

    // Update power-ups and remove inactive ones in-place (O(n) instead of O(n²) with filter)
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (!powerUp || !powerUp.active) {
        this.powerUps.splice(i, 1);
        continue;
      }

      powerUp.lifetime -= dt;
      powerUp.pulseTime += dt;

      // Despawn if lifetime expired
      if (powerUp.lifetime <= 0) {
        powerUp.active = false;
        this.powerUps.splice(i, 1);
      }
    }

    // Update active buffs and remove expired ones in-place
    for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
      const buff = this.activeBuffs[i];
      if (buff) {
        buff.duration -= dt;
        if (buff.duration <= 0) {
          this.activeBuffs.splice(i, 1);
        }
      }
    }
  }

  private spawnRandomPowerUp(): void {
    const types: PowerUpType[] = [
      'points',
      'damage',
      'speed',
      'multishot',
      'critical',
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    const type = types[randomIndex] ?? 'damage';

    const margin = 100;
    const x = Math.random() * (this.canvasWidth - margin * 2) + margin;
    const y = Math.random() * (this.canvasHeight - margin * 2) + margin;

    this.powerUps.push({
      type,
      x,
      y,
      radius: 20,
      active: true,
      lifetime: 15, // Power-ups last 15 seconds before despawning
      maxLifetime: 15,
      pulseTime: 0,
    });

    // Trigger spawn callback
    if (this.onPowerUpSpawnCallback) {
      this.onPowerUpSpawnCallback(type);
    }
  }

  public render(ctx: CanvasRenderingContext2D, drawer?: Draw): void {
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      const config = POWERUP_CONFIGS[powerUp.type];
      const pulse = Math.sin(powerUp.pulseTime * 4) * 0.1 + 1; // Subtle pulse
      const alpha = powerUp.lifetime < 3 ? (powerUp.lifetime % 0.5) / 0.5 : 1; // Blink when expiring
      
      // Use Pixel Sprite rendering if drawer is available
      if (drawer) {
        // console.log('Rendering powerup with pixel sprite', powerUp.type);
        const sprite = getPowerUpSprite(powerUp.type);
        const size = powerUp.radius * 3.5 * pulse; // Increased size for visibility
        
        // Add a glow effect behind the sprite
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        const glow = ctx.createRadialGradient(
          powerUp.x, powerUp.y, size * 0.2,
          powerUp.x, powerUp.y, size * 0.8
        );
        glow.addColorStop(0, config.color);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some pixel particles/sparkles around
        const sparklePhase = powerUp.pulseTime * 3;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + sparklePhase;
            const dist = size * 0.6;
            const px = powerUp.x + Math.cos(angle) * dist;
            const py = powerUp.y + Math.sin(angle) * dist;
            const pSize = 2 + Math.sin(sparklePhase * 2 + i) * 1;
            ctx.fillRect(px - pSize/2, py - pSize/2, pSize, pSize);
        }
        ctx.restore();

        // Draw pixel sprite using the Draw class
        drawer.pixelSprite(
          powerUp.x,
          powerUp.y,
          size,
          size,
          sprite,
          config.color,
          alpha
        );

        // Add a label below
        if (alpha > 0.5) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = 'bold 16px "m5x7", monospace'; // Larger text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 4;
          ctx.fillText(config.name.split(' ')[0] ?? 'BUFF', powerUp.x, powerUp.y + size / 2 + 5);
          ctx.restore();
        }
        continue;
      }
        // Fallback to legacy rendering (circles)
        const rotation = powerUp.pulseTime * 2; // Rotating effect
        const sparklePhase = powerUp.pulseTime * 3; // For sparkle animation

        ctx.save();
        ctx.globalAlpha = alpha;

        // Massive outer aura glow (farthest layer)
        const massiveGlow = ctx.createRadialGradient(
          powerUp.x,
          powerUp.y,
          0,
          powerUp.x,
          powerUp.y,
          powerUp.radius * pulse * 4,
        );
        massiveGlow.addColorStop(0, `${config.color}40`);
        massiveGlow.addColorStop(0.3, `${config.color}20`);
        massiveGlow.addColorStop(0.6, `${config.color}10`);
        massiveGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = massiveGlow;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse * 4, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow ring (animated rotation)
        ctx.translate(powerUp.x, powerUp.y);
        ctx.rotate(rotation);

        // Large outer glow
        const outerGlowGradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          powerUp.radius * pulse * 3,
        );
        outerGlowGradient.addColorStop(0, `${config.color}80`);
        outerGlowGradient.addColorStop(0.4, `${config.color}40`);
        outerGlowGradient.addColorStop(0.7, `${config.color}20`);
        outerGlowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = outerGlowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, powerUp.radius * pulse * 3, 0, Math.PI * 2);
        ctx.fill();

        // Rotating outer ring with segments for sparkle effect
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = config.color;
        ctx.beginPath();
        ctx.arc(0, 0, powerUp.radius * pulse * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Additional rotating ring (counter-rotation)
        ctx.rotate(-rotation * 1.5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, powerUp.radius * pulse * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        ctx.save();
        ctx.globalAlpha = alpha;

        // Medium glow
        const mediumGlow = ctx.createRadialGradient(
          powerUp.x,
          powerUp.y,
          0,
          powerUp.x,
          powerUp.y,
          powerUp.radius * pulse * 2.2,
        );
        mediumGlow.addColorStop(0, `${config.color}EE`);
        mediumGlow.addColorStop(0.5, `${config.color}AA`);
        mediumGlow.addColorStop(0.8, `${config.color}66`);
        mediumGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mediumGlow;
        ctx.beginPath();
        ctx.arc(
          powerUp.x,
          powerUp.y,
          powerUp.radius * pulse * 2.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Main circle with enhanced gradient fill
        const mainGradient = ctx.createRadialGradient(
          powerUp.x - powerUp.radius * 0.4,
          powerUp.y - powerUp.radius * 0.4,
          0,
          powerUp.x,
          powerUp.y,
          powerUp.radius * pulse,
        );
        mainGradient.addColorStop(0, '#ffffff');
        mainGradient.addColorStop(0.2, '#ffffff88');
        mainGradient.addColorStop(0.4, config.color);
        mainGradient.addColorStop(0.7, config.color + 'DD');
        mainGradient.addColorStop(1, config.color + 'AA');

        ctx.fillStyle = mainGradient;
        ctx.shadowBlur = 25;
        ctx.shadowColor = config.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Bright glowing border with multiple layers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner highlight circle (enhanced)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(
          powerUp.x - powerUp.radius * pulse * 0.35,
          powerUp.y - powerUp.radius * pulse * 0.35,
          powerUp.radius * pulse * 0.45,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Sparkle particles orbiting around (8 sparkles)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + sparklePhase;
          const sparkleRadius = powerUp.radius * pulse * 1.4;
          const sparkleX = powerUp.x + Math.cos(angle) * sparkleRadius;
          const sparkleY = powerUp.y + Math.sin(angle) * sparkleRadius;
          const sparkleAlpha = (Math.sin(sparklePhase * 2 + i) + 1) * 0.5;

          ctx.globalAlpha = alpha * sparkleAlpha * 0.8;
          ctx.beginPath();
          ctx.moveTo(sparkleX - 3, sparkleY);
          ctx.lineTo(sparkleX + 3, sparkleY);
          ctx.moveTo(sparkleX, sparkleY - 3);
          ctx.lineTo(sparkleX, sparkleY + 3);
          ctx.stroke();
        }

        // Draw icon with enhanced shadow and glow
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 12;
        ctx.shadowColor = config.color;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(config.icon, powerUp.x, powerUp.y + 1);

        // Icon inner glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillText(config.icon, powerUp.x, powerUp.y + 1);

        ctx.restore();
    }
  }

  public renderBuffs(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ): void {
    let offsetX = 0;

    for (const buff of this.activeBuffs) {
      const config = POWERUP_CONFIGS[buff.type];
      const width = 60;
      const height = 50;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x + offsetX, y, width, height);

      // Border
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + offsetX, y, width, height);

      // Icon
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(config.icon, x + offsetX + width / 2, y + 5);

      // Timer bar
      const barWidth = width - 10;
      const barHeight = 4;
      const barX = x + offsetX + 5;
      const barY = y + height - 10;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const fillWidth = (buff.duration / buff.maxDuration) * barWidth;
      ctx.fillStyle = config.color;
      ctx.fillRect(barX, barY, fillWidth, barHeight);

      // Time remaining
      ctx.font = '10px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        Math.ceil(buff.duration).toString() + 's',
        x + offsetX + width / 2,
        y + 28,
      );

      offsetX += width + 5;
    }
  }

  public checkCollision(x: number, y: number): PowerUpType | null {
    // Check all power-ups and find the closest one
    let closestPowerUp: PowerUp | null = null;
    let closestDistance = Infinity;
    const MOBILE_TOUCH_RADIUS = 120; // Very generous touch radius for mobile

    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      const dx = powerUp.x - x;
      const dy = powerUp.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Much larger collision radius for mobile-friendly clicking
      // The visual radius is ~35px, so 120px gives a huge touch target
      if (
        distance < powerUp.radius + MOBILE_TOUCH_RADIUS &&
        distance < closestDistance
      ) {
        closestPowerUp = powerUp;
        closestDistance = distance;
      }
    }

    // Collect the closest power-up if any was found
    if (closestPowerUp) {
      closestPowerUp.active = false;
      this.activateBuff(closestPowerUp.type);
      return closestPowerUp.type;
    }

    return null;
  }

  private activateBuff(type: PowerUpType): void {
    const config = POWERUP_CONFIGS[type];

    // Remove existing buff of same type
    this.activeBuffs = this.activeBuffs.filter((b) => b.type !== type);

    // Add new buff
    this.activeBuffs.push({
      type,
      duration: config.duration,
      maxDuration: config.duration,
    });
  }

  public hasBuff(type: PowerUpType): boolean {
    return this.activeBuffs.some((b) => b.type === type);
  }

  public getDamageMultiplier(): number {
    return this.hasBuff('damage') ? 3 : 1;
  }

  public getSpeedMultiplier(): number {
    return this.hasBuff('speed') ? 2 : 1;
  }

  public getCritChanceBonus(): number {
    return this.hasBuff('critical') ? 0.5 : 0;
  }

  public getPointsMultiplier(): number {
    return this.hasBuff('points') ? 2 : 1;
  }

  public hasMultishot(): boolean {
    return this.hasBuff('multishot');
  }

  public getBuffName(type: PowerUpType): string {
    return POWERUP_CONFIGS[type].name;
  }

  public getPowerUpColor(type: PowerUpType): string {
    return POWERUP_CONFIGS[type].color;
  }

  public getPowerUpIcon(type: PowerUpType): string {
    return POWERUP_CONFIGS[type].icon;
  }

  public clear(): void {
    this.powerUps = [];
    this.activeBuffs = [];
    this.spawnTimer = 0;
  }

  public getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  public getActiveBuffs(): ActiveBuff[] {
    return this.activeBuffs;
  }

  public spawnAt(x: number, y: number, type?: PowerUpType): void {
    const types: PowerUpType[] = [
      'points',
      'damage',
      'speed',
      'multishot',
      'critical',
    ];

    const margin = 50;
    const powerUpX = Math.max(margin, Math.min(this.canvasWidth - margin, x));
    const powerUpY = Math.max(margin, Math.min(this.canvasHeight - margin, y));

    const powerUpType =
      type ?? types[Math.floor(Math.random() * types.length)] ?? 'damage';

    this.powerUps.push({
      type: powerUpType,
      x: powerUpX,
      y: powerUpY,
      radius: 20,
      active: true,
      lifetime: 15,
      maxLifetime: 15,
      pulseTime: 0,
    });

    // Trigger spawn callback
    if (this.onPowerUpSpawnCallback) {
      this.onPowerUpSpawnCallback(powerUpType);
    }
  }
}
