/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlienBall } from './entities/AlienBall';
import { EnhancedAlienBall, selectEnemyType } from './entities/EnemyTypes';
import { BossBall } from './entities/BossBall';
import { Ship } from './entities/Ship';
import { Canvas } from './render/Canvas';
import { Draw } from './render/Draw';
import { Background } from './render/Background';
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
import type { PowerUpType } from './systems/PowerUpSystem';
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
import { Layout } from './ui/Layout';
import { CreditsModal } from './ui/CreditsModal';
import { GameInfoModal } from './ui/GameInfoModal';
import { PerformanceMonitor } from './ui/PerformanceMonitor';
import { ColorManager } from './math/ColorManager';
import { Settings } from './core/Settings';
import { NotificationSystem } from './ui/NotificationSystem';
import { VisualCustomizationSystem } from './systems/VisualCustomizationSystem';
import { CustomizationModal } from './ui/CustomizationModal';
import { NumberFormatter } from './utils/NumberFormatter';
import type { Vec2, GameMode, ThemeCategory } from './types';
import type { UserSettings } from './core/Settings';

export class Game {
  private canvas: Canvas;
  private draw: Draw;
  private background: Background;
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
  private performanceMonitor: PerformanceMonitor;
  private notificationSystem: NotificationSystem;
  private hud: Hud;
  private shop: Shop;
  private customizationSystem: VisualCustomizationSystem;
  private customizationModal: CustomizationModal;
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
  } | null = null;

  // Boss retry system
  private bossRetryButton: HTMLElement | null = null;
  private blockedOnBossLevel: number | null = null;

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

    // Handle window resize to reposition game elements
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    this.upgradeSystem = new UpgradeSystem();
    this.laserSystem = new LaserSystem();
    this.particleSystem = new ParticleSystem();
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

    // Setup power-up spawn notifications
    this.powerUpSystem.setOnPowerUpSpawn((type: PowerUpType) => {
      const config = this.powerUpSystem.getBuffName(type);
      this.notificationSystem.show(
        `⚡ Power-Up Spawned: ${config}`,
        'success',
        3000,
      );
    });

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

    // Set initial background theme (before first render)
    const bgColors = this.customizationSystem.getBackgroundColors();
    const initialBgTheme =
      this.customizationSystem.getSelectedTheme('background');
    const initialThemeId: string = initialBgTheme?.id ?? 'default_background';
    this.background.setThemeColors(bgColors, initialThemeId);

    // Initialize customization modal
    this.customizationModal = new CustomizationModal(this.customizationSystem);
    this.customizationModal.updateState(initialState);
    this.customizationModal.setOnThemeChange((category, themeId) => {
      // Save theme selection
      const currentState = this.store.getState();
      if (!currentState.selectedThemes) {
        currentState.selectedThemes = {};
      }
      currentState.selectedThemes[category] = themeId;
      this.store.setState(currentState);
      Save.save(currentState);

      // Update background immediately if background theme changed
      if (category === 'background') {
        const newBgColors = this.customizationSystem.getBackgroundColors();
        const newBgTheme =
          this.customizationSystem.getSelectedTheme('background');
        const newThemeId: string = newBgTheme?.id ?? 'default_background';
        this.background.setThemeColors(newBgColors, newThemeId);
      }
    });

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
    this.settingsModal.updateGraphicsToggles(
      this.userSettings.highGraphics,
      this.userSettings.showShipLasers,
      this.userSettings.showDamageNumbers,
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
    // Configure UpgradeSystem to access game state for discounts
    this.upgradeSystem.setGameStateGetter(() => this.store.getState());

    this.shop = new Shop(this.store, this.upgradeSystem);
    this.shop.setSoundManager(this.soundManager);
    this.shop.setMissionSystem(this.missionSystem);
    this.shop.setAscensionSystem(this.ascensionSystem);

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
    this.setupCreditsButton();
    this.setupDiscordButton();
    this.setupGameInfoButton();
    this.setupCustomizationButton();
    Layout.setupResetButton(() => {
      this.resetGame();
    });
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
      this.bossRetryButton.innerHTML =
        '<span class="hud-button-icon">⚔️</span><span class="hud-button-text">Retry Boss</span>';
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
    // Pause combo to preserve it during transition back to normal
    this.comboSystem.pause();

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
    // Check for offline progress before starting
    this.checkOfflineProgress();

    // Initialize page title
    const state = this.store.getState();
    this.updatePageTitle(state.points);

    // Start background soundtrack
    this.soundManager.startSoundtrack();

    this.loop.start();
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
      ascensionBtn.innerHTML =
        '<span class="hud-button-icon">🌟</span><span class="hud-button-text">Ascend</span>';
      ascensionBtn.addEventListener('click', () => {
        this.ascensionModal.show();
      });

      // Update button visibility based on whether ascension is unlocked
      const updateAscensionBtn = () => {
        const state = this.store.getState();
        const canAscend = this.ascensionSystem.canAscend(state);
        ascensionBtn.style.display =
          canAscend || state.prestigeLevel > 0 ? 'block' : 'none';
      };

      this.store.subscribe(updateAscensionBtn);
      updateAscensionBtn();

      buttonsContainer.appendChild(ascensionBtn);
    }
  }

  private setupSettingsButton(): void {
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      const settingsBtn = document.createElement('button');
      settingsBtn.id = 'settings-button';
      settingsBtn.className = 'hud-button';
      settingsBtn.setAttribute('data-icon', '⚙️');
      settingsBtn.setAttribute('data-text', 'Settings');
      settingsBtn.setAttribute('aria-label', 'Open Settings');
      settingsBtn.setAttribute('aria-keyshortcuts', 'S');
      settingsBtn.innerHTML =
        '<span class="hud-button-icon">⚙️</span><span class="hud-button-text">Settings</span>';
      settingsBtn.addEventListener('click', () => {
        this.settingsModal.show();
      });
      buttonsContainer.appendChild(settingsBtn);
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
      missionsBtn.innerHTML =
        '<span class="hud-button-icon">🎯</span><span class="hud-button-text">Missions</span>';
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
      artifactsBtn.innerHTML =
        '<span class="hud-button-icon">✨</span><span class="hud-button-text">Artifacts</span>';
      artifactsBtn.addEventListener('click', () => {
        this.artifactsModal.show();
      });
      buttonsContainer.appendChild(artifactsBtn);
    }
  }

  private setupCreditsButton(): void {
    // Add Credits button to the shop panel instead of HUD (more space)
    const shopPanel = document.getElementById('shop-panel');
    const resetContainer = document.getElementById('reset-container');

    if (shopPanel && resetContainer) {
      const creditsBtn = document.createElement('button');
      creditsBtn.id = 'credits-button';
      creditsBtn.className = 'shop-button';
      creditsBtn.textContent = '🎮 Credits & Share';
      creditsBtn.style.marginBottom = '10px';
      creditsBtn.style.marginTop = '10px';
      creditsBtn.style.width = '100%';
      creditsBtn.addEventListener('click', () => {
        this.creditsModal.show();
      });

      // Insert before reset button
      shopPanel.insertBefore(creditsBtn, resetContainer);
    }
  }

  private setupDiscordButton(): void {
    const shopPanel = document.getElementById('shop-panel');
    const resetContainer = document.getElementById('reset-container');

    if (shopPanel && resetContainer) {
      const discordBtn = document.createElement('button');
      discordBtn.id = 'discord-button';
      discordBtn.className = 'shop-button discord-button';
      discordBtn.textContent = '💬 Join Discord';
      discordBtn.style.color = '#ffffff';
      discordBtn.style.marginBottom = '10px';
      discordBtn.style.width = '100%';
      discordBtn.style.background =
        'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)';
      discordBtn.style.border = '2px solid #5865F2';
      discordBtn.addEventListener('click', () => {
        window.open('https://discord.gg/bfxYsvnw2S', '_blank');
      });

      shopPanel.insertBefore(discordBtn, resetContainer);
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
      infoBtn.innerHTML =
        '<span class="hud-button-icon">📖</span><span class="hud-button-text">Game Info</span>';
      infoBtn.addEventListener('click', () => {
        this.gameInfoModal.show();
      });
      hudElement.appendChild(infoBtn);
    }
  }

  private setupCustomizationButton(): void {
    const buttonsContainer = document.getElementById('hud-buttons-container');
    if (buttonsContainer) {
      const customizeBtn = document.createElement('button');
      customizeBtn.id = 'customization-button';
      customizeBtn.className = 'hud-button';
      customizeBtn.setAttribute('data-icon', '🎨');
      customizeBtn.setAttribute('data-text', 'Customize');
      customizeBtn.setAttribute('aria-label', 'Open Visual Customization');
      customizeBtn.setAttribute('aria-keyshortcuts', 'C');
      customizeBtn.innerHTML =
        '<span class="hud-button-icon">🎨</span><span class="hud-button-text">Customize</span>';
      customizeBtn.addEventListener('click', () => {
        const state = this.store.getState();
        this.customizationModal.updateState(state);
        this.customizationModal.show();
      });
      buttonsContainer.appendChild(customizeBtn);
    }
  }

  private performAscension(): void {
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
    const newPrestigePoints = state.prestigePoints + prestigeGain;
    const newPrestigeLevel = state.prestigeLevel + 1;

    // Update prestige stats
    keepStats.totalPrestige = newPrestigeLevel;

    // Get starting level from prestige upgrades
    const startingLevel = this.ascensionSystem.getStartingLevel(state);

    // Reset totalSubUpgrades in stats (special upgrades are reset)
    keepStats.totalSubUpgrades = 0;

    // Create a completely fresh state (NOT from save file)
    const freshState: import('./types').GameState = {
      points: 0,
      shipsCount: 1,
      attackSpeedLevel: 0,
      autoFireUnlocked: false,
      pointMultiplierLevel: 0,
      critChanceLevel: 0,
      resourceGenLevel: 0,
      xpBoostLevel: 0,
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
      mutationEngineLevel: 0,
      energyCoreLevel: 0,
      cosmicKnowledgeLevel: 0,
      discoveredUpgrades: { ship: true }, // Reset discoveries, ship always visible
      // Track highest level for ascension point calculation
      highestLevelReached: newHighestLevel,
    };

    // Clear local boss block state
    this.blockedOnBossLevel = null;
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    this.store.setState(freshState);
    Save.save(this.store.getState());

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
    this.bossBall = new BossBall(cx, cy, radius, hp);
    this.ball = null;
  }

  private createShips(): void {
    const state = this.store.getState();
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const orbitRadius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.4;

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
      const config = this.powerUpSystem.getBuffName(collectedPowerUp);
      // Get icon directly using a simple map to avoid type issues
      const iconMap: Record<string, string> = {
        points: '💰',
        damage: '⚔️',
        speed: '⚡',
        multishot: '✨',
        critical: '💥',
      };
      const powerUpIcon = iconMap[collectedPowerUp] ?? '⚡';

      // Show notification using the notification system (same as missions and powerup spawns)
      const notificationMessage: string =
        powerUpIcon + ' ' + config + ' Activated!';
      this.notificationSystem.show(notificationMessage, 'success', 3000);

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
    if (this.mode === 'normal' && this.ball && this.ball.currentHp > 0) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit();
      this.fireVolley();
    } else if (
      this.mode === 'boss' &&
      this.bossBall &&
      this.bossBall.currentHp > 0
    ) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit();
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

  private fireVolley(): void {
    const state = this.store.getState();

    // Main ship always fires regular projectiles (even in beam mode)
    // This provides click feedback and visual variety
    // Use getPointsPerHit to ensure clicks and ships deal the same base damage
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
    const laserThemeId = this.customizationSystem.getLaserThemeId();

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
    const dx = center.x - origin.x;
    const dy = center.y - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      return center;
    }

    const nx = dx / distance;
    const ny = dy / distance;

    return {
      x: center.x - nx * radius,
      y: center.y - ny * radius,
    };
  }

  private getLaserVisuals(state: import('./types').GameState): {
    isCrit: boolean;
    color: string;
    width: number;
  } {
    let color = this.customizationSystem.getLaserColor(state, false);
    let width = 2.5;
    let isCrit = false;

    let critChance = this.upgradeSystem.getCritChance(state);
    critChance += this.powerUpSystem.getCritChanceBonus() * 100;
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      color = '#ffff00';
      width = 3.5;
      this.store.getState().stats.criticalHits++;
      return { isCrit, color, width };
    }

    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        isCrit = true;
        color = '#ffff00';
        width = 4.0;
        this.store.getState().stats.criticalHits++;
        return { isCrit, color, width };
      }
    }

    return { isCrit, color, width };
  }

  private getLaserVisualsNoCrit(state: import('./types').GameState): {
    isCrit: boolean;
    color: string;
    width: number;
  } {
    // Small ships cannot crit - always return non-crit visuals
    const color = this.customizationSystem.getLaserColor(state, false);
    const width = 2.5;
    return { isCrit: false, color, width };
  }

  private handleDamage(
    damage: number,
    isCrit: boolean = false,
    isFromShip: boolean = false,
    hitDirection?: Vec2,
    isBeam?: boolean,
  ): void {
    let finalDamage = damage;

    // Apply critical damage multiplier
    if (isCrit) {
      const state = this.store.getState();
      const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
      finalDamage = damage * critMultiplier;
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
          const baseCount = hasClickDamage ? 8 : 3; // More for clicks
          const damageCount = Math.floor(damageForParticles / 50); // Lower threshold
          const particleCount = Math.max(
            baseCount,
            Math.min(25, baseCount + damageCount),
          );

          this.particleSystem.spawnParticles({
            x: this.ball.x,
            y: this.ball.y,
            count: particleCount,
            color: themeParticleColor,
            speed: 80,
            size: 3,
            life: 0.8,
            glow: useGlow,
            style: particleStyle,
          });
        }
      }

      if (broken) {
        let killReward = this.ball.maxHp;
        if (this.ball instanceof EnhancedAlienBall) {
          killReward = this.ball.getPointsReward(killReward);
        }
        killReward *= this.powerUpSystem.getPointsMultiplier();
        const roundedReward = Math.max(1, Math.floor(killReward));
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

    let bonusXP = upgradeBonus * baseXP;
    bonusXP *= 1 + artifactBonus;

    if (this.blockedOnBossLevel !== null) {
      bonusXP *= 0.1;
    }

    state.experience += bonusXP;

    let leveledUp = false;
    if (this.blockedOnBossLevel === null) {
      while (state.experience >= ColorManager.getExpRequired(state.level)) {
        const expRequired = ColorManager.getExpRequired(state.level);
        state.experience -= expRequired;
        state.level++;
        this.store.updateMaxLevel();

        // Note: highestLevelReached is NOT updated here - it only tracks the highest level
        // from PREVIOUS ascensions, not the current run. It's updated in performAscension()
        // after calculating prestige points.

        leveledUp = true;
      }
    }

    if (leveledUp) {
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

    const state = this.store.getState();
    this.store.incrementBossKill();
    this.missionSystem.trackBossKill();

    const baseReward = state.level * 10000;
    const bonusMultiplier = 1 + this.comboSystem.getCombo() * 0.01;
    let bossReward = Math.floor(baseReward * bonusMultiplier);

    bossReward *= 1 + this.artifactSystem.getPointsBonus();
    // Apply power-up points multiplier
    bossReward *= this.powerUpSystem.getPointsMultiplier();

    this.store.addPoints(bossReward);

    const artifactXPBonus = this.artifactSystem.getXPBonus();

    let bossXP = Math.floor(state.level * 50);
    bossXP *= 1 + artifactXPBonus;

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

    while (state.experience >= ColorManager.getExpRequired(state.level)) {
      const expRequired = ColorManager.getExpRequired(state.level);
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();

      // Note: highestLevelReached is NOT updated here - it only tracks the highest level
      // from PREVIOUS ascensions, not the current run. It's updated in performAscension()
      // after calculating prestige points.
    }

    this.store.setState(state);

    this.soundManager.playBossDefeat();
    // Pause combo to preserve it during transition back to normal
    this.comboSystem.pause();
    this.hideBossTimer();

    this.blockedOnBossLevel = null;
    state.blockedOnBossLevel = null;
    this.store.setState(state);

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
    // Pause combo instead of resetting it - will resume after boss fight
    this.comboSystem.pause();

    // Hide timeout modal if visible
    const timeoutModal = document.getElementById('boss-timeout-modal');
    if (timeoutModal) {
      timeoutModal.style.display = 'none';
    }

    // Reset timeout flag
    this.bossTimeoutHandled = false;

    setTimeout(() => {
      if (this.mode === 'transition') {
        this.createBoss();
        this.mode = 'boss';
        this.startBossTimer();
        // Resume combo when boss fight actually starts (not during transition)
        this.comboSystem.resume();
      }
    }, this.transitionDuration * 500);
  }

  private startTransitionToNormal(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.bossBall = null;

    // Cleanup systems for memory management
    this.cleanup();

    // Faster transition back to normal - reduced delay
    setTimeout(() => {
      if (this.mode === 'transition') {
        this.mode = 'normal';
        this.createBall();
        // Resume combo when returning to normal gameplay
        this.comboSystem.resume();
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

  private update(dt: number): void {
    dt = dt * this.gameSpeed;
    this.frameCount++;

    // Update WebGL renderer time for animations
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer = this.canvas.getWebGLRenderer();
    if (webglRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      webglRenderer.updateTime(dt);
    }

    const state = this.store.getState();

    if (this.godMode) {
      this.updateGodMode(dt);
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
        this.hud.updateStats(dps, passiveGen, critChance, critBonus);

        // Update power-up buffs display
        const activeBuffs = this.powerUpSystem.getActiveBuffs();
        this.hud.updatePowerUpBuffs(activeBuffs);

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
        const beamColor = this.customizationSystem.getLaserColor(state, false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const beamThemeId = this.customizationSystem.getLaserThemeId();
        const beamWidth = 2;

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
    this.autoFireSystem.update(
      dt,
      true, // Auto-fire always enabled for non-main ships
      cooldown,
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
        state.autoBuyEnabled = false;
      }
      this.autoBuyTimer = 0;
    }

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
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
    // Apply background theme (only update if changed)
    const bgColors = this.customizationSystem.getBackgroundColors();
    const currentBgTheme =
      this.customizationSystem.getSelectedTheme('background');
    const themeId: string = currentBgTheme?.id ?? 'default_background';
    this.background.setThemeColors(bgColors, themeId);

    // Clear canvas (WebGL or 2D)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer: WebGLRenderer | null = this.canvas.getWebGLRenderer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (this.canvas.isWebGLEnabled() && webglRenderer !== null) {
      // Clear WebGL canvas
      webglRenderer.clear(bgColors.primary);
      // Also clear offscreen 2D canvas for background/text
      this.canvas.clear(bgColors.primary);
    } else {
      this.canvas.clear(bgColors.primary);
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
    const state = this.store.getState();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const webglRenderer = this.canvas.getWebGLRenderer();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const useWebGL = this.canvas.isWebGLEnabled() && webglRenderer !== null;

    if (useWebGL) {
      // Use WebGL instanced rendering for ships (MUCH faster - single draw call for all ships)
      const visuals = this.customizationSystem.getShipColors(state);

      for (const ship of this.ships) {
        // Make ships bigger and more visible
        const size = ship.isMainShip ? 20 : 14; // Increased from 13/8 to 20/14
        const shipColor = visuals.fillColor;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const themeId = visuals.themeId;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.draw.addShip(
          ship.x,
          ship.y,
          ship.angle,
          size,
          shipColor,
          ship.isMainShip,
          themeId,
        );
      }
    } else {
      // Fallback to 2D canvas rendering
      for (const ship of this.ships) {
        // Apply customization
        const visuals = this.customizationSystem.getShipColors(state);
        // Store visuals for ship to use
        (ship as any).customVisuals = visuals;
        ship.draw(this.draw, state);
      }
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
      this.powerUpSystem.render(ctx);
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
    this.showBossDialog();
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
    };
    this.notificationSystem.show(
      'God Mode autopilot engaged.',
      'info',
      2400,
    );
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
      <div class="metric" data-metric="last-action" style="margin-top:8px;font-size:11px;color:#ddd;">
        Last action: —
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  private updateGodMode(dt: number): void {
    if (!this.godModeAgent) return;
    const agent = this.godModeAgent;

    agent.clickTimer -= dt;
    agent.upgradeTimer -= dt;
    agent.powerUpTimer -= dt;
    agent.metricsTimer -= dt;
    agent.logTimer -= dt;
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

    const powerUpClicked = this.runGodModePowerUps(agent);
    if (!powerUpClicked && agent.breakTimer <= 0) {
      this.runGodModeClicking(agent);
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
      available[Math.floor(Math.random() * available.length)] ??
      available[0];
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

    if (agent.clickTimer > 0) return;

    const jitterScale = this.mode === 'boss' ? 0.7 : 1;
    const clickPos = this.withJitter(
      { x: targetEntity.x, y: targetEntity.y },
      agent.jitterRadius * jitterScale,
    );
    this.handleClick(clickPos);

    if (agent.burstShotsRemaining > 0) {
      agent.burstShotsRemaining--;
      agent.clickTimer = agent.burstShotsRemaining
        ? this.getRandomInRange(0.05, 0.1)
        : this.getRandomInRange(
            agent.clickIntervalRange.min,
            agent.clickIntervalRange.max,
          );
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
        agent.clickIntervalRange.min,
        agent.clickIntervalRange.max,
      );
    }
  }

  private runGodModeUpgrades(
    agent: NonNullable<typeof this.godModeAgent>,
  ): void {
    const beforeState = this.store.getState();
    const beforeUpgrades = beforeState.stats.totalUpgrades;
    const beforeSubUpgrades = beforeState.stats.totalSubUpgrades;

    this.shop.checkAndBuyAffordableUpgrades(true);

    const afterState = this.store.getState();
    if (afterState.stats.totalUpgrades > beforeUpgrades) {
      const diff = afterState.stats.totalUpgrades - beforeUpgrades;
      agent.lastAction =
        diff > 1 ? `Bought ${String(diff)} upgrades` : 'Bought upgrade';
    } else if (afterState.stats.totalSubUpgrades > beforeSubUpgrades) {
      agent.lastAction = 'Unlocked special upgrade';
    }

    agent.upgradeTimer = this.getRandomInRange(
      agent.upgradeIntervalRange.min,
      agent.upgradeIntervalRange.max,
    );
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

    this.updateGodModeOverlay(agent, {
      elapsedSeconds,
      pointsPerMinute,
      clicksPerMinute,
      bossesPerHour,
      upgradesPerMinute,
      lastAction: agent.lastAction,
    });
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
      actionEl.textContent = `Last action: ${
        metrics.lastAction ? metrics.lastAction : '—'
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
    const deltaUpgrades =
      state.stats.totalUpgrades - agent.baseline.upgrades;
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
      this.createShips();
    }
  }
}
