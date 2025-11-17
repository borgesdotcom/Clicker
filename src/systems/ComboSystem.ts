import type { Draw } from '../render/Draw';
import type { AscensionSystem } from './AscensionSystem';
import type { GameState } from '../types';
import { Config } from '../core/GameConfig';

/**
 * ComboSystem.ts - Click combo system with linear damage scaling
 *
 * Features:
 * - Linear multiplier: 1 + (combo × multiplier)
 * - Configurable decay timer (resets combo if no hits)
 * - Visual timer bar showing remaining time
 * - Optional max combo cap (configurable, default: unlimited)
 */

// ===== CLASS =====

export class ComboSystem {
  private combo = 0;
  private comboTimer = 0;
  private maxCombo = 0;
  private comboAnimationTime = 0;
  private ascensionSystem: AscensionSystem | null = null;
  private isPaused = false;
  private pausedTimerValue = 0;

  /**
   * Set ascension system for combo bonuses
   */
  setAscensionSystem(ascensionSystem: AscensionSystem): void {
    this.ascensionSystem = ascensionSystem;
  }

  /**
   * Get combo timeout duration (base + prestige bonus)
   */
  private getComboTimeout(state?: GameState): number {
    let timeout = Config.combo.timeout;
    if (this.ascensionSystem && state) {
      const durationBonus = this.ascensionSystem.getComboDurationBonus(state);
      timeout += durationBonus;
    }
    return timeout;
  }

  /**
   * Register a hit (click or QTE success)
   * Increments combo and resets decay timer
   */
  hit(state?: GameState): void {
    this.combo++;

    // Apply cap if configured
    if (Config.combo.maxMultiplier !== null) {
      const maxCombo = Math.floor(
        Config.combo.maxMultiplier / Config.combo.baseMultiplier,
      );
      this.combo = Math.min(this.combo, maxCombo);
    }

    this.comboTimer = this.getComboTimeout(state);
    this.comboAnimationTime = Config.visual.combo.animation.duration;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  /**
   * Manually reset combo (on miss or death)
   */
  miss(): void {
    this.combo = 0;
    this.comboTimer = 0;
  }

  /**
   * Update combo decay timer
   * @param dt - Delta time in seconds
   */
  update(dt: number): void {
    // Don't update timer if paused
    if (this.isPaused) {
      return;
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    if (this.comboAnimationTime > 0) {
      this.comboAnimationTime -= dt;
    }
  }

  /**
   * Pause the combo timer (e.g., during boss transitions or combo pause skill)
   * Saves the current timer value so it can be resumed later
   * @param force - If true, pause even if combo is 0 (for combo pause skill)
   */
  pause(force: boolean = false): void {
    if (force || (this.combo > 0 && this.comboTimer > 0)) {
      this.isPaused = true;
      this.pausedTimerValue = this.comboTimer;
    }
  }

  /**
   * Resume the combo timer from where it was paused
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.comboTimer = this.pausedTimerValue;
      this.pausedTimerValue = 0;
    }
  }

  /**
   * Get current combo count
   */
  getCombo(): number {
    return this.combo;
  }

  /**
   * Get max combo reached this session
   */
  getMaxCombo(): number {
    return this.maxCombo;
  }

  /**
   * Get damage multiplier: 1 + (combo × multiplier)
   * Multiplier affected by ascension upgrades
   * Examples:
   * - 0 hits: 1.000×
   * - 100 hits: 1.050×
   * - 500 hits: 1.250×
   * - 1000 hits: 1.500×
   */
  getMultiplier(state?: GameState): number {
    const multiplierPerHit =
      this.ascensionSystem && state
        ? this.ascensionSystem.getComboBoostMultiplier(state)
        : Config.combo.baseMultiplier;
    return 1 + this.combo * multiplierPerHit;
  }

  /**
   * Get remaining time before combo resets
   */
  getTimeRemaining(): number {
    return Math.max(0, this.comboTimer);
  }

  /**
   * Get time remaining as percentage (0-1)
   */
  getTimePercent(state?: GameState): number {
    const timeout = this.getComboTimeout(state);
    return this.comboTimer / timeout;
  }

  /**
   * Draw combo UI with timer bar
   * @param drawer - Drawing context
   * @param canvasWidth - Canvas width for positioning
   * @param canvasHeight - Canvas height for positioning (optional, for mobile)
   * @param state - Game state for ascension bonuses
   */
  draw(
    drawer: Draw,
    canvasWidth: number,
    canvasHeight?: number,
    state?: GameState,
  ): void {
    // Only show combo if active
    if (this.combo < 1 || this.comboTimer <= 0) return;

    const ctx = drawer.getContext();

    // Mobile detection: if canvas is in portrait mode or small width
    const isMobile = canvasWidth <= 768;

    // Position: top-right on desktop, below center on mobile
    const x = isMobile ? canvasWidth / 2 : canvasWidth - 150;
    const y = isMobile && canvasHeight ? canvasHeight * 0.65 : 100;

    ctx.save();

    // Pulse effect on new hit
    const animationConfig = Config.visual.combo.animation;
    const scale =
      this.comboAnimationTime > 0
        ? 1 +
          (this.comboAnimationTime / animationConfig.duration) *
            animationConfig.scaleAmount
        : 1;

    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);

    // Multiplier text (large, primary)
    const multiplier = this.getMultiplier(state);
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowColor = this.getComboColor();
    ctx.shadowBlur = 20;

    ctx.fillStyle = this.getComboColor();
    ctx.fillText(`${multiplier.toFixed(3)}×`, x, y - 10);

    // Combo count (smaller, secondary)
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`${this.combo.toString()} COMBO`, x, y + 15);

    // Timer bar (shows remaining time before reset)
    const timePercent = this.getTimePercent(state);
    const barConfig = Config.visual.combo.bar;
    const barWidth = barConfig.width;
    const barHeight = barConfig.height;
    const barX = x - barWidth / 2;
    const barY = y + 30;

    ctx.shadowBlur = 0;

    // Bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Bar fill with color based on time remaining
    let barColor = this.getComboColor();
    if (timePercent < 0.3) {
      barColor = '#ff0000'; // Red when low
    } else if (timePercent < 0.6) {
      barColor = '#ffaa00'; // Orange when medium
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * timePercent, barHeight);

    // Bar border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Time remaining text
    ctx.restore();
  }

  /**
   * Get color based on combo multiplier
   */
  private getComboColor(): string {
    const mult = this.getMultiplier();

    // Use configured color thresholds
    for (const threshold of Config.combo.colorThresholds) {
      if (mult >= threshold.minMultiplier) {
        return threshold.color;
      }
    }

    // Fallback to white if no threshold matches
    return '#ffffff';
  }

  reset(): void {
    this.combo = 0;
    this.comboTimer = 0;
    this.comboAnimationTime = 0;
  }
}
