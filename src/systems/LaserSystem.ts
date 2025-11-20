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
  private beamThreshold = 250;
  private shipBeams: Map<number, BeamTarget> = new Map();
  private mainShipBeam: BeamTarget | null = null;
  private beamDamageTimer = 0;
  private beamDamagePerTick = 0;
  public lastBeamThemeId?: string;

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

  clearMainShipBeam(): void {
    this.mainShipBeam = null;
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
    onHit?: (
      damage: number,
      isCrit: boolean,
      isFromShip: boolean,
      hitDirection?: Vec2,
    ) => void,
  ): void {
    if (this.beamMode && onHit) {
      this.beamDamageTimer += dt;
    }

    const activeLasers = this.laserPool.getActive();
    const toRelease: Laser[] = [];

    for (const laser of activeLasers) {
      laser.update(dt);

      // Check for hit (only processes once when laser reaches target)
      // Note: Even if target is gone, we still process the hit for consistency
      if (onHit && laser.checkHit()) {
        // Calculate hit direction from origin to target
        const dx = laser.target.x - laser.origin.x;
        const dy = laser.target.y - laser.origin.y;
        const hitDirection: Vec2 = { x: dx, y: dy };
        onHit(laser.damage, laser.isCrit, laser.isFromShip, hitDirection);
      }

      // Remove laser only after animation completes (allows visual to finish)
      // Check if laser should be removed (after animation completes)
      if ('shouldRemove' in laser && typeof laser.shouldRemove === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (laser.shouldRemove()) {
          toRelease.push(laser);
        }
      } else if (!laser.alive) {
        // Fallback: remove if not alive (but this shouldn't happen until animation completes)
        toRelease.push(laser);
      }
    }

    for (const laser of toRelease) {
      this.laserPool.release(laser);
    }
  }

  processBeamDamage(
    cooldownMs: number,
    onHit: (
      damage: number,
      isCrit: boolean,
      isFromShip: boolean,
      hitDirection?: Vec2,
      isBeam?: boolean,
    ) => void,
    targetPosition?: Vec2,
    beamOrigin?: Vec2,
  ): void {
    if (!this.beamMode || this.beamDamagePerTick <= 0) return;

    const cooldownSec = cooldownMs / 1000;

    if (this.beamDamageTimer >= cooldownSec) {
      // Calculate hit direction for beam deformation
      let hitDirection: Vec2 | undefined;
      if (targetPosition && beamOrigin) {
        const dx = targetPosition.x - beamOrigin.x;
        const dy = targetPosition.y - beamOrigin.y;
        hitDirection = { x: dx, y: dy };
      }
      onHit(this.beamDamagePerTick, false, true, hitDirection, true);
      this.beamDamageTimer = 0;
    }
  }

  draw(drawer: Draw): void {
    if (this.beamMode) {
      this.drawBeams(drawer);
    }

    // Check if WebGL is available for laser rendering
    const drawerWithWebGL = drawer as Draw & {
      getWebGLRenderer?: () => {
        addLaser?: (...args: unknown[]) => void;
      } | null;
      isWebGLEnabled?: () => boolean;
    };

    const webglRenderer = drawerWithWebGL.getWebGLRenderer?.();
    const useWebGL = drawerWithWebGL.isWebGLEnabled?.() ?? false;
    const laserThemeId: string | undefined = this.lastBeamThemeId; // Reuse beam theme ID for lasers

    const activeLasers = this.laserPool.getActive();
    if (useWebGL && webglRenderer && webglRenderer.addLaser) {
      // Use WebGL for laser rendering
      for (const laser of activeLasers) {
        if (!this.showShipLasers && laser.isFromShip) {
          continue;
        }
        if (laser.alive) {
          const current = laser.getCurrentPosition();
          // Calculate progress including time after hit for fade-out
          const travelTime = 0.15;
          const progress = laser.age / travelTime; // Allow > 1.0 for fade-out calculation
          webglRenderer.addLaser(
            laser.origin.x,
            laser.origin.y,
            current.x,
            current.y,
            laser.width,
            laser.color,
            progress,
            laser.isCrit,
            laserThemeId,
          );
        }
      }
    } else {
      // Fallback to 2D canvas
      for (const laser of activeLasers) {
        if (!this.showShipLasers && laser.isFromShip) {
          continue;
        }
        if (laser.alive) {
          laser.themeId = laserThemeId;
          laser.draw(drawer);
        }
      }
    }
  }

  private drawBeams(drawer: Draw): void {
    // Check if WebGL is available for beam rendering
    // Use type assertion to access WebGL renderer methods
    const drawerWithWebGL = drawer as Draw & {
      getWebGLRenderer?: () => {
        addBeam?: (...args: unknown[]) => void;
      } | null;
      isWebGLEnabled?: () => boolean;
    };

    const webglRenderer = drawerWithWebGL.getWebGLRenderer?.();
    const useWebGL = drawerWithWebGL.isWebGLEnabled?.() ?? false;
    const beamThemeId: string | undefined = this.lastBeamThemeId;

    if (useWebGL && webglRenderer && webglRenderer.addBeam) {
      // Use WebGL for beam rendering with theme effects
      if (this.mainShipBeam) {
        webglRenderer.addBeam(
          this.mainShipBeam.origin.x,
          this.mainShipBeam.origin.y,
          this.mainShipBeam.target.x,
          this.mainShipBeam.target.y,
          this.mainShipBeam.width,
          this.mainShipBeam.color,
          this.mainShipBeam.isCrit,
          beamThemeId,
        );
      }

      if (this.showShipLasers) {
        for (const beam of this.shipBeams.values()) {
          webglRenderer.addBeam(
            beam.origin.x,
            beam.origin.y,
            beam.target.x,
            beam.target.y,
            beam.width,
            beam.color,
            beam.isCrit,
            beamThemeId,
          );
        }
      }
    } else {
      // Fallback to 2D canvas
      const ctx = drawer.getContext();

      if (this.mainShipBeam) {
        this.drawBeam(ctx, this.mainShipBeam, beamThemeId ?? undefined);
      }

      if (this.showShipLasers) {
        for (const beam of this.shipBeams.values()) {
          this.drawBeam(ctx, beam, beamThemeId ?? undefined);
        }
      }
    }
  }

  private drawBeam(
    ctx: CanvasRenderingContext2D,
    beam: BeamTarget,
    themeId?: string,
  ): void {
    ctx.save();

    const now = Date.now();
    const pulseAlpha = 0.6 + Math.sin(now * 0.012) * 0.25;
    const wavePhase = now * 0.015;
    const pulseWidth = 1.0 + Math.sin(now * 0.01) * 0.2;

    if (themeId === 'rainbow_laser') {
      const colors = [
        '#ff0000',
        '#ff8800',
        '#ffff00',
        '#00ff00',
        '#0088ff',
        '#0000ff',
        '#8800ff',
        '#ff00ff',
      ];
      const segmentCount = 20;
      const dx = (beam.target.x - beam.origin.x) / segmentCount;
      const dy = (beam.target.y - beam.origin.y) / segmentCount;
      const colorOffset = Math.floor(wavePhase * 100) % colors.length;

      ctx.lineCap = 'round';
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < segmentCount; i++) {
          const wave = Math.sin(wavePhase + i * 1.2 + layer * 0.6) * 0.3 + 0.7;
          const x1 = beam.origin.x + dx * i;
          const y1 = beam.origin.y + dy * i;
          const x2 = beam.origin.x + dx * (i + 1);
          const y2 = beam.origin.y + dy * (i + 1);
          const segColor =
            colors[(i + colorOffset + layer) % colors.length] ?? beam.color;
          const alpha = pulseAlpha * wave * (1.0 - layer * 0.4);
          const segWidth =
            beam.width * (1.4 + wave * 0.4) * pulseWidth * (1.0 - layer * 0.3);

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = segColor;
          ctx.lineWidth = segWidth;
          ctx.shadowBlur = segWidth * 2;
          ctx.shadowColor = segColor;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    } else if (themeId === 'plasma_laser') {
      const segmentCount = 12;
      const dx = (beam.target.x - beam.origin.x) / segmentCount;
      const dy = (beam.target.y - beam.origin.y) / segmentCount;
      const plasmaColors = [
        '#ff4400',
        '#ff6600',
        '#ff8800',
        '#ff4400',
        '#ff0044',
      ];

      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < segmentCount; i++) {
          const wave =
            Math.sin(wavePhase + i * 1.8 + layer * 0.5) * 0.35 + 0.65;
          const x1 = beam.origin.x + dx * i;
          const y1 = beam.origin.y + dy * i;
          const x2 = beam.origin.x + dx * (i + 1);
          const y2 = beam.origin.y + dy * (i + 1);
          const segColor =
            plasmaColors[
              (i + Math.floor(wavePhase * 50)) % plasmaColors.length
            ] ?? beam.color;
          const alpha = pulseAlpha * wave * (1.0 - layer * 0.3);
          const segWidth =
            beam.width * (1.5 + wave * 0.5) * pulseWidth * (1.0 - layer * 0.25);

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = segColor;
          ctx.lineWidth = segWidth;
          ctx.shadowBlur = segWidth * 1.5;
          ctx.shadowColor = segColor;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    } else if (themeId === 'void_laser') {
      const pulse2 = Math.sin(now * 0.014) * 0.25 + 0.75;
      const pulse3 = Math.sin(now * 0.018) * 0.2 + 0.8;
      const segmentCount = 10;
      const dx = (beam.target.x - beam.origin.x) / segmentCount;
      const dy = (beam.target.y - beam.origin.y) / segmentCount;

      for (let i = 0; i < segmentCount; i++) {
        const wave = Math.sin(wavePhase + i * 1.5) * 0.25 + 0.75;
        const x1 = beam.origin.x + dx * i;
        const y1 = beam.origin.y + dy * i;
        const x2 = beam.origin.x + dx * (i + 1);
        const y2 = beam.origin.y + dy * (i + 1);

        ctx.globalAlpha = pulseAlpha * wave * 0.6;
        ctx.strokeStyle = '#4400aa';
        ctx.lineWidth = beam.width * (1.6 + wave * 0.4) * pulseWidth;
        ctx.shadowBlur = beam.width * 3;
        ctx.shadowColor = '#4400aa';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.globalAlpha = pulseAlpha * wave * pulse2;
        ctx.strokeStyle = '#8800ff';
        ctx.lineWidth = beam.width * (1.1 + wave * 0.3) * pulseWidth;
        ctx.shadowBlur = beam.width * 2;
        ctx.shadowColor = '#8800ff';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.globalAlpha = pulseAlpha * wave * pulse3;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = beam.width * (0.8 + wave * 0.25) * pulseWidth;
        ctx.shadowBlur = beam.width * 1.5;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else {
      const segmentCount = 8;
      const dx = (beam.target.x - beam.origin.x) / segmentCount;
      const dy = (beam.target.y - beam.origin.y) / segmentCount;

      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < segmentCount; i++) {
          const wave = Math.sin(wavePhase + i * 1.5 + layer * 0.7) * 0.3 + 0.7;
          const x1 = beam.origin.x + dx * i;
          const y1 = beam.origin.y + dy * i;
          const x2 = beam.origin.x + dx * (i + 1);
          const y2 = beam.origin.y + dy * (i + 1);
          const alpha = pulseAlpha * wave * (1.0 - layer * 0.4);
          const segWidth =
            beam.width *
            (1.0 + wave * 0.4) *
            pulseWidth *
            (layer === 0 ? 1.0 : 1.6);

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, this.hexToRgba(beam.color, alpha * 0.5));
          gradient.addColorStop(0.5, this.hexToRgba(beam.color, alpha));
          gradient.addColorStop(1, this.hexToRgba(beam.color, alpha * 0.8));

          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = segWidth;
          ctx.lineCap = 'round';
          ctx.shadowBlur = segWidth * 1.5;
          ctx.shadowColor = beam.color;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    if (beam.isCrit) {
      const critPulse = Math.sin(now * 0.02) * 0.3 + 0.7;
      ctx.globalAlpha = pulseAlpha * critPulse * 0.6;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width * (2.0 + critPulse * 0.5);
      ctx.shadowBlur = 20;
      ctx.shadowColor = beam.color;
      ctx.beginPath();
      ctx.moveTo(beam.origin.x, beam.origin.y);
      ctx.lineTo(beam.target.x, beam.target.y);
      ctx.stroke();
    }

    const endPulse = Math.sin(now * 0.025) * 0.25 + 0.75;
    ctx.globalAlpha = pulseAlpha * endPulse;
    ctx.fillStyle = beam.color;
    ctx.shadowBlur = beam.isCrit ? 15 : 8;
    ctx.shadowColor = beam.color;
    ctx.beginPath();
    ctx.arc(
      beam.target.x,
      beam.target.y,
      (beam.isCrit ? 4 : 2.5) * endPulse,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.globalAlpha = pulseAlpha * endPulse * 0.5;
    ctx.beginPath();
    ctx.arc(
      beam.target.x,
      beam.target.y,
      (beam.isCrit ? 6 : 4) * endPulse,
      0,
      Math.PI * 2,
    );
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
