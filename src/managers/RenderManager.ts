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
  ships: Array<{ draw: (draw: Draw) => void }>;
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
}


