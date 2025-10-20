import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class Laser {
  public alive = true;
  private travelTime = 0.3;
  private fadeTime = 0.15;
  private age = 0;
  public hasHit = false;
  public damage: number;
  public isCrit = false;
  public color = '#fff';
  public width = 2;

  constructor(
    public origin: Vec2,
    public target: Vec2,
    damage: number,
    upgrades?: { isCrit?: boolean; color?: string; width?: number }
  ) {
    this.damage = damage;
    if (upgrades) {
      this.isCrit = upgrades.isCrit ?? false;
      this.color = upgrades.color ?? '#fff';
      this.width = upgrades.width ?? 2;
    }
  }

  update(dt: number): void {
    this.age += dt;
    
    if (this.age >= this.travelTime + this.fadeTime) {
      this.alive = false;
    }
  }

  getCurrentPosition(): Vec2 {
    if (this.age >= this.travelTime) {
      return this.target;
    }
    
    const progress = Math.min(1, this.age / this.travelTime);
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
    let alpha = 1;
    
    if (this.age > this.travelTime) {
      const fadeProgress = (this.age - this.travelTime) / this.fadeTime;
      alpha = 1 - fadeProgress;
    }

    drawer.setAlpha(alpha);
    
    // Use custom color and width based on upgrades
    drawer.setStroke(this.color, this.width);
    drawer.line(this.origin.x, this.origin.y, current.x, current.y);
    
    // Crit hits have a glow effect
    if (this.isCrit) {
      drawer.setStroke(this.color, this.width + 4);
      drawer.setAlpha(alpha * 0.3);
      drawer.line(this.origin.x, this.origin.y, current.x, current.y);
      drawer.setAlpha(alpha);
    }
    
    drawer.setFill(this.color);
    drawer.circle(current.x, current.y, this.isCrit ? 5 : 3);
    drawer.resetAlpha();
  }
}

