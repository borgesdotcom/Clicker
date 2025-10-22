import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class Laser {
  public alive = true;
  private travelTime = 0.15; // Fast laser travel
  public age = 0; // Made public for laser system management
  public hasHit = false;
  public damage: number;
  public isCrit = false;
  public color = '#fff';
  public width = 2;
  public isFromShip = false;

  constructor(
    public origin: Vec2,
    public target: Vec2,
    damage: number,
    upgrades?: {
      isCrit?: boolean;
      color?: string;
      width?: number;
      isFromShip?: boolean;
    },
  ) {
    this.damage = damage;
    if (upgrades) {
      this.isCrit = upgrades.isCrit ?? false;
      this.color = upgrades.color ?? '#fff';
      this.width = upgrades.width ?? 2;
      this.isFromShip = upgrades.isFromShip ?? false;
    }
  }

  update(dt: number): void {
    this.age += dt;

    // Remove immediately after hitting (no fade-out)
    if (this.hasHit) {
      this.alive = false;
    }
  }

  getCurrentPosition(): Vec2 {
    if (this.age >= this.travelTime) {
      return this.target;
    }

    const progress = Math.min(1, this.age / this.travelTime);

    // Straight line laser beam
    return {
      x: this.origin.x + (this.target.x - this.origin.x) * progress,
      y: this.origin.y + (this.target.y - this.origin.y) * progress,
    };
  }

  checkHit(): boolean {
    if (this.hasHit) return false;
    if (this.age >= this.travelTime) {
      this.hasHit = true;
      return true;
    }
    return false;
  }

  draw(drawer: Draw): void {
    if (!this.alive) return;

    const current = this.getCurrentPosition();
    const progress = Math.min(1, this.age / this.travelTime);

    // Smooth fade-in effect (no epileptic flickering)
    const fadeInAlpha = Math.min(1, progress * 1.5);

    const ctx = drawer.getContext();
    ctx.save();

    // Draw straight laser beam
    const colorRgba = this.hexToRgba(this.color, fadeInAlpha * 0.6);
    const colorTransparent = this.hexToRgba(this.color, 0);

    const gradient = ctx.createLinearGradient(
      this.origin.x,
      this.origin.y,
      current.x,
      current.y,
    );

    gradient.addColorStop(0, colorTransparent);
    gradient.addColorStop(0.5, colorRgba);
    gradient.addColorStop(1, this.hexToRgba(this.color, fadeInAlpha));

    ctx.globalAlpha = fadeInAlpha * 0.7;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.origin.x, this.origin.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    // Glow for crits (thin glow)
    if (this.isCrit) {
      ctx.globalAlpha = fadeInAlpha * 0.3;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width + 1.5; // Thin glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(this.origin.x, this.origin.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }

    // Draw impact point (only when laser reaches target)
    if (progress >= 0.95) {
      ctx.globalAlpha = fadeInAlpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.isCrit ? 6 : 3;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(current.x, current.y, this.isCrit ? 2 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private hexToRgba(hex: string, alpha: number): string {
    // Handle both #RGB and #RRGGBB formats
    let r = 0,
      g = 0,
      b = 0;

    if (hex.startsWith('#')) {
      hex = hex.substring(1);
    }

    if (hex.length === 3) {
      r = parseInt((hex[0] ?? '0') + (hex[0] ?? '0'), 16);
      g = parseInt((hex[1] ?? '0') + (hex[1] ?? '0'), 16);
      b = parseInt((hex[2] ?? '0') + (hex[2] ?? '0'), 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r.toString()}, ${g.toString()}, ${b.toString()}, ${alpha.toString()})`;
  }
}
