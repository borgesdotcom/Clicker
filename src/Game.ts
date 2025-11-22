/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlienBall } from './entities/AlienBall';
import { EnhancedAlienBall, selectEnemyType, type EnemyType } from './entities/EnemyTypes';
import { BossBall } from './entities/BossBall';
import { getPixelHitPoint } from './utils/Raycast';
import { Ship } from './entities/Ship';
import { Canvas } from './render/Canvas';
import { Draw } from './render/Draw';
import { Background } from './render/Background';
import { CRTFilter } from './render/CRTFilter';
import { BossEffectFilter } from './render/BossEffectFilter';
import { LCDFilter } from './render/LCDFilter';
import type { WebGLRenderer } from './render/WebGLRenderer';
import { Loop } from './core/Loop';
import { Input } from './core/Input';
import { Store } from './core/Store';
import { Save } from './core/Save';
import { LaserSystem } from './systems/LaserSystem';
import { UpgradeSystem } from './systems/UpgradeSystem';
import { AutoFireSystem } from './systems/AutoFireSystem';
import { AchievementSystem } from './systems/AchievementSystem';
import { AscensionSystem } from './systems/AscensionSystem';
import { MissionSystem } from './systems/MissionSystem';
import { ArtifactSystem } from './systems/ArtifactSystem';
import { ParticleSystem } from './entities/Particle';
import { DamageNumberSystem } from './systems/DamageNumberSystem';
import { ComboSystem } from './systems/ComboSystem';
import { SoundManager } from './systems/SoundManager';
import { PowerUpSystem } from './systems/PowerUpSystem';
import { Hud } from './ui/Hud';
import { Shop } from './ui/Shop';
import { AchievementSnackbar } from './ui/AchievementSnackbar';
import { AchievementsModal } from './ui/AchievementsModal';
import { AscensionModal } from './ui/AscensionModal';
import { StatsPanel } from './ui/StatsPanel';
import { SettingsModal } from './ui/SettingsModal';
import { DebugPanel } from './ui/DebugPanel';
import { MissionsModal } from './ui/MissionsModal';
import { ArtifactsModal } from './ui/ArtifactsModal';
import { VersionSplash } from './ui/VersionSplash';
import { CreditsModal } from './ui/CreditsModal';
import { GameInfoModal } from './ui/GameInfoModal';
import { ThankYouModal } from './ui/ThankYouModal';
import { TutorialSystem } from './systems/TutorialSystem';
import { PerformanceMonitor } from './ui/PerformanceMonitor';
import { ColorManager } from './math/ColorManager';
import { images } from './assets/images';
import { Settings } from './core/Settings';
import { NotificationSystem } from './ui/NotificationSystem';
import { VisualCustomizationSystem } from './systems/VisualCustomizationSystem';
import { NumberFormatter } from './utils/NumberFormatter';
import { PerformanceModeManager } from './systems/PerformanceModeManager';
import type { Vec2, GameMode, ThemeCategory } from './types';
import type { UserSettings } from './core/Settings';

export class Game {
  private canvas: Canvas;
  private draw: Draw;
  private background: Background;
  private crtFilter: CRTFilter;
  private bossEffectFilter: BossEffectFilter;
  private lcdFilter: LCDFilter;
  private loop: Loop;
  private input: Input;
  private store: Store;
  private ball: AlienBall | EnhancedAlienBall | null = null;
  private bossBall: BossBall | null = null;
  private ships: Ship[] = [];
  private laserSystem: LaserSystem;
  private particleSystem: ParticleSystem;
  private damageNumberSystem: DamageNumberSystem;
  private comboSystem: ComboSystem;
  private soundManager: SoundManager;
  private upgradeSystem: UpgradeSystem;
  private autoFireSystem: AutoFireSystem;
  private achievementSystem: AchievementSystem;
  private ascensionSystem: AscensionSystem;
  private missionSystem: MissionSystem;
  private artifactSystem: ArtifactSystem;
  private powerUpSystem: PowerUpSystem;
  private achievementSnackbar: AchievementSnackbar;
  private achievementsModal: AchievementsModal;
  private ascensionModal: AscensionModal;
  private missionsModal: MissionsModal;
  private artifactsModal: ArtifactsModal;
  private statsPanel: StatsPanel;
  private settingsModal: SettingsModal;
  private creditsModal: CreditsModal;
  private gameInfoModal: GameInfoModal;
  private thankYouModal: ThankYouModal;
  private performanceMonitor: PerformanceMonitor;
  private notificationSystem: NotificationSystem;
  private hud: Hud;
  private shop: Shop;
  private tutorialSystem: TutorialSystem;
  private customizationSystem: VisualCustomizationSystem;
  private performanceModeManager: PerformanceModeManager;
  private saveTimer = 0;
  private saveInterval = 3;
  private autoBuyTimer = 0;
  private autoBuyInterval = 0.5; // Check every 0.5 seconds
  private lastPowerUpCount = 0; // Track power-up changes for shop refresh
  private lastHadSpeedBuff = false; // Track speed buff specifically for shop refresh
  private lastHadDamageBuff = false; // Track damage buff specifically for shop refresh
  private playTimeAccumulator = 0;
  private passiveGenAccumulator = 0;
  private titleUpdateTimer = 0;
  private shakeTime = 0;
  private shakeAmount = 0;
  private ascensionAnimationTime = 0;
  private isAscensionAnimating = false;

  // Active Skill States
  private midasActive = false;
  private overclockTimer = 0;
  private mode: GameMode = 'normal';
  private transitionTime = 0;
  private transitionDuration = 2;
  private keys: Set<string> = new Set();
  private userSettings: UserSettings = Settings.getDefault();

  // Boss battle timer system
  private bossTimeLimit = 0;
  private bossTimeRemaining = 0;
  private bossTimerElement: HTMLElement | null = null;
  private bossTimeoutHandled = false;

  // Debug controls
  private gameSpeed = 1.0;
  private godMode = false;
  private godModeAgent: {
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
  } | null = null;

  // Boss retry system
  private bossRetryButton: HTMLElement | null = null;
  private blockedOnBossLevel: number | null = null;

  // Combo pause skill system
  private comboPauseButton: HTMLElement | null = null;
  private comboPauseActive = false;
  private comboPauseDuration = 0; // Remaining duration in seconds
  private comboPauseCooldown = 0; // Remaining cooldown in seconds
  private readonly COMBO_PAUSE_DURATION = 15 * 60; // 15 minutes in seconds
  private readonly COMBO_PAUSE_COOLDOWN = 60 * 60; // 1 hour in seconds

  // Damage batching for performance - use pre-allocated object to reduce GC
  private damageBatch: {
    damage: number;
    isCrit: boolean;
    isFromShip: boolean;
    clickDamage: number; // Track click damage separately
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
  private batchTimer = 0;
  private batchInterval = 0.05; // Apply damage every 50ms

  // Frame counting for throttling expensive operations
  private frameCount = 0;
  private readonly BOSS_TIMER_UPDATE_INTERVAL = 3; // Update boss timer every 3 frames
  private readonly ACHIEVEMENT_CHECK_INTERVAL = 30; // Check achievements every 30 frames
  private readonly HUD_STATS_UPDATE_INTERVAL = 5; // Update HUD stats every 5 frames
  private readonly BEAM_RECALC_INTERVAL = 60; // Recalculate beam damage every 60 frames (~0.5s at 120fps)

  constructor() {
    const canvasElement = document.getElementById(
      'game-canvas',
    ) as HTMLCanvasElement | null;
    if (!canvasElement) {
      throw new Error('Canvas not found');
    }

    this.canvas = new Canvas(canvasElement);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer: WebGLRenderer | null = this.canvas.getWebGLRenderer();
    this.draw = new Draw(
      this.canvas.getContext(),
      webglRenderer !== null ? webglRenderer : undefined,
    );
    this.background = new Background(
      this.canvas.getWidth(),
      this.canvas.getHeight(),
    );
    this.store = new Store(Save.load());

    // Load user settings
    this.userSettings = Settings.load();

    // Initialize Performance Mode Manager
    this.performanceModeManager = new PerformanceModeManager();
    this.performanceModeManager.setMode(this.userSettings.performanceMode);
    console.log('[Game] Performance mode:', this.performanceModeManager.getCurrentMode());
    console.log('[Game] Performance settings:', this.performanceModeManager.getSettings());

    // Initialize CRT filter (for future creepypasta/horror effects)
    // NOTE: This creates a distorted, glitchy screen effect with barrel distortion,
    // scanlines, and noise. Perfect for horror moments or glitch sequences.
    // To enable programmatically: this.crtFilter.enable()
    // To disable: this.crtFilter.disable()
    this.crtFilter = new CRTFilter();

    // Initialize Boss Effect filter (for boss-specific visual effects)
    // Each boss variant gets a unique WebGL-style effect that matches their vibe
    this.bossEffectFilter = new BossEffectFilter();

    // Initialize LCD filter (subtle retro monitor effect)
    // Gives the game a smooth LCD/monitor look with subtle pixel grid
    this.lcdFilter = new LCDFilter();
    // Will be enabled based on user settings later in initialization

    // Handle window resize to reposition game elements
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    this.upgradeSystem = new UpgradeSystem();
    this.laserSystem = new LaserSystem();
    
    // Initialize particle system with performance settings
    const perfSettings = this.performanceModeManager.getSettings();
    this.particleSystem = new ParticleSystem(perfSettings.maxParticles);
    this.particleSystem.setParticleMultiplier(perfSettings.particleMultiplier);
    
    this.damageNumberSystem = new DamageNumberSystem();
    this.comboSystem = new ComboSystem();
    this.soundManager = new SoundManager();
    this.soundManager.setEnabled(this.userSettings.soundEnabled);
    this.soundManager.setSoundtrackEnabled(this.userSettings.soundtrackEnabled);
    this.soundManager.setVolume(this.userSettings.volume);
    this.autoFireSystem = new AutoFireSystem();
    this.achievementSystem = new AchievementSystem();
    this.ascensionSystem = new AscensionSystem();
    this.artifactSystem = new ArtifactSystem();
    this.missionSystem = new MissionSystem(this.store);
    this.powerUpSystem = new PowerUpSystem(
      this.canvas.getWidth(),
      this.canvas.getHeight(),
    );
    this.upgradeSystem.setAscensionSystem(this.ascensionSystem);
    this.upgradeSystem.setArtifactSystem(this.artifactSystem);
    this.upgradeSystem.setPowerUpSystem(this.powerUpSystem);
    this.comboSystem.setAscensionSystem(this.ascensionSystem);
    this.achievementSnackbar = new AchievementSnackbar();
    this.achievementsModal = new AchievementsModal(this.achievementSystem);
    this.ascensionModal = new AscensionModal(
      this.ascensionSystem,
      this.store,
      () => {
        this.performAscension();
      },
    );
    this.missionsModal = new MissionsModal(
      this.missionSystem,
      this.store,
      () => {
        const state = this.store.getState();
        this.hud.update(state.points);
        this.store.setState({ ...state });
      },
    );
    this.artifactsModal = new ArtifactsModal(this.artifactSystem, this.store);
    this.statsPanel = new StatsPanel(this.upgradeSystem);
    this.settingsModal = new SettingsModal(this.soundManager);
    this.creditsModal = new CreditsModal(this.store);
    this.gameInfoModal = new GameInfoModal(
      this.store,
      this.upgradeSystem,
      this.ascensionSystem,
      this.artifactSystem,
    );
    this.thankYouModal = new ThankYouModal();
    this.performanceMonitor = new PerformanceMonitor();

    // Setup performance monitor entity count providers
    this.performanceMonitor.setEntityCountProviders({
      getLasers: (): number => {
        return this.laserSystem.getLasers().length;
      },
      getParticles: (): number => {
        return this.particleSystem.getParticleCount();
      },
      getShips: (): number => {
        return this.ships.length;
      },
      getDamageNumbers: (): number => {
        return this.damageNumberSystem.getCount();
      },
    });

    // Initialize notification system
    this.notificationSystem = new NotificationSystem();

    // Setup mission completion notifications
    this.missionSystem.setOnMissionComplete((mission) => {
      this.notificationSystem.show(
        `🎯 Mission Complete: ${mission.title}`,
        'mission',
        4000,
      );
    });

    // Setup daily mission reset notifications
    this.missionSystem.setOnDailyReset(() => {
      this.notificationSystem.show(
        '📅 New Daily Missions Available!',
        'info',
        5000,
      );
    });

    // Power-up spawn notifications removed

    // Initialize visual customization system
    this.customizationSystem = new VisualCustomizationSystem();

    // Load saved themes
    const initialState = this.store.getState();
    if (initialState.selectedThemes) {
      this.customizationSystem.loadState(
        initialState.selectedThemes as Record<ThemeCategory, string>,
      );
    }
    this.customizationSystem.updateUnlocks(initialState);

    // Set initial background based on level (before first render)
    const initialLevel = initialState.level || 1;
    this.updateBackgroundByLevel(initialLevel);

    // Set initial background theme colors (keep for star colors, etc.)
    const bgColors = this.customizationSystem.getBackgroundColors();
    const initialThemeId: string = 'default_background';
    this.background.setThemeColors(bgColors, initialThemeId);

    (this as any).debugPanel = new DebugPanel(
      this.store,
      () => {
        this.debugTriggerBoss();
      },
      () => {
        this.resetGame();
      },
      (speed: number) => {
        this.setGameSpeed(speed);
      },
      () => {
        this.toggleGodMode();
      },
      (type: 'damage' | 'speed' | 'points' | 'multishot' | 'critical') => {
        this.debugActivatePowerUp(type);
      },
      () => {
        this.powerUpSystem.clear();
        this.shop.forceRefresh();
      },
      (rarity?: 'common' | 'rare' | 'epic' | 'legendary') => {
        this.debugGenerateArtifact(rarity);
      },
      (type: EnemyType) => {
        this.debugSpawnAlien(type);
      },
    );

    new VersionSplash();

    // Connect settings modal to callbacks and save on change
    this.settingsModal.setGraphicsCallback((enabled: boolean) => {
      this.userSettings.highGraphics = enabled;
      if (!enabled) {
        this.particleSystem.clear();
      }
      Settings.save(this.userSettings);
    });
    this.settingsModal.setShipLasersCallback((enabled: boolean) => {
      this.userSettings.showShipLasers = enabled;
      this.laserSystem.setShowShipLasers(enabled);
      Settings.save(this.userSettings);
    });
    this.settingsModal.setDamageNumbersCallback((enabled: boolean) => {
      this.userSettings.showDamageNumbers = enabled;
      this.damageNumberSystem.setEnabled(enabled);
      if (!enabled) {
        this.damageNumberSystem.clear();
      }
      Settings.save(this.userSettings);
    });
    this.settingsModal.setLCDFilterCallback((enabled: boolean) => {
      this.userSettings.lcdFilterEnabled = enabled;
      if (enabled) {
        this.lcdFilter.enable();
      } else {
        this.lcdFilter.disable();
      }
      Settings.save(this.userSettings);
    });
    this.settingsModal.setSoundCallback((enabled: boolean) => {
      this.userSettings.soundEnabled = enabled;
      Settings.save(this.userSettings);
    });
    this.settingsModal.setSoundtrackCallback((enabled: boolean) => {
      this.userSettings.soundtrackEnabled = enabled;
      Settings.save(this.userSettings);
    });
    this.settingsModal.setVolumeCallback((volume: number) => {
      this.userSettings.volume = volume;
      Settings.save(this.userSettings);
    });

    // Apply loaded settings
    this.laserSystem.setShowShipLasers(this.userSettings.showShipLasers);
    this.damageNumberSystem.setEnabled(this.userSettings.showDamageNumbers);
    // Apply LCD filter setting
    if (this.userSettings.lcdFilterEnabled) {
      this.lcdFilter.enable();
    } else {
      this.lcdFilter.disable();
    }
    this.settingsModal.updateGraphicsToggles(
      this.userSettings.highGraphics,
      this.userSettings.showShipLasers,
      this.userSettings.showDamageNumbers,
      this.userSettings.lcdFilterEnabled,
    );
    // Setup stats panel button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.setAttribute('aria-label', 'Open Statistics');
      statsBtn.addEventListener('click', () => {
        this.statsPanel.show();
      });
    }
    this.hud = new Hud();
    this.hud.onSkillActivate = (id) => {
      // Prevent activation during boss mode
      if (this.mode === 'boss') {
        this.hud.showMessage(
          'Cannot use skills during boss fights!',
          '#ff4444',
          2000,
        );
        return;
      }

      const result = this.artifactSystem.activateArtifact(id);
      if (result.success && result.effect) {
        this.handleActiveEffect(result.effect);
      } else if (result.reason === 'On cooldown') {
        this.hud.showMessage('Skill is on cooldown!', '#ffaa00', 1500);
      }
    };
    // Configure UpgradeSystem to access game state for discounts
    this.upgradeSystem.setGameStateGetter(() => this.store.getState());

    this.shop = new Shop(this.store, this.upgradeSystem);
    this.shop.setSoundManager(this.soundManager);
    this.shop.setMissionSystem(this.missionSystem);
    this.shop.setAscensionSystem(this.ascensionSystem);
    this.shop.setOnPurchase(() => {
      this.handleUpgradePurchase();
    });

    this.achievementSystem.setOnUnlock((achievement) => {
      this.achievementSnackbar.show(achievement);
      this.soundManager.playAchievement();
    });
    this.achievementSystem.updateFromState(this.store.getState());

    this.input = new Input(canvasElement);
    this.loop = new Loop(
      (dt) => {
        const updateStart = this.performanceMonitor.startFrame();
        this.update(dt);
        this.performanceMonitor.endUpdate(updateStart);
      },
      () => {
        const renderStart = performance.now();
        this.render();
        this.performanceMonitor.endRender(renderStart);
      },
      (frameStart: number) => {
        this.performanceMonitor.endFrame(frameStart);
      },
      (elapsedSeconds: number) => {
        // Grant offline progress while tab was hidden
        const state = this.store.getState();
        // Add playtime
        this.store.addPlayTime(Math.floor(elapsedSeconds));
        // Passive generation per second
        const passiveGenPerSec = this.upgradeSystem.getPassiveGen(state);
        if (passiveGenPerSec > 0 && elapsedSeconds > 0) {
          const pointsToAdd = Math.floor(passiveGenPerSec * elapsedSeconds);
          if (pointsToAdd > 0) {
            this.store.addPoints(pointsToAdd);
          }
        }
        // Advance autosave timer safely to trigger on next tick
        this.saveTimer = Math.min(
          this.saveTimer + elapsedSeconds,
          this.saveInterval,
        );
        // Advance auto-buy timer similarly
        this.autoBuyTimer = Math.min(
          this.autoBuyTimer + elapsedSeconds,
          this.autoBuyInterval,
        );
      },
    );

    // Setup boss-related UI before initGame (which may need to show the retry button)
    this.setupBossDialog();
    this.setupBossTimer();
    this.setupBossRetryButton();

    // Initialize game state (may show boss retry button if player is blocked)
    this.initGame();

    // Setup remaining UI and input
    this.setupInput();
    this.setupKeyboard();
    this.setupAutoSave();
    this.setupAchievementsButton();
    this.setupAscensionButton();
    this.setupSettingsButton();
    this.setupMissionsButton();
    this.setupArtifactsButton();
    this.setupGameInfoButton();
    this.setupComboPauseButton();
    this.setupDiscordButton();
    // Reset button is now in SettingsModal
    this.settingsModal.setResetCallback(() => {
      this.resetGame();
    });
    this.settingsModal.setCreditsModal(this.creditsModal);

    this.tutorialSystem = new TutorialSystem(this.store);
  }

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

  private setupBossTimer(): void {
    this.bossTimerElement = document.getElementById('boss-timer-hud');
  }

  private setupBossRetryButton(): void {
    // Create boss retry button
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

      // Add tooltip AFTER setting innerHTML
      const tooltip = document.createElement('div');
      tooltip.className = 'boss-retry-tooltip';
      tooltip.textContent =
        'Retry the boss fight. Shows the boss dialog again to restart the encounter.';
      this.bossRetryButton.appendChild(tooltip);

      this.bossRetryButton.addEventListener('click', () => {
        this.retryBossFight();
      });

      buttonsContainer.appendChild(this.bossRetryButton);
    }
  }

  private startBossTimer(): void {
    const state = this.store.getState();
    // Use ColorManager for dynamic boss timer scaling
    this.bossTimeLimit = ColorManager.getBossTimeLimit(state.level);
    this.bossTimeRemaining = this.bossTimeLimit;
    this.bossTimeoutHandled = false; // Reset timeout flag

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

  private updateBossTimer(dt: number): void {
    if (this.mode !== 'boss') return;

    // Don't update if timeout already handled
    if (this.bossTimeoutHandled) return;

    // Check timeout BEFORE updating to catch exactly at 0
    if (this.bossTimeRemaining <= 0) {
      this.handleBossTimeout();
      return;
    }

    this.bossTimeRemaining -= dt;

    // Check again after decrementing (in case dt was large enough to go past 0)
    if (this.bossTimeRemaining <= 0) {
      this.bossTimeRemaining = 0; // Clamp to 0
      this.handleBossTimeout();
      return;
    }

    // Update timer display
    const timerText = document.getElementById('boss-timer-text');
    const timerBar = document.getElementById('boss-timer-bar');

    if (timerText && timerBar) {
      const timeLeft = Math.ceil(Math.max(0, this.bossTimeRemaining));
      const seconds = timeLeft.toString().padStart(2, '0');

      // Update text and classes
      if (this.bossTimeRemaining <= 5) {
        timerText.textContent = `TIME: ${seconds}s`;
        timerText.className = 'boss-timer-text critical';
      } else if (this.bossTimeRemaining <= 10) {
        timerText.textContent = `TIME: ${seconds}s`;
        timerText.className = 'boss-timer-text warning';
      } else {
        timerText.textContent = `TIME: ${seconds}s`;
        timerText.className = 'boss-timer-text';
      }

      // Update bar width with smooth transition
      const percent = Math.max(
        0,
        (this.bossTimeRemaining / this.bossTimeLimit) * 100,
      );
      timerBar.style.width = `${String(percent)}%`;

      // Update bar classes for visual state
      if (this.bossTimeRemaining <= 5) {
        timerBar.className = 'boss-timer-bar-fill critical';
      } else if (this.bossTimeRemaining <= 10) {
        timerBar.className = 'boss-timer-bar-fill warning';
      } else {
        timerBar.className = 'boss-timer-bar-fill';
      }
    }
  }

  private hideBossTimer(): void {
    if (this.bossTimerElement) {
      this.bossTimerElement.style.display = 'none';
    }
  }

  private handleBossTimeout(): void {
    // Prevent duplicate calls - check at start
    if (this.bossTimeoutHandled) {
      return;
    }

    // Check if boss is already defeated (race condition fix)
    // If boss is dead, don't process timeout - defeat handler will handle it
    if (this.bossBall && this.bossBall.currentHp <= 0) {
      return;
    }

    // Set flag immediately to prevent race conditions
    this.bossTimeoutHandled = true;

    // Boss escapes! Player must retry
    const state = this.store.getState();

    this.soundManager.playBossDefeat(); // Play defeat sound

    // Penalty: Lose 20% of current XP (not too punishing)
    const xpLoss = Math.floor(state.experience * 0.2);
    state.experience = Math.max(0, state.experience - xpLoss);

    // Block progression until boss is defeated
    this.blockedOnBossLevel = state.level;
    state.blockedOnBossLevel = state.level; // Save to state for persistence
    this.store.setState(state);

    // Clean up boss battle state first
    this.hideBossTimer();
    // Disable boss effect immediately when timeout occurs
    this.bossEffectFilter.disable(0.5);
    // Switch back to normal soundtrack
    this.soundManager.stopBossSoundtrack();
    // Pause combo to preserve it during transition back to normal (unless combo pause skill is active)
    if (!this.comboPauseActive) {
      this.comboSystem.pause();
    }

    // Show epic timeout modal
    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (timeoutModal) {
      // Ensure modal is hidden first
      timeoutModal.style.display = 'none';

      // Remove any existing event listeners by cloning the button
      const closeBtn = document.getElementById('boss-timeout-close');
      if (closeBtn && closeBtn.parentNode) {
        const newCloseBtn = closeBtn.cloneNode(true) as HTMLElement;
        newCloseBtn.id = 'boss-timeout-close'; // Restore ID after cloning

        // Setup close button handler BEFORE replacing
        newCloseBtn.addEventListener('click', () => {
          timeoutModal.style.display = 'none';

          // Show retry button
          if (this.bossRetryButton) {
            this.bossRetryButton.style.display = 'flex';
          }

          setTimeout(() => {
            this.startTransitionToNormal();
          }, 500);
        });

        // Replace the button
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      }

      // Show modal after setting up handler
      const subMessage = timeoutModal.querySelector('.timeout-submessage');
      if (subMessage) {
        subMessage.textContent =
          'You must defeat it to progress. XP gains are reduced by 90% until victory.';
      }
      timeoutModal.style.display = 'flex';
    } else {
      // Fallback to message if modal doesn't exist
      this.hud.showMessage(
        "⏱️ TIME'S UP! The boss escaped! XP gains reduced by 90% until the boss is defeated.",
        '#ff0000',
        4000,
      );

      // Show retry button
      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'flex';
      }

      setTimeout(() => {
        this.startTransitionToNormal();
      }, 500);
    }
  }

  private retryBossFight(): void {
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }
    this.showBossDialog();
  }

  start(): void {
    this.onStartGame();
  }

  private onStartGame(): void {
    // Check for offline progress before starting
    this.checkOfflineProgress();

    // Initialize page title
    const state = this.store.getState();
    this.updatePageTitle(state.points);

    // Start background soundtrack
    this.soundManager.startSoundtrack();

    this.loop.start();

    // Start tutorial only on first load (no existing save data)
    if (!Save.hasSaveData()) {
      setTimeout(() => {
        this.tutorialSystem.start();
      }, 600);
    }

    // Hook up shop toggle for tutorial
    const shopToggle = document.getElementById('desktop-shop-toggle');
    if (shopToggle) {
      shopToggle.addEventListener('click', () => {
        this.tutorialSystem.onShopOpened();
      });
    }
  }

  private handleUpgradePurchase(): void {
    this.tutorialSystem.onUpgradeBought();
  }

  private checkOfflineProgress(): void {
    const lastPlayTime = Save.getLastPlayTime();
    if (!lastPlayTime) return;

    const now = Date.now();
    const timeAway = now - lastPlayTime;
    const secondsAway = Math.floor(timeAway / 1000);
    const minutesAway = Math.floor(secondsAway / 60);
    const hoursAway = Math.floor(minutesAway / 60);

    // Only reward if away for at least 1 minute
    if (secondsAway < 60) return;

    // Cap offline time at 24 hours (86400 seconds)
    const cappedSeconds = Math.min(secondsAway, 86400);

    const state = this.store.getState();
    const passiveGenPerSecond = this.upgradeSystem.getPassiveGen(state);

    if (passiveGenPerSecond > 0) {
      // Calculate offline rewards (50% efficiency - encourages active play)
      const offlineReward = Math.floor(
        passiveGenPerSecond * cappedSeconds * 0.5,
      );

      if (offlineReward > 0) {
        this.store.addPoints(offlineReward);

        // Show offline reward message
        let timeText = '';
        if (hoursAway >= 1) {
          const remainingMinutes = minutesAway % 60;
          timeText =
            remainingMinutes > 0
              ? `${hoursAway.toString()}h ${remainingMinutes.toString()}m`
              : `${hoursAway.toString()}h`;
        } else {
          timeText = `${minutesAway.toString()}m`;
        }

        const formattedReward = this.formatOfflineReward(offlineReward);
        this.hud.showMessage(
          `⏰ Offline Progress!\nAway: ${timeText}\nReward: +${formattedReward}`,
          '#00ff88',
          5000,
        );

        // Play achievement sound for offline reward
        this.soundManager.playAchievement();
      }
    }
  }

  private formatOfflineReward(amount: number): string {
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return Math.floor(amount).toString();
  }

  private setupAchievementsButton(): void {
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
      achievementsBtn.setAttribute('aria-label', 'Open Achievements');
      achievementsBtn.setAttribute('aria-keyshortcuts', 'H');
      achievementsBtn.addEventListener('click', () => {
        this.achievementsModal.show();
      });
    }
  }

  private setupAscensionButton(): void {
    // Create ascension button dynamically
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      const ascensionBtn = document.createElement('button');
      ascensionBtn.id = 'ascension-button';
      ascensionBtn.className = 'hud-button ascension-hud-btn';
      ascensionBtn.setAttribute('data-icon', '🌟');
      ascensionBtn.setAttribute('data-text', 'Ascend');
      ascensionBtn.setAttribute('aria-label', 'Open Prestige/Ascension');
      ascensionBtn.setAttribute('aria-keyshortcuts', 'P');
      ascensionBtn.innerHTML = `<img src="${images.menu.ascension}" alt="Ascension" />`;
      ascensionBtn.addEventListener('click', () => {
        this.ascensionModal.show();
      });

      // Track if prestige was previously unlocked to detect when it gets unlocked
      let wasPrestigeUnlocked = false;
      let wasMeaningOfLifeOwned = false;

      // Update button visibility based on whether ascension is unlocked
      const updateAscensionBtn = () => {
        const state = this.store.getState();
        const hasMeaningOfLife = state.subUpgrades['meaning_of_life'] === true;
        // Button only appears if meaning_of_life is purchased OR if already prestiged before
        const isUnlocked = hasMeaningOfLife || state.prestigeLevel > 0;

        // Check if prestige was just unlocked via meaning_of_life purchase
        const isNowUnlocked =
          isUnlocked &&
          !wasPrestigeUnlocked &&
          hasMeaningOfLife &&
          !wasMeaningOfLifeOwned;

        if (isNowUnlocked) {
          // Animate the button appearing
          ascensionBtn.style.display = 'block';
          ascensionBtn.style.opacity = '0';
          ascensionBtn.style.transform = 'scale(0.5)';
          ascensionBtn.style.transition =
            'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

          // Add glow effect
          ascensionBtn.style.filter =
            'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))';
          ascensionBtn.style.boxShadow =
            '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.3)';

          // Trigger animation
          setTimeout(() => {
            ascensionBtn.style.opacity = '1';
            ascensionBtn.style.transform = 'scale(1)';

            // Remove glow after animation
            setTimeout(() => {
              ascensionBtn.style.transition = '';
              ascensionBtn.style.filter = '';
              ascensionBtn.style.boxShadow = '';
            }, 2000);
          }, 50);

          // Show notification
          if (this.notificationSystem) {
            this.notificationSystem.show(
              '🌟 Prestige System Unlocked! You can now ascend and gain prestige points!',
              'success',
              5000,
            );
          }
        } else {
          ascensionBtn.style.display = isUnlocked ? 'block' : 'none';
        }

        wasPrestigeUnlocked = isUnlocked;
        wasMeaningOfLifeOwned = hasMeaningOfLife;
      };

      this.store.subscribe(updateAscensionBtn);
      // Initialize state
      const initialState = this.store.getState();
      wasMeaningOfLifeOwned =
        initialState.subUpgrades['meaning_of_life'] === true;
      wasPrestigeUnlocked =
        wasMeaningOfLifeOwned || initialState.prestigeLevel > 0;
      updateAscensionBtn();

      buttonsContainer.appendChild(ascensionBtn);
    }
  }

  private setupSettingsButton(): void {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.settingsModal.show();
      });
    }
  }

  private setupMissionsButton(): void {
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      const missionsBtn = document.createElement('button');
      missionsBtn.id = 'missions-button';
      missionsBtn.className = 'hud-button';
      missionsBtn.setAttribute('data-icon', '🎯');
      missionsBtn.setAttribute('data-text', 'Missions');
      missionsBtn.setAttribute('aria-label', 'Open Missions');
      missionsBtn.setAttribute('aria-keyshortcuts', 'M');
      missionsBtn.innerHTML = `<img src="${images.menu.info}" alt="Missions" />`;
      missionsBtn.addEventListener('click', () => {
        this.missionsModal.show();
      });
      buttonsContainer.appendChild(missionsBtn);
    }
  }

  private setupArtifactsButton(): void {
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      const artifactsBtn = document.createElement('button');
      artifactsBtn.id = 'artifacts-button';
      artifactsBtn.className = 'hud-button';
      artifactsBtn.setAttribute('data-icon', '✨');
      artifactsBtn.setAttribute('data-text', 'Artifacts');
      artifactsBtn.innerHTML = `<img src="${images.menu.artifacts}" alt="Artifacts" />`;
      artifactsBtn.addEventListener('click', () => {
        this.artifactsModal.show();
      });
      buttonsContainer.appendChild(artifactsBtn);
    }
  }

  private setupDiscordButton(): void {
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      // Discord Button
      const discordBtn = document.createElement('button');
      discordBtn.id = 'discord-button';
      discordBtn.className = 'shop-button';
      discordBtn.textContent = '💬 Join Discord';
      discordBtn.style.width = '100%';
      discordBtn.style.marginTop = '20px';
      discordBtn.style.padding = '12px';
      discordBtn.style.background = 'rgba(0, 0, 0, 0.95)';
      discordBtn.style.border = '1px solid rgba(255, 255, 255, 0.9)';
      discordBtn.style.color = '#ffffff';
      discordBtn.style.fontFamily = 'var(--font-family)';
      discordBtn.style.fontWeight = 'bold';
      discordBtn.style.letterSpacing = '2px';
      discordBtn.style.textShadow =
        '0 0 3px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.5)';
      discordBtn.style.boxShadow =
        '0 0 4px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.15)';
      discordBtn.style.transition = 'all 0.1s linear';
      discordBtn.style.cursor = 'pointer';
      discordBtn.addEventListener('click', () => {
        window.open('https://discord.gg/bfxYsvnw2S', '_blank');
      });
      discordBtn.addEventListener('mouseenter', () => {
        discordBtn.style.borderColor = 'rgba(255, 255, 255, 1)';
        discordBtn.style.boxShadow =
          '0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.25)';
      });
      discordBtn.addEventListener('mouseleave', () => {
        discordBtn.style.borderColor = 'rgba(255, 255, 255, 0.9)';
        discordBtn.style.boxShadow =
          '0 0 4px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.15)';
      });

      shopPanel.appendChild(discordBtn);

      // Credits & Share Button
      const creditsBtn = document.createElement('button');
      creditsBtn.id = 'credits-share-button';
      creditsBtn.className = 'shop-button';
      creditsBtn.textContent = 'CREDITS & SHARE';
      creditsBtn.style.width = '100%';
      creditsBtn.style.marginTop = '10px';
      creditsBtn.style.padding = '12px';
      creditsBtn.style.background = 'rgba(0, 0, 0, 0.95)';
      creditsBtn.style.border = '1px solid rgba(255, 255, 255, 0.9)';
      creditsBtn.style.color = '#ffffff';
      creditsBtn.style.fontFamily = 'var(--font-family)';
      creditsBtn.style.fontWeight = 'bold';
      creditsBtn.style.letterSpacing = '2px';
      creditsBtn.style.textShadow =
        '0 0 3px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.5)';
      creditsBtn.style.boxShadow =
        '0 0 4px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.15)';
      creditsBtn.style.transition = 'all 0.1s linear';
      creditsBtn.style.cursor = 'pointer';
      creditsBtn.addEventListener('click', () => {
        this.creditsModal.show();
      });
      creditsBtn.addEventListener('mouseenter', () => {
        creditsBtn.style.borderColor = 'rgba(255, 255, 255, 1)';
        creditsBtn.style.boxShadow =
          '0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(255, 255, 255, 0.25)';
      });
      creditsBtn.addEventListener('mouseleave', () => {
        creditsBtn.style.borderColor = 'rgba(255, 255, 255, 0.9)';
        creditsBtn.style.boxShadow =
          '0 0 4px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.15)';
      });

      shopPanel.appendChild(creditsBtn);
    }
  }

  private setupGameInfoButton(): void {
    const hudElement = document.getElementById('hud-buttons-container');
    if (hudElement) {
      const infoBtn = document.createElement('button');
      infoBtn.id = 'game-info-button';
      infoBtn.className = 'hud-button';
      infoBtn.setAttribute('data-icon', '📖');
      infoBtn.setAttribute('data-text', 'Game Info');
      infoBtn.innerHTML = `<img src="${images.menu.missions}" alt="Game Info" />`;
      infoBtn.addEventListener('click', () => {
        this.gameInfoModal.show();
      });
      hudElement.appendChild(infoBtn);
    }
  }

  private setupComboPauseButton(): void {
    // Create skills container in game-container (not in HUD)
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    // Create skills container
    let skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) {
      skillsContainer = document.createElement('div');
      skillsContainer.id = 'skills-container';
      skillsContainer.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      gameContainer.appendChild(skillsContainer);
    }

    // Create skill button
    this.comboPauseButton = document.createElement('button');
    this.comboPauseButton.id = 'combo-pause-skill';
    this.comboPauseButton.className = 'skill-button';
    this.comboPauseButton.style.display = 'none';
    this.comboPauseButton.style.pointerEvents = 'auto';

    // Create skill button structure
    this.comboPauseButton.innerHTML = `
      <div class="skill-icon">⏸️</div>
      <div class="skill-cooldown-ring"></div>
      <div class="skill-timer">0:00</div>
      <div class="skill-tooltip">
        <div class="skill-tooltip-title">Combo Freeze</div>
        <div class="skill-tooltip-desc">Pause combo timer for 15 minutes</div>
        <div class="skill-tooltip-cooldown">Cooldown: 1 hour</div>
      </div>
    `;

    this.comboPauseButton.addEventListener('click', () => {
      this.activateComboPause();
    });

    skillsContainer.appendChild(this.comboPauseButton);
    this.updateComboPauseButton();
  }

  private restoreComboPauseState(): void {
    const state = this.store.getState();
    const now = Date.now();

    // Restore active state
    if (
      state.comboPauseActive &&
      state.comboPauseEndTime &&
      state.comboPauseEndTime > 0
    ) {
      const remainingMs = state.comboPauseEndTime - now;
      if (remainingMs > 0) {
        // Still active - restore duration
        this.comboPauseActive = true;
        this.comboPauseDuration = remainingMs / 1000; // Convert to seconds
        this.comboSystem.pause(true); // Force pause
      } else {
        // Duration expired - start cooldown
        this.comboPauseActive = false;
        this.comboPauseDuration = 0;
        // Check if cooldown was already set
        if (
          state.comboPauseCooldownEndTime &&
          state.comboPauseCooldownEndTime > 0
        ) {
          const cooldownRemainingMs = state.comboPauseCooldownEndTime - now;
          this.comboPauseCooldown = Math.max(0, cooldownRemainingMs / 1000);
        } else {
          // Start new cooldown
          this.comboPauseCooldown = this.COMBO_PAUSE_COOLDOWN;
          state.comboPauseCooldownEndTime =
            now + this.COMBO_PAUSE_COOLDOWN * 1000;
        }
        state.comboPauseActive = false;
        state.comboPauseEndTime = 0;
        this.comboSystem.resume();
      }
    } else if (
      state.comboPauseCooldownEndTime &&
      state.comboPauseCooldownEndTime > 0
    ) {
      // Restore cooldown state
      const cooldownRemainingMs = state.comboPauseCooldownEndTime - now;
      if (cooldownRemainingMs > 0) {
        this.comboPauseCooldown = cooldownRemainingMs / 1000;
      } else {
        // Cooldown expired
        this.comboPauseCooldown = 0;
        state.comboPauseCooldownEndTime = 0;
      }
      this.comboPauseActive = false;
      this.comboPauseDuration = 0;
    }

    // Save updated state
    this.store.setState({ ...state });
    this.updateComboPauseButton();
  }

  private activateComboPause(): void {
    const state = this.store.getState();
    if (!this.ascensionSystem.isComboPauseUnlocked(state)) {
      return;
    }

    if (this.comboPauseCooldown > 0) {
      // Still on cooldown
      return;
    }

    if (this.comboPauseActive) {
      // Already active
      return;
    }

    // Activate the skill
    const now = Date.now();
    this.comboPauseActive = true;
    this.comboPauseDuration = this.COMBO_PAUSE_DURATION;
    this.comboSystem.pause(true); // Force pause even if no combo

    // Save end time to state
    state.comboPauseActive = true;
    state.comboPauseEndTime = now + this.COMBO_PAUSE_DURATION * 1000;
    state.comboPauseCooldownEndTime = 0; // Clear cooldown end time
    this.store.setState({ ...state });

    this.updateComboPauseButton();
    this.soundManager.playClick();
  }

  private updateComboPauseButton(): void {
    if (!this.comboPauseButton) return;

    const state = this.store.getState();
    const isUnlocked = this.ascensionSystem.isComboPauseUnlocked(state);

    if (!isUnlocked) {
      this.comboPauseButton.style.display = 'none';
      return;
    }

    this.comboPauseButton.style.display = 'block';

    const iconEl = this.comboPauseButton.querySelector(
      '.skill-icon',
    ) as HTMLElement;
    const cooldownRing = this.comboPauseButton.querySelector(
      '.skill-cooldown-ring',
    ) as HTMLElement;
    const timerEl = this.comboPauseButton.querySelector(
      '.skill-timer',
    ) as HTMLElement;

    if (!iconEl || !cooldownRing || !timerEl) return;

    if (this.comboPauseActive) {
      // Active - show remaining duration
      const minutes = Math.floor(this.comboPauseDuration / 60);
      const seconds = Math.floor(this.comboPauseDuration % 60);
      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      timerEl.style.display = 'block';

      const percent =
        (this.comboPauseDuration / this.COMBO_PAUSE_DURATION) * 100;
      cooldownRing.style.background = `conic-gradient(
        rgba(0, 170, 255, 0.3) ${percent}%,
        transparent ${percent}%
      )`;
      cooldownRing.style.display = 'block';

      this.comboPauseButton.classList.add('skill-active');
      this.comboPauseButton.classList.remove('skill-cooldown', 'skill-ready');
      this.comboPauseButton.style.cursor = 'default';
    } else if (this.comboPauseCooldown > 0) {
      // On cooldown - show cooldown time
      const minutes = Math.floor(this.comboPauseCooldown / 60);
      const seconds = Math.floor(this.comboPauseCooldown % 60);
      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      timerEl.style.display = 'block';

      const percent =
        (this.comboPauseCooldown / this.COMBO_PAUSE_COOLDOWN) * 100;
      cooldownRing.style.background = `conic-gradient(
        rgba(100, 100, 100, 0.5) ${percent}%,
        transparent ${percent}%
      )`;
      cooldownRing.style.display = 'block';

      this.comboPauseButton.classList.add('skill-cooldown');
      this.comboPauseButton.classList.remove('skill-active', 'skill-ready');
      this.comboPauseButton.style.cursor = 'not-allowed';
    } else {
      // Ready to use
      timerEl.style.display = 'none';
      cooldownRing.style.display = 'none';

      this.comboPauseButton.classList.add('skill-ready');
      this.comboPauseButton.classList.remove('skill-active', 'skill-cooldown');
      this.comboPauseButton.style.cursor = 'pointer';
    }
  }

  /**
   * Update background based on level (one background per 100 levels)
   */
  private updateBackgroundByLevel(level: number): void {
    // Calculate which background to use (1-9, one per 100 levels)
    // Level 1-100 = space1, 101-200 = space2, etc.
    // Use Math.ceil to ensure level 100 stays in space1, level 101 goes to space2
    const backgroundIndex = Math.min(Math.ceil(level / 100), 9);

    // Get the background GIF from the imported images
    const backgroundGifUrl =
      images.backgroundGifs[
      backgroundIndex as keyof typeof images.backgroundGifs
      ] || images.backgroundGif;
    const backgroundUrl = `url("${backgroundGifUrl}")`;

    // Update game container background
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      // Set background directly on the container
      gameContainer.style.backgroundImage = backgroundUrl;
      gameContainer.style.backgroundRepeat = 'repeat';
      gameContainer.style.backgroundSize = 'auto';
      gameContainer.style.backgroundColor = '#000';

      console.log(
        'Background updated by level:',
        backgroundIndex,
        backgroundUrl,
      );
    }

    // Update shop panel background to match
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      // Ensure shop panel has position relative for overlay
      if (!shopPanel.style.position) {
        shopPanel.style.position = 'relative';
      }
      // Set black background as base
      shopPanel.style.background = `#000`;

      // Create or update shop background overlay div with opacity
      let shopBgOverlay = document.getElementById('shop-background-overlay');
      if (!shopBgOverlay) {
        shopBgOverlay = document.createElement('div');
        shopBgOverlay.id = 'shop-background-overlay';
        shopBgOverlay.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${backgroundUrl};
          background-size: auto;
          opacity: 0.4;
          pointer-events: none;
          z-index: 0;
        `;
        shopPanel.insertBefore(shopBgOverlay, shopPanel.firstChild);
      } else {
        shopBgOverlay.style.background = backgroundUrl;
        shopBgOverlay.style.opacity = '0.7';
      }
    }
  }

  private performAscension(): void {
    // Always play ascension animation
    this.startAscensionAnimation();
    // Animation will call performAscensionInternal when done
  }

  private performAscensionInternal(): void {
    const state = this.store.getState();

    // Reset damage batch efficiently
    this.damageBatch.damage = 0;
    this.damageBatch.isCrit = false;
    this.damageBatch.isFromShip = false;
    this.damageBatch.clickDamage = 0;
    this.damageBatch.hitDirection = undefined;
    this.damageBatch.isBeam = false;
    this.batchTimer = 0;

    // Calculate prestige points to gain
    const prestigeGain = this.ascensionSystem.calculatePrestigePoints(state);

    // Update highest level reached before resetting
    const newHighestLevel = Math.max(
      state.level,
      state.highestLevelReached ?? 0,
    );

    // Save what we're keeping (ONLY achievements, stats, and prestige)
    const keepAchievements = { ...state.achievements };
    const keepStats = { ...state.stats };
    const keepPrestigeUpgrades = { ...state.prestigeUpgrades };
    const keepAutoBuyEnabled = state.autoBuyEnabled ?? false; // Preserve user preference
    const keepSelectedThemes = state.selectedThemes; // Preserve visual customization
    const newPrestigePoints = state.prestigePoints + prestigeGain;
    const newPrestigeLevel = state.prestigeLevel + 1;

    const retainedUpgrades = this.calculateRetainedUpgrades(state);

    // Update prestige stats
    keepStats.totalPrestige = newPrestigeLevel;

    // Get starting level from prestige upgrades
    const startingLevel = this.ascensionSystem.getStartingLevel(state);

    // Reset totalSubUpgrades in stats (special upgrades are reset)
    keepStats.totalSubUpgrades = 0;

    // Create a completely fresh state (NOT from save file)
    const freshState: import('./types').GameState = {
      points: 0,
      shipsCount: retainedUpgrades.shipsCount,
      attackSpeedLevel: retainedUpgrades.attackSpeedLevel,
      autoFireUnlocked: retainedUpgrades.autoFireUnlocked,
      pointMultiplierLevel: retainedUpgrades.pointMultiplierLevel,
      critChanceLevel: retainedUpgrades.critChanceLevel,
      resourceGenLevel: retainedUpgrades.resourceGenLevel,
      xpBoostLevel: retainedUpgrades.xpBoostLevel,
      level: startingLevel,
      experience: 0,
      subUpgrades: {}, // Reset all special upgrades on ascension
      achievements: keepAchievements, // Keep achievements
      stats: keepStats, // Keep stats (with totalSubUpgrades reset)
      prestigeLevel: newPrestigeLevel,
      prestigePoints: newPrestigePoints,
      prestigeUpgrades: keepPrestigeUpgrades, // Keep prestige upgrades
      blockedOnBossLevel: null, // Reset boss block on ascension
      // v3.0: New upgrades (reset on ascension)
      mutationEngineLevel: retainedUpgrades.mutationEngineLevel,
      energyCoreLevel: retainedUpgrades.energyCoreLevel,
      cosmicKnowledgeLevel: retainedUpgrades.cosmicKnowledgeLevel,
      discoveredUpgrades: { ship: true }, // Reset discoveries, ship always visible
      // Track highest level for ascension point calculation
      highestLevelReached: newHighestLevel,
      // Preserve user preferences (unlocks are in prestigeUpgrades)
      autoBuyEnabled: keepAutoBuyEnabled,
      selectedThemes: keepSelectedThemes,
      // Combo pause state: reset on ascension (but unlock remains in prestigeUpgrades)
      comboPauseActive: false,
      comboPauseEndTime: 0,
      comboPauseCooldownEndTime: 0,
    };

    // Clear local boss block state
    this.blockedOnBossLevel = null;
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    this.store.setState(freshState);
    Save.save(this.store.getState());

    // Check achievements after ascension (e.g., first ascension achievement)
    this.achievementSystem.checkAchievements(freshState);

    // Update background based on new starting level
    this.updateBackgroundByLevel(freshState.level);

    // Reset shop UI
    this.shop.reset();

    // Reinitialize game
    this.mode = 'normal';
    this.createBall();
    this.createShips();
    this.laserSystem.clear();
    this.particleSystem.clear();
    this.damageNumberSystem.clear();
    this.comboSystem.reset();
    this.autoFireSystem.reset();
    this.powerUpSystem.clear();
    this.saveTimer = 0;

    // Reset combo pause skill state and update button (to show if unlocked)
    this.comboPauseActive = false;
    this.comboPauseDuration = 0;
    this.comboPauseCooldown = 0;
    this.updateComboPauseButton();
  }

  private startAscensionAnimation(): void {
    this.isAscensionAnimating = true;
    this.ascensionAnimationTime = 0;

    // Close ascension modal
    this.ascensionModal.hide();

    // Spawn massive particle explosion from center
    const centerX = this.canvas.getCenterX();
    const centerY = this.canvas.getCenterY();

    if (this.userSettings.highGraphics) {
      // Multiple waves of particles
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.particleSystem.spawnExplosion(
            centerX,
            centerY,
            '#ffffff',
            true,
            'sparkle',
          );
          this.particleSystem.spawnParticles({
            x: centerX,
            y: centerY,
            count: 50,
            color: '#ffff00',
            spread: Math.PI * 2,
            speed: 300 + Math.random() * 200,
            size: 6,
            life: 2,
            glow: true,
            style: 'sparkle',
          });
        }, i * 100);
      }
    }
  }

  private renderAscensionAnimation(ctx: CanvasRenderingContext2D): void {
    const animationDuration = 2.5;
    const progress = Math.min(1, this.ascensionAnimationTime / animationDuration);

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
    ctx.fillRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());

    // Draw golden/yellow glow in center
    const centerX = this.canvas.getCenterX();
    const centerY = this.canvas.getCenterY();
    const maxRadius = Math.max(this.canvas.getWidth(), this.canvas.getHeight());

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
    ctx.fillRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
  }

  private calculateRetainedUpgrades(state: import('./types').GameState): {
    shipsCount: number;
    attackSpeedLevel: number;
    pointMultiplierLevel: number;
    critChanceLevel: number;
    resourceGenLevel: number;
    xpBoostLevel: number;
    mutationEngineLevel: number;
    energyCoreLevel: number;
    cosmicKnowledgeLevel: number;
    autoFireUnlocked: boolean;
  } {
    const baseline = {
      shipsCount: 1,
      attackSpeedLevel: 0,
      pointMultiplierLevel: 0,
      critChanceLevel: 0,
      resourceGenLevel: 0,
      xpBoostLevel: 0,
      mutationEngineLevel: 0,
      energyCoreLevel: 0,
      cosmicKnowledgeLevel: 0,
      autoFireUnlocked: false,
    };

    const retainPercent = Math.min(
      1,
      Math.max(0, this.ascensionSystem.getRetainPercentage(state)),
    );

    if (retainPercent <= 0) {
      return baseline;
    }

    const retainLevel = (value: number): number => {
      if (value <= 0) return 0;
      // Use Math.round for balanced percentage calculation
      // This ensures 10% retention means approximately 10% of levels are retained
      const retained = Math.round(value * retainPercent);
      return Math.min(value, Math.max(0, retained));
    };

    const retainWithBase = (value: number, base: number): number => {
      if (value <= base) {
        return base;
      }
      const extra = value - base;
      // Use Math.round for balanced percentage calculation
      const retainedExtra = Math.round(extra * retainPercent);
      return base + Math.min(extra, Math.max(0, retainedExtra));
    };

    const shipsCount = retainWithBase(state.shipsCount, 1);

    return {
      shipsCount,
      attackSpeedLevel: retainLevel(state.attackSpeedLevel),
      pointMultiplierLevel: retainLevel(state.pointMultiplierLevel),
      critChanceLevel: retainLevel(state.critChanceLevel),
      resourceGenLevel: retainLevel(state.resourceGenLevel),
      xpBoostLevel: retainLevel(state.xpBoostLevel),
      mutationEngineLevel: retainLevel(state.mutationEngineLevel),
      energyCoreLevel: retainLevel(state.energyCoreLevel),
      cosmicKnowledgeLevel: retainLevel(state.cosmicKnowledgeLevel),
      autoFireUnlocked: state.autoFireUnlocked && retainPercent > 0,
    };
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());

      // Keyboard shortcuts (only when not typing in input fields)
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return; // Don't trigger shortcuts when typing
      }

      // Handle shortcuts
      if (event.key === 'Escape') {
        // Close any open modals
        this.achievementsModal.hide();
        this.ascensionModal.hide();
        this.missionsModal.hide();
        this.artifactsModal.hide();
        this.statsPanel.hide();
        this.settingsModal.hide();
        this.creditsModal.hide();
        this.gameInfoModal.hide();
        this.thankYouModal.hide();
      } else if (event.key === 'a' || event.key === 'A') {
        // Toggle auto-buy
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          const state = this.store.getState();
          state.autoBuyEnabled = !(state.autoBuyEnabled ?? false);
          this.store.setState(state);
          // Show notification
          this.notificationSystem.show(
            state.autoBuyEnabled
              ? '🤖 Auto-Buy Enabled'
              : '🤖 Auto-Buy Disabled',
            'info',
            2000,
          );
        }
      } else if (event.key === 'm' || event.key === 'M') {
        // Open missions modal
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.missionsModal.show();
        }
      } else if (event.key === 's' || event.key === 'S') {
        // Open settings modal
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.settingsModal.show();
        }
      } else if (event.key === 'h' || event.key === 'H') {
        // Open achievements modal
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.achievementsModal.show();
        }
      } else if (event.key === 'p' || event.key === 'P') {
        // Open prestige/ascension modal
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.ascensionModal.show();
        }
      } else if (event.key === 'i' || event.key === 'I') {
        // Open game info modal
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.gameInfoModal.show();
        }
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  private initGame(): void {
    const state = this.store.getState();

    // Check if player is blocked by a boss (lost previously)
    const isBlockedByBoss =
      state.blockedOnBossLevel !== undefined &&
      state.blockedOnBossLevel !== null;

    // Check if player is currently on a boss level
    const isOnBossLevel = ColorManager.isBossLevel(state.level);

    if (isBlockedByBoss) {
      // Player lost to boss previously - show retry button and normal mode
      this.blockedOnBossLevel = state.blockedOnBossLevel ?? null;
      this.mode = 'normal';
      this.createBall();
      this.createShips();

      // Show retry button
      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'block';
      }
    } else if (isOnBossLevel) {
      // Player is on a boss level and NOT blocked = they refreshed during boss fight
      // Treat this as a loss - apply penalties
      const expRequired = ColorManager.getExpRequired(state.level);
      const xpLoss = Math.floor(expRequired * 0.5); // 50% XP loss
      state.experience = Math.max(0, state.experience - xpLoss);

      // Block progression until boss is defeated
      this.blockedOnBossLevel = state.level;
      state.blockedOnBossLevel = state.level;

      // Save the penalized state
      this.store.setState(state);

      // Normal mode with aliens
      this.mode = 'normal';
      this.createBall();
      this.createShips();

      // Show retry button
      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'block';
      }

      // Show loss message
      this.hud.showMessage(
        `💀 Boss Fight Lost (Refresh)\n-${xpLoss.toString()} XP`,
        '#ff4444',
        3000,
      );
    } else {
      // Normal initialization
      this.createBall();
      this.createShips();
    }

    this.hud.update(state.points);
    this.hud.updateLevel(
      state.level,
      state.experience,
      ColorManager.getExpRequired(state.level),
    );
    this.updateBackgroundByLevel(state.level);

    // Restore combo pause skill state
    this.restoreComboPauseState();
  }

  private createBall(): void {
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const radius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.08;
    const state = this.store.getState();

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
    // No callback needed here anymore

    this.ball = enhancedBall;
    this.bossBall = null;
  }

  private createBoss(): void {
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    // Boss is 50% bigger than normal aliens
    const radius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.15;
    const state = this.store.getState();
    // Make bosses 3x harder than before to match time limit challenge
    const baseHp = ColorManager.getBossHp(state.level);
    const hp = Math.floor(baseHp * 3);

    // Determine boss variant based on level
    // Level 25 -> 0 (Colossus)
    // Level 50 -> 1 (Swarm Queen)
    // Level 75 -> 2 (Void Construct)
    // Level 100 -> 3 (Omega Core)
    // Level 125 -> 0 (Cycle)
    let bossVariant = 0;
    if (state.level >= 25) {
      const bossIndex = Math.floor((state.level - 25) / 25);
      bossVariant = bossIndex % 4;
    }

    this.bossBall = new BossBall(cx, cy, radius, hp, bossVariant);
    this.ball = null;
  }

  private createShips(): void {
    const state = this.store.getState();
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const orbitRadius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.4;

    // Destroy old ships and clean up their image elements before creating new ones
    for (const ship of this.ships) {
      ship.destroy();
    }

    this.ships = [];
    for (let i = 0; i < state.shipsCount; i++) {
      // Random angle for each ship instead of perfect circle
      const angle = Math.random() * Math.PI * 2;
      const isMain = i === 0;
      // Random radius for each ship
      const randomRadius = orbitRadius * (0.7 + Math.random() * 0.6); // 70% to 130% of base radius
      this.ships.push(new Ship(angle, cx, cy, randomRadius, isMain));
    }
    this.autoFireSystem.setShipCount(state.shipsCount);
  }

  private setupInput(): void {
    this.input.onClick((pos) => {
      this.handleClick(pos);
    });
    this.store.subscribe(() => {
      const state = this.store.getState();
      if (this.ships.length !== state.shipsCount) {
        this.createShips();
      }
      this.hud.update(state.points);
      this.hud.updateLevel(
        state.level,
        state.experience,
        ColorManager.getExpRequired(state.level),
      );
    });
  }

  private setupAutoSave(): void {
    window.addEventListener('beforeunload', () => {
      const state = this.store.getState();
      Save.save(state);
    });
  }

  private handleClick(pos: Vec2): void {
    if (this.mode === 'transition') return;

    // ALWAYS check for power-up collection first with highest priority
    // This ensures power-ups can be clicked even if other elements are in the way
    const collectedPowerUp = this.powerUpSystem.checkCollision(pos.x, pos.y);
    if (collectedPowerUp) {
      this.soundManager.playClick();

      // Power-up pickup notification removed

      // Spawn collection particles
      if (this.userSettings.highGraphics) {
        // Apply particle theme if available
        const particleTheme = this.customizationSystem.getParticleStyle();
        const particleStyle = particleTheme.style as
          | 'classic'
          | 'glow'
          | 'sparkle'
          | 'trail';
        const particleColor = particleTheme.colors.primary;
        const useGlow = particleStyle === 'glow' || particleStyle === 'sparkle';

        this.particleSystem.spawnParticles({
          x: pos.x,
          y: pos.y,
          count: 15,
          color: particleColor,
          spread: Math.PI * 2,
          speed: 200,
          size: 4,
          life: 0.8,
          glow: useGlow,
          style: particleStyle,
        });
      }

      // Refresh shop immediately when power-up is collected (to show updated stats)
      this.shop.forceRefresh();

      const activeBuffs = this.powerUpSystem.getActiveBuffs();
      this.lastPowerUpCount = activeBuffs.length;
      this.lastHadSpeedBuff = activeBuffs.some((b) => b.type === 'speed');
      this.lastHadDamageBuff = activeBuffs.some((b) => b.type === 'damage');

      return; // Don't fire when collecting power-up - power-ups have highest priority
    }

    // Click anywhere to shoot - much better for mobile!
    const state = this.store.getState();
    if (this.mode === 'normal' && this.ball && this.ball.currentHp > 0) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit(state);
      this.fireVolley();
    } else if (
      this.mode === 'boss' &&
      this.bossBall &&
      this.bossBall.currentHp > 0
    ) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit(state);
      // Boss mode now uses same firing as normal mode
      this.fireVolley();
    }
  }

  private calculateTotalBeamDamage(state: import('./types').GameState): number {
    // Calculate auto-fire damage for all ships (excluding main ship)
    // Main ship doesn't use beams - it fires regular projectiles for click feedback
    let autoFireDamage = this.upgradeSystem.getAutoFireDamage(state);
    // Same artifact bonus as clicks for 1:1 damage
    autoFireDamage *= 1 + this.artifactSystem.getDamageBonus();

    if (this.mode === 'boss') {
      const prestigeBossLevel =
        state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      autoFireDamage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      autoFireDamage *= voidHeartBonus;
    }

    // Total damage = only auto-fire ships (main ship uses regular projectiles)
    const totalShips = Math.max(1, this.ships.length);
    const autoFireShips = totalShips - 1; // Exclude main ship

    return autoFireDamage * autoFireShips;
  }

  private getEnemyXpScaling(level: number): number {
    if (level <= 30) {
      return 1;
    }

    const extraLevels = level - 30;
    const linearDrop = 1 / (1 + extraLevels * 0.02);
    const exponentialDrop = Math.pow(0.995, Math.min(extraLevels, 600));
    const combined = linearDrop * exponentialDrop;

    return Math.max(0.15, combined);
  }

  private fireVolley(): void {
    const state = this.store.getState();

    // Main ship always fires regular projectiles (even in beam mode)
    // This provides click feedback and visual variety
    // Use getPointsPerHit to ensure clicks and ships deal the same base damage
    // Note: Perfect Precision is now handled in handleDamage() to ensure it's checked once per hit
    let damage = this.upgradeSystem.getPointsPerHit(state);

    // v2.0: Apply artifact bonuses
    damage *= 1 + this.artifactSystem.getDamageBonus();

    // Apply power-up damage multiplier
    damage *= this.powerUpSystem.getDamageMultiplier();

    // Apply boss damage bonus in boss mode
    if (this.mode === 'boss') {
      const prestigeBossLevel =
        state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      damage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      damage *= voidHeartBonus;
    }

    // Don't fire if there's no valid target
    const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
    if (!targetEntity || targetEntity.currentHp <= 0) {
      return; // No target to shoot at
    }

    const targetCenter = { x: targetEntity.x, y: targetEntity.y };
    const targetRadius =
      'radius' in targetEntity && typeof targetEntity.radius === 'number'
        ? targetEntity.radius
        : 0;
    const laserVisuals = this.getLaserVisuals(state);

    // Update laser theme ID based on special upgrades
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const laserThemeId = this.customizationSystem.getLaserThemeId(state);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.laserSystem.lastBeamThemeId = laserThemeId;

    // Only fire from the main ship (index 0) when clicking
    if (this.ships[0]) {
      // Calculate base shot count
      let shotCount = 1; // Main ship always fires 1

      // Multishot power-up: doubles all shots
      if (this.powerUpSystem.hasMultishot()) {
        shotCount *= 2;
      }

      // Fire the calculated number of shots
      const shipsToUse: Ship[] = [this.ships[0]]; // Start with main ship
      if (this.ships.length > 1) {
        // Add other ships to the pool
        shipsToUse.push(...this.ships.slice(1));
      }

      // Fire shots, cycling through available ships
      for (let i = 0; i < shotCount; i++) {
        const shipIndex = i % shipsToUse.length;
        const ship = shipsToUse[shipIndex];
        if (ship) {
          const origin = ship.getFrontPosition();
          const hitPoint =
            targetRadius > 0
              ? this.calculateHitPoint(origin, targetCenter, targetRadius)
              : targetCenter;
          this.laserSystem.spawnLaser(origin, hitPoint, damage, laserVisuals);
        }
      }
    }

    // v2.0: Track mission progress
    this.missionSystem.trackClick();

    // Visual effects (particles) are now handled in applyDamageBatch
    // to avoid duplicates and properly differentiate main ship vs auto-fire ship damage
  }

  private fireSingleShip(shipIndex: number): boolean {
    if (shipIndex >= this.ships.length) return false;
    const ship = this.ships[shipIndex];
    if (!ship) return false;

    // Check if we're in beam mode
    const isBeamMode = this.laserSystem.isBeamMode();

    // In beam mode, do nothing - beams are persistent and handled in update loop
    if (isBeamMode) {
      // Don't fire if there's no valid target
      const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
      if (!targetEntity || targetEntity.currentHp <= 0) {
        return false;
      }
      return true; // Beam exists, shot is "fired"
    }

    // Regular projectile mode
    const state = this.store.getState();
    // Use auto-fire damage - now same as clicks (1:1 damage)
    let damage = this.upgradeSystem.getAutoFireDamage(state);

    // v2.0: Apply artifact bonuses (same as clicks for 1:1 damage)
    damage *= 1 + this.artifactSystem.getDamageBonus();

    // Apply power-up damage multiplier
    damage *= this.powerUpSystem.getDamageMultiplier();

    // Apply boss damage bonus in boss mode
    if (this.mode === 'boss') {
      const prestigeBossLevel =
        state.prestigeUpgrades?.prestige_boss_power ?? 0;
      const bossDamageBonus = 1 + prestigeBossLevel * 0.2;
      damage *= bossDamageBonus;

      const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1;
      damage *= voidHeartBonus;
    }

    // Don't fire if there's no valid target
    const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
    if (!targetEntity || targetEntity.currentHp <= 0) {
      return false; // No target to shoot at - don't reset timer
    }

    const origin = ship.getFrontPosition();
    const center = { x: targetEntity.x, y: targetEntity.y };
    const hitPoint = this.calculateHitPoint(
      origin,
      center,
      targetEntity.radius,
    );

    // Small ships (shipIndex > 0) cannot crit - use non-crit visuals only
    const laserVisuals =
      shipIndex > 0
        ? this.getLaserVisualsNoCrit(state)
        : this.getLaserVisuals(state);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const laserThemeId = this.customizationSystem.getLaserThemeId(state);

    // Store theme ID for laser rendering
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.laserSystem.lastBeamThemeId = laserThemeId;

    // Mark laser as from ship so it can be hidden for performance
    this.laserSystem.spawnLaser(origin, hitPoint, damage, {
      ...laserVisuals,
      isFromShip: true,
    });

    return true; // Shot was fired successfully
  }

  private calculateHitPoint(origin: Vec2, center: Vec2, radius: number): Vec2 {
    // Use pixel-perfect raycasting
    // We need to determine the sprite type.
    // Since this method is generic for any target, and we don't pass the entity itself easily here without refactoring,
    // we can assume 'normal' for now or try to infer.
    // Ideally, we should pass the entity to this method, but to avoid breaking changes, we'll use the default sprite.
    // Most aliens use the same 11x11 grid structure roughly, so ALIEN_SPRITE_NORMAL is a good approximation for all.
    // If we have the target entity available in scope (which we do in fireSingleShip), we could pass it.

    // However, looking at fireSingleShip, we call this with targetEntity.radius.
    // Let's stick to the new utility function.

    // Determine sprite based on context if possible, otherwise default
    // For now, using the default normal sprite covers most cases well enough for "shape"
    return getPixelHitPoint(origin, center, radius);
  }

  private getLaserVisuals(state: import('./types').GameState): {
    isCrit: boolean;
    color: string;
    width: number;
  } {
    let color = this.customizationSystem.getLaserColor(state, false);
    let width = 1.5; // Reduced from 2.5 for thinner lasers
    let isCrit = false;

    let critChance = this.upgradeSystem.getCritChance(state);
    critChance += this.powerUpSystem.getCritChanceBonus() * 100;
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      color = '#ffff00';
      width = 2.0; // Reduced from 3.5 for thinner crit lasers
      this.store.getState().stats.criticalHits++;
      return { isCrit, color, width };
    }

    // Apply special upgrade visual effects to lasers (priority order - most powerful first)
    // Legendary tier upgrades - thinner widths
    if (state.subUpgrades['cosmic_ascension']) {
      color = '#00ffff'; // Cyan for cosmic
      width = 2.2;
    } else if (state.subUpgrades['reality_anchor']) {
      color = '#ffffff'; // Pure white for reality
      width = 2.1;
    } else if (state.subUpgrades['infinity_gauntlet']) {
      color = '#ff1493'; // Hot pink for infinity
      width = 2.15;
    } else if (state.subUpgrades['meaning_of_life']) {
      color = '#00ffff'; // Cyan for meaning
      width = 2.0;
    } else if (state.subUpgrades['heart_of_galaxy']) {
      color = '#ff0044'; // Deep red for heart
      width = 1.95;
    } else if (state.subUpgrades['singularity_core']) {
      color = '#000000'; // Black with glow for singularity
      width = 2.25;
    }
    // Epic tier upgrades
    else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff00ff'; // Magenta for antimatter
      width = 1.85;
    } else if (state.subUpgrades['photon_amplifier']) {
      color = '#00ffff'; // Cyan for photon
      width = 1.9;
    } else if (state.subUpgrades['stellar_forge']) {
      color = '#ffaa00'; // Gold for stellar
      width = 1.95;
    } else if (state.subUpgrades['hyper_reactor']) {
      color = '#ff0080'; // Pink for hyper
      width = 1.8;
    } else if (state.subUpgrades['dark_matter_engine']) {
      color = '#4b0082'; // Indigo for dark matter
      width = 1.9;
    } else if (state.subUpgrades['antimatter_cascade']) {
      color = '#ff00aa'; // Bright magenta for cascade
      width = 1.85;
    } else if (state.subUpgrades['quantum_entanglement']) {
      color = '#00ff88'; // Green for quantum
      width = 1.75;
    } else if (state.subUpgrades['plasma_matrix']) {
      color = '#ff4400'; // Red-orange for plasma
      width = 1.8;
    } else if (state.subUpgrades['nebula_harvester']) {
      color = '#00ffff'; // Cyan for nebula
      width = 1.75;
    } else if (state.subUpgrades['cosmic_battery']) {
      color = '#4169e1'; // Royal blue for cosmic battery
      width = 1.7;
    }
    // Rare tier upgrades
    else if (state.subUpgrades['laser_focusing']) {
      color = '#ff6600'; // Orange for focused laser
      width = 1.65;
    } else if (state.subUpgrades['warp_core']) {
      color = '#00ffff'; // Cyan for warp
      width = 1.7;
    } else if (state.subUpgrades['chaos_emeralds']) {
      color = '#00ff88'; // Emerald green for chaos
      width = 1.65;
    } else if (state.subUpgrades['void_channeling']) {
      color = '#00ffff'; // Cyan for void
      width = 1.7;
    } else if (state.subUpgrades['nanobots']) {
      color = '#00ff00'; // Bright green for nanobots
      width = 1.6;
    } else if (state.subUpgrades['nuclear_reactor']) {
      color = '#ffff00'; // Yellow for nuclear
      width = 1.65;
    }

    // Perfect precision visual effect is now handled in handleDamage()
    // The visual check here is kept for consistency, but actual damage multiplier
    // is applied in handleDamage() to ensure it's only checked once per hit
    // Note: Perfect Precision will show as a crit visually when it triggers

    return { isCrit, color, width };
  }

  private getLaserVisualsNoCrit(state: import('./types').GameState): {
    isCrit: boolean;
    color: string;
    width: number;
  } {
    // Small ships cannot crit - always return non-crit visuals
    let color = this.customizationSystem.getLaserColor(state, false);
    let width = 1.5; // Reduced from 2.5 for thinner lasers

    // Apply special upgrade visual effects to lasers (same as main ship - priority order)
    // Legendary tier upgrades - thinner widths
    if (state.subUpgrades['cosmic_ascension']) {
      color = '#00ffff'; // Cyan for cosmic
      width = 2.2;
    } else if (state.subUpgrades['reality_anchor']) {
      color = '#ffffff'; // Pure white for reality
      width = 2.1;
    } else if (state.subUpgrades['infinity_gauntlet']) {
      color = '#ff1493'; // Hot pink for infinity
      width = 2.15;
    } else if (state.subUpgrades['meaning_of_life']) {
      color = '#00ffff'; // Cyan for meaning
      width = 2.0;
    } else if (state.subUpgrades['heart_of_galaxy']) {
      color = '#ff0044'; // Deep red for heart
      width = 1.95;
    } else if (state.subUpgrades['singularity_core']) {
      color = '#000000'; // Black with glow for singularity
      width = 2.25;
    }
    // Epic tier upgrades
    else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff00ff'; // Magenta for antimatter
      width = 1.85;
    } else if (state.subUpgrades['photon_amplifier']) {
      color = '#00ffff'; // Cyan for photon
      width = 1.9;
    } else if (state.subUpgrades['stellar_forge']) {
      color = '#ffaa00'; // Gold for stellar
      width = 1.95;
    } else if (state.subUpgrades['hyper_reactor']) {
      color = '#ff0080'; // Pink for hyper
      width = 1.8;
    } else if (state.subUpgrades['dark_matter_engine']) {
      color = '#4b0082'; // Indigo for dark matter
      width = 1.9;
    } else if (state.subUpgrades['antimatter_cascade']) {
      color = '#ff00aa'; // Bright magenta for cascade
      width = 1.85;
    } else if (state.subUpgrades['quantum_entanglement']) {
      color = '#00ff88'; // Green for quantum
      width = 1.75;
    } else if (state.subUpgrades['plasma_matrix']) {
      color = '#ff4400'; // Red-orange for plasma
      width = 1.8;
    } else if (state.subUpgrades['nebula_harvester']) {
      color = '#00ffff'; // Cyan for nebula
      width = 1.75;
    } else if (state.subUpgrades['cosmic_battery']) {
      color = '#4169e1'; // Royal blue for cosmic battery
      width = 1.7;
    }
    // Rare tier upgrades
    else if (state.subUpgrades['laser_focusing']) {
      color = '#ff6600'; // Orange for focused laser
      width = 1.65;
    } else if (state.subUpgrades['warp_core']) {
      color = '#00ffff'; // Cyan for warp
      width = 1.7;
    } else if (state.subUpgrades['chaos_emeralds']) {
      color = '#00ff88'; // Emerald green for chaos
      width = 1.65;
    } else if (state.subUpgrades['void_channeling']) {
      color = '#00ffff'; // Cyan for void
      width = 1.7;
    } else if (state.subUpgrades['nanobots']) {
      color = '#00ff00'; // Bright green for nanobots
      width = 1.6;
    } else if (state.subUpgrades['nuclear_reactor']) {
      color = '#ffff00'; // Yellow for nuclear
      width = 1.65;
    }

    return { isCrit: false, color, width };
  }

  private handleDamage(
    damage: number,
    isCrit: boolean = false,
    isFromShip: boolean = false,
    hitDirection?: Vec2,
    isBeam?: boolean,
  ): void {
    // Notify tutorial system of click/damage
    if (!isFromShip && !isBeam) {
      this.tutorialSystem.onAlienClicked();
    }

    let finalDamage = damage;
    const state = this.store.getState();

    // Perfect precision: 5% chance for 10x damage (only for main ship clicks, not auto-fire)
    // Check once per actual hit here, not in getPointsPerHit which is called multiple times
    let perfectPrecisionTriggered = false;
    if (!isFromShip && state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        finalDamage *= 10;
        perfectPrecisionTriggered = true;
        isCrit = true; // Mark as crit for visual effects
      }
    }

    // Apply critical damage multiplier (only if not from Perfect Precision, which already gives 10x)
    if (isCrit && !perfectPrecisionTriggered) {
      const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
      finalDamage *= critMultiplier;
    }

    // Apply combo multiplier (works in all modes now!)
    const comboMult = this.comboSystem.getMultiplier(this.store.getState());
    finalDamage *= comboMult;

    // Scout enemies evade ship fire - reduce auto-fire damage significantly
    if (this.ball instanceof EnhancedAlienBall && !isBeam) {
      if (isFromShip && this.ball.enemyType === 'scout') {
        finalDamage *= 0.5;
      } else if (!isFromShip && this.ball.enemyType === 'guardian') {
        finalDamage *= 0.5;
      }
    }

    // Record damage for DPS calculation
    this.hud.recordDamage(finalDamage);

    // v2.0: Track damage and combo for missions
    this.missionSystem.trackDamage(finalDamage);
    this.missionSystem.trackCombo(this.comboSystem.getCombo());

    // Batch damage instead of applying immediately - reuse pre-allocated object
    this.damageBatch.damage += finalDamage;
    if (isCrit) {
      // Show crit effects for all ships (main ship and small ships)
      this.damageBatch.isCrit = true;
    }

    // Track if this batch includes ship damage to skip visual effects
    if (isFromShip) {
      this.damageBatch.isFromShip = true;
    } else {
      // Track click damage separately so we can spawn particles even if mixed with auto-fire
      this.damageBatch.clickDamage += finalDamage;
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

  private applyDamageBatch(): void {
    if (this.damageBatch.damage <= 0) return;

    // Copy batch data (reuse object structure)
    const finalDamage = this.damageBatch.damage;
    const isCrit = this.damageBatch.isCrit;
    const isFromShip = this.damageBatch.isFromShip;
    const clickDamage = this.damageBatch.clickDamage;
    const hitDirection = this.damageBatch.hitDirection;
    const isBeam = this.damageBatch.isBeam;

    // Reset batch state efficiently (reuse object, just clear values)
    this.damageBatch.damage = 0;
    this.damageBatch.isCrit = false;
    this.damageBatch.isFromShip = false;
    this.damageBatch.clickDamage = 0;
    this.damageBatch.hitDirection = undefined;
    this.damageBatch.isBeam = false;

    if (this.mode === 'normal' && this.ball && this.ball.currentHp > 0) {
      // Get current combo for deformation scaling
      const currentCombo = this.comboSystem.getCombo();
      // Check if this batch is from a beam (stored in batch state)
      const broken = this.ball.takeDamage(
        finalDamage,
        hitDirection,
        currentCombo,
        isBeam,
      );

      // Apply points multiplier for enhanced aliens
      let pointsEarned = finalDamage;
      if (this.ball instanceof EnhancedAlienBall) {
        pointsEarned = this.ball.getPointsReward(pointsEarned);
      }
      // Apply power-up points multiplier
      pointsEarned *= this.powerUpSystem.getPointsMultiplier();
      this.store.addPoints(pointsEarned);

      // Always show damage numbers (for both main ship and auto-fire ships)
      this.damageNumberSystem.spawnDamageNumber(
        this.ball.x,
        this.ball.y - this.ball.radius - 20,
        finalDamage,
        isCrit,
      );

      // Spawn particles for hits - always spawn if there's click damage, or if no auto-fire damage
      // Particles (only if high graphics enabled)
      if (this.userSettings.highGraphics) {
        // Spawn particles if there's click damage, or if this is purely click damage (not from auto-fire ships)
        const hasClickDamage = clickDamage > 0;
        const shouldSpawnParticles = hasClickDamage || !isFromShip;

        if (shouldSpawnParticles) {
          // Apply particle theme
          const particleTheme = this.customizationSystem.getParticleStyle();
          const particleStyle = particleTheme.style as
            | 'classic'
            | 'glow'
            | 'sparkle'
            | 'trail';
          const themeParticleColor =
            particleStyle === 'sparkle'
              ? (particleTheme.colors.secondary ?? particleTheme.colors.primary)
              : particleTheme.colors.primary;
          const useGlow =
            particleStyle === 'glow' ||
            particleStyle === 'sparkle' ||
            this.ball instanceof EnhancedAlienBall;

          // Use click damage if available, otherwise use total damage
          // Spawn more particles for clicks, fewer for pure auto-fire
          const damageForParticles = hasClickDamage ? clickDamage : finalDamage;
          const baseCount = hasClickDamage ? 2 : 1; // Reduced particle count
          const damageCount = Math.floor(damageForParticles / 200); // Higher threshold (less particles)
          const particleCount = Math.max(
            baseCount,
            Math.min(5, baseCount + damageCount), // Much lower max
          );

          this.particleSystem.spawnParticles({
            x: this.ball.x,
            y: this.ball.y,
            count: particleCount,
            color: themeParticleColor,
            speed: 80,
            size: 1.5, // Smaller particles
            life: 0.5, // Shorter life
            glow: useGlow,
            style: particleStyle,
          });
        }
      }

      if (broken) {
        // Spawn explosion particles
        if (this.userSettings.highGraphics) {
          this.particleSystem.spawnExplosion(
            this.ball.x,
            this.ball.y,
            this.ball.color.fill,
            true,
            this.customizationSystem.getParticleStyle().style as any,
          );
        }

        let killReward = this.ball.maxHp;
        if (this.ball instanceof EnhancedAlienBall) {
          killReward = this.ball.getPointsReward(killReward);
        }
        // Apply artifact points bonus
        killReward *= 1 + this.artifactSystem.getPointsBonus();

        if (this.midasActive) {
          killReward *= 10;
          this.midasActive = false;
          this.hud.showMessage('MIDAS BONUS!', '#ffd700');
        }
        killReward *= this.powerUpSystem.getPointsMultiplier();
        const roundedReward = Math.max(1, Math.floor(killReward));
        // Record kill reward for points per second calculation
        this.hud.recordKillReward(roundedReward);
        this.store.addPoints(roundedReward);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.hud.showPointsGain(roundedReward);

        // Chance to spawn power-up (1% chance - very rare, like Cookie Clicker golden cookies)
        let spawnPowerUp = Math.random() < 0.01;
        if (
          this.ball instanceof EnhancedAlienBall &&
          this.ball.enemyType === 'hoarder'
        ) {
          spawnPowerUp = true;
        }
        if (spawnPowerUp) {
          const powerUpX = this.ball.x + (Math.random() - 0.5) * 100;
          const powerUpY = this.ball.y + (Math.random() - 0.5) * 100;
          this.spawnPowerUp(powerUpX, powerUpY);
        }
        this.onBallDestroyed();
      }
    } else if (
      this.mode === 'boss' &&
      this.bossBall &&
      this.bossBall.currentHp > 0
    ) {
      if (this.bossTimeoutHandled) {
        return;
      }
      const broken = this.bossBall.takeDamage(finalDamage);
      const state = this.store.getState();
      const bossBonus = state.subUpgrades['alien_cookbook'] ? 2 : 1;
      // Apply power-up points multiplier
      const pointsMultiplier = this.powerUpSystem.getPointsMultiplier();
      this.store.addPoints(finalDamage * 2 * bossBonus * pointsMultiplier);

      // Always spawn damage numbers (for both main ship and auto-fire ships)
      const bossPos = this.bossBall.getPosition();
      this.damageNumberSystem.spawnDamageNumber(
        bossPos.x,
        bossPos.y - this.bossBall.radius - 40,
        finalDamage,
        isCrit,
      );

      // Only spawn particles for main ship hits (not auto-fire ships)
      if (!isFromShip) {
        // Spawn hit particles occasionally (only if high graphics)
        if (this.userSettings.highGraphics && Math.random() < 0.3) {
          // Apply particle theme
          const particleTheme = this.customizationSystem.getParticleStyle();
          const particleStyle = particleTheme.style as
            | 'classic'
            | 'glow'
            | 'sparkle'
            | 'trail';
          const themeParticleColor =
            isCrit && particleStyle === 'sparkle'
              ? (particleTheme.colors.secondary ?? particleTheme.colors.primary)
              : particleTheme.colors.primary;
          const useGlow =
            particleStyle === 'glow' || particleStyle === 'sparkle';

          this.particleSystem.spawnParticles({
            x: bossPos.x + (Math.random() - 0.5) * this.bossBall.radius,
            y: bossPos.y + (Math.random() - 0.5) * this.bossBall.radius,
            count: isCrit ? 10 : 5,
            color: themeParticleColor,
            spread: Math.PI,
            speed: 150,
            size: isCrit ? 4 : 3,
            life: 0.6,
            glow: useGlow,
            style: particleStyle,
          });
        }
      }

      if (broken) {
        // Boss defeated!
        this.handleBossDefeat();
      }
    }

    // Batch already reset in applyDamageBatch
  }

  private onBallDestroyed(): void {
    // Don't process if in transition or boss mode
    if (this.mode === 'transition' || this.mode === 'boss') {
      return;
    }

    if (this.damageBatch.damage > 0) {
      this.applyDamageBatch();
    }

    this.ball = null;

    // Play pop sound when alien dies
    this.soundManager.playPop();

    const state = this.store.getState();
    this.store.incrementAlienKill();
    this.missionSystem.trackKill();

    const baseXP = 3;
    const upgradeBonus = this.upgradeSystem.getBonusXP(state);
    const artifactBonus = this.artifactSystem.getXPBonus();

    const xpScaling = this.getEnemyXpScaling(state.level);

    let bonusXP = upgradeBonus * baseXP * xpScaling;
    bonusXP *= 1 + artifactBonus;

    // At level 100, can only gain XP after defeating the boss
    if (state.level === 100 && this.blockedOnBossLevel === 100) {
      bonusXP = 0; // No XP until boss is defeated
    } else if (this.blockedOnBossLevel !== null) {
      bonusXP *= 0.1;
    }

    state.experience += bonusXP;

    let leveledUp = false;
    let newLevel = state.level;
    if (this.blockedOnBossLevel === null) {
      while (state.experience >= ColorManager.getExpRequired(state.level)) {
        const expRequired = ColorManager.getExpRequired(state.level);
        state.experience -= expRequired;
        state.level++;
        newLevel = state.level;
        this.store.updateMaxLevel();

        // Note: highestLevelReached is NOT updated here - it only tracks the highest level
        // from PREVIOUS ascensions, not the current run. It's updated in performAscension()
        // after calculating prestige points.

        leveledUp = true;
      }
    }

    if (leveledUp) {
      // Update background immediately when level changes
      this.updateBackgroundByLevel(newLevel);

      this.soundManager.playLevelUp();

      if (ColorManager.isBossLevel(state.level)) {
        this.ball = null;
        this.showBossDialog();
      } else {
        // Instant respawn for better late-game flow
        setTimeout(() => {
          if (this.mode === 'normal' && !this.ball) {
            this.createBall();
          }
        }, 250); // Reduced from 400ms to 50ms
      }
    } else {
      // Instant respawn for better late-game flow
      setTimeout(() => {
        if (this.mode === 'normal' && !this.ball) {
          this.createBall();
        }
      }, 250); // Reduced from 400ms to 50ms
    }

    this.store.setState(state);
  }

  private handleBossDefeat(): void {
    if (this.mode !== 'boss' || !this.bossBall || this.bossBall.currentHp > 0) {
      return;
    }

    // Prevent timeout handler from running if boss is defeated
    // This fixes race condition when boss is killed near timer expiration
    this.bossTimeoutHandled = true;

    const state = this.store.getState();
    const defeatedBossLevel = state.level;
    this.store.incrementBossKill();
    this.missionSystem.trackBossKill();

    const baseReward = state.level * 10000;
    const bonusMultiplier = 1 + this.comboSystem.getCombo() * 0.01;
    let bossReward = Math.floor(baseReward * bonusMultiplier);

    // Alien cookbook: +100% boss kill rewards
    if (state.subUpgrades['alien_cookbook']) {
      bossReward *= 2;
    }

    bossReward *= 1 + this.artifactSystem.getPointsBonus();
    // Apply power-up points multiplier
    bossReward *= this.powerUpSystem.getPointsMultiplier();

    // Record boss kill reward for points per second calculation
    this.hud.recordKillReward(bossReward);
    this.store.addPoints(bossReward);

    const artifactXPBonus = this.artifactSystem.getXPBonus();

    // Reduced from level * 50 to level * 5 to prevent excessive leveling
    // Boss should give roughly 10-20x normal enemy XP, not 100x+
    let bossXP = Math.floor(state.level * 5);
    bossXP *= 1 + artifactXPBonus;
    bossXP *= this.getEnemyXpScaling(state.level);

    // Apply XP multiplier upgrades (same as regular enemies)
    const upgradeBonus = this.upgradeSystem.getBonusXP(state);
    bossXP *= upgradeBonus;

    bossXP = Math.max(1, Math.floor(bossXP));

    // Special handling for level 100 boss - limit XP to only allow leveling to 101-105
    if (state.level === 100) {
      // Calculate XP needed to reach level 105 from level 100
      let xpNeededFor105 = 0;
      for (let level = 100; level < 105; level++) {
        xpNeededFor105 += ColorManager.getExpRequired(level);
      }

      // Calculate how much XP the player currently has towards next level
      const currentXPProgress = state.experience;

      // Limit boss XP so total XP doesn't exceed what's needed for level 105
      const maxAllowedXP = Math.max(0, xpNeededFor105 - currentXPProgress);
      bossXP = Math.min(bossXP, maxAllowedXP);
    }

    state.experience += bossXP;

    // Check if artifact was found
    let artifactFound = false;
    if (Math.random() < 0.5) {
      this.artifactSystem.generateArtifact();
      artifactFound = true;

      // Show artifacts modal first, then victory message when it closes
      this.artifactsModal.setOnCloseCallback(() => {
        setTimeout(() => {
          this.hud.showMessage('🎉 BOSS DEFEATED! 🎉', '#00ff88', 2000);
        }, 300);
      });
      this.artifactsModal.show();
    }

    // Limit leveling after level 100 boss defeat
    const maxLevelAfterBoss = state.level === 100 ? 105 : Infinity;

    while (
      state.experience >= ColorManager.getExpRequired(state.level) &&
      state.level < maxLevelAfterBoss
    ) {
      const expRequired = ColorManager.getExpRequired(state.level);
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();

      // Update background immediately when level changes
      this.updateBackgroundByLevel(state.level);

      // Note: highestLevelReached is NOT updated here - it only tracks the highest level
      // from PREVIOUS ascensions, not the current run. It's updated in performAscension()
      // after calculating prestige points.
    }

    this.store.setState(state);

    this.soundManager.playBossDefeat();
    // Pause combo to preserve it during transition back to normal (unless combo pause skill is active)
    if (!this.comboPauseActive) {
      this.comboSystem.pause();
    }
    this.hideBossTimer();

    this.blockedOnBossLevel = null;
    state.blockedOnBossLevel = null;
    this.store.setState(state);

    if (this.godModeAgent) {
      this.recordGodModeBossEvent(
        this.godModeAgent,
        defeatedBossLevel,
        'Boss defeated - returning to normal',
      );
      this.resetGodModeBossTracking(this.godModeAgent);
    }

    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    // Only show victory message if artifact modal didn't open
    if (!artifactFound) {
      this.hud.showMessage('🎉 BOSS DEFEATED! 🎉', '#00ff88', 2000);
    }

    if (this.userSettings.highGraphics) {
      const centerX = this.canvas.getCenterX();
      const centerY = this.canvas.getCenterY();
      // Apply particle theme for explosions
      const particleTheme = this.customizationSystem.getParticleStyle();
      const particleStyle = particleTheme.style as
        | 'classic'
        | 'glow'
        | 'sparkle'
        | 'trail';
      const explosionColor1 = particleTheme.colors.primary;
      const explosionColor2 =
        particleTheme.colors.secondary ?? particleTheme.colors.primary;
      const useGlow = particleStyle === 'glow' || particleStyle === 'sparkle';

      this.particleSystem.spawnExplosion(
        centerX,
        centerY,
        explosionColor1,
        useGlow,
        particleStyle,
      );
      setTimeout(() => {
        this.particleSystem.spawnExplosion(
          centerX,
          centerY,
          explosionColor2,
          useGlow,
          particleStyle,
        );
      }, 200);
    }

    // Faster transition - immediately start returning to normal mode
    setTimeout(() => {
      this.startTransitionToNormal();
    }, 1000); // Reduced from 1000ms to 300ms
  }

  private showBossDialog(): void {
    // Close artifacts modal if open to prevent interference
    this.artifactsModal.hide();

    const dialog = document.getElementById('boss-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
      this.soundManager.playBossAppear();
    }
  }

  private startBossFight(): void {
    this.startTransitionToBoss();
  }

  private startTransitionToBoss(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.ball = null;
    // Pause combo instead of resetting it - will resume after boss fight (unless combo pause skill is active)
    if (!this.comboPauseActive) {
      this.comboSystem.pause();
    }

    // Hide timeout modal if visible
    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (timeoutModal) {
      timeoutModal.style.display = 'none';
    }

    // Reset timeout flag
    this.bossTimeoutHandled = false;

    // Determine boss variant for the upcoming boss
    const state = this.store.getState();
    let bossVariant: 0 | 1 | 2 | 3 = 0;
    if (state.level >= 25) {
      const bossIndex = Math.floor((state.level - 25) / 25);
      bossVariant = (bossIndex % 4) as 0 | 1 | 2 | 3;
    }

    // Enable boss effect with smooth fade-in during transition
    // Effect starts fading in during the transition and reaches full intensity when boss appears
    this.bossEffectFilter.enable(bossVariant, this.transitionDuration * 0.5);

    setTimeout(() => {
      if (this.mode === 'transition') {
        this.createBoss();
        this.mode = 'boss';
        this.startBossTimer();
        // Switch to boss battle soundtrack
        this.soundManager.startBossSoundtrack();
        // Resume combo when boss fight actually starts (not during transition, unless combo pause is active)
        if (!this.comboPauseActive) {
          this.comboSystem.resume();
        }
      }
    }, this.transitionDuration * 500);
  }

  private startTransitionToNormal(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.bossBall = null;

    // Disable boss effect with smooth fade-out during transition
    this.bossEffectFilter.disable(this.transitionDuration * 0.5);

    // Cleanup systems for memory management
    this.cleanup();

    // Switch back to normal soundtrack
    this.soundManager.stopBossSoundtrack();

    // Faster transition back to normal - reduced delay
    setTimeout(() => {
      if (this.mode === 'transition') {
        this.mode = 'normal';
        this.createBall();
        // Resume combo when returning to normal gameplay (unless combo pause is active)
        if (!this.comboPauseActive) {
          this.comboSystem.resume();
        }
      }
    }, this.transitionDuration * 500);
  }

  /**
   * Cleanup method for scene transitions and memory management
   * Releases pooled objects and clears temporary arrays efficiently
   */
  private cleanup(): void {
    // Clear systems that may have pooled objects
    // Note: clear() methods already handle object pooling efficiently
    this.laserSystem.clear();
    this.particleSystem.clear();
    this.damageNumberSystem.clear();

    // Reset damage batch (reuse object, just clear values)
    this.damageBatch.damage = 0;
    this.damageBatch.isCrit = false;
    this.damageBatch.isFromShip = false;
    this.damageBatch.clickDamage = 0;
    this.damageBatch.hitDirection = undefined;
    this.damageBatch.isBeam = false;
    this.batchTimer = 0;
  }

  private handleActiveEffect(effect: string): void {
    // Double-check we're not in boss mode (safety check)
    if (this.mode === 'boss') {
      return;
    }

    switch (effect) {
      case 'nuke':
        if (this.ball && this.ball.currentHp > 0) {
          const dmg = this.ball.maxHp * 0.5;
          const broken = this.ball.takeDamage(dmg);

          // Award points for damage dealt
          let pointsEarned = dmg;
          if (this.ball instanceof EnhancedAlienBall) {
            pointsEarned = this.ball.getPointsReward(pointsEarned);
          }
          pointsEarned *= this.powerUpSystem.getPointsMultiplier();
          this.store.addPoints(pointsEarned);

          this.damageNumberSystem.spawnDamageNumber(
            this.ball.x,
            this.ball.y,
            dmg,
            true,
          );
          // Big explosion particles
          if (this.userSettings.highGraphics) {
            this.particleSystem.spawnParticles({
              x: this.ball.x,
              y: this.ball.y,
              count: 50,
              color: '#ff0000',
              speed: 200,
              size: 5,
              life: 1.0,
              glow: true,
            });
          }

          // Handle kill if alien was destroyed
          if (broken) {
            let killReward = this.ball.maxHp;
            if (this.ball instanceof EnhancedAlienBall) {
              killReward = this.ball.getPointsReward(killReward);
            }
            // Apply artifact points bonus
            killReward *= 1 + this.artifactSystem.getPointsBonus();

            if (this.midasActive) {
              killReward *= 10;
              this.midasActive = false;
              this.hud.showMessage('MIDAS BONUS!', '#ffd700');
            }
            killReward *= this.powerUpSystem.getPointsMultiplier();
            const roundedReward = Math.max(1, Math.floor(killReward));
            // Record kill reward for points per second calculation
            this.hud.recordKillReward(roundedReward);
            this.store.addPoints(roundedReward);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.hud.showPointsGain(roundedReward);

            // Chance to spawn power-up (1% chance - very rare, like Cookie Clicker golden cookies)
            let spawnPowerUp = Math.random() < 0.01;
            if (
              this.ball instanceof EnhancedAlienBall &&
              this.ball.enemyType === 'hoarder'
            ) {
              spawnPowerUp = true;
            }
            if (spawnPowerUp) {
              const powerUpX = this.ball.x + (Math.random() - 0.5) * 100;
              const powerUpY = this.ball.y + (Math.random() - 0.5) * 100;
              this.spawnPowerUp(powerUpX, powerUpY);
            }
            this.onBallDestroyed();
          }
        }
        break;
      case 'midas':
        this.midasActive = true;
        this.hud.showMessage('MIDAS TOUCH ACTIVE!', '#ffd700', 3000);
        break;
      case 'overclock':
        this.overclockTimer = 5; // 5 seconds
        this.hud.showMessage('OVERCLOCK ACTIVE!', '#00ffff', 3000);
        break;
    }
  }

  private update(dt: number): void {
    const realDt = dt;
    dt = dt * this.gameSpeed;
    const scaledDt = dt;
    this.frameCount++;

    // Update WebGL renderer time for animations
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer = this.canvas.getWebGLRenderer();
    if (webglRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      webglRenderer.updateTime(dt);
    }

    // Use getReadonlyState for performance (avoids cloning)
    const state = this.store.getReadonlyState();

    // Update combo pause skill
    if (this.comboPauseActive) {
      this.comboPauseDuration -= dt;
      if (this.comboPauseDuration <= 0) {
        // Skill expired - resume combo and start cooldown
        const now = Date.now();
        this.comboPauseActive = false;
        this.comboPauseDuration = 0;
        this.comboPauseCooldown = this.COMBO_PAUSE_COOLDOWN;
        this.comboSystem.resume();

        // Update state
        this.store.setState({
          comboPauseActive: false,
          comboPauseEndTime: 0,
          comboPauseCooldownEndTime: now + this.COMBO_PAUSE_COOLDOWN * 1000,
        });

        this.updateComboPauseButton();
      } else {
        // Update end time in state to reflect current duration
        const now = Date.now();
        this.store.setState({
          comboPauseEndTime: now + this.comboPauseDuration * 1000,
        });

        // Update button display every second
        if (
          Math.floor(this.comboPauseDuration) !==
          Math.floor(this.comboPauseDuration + dt)
        ) {
          this.updateComboPauseButton();
        }
      }
    } else if (this.comboPauseCooldown > 0) {
      this.comboPauseCooldown -= dt;
      if (this.comboPauseCooldown <= 0) {
        this.comboPauseCooldown = 0;

        // Update state
        this.store.setState({
          comboPauseCooldownEndTime: 0,
        });

        this.updateComboPauseButton();
      } else {
        // Update cooldown end time in state
        const now = Date.now();
        this.store.setState({
          comboPauseCooldownEndTime: now + this.comboPauseCooldown * 1000,
        });

        // Update button display every second
        if (
          Math.floor(this.comboPauseCooldown) !==
          Math.floor(this.comboPauseCooldown + dt)
        ) {
          this.updateComboPauseButton();
        }
      }
    }

    if (this.godMode) {
      this.updateGodMode(scaledDt, realDt);
    }

    // Throttle boss timer updates (expensive DOM updates)
    if (this.mode === 'boss') {
      // Always update internal timer for accurate timeout checking
      const oldTime = this.bossTimeRemaining;
      this.bossTimeRemaining -= dt;

      // Check timeout immediately (critical)
      if (this.bossTimeRemaining <= 0 && oldTime > 0) {
        this.handleBossTimeout();
      } else if (this.frameCount % this.BOSS_TIMER_UPDATE_INTERVAL === 0) {
        // Only update DOM display every N frames (expensive operation)
        this.updateBossTimer(0); // Pass 0 since we already decremented above
      }
    }

    // Batch time accumulation updates (only update when needed)
    this.playTimeAccumulator += dt;
    if (this.playTimeAccumulator >= 1) {
      this.store.addPlayTime(Math.floor(this.playTimeAccumulator));
      this.playTimeAccumulator = this.playTimeAccumulator % 1;
    }

    this.passiveGenAccumulator += dt;
    if (this.passiveGenAccumulator >= 1) {
      const passiveGen = this.upgradeSystem.getPassiveGen(state);
      if (passiveGen > 0) {
        this.store.addPoints(passiveGen);
      }
      this.passiveGenAccumulator = this.passiveGenAccumulator % 1;
    }

    // Throttle HUD stats updates (expensive calculations)
    if (this.frameCount % this.HUD_STATS_UPDATE_INTERVAL === 0) {
      try {
        const dps = this.hud.calculateDPS();
        const passiveGen = this.upgradeSystem.getPassiveGen(state);
        const critChance = this.upgradeSystem.getCritChance(state);
        const critBonus = this.powerUpSystem.getCritChanceBonus() * 100; // Convert to percentage
        const hitDamage = this.upgradeSystem.getPointsPerHit(state);
        const fireCooldown = this.upgradeSystem.getFireCooldown(state, true);
        const attackSpeed = fireCooldown > 0 ? 1000 / fireCooldown : 0; // Convert ms to shots per second
        this.hud.updateStats(
          dps,
          passiveGen,
          critChance,
          critBonus,
          hitDamage,
          attackSpeed,
        );

        // Update power-up buffs display (include combo pause skill if active)
        const activeBuffs = this.powerUpSystem.getActiveBuffs();
        const allBuffs: Array<{
          type: string;
          duration: number;
          maxDuration: number;
        }> = [...activeBuffs];
        if (this.comboPauseActive) {
          allBuffs.push({
            type: 'combo_pause',
            duration: this.comboPauseDuration,
            maxDuration: this.COMBO_PAUSE_DURATION,
          });
        }
        this.hud.updatePowerUpBuffs(allBuffs);

        // Refresh shop if power-up buffs changed (to update shop display with ⚡ and ⚔️ icons)
        const currentPowerUpCount = activeBuffs.length;
        const hasSpeedBuff = activeBuffs.some((b) => b.type === 'speed');
        const hasDamageBuff = activeBuffs.some((b) => b.type === 'damage');

        // Check if any power-up state changed (count, speed, or damage)
        const powerUpStateChanged =
          currentPowerUpCount !== this.lastPowerUpCount ||
          hasSpeedBuff !== this.lastHadSpeedBuff ||
          hasDamageBuff !== this.lastHadDamageBuff;

        if (powerUpStateChanged) {
          this.lastPowerUpCount = currentPowerUpCount;
          this.lastHadSpeedBuff = hasSpeedBuff;
          this.lastHadDamageBuff = hasDamageBuff;
          // Force immediate shop refresh to show/hide power-up indicators
          this.shop.forceRefresh();
        }
      } catch {
        // Ignore errors in HUD update
      }
    }

    // Throttle achievement checks (expensive operation)
    if (this.frameCount % this.ACHIEVEMENT_CHECK_INTERVAL === 0) {
      this.achievementSystem.checkAchievements(state);
      // Update theme unlocks periodically
      this.customizationSystem.updateUnlocks(state);
    }

    if (this.mode === 'transition') {
      this.transitionTime += dt;
      if (this.transitionTime >= this.transitionDuration) {
        this.transitionTime = 0;
      }
    }

    this.ball?.update(dt, this.canvas.getWidth(), this.canvas.getHeight());
    this.bossBall?.update(dt, this.canvas.getWidth(), this.canvas.getHeight());

    this.background.update(dt);
    this.missionSystem.update();

    // Check if we should use beam mode based on attack speed
    // Apply power-up speed multiplier (divide cooldown by multiplier = faster firing)
    // Calculate once and reuse for both beam check and auto-fire
    const speedMultiplier = this.powerUpSystem.getSpeedMultiplier();
    const cooldown =
      this.upgradeSystem.getFireCooldown(state) / speedMultiplier;
    const shouldUseBeam = this.laserSystem.shouldUseBeamMode(cooldown);
    const wasInBeamMode = this.laserSystem.isBeamMode();

    this.laserSystem.setBeamMode(shouldUseBeam);

    // When entering beam mode or periodically, recalculate beam damage
    if (shouldUseBeam) {
      if (!wasInBeamMode) {
        // Entering beam mode - calculate immediately
        const totalDamage = this.calculateTotalBeamDamage(state);
        this.laserSystem.setBeamDamage(totalDamage);
      } else {
        // Recalculate beam damage periodically using frame counter (more efficient than timer)
        if (this.frameCount % this.BEAM_RECALC_INTERVAL === 0) {
          const totalDamage = this.calculateTotalBeamDamage(state);
          this.laserSystem.setBeamDamage(totalDamage);
        }
      }
    } else if (wasInBeamMode) {
      // Exiting beam mode, clear beams
      this.laserSystem.clearBeams();
    }

    this.laserSystem.update(
      dt,
      (
        damage: number,
        isCrit: boolean,
        isFromShip: boolean,
        hitDirection?: Vec2,
      ) => {
        this.handleDamage(damage, isCrit, isFromShip, hitDirection);
      },
    );

    // Process beam damage if in beam mode (respects attack speed)
    if (shouldUseBeam) {
      const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
      const targetCenter = targetEntity
        ? { x: targetEntity.x, y: targetEntity.y }
        : undefined;

      // Get beam origin from first ship or use canvas center as fallback
      let beamOrigin: Vec2 | undefined;
      if (this.ships.length > 0 && this.ships[0]) {
        const shipPos = this.ships[0].getFrontPosition();
        beamOrigin = shipPos;
      } else {
        // Fallback to canvas center if no ships
        beamOrigin = {
          x: this.canvas.getCenterX(),
          y: this.canvas.getCenterY(),
        };
      }

      this.laserSystem.processBeamDamage(
        cooldown,
        (
          damage: number,
          isCrit: boolean,
          isFromShip: boolean,
          hitDirection?: Vec2,
          isBeam?: boolean,
        ) => {
          this.handleDamage(damage, isCrit, isFromShip, hitDirection, isBeam);
        },
        targetCenter,
        beamOrigin,
      );
    }

    this.particleSystem.update(dt);
    this.damageNumberSystem.update(dt);
    this.comboSystem.update(dt);
    this.powerUpSystem.update(dt);
    this.artifactSystem.update(dt);

    // Update Skill Bar
    this.hud.updateSkillBar(this.artifactSystem.getEquippedArtifacts());

    // Overclock Logic
    if (this.overclockTimer > 0) {
      this.overclockTimer -= dt;
      if (this.overclockTimer < 0) this.overclockTimer = 0;
    }

    this.batchTimer += dt;
    if (this.batchTimer >= this.batchInterval) {
      this.applyDamageBatch();
      this.batchTimer = 0;
    }

    if (
      this.userSettings.highGraphics &&
      this.mode === 'boss' &&
      this.bossBall
    ) {
      const bossPos = this.bossBall.getPosition();
      const phase = this.bossBall.getPhase();
      let trailColor = '#ffffff';
      if (phase === 3) trailColor = '#ff0000';
      else if (phase === 2) trailColor = '#ffaa00';

      // Apply particle theme for trails
      const particleTheme = this.customizationSystem.getParticleStyle();
      const particleStyle = particleTheme.style as
        | 'classic'
        | 'glow'
        | 'sparkle'
        | 'trail';
      const trailThemeColor =
        particleStyle === 'trail' ? particleTheme.colors.primary : trailColor;
      const trailStyle =
        particleStyle === 'trail' ? ('trail' as const) : ('classic' as const);

      this.particleSystem.spawnTrail(
        bossPos.x,
        bossPos.y,
        trailThemeColor,
        trailStyle,
      );
    }

    for (const ship of this.ships) {
      ship.rotate(dt);
    }

    // Update beam positions for auto-fire ships AFTER ships have rotated (for sync)
    // Always update beams every frame to prevent lag/sticking
    if (shouldUseBeam) {
      const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;

      // Always update beam positions, even if no target (clears beams when target is gone)
      const target =
        targetEntity && targetEntity.currentHp > 0
          ? { x: targetEntity.x, y: targetEntity.y }
          : null;

      if (target && targetEntity) {
        // Auto-fire ships: Static beams with theme colors
        // Main ship (index 0) doesn't use beams - it fires regular projectiles for click feedback
        // Get laser visuals (which includes upgrade-based colors)
        const laserVisuals = this.getLaserVisualsNoCrit(state);
        const beamColor = laserVisuals.color;
        const beamWidth = laserVisuals.width;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const beamThemeId = this.customizationSystem.getLaserThemeId(state);

        for (let i = 1; i < this.ships.length; i++) {
          const ship = this.ships[i];
          if (ship) {
            const origin = ship.getFrontPosition();
            const shipHitPoint = this.calculateHitPoint(
              origin,
              target,
              targetEntity.radius,
            );
            // Update positions and colors every frame (colors from theme)
            this.laserSystem.updateShipBeamTarget(
              i,
              origin,
              shipHitPoint,
              beamColor, // Use theme color
              beamWidth,
              false, // No crits for beams
            );
            // Store theme ID for beam rendering
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.laserSystem.lastBeamThemeId = beamThemeId;
          }
        }
      } else {
        // No target - clear beams
        for (let i = 1; i < this.ships.length; i++) {
          this.laserSystem.clearShipBeam(i);
        }
      }
    }

    // Reuse already-calculated cooldown (already includes speed multiplier)
    let effectiveCooldown = cooldown;
    if (this.overclockTimer > 0) {
      effectiveCooldown /= 3; // 3x speed during overclock
    }
    this.autoFireSystem.update(
      dt,
      true, // Auto-fire always enabled for non-main ships
      effectiveCooldown,
      (shipIndex) => {
        if (shipIndex > 0) {
          return this.fireSingleShip(shipIndex);
        }
        return false;
      },
    );

    this.saveTimer += dt;
    if (this.saveTimer >= this.saveInterval) {
      Save.save(state);
      this.saveTimer = 0;
    }

    this.titleUpdateTimer += dt;
    if (this.titleUpdateTimer >= 1.0) {
      this.updatePageTitle(state.points);
      this.titleUpdateTimer = 0;
    }

    // Auto-buy check (only if unlocked)
    this.autoBuyTimer += dt;
    if (this.autoBuyTimer >= this.autoBuyInterval) {
      const isUnlocked = this.ascensionSystem.isAutoBuyUnlocked(state);
      if (isUnlocked && state.autoBuyEnabled) {
        this.shop.checkAndBuyAffordableUpgrades();
      } else if (!isUnlocked && state.autoBuyEnabled) {
        // Disable auto-buy if it was enabled but unlock was lost (shouldn't happen, but safety check)
        this.store.setState({ autoBuyEnabled: false });
      }
      this.autoBuyTimer = 0;
    }

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }

    // Update ascension animation
    if (this.isAscensionAnimating) {
      this.ascensionAnimationTime += dt;
      const animationDuration = 2.5; // 2.5 seconds total animation

      // Add screen shake during animation
      if (this.ascensionAnimationTime < animationDuration * 0.8) {
        this.shakeTime = 0.1;
        this.shakeAmount = 10;
      }

      // Complete animation after duration
      if (this.ascensionAnimationTime >= animationDuration) {
        this.isAscensionAnimating = false;
        this.ascensionAnimationTime = 0;
        // Check if this is the first ascension before resetting
        const state = this.store.getState();
        const isFirstAscension = state.prestigeLevel === 0;
        // Now perform the actual ascension
        this.performAscensionInternal();
        // Show thank you modal after first ascension (after a short delay)
        if (isFirstAscension) {
          setTimeout(() => {
            this.thankYouModal.show();
          }, 500);
        }
      }
    }
  }

  private spawnPowerUp(x: number, y: number): void {
    this.powerUpSystem.spawnAt(x, y);
  }

  private debugActivatePowerUp(
    type: 'damage' | 'speed' | 'points' | 'multishot' | 'critical',
  ): void {
    // Directly activate the buff by using the PowerUpSystem's internal activateBuff method
    // We'll use the canvas class methods to get dimensions
    const centerX = this.canvas.getWidth() / 2;
    const centerY = this.canvas.getHeight() / 2;

    // Spawn at center and immediately activate
    this.powerUpSystem.spawnAt(centerX, centerY, type);
    const collected = this.powerUpSystem.checkCollision(centerX, centerY);
    if (collected) {
      this.shop.forceRefresh();
      this.lastPowerUpCount = this.powerUpSystem.getActiveBuffs().length;
      this.lastHadSpeedBuff = this.powerUpSystem
        .getActiveBuffs()
        .some((b) => b.type === 'speed');
      this.lastHadDamageBuff = this.powerUpSystem
        .getActiveBuffs()
        .some((b) => b.type === 'damage');
    }
  }

  private updatePageTitle(points: number): void {
    let formattedPoints: string;
    if (points >= 1e12) {
      formattedPoints = `${(points / 1e12).toFixed(2)}T`;
    } else if (points >= 1e9) {
      formattedPoints = `${(points / 1e9).toFixed(2)}B`;
    } else if (points >= 1e6) {
      formattedPoints = `${(points / 1e6).toFixed(2)}M`;
    } else if (points >= 1e3) {
      formattedPoints = `${(points / 1e3).toFixed(1)}K`;
    } else {
      formattedPoints = Math.floor(points).toString();
    }

    document.title = `${formattedPoints} points - BOBBLE`;
  }

  private render(): void {
    // Apply background theme colors (keep for star colors, etc.)
    const bgColors = this.customizationSystem.getBackgroundColors();
    const themeId: string = 'default_background';
    this.background.setThemeColors(bgColors, themeId);

    // Background GIF is updated automatically by level in updateBackgroundByLevel()

    // Clear canvas (WebGL or 2D)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer: WebGLRenderer | null = this.canvas.getWebGLRenderer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this.canvas.isWebGLEnabled() && webglRenderer !== null) {
      // Clear WebGL canvas
      webglRenderer.clear(bgColors.primary);
      // Also clear offscreen 2D canvas for background/text
      this.canvas.clear();
    } else {
      this.canvas.clear();
    }

    const ctx = this.canvas.getContext();

    // Early exit if nothing to render (shouldn't happen, but safety check)
    if (this.mode === 'transition' && this.transitionTime <= 0) {
      return;
    }

    // Background always uses 2D canvas (complex gradients and effects)
    this.background.render(ctx);

    ctx.save();

    if (this.shakeTime > 0) {
      const intensity = this.shakeAmount * (this.shakeTime / 0.1);
      const offsetX = (Math.random() - 0.5) * intensity;
      const offsetY = (Math.random() - 0.5) * intensity;
      ctx.translate(offsetX, offsetY);
    }

    if (this.mode === 'transition') {
      this.renderTransition();
      ctx.restore();
      // Flush WebGL batches before frame end
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.draw.flush();
      // Also flush WebGL and composite overlay
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.canvas.flushWebGL();
      return;
    }

    // Batch render game entities for better performance
    this.renderGameEntities(ctx);

    // Render ascension animation overlay
    if (this.isAscensionAnimating) {
      this.renderAscensionAnimation(ctx);
    }

    ctx.restore();

    // Flush WebGL batches at end of frame (critical for performance)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.draw.flush();
    // Also flush WebGL and composite overlay
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.canvas.flushWebGL();
  }

  private renderGameEntities(ctx: CanvasRenderingContext2D): void {
    // Early exit checks
    const hasBall = this.ball && this.ball.currentHp > 0;
    const hasBoss = this.bossBall && this.bossBall.currentHp > 0;
    const hasParticles =
      this.userSettings.highGraphics &&
      this.particleSystem.getParticleCount() > 0;
    const hasDamageNumbers = this.damageNumberSystem.getCount() > 0;
    const hasCombo = this.comboSystem.getCombo() > 0;
    const hasPowerUps = this.powerUpSystem.getPowerUps().length > 0;

    // Render particles first (background layer)
    if (hasParticles) {
      this.particleSystem.draw(this.draw);
    }

    // Render lasers (projectiles)
    this.laserSystem.draw(this.draw);

    // Render main entities (ball/boss)
    if (hasBall && this.ball) {
      this.ball.draw(this.draw);
    }
    if (hasBoss && this.bossBall) {
      this.bossBall.draw(this.draw);
    }

    // Render ships (batch by entity type)
    // Use 2D canvas rendering for ships (better performance than DOM overlays)
    const state = this.store.getReadonlyState();
    // Calculate visuals once per frame instead of per ship
    const visuals = this.customizationSystem.getShipColors(state);

    for (const ship of this.ships) {
      // Store visuals for ship to use (for fallback triangle rendering)
      (ship as any).customVisuals = visuals;
      ship.draw(this.draw);
    }

    // Render UI elements
    if (hasDamageNumbers) {
      this.damageNumberSystem.draw(this.draw);
    }

    if (hasCombo) {
      this.comboSystem.draw(
        this.draw,
        this.canvas.getWidth(),
        this.canvas.getHeight(),
        state,
      );
    }

    // Render power-ups
    if (hasPowerUps) {
      this.powerUpSystem.render(ctx, this.draw);
    }
  }

  private renderTransition(): void {
    const progress = this.transitionTime / this.transitionDuration;
    const alpha = Math.sin(progress * Math.PI);

    this.draw.setAlpha(alpha);
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const maxRadius = Math.max(this.canvas.getWidth(), this.canvas.getHeight());

    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (progress + i * 0.2);
      this.draw.setStroke('#fff', 2);
      this.draw.circle(cx, cy, radius, false);
    }

    this.draw.resetAlpha();
  }

  private resetGame(): void {
    Save.clear();
    const newState = Save.load();
    // Reset totalSubUpgrades in stats
    newState.stats.totalSubUpgrades = 0;
    this.store.setState(newState);
    this.mode = 'normal';

    this.blockedOnBossLevel = null;
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    this.hideBossTimer();

    // Reset damage batch efficiently
    this.damageBatch.damage = 0;
    this.damageBatch.isCrit = false;
    this.damageBatch.isFromShip = false;
    this.damageBatch.clickDamage = 0;
    this.damageBatch.hitDirection = undefined;
    this.damageBatch.isBeam = false;

    this.powerUpSystem.clear();

    // Reset shop UI
    this.shop.reset();

    this.createBall();
    this.createShips();
  }

  private debugTriggerBoss(): void {
    const state = this.store.getState();
    // Set level to nearest boss level
    const nearestBoss = Math.ceil(state.level / 5) * 5;
    state.level = nearestBoss;
    this.store.setState(state);
    this.updateBackgroundByLevel(state.level);
    this.showBossDialog();
  }

  private debugGenerateArtifact(
    rarity?: 'common' | 'rare' | 'epic' | 'legendary',
  ): void {
    this.artifactSystem.generateArtifact(rarity);
    // Refresh the artifacts modal if it's open
    this.artifactsModal.refresh();
  }

  private debugSpawnAlien(type: EnemyType): void {
    // Clear current alien if any
    if (this.ball) {
      this.ball = null;
    }

    // Create new alien of specified type
    const state = this.store.getState();
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const radius = Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.08;
    
    this.ball = new EnhancedAlienBall(cx, cy, radius, state.level, type);
  }

  private setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }

  private toggleGodMode(): void {
    this.godMode = !this.godMode;
    if (this.godMode) {
      this.enableGodMode();
    } else {
      this.disableGodMode();
    }
  }

  private enableGodMode(): void {
    const state = this.store.getState();
    const overlay = this.createGodModeOverlay();
    this.godModeAgent = {
      clickTimer: this.getRandomInRange(0.08, 0.2),
      clickIntervalRange: { min: 0.08, max: 0.22 },
      burstChance: 0.18,
      burstShotsRemaining: 0,
      burstCooldownTimer: 0,
      burstCooldownRange: { min: 4.2, max: 7.5 },
      jitterRadius: 28,
      upgradeTimer: this.getRandomInRange(0.9, 1.6),
      upgradeIntervalRange: { min: 0.8, max: 1.8 },
      powerUpTimer: this.getRandomInRange(0.4, 0.9),
      powerUpReactionRange: { min: 0.12, max: 0.35 },
      metricsTimer: 0,
      metricsInterval: 1,
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
      nextBreakIn: this.getRandomInRange(25, 45),
      breakTimer: 0,
      breakDurationRange: { min: 1.4, max: 3.3 },
      bossCheckTimer: 0,
      bossCheckIntervalRange: { min: 0.15, max: 0.35 },
      bossRetryTimer: 0,
      bossRetryDelay: 300,
      bossRetryAttempts: 0,
      bossHistory: [],
    };
    this.notificationSystem.show('God Mode autopilot engaged.', 'info', 2400);
  }

  private disableGodMode(): void {
    if (this.godModeAgent?.overlay) {
      this.godModeAgent.overlay.remove();
    }
    this.godModeAgent = null;
    this.notificationSystem.show('God Mode disengaged.', 'warning', 2000);
  }

  private createGodModeOverlay(): HTMLElement | null {
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

  private updateGodMode(dt: number, realDt: number): void {
    if (!this.godModeAgent) return;
    const agent = this.godModeAgent;

    agent.clickTimer -= dt;
    agent.upgradeTimer -= dt;
    agent.powerUpTimer -= dt;
    agent.metricsTimer -= dt;
    agent.logTimer -= dt;
    agent.bossCheckTimer -= dt;
    agent.bossRetryTimer = Math.max(0, agent.bossRetryTimer - realDt);
    agent.burstCooldownTimer = Math.max(0, agent.burstCooldownTimer - dt);

    if (agent.breakTimer > 0) {
      agent.breakTimer = Math.max(0, agent.breakTimer - dt);
      if (agent.breakTimer === 0) {
        agent.lastAction = 'Back from short break';
        agent.clickTimer = this.getRandomInRange(
          agent.clickIntervalRange.min,
          agent.clickIntervalRange.max,
        );
      }
    } else {
      agent.idleTimer += dt;
      if (agent.idleTimer >= agent.nextBreakIn) {
        agent.breakTimer = this.getRandomInRange(
          agent.breakDurationRange.min,
          agent.breakDurationRange.max,
        );
        agent.idleTimer = 0;
        agent.nextBreakIn = this.getRandomInRange(20, 45);
        agent.lastAction = 'Taking a short break';
      }
    }

    let handledBossAction = false;
    if (agent.bossCheckTimer <= 0) {
      handledBossAction = this.handleGodModeBossFlow(agent);
      agent.bossCheckTimer = this.getRandomInRange(
        agent.bossCheckIntervalRange.min,
        agent.bossCheckIntervalRange.max,
      );
    }

    if (handledBossAction) {
      return;
    }

    const powerUpClicked = this.runGodModePowerUps(agent);
    if (!powerUpClicked && agent.breakTimer <= 0) {
      this.runGodModeClicking(agent);
    }

    // Check for discovered but unpurchased upgrades - prioritize saving money for them
    const hasDiscoveredUpgrades = this.checkForDiscoveredUpgrades();
    if (hasDiscoveredUpgrades) {
      // Reduce upgrade check timer to check more frequently when saving for discovered upgrades
      agent.upgradeTimer = Math.min(
        agent.upgradeTimer,
        this.getRandomInRange(0.3, 0.6),
      );
    }

    if (agent.upgradeTimer <= 0) {
      this.runGodModeUpgrades(agent);
    }

    if (agent.metricsTimer <= 0) {
      this.updateGodModeMetrics(agent);
    }

    if (agent.logTimer <= 0) {
      this.logGodModeSnapshot(agent);
      agent.logTimer = this.getRandomInRange(14, 22);
    }
  }

  private runGodModePowerUps(
    agent: NonNullable<typeof this.godModeAgent>,
  ): boolean {
    const available = this.powerUpSystem
      .getPowerUps()
      .filter((powerUp) => powerUp.active);

    if (available.length === 0) {
      if (agent.powerUpTimer <= 0) {
        agent.powerUpTimer = this.getRandomInRange(0.6, 1.4);
      }
      return false;
    }

    if (agent.powerUpTimer > 0) {
      return false;
    }

    const target =
      available[Math.floor(Math.random() * available.length)] ?? available[0];
    if (!target) return false;

    const clickPos = this.withJitter({ x: target.x, y: target.y }, 12);
    this.handleClick(clickPos);
    agent.lastAction = `Collected ${this.powerUpSystem.getBuffName(
      target.type,
    )}`;
    agent.powerUpTimer = this.getRandomInRange(
      agent.powerUpReactionRange.min,
      agent.powerUpReactionRange.max,
    );
    agent.clickTimer = this.getRandomInRange(0.05, 0.12);
    return true;
  }

  private runGodModeClicking(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    if (this.mode === 'transition') return;
    if (agent.breakTimer > 0) return;

    const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
    if (!targetEntity || targetEntity.currentHp <= 0) return;

    const state = this.store.getState();
    const comboMultiplier = this.comboSystem.getMultiplier(state);
    if (comboMultiplier >= 3) {
      this.comboSystem.reset();
      agent.breakTimer = this.getRandomInRange(0.6, 1.1);
      agent.idleTimer = 0;
      agent.lastAction = 'Capped combo at 3x multiplier';
      agent.clickTimer = this.getRandomInRange(0.2, 0.35);
      return;
    }

    if (agent.clickTimer > 0) return;

    const jitterScale = this.mode === 'boss' ? 0.7 : 1;
    const clickPos = this.withJitter(
      { x: targetEntity.x, y: targetEntity.y },
      agent.jitterRadius * jitterScale,
    );
    this.handleClick(clickPos);

    // Check if saving for discovered upgrades - use faster click intervals
    const hasDiscovered = this.checkForDiscoveredUpgrades();
    const clickIntervalMin = hasDiscovered
      ? agent.clickIntervalRange.min * 0.7 // 30% faster
      : agent.clickIntervalRange.min;
    const clickIntervalMax = hasDiscovered
      ? agent.clickIntervalRange.max * 0.7 // 30% faster
      : agent.clickIntervalRange.max;

    if (agent.burstShotsRemaining > 0) {
      agent.burstShotsRemaining--;
      agent.clickTimer = agent.burstShotsRemaining
        ? this.getRandomInRange(0.05, 0.1)
        : this.getRandomInRange(clickIntervalMin, clickIntervalMax);
    } else if (
      agent.burstCooldownTimer <= 0 &&
      Math.random() < agent.burstChance
    ) {
      agent.burstShotsRemaining = Math.floor(this.getRandomInRange(2, 5));
      agent.clickTimer = this.getRandomInRange(0.05, 0.1);
      agent.burstCooldownTimer = this.getRandomInRange(
        agent.burstCooldownRange.min,
        agent.burstCooldownRange.max,
      );
      agent.lastAction = 'Executed rapid click burst';
    } else {
      agent.clickTimer = this.getRandomInRange(
        clickIntervalMin,
        clickIntervalMax,
      );
    }
  }

  private checkForDiscoveredUpgrades(): boolean {
    const state = this.store.getState();
    if (!state.discoveredUpgrades) return false;

    // Only check sub-upgrades (special upgrades), not main upgrades
    const subUpgrades = this.upgradeSystem.getSubUpgrades();
    for (const subUpgrade of subUpgrades) {
      const subKey = `sub_${subUpgrade.id}`;
      if (state.discoveredUpgrades[subKey] && !subUpgrade.owned) {
        // Only prioritize if we have at least 80% of the cost
        const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        const threshold = cost * 0.8;
        if (state.points >= threshold) {
          return true;
        }
      }
    }

    return false;
  }

  private runGodModeUpgrades(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    const beforeState = this.store.getState();
    const beforeUpgrades = beforeState.stats.totalUpgrades;
    const beforeSubUpgrades = beforeState.stats.totalSubUpgrades;

    // Always try to buy discovered upgrades first (if affordable)
    this.shop.checkAndBuyDiscoveredUpgrades();

    // Check if we're saving for discovered upgrades (80% threshold)
    const hasDiscovered = this.checkForDiscoveredUpgrades();

    // Only buy normal upgrades if we're not saving for a special upgrade
    if (!hasDiscovered) {
      this.shop.checkAndBuyAffordableUpgrades(true);
    }

    const afterState = this.store.getState();
    if (afterState.stats.totalUpgrades > beforeUpgrades) {
      const diff = afterState.stats.totalUpgrades - beforeUpgrades;
      agent.lastAction =
        diff > 1 ? `Bought ${String(diff)} upgrades` : 'Bought upgrade';
    } else if (afterState.stats.totalSubUpgrades > beforeSubUpgrades) {
      agent.lastAction = 'Unlocked special upgrade';
    } else if (hasDiscovered) {
      agent.lastAction = 'Saving for discovered upgrade';
    }

    // Adjust timer based on whether we're saving for discovered upgrades
    if (hasDiscovered) {
      // Check more frequently when saving for discovered upgrades
      agent.upgradeTimer = this.getRandomInRange(0.3, 0.6);
    } else {
      agent.upgradeTimer = this.getRandomInRange(
        agent.upgradeIntervalRange.min,
        agent.upgradeIntervalRange.max,
      );
    }
  }

  private handleGodModeBossFlow(
    agent: NonNullable<typeof this.godModeAgent>,
  ): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const state = this.store.getState();
    const blockedLevel =
      state.blockedOnBossLevel ?? this.blockedOnBossLevel ?? null;
    const resolvedBossLevel =
      blockedLevel !== null ? blockedLevel : state.level;

    const ensureAgentReady = (action: string, resetClickTimer = true): void => {
      agent.lastAction = action;
      agent.breakTimer = 0;
      agent.idleTimer = 0;
      if (resetClickTimer) {
        agent.clickTimer = this.getRandomInRange(0.05, 0.1);
      }
    };

    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (
      timeoutModal &&
      timeoutModal.style.display !== 'none' &&
      this.mode === 'boss'
    ) {
      const closeButton = document.getElementById('boss-timeout-close');
      if (closeButton) {
        closeButton.click();
      } else {
        timeoutModal.style.display = 'none';
        if (this.bossRetryButton) {
          this.bossRetryButton.style.display = 'flex';
        }
        this.startTransitionToNormal();
      }
      agent.bossRetryTimer = agent.bossRetryDelay;
      agent.bossRetryAttempts += 1;
      this.recordGodModeBossEvent(
        agent,
        resolvedBossLevel,
        `Boss timeout (attempt ${String(agent.bossRetryAttempts)})`,
      );
      const waitLabel = this.formatDuration(agent.bossRetryDelay);
      ensureAgentReady(`Boss escaped - retry in ${waitLabel}`, false);
      return true;
    }

    if (this.mode !== 'normal') {
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
        this.startBossFight();
      }
      agent.bossRetryTimer = 0;
      const attemptNumber = agent.bossRetryAttempts + 1;
      this.recordGodModeBossEvent(
        agent,
        resolvedBossLevel,
        `Starting boss attempt ${String(attemptNumber)}`,
      );
      if (blockedLevel === null) {
        agent.bossRetryAttempts = 0;
      }
      ensureAgentReady(
        blockedLevel !== null
          ? 'Re-engaging boss fight'
          : 'Engaging boss fight',
      );
      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'none';
      }
      return true;
    }

    if (blockedLevel !== null) {
      if (agent.bossRetryTimer > 0) {
        const waitLabel = this.formatDuration(agent.bossRetryTimer);
        ensureAgentReady(`Boss retry in ${waitLabel}`, false);
        return true;
      }

      const retryButton =
        this.bossRetryButton ?? document.getElementById('boss-retry-btn');

      if (retryButton && retryButton.style.display !== 'none') {
        agent.bossRetryTimer = 0;
        retryButton.click();
        const attemptNumber = agent.bossRetryAttempts + 1;
        this.recordGodModeBossEvent(
          agent,
          blockedLevel,
          `Launching boss retry attempt ${String(attemptNumber)}`,
        );
        ensureAgentReady('Retrying boss fight', false);
        return true;
      }

      agent.bossRetryTimer = 0;
      this.recordGodModeBossEvent(
        agent,
        blockedLevel,
        'Opening boss dialog for retry',
      );
      this.showBossDialog();
      ensureAgentReady('Preparing boss retry', false);
      return true;
    }

    const isBossLevel = ColorManager.isBossLevel(state.level);

    if (isBossLevel && !this.ball) {
      agent.bossRetryTimer = 0;
      agent.bossRetryAttempts = 0;
      this.recordGodModeBossEvent(
        agent,
        state.level,
        'Boss detected - preparing fight',
      );
      this.showBossDialog();
      ensureAgentReady('Summoning boss', false);
      return true;
    }

    return false;
  }

  private updateGodModeMetrics(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    agent.metricsTimer = agent.metricsInterval;
    const state = this.store.getState();
    const elapsedSeconds = Math.max(
      0.1,
      (performance.now() - agent.startTimestamp) / 1000,
    );

    const deltaPoints = Math.max(0, state.points - agent.baseline.points);
    const deltaClicks = Math.max(
      0,
      state.stats.totalClicks - agent.baseline.clicks,
    );
    const deltaBosses = Math.max(
      0,
      state.stats.bossesKilled - agent.baseline.bosses,
    );
    const deltaUpgrades =
      Math.max(0, state.stats.totalUpgrades - agent.baseline.upgrades) +
      Math.max(0, state.stats.totalSubUpgrades - agent.baseline.subUpgrades);

    const pointsPerMinute = (deltaPoints / elapsedSeconds) * 60;
    const clicksPerMinute = (deltaClicks / elapsedSeconds) * 60;
    const bossesPerHour = (deltaBosses / elapsedSeconds) * 3600;
    const upgradesPerMinute = (deltaUpgrades / elapsedSeconds) * 60;

    const lastHistoryEntry =
      agent.bossHistory.length > 0
        ? agent.bossHistory[agent.bossHistory.length - 1]
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
      agent.bossRetryTimer > 0
        ? `Next retry in ${this.formatDuration(agent.bossRetryTimer)}`
        : 'Next retry ready';
    const bossLogText = `${bossEventText} | Failures: ${String(
      agent.bossRetryAttempts,
    )} | ${nextRetryText}`;

    this.updateGodModeOverlay(agent, {
      elapsedSeconds,
      pointsPerMinute,
      clicksPerMinute,
      bossesPerHour,
      upgradesPerMinute,
      lastAction: agent.lastAction,
      bossLogText,
    });
  }

  private recordGodModeBossEvent(
    agent: NonNullable<typeof this.godModeAgent>,
    level: number,
    detail: string,
  ): void {
    const timestamp = Date.now();
    const entry = { timestamp, level, detail };
    agent.bossHistory.push(entry);
    if (agent.bossHistory.length > 12) {
      agent.bossHistory.splice(0, agent.bossHistory.length - 12);
    }
    agent.lastAction = detail;
    agent.metricsTimer = 0;
    if (typeof console !== 'undefined' && typeof console.info === 'function') {
      const timeIso = new Date(timestamp).toISOString();
      console.info(
        `[GodMode][Boss][${timeIso}] Level ${String(level)} - ${detail}`,
      );
    }
  }

  private resetGodModeBossTracking(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    agent.bossRetryTimer = 0;
    agent.bossRetryAttempts = 0;
    agent.metricsTimer = 0;
  }

  private updateGodModeOverlay(
    agent: NonNullable<typeof this.godModeAgent>,
    metrics: {
      elapsedSeconds: number;
      pointsPerMinute: number;
      clicksPerMinute: number;
      bossesPerHour: number;
      upgradesPerMinute: number;
      lastAction: string;
      bossLogText: string;
    },
  ): void {
    if (!agent.overlay) return;
    const overlay = agent.overlay;

    const elapsedEl = overlay.querySelector('[data-metric="elapsed"]');
    if (elapsedEl) {
      elapsedEl.textContent = `Elapsed: ${this.formatDuration(
        metrics.elapsedSeconds,
      )}`;
    }

    const bossLogEl = overlay.querySelector('[data-metric="boss-log"]');
    if (bossLogEl) {
      bossLogEl.textContent = `Boss log: ${metrics.bossLogText ? metrics.bossLogText : '—'
        }`;
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
      actionEl.textContent = `Last action: ${metrics.lastAction ? metrics.lastAction : '—'
        }`;
    }
  }

  private logGodModeSnapshot(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    if (typeof console === 'undefined') return;
    const state = this.store.getState();
    const elapsedSeconds = Math.max(
      0.1,
      (performance.now() - agent.startTimestamp) / 1000,
    );

    const deltaPoints = state.points - agent.baseline.points;
    const deltaClicks = state.stats.totalClicks - agent.baseline.clicks;
    const deltaBosses = state.stats.bossesKilled - agent.baseline.bosses;
    const deltaUpgrades = state.stats.totalUpgrades - agent.baseline.upgrades;
    const deltaSubUpgrades =
      state.stats.totalSubUpgrades - agent.baseline.subUpgrades;

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
      'Last action': agent.lastAction,
    });
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
    const width = this.canvas.getWidth();
    const height = this.canvas.getHeight();
    return {
      x: Math.min(Math.max(pos.x, 0), width),
      y: Math.min(Math.max(pos.y, 0), height),
    };
  }

  private getRandomInRange(min: number, max: number): number {
    if (max <= min) return min;
    return Math.random() * (max - min) + min;
  }

  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  public isGodMode(): boolean {
    return this.godMode;
  }

  private handleResize(): void {
    this.background.resize(this.canvas.getWidth(), this.canvas.getHeight());
    this.powerUpSystem.resize(this.canvas.getWidth(), this.canvas.getHeight());
    this.crtFilter.resize();

    if (this.ball) {
      this.ball.x = this.canvas.getCenterX();
      this.ball.y = this.canvas.getCenterY();
    }

    if (this.bossBall) {
      const cx = this.canvas.getCenterX();
      const cy = this.canvas.getCenterY();
      this.bossBall.x = cx;
      this.bossBall.y = cy;
    }

    if (this.ships.length > 0) {
      // Recreate ships to update their orbits and clean up old image elements
      this.createShips();
    }
  }
}
