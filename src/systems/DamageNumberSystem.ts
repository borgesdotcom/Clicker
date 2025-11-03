/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Draw } from '../render/Draw';

interface DamageNumber {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  isCrit: boolean;
}

export class DamageNumberSystem {
  private numbers: DamageNumber[] = [];
  private enabled = true;
  private maxNumbers = 15; // Reduced max for better performance

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  spawnDamageNumber(
    x: number,
    y: number,
    damage: number,
    isCrit: boolean = false,
  ): void {
    // Don't spawn if disabled (performance)
    if (!this.enabled) return;

    // Limit number of active damage numbers
    // Use pop() instead of shift() for O(1) performance (removes newest instead of oldest)
    // The update() method filters dead items anyway, so order doesn't matter much
    if (this.numbers.length >= this.maxNumbers) {
      // Remove newest number (O(1) operation)
      this.numbers.pop();
    }

    const text = this.formatDamage(damage);
    const color = isCrit ? '#ffff00' : '#ffffff';

    this.numbers.push({
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 20,
      text,
      color,
      life: 1.0, // Even shorter life
      maxLife: 1.0,
      vy: -120, // Even faster movement
      isCrit,
    });
  }

  update(dt: number): void {
    // Update and remove dead numbers in-place (O(n) instead of O(n²) with filter)
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const num = this.numbers[i];
      if (!num) {
        this.numbers.splice(i, 1);
        continue;
      }

      num.y += num.vy * dt;
      num.vy += 50 * dt; // Gravity
      num.life -= dt;

      if (num.life <= 0) {
        this.numbers.splice(i, 1);
      }
    }
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const num of this.numbers) {
      const alpha = Math.min(1, num.life / 0.4);
      ctx.globalAlpha = alpha;

      const fontSize = num.isCrit ? 18 : 14; // Smaller for better performance
      ctx.font = `bold ${fontSize}px monospace`;

      // Simple outline (no stroke for performance)
      ctx.fillStyle = '#000';
      ctx.fillText(num.text, num.x - 1, num.y - 1);
      ctx.fillText(num.text, num.x + 1, num.y + 1);

      // Text
      ctx.fillStyle = num.color;
      ctx.fillText(num.text, num.x, num.y);
    }

    ctx.restore();
  }

  clear(): void {
    this.numbers = [];
  }

  getCount(): number {
    return this.numbers.length;
  }

  private formatDamage(damage: number): string {
    if (damage >= 1e9) return `${(damage / 1e9).toFixed(1)}B`;
    if (damage >= 1e6) return `${(damage / 1e6).toFixed(1)}M`;
    if (damage >= 1e3) return `${(damage / 1e3).toFixed(1)}K`;
    return Math.floor(damage).toString();
  }
}
