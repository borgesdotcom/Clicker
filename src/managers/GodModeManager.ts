/**
 * GodModeManager - Handles God Mode autopilot functionality
 * Extracted from Game.ts for better separation of concerns
 */

import { GOD_MODE } from '../config/constants';
import { NumberFormatter } from '../utils/NumberFormatter';
import { ColorManager } from '../math/ColorManager';
import type { Vec2, GameState } from '../types';
import type { AlienBall } from '../entities/AlienBall';
import type { BossBall } from '../entities/BossBall';
import type { PowerUpType } from '../systems/PowerUpSystem';
import type { PowerUpSystem } from '../systems/PowerUpSystem';
import type { ComboSystem } from '../systems/ComboSystem';
import type { UpgradeSystem } from '../systems/UpgradeSystem';

/**
 * God Mode agent state
 */
export interface GodModeAgent {
  clickTimer: number;
  clickIntervalRange: { min: number; max: number };
  burstChance: number;
  burstShotsRemaining: number;
  burstCooldownTimer: number;
  burstCooldownRange: { min: number; max: number };
  jitterRadius: number;
  upgradeTimer: number;
  upgradeIntervalRange: { min: number; max: number };
  powerUpTimer: number;
  powerUpReactionRange: { min: number; max: number };
  metricsTimer: number;
  metricsInterval: number;
  startTimestamp: number;
  baseline: {
    points: number;
    clicks: number;
    aliens: number;
    bosses: number;
    upgrades: number;
    subUpgrades: number;
  };
  overlay: HTMLElement | null;
  lastAction: string;
  logTimer: number;
  idleTimer: number;
  nextBreakIn: number;
  breakTimer: number;
  breakDurationRange: { min: number; max: number };
  bossCheckTimer: number;
  bossCheckIntervalRange: { min: number; max: number };
  bossRetryTimer: number;
  bossRetryDelay: number;
  bossRetryAttempts: number;
  bossHistory: Array<{
    timestamp: number;
    level: number;
    detail: string;
  }>;
}

/**
 * Dependencies that GodModeManager needs
 */
export interface GodModeManagerDependencies {
  store: {
    getState: () => GameState;
  };
  notificationSystem: {
    show: (message: string, type?: 'info' | 'warning', duration?: number) => void;
  };
  shop: {
    checkAndBuyDiscoveredUpgrades: () => void;
    checkAndBuyAffordableUpgrades: (force: boolean) => void;
  };
  powerUpSystem: PowerUpSystem;
  comboSystem: ComboSystem;
  upgradeSystem: UpgradeSystem;
  bossManager: {
    getBlockedBossLevel: () => number | null;
    showRetryButton: () => void;
    hideRetryButton: () => void;
  };
  canvas: {
    getWidth: () => number;
    getHeight: () => number;
  };
}

/**
 * Callbacks for GodModeManager to communicate with Game
 */
export interface GodModeManagerCallbacks {
  handleClick: (pos: Vec2) => void;
  showBossDialog: () => void;
  startBossFight: () => void;
  startTransitionToNormal: () => void;
  getGameMode: () => 'normal' | 'boss' | 'transition';
  getBall: () => AlienBall | null;
  getBossBall: () => BossBall | null;
  onBossDefeated?: (defeatedBossLevel: number) => void;
}

export class GodModeManager {
  private deps: GodModeManagerDependencies;
  private callbacks: GodModeManagerCallbacks;
  private agent: GodModeAgent | null = null;
  private enabled = false;

  constructor(
    deps: GodModeManagerDependencies,
    callbacks: GodModeManagerCallbacks,
  ) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  /**
   * Check if God Mode is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle God Mode on/off
   */
  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * Enable God Mode and initialize agent
   */
  private enable(): void {
    const state = this.deps.store.getState();
    const overlay = this.createOverlay();
    this.agent = {
      clickTimer: this.getRandomInRange(0.08, 0.2),
      clickIntervalRange: { ...GOD_MODE.CLICK_INTERVAL },
      burstChance: GOD_MODE.BURST_CHANCE,
      burstShotsRemaining: 0,
      burstCooldownTimer: 0,
      burstCooldownRange: { ...GOD_MODE.BURST_COOLDOWN },
      jitterRadius: GOD_MODE.JITTER_RADIUS,
      upgradeTimer: this.getRandomInRange(
        GOD_MODE.UPGRADE_INTERVAL.min,
        GOD_MODE.UPGRADE_INTERVAL.max,
      ),
      upgradeIntervalRange: { ...GOD_MODE.UPGRADE_INTERVAL },
      powerUpTimer: this.getRandomInRange(
        GOD_MODE.POWER_UP_REACTION.min,
        GOD_MODE.POWER_UP_REACTION.max,
      ),
      powerUpReactionRange: { ...GOD_MODE.POWER_UP_REACTION },
      metricsTimer: 0,
      metricsInterval: GOD_MODE.METRICS_INTERVAL,
      startTimestamp: performance.now(),
      baseline: {
        points: state.points,
        clicks: state.stats.totalClicks,
        aliens: state.stats.aliensKilled,
        bosses: state.stats.bossesKilled,
        upgrades: state.stats.totalUpgrades,
        subUpgrades: state.stats.totalSubUpgrades,
      },
      overlay,
      lastAction: 'Autopilot engaged',
      logTimer: 12,
      idleTimer: 0,
      nextBreakIn: this.getRandomInRange(
        GOD_MODE.BREAK_INTERVAL.min,
        GOD_MODE.BREAK_INTERVAL.max,
      ),
      breakTimer: 0,
      breakDurationRange: { ...GOD_MODE.BREAK_DURATION },
      bossCheckTimer: 0,
      bossCheckIntervalRange: { ...GOD_MODE.BOSS_CHECK_INTERVAL },
      bossRetryTimer: 0,
      bossRetryDelay: GOD_MODE.BOSS_RETRY_DELAY,
      bossRetryAttempts: 0,
      bossHistory: [],
    };
    this.deps.notificationSystem.show(
      'God Mode autopilot engaged.',
      'info',
      2400,
    );
  }

  /**
   * Disable God Mode and cleanup
   */
  private disable(): void {
    if (this.agent?.overlay) {
      this.agent.overlay.remove();
    }
    this.agent = null;
    this.deps.notificationSystem.show('God Mode disengaged.', 'warning', 2000);
  }

  /**
   * Update God Mode agent logic
   */
  update(dt: number, realDt: number): void {
    if (!this.agent || !this.enabled) return;

    // Update timers
    this.agent.clickTimer -= dt;
    this.agent.upgradeTimer -= dt;
    this.agent.powerUpTimer -= dt;
    this.agent.metricsTimer -= dt;
    this.agent.logTimer -= dt;
    this.agent.bossCheckTimer -= dt;
    this.agent.bossRetryTimer = Math.max(0, this.agent.bossRetryTimer - realDt);
    this.agent.burstCooldownTimer = Math.max(
      0,
      this.agent.burstCooldownTimer - dt,
    );

    // Handle break timer
    if (this.agent.breakTimer > 0) {
      this.agent.breakTimer = Math.max(0, this.agent.breakTimer - dt);
      if (this.agent.breakTimer === 0) {
        this.agent.lastAction = 'Back from short break';
        this.agent.clickTimer = this.getRandomInRange(
          this.agent.clickIntervalRange.min,
          this.agent.clickIntervalRange.max,
        );
      }
    } else {
      this.agent.idleTimer += dt;
      if (this.agent.idleTimer >= this.agent.nextBreakIn) {
        this.agent.breakTimer = this.getRandomInRange(
          this.agent.breakDurationRange.min,
          this.agent.breakDurationRange.max,
        );
        this.agent.idleTimer = 0;
        this.agent.nextBreakIn = this.getRandomInRange(20, 45);
        this.agent.lastAction = 'Taking a short break';
      }
    }

    // Handle boss flow
    let handledBossAction = false;
    if (this.agent.bossCheckTimer <= 0) {
      handledBossAction = this.handleBossFlow();
      this.agent.bossCheckTimer = this.getRandomInRange(
        this.agent.bossCheckIntervalRange.min,
        this.agent.bossCheckIntervalRange.max,
      );
    }

    if (handledBossAction) {
      return;
    }

    // Handle power-ups
    const powerUpClicked = this.runPowerUps();
    if (!powerUpClicked && this.agent.breakTimer <= 0) {
      this.runClicking();
    }

    // Handle upgrades
    const hasDiscoveredUpgrades = this.checkForDiscoveredUpgrades();
    if (hasDiscoveredUpgrades) {
      this.agent.upgradeTimer = Math.min(
        this.agent.upgradeTimer,
        this.getRandomInRange(0.3, 0.6),
      );
    }

    if (this.agent.upgradeTimer <= 0) {
      this.runUpgrades();
    }

    // Update metrics
    if (this.agent.metricsTimer <= 0) {
      this.updateMetrics();
    }

    // Log snapshot
    if (this.agent.logTimer <= 0) {
      this.logSnapshot();
      this.agent.logTimer = this.getRandomInRange(
        GOD_MODE.LOG_INTERVAL.min,
        GOD_MODE.LOG_INTERVAL.max,
      );
    }
  }

  /**
   * Record boss event (called from Game when boss is defeated)
   */
  recordBossDefeated(defeatedBossLevel: number): void {
    if (!this.agent) return;
    this.recordBossEvent(defeatedBossLevel, 'Boss defeated - returning to normal');
    this.resetBossTracking();
  }

  /**
   * Get agent for external access
   */
  getAgent(): GodModeAgent | null {
    return this.agent;
  }

  // Private helper methods

  private createOverlay(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    const existing = document.getElementById('god-mode-overlay');
    if (existing) {
      existing.remove();
    }
    const overlay = document.createElement('div');
    overlay.id = 'god-mode-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '16px';
    overlay.style.right = '16px';
    overlay.style.zIndex = '2147483646';
    overlay.style.padding = '14px 18px';
    overlay.style.width = '220px';
    overlay.style.background =
      'linear-gradient(135deg, rgba(20,20,35,0.92), rgba(40,15,60,0.95))';
    overlay.style.border = '1px solid rgba(255, 215, 0, 0.35)';
    overlay.style.boxShadow =
      '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 12px rgba(255, 215, 0, 0.3)';
    overlay.style.borderRadius = '10px';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.color = '#f5f5f5';
    overlay.style.fontFamily = '"Courier New", monospace';
    overlay.style.pointerEvents = 'none';
    overlay.innerHTML = `
      <div style="font-weight:700;font-size:14px;margin-bottom:8px;letter-spacing:0.04em;display:flex;align-items:center;gap:6px;">
        <span>🛡️</span>GOD MODE AUTOPILOT
      </div>
      <div class="metric" data-metric="elapsed">Elapsed: 0s</div>
      <div class="metric" data-metric="points">Points/min: 0</div>
      <div class="metric" data-metric="clicks">Clicks/min: 0</div>
      <div class="metric" data-metric="bosses">Bosses/hr: 0</div>
      <div class="metric" data-metric="upgrades">Upgrades/min: 0</div>
      <div class="metric" data-metric="boss-log">Boss log: —</div>
      <div class="metric" data-metric="last-action" style="margin-top:8px;font-size:11px;color:#ddd;">
        Last action: —
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  private runPowerUps(): boolean {
    if (!this.agent) return false;

    const available = this.deps.powerUpSystem
      .getPowerUps()
      .filter((powerUp) => powerUp.active);

    if (available.length === 0) {
      if (this.agent.powerUpTimer <= 0) {
        this.agent.powerUpTimer = this.getRandomInRange(0.6, 1.4);
      }
      return false;
    }

    if (this.agent.powerUpTimer > 0) {
      return false;
    }

    const target =
      available[Math.floor(Math.random() * available.length)] ?? available[0];
    if (!target) return false;

    const clickPos = this.withJitter({ x: target.x, y: target.y }, 12);
    this.callbacks.handleClick(clickPos);
    this.agent.lastAction = this.deps.powerUpSystem.getBuffName(target.type as PowerUpType);
    this.agent.powerUpTimer = this.getRandomInRange(
      this.agent.powerUpReactionRange.min,
      this.agent.powerUpReactionRange.max,
    );
    this.agent.clickTimer = this.getRandomInRange(0.05, 0.12);
    return true;
  }

  private runClicking(): void {
    if (!this.agent) return;

    if (this.callbacks.getGameMode() === 'transition') return;
    if (this.agent.breakTimer > 0) return;

    const targetEntity =
      this.callbacks.getGameMode() === 'boss'
        ? this.callbacks.getBossBall()
        : this.callbacks.getBall();
    if (!targetEntity || targetEntity.currentHp <= 0) return;

    const state: GameState = this.deps.store.getState();
    const comboMultiplier = this.deps.comboSystem.getMultiplier(state);
    if (comboMultiplier >= GOD_MODE.COMBO_CAP_MULTIPLIER) {
      this.deps.comboSystem.reset();
      this.agent.breakTimer = this.getRandomInRange(0.6, 1.1);
      this.agent.idleTimer = 0;
      this.agent.lastAction = 'Capped combo at 3x multiplier';
      this.agent.clickTimer = this.getRandomInRange(0.2, 0.35);
      return;
    }

    if (this.agent.clickTimer > 0) return;

    const jitterScale = this.callbacks.getGameMode() === 'boss' ? 0.7 : 1;
    const clickPos = this.withJitter(
      { x: targetEntity.x, y: targetEntity.y },
      this.agent.jitterRadius * jitterScale,
    );
    this.callbacks.handleClick(clickPos);

    const hasDiscovered = this.checkForDiscoveredUpgrades();
    const clickIntervalMin = hasDiscovered
      ? this.agent.clickIntervalRange.min * 0.7
      : this.agent.clickIntervalRange.min;
    const clickIntervalMax = hasDiscovered
      ? this.agent.clickIntervalRange.max * 0.7
      : this.agent.clickIntervalRange.max;

    if (this.agent.burstShotsRemaining > 0) {
      this.agent.burstShotsRemaining--;
      this.agent.clickTimer = this.agent.burstShotsRemaining
        ? this.getRandomInRange(0.05, 0.1)
        : this.getRandomInRange(clickIntervalMin, clickIntervalMax);
    } else if (
      this.agent.burstCooldownTimer <= 0 &&
      Math.random() < this.agent.burstChance
    ) {
      this.agent.burstShotsRemaining = Math.floor(
        this.getRandomInRange(2, 5),
      );
      this.agent.clickTimer = this.getRandomInRange(0.05, 0.1);
      this.agent.burstCooldownTimer = this.getRandomInRange(
        this.agent.burstCooldownRange.min,
        this.agent.burstCooldownRange.max,
      );
      this.agent.lastAction = 'Executed rapid click burst';
    } else {
      this.agent.clickTimer = this.getRandomInRange(
        clickIntervalMin,
        clickIntervalMax,
      );
    }
  }

  private runUpgrades(): void {
    if (!this.agent) return;

    const beforeState = this.deps.store.getState();
    const beforeUpgrades = beforeState.stats.totalUpgrades;
    const beforeSubUpgrades = beforeState.stats.totalSubUpgrades;

    this.deps.shop.checkAndBuyDiscoveredUpgrades();

    const hasDiscovered = this.checkForDiscoveredUpgrades();

    if (!hasDiscovered) {
      this.deps.shop.checkAndBuyAffordableUpgrades(true);
    }

    const afterState = this.deps.store.getState();
    if (afterState.stats.totalUpgrades > beforeUpgrades) {
      const diff = afterState.stats.totalUpgrades - beforeUpgrades;
      this.agent.lastAction =
        diff > 1 ? `Bought ${String(diff)} upgrades` : 'Bought upgrade';
    } else if (afterState.stats.totalSubUpgrades > beforeSubUpgrades) {
      this.agent.lastAction = 'Unlocked special upgrade';
    } else if (hasDiscovered) {
      this.agent.lastAction = 'Saving for discovered upgrade';
    }

    if (hasDiscovered) {
      this.agent.upgradeTimer = this.getRandomInRange(0.3, 0.6);
    } else {
      this.agent.upgradeTimer = this.getRandomInRange(
        this.agent.upgradeIntervalRange.min,
        this.agent.upgradeIntervalRange.max,
      );
    }
  }

  private checkForDiscoveredUpgrades(): boolean {
    const state = this.deps.store.getState();
    if (!state.discoveredUpgrades) return false;

    const subUpgrades = this.deps.upgradeSystem.getSubUpgrades();
    for (const subUpgrade of subUpgrades) {
      const subKey = `sub_${subUpgrade.id}`;
      if (state.discoveredUpgrades[subKey] && !subUpgrade.owned) {
        const cost = this.deps.upgradeSystem.getSubUpgradeCost(subUpgrade);
        const threshold = cost * 0.8;
        if (state.points >= threshold) {
          return true;
        }
      }
    }

    return false;
  }

  private handleBossFlow(): boolean {
    if (!this.agent) return false;
    if (typeof document === 'undefined') return false;

    const state = this.deps.store.getState();
    const blockedLevel =
      state.blockedOnBossLevel ??
      this.deps.bossManager.getBlockedBossLevel() ??
      null;
    const resolvedBossLevel =
      blockedLevel !== null ? blockedLevel : state.level;

    const ensureAgentReady = (
      action: string,
      resetClickTimer = true,
    ): void => {
      if (!this.agent) return;
      this.agent.lastAction = action;
      this.agent.breakTimer = 0;
      this.agent.idleTimer = 0;
      if (resetClickTimer) {
        this.agent.clickTimer = this.getRandomInRange(0.05, 0.1);
      }
    };

    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (
      timeoutModal &&
      timeoutModal.style.display !== 'none' &&
      this.callbacks.getGameMode() === 'boss'
    ) {
      const closeButton = document.getElementById('boss-timeout-close');
      if (closeButton) {
        closeButton.click();
      } else {
        timeoutModal.style.display = 'none';
        this.deps.bossManager.showRetryButton();
        this.callbacks.startTransitionToNormal();
      }
      this.agent.bossRetryTimer = this.agent.bossRetryDelay;
      this.agent.bossRetryAttempts += 1;
      this.recordBossEvent(
        resolvedBossLevel,
        `Boss timeout (attempt ${String(this.agent.bossRetryAttempts)})`,
      );
      const waitLabel = this.formatDuration(this.agent.bossRetryDelay);
      ensureAgentReady(`Boss escaped - retry in ${waitLabel}`, false);
      return true;
    }

    if (this.callbacks.getGameMode() !== 'normal') {
      return false;
    }

    const dialog = document.getElementById('boss-dialog');
    const dialogVisible = Boolean(dialog && dialog.style.display !== 'none');
    const startButton = document.getElementById('boss-start-btn');

    if (dialogVisible) {
      if (startButton) {
        startButton.click();
      } else {
        if (dialog) {
          dialog.style.display = 'none';
        }
        this.callbacks.startBossFight();
      }
      this.agent.bossRetryTimer = 0;
      const attemptNumber = this.agent.bossRetryAttempts + 1;
      this.recordBossEvent(
        resolvedBossLevel,
        `Starting boss attempt ${String(attemptNumber)}`,
      );
      if (blockedLevel === null) {
        this.agent.bossRetryAttempts = 0;
      }
      ensureAgentReady(
        blockedLevel !== null ? 'Re-engaging boss fight' : 'Engaging boss fight',
      );
      this.deps.bossManager.hideRetryButton();
      return true;
    }

    if (blockedLevel !== null) {
      if (this.agent.bossRetryTimer > 0) {
        const waitLabel = this.formatDuration(this.agent.bossRetryTimer);
        ensureAgentReady(`Boss retry in ${waitLabel}`, false);
        return true;
      }

      const retryButton = document.getElementById('boss-retry-btn');

      if (retryButton && retryButton.style.display !== 'none') {
        this.agent.bossRetryTimer = 0;
        retryButton.click();
        const attemptNumber = this.agent.bossRetryAttempts + 1;
        this.recordBossEvent(
          blockedLevel,
          `Launching boss retry attempt ${String(attemptNumber)}`,
        );
        ensureAgentReady('Retrying boss fight', false);
        return true;
      }

      this.agent.bossRetryTimer = 0;
      this.recordBossEvent(blockedLevel, 'Opening boss dialog for retry');
      this.callbacks.showBossDialog();
      ensureAgentReady('Preparing boss retry', false);
      return true;
    }

    const isBossLevel = ColorManager.isBossLevel(state.level);

    if (isBossLevel && !this.callbacks.getBall()) {
      this.agent.bossRetryTimer = 0;
      this.agent.bossRetryAttempts = 0;
      this.recordBossEvent(state.level, 'Boss detected - preparing fight');
      this.callbacks.showBossDialog();
      ensureAgentReady('Summoning boss', false);
      return true;
    }

    return false;
  }

  private updateMetrics(): void {
    if (!this.agent) return;

    this.agent.metricsTimer = this.agent.metricsInterval;
    const state = this.deps.store.getState();
    const elapsedSeconds = Math.max(
      0.1,
      (performance.now() - this.agent.startTimestamp) / 1000,
    );

    const deltaPoints = Math.max(0, state.points - this.agent.baseline.points);
    const deltaClicks = Math.max(
      0,
      state.stats.totalClicks - this.agent.baseline.clicks,
    );
    const deltaBosses = Math.max(
      0,
      state.stats.bossesKilled - this.agent.baseline.bosses,
    );
    const deltaUpgrades =
      Math.max(0, state.stats.totalUpgrades - this.agent.baseline.upgrades) +
      Math.max(
        0,
        state.stats.totalSubUpgrades - this.agent.baseline.subUpgrades,
      );

    const pointsPerMinute = (deltaPoints / elapsedSeconds) * 60;
    const clicksPerMinute = (deltaClicks / elapsedSeconds) * 60;
    const bossesPerHour = (deltaBosses / elapsedSeconds) * 3600;
    const upgradesPerMinute = (deltaUpgrades / elapsedSeconds) * 60;

    const lastHistoryEntry =
      this.agent.bossHistory.length > 0
        ? this.agent.bossHistory[this.agent.bossHistory.length - 1]
        : null;
    const secondsSinceBossEvent = lastHistoryEntry
      ? Math.max(0, (Date.now() - lastHistoryEntry.timestamp) / 1000)
      : 0;
    const bossEventText = lastHistoryEntry
      ? `${lastHistoryEntry.detail} (${this.formatDuration(
        secondsSinceBossEvent,
      )} ago)`
      : 'No boss activity yet';
    const nextRetryText =
      this.agent.bossRetryTimer > 0
        ? `Next retry in ${this.formatDuration(this.agent.bossRetryTimer)}`
        : 'Next retry ready';
    const bossLogText = `${bossEventText} | Failures: ${String(
      this.agent.bossRetryAttempts,
    )} | ${nextRetryText}`;

    this.updateOverlay({
      elapsedSeconds,
      pointsPerMinute,
      clicksPerMinute,
      bossesPerHour,
      upgradesPerMinute,
      lastAction: this.agent.lastAction,
      bossLogText,
    });
  }

  private updateOverlay(metrics: {
    elapsedSeconds: number;
    pointsPerMinute: number;
    clicksPerMinute: number;
    bossesPerHour: number;
    upgradesPerMinute: number;
    lastAction: string;
    bossLogText: string;
  }): void {
    if (!this.agent?.overlay) return;
    const overlay = this.agent.overlay;

    const elapsedEl = overlay.querySelector('[data-metric="elapsed"]');
    if (elapsedEl) {
      elapsedEl.textContent = `Elapsed: ${this.formatDuration(
        metrics.elapsedSeconds,
      )}`;
    }

    const bossLogEl = overlay.querySelector('[data-metric="boss-log"]');
    if (bossLogEl) {
      bossLogEl.textContent = `Boss log: ${metrics.bossLogText || '—'}`;
    }

    const formatValue = (value: number, fractionDigits = 1): string => {
      if (!isFinite(value) || value <= 0) return '0';
      if (value >= 1000) {
        return NumberFormatter.format(value);
      }
      return value.toFixed(fractionDigits);
    };

    const pointsEl = overlay.querySelector('[data-metric="points"]');
    if (pointsEl) {
      pointsEl.textContent = `Points/min: ${formatValue(
        metrics.pointsPerMinute,
        1,
      )}`;
    }

    const clicksEl = overlay.querySelector('[data-metric="clicks"]');
    if (clicksEl) {
      clicksEl.textContent = `Clicks/min: ${formatValue(
        metrics.clicksPerMinute,
        1,
      )}`;
    }

    const bossesEl = overlay.querySelector('[data-metric="bosses"]');
    if (bossesEl) {
      bossesEl.textContent = `Bosses/hr: ${formatValue(
        metrics.bossesPerHour,
        2,
      )}`;
    }

    const upgradesEl = overlay.querySelector('[data-metric="upgrades"]');
    if (upgradesEl) {
      upgradesEl.textContent = `Upgrades/min: ${formatValue(
        metrics.upgradesPerMinute,
        2,
      )}`;
    }

    const actionEl = overlay.querySelector('[data-metric="last-action"]');
    if (actionEl) {
      actionEl.textContent = `Last action: ${metrics.lastAction || '—'}`;
    }
  }

  private logSnapshot(): void {
    if (!this.agent || typeof console === 'undefined') return;
    const state = this.deps.store.getState();
    const elapsedSeconds = Math.max(
      0.1,
      (performance.now() - this.agent.startTimestamp) / 1000,
    );

    const deltaPoints = state.points - this.agent.baseline.points;
    const deltaClicks = state.stats.totalClicks - this.agent.baseline.clicks;
    const deltaBosses = state.stats.bossesKilled - this.agent.baseline.bosses;
    const deltaUpgrades =
      state.stats.totalUpgrades - this.agent.baseline.upgrades;
    const deltaSubUpgrades =
      state.stats.totalSubUpgrades - this.agent.baseline.subUpgrades;

    const pointsPerMinute = (Math.max(0, deltaPoints) / elapsedSeconds) * 60;
    const clicksPerMinute = (Math.max(0, deltaClicks) / elapsedSeconds) * 60;
    const bossesPerHour = (Math.max(0, deltaBosses) / elapsedSeconds) * 3600;
    const upgradesPerMinute =
      ((Math.max(0, deltaUpgrades) + Math.max(0, deltaSubUpgrades)) /
        elapsedSeconds) *
      60;

    console.table({
      'Elapsed (m)': Number((elapsedSeconds / 60).toFixed(2)),
      'Points gained': Math.max(0, deltaPoints),
      'Points/min': Number(pointsPerMinute.toFixed(1)),
      'Clicks/min': Number(clicksPerMinute.toFixed(1)),
      'Bosses/hr': Number(bossesPerHour.toFixed(2)),
      'Upgrades/min': Number(upgradesPerMinute.toFixed(2)),
      'Last action': this.agent.lastAction,
    });
  }

  private recordBossEvent(level: number, detail: string): void {
    if (!this.agent) return;

    const timestamp = Date.now();
    const entry = { timestamp, level, detail };
    this.agent.bossHistory.push(entry);
    if (this.agent.bossHistory.length > 12) {
      this.agent.bossHistory.splice(0, this.agent.bossHistory.length - 12);
    }
    this.agent.lastAction = detail;
    this.agent.metricsTimer = 0;
    if (typeof console !== 'undefined' && typeof console.info === 'function') {
      const timeIso = new Date(timestamp).toISOString();
      console.info(
        `[GodMode][Boss][${timeIso}] Level ${String(level)} - ${detail}`,
      );
    }
  }

  private resetBossTracking(): void {
    if (!this.agent) return;
    this.agent.bossRetryTimer = 0;
    this.agent.bossRetryAttempts = 0;
    this.agent.metricsTimer = 0;
  }

  private formatDuration(seconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours)}h ${String(minutes)}m`;
    }
    if (minutes > 0) {
      return `${String(minutes)}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${String(secs)}s`;
  }

  private withJitter(base: Vec2, radius: number): Vec2 {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const pos = {
      x: base.x + Math.cos(angle) * distance,
      y: base.y + Math.sin(angle) * distance,
    };
    return this.clampToCanvas(pos);
  }

  private clampToCanvas(pos: Vec2): Vec2 {
    const width = this.deps.canvas.getWidth();
    const height = this.deps.canvas.getHeight();
    return {
      x: Math.min(Math.max(pos.x, 0), width),
      y: Math.min(Math.max(pos.y, 0), height),
    };
  }

  private getRandomInRange(min: number, max: number): number {
    if (max <= min) return min;
    return Math.random() * (max - min) + min;
  }
}

