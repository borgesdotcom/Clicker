/**
 * BossManager - Handles all boss battle related logic
 * Extracted from Game.ts for better separation of concerns
 */

import { BossBall } from '../entities/BossBall';
import { ColorManager } from '../math/ColorManager';
import { i18n } from '../core/I18n';
import { BOSS } from '../config/constants';
import type { Store } from '../core/Store';
import { images } from '../assets/images';

/**
 * Dependencies that BossManager needs from the Game class
 */
export interface BossManagerDependencies {
  store: Store;
  soundManager: {
    playBossAppear: () => void;
    playBossDefeat: () => void;
    startBossSoundtrack: () => void;
    stopBossSoundtrack: () => void;
  };
  hud: {
    showMessage: (message: string, color: string, duration?: number) => void;
  };
  canvas: {
    getCenterX: () => number;
    getCenterY: () => number;
    getWidth: () => number;
    getHeight: () => number;
  };
  artifactsModal: {
    hide: () => void;
  };
}

/**
 * Callbacks for BossManager to communicate with Game
 */
export interface BossManagerCallbacks {
  onStartTransitionToBoss: () => void;
  onStartTransitionToNormal: () => void;
  onBossCreated: (boss: BossBall) => void;
  onBossTimeout?: () => void; // Optional: Called immediately when timeout occurs for cleanup
}

export class BossManager {
  // Boss entity
  private bossBall: BossBall | null = null;

  // Boss timer state
  private bossTimeLimit = 0;
  private bossTimeRemaining = 0;
  private bossTimeoutHandled = false;

  // UI elements
  private bossTimerElement: HTMLElement | null = null;
  private bossRetryButton: HTMLElement | null = null;

  // Boss progression state
  private blockedOnBossLevel: number | null = null;

  // Dependencies
  private deps: BossManagerDependencies;
  private callbacks: BossManagerCallbacks;

  constructor(deps: BossManagerDependencies, callbacks: BossManagerCallbacks) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  /**
   * Initialize UI elements - call after DOM is ready
   */
  setupUI(): void {
    this.setupBossDialog();
    this.setupBossTimer();
    this.setupBossRetryButton();
  }

  /**
   * Setup the boss dialog start button
   */
  private setupBossDialog(): void {
    const startBtn = document.getElementById('boss-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const dialog = document.getElementById('boss-dialog');
        if (dialog) {
          dialog.style.display = 'none';
        }
        this.startBossFight();
      });
    }
  }

  /**
   * Setup boss timer element reference
   */
  private setupBossTimer(): void {
    this.bossTimerElement = document.getElementById('boss-timer-hud');
  }

  /**
   * Setup boss retry button
   */
  private setupBossRetryButton(): void {
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      this.bossRetryButton = document.createElement('button');
      this.bossRetryButton.id = 'boss-retry-btn';
      this.bossRetryButton.className = 'hud-button boss-retry-button';
      this.bossRetryButton.setAttribute('data-icon', '⚔️');
      this.bossRetryButton.setAttribute('data-text', 'Retry Boss');
      this.bossRetryButton.setAttribute('aria-label', 'Retry Boss Fight');
      this.bossRetryButton.innerHTML = `<img src="${images.bossbattle}" alt="Boss" />`;
      this.bossRetryButton.style.display = 'none';
      this.bossRetryButton.style.pointerEvents = 'auto';

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'boss-retry-tooltip';
      tooltip.textContent = i18n.t('hud.bossRetryTooltip');
      this.bossRetryButton.appendChild(tooltip);

      this.bossRetryButton.addEventListener('click', () => {
        this.retryBossFight();
      });

      buttonsContainer.appendChild(this.bossRetryButton);
    }
  }

  /**
   * Show the boss encounter dialog
   */
  showBossDialog(): void {
    // Close artifacts modal if open to prevent interference
    this.deps.artifactsModal.hide();

    const dialog = document.getElementById('boss-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
      this.deps.soundManager.playBossAppear();
    }
  }

  /**
   * Start the boss fight - called when player clicks start
   */
  private startBossFight(): void {
    this.callbacks.onStartTransitionToBoss();
  }

  /**
   * Retry the boss fight after a loss
   */
  retryBossFight(): void {
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }
    this.showBossDialog();
  }

  /**
   * Start the boss timer when boss fight begins
   */
  startBossTimer(): void {
    const state = this.deps.store.getState();
    // Use ColorManager for dynamic boss timer scaling
    this.bossTimeLimit = ColorManager.getBossTimeLimit(state.level);
    this.bossTimeRemaining = this.bossTimeLimit;
    this.bossTimeoutHandled = false;

    // Show timer
    if (this.bossTimerElement) {
      this.bossTimerElement.style.display = 'block';
    }

    // Update dialog timer display
    const dialogTimer = document.getElementById('boss-dialog-timer');
    if (dialogTimer) {
      const span = dialogTimer.querySelector('span');
      if (span) {
        span.textContent = this.bossTimeLimit.toString();
      }
    }
  }

  /**
   * Update boss timer - call every frame during boss fight
   * @param dt Delta time in seconds
   * @returns true if timeout was triggered
   */
  updateBossTimer(dt: number): boolean {
    // Don't update if timeout already handled
    if (this.bossTimeoutHandled) return false;

    // Check timeout BEFORE updating to catch exactly at 0
    if (this.bossTimeRemaining <= 0) {
      this.handleBossTimeout();
      return true;
    }

    this.bossTimeRemaining -= dt;

    // Check again after decrementing
    if (this.bossTimeRemaining <= 0) {
      this.bossTimeRemaining = 0;
      this.handleBossTimeout();
      return true;
    }

    // Note: Timer display updates are handled separately via updateTimerDisplay()
    // to allow throttling in Game.ts

    return false;
  }

  /**
   * Update the visual timer display
   * Public for throttled updates from Game.ts
   */
  updateTimerDisplay(): void {
    const timerText = document.getElementById('boss-timer-text');
    const timerBar = document.getElementById('boss-timer-bar');

    if (timerText && timerBar) {
      const timeLeft = Math.ceil(Math.max(0, this.bossTimeRemaining));
      const seconds = timeLeft.toString().padStart(2, '0');

      // Update text and classes based on urgency
      if (this.bossTimeRemaining <= 5) {
        timerText.textContent = `${i18n.t('hud.time')}: ${seconds}s`;
        timerText.className = 'boss-timer-text critical';
      } else if (this.bossTimeRemaining <= 10) {
        timerText.textContent = `${i18n.t('hud.time')}: ${seconds}s`;
        timerText.className = 'boss-timer-text warning';
      } else {
        timerText.textContent = `${i18n.t('hud.time')}: ${seconds}s`;
        timerText.className = 'boss-timer-text';
      }

      // Update bar width
      const percent = Math.max(0, (this.bossTimeRemaining / this.bossTimeLimit) * 100);
      timerBar.style.width = `${String(percent)}%`;

      // Update bar classes
      if (this.bossTimeRemaining <= 5) {
        timerBar.className = 'boss-timer-bar-fill critical';
      } else if (this.bossTimeRemaining <= 10) {
        timerBar.className = 'boss-timer-bar-fill warning';
      } else {
        timerBar.className = 'boss-timer-bar-fill';
      }
    }
  }

  /**
   * Hide the boss timer UI
   */
  hideBossTimer(): void {
    if (this.bossTimerElement) {
      this.bossTimerElement.style.display = 'none';
    }
  }

  /**
   * Handle boss timeout - player loses
   */
  private handleBossTimeout(): void {
    // Prevent duplicate calls
    if (this.bossTimeoutHandled) return;

    // Check if boss is already defeated (race condition fix)
    if (this.bossBall && this.bossBall.currentHp <= 0) return;

    // Set flag immediately
    this.bossTimeoutHandled = true;

    // Boss escapes! Player must retry
    const state = this.deps.store.getState();

    this.deps.soundManager.playBossDefeat();

    // Penalty: Lose 20% of current XP
    const xpLoss = Math.floor(state.experience * BOSS.ESCAPE_XP_PENALTY);
    state.experience = Math.max(0, state.experience - xpLoss);

    // Block progression until boss is defeated
    this.blockedOnBossLevel = state.level;
    state.blockedOnBossLevel = state.level;
    this.deps.store.setState(state);

    // Clean up boss battle state
    this.hideBossTimer();
    this.deps.soundManager.stopBossSoundtrack();

    // Call timeout callback for game-specific cleanup (boss effects, combo system, etc.)
    if (this.callbacks.onBossTimeout) {
      this.callbacks.onBossTimeout();
    }

    // Show timeout modal
    this.showTimeoutModal();
  }

  /**
   * Show the boss timeout modal
   */
  private showTimeoutModal(): void {
    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (timeoutModal) {
      // Ensure modal is hidden first
      timeoutModal.style.display = 'none';

      // Remove any existing event listeners by cloning the button
      const closeBtn = document.getElementById('boss-timeout-close');
      if (closeBtn && closeBtn.parentNode) {
        const newCloseBtn = closeBtn.cloneNode(true) as HTMLElement;
        newCloseBtn.id = 'boss-timeout-close';

        // Setup close button handler
        newCloseBtn.addEventListener('click', () => {
          timeoutModal.style.display = 'none';

          // Show retry button
          if (this.bossRetryButton) {
            this.bossRetryButton.style.display = 'flex';
          }

          setTimeout(() => {
            this.callbacks.onStartTransitionToNormal();
          }, 500);
        });

        // Replace the button
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      }

      // Show modal
      const subMessage = timeoutModal.querySelector('.timeout-submessage');
      if (subMessage) {
        subMessage.textContent = i18n.t('messages.bossEscapeModal');
      }
      timeoutModal.style.display = 'flex';
    } else {
      // Fallback to message
      this.deps.hud.showMessage(i18n.t('messages.bossEscapeMessage'), '#ff0000', 4000);

      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'flex';
      }

      setTimeout(() => {
        this.callbacks.onStartTransitionToNormal();
      }, 500);
    }
  }

  /**
   * Create a boss entity at the center of the canvas
   */
  createBoss(): BossBall {
    const cx = this.deps.canvas.getCenterX();
    const cy = this.deps.canvas.getCenterY();
    // Boss is 50% bigger than normal aliens
    const radius = Math.min(this.deps.canvas.getWidth(), this.deps.canvas.getHeight()) * 0.15;
    const state = this.deps.store.getState();
    // Make bosses 3x harder than before
    const baseHp = ColorManager.getBossHp(state.level);
    const hp = Math.floor(baseHp * 3);

    // Determine boss variant based on level
    const bossVariant = this.getBossVariant(state.level);

    this.bossBall = new BossBall(cx, cy, radius, hp, bossVariant);
    this.callbacks.onBossCreated(this.bossBall);

    return this.bossBall;
  }

  /**
   * Get boss variant based on level
   */
  getBossVariant(level: number): 0 | 1 | 2 | 3 | 4 {
    if (level === 5) {
      // Tutorial boss - Tiny Tyrant
      return 0;
    } else if (level >= 25) {
      const bossIndex = Math.floor((level - 25) / 25);
      return (1 + (bossIndex % 4)) as 1 | 2 | 3 | 4;
    }
    return 0;
  }

  /**
   * Check if current level is a boss level
   */
  isBossLevel(level: number): boolean {
    return ColorManager.isBossLevel(level);
  }

  /**
   * Mark timeout as handled (called when boss is defeated to prevent race condition)
   */
  markTimeoutHandled(): void {
    this.bossTimeoutHandled = true;
  }

  /**
   * Reset timeout flag (called when starting a new boss fight)
   */
  resetTimeoutFlag(): void {
    this.bossTimeoutHandled = false;
  }

  /**
   * Clear boss blocked state after defeating boss
   */
  clearBlockedState(): void {
    this.blockedOnBossLevel = null;
    const state = this.deps.store.getState();
    state.blockedOnBossLevel = null;
    this.deps.store.setState(state);

    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }
  }

  /**
   * Show retry button
   */
  showRetryButton(): void {
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'flex';
    }
  }

  /**
   * Hide retry button
   */
  hideRetryButton(): void {
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }
  }

  /**
   * Get current boss entity
   */
  getBoss(): BossBall | null {
    return this.bossBall;
  }

  /**
   * Set boss entity (for external management)
   */
  setBoss(boss: BossBall | null): void {
    this.bossBall = boss;
  }

  /**
   * Check if player is blocked by a boss
   */
  isBlockedByBoss(): boolean {
    return this.blockedOnBossLevel !== null;
  }

  /**
   * Get blocked boss level
   */
  getBlockedBossLevel(): number | null {
    return this.blockedOnBossLevel;
  }

  /**
   * Set blocked boss level (from save data)
   */
  setBlockedBossLevel(level: number | null): void {
    this.blockedOnBossLevel = level;
    if (level !== null && this.bossRetryButton) {
      this.bossRetryButton.style.display = 'flex';
    }
  }

  /**
   * Get time remaining in boss fight
   */
  getTimeRemaining(): number {
    return this.bossTimeRemaining;
  }

  /**
   * Get time limit for boss fight
   */
  getTimeLimit(): number {
    return this.bossTimeLimit;
  }

  /**
   * Check if timeout was handled
   */
  isTimeoutHandled(): boolean {
    return this.bossTimeoutHandled;
  }
}

