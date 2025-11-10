export interface DamageNumberConfig {
  x: number;
  y: number;
  damage: number;
  isCrit: boolean;
}

export class DamageNumber {
  public active = true;
  public x!: number;
  public y!: number;
  public text!: string;
  public color!: string;
  public life!: number;
  public maxLife!: number;
  public vy!: number;
  public isCrit!: boolean;

  constructor(config?: DamageNumberConfig) {
    if (config) {
      this.init(config);
    } else {
      // Default values for pool creation
      this.x = 0;
      this.y = 0;
      this.text = '';
      this.color = '#ffffff';
      this.life = 1.0;
      this.maxLife = 1.0;
      this.vy = -120;
      this.isCrit = false;
    }
  }

  init(config: DamageNumberConfig): void {
    this.x = config.x + (Math.random() - 0.5) * 40;
    this.y = config.y + (Math.random() - 0.5) * 20;
    this.text = this.formatDamage(config.damage);
    this.color = config.isCrit ? '#ffff00' : '#ffffff';
    this.life = 1.0;
    this.maxLife = 1.0;
    this.vy = -120;
    this.isCrit = config.isCrit;
    this.active = true;
  }

  update(dt: number): void {
    this.y += this.vy * dt;
    this.vy += 50 * dt; // Gravity
    this.life -= dt;

    if (this.life <= 0) {
      this.active = false;
    }
  }

  private formatDamage(damage: number): string {
    if (damage >= 1e9) return `${(damage / 1e9).toFixed(1)}B`;
    if (damage >= 1e6) return `${(damage / 1e6).toFixed(1)}M`;
    if (damage >= 1e3) return `${(damage / 1e3).toFixed(1)}K`;
    if (damage >= 10) return Math.floor(damage).toString();
    if (damage >= 1) return damage.toFixed(1);
    return damage.toFixed(2);
  }
}
