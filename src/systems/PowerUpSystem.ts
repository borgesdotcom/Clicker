export type PowerUpType =
  | 'shield'
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
  shield: {
    color: '#00aaff',
    icon: '🛡️',
    name: 'Shield',
    description: 'Invulnerable to boss attacks',
    duration: 10,
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
  private spawnInterval = 30; // Spawn every 30 seconds
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  public resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public update(dt: number): void {
    // Update spawn timer
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.powerUps.length < 3) {
      this.spawnRandomPowerUp();
      this.spawnTimer = 0;
    }

    // Update power-ups
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      powerUp.lifetime -= dt;
      powerUp.pulseTime += dt;

      // Despawn if lifetime expired
      if (powerUp.lifetime <= 0) {
        powerUp.active = false;
      }
    }

    // Clean up inactive power-ups
    this.powerUps = this.powerUps.filter((p) => p.active);

    // Update active buffs
    for (const buff of this.activeBuffs) {
      buff.duration -= dt;
    }

    // Remove expired buffs
    this.activeBuffs = this.activeBuffs.filter((b) => b.duration > 0);
  }

  private spawnRandomPowerUp(): void {
    const types: PowerUpType[] = [
      'shield',
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
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      const config = POWERUP_CONFIGS[powerUp.type];
      const pulse = Math.sin(powerUp.pulseTime * 3) * 0.2 + 1;
      const alpha = powerUp.lifetime < 3 ? (powerUp.lifetime % 0.5) / 0.5 : 1; // Blink when expiring

      // Draw glow
      const gradient = ctx.createRadialGradient(
        powerUp.x,
        powerUp.y,
        0,
        powerUp.x,
        powerUp.y,
        powerUp.radius * pulse * 2,
      );
      gradient.addColorStop(0, `${config.color}80`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;
      ctx.fillRect(
        powerUp.x - powerUp.radius * pulse * 2,
        powerUp.y - powerUp.radius * pulse * 2,
        powerUp.radius * pulse * 4,
        powerUp.radius * pulse * 4,
      );

      // Draw circle
      ctx.fillStyle = config.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw icon
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(config.icon, powerUp.x, powerUp.y);

      ctx.globalAlpha = 1;
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
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      const dx = powerUp.x - x;
      const dy = powerUp.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < powerUp.radius + 30) {
        // Collect power-up
        powerUp.active = false;
        this.activateBuff(powerUp.type);
        return powerUp.type;
      }
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

  public hasShield(): boolean {
    return this.hasBuff('shield');
  }

  public hasMultishot(): boolean {
    return this.hasBuff('multishot');
  }

  public getBuffName(type: PowerUpType): string {
    return POWERUP_CONFIGS[type].name;
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
}
