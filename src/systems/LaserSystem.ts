import { Laser } from '../entities/Laser';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class LaserSystem {
  private lasers: Laser[] = [];
  private showShipLasers = true;
  private maxLasers = 1000; // Increased limit for max attack speed
  private maxShipLasers = 800; // Separate limit for ship lasers

  setShowShipLasers(show: boolean): void {
    this.showShipLasers = show;
  }

  spawnLaser(
    origin: Vec2,
    target: Vec2,
    damage: number,
    upgrades?: {
      isCrit?: boolean;
      color?: string;
      width?: number;
      isFromShip?: boolean;
    },
  ): void {
    const isFromShip = upgrades?.isFromShip ?? false;

    // Smart laser management based on type
    if (isFromShip) {
      // For ship lasers, remove youngest ship lasers first (furthest from completion)
      const shipLasers = this.lasers.filter((l) => l.isFromShip);
      if (shipLasers.length >= this.maxShipLasers) {
        let youngestIndex = -1;
        let youngestAge = Infinity;

        for (let i = 0; i < this.lasers.length; i++) {
          const laser = this.lasers[i];
          if (laser && laser.isFromShip && laser.age < youngestAge) {
            youngestAge = laser.age;
            youngestIndex = i;
          }
        }

        if (youngestIndex !== -1) {
          this.lasers.splice(youngestIndex, 1);
        }
      }
    } else {
      // For player lasers, prioritize removing ship lasers first
      const shipLasers = this.lasers.filter((l) => l.isFromShip);
      if (shipLasers.length > 0 && this.lasers.length >= this.maxLasers) {
        // Remove youngest ship laser (furthest from completion)
        let youngestIndex = -1;
        let youngestAge = Infinity;

        for (let i = 0; i < this.lasers.length; i++) {
          const laser = this.lasers[i];
          if (laser && laser.isFromShip && laser.age < youngestAge) {
            youngestAge = laser.age;
            youngestIndex = i;
          }
        }

        if (youngestIndex !== -1) {
          this.lasers.splice(youngestIndex, 1);
        }
      } else if (this.lasers.length >= this.maxLasers) {
        // Only remove player lasers if absolutely necessary
        // Find youngest player laser (furthest from completion) to remove
        let youngestIndex = -1;
        let youngestAge = Infinity;

        for (let i = 0; i < this.lasers.length; i++) {
          const laser = this.lasers[i];
          if (laser && !laser.isFromShip && laser.age < youngestAge) {
            youngestAge = laser.age;
            youngestIndex = i;
          }
        }

        if (youngestIndex !== -1) {
          this.lasers.splice(youngestIndex, 1);
        }
      }
    }

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
      // Skip drawing ship lasers if disabled (but they still do damage)
      if (!this.showShipLasers && laser.isFromShip) {
        continue;
      }
      laser.draw(drawer);
    }
  }

  clear(): void {
    this.lasers = [];
  }

  getLasers(): Laser[] {
    return this.lasers;
  }

  getLaserStats(): { total: number; shipLasers: number; playerLasers: number } {
    const shipLasers = this.lasers.filter((l) => l.isFromShip).length;
    const playerLasers = this.lasers.filter((l) => !l.isFromShip).length;
    return {
      total: this.lasers.length,
      shipLasers,
      playerLasers,
    };
  }
}
