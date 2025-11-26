/**
 * RenderManager - Coordinates all rendering operations
 * Extracted from Game.ts for better separation of concerns
 */

import type { Canvas } from '../render/Canvas';
import type { Draw } from '../render/Draw';
import type { Background } from '../render/Background';
import type { WebGLRenderer } from '../render/WebGLRenderer';
import type { GameMode } from '../types';

/**
 * Dependencies that RenderManager needs
 */
export interface RenderManagerDependencies {
  canvas: Canvas;
  draw: Draw;
  background: Background;
  customizationSystem: {
    getBackgroundColors: () => { primary: string; secondary: string };
  };
  userSettings: {
    highGraphics: boolean;
    screenShakeEnabled: boolean;
  };
}

/**
 * Entities and systems to render
 */
export interface RenderEntities {
  ball?: { draw: (draw: Draw) => void; currentHp: number } | null;
  bossBall?: { draw: (draw: Draw) => void; currentHp: number } | null;
  ships: Array<{ draw: (draw: Draw) => void; x: number; y: number; getPosition: () => { x: number; y: number } }>;
  particleSystem: {
    getParticleCount: () => number;
    draw: (draw: Draw) => void;
  };
  laserSystem: {
    draw: (draw: Draw) => void;
  };
  damageNumberSystem: {
    getCount: () => number;
    draw: (draw: Draw) => void;
  };
  comboSystem: {
    getCombo: () => number;
    draw: (
      draw: Draw,
      width: number,
      height: number,
      state: any,
    ) => void;
  };
  powerUpSystem: {
    getPowerUps: () => Array<{ active: boolean }>;
    render: (ctx: CanvasRenderingContext2D, draw: Draw) => void;
  };
  customizationSystem: {
    getShipColors: (state: any) => any;
  };
  store: {
    getReadonlyState: () => any;
  };
  swarmConnection?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection2?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection3?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection4?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection5?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection6?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection7?: { fromIndex: number; toIndex: number; progress: number } | null;
  swarmConnection8?: { fromIndex: number; toIndex: number; progress: number } | null;
  satellite?: {
    x: number;
    y: number;
    angle: number;
    image: HTMLImageElement | null;
    missiles: Array<{
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      startX: number;
      startY: number;
      progress: number;
      damage: number;
      speed: number;
      curveDirection: number;
      curveAmount: number;
    }>;
    targetX: number;
    targetY: number;
  } | null;
}

/**
 * Render state
 */
export interface RenderState {
  mode: GameMode;
  transitionTime: number;
  transitionDuration: number;
  shakeTime: number;
  shakeAmount: number;
  isAscensionAnimating: boolean;
  ascensionAnimationTime: number;
}

export class RenderManager {
  private deps: RenderManagerDependencies;

  constructor(deps: RenderManagerDependencies) {
    this.deps = deps;
  }

  /**
   * Main render method - coordinates all rendering
   */
  render(entities: RenderEntities, state: RenderState): void {
    // Apply background theme colors
    const bgColors = this.deps.customizationSystem.getBackgroundColors();
    const themeId: string = 'default_background';
    this.deps.background.setThemeColors(bgColors, themeId);

    // Clear canvas (WebGL or 2D)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer: WebGLRenderer | null = this.deps.canvas.getWebGLRenderer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this.deps.canvas.isWebGLEnabled() && webglRenderer !== null) {
      // Clear WebGL canvas
      webglRenderer.clear(bgColors.primary);
      // Also clear offscreen 2D canvas for background/text
      this.deps.canvas.clear();
    } else {
      this.deps.canvas.clear();
    }

    const ctx = this.deps.canvas.getContext();

    // Early exit if nothing to render (shouldn't happen, but safety check)
    if (state.mode === 'transition' && state.transitionTime <= 0) {
      return;
    }

    // Background always uses 2D canvas (complex gradients and effects)
    this.deps.background.render(ctx, this.deps.userSettings.highGraphics);

    ctx.save();

    // Apply screen shake
    if (state.shakeTime > 0 && this.deps.userSettings.screenShakeEnabled) {
      const intensity = state.shakeAmount * (state.shakeTime / 0.1);
      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      ctx.translate(offsetX, offsetY);
    }

    // Render transition if in transition mode
    if (state.mode === 'transition') {
      this.renderTransition(state);
      ctx.restore();
      // Flush WebGL batches before frame end
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.deps.draw.flush();
      // Also flush WebGL and composite overlay
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.deps.canvas.flushWebGL();
      return;
    }

    // Batch render game entities for better performance
    this.renderGameEntities(ctx, entities);

    // Render ascension animation overlay
    if (state.isAscensionAnimating) {
      this.renderAscensionAnimation(ctx, state);
    }

    ctx.restore();

    // Flush WebGL batches at end of frame (critical for performance)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.deps.draw.flush();
    // Also flush WebGL and composite overlay
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.deps.canvas.flushWebGL();
  }

  /**
   * Render all game entities
   */
  private renderGameEntities(
    ctx: CanvasRenderingContext2D,
    entities: RenderEntities,
  ): void {
    // Early exit checks
    const hasBall = entities.ball && entities.ball.currentHp > 0;
    const hasBoss = entities.bossBall && entities.bossBall.currentHp > 0;
    const hasParticles =
      this.deps.userSettings.highGraphics &&
      entities.particleSystem.getParticleCount() > 0;
    const hasDamageNumbers = entities.damageNumberSystem.getCount() > 0;
    const hasCombo = entities.comboSystem.getCombo() > 0;
    const hasPowerUps = entities.powerUpSystem.getPowerUps().length > 0;

    // Render particles first (background layer)
    if (hasParticles) {
      entities.particleSystem.draw(this.deps.draw);
    }

    // Render lasers (projectiles)
    entities.laserSystem.draw(this.deps.draw);

    // Render main entities (ball/boss)
    if (hasBall && entities.ball) {
      entities.ball.draw(this.deps.draw);
    }
    if (hasBoss && entities.bossBall) {
      entities.bossBall.draw(this.deps.draw);
    }

    // Render satellite (before ships)
    if (entities.satellite) {
      this.renderSatellite(ctx, entities.satellite);
    }

    // Render ships (batch by entity type)
    // Use 2D canvas rendering for ships (better performance than DOM overlays)
    const gameState = entities.store.getReadonlyState();
    // Calculate visuals once per frame instead of per ship
    const visuals = entities.customizationSystem.getShipColors(gameState);

    for (const ship of entities.ships) {
      // Store visuals for ship to use (for fallback triangle rendering)
      (ship as any).customVisuals = visuals;
      ship.draw(this.deps.draw);
    }

    // Render swarm connections
    if (entities.swarmConnection && entities.ships.length > entities.swarmConnection.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection.fromIndex];
      const toShip = entities.ships[entities.swarmConnection.toIndex];
      if (fromShip && toShip) {
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    if (entities.swarmConnection2 && entities.ships.length > entities.swarmConnection2.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection2.fromIndex];
      const toShip = entities.ships[entities.swarmConnection2.toIndex];
      if (fromShip && toShip) {
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection2.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    if (entities.swarmConnection3 && entities.ships.length > entities.swarmConnection3.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection3.fromIndex];
      const toShip = entities.ships[entities.swarmConnection3.toIndex];
      if (fromShip && toShip) {
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection3.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    if (entities.swarmConnection4 && entities.ships.length > entities.swarmConnection4.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection4.fromIndex];
      const toShip = entities.ships[entities.swarmConnection4.toIndex];
      if (fromShip && toShip) {
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection4.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    if (entities.swarmConnection5 && entities.ships.length > entities.swarmConnection5.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection5.fromIndex];
      const toShip = entities.ships[entities.swarmConnection5.toIndex];
      if (fromShip && toShip) {
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection5.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    // Render sixth swarm connection line if active
    if (entities.swarmConnection6 && entities.ships.length > entities.swarmConnection6.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection6.fromIndex];
      const toShip = entities.ships[entities.swarmConnection6.toIndex];
      if (fromShip && toShip) {
        const gameState = entities.store.getReadonlyState();
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection6.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    // Render seventh swarm connection line if active
    if (entities.swarmConnection7 && entities.ships.length > entities.swarmConnection7.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection7.fromIndex];
      const toShip = entities.ships[entities.swarmConnection7.toIndex];
      if (fromShip && toShip) {
        const gameState = entities.store.getReadonlyState();
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection7.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    // Render eighth swarm connection line if active
    if (entities.swarmConnection8 && entities.ships.length > entities.swarmConnection8.toIndex) {
      const fromShip = entities.ships[entities.swarmConnection8.fromIndex];
      const toShip = entities.ships[entities.swarmConnection8.toIndex];
      if (fromShip && toShip) {
        const gameState = entities.store.getReadonlyState();
        const useGreen = gameState.subUpgrades?.['quantum_fleet_sync'] ?? false;
        const useOrange = gameState.subUpgrades?.['hyper_network_accelerator'] ?? false;
        const useWhite = gameState.subUpgrades?.['network_white_glow'] ?? false;
        const useRed = gameState.subUpgrades?.['crimson_network_protocol'] ?? false;
        this.renderSwarmConnection(ctx, fromShip, toShip, entities.swarmConnection8.progress, useGreen, useOrange, useWhite, useRed);
      }
    }

    // Render UI elements
    if (hasDamageNumbers) {
      entities.damageNumberSystem.draw(this.deps.draw);
    }

    if (hasCombo) {
      entities.comboSystem.draw(
        this.deps.draw,
        this.deps.canvas.getWidth(),
        this.deps.canvas.getHeight(),
        gameState,
      );
    }

    // Render power-ups
    if (hasPowerUps) {
      entities.powerUpSystem.render(ctx, this.deps.draw);
    }
  }

  /**
   * Render transition effect
   */
  private renderTransition(state: RenderState): void {
    const progress = state.transitionTime / state.transitionDuration;
    const alpha = Math.sin(progress * Math.PI);

    this.deps.draw.setAlpha(alpha);
    const cx = this.deps.canvas.getCenterX();
    const cy = this.deps.canvas.getCenterY();
    const maxRadius = Math.max(
      this.deps.canvas.getWidth(),
      this.deps.canvas.getHeight(),
    );

    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (progress + i * 0.2);
      this.deps.draw.setStroke('#fff', 2);
      this.deps.draw.circle(cx, cy, radius, false);
    }

    this.deps.draw.resetAlpha();
  }

  /**
   * Render ascension animation overlay
   */
  private renderAscensionAnimation(
    ctx: CanvasRenderingContext2D,
    state: RenderState,
  ): void {
    const animationDuration = 2.5;
    const progress = Math.min(1, state.ascensionAnimationTime / animationDuration);

    // Screen flash effect - white fade in/out
    let flashAlpha = 0;
    if (progress < 0.3) {
      // Fade in white flash (first 30%)
      flashAlpha = progress / 0.3;
    } else if (progress < 0.7) {
      // Hold white flash (30% to 70%)
      flashAlpha = 1;
    } else {
      // Fade out white flash (last 30%)
      flashAlpha = 1 - (progress - 0.7) / 0.3;
    }

    // Draw white overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
    ctx.fillRect(0, 0, this.deps.canvas.getWidth(), this.deps.canvas.getHeight());

    // Draw golden/yellow glow in center
    const centerX = this.deps.canvas.getCenterX();
    const centerY = this.deps.canvas.getCenterY();
    const maxRadius = Math.max(
      this.deps.canvas.getWidth(),
      this.deps.canvas.getHeight(),
    );

    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      maxRadius * progress,
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${flashAlpha * 0.8})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${flashAlpha * 0.4})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.deps.canvas.getWidth(), this.deps.canvas.getHeight());
  }

  /**
   * Render swarm connection line between ships with smooth animation
   */
  private renderSwarmConnection(
    ctx: CanvasRenderingContext2D,
    fromShip: { x: number; y: number },
    toShip: { x: number; y: number },
    progress: number,
    useGreen: boolean = false,
    useOrange: boolean = false,
    useWhite: boolean = false,
    useRed: boolean = false,
  ): void {
    ctx.save();

    const dx = toShip.x - fromShip.x;
    const dy = toShip.y - fromShip.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) {
      ctx.restore();
      return;
    }

    const currentX = fromShip.x + dx * progress;
    const currentY = fromShip.y + dy * progress;

    const gradient = ctx.createLinearGradient(fromShip.x, fromShip.y, currentX, currentY);

    let baseColor = '51, 153, 255';
    if (useRed) {
      baseColor = '255, 0, 0';
    } else if (useWhite) {
      baseColor = '255, 255, 255';
    } else if (useOrange) {
      baseColor = '255, 165, 0';
    } else if (useGreen) {
      baseColor = '51, 255, 51';
    }

    gradient.addColorStop(0, `rgba(${baseColor}, 0.8)`);
    gradient.addColorStop(0.7, `rgba(${baseColor}, 1.0)`);
    gradient.addColorStop(1, `rgba(${baseColor}, 0.9)`);

    ctx.shadowBlur = (useRed || useWhite) ? 12 : 8;
    ctx.shadowColor = `rgba(${baseColor}, ${(useRed || useWhite) ? 0.8 : 0.6})`;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = (useRed || useWhite) ? 2.5 : 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromShip.x, fromShip.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromShip.x, fromShip.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    if (progress > 0.1) {
      let tipColor = '51, 153, 255';
      if (useRed) {
        tipColor = '255, 0, 0';
      } else if (useWhite) {
        tipColor = '255, 255, 255';
      } else if (useOrange) {
        tipColor = '255, 165, 0';
      } else if (useGreen) {
        tipColor = '51, 255, 51';
      }
      ctx.fillStyle = `rgba(${tipColor}, 0.9)`;
      ctx.shadowBlur = (useRed || useWhite) ? 10 : 6;
      ctx.shadowColor = `rgba(${tipColor}, 0.8)`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render orbital satellite with missiles
   */
  private renderSatellite(
    ctx: CanvasRenderingContext2D,
    satellite: {
      x: number;
      y: number;
      angle: number;
      image: HTMLImageElement | null;
      missiles: Array<{
        x: number;
        y: number;
        targetX: number;
        targetY: number;
        startX: number;
        startY: number;
        progress: number;
        damage: number;
        speed: number;
        curveDirection: number;
        curveAmount: number;
      }>;
      targetX: number;
      targetY: number;
    },
  ): void {
    ctx.save();

    // Render missiles
    for (const missile of satellite.missiles) {
      ctx.save();

      // Missile body (white)
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.arc(missile.x, missile.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Missile core (bright white)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(missile.x, missile.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw satellite entity
    ctx.translate(satellite.x, satellite.y);

    // Rotate to face the alien
    const dx = satellite.targetX - satellite.x;
    const dy = satellite.targetY - satellite.y;
    const angleToTarget = Math.atan2(dy, dx);
    ctx.rotate(angleToTarget + Math.PI / 2);

    if (satellite.image && satellite.image.complete && satellite.image.naturalWidth > 0) {
      const size = 40;
      ctx.drawImage(satellite.image, -size / 2, -size / 2, size, size);
    } else {
      // Fallback procedural drawing
      ctx.fillStyle = '#888888';
      ctx.fillRect(-10, -10, 20, 20);

      ctx.fillStyle = '#0044aa';
      ctx.fillRect(-25, -8, 15, 16);
      ctx.fillRect(10, -8, 15, 16);

      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -20);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -20, 3, 0, Math.PI * 2);
      ctx.stroke();

      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, -20, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}


