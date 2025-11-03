/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Draw } from '../render/Draw';
import { ObjectPool } from '../utils/ObjectPool';
import { DamageNumber } from '../entities/DamageNumber';

export class DamageNumberSystem {
  private damageNumberPool: ObjectPool<DamageNumber>;
  private enabled = true;
  private maxNumbers = 15; // Reduced max for better performance

  constructor() {
    this.damageNumberPool = new ObjectPool<DamageNumber>(
      () => new DamageNumber(),
      (number) => {
        number.active = false;
        number.life = 0;
        number.vy = -120;
      },
      5, // Initial pool size
      this.maxNumbers, // Max pool size
    );
  }

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

    const stats = this.damageNumberPool.getStats();
    if (stats.active >= this.maxNumbers) {
      // Remove oldest active number if we hit the limit
      const active = this.damageNumberPool.getActive();
      if (active.length > 0) {
        // Find oldest (lowest life)
        let oldest: DamageNumber | null = null;
        let oldestLife = Infinity;
        for (const num of active) {
          if (num.life < oldestLife) {
            oldestLife = num.life;
            oldest = num;
          }
        }
        if (oldest) {
          this.damageNumberPool.release(oldest);
        }
      }
    }

    const number = this.damageNumberPool.acquire();
    number.init({ x, y, damage, isCrit });
  }

  update(dt: number): void {
    const numbers = this.damageNumberPool.getActive();
    const toRelease: DamageNumber[] = [];

    for (const num of numbers) {
      num.update(dt);
      if (!num.active) {
        toRelease.push(num);
      }
    }

    for (const num of toRelease) {
      this.damageNumberPool.release(num);
    }
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();
    const numbers = this.damageNumberPool.getActive();

    if (numbers.length === 0) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Batch by font size to reduce state changes
    let currentFontSize = 0;
    let currentFillStyle = '';

    for (const num of numbers) {
      if (!num.active) continue;

      const alpha = Math.min(1, num.life / 0.4);
      ctx.globalAlpha = alpha;

      const fontSize = num.isCrit ? 18 : 14;
      
      // Only set font if it changed
      if (fontSize !== currentFontSize) {
        ctx.font = `bold ${fontSize}px monospace`;
        currentFontSize = fontSize;
      }

      // Simple outline (no stroke for performance)
      if (currentFillStyle !== '#000') {
        ctx.fillStyle = '#000';
        currentFillStyle = '#000';
      }
      ctx.fillText(num.text, num.x - 1, num.y - 1);
      ctx.fillText(num.text, num.x + 1, num.y + 1);

      // Text
      if (currentFillStyle !== num.color) {
        ctx.fillStyle = num.color;
        currentFillStyle = num.color;
      }
      ctx.fillText(num.text, num.x, num.y);
    }

    ctx.restore();
  }

  clear(): void {
    const numbers = this.damageNumberPool.getActive();
    this.damageNumberPool.releaseAll([...numbers]);
  }

  getCount(): number {
    return this.damageNumberPool.getStats().active;
  }
}
