import { NumberFormatter } from '../utils/NumberFormatter';

export interface DamageNumberConfig {
  x: number;
  y: number;
  damage: number;
  isCrit: boolean;
  customColor?: string;
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
    if (config.customColor) {
      this.color = config.customColor;
    } else {
      this.color = config.isCrit ? '#ffff00' : '#ffffff';
    }
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
    return NumberFormatter.format(damage);
  }
}
