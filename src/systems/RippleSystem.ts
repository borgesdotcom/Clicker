import { Ripple } from '../entities/Ripple';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class RippleSystem {
  private ripples: Ripple[] = [];
  private readonly isMobile: boolean;
  private readonly maxRipples: number; // Limit active ripples for performance
  private lastSpawnTime = 0;
  private readonly spawnCooldown = 0.05; // Minimum 50ms between ripples (20 per second max)

  constructor() {
    // Detect mobile device
    this.isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    // Reduce max ripples on mobile for better performance
    this.maxRipples = this.isMobile ? 3 : 10;
  }

  spawnRipple(center: Vec2, maxRadius: number): void {
    // Throttle ripple spawning to prevent lag from rapid clicks
    const now = performance.now() / 1000; // Convert to seconds
    if (now - this.lastSpawnTime < this.spawnCooldown) {
      return; // Skip this ripple if spawning too fast
    }
    this.lastSpawnTime = now;

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
