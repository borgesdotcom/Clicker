import { Ripple } from '../entities/Ripple';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class RippleSystem {
  private ripples: Ripple[] = [];
  private maxRipples = 10; // Limit active ripples for performance

  spawnRipple(center: Vec2, maxRadius: number): void {
    // Limit number of active ripples
    // Use pop() instead of shift() for O(1) performance (removes newest instead of oldest)
    // The update() method filters dead items anyway, so order doesn't matter much
    if (this.ripples.length >= this.maxRipples) {
      this.ripples.pop();
    }
    this.ripples.push(new Ripple(center, maxRadius));
  }

  update(dt: number): void {
    // Use reverse iteration for safe in-place removal (O(n) instead of O(n²) with filter)
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      if (ripple) {
        ripple.update(dt);
        if (!ripple.alive) {
          // Remove dead ripples in-place (O(1) removal from end)
          this.ripples.splice(i, 1);
        }
      }
    }
  }

  draw(drawer: Draw): void {
    for (const ripple of this.ripples) {
      ripple.draw(drawer);
    }
  }

  clear(): void {
    this.ripples = [];
  }

  getCount(): number {
    return this.ripples.length;
  }
}
