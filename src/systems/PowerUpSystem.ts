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

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
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
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue;

      const config = POWERUP_CONFIGS[powerUp.type];
      const pulse = Math.sin(powerUp.pulseTime * 4) * 0.15 + 1; // Smoother pulse
      const rotation = powerUp.pulseTime * 2; // Rotating effect
      const alpha = powerUp.lifetime < 3 ? (powerUp.lifetime % 0.5) / 0.5 : 1; // Blink when expiring

      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow ring (animated rotation)
      ctx.translate(powerUp.x, powerUp.y);
      ctx.rotate(rotation);
      
      // Large outer glow
      const outerGlowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, powerUp.radius * pulse * 3);
      outerGlowGradient.addColorStop(0, `${config.color}60`);
      outerGlowGradient.addColorStop(0.5, `${config.color}30`);
      outerGlowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = outerGlowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.radius * pulse * 3, 0, Math.PI * 2);
      ctx.fill();

      // Rotating outer ring
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = config.color;
      ctx.beginPath();
      ctx.arc(0, 0, powerUp.radius * pulse * 1.6, 0, Math.PI * 2);
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
        powerUp.radius * pulse * 2,
      );
      mediumGlow.addColorStop(0, `${config.color}CC`);
      mediumGlow.addColorStop(0.7, `${config.color}66`);
      mediumGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mediumGlow;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main circle with gradient fill
      const mainGradient = ctx.createRadialGradient(
        powerUp.x - powerUp.radius * 0.3,
        powerUp.y - powerUp.radius * 0.3,
        0,
        powerUp.x,
        powerUp.y,
        powerUp.radius * pulse,
      );
      mainGradient.addColorStop(0, '#ffffff');
      mainGradient.addColorStop(0.3, config.color);
      mainGradient.addColorStop(1, config.color + 'DD');

      ctx.fillStyle = mainGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = config.color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Bright border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Inner highlight circle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(
        powerUp.x - powerUp.radius * pulse * 0.3,
        powerUp.y - powerUp.radius * pulse * 0.3,
        powerUp.radius * pulse * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Draw icon with shadow
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(config.icon, powerUp.x, powerUp.y + 1); // Slight offset for depth

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
      if (distance < powerUp.radius + MOBILE_TOUCH_RADIUS && distance < closestDistance) {
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
    
    const powerUpType = type ?? types[Math.floor(Math.random() * types.length)] ?? 'damage';
    
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
  }
}
