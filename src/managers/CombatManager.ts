/**
 * CombatManager - Handles all combat-related calculations and logic
 * Extracted from Game.ts for better separation of concerns
 */

import { getPixelHitPoint } from '../utils/Raycast';
import type { Vec2, GameState } from '../types';
import type { AlienBall, EnhancedAlienBall } from '../entities';

/**
 * Dependencies that CombatManager needs
 */
export interface CombatManagerDependencies {
  upgradeSystem: {
    getPointsPerHit: (state: GameState) => number;
    getAutoFireDamage: (state: GameState) => number;
    getCritChance: (state: GameState) => number;
    getCritMultiplier: (state: GameState) => number;
  };
  artifactSystem: {
    getDamageBonus: () => number;
  };
  powerUpSystem: {
    getDamageMultiplier: () => number;
    getCritChanceBonus: () => number;
    hasMultishot: () => boolean;
  };
  comboSystem: {
    getMultiplier: (state: GameState) => number;
  };
  customizationSystem: {
    getLaserColor: (state: GameState, isCrit: boolean) => string;
    getLaserThemeId: (state: GameState) => string;
  };
  store: {
    getState: () => GameState;
  };
}

/**
 * Callbacks for CombatManager to communicate with Game
 */
export interface CombatManagerCallbacks {
  onCriticalHit: () => void;
  onTutorialClick: () => void;
}

export class CombatManager {
  // Damage batching for performance
  private damageBatch: {
    damage: number;
    isCrit: boolean;
    isFromShip: boolean;
    clickDamage: number;
    hitDirection?: Vec2;
    isBeam: boolean;
  } = {
      damage: 0,
      isCrit: false,
      isFromShip: false,
      clickDamage: 0,
      hitDirection: undefined,
      isBeam: false,
    };

  private deps: CombatManagerDependencies;
  private callbacks: CombatManagerCallbacks;

  constructor(deps: CombatManagerDependencies, callbacks: CombatManagerCallbacks) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  /**
   * Calculate total beam damage for auto-fire ships
   */
  calculateTotalBeamDamage(state: GameState, mode: 'normal' | 'boss'): number {
    // Calculate auto-fire damage for all ships (excluding main ship)
    // Main ship doesn't use beams - it fires regular projectiles for click feedback
    let autoFireDamage = this.deps.upgradeSystem.getAutoFireDamage(state);
    // Same artifact bonus as clicks for 1:1 damage
    autoFireDamage *= 1 + this.deps.artifactSystem.getDamageBonus();

    if (mode === 'boss') {
      const prestigeBossLevel = state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      autoFireDamage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      autoFireDamage *= voidHeartBonus;
    }

    // Total damage = only auto-fire ships (main ship uses regular projectiles)
    // Note: This will be multiplied by ship count in Game.ts
    return autoFireDamage;
  }

  /**
   * Calculate base click damage for main ship
   */
  calculateClickDamage(state: GameState, mode: 'normal' | 'boss'): number {
    let damage = this.deps.upgradeSystem.getPointsPerHit(state);

    // Apply artifact bonuses
    damage *= 1 + this.deps.artifactSystem.getDamageBonus();

    // Apply power-up damage multiplier
    damage *= this.deps.powerUpSystem.getDamageMultiplier();

    // Apply boss damage bonus in boss mode
    if (mode === 'boss') {
      const prestigeBossLevel = state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      damage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      damage *= voidHeartBonus;
    }

    return damage;
  }

  /**
   * Calculate auto-fire damage for a single ship
   */
  calculateAutoFireDamage(state: GameState, mode: 'normal' | 'boss'): number {
    // Use auto-fire damage - now same as clicks (1:1 damage)
    let damage = this.deps.upgradeSystem.getAutoFireDamage(state);

    // Apply artifact bonuses (same as clicks for 1:1 damage)
    damage *= 1 + this.deps.artifactSystem.getDamageBonus();

    // Apply power-up damage multiplier
    damage *= this.deps.powerUpSystem.getDamageMultiplier();

    // Apply boss damage bonus in boss mode
    if (mode === 'boss') {
      const prestigeBossLevel = state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      damage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      damage *= voidHeartBonus;
    }

    return damage;
  }

  /**
   * Calculate hit point using pixel-perfect raycasting
   */
  calculateHitPoint(origin: Vec2, center: Vec2, radius: number): Vec2 {
    return getPixelHitPoint(origin, center, radius);
  }

  /**
   * Get laser visuals (color, width, crit status)
   */
  getLaserVisuals(state: GameState): {
    isCrit: boolean;
    isPerfectPrecision: boolean;
    color: string;
    width: number;
  } {
    let width = 1.5;
    let isCrit = false;
    let isPerfectPrecision = false;

    // Set default color - will be overridden by upgrades or crits
    let color = this.deps.customizationSystem.getLaserColor(state, false);

    let critChance = this.deps.upgradeSystem.getCritChance(state);
    critChance += this.deps.powerUpSystem.getCritChanceBonus() * 100;
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      this.callbacks.onCriticalHit();

      // Perfect Precision: 5% chance on top of crit lasers (not on all lasers)
      // This applies to both main ship clicks and fleet ships
      if (state.subUpgrades?.['perfect_precision'] && Math.random() < 0.05) {
        isPerfectPrecision = true;

        // Void Essence Core overrides Perfect Precision color (highest priority)
        if (state.subUpgrades && state.subUpgrades['void_essence_core']) {
          color = '#9d00ff'; // Bright purple/violet
          width = 2.0;
        } else {
          color = '#ff00ff'; // Magenta/purple for Perfect Precision crits
          width = 2.5; // Thicker than normal crits
        }

        return { isCrit, isPerfectPrecision, color, width };
      }

      // Normal crit - Void Essence Core overrides crit color (highest priority)
      color = '#ffff00';
      width = 2.0;

      return { isCrit, isPerfectPrecision, color, width };
    }

    // Non-crit: Apply special upgrade visual effects (priority order - most powerful first)

    // 1. Meaning of Life (1Q) - Highest priority
    if (state.subUpgrades['meaning_of_life']) {
      color = '#00ffff'; // Cyan
      width = 2.0;
    }
    // 2. Cosmic Ascension (120B)
    else if (state.subUpgrades['cosmic_ascension']) {
      color = '#00ffff'; // Cyan
      width = 2.2;
    }
    // 3. Heart of the Galaxy (90B)
    else if (state.subUpgrades['heart_of_galaxy']) {
      color = '#ff0044'; // Red/Pink
      width = 1.95;
    }
    // 4. Void Essence Core (90B)
    else if (state.subUpgrades['void_essence_core']) {
      color = '#9d00ff'; // Bright purple/violet
      width = 2.0;
    }
    // 5. Singularity Power Core (24B)
    else if (state.subUpgrades['singularity_core']) {
      color = '#000000'; // Black
      width = 2.25;
    }
    // 6. Hyper-Dimensional Reactor (10B)
    else if (state.subUpgrades['hyper_reactor']) {
      color = '#ff0080'; // Pink
      width = 1.8;
    }
    // 7. Reality Anchor (9.6B)
    else if (state.subUpgrades['reality_anchor']) {
      color = '#ffffff'; // White
      width = 2.1;
    }
    // 8. Photon Wave Amplifier (7.2B)
    else if (state.subUpgrades['photon_amplifier']) {
      color = '#ffff00'; // Yellow
      width = 2.1;
    }
    // 9. Stellar Fusion Core (80M)
    else if (state.subUpgrades['stellar_fusion_core']) {
      color = '#00ccff'; // Light Blue
      width = 1.8;
    }
    // 10. Nebula Energy Harvester (75M)
    else if (state.subUpgrades['nebula_harvester']) {
      color = '#00ffff'; // Cyan
      width = 1.75;
    }
    // 11. Antimatter Cascade Reactor (60M)
    else if (state.subUpgrades['antimatter_cascade']) {
      color = '#ff00aa'; // Pink/Magenta
      width = 1.85;
    }
    // 12. Stellar Forge (30M)
    else if (state.subUpgrades['stellar_forge']) {
      color = '#ffaa00'; // Orange
      width = 1.95;
    }
    // 13. Quantum Entanglement Core (20M)
    else if (state.subUpgrades['quantum_entanglement']) {
      color = '#00ff88'; // Green/Cyan
      width = 1.75;
    }
    // 14. Plasma Energy Matrix (7.5M)
    else if (state.subUpgrades['plasma_matrix']) {
      color = '#ff4400'; // Orange/Red
      width = 1.8;
    }
    // 15. Seven Chaos Emeralds (1M)
    else if (state.subUpgrades['chaos_emeralds']) {
      color = '#00ff88'; // Green
      width = 1.65;
    }
    // 16. Infinity Gauntlet (800k)
    else if (state.subUpgrades['infinity_gauntlet']) {
      color = '#ff1493'; // Deep Pink
      width = 2.15;
    }
    // 17. Void Energy Channeling (200k)
    else if (state.subUpgrades['void_channeling']) {
      color = '#00ffff'; // Cyan
      width = 1.7;
    }
    // 18. Antimatter Ammunition (50k)
    else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff00ff'; // Magenta
      width = 1.85;
    }
    // 19. Overclocked Reactors (10k)
    else if (state.subUpgrades['overclocked_reactors']) {
      color = '#ff6600'; // Orange
      width = 1.7;
    }
    // 20. Laser Focusing Crystals (1k)
    else if (state.subUpgrades['laser_focusing']) {
      color = '#ff6600'; // Orange
      width = 1.65;
    }

    return { isCrit, isPerfectPrecision, color, width };
  }

  /**
   * Get laser visuals without crit chance (for auto-fire ships)
   */
  getLaserVisualsNoCrit(state: GameState): {
    isCrit: boolean;
    isPerfectPrecision: boolean;
    color: string;
    width: number;
  } {
    // Small ships cannot crit - always return non-crit visuals
    let width = 1.5;
    let isCrit = false;
    let isPerfectPrecision = false;

    // Apply special upgrade visual effects (same priority order as main ship)
    // Set default color - will be overridden by upgrades
    let color = this.deps.customizationSystem.getLaserColor(state, false);

    // Check for Perfect Precision (now works on ships too)
    if (state.subUpgrades?.['perfect_precision']) {
      let critChance = this.deps.upgradeSystem.getCritChance(state);
      critChance += this.deps.powerUpSystem.getCritChanceBonus() * 100;

      // Ships inherit player crit chance for this specific mechanic
      if (Math.random() * 100 < critChance) {
        // 5% chance on top of "crit" to trigger Perfect Precision
        if (Math.random() < 0.05) {
          isCrit = true;
          isPerfectPrecision = true;

          // Void Essence Core overrides Perfect Precision color (highest priority)
          if (state.subUpgrades && state.subUpgrades['void_essence_core']) {
            color = '#9d00ff'; // Bright purple/violet
            width = 2.0;
          } else {
            color = '#ff00ff'; // Magenta/purple for Perfect Precision crits
            width = 2.5; // Thicker than normal crits
          }

          return { isCrit, isPerfectPrecision, color, width };
        }
      }
    }

    // 1. Meaning of Life (1Q) - Highest priority
    if (state.subUpgrades['meaning_of_life']) {
      color = '#00ffff'; // Cyan
      width = 2.0;
    }
    // 2. Cosmic Ascension (120B)
    else if (state.subUpgrades['cosmic_ascension']) {
      color = '#00ffff'; // Cyan
      width = 2.2;
    }
    // 3. Heart of the Galaxy (90B)
    else if (state.subUpgrades['heart_of_galaxy']) {
      color = '#ff0044'; // Red/Pink
      width = 1.95;
    }
    // 4. Void Essence Core (90B)
    else if (state.subUpgrades['void_essence_core']) {
      color = '#9d00ff'; // Bright purple/violet
      width = 2.0;
    }
    // 5. Singularity Power Core (24B)
    else if (state.subUpgrades['singularity_core']) {
      color = '#000000'; // Black
      width = 2.25;
    }
    // 6. Hyper-Dimensional Reactor (10B)
    else if (state.subUpgrades['hyper_reactor']) {
      color = '#ff0080'; // Pink
      width = 1.8;
    }
    // 7. Reality Anchor (9.6B)
    else if (state.subUpgrades['reality_anchor']) {
      color = '#ffffff'; // White
      width = 2.1;
    }
    // 8. Photon Wave Amplifier (7.2B)
    else if (state.subUpgrades['photon_amplifier']) {
      color = '#ffff00'; // Yellow
      width = 2.1;
    }
    // 9. Stellar Fusion Core (80M)
    else if (state.subUpgrades['stellar_fusion_core']) {
      color = '#00ccff'; // Light Blue
      width = 1.8;
    }
    // 10. Nebula Energy Harvester (75M)
    else if (state.subUpgrades['nebula_harvester']) {
      color = '#00ffff'; // Cyan
      width = 1.75;
    }
    // 11. Antimatter Cascade Reactor (60M)
    else if (state.subUpgrades['antimatter_cascade']) {
      color = '#ff00aa'; // Pink/Magenta
      width = 1.85;
    }
    // 12. Stellar Forge (30M)
    else if (state.subUpgrades['stellar_forge']) {
      color = '#ffaa00'; // Orange
      width = 1.95;
    }
    // 13. Quantum Entanglement Core (20M)
    else if (state.subUpgrades['quantum_entanglement']) {
      color = '#00ff88'; // Green/Cyan
      width = 1.75;
    }
    // 14. Plasma Energy Matrix (7.5M)
    else if (state.subUpgrades['plasma_matrix']) {
      color = '#ff4400'; // Orange/Red
      width = 1.8;
    }
    // 15. Seven Chaos Emeralds (1M)
    else if (state.subUpgrades['chaos_emeralds']) {
      color = '#00ff88'; // Green
      width = 1.65;
    }
    // 16. Infinity Gauntlet (800k)
    else if (state.subUpgrades['infinity_gauntlet']) {
      color = '#ff1493'; // Deep Pink
      width = 2.15;
    }
    // 17. Void Energy Channeling (200k)
    else if (state.subUpgrades['void_channeling']) {
      color = '#00ffff'; // Cyan
      width = 1.7;
    }
    // 18. Antimatter Ammunition (50k)
    else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff00ff'; // Magenta
      width = 1.85;
    }
    // 19. Overclocked Reactors (10k)
    else if (state.subUpgrades['overclocked_reactors']) {
      color = '#ff6600'; // Orange
      width = 1.7;
    }
    // 20. Laser Focusing Crystals (1k)
    else if (state.subUpgrades['laser_focusing']) {
      color = '#ff6600'; // Orange
      width = 1.65;
    }

    return { isCrit: false, isPerfectPrecision: false, color, width };
  }

  /**
   * Calculate enemy XP scaling based on level
   */
  getEnemyXpScaling(level: number): number {
    if (level <= 30) {
      return 1;
    }

    const extraLevels = level - 30;
    const linearDrop = 1 / (1 + extraLevels * 0.02);
    const exponentialDrop = Math.pow(0.995, Math.min(extraLevels, 600));
    const combined = linearDrop * exponentialDrop;

    return Math.max(0.15, combined);
  }

  /**
   * Add damage to the batch (for performance optimization)
   */
  addDamageToBatch(
    damage: number,
    isCrit: boolean,
    isFromShip: boolean,
    hitDirection?: Vec2,
    isBeam?: boolean,
  ): void {
    // Notify tutorial system of click/damage
    if (!isFromShip && !isBeam) {
      this.callbacks.onTutorialClick();
    }

    // Batch damage instead of applying immediately
    this.damageBatch.damage += damage;
    if (isCrit) {
      this.damageBatch.isCrit = true;
    }

    // Track if this batch includes ship damage
    if (isFromShip) {
      this.damageBatch.isFromShip = true;
    } else {
      // Track click damage separately
      this.damageBatch.clickDamage += damage;
    }

    // Store hit direction for deformation effect
    if (hitDirection && !this.damageBatch.hitDirection) {
      this.damageBatch.hitDirection = hitDirection;
    }

    // Store if this is beam damage
    if (isBeam) {
      this.damageBatch.isBeam = true;
    }
  }

  /**
   * Apply perfect precision bonus if triggered (now only on crit lasers)
   * This method is kept for backward compatibility but Perfect Precision
   * is now handled in getLaserVisuals() which checks it on top of crits
   */
  applyPerfectPrecision(damage: number, _state: GameState): {
    finalDamage: number;
    isCrit: boolean;
    triggered: boolean;
  } {
    // Perfect Precision is now handled in getLaserVisuals() - this is legacy code
    // Kept for backward compatibility but should not be used for new logic
    return { finalDamage: damage, isCrit: false, triggered: false };
  }

  /**
   * Process damage with all multipliers applied
   * Returns final damage and whether perfect precision was triggered
   */
  processDamage(
    baseDamage: number,
    isCrit: boolean,
    isFromShip: boolean,
    state: GameState,
    alienBall?: AlienBall | EnhancedAlienBall,
    isBeam?: boolean,
    isPerfectPrecision?: boolean,
  ): {
    finalDamage: number;
    isCrit: boolean;
    perfectPrecisionTriggered: boolean;
  } {
    let finalDamage = baseDamage;
    let perfectPrecisionTriggered = isPerfectPrecision ?? false;

    // Apply Perfect Precision: 10x damage (only applies to crit lasers)
    if (perfectPrecisionTriggered && isCrit) {
      finalDamage *= 10;
    } else if (isCrit) {
      // Apply normal critical damage multiplier (only if not Perfect Precision)
      const critMultiplier = this.deps.upgradeSystem.getCritMultiplier(state);
      finalDamage *= critMultiplier;
    }

    // Apply combo multiplier
    const comboMult = this.deps.comboSystem.getMultiplier(state);
    finalDamage *= comboMult;

    // Scout enemies evade ship fire - reduce auto-fire damage significantly
    if (alienBall && 'enemyType' in alienBall && !isBeam) {
      const enhancedBall = alienBall as EnhancedAlienBall;
      if (isFromShip && enhancedBall.enemyType === 'scout') {
        finalDamage *= 0.5;
      } else if (!isFromShip && enhancedBall.enemyType === 'guardian') {
        finalDamage *= 0.5;
      }
    }

    return {
      finalDamage,
      isCrit,
      perfectPrecisionTriggered,
    };
  }

  /**
   * Get and reset damage batch
   */
  getAndResetDamageBatch(): {
    damage: number;
    isCrit: boolean;
    isFromShip: boolean;
    clickDamage: number;
    hitDirection?: Vec2;
    isBeam: boolean;
  } {
    // Copy batch data
    const batch = { ...this.damageBatch };

    // Reset batch state efficiently (reuse object, just clear values)
    this.damageBatch.damage = 0;
    this.damageBatch.isCrit = false;
    this.damageBatch.isFromShip = false;
    this.damageBatch.clickDamage = 0;
    this.damageBatch.hitDirection = undefined;
    this.damageBatch.isBeam = false;

    return batch;
  }

  /**
   * Calculate shot count with multishot power-up
   */
  getShotCount(): number {
    let shotCount = 1; // Main ship always fires 1

    // Multishot power-up: doubles all shots
    if (this.deps.powerUpSystem.hasMultishot()) {
      shotCount *= 2;
    }

    return shotCount;
  }

  /**
   * Get laser theme ID for the current state
   */
  getLaserThemeId(state: GameState): string {
    return this.deps.customizationSystem.getLaserThemeId(state);
  }
}

