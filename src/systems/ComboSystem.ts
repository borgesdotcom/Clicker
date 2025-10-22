import type { Draw } from '../render/Draw';

/**
 * ComboSystem.ts - Click combo system with linear damage scaling
 *
 * Features:
 * - Linear multiplier: 1 + (combo × 0.001)
 * - 5-second decay timer (resets combo if no hits)
 * - Visual timer bar showing remaining time
 * - Optional max combo cap (configurable, default: unlimited)
 */

// ===== CONFIGURATION CONSTANTS =====

/** Base combo multiplier per hit */
const BASE_COMBO_MULTIPLIER = 0.001;

/** Time in seconds before combo resets */
const COMBO_TIMEOUT = 5.0;

/** Maximum combo count (null = unlimited) */
const COMBO_MAX_MULTIPLIER: number | null = null; // Set to a number to cap, e.g., 3000 for max 4x

// ===== CLASS =====

export class ComboSystem {
  private combo = 0;
  private comboTimer = 0;
  private maxCombo = 0;
  private comboAnimationTime = 0;
  private ascensionSystem: any = null;

  /**
   * Set ascension system for combo bonuses
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAscensionSystem(ascensionSystem: any): void {
    this.ascensionSystem = ascensionSystem;
  }

  /**
   * Register a hit (click or QTE success)
   * Increments combo and resets decay timer
   */
  hit(): void {
    this.combo++;

    // Apply cap if configured
    if (COMBO_MAX_MULTIPLIER !== null) {
      const maxCombo = Math.floor(
        COMBO_MAX_MULTIPLIER / BASE_COMBO_MULTIPLIER,
      );
      this.combo = Math.min(this.combo, maxCombo);
    }

    this.comboTimer = COMBO_TIMEOUT;
    this.comboAnimationTime = 0.3;

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
   * - 100 hits: 1.100×
   * - 500 hits: 1.500×
   * - 1000 hits: 2.000×
   */
  getMultiplier(state?: any): number {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const multiplierPerHit = this.ascensionSystem && state
      ? this.ascensionSystem.getComboBoostMultiplier(state)
      : BASE_COMBO_MULTIPLIER;
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
  getTimePercent(): number {
    return this.comboTimer / COMBO_TIMEOUT;
  }

  /**
   * Draw combo UI with timer bar
   * @param drawer - Drawing context
   * @param canvasWidth - Canvas width for positioning
   * @param canvasHeight - Canvas height for positioning (optional, for mobile)
   * @param state - Game state for ascension bonuses
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draw(drawer: Draw, canvasWidth: number, canvasHeight?: number, state?: any): void {
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
    const scale =
      this.comboAnimationTime > 0
        ? 1 + (this.comboAnimationTime / 0.3) * 0.3
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
    const timePercent = this.getTimePercent();
    const barWidth = 120;
    const barHeight = 4;
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

    if (mult >= 3.0) return '#ff00ff'; // Magenta for insane combos (3000+)
    if (mult >= 2.0) return '#ff0000'; // Red for high combos (1000+)
    if (mult >= 1.5) return '#ffaa00'; // Orange for good combos (500+)
    if (mult >= 1.2) return '#ffff00'; // Yellow for decent combos (200+)
    if (mult >= 1.05) return '#00ff00'; // Green for building combos (50+)
    return '#ffffff'; // White for low combos
  }

  reset(): void {
    this.combo = 0;
    this.comboTimer = 0;
    this.comboAnimationTime = 0;
  }
}
