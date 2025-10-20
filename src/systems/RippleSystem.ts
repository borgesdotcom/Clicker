import { Ripple } from '../entities/Ripple';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class RippleSystem {
  private ripples: Ripple[] = [];

  spawnRipple(center: Vec2, maxRadius: number): void {
    this.ripples.push(new Ripple(center, maxRadius));
  }

  update(dt: number): void {
    for (const ripple of this.ripples) {
      ripple.update(dt);
    }
    this.ripples = this.ripples.filter((ripple) => ripple.alive);
  }

  draw(drawer: Draw): void {
    for (const ripple of this.ripples) {
      ripple.draw(drawer);
    }
  }

  clear(): void {
    this.ripples = [];
  }
}

