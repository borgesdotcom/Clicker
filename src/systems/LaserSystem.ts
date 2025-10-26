import { Laser } from '../entities/Laser';
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
  private lasers: Laser[] = [];
  private showShipLasers = true;
  private maxLasers = 1000; // Increased limit for max attack speed
  private maxShipLasers = 800; // Separate limit for ship lasers
  private beamMode = false;
  private beamThreshold = 300; // Switch to beam mode below 300ms cooldown
  private shipBeams: Map<number, BeamTarget> = new Map(); // Track active beams per ship
  private mainShipBeam: BeamTarget | null = null; // Track main ship beam
  private beamDamageTimer = 0;
  private beamDamagePerTick = 0; // Damage to apply per tick

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

  // Update beam with position and visuals (minimal updates)
  updateShipBeamTarget(
    shipIndex: number, 
    origin: Vec2, 
    target: Vec2,
    color?: string,
    width?: number,
    isCrit?: boolean
  ): void {
    const beam = this.shipBeams.get(shipIndex);
    if (beam) {
      // Update positions and visuals
      beam.origin = origin;
      beam.target = target;
      if (color !== undefined) beam.color = color;
      if (width !== undefined) beam.width = width;
      if (isCrit !== undefined) beam.isCrit = isCrit;
    } else {
      // Create beam only if it doesn't exist
      this.shipBeams.set(shipIndex, { 
        origin, 
        target, 
        color: color ?? '#fff', 
        width: width ?? 2, 
        isCrit: isCrit ?? false 
      });
    }
  }

  // Update main ship beam with position and visuals
  updateMainShipBeamTarget(
    origin: Vec2, 
    target: Vec2,
    color?: string,
    width?: number,
    isCrit?: boolean
  ): void {
    if (this.mainShipBeam) {
      // Update positions and visuals
      this.mainShipBeam.origin = origin;
      this.mainShipBeam.target = target;
      if (color !== undefined) this.mainShipBeam.color = color;
      if (width !== undefined) this.mainShipBeam.width = width;
      if (isCrit !== undefined) this.mainShipBeam.isCrit = isCrit;
    } else {
      // Create beam only if it doesn't exist
      this.mainShipBeam = { 
        origin, 
        target, 
        color: color ?? '#fff', 
        width: width ?? 2, 
        isCrit: isCrit ?? false 
      };
    }
  }

  // Set the damage per tick for beams (called once when entering beam mode)
  setBeamDamage(damagePerTick: number): void {
    this.beamDamagePerTick = damagePerTick;
  }

  // Clear a specific ship's beam
  clearShipBeam(shipIndex: number): void {
    this.shipBeams.delete(shipIndex);
  }

  // Clear all beams
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

  update(dt: number, onHit?: (damage: number, isCrit: boolean, isFromShip: boolean) => void): void {
    // Update beam damage timer in beam mode
    if (this.beamMode && onHit) {
      this.beamDamageTimer += dt;
    }

    // Update regular lasers
    for (const laser of this.lasers) {
      laser.update(dt);
      if (onHit && laser.checkHit()) {
        onHit(laser.damage, laser.isCrit, laser.isFromShip);
      }
    }
    this.lasers = this.lasers.filter((laser) => laser.alive);
  }

  // Process beam damage based on attack speed (minimal processing)
  processBeamDamage(
    cooldownMs: number,
    onHit: (damage: number, isCrit: boolean, isFromShip: boolean) => void,
  ): void {
    if (!this.beamMode || this.beamDamagePerTick <= 0) return;

    const cooldownSec = cooldownMs / 1000;
    
    // Apply damage at the rate of attack speed
    if (this.beamDamageTimer >= cooldownSec) {
      // Apply damage once per cooldown interval (beams are from ships)
      onHit(this.beamDamagePerTick, false, true);
      this.beamDamageTimer = 0;
    }
  }

  draw(drawer: Draw): void {
    // Draw beams if in beam mode
    if (this.beamMode) {
      this.drawBeams(drawer);
    }

    // Draw regular lasers
    for (const laser of this.lasers) {
      // Skip drawing ship lasers if disabled (but they still do damage)
      if (!this.showShipLasers && laser.isFromShip) {
        continue;
      }
      laser.draw(drawer);
    }
  }

  private drawBeams(drawer: Draw): void {
    const ctx = drawer.getContext();

    // Draw main ship beam
    if (this.mainShipBeam) {
      this.drawBeam(ctx, this.mainShipBeam);
    }

    // Draw ship beams (if enabled)
    if (this.showShipLasers) {
      for (const beam of this.shipBeams.values()) {
        this.drawBeam(ctx, beam);
      }
    }
  }

  private drawBeam(ctx: CanvasRenderingContext2D, beam: BeamTarget): void {
    ctx.save();

    // Pulsing alpha effect for more dynamic feel
    const pulseAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;

    // Create gradient for beam
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

    // Main beam
    ctx.globalAlpha = pulseAlpha;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = beam.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(beam.origin.x, beam.origin.y);
    ctx.lineTo(beam.target.x, beam.target.y);
    ctx.stroke();

    // Glow for crits or enhanced effect
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

    // Draw impact point
    ctx.globalAlpha = pulseAlpha;
    ctx.fillStyle = beam.color;
    ctx.shadowBlur = beam.isCrit ? 10 : 5;
    ctx.shadowColor = beam.color;
    ctx.beginPath();
    ctx.arc(beam.target.x, beam.target.y, beam.isCrit ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();

    // Add a glowing core at origin
    ctx.fillStyle = beam.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(beam.origin.x, beam.origin.y, 2, 0, Math.PI * 2);
    ctx.fill();

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
