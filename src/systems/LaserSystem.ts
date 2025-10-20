import { Laser } from '../entities/Laser';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class LaserSystem {
  private lasers: Laser[] = [];

  spawnLaser(origin: Vec2, target: Vec2, damage: number, upgrades?: { isCrit?: boolean; color?: string; width?: number }): void {
    this.lasers.push(new Laser(origin, target, damage, upgrades));
  }

  update(dt: number, onHit?: (damage: number, isCrit: boolean) => void): void {
    for (const laser of this.lasers) {
      laser.update(dt);
      if (onHit && laser.checkHit()) {
        onHit(laser.damage, laser.isCrit);
      }
    }
    this.lasers = this.lasers.filter((laser) => laser.alive);
  }

  draw(drawer: Draw): void {
    for (const laser of this.lasers) {
      laser.draw(drawer);
    }
  }

  clear(): void {
    this.lasers = [];
  }

  getLasers(): Laser[] {
    return this.lasers;
  }
}

