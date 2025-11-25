/**
 * EntityManager - Handles entity creation and lifecycle management
 * Extracted from Game.ts for better separation of concerns
 */

import { EnhancedAlienBall, selectEnemyType } from '../entities/EnemyTypes';
import { Ship } from '../entities/Ship';
import type { AlienBall } from '../entities/AlienBall';
import type { Canvas } from '../render/Canvas';

/**
 * Dependencies that EntityManager needs
 */
export interface EntityManagerDependencies {
  canvas: Canvas;
  store: {
    getState: () => {
      level: number;
      shipsCount: number;
    };
  };
}

/**
 * Callbacks for EntityManager to communicate with Game
 */
export interface EntityManagerCallbacks {
  onBallCreated?: (ball: AlienBall | EnhancedAlienBall) => void;
  onShipsCreated?: (ships: Ship[]) => void;
  onShipsDestroyed?: (ships: Ship[]) => void;
}

export class EntityManager {
  private deps: EntityManagerDependencies;
  private callbacks: EntityManagerCallbacks;

  constructor(
    deps: EntityManagerDependencies,
    callbacks: EntityManagerCallbacks = {},
  ) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  /**
   * Create a new alien ball
   */
  createBall(): EnhancedAlienBall {
    const cx = this.deps.canvas.getCenterX();
    const cy = this.deps.canvas.getCenterY();
    const radius =
      Math.min(this.deps.canvas.getWidth(), this.deps.canvas.getHeight()) *
      0.08;
    const state = this.deps.store.getState();

    // v2.0: Use enhanced enemy types
    const enemyType = selectEnemyType(state.level);
    const enhancedBall = new EnhancedAlienBall(
      cx,
      cy,
      radius,
      state.level,
      enemyType,
    );

    // Visual effects are now handled in applyDamageBatch to differentiate
    // between main ship and auto-fire ship damage for better performance

    if (this.callbacks.onBallCreated) {
      this.callbacks.onBallCreated(enhancedBall);
    }

    return enhancedBall;
  }

  /**
   * Create ships based on current state
   */
  createShips(existingShips: Ship[] = []): Ship[] {
    // Destroy old ships and clean up their image elements before creating new ones
    for (const ship of existingShips) {
      ship.destroy();
    }

    if (this.callbacks.onShipsDestroyed && existingShips.length > 0) {
      this.callbacks.onShipsDestroyed(existingShips);
    }

    const state = this.deps.store.getState();
    const cx = this.deps.canvas.getCenterX();
    const cy = this.deps.canvas.getCenterY();
    const orbitRadius =
      Math.min(this.deps.canvas.getWidth(), this.deps.canvas.getHeight()) *
      0.4;

    const ships: Ship[] = [];
    for (let i = 0; i < state.shipsCount; i++) {
      // Random angle for each ship instead of perfect circle
      const angle = Math.random() * Math.PI * 2;
      const isMain = i === 0;
      // Random radius for each ship
      const randomRadius =
        orbitRadius * (0.7 + Math.random() * 0.6); // 70% to 130% of base radius
      ships.push(new Ship(angle, cx, cy, randomRadius, isMain));
    }

    if (this.callbacks.onShipsCreated) {
      this.callbacks.onShipsCreated(ships);
    }

    return ships;
  }

  /**
   * Get the center position of the canvas
   */
  getCenterPosition(): { x: number; y: number } {
    return {
      x: this.deps.canvas.getCenterX(),
      y: this.deps.canvas.getCenterY(),
    };
  }

  /**
   * Get recommended radius for entities
   */
  getRecommendedRadius(): number {
    return Math.min(this.deps.canvas.getWidth(), this.deps.canvas.getHeight()) * 0.08;
  }

  /**
   * Get orbit radius for ships
   */
  getOrbitRadius(): number {
    return (
      Math.min(this.deps.canvas.getWidth(), this.deps.canvas.getHeight()) * 0.4
    );
  }
}


