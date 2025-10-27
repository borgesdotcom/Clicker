import { Laser, type LaserConfig } from '../entities/Laser';
import { ObjectPool } from '../utils/ObjectPool';
import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

interface BeamTarget {
  origin: Vec2;
  target: Vec2;
  color: string;
  width: number;
  isCrit: boolean;
}

export class LaserSystem {
  private laserPool: ObjectPool<Laser>;
  private showShipLasers = true;
  private maxLasers = 1000;
  private maxShipLasers = 800;
  private beamMode = false;
  private beamThreshold = 300;
  private shipBeams: Map<number, BeamTarget> = new Map();
  private mainShipBeam: BeamTarget | null = null;
  private beamDamageTimer = 0;
  private beamDamagePerTick = 0;

  constructor() {
    this.laserPool = new ObjectPool<Laser>(
      () => new Laser(),
      (laser) => {
        laser.alive = false;
        laser.hasHit = false;
        laser.age = 0;
      },
      100,
      this.maxLasers,
    );
  }

  setShowShipLasers(show: boolean): void {
    this.showShipLasers = show;
  }

  setBeamMode(enabled: boolean): void {
    this.beamMode = enabled;
    if (!enabled) {
      this.shipBeams.clear();
      this.mainShipBeam = null;
    }
  }

  isBeamMode(): boolean {
    return this.beamMode;
  }

  shouldUseBeamMode(cooldownMs: number): boolean {
    return cooldownMs <= this.beamThreshold;
  }

  setBeamThreshold(threshold: number): void {
    this.beamThreshold = threshold;
  }

  updateShipBeamTarget(
    shipIndex: number,
    origin: Vec2,
    target: Vec2,
    color?: string,
    width?: number,
    isCrit?: boolean,
  ): void {
    const beam = this.shipBeams.get(shipIndex);
    if (beam) {
      beam.origin = origin;
      beam.target = target;
      if (color !== undefined) beam.color = color;
      if (width !== undefined) beam.width = width;
      if (isCrit !== undefined) beam.isCrit = isCrit;
    } else {
      this.shipBeams.set(shipIndex, {
        origin,
        target,
        color: color ?? '#fff',
        width: width ?? 2,
        isCrit: isCrit ?? false,
      });
    }
  }

  updateMainShipBeamTarget(
    origin: Vec2,
    target: Vec2,
    color?: string,
    width?: number,
    isCrit?: boolean,
  ): void {
    if (this.mainShipBeam) {
      this.mainShipBeam.origin = origin;
      this.mainShipBeam.target = target;
      if (color !== undefined) this.mainShipBeam.color = color;
      if (width !== undefined) this.mainShipBeam.width = width;
      if (isCrit !== undefined) this.mainShipBeam.isCrit = isCrit;
    } else {
      this.mainShipBeam = {
        origin,
        target,
        color: color ?? '#fff',
        width: width ?? 2,
        isCrit: isCrit ?? false,
      };
    }
  }

  setBeamDamage(damagePerTick: number): void {
    this.beamDamagePerTick = damagePerTick;
  }

  clearShipBeam(shipIndex: number): void {
    this.shipBeams.delete(shipIndex);
  }

  clearBeams(): void {
    this.shipBeams.clear();
    this.mainShipBeam = null;
    this.beamDamagePerTick = 0;
    this.beamDamageTimer = 0;
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

    const activeLasers = this.laserPool.getActive();
    const stats = this.laserPool.getStats();

    if (isFromShip) {
      const shipLasers = activeLasers.filter((l) => l.isFromShip);
      if (shipLasers.length >= this.maxShipLasers) {
        let youngest: Laser | null = null;
        let youngestAge = Infinity;

        for (const laser of shipLasers) {
          if (laser.age < youngestAge) {
            youngestAge = laser.age;
            youngest = laser;
          }
        }

        if (youngest) {
          this.laserPool.release(youngest);
        }
      }
    } else {
      const shipLasers = activeLasers.filter((l) => l.isFromShip);
      if (shipLasers.length > 0 && stats.active >= this.maxLasers) {
        let youngest: Laser | null = null;
        let youngestAge = Infinity;

        for (const laser of shipLasers) {
          if (laser.age < youngestAge) {
            youngestAge = laser.age;
            youngest = laser;
          }
        }

        if (youngest) {
          this.laserPool.release(youngest);
        }
      } else if (stats.active >= this.maxLasers) {
        let youngest: Laser | null = null;
        let youngestAge = Infinity;

        for (const laser of activeLasers) {
          if (!laser.isFromShip && laser.age < youngestAge) {
            youngestAge = laser.age;
            youngest = laser;
          }
        }

        if (youngest) {
          this.laserPool.release(youngest);
        }
      }
    }

    const laser: Laser = this.laserPool.acquire();
    const config: LaserConfig = {
      origin,
      target,
      damage,
      isCrit: upgrades?.isCrit,
      color: upgrades?.color,
      width: upgrades?.width,
      isFromShip,
    };
    (laser.init as (config: LaserConfig) => void)(config);
    return;
  }

  update(
    dt: number,
    onHit?: (damage: number, isCrit: boolean, isFromShip: boolean) => void,
  ): void {
    if (this.beamMode && onHit) {
      this.beamDamageTimer += dt;
    }

    const activeLasers = this.laserPool.getActive();
    const toRelease: Laser[] = [];

    for (const laser of activeLasers) {
      laser.update(dt);
      if (onHit && laser.checkHit()) {
        onHit(laser.damage, laser.isCrit, laser.isFromShip);
      }
      if (!laser.alive) {
        toRelease.push(laser);
      }
    }

    for (const laser of toRelease) {
      this.laserPool.release(laser);
    }
  }

  processBeamDamage(
    cooldownMs: number,
    onHit: (damage: number, isCrit: boolean, isFromShip: boolean) => void,
  ): void {
    if (!this.beamMode || this.beamDamagePerTick <= 0) return;

    const cooldownSec = cooldownMs / 1000;

    if (this.beamDamageTimer >= cooldownSec) {
      onHit(this.beamDamagePerTick, false, true);
      this.beamDamageTimer = 0;
    }
  }

  draw(drawer: Draw): void {
    if (this.beamMode) {
      this.drawBeams(drawer);
    }

    const activeLasers = this.laserPool.getActive();
    for (const laser of activeLasers) {
      if (!this.showShipLasers && laser.isFromShip) {
        continue;
      }
      if (laser.alive) {
        laser.draw(drawer);
      }
    }
  }

  private drawBeams(drawer: Draw): void {
    const ctx = drawer.getContext();

    if (this.mainShipBeam) {
      this.drawBeam(ctx, this.mainShipBeam);
    }

    if (this.showShipLasers) {
      for (const beam of this.shipBeams.values()) {
        this.drawBeam(ctx, beam);
      }
    }
  }

  private drawBeam(ctx: CanvasRenderingContext2D, beam: BeamTarget): void {
    ctx.save();

    const pulseAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;

    const gradient = ctx.createLinearGradient(
      beam.origin.x,
      beam.origin.y,
      beam.target.x,
      beam.target.y,
    );

    const colorRgba = this.hexToRgba(beam.color, pulseAlpha * 0.7);
    const colorTransparent = this.hexToRgba(beam.color, 0);

    gradient.addColorStop(0, colorTransparent);
    gradient.addColorStop(0.3, colorRgba);
    gradient.addColorStop(1, this.hexToRgba(beam.color, pulseAlpha));

    ctx.globalAlpha = pulseAlpha;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = beam.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(beam.origin.x, beam.origin.y);
    ctx.lineTo(beam.target.x, beam.target.y);
    ctx.stroke();

    if (beam.isCrit) {
      ctx.globalAlpha = pulseAlpha * 0.5;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width + 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = beam.color;
      ctx.beginPath();
      ctx.moveTo(beam.origin.x, beam.origin.y);
      ctx.lineTo(beam.target.x, beam.target.y);
      ctx.stroke();
    }

    ctx.globalAlpha = pulseAlpha;
    ctx.fillStyle = beam.color;
    ctx.shadowBlur = beam.isCrit ? 10 : 5;
    ctx.shadowColor = beam.color;
    ctx.beginPath();
    ctx.arc(beam.target.x, beam.target.y, beam.isCrit ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = beam.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(beam.origin.x, beam.origin.y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private hexToRgba(hex: string, alpha: number): string {
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

  clear(): void {
    const activeLasers = this.laserPool.getActive();
    this.laserPool.releaseAll([...activeLasers]);
  }

  getLasers(): Laser[] {
    return this.laserPool.getActive();
  }

  getLaserStats(): { total: number; shipLasers: number; playerLasers: number } {
    const activeLasers = this.laserPool.getActive();
    const shipLasers = activeLasers.filter((l) => l.isFromShip).length;
    const playerLasers = activeLasers.filter((l) => !l.isFromShip).length;
    return {
      total: activeLasers.length,
      shipLasers,
      playerLasers,
    };
  }
}
