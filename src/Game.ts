/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlienBall } from './entities/AlienBall';
import { EnhancedAlienBall, type EnemyType } from './entities/EnemyTypes';
import { BossBall } from './entities/BossBall';
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
import { i18n } from './core/I18n';
import { VisualCustomizationSystem } from './systems/VisualCustomizationSystem';
import { PerformanceModeManager } from './systems/PerformanceModeManager';
import type { Vec2, GameMode, ThemeCategory } from './types';
import type { UserSettings } from './core/Settings';
import {
  COMBAT,
  FRAME_INTERVALS,
  SAVE,
  AUTO_BUY,
  BOSS,
  COMBO_PAUSE,
  UI_THROTTLE,
} from './config/constants';
import {
  BossManager,
  CombatManager,
  InputManager,
  RenderManager,
  EntityManager,
  GodModeManager,
} from './managers';

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
  private bossManager: BossManager;
  private combatManager: CombatManager;
  private inputManager: InputManager;
  private renderManager: RenderManager;
  private entityManager: EntityManager;
  private godModeManager: GodModeManager;
  private artifactsButton: HTMLElement | null = null;
  private saveTimer = 0;
  private saveInterval = SAVE.AUTO_SAVE_INTERVAL;
  private autoBuyTimer = 0;
  private autoBuyInterval = AUTO_BUY.CHECK_INTERVAL;
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
  private swarmConnectionFromIndex = 0;
  private swarmConnectionToIndex = 1;
  private swarmConnectionProgress = 0; // 0 to 1 for smooth animation
  private swarmVisitedShips: Set<number> = new Set(); // Track visited ships to ensure complete cycle
  private swarmPreviousFromIndex = -1; // Track previous source to prevent bouncing back

  // Second connection for Fleet Synergy Matrix
  private swarmConnection2FromIndex = 0;
  private swarmConnection2ToIndex = 1;
  private swarmConnection2Progress = 0; // 0 to 1 for smooth animation
  private swarm2VisitedShips: Set<number> = new Set(); // Track visited ships for second connection
  private swarm2PreviousFromIndex = -1; // Track previous source for second connection

  // Third connection for Quantum Network Matrix
  private swarmConnection3FromIndex = 0;
  private swarmConnection3ToIndex = 1;
  private swarmConnection3Progress = 0; // 0 to 1 for smooth animation
  private swarm3VisitedShips: Set<number> = new Set(); // Track visited ships for third connection
  private swarm3PreviousFromIndex = -1; // Track previous source for third connection

  // Fourth connection for Dual Network Expansion (level 55)
  private swarmConnection4FromIndex = 0;
  private swarmConnection4ToIndex = 1;
  private swarmConnection4Progress = 0; // 0 to 1 for smooth animation
  private swarm4VisitedShips: Set<number> = new Set(); // Track visited ships for fourth connection
  private swarm4PreviousFromIndex = -1; // Track previous source for fourth connection

  // Fifth connection for Dual Network Expansion (level 55)
  private swarmConnection5FromIndex = 0;
  private swarmConnection5ToIndex = 1;
  private swarmConnection5Progress = 0; // 0 to 1 for smooth animation
  private swarm5VisitedShips: Set<number> = new Set(); // Track visited ships for fifth connection
  private swarm5PreviousFromIndex = -1; // Track previous source for fifth connection

  // Sixth connection for Crimson Network Protocol (level 90)
  private swarmConnection6FromIndex = 0;
  private swarmConnection6ToIndex = 1;
  private swarmConnection6Progress = 0; // 0 to 1 for smooth animation
  private swarm6VisitedShips: Set<number> = new Set(); // Track visited ships for sixth connection
  private swarm6PreviousFromIndex = -1; // Track previous source for sixth connection

  // Seventh connection for Crimson Network Protocol (level 90)
  private swarmConnection7FromIndex = 0;
  private swarmConnection7ToIndex = 1;
  private swarmConnection7Progress = 0; // 0 to 1 for smooth animation
  private swarm7VisitedShips: Set<number> = new Set(); // Track visited ships for seventh connection
  private swarm7PreviousFromIndex = -1; // Track previous source for seventh connection

  // Eighth connection for Crimson Network Protocol (level 90)
  private swarmConnection8FromIndex = 0;
  private swarmConnection8ToIndex = 1;
  private swarmConnection8Progress = 0; // 0 to 1 for smooth animation
  private swarm8VisitedShips: Set<number> = new Set(); // Track visited ships for eighth connection
  private swarm8PreviousFromIndex = -1; // Track previous source for eighth connection

  // Active Skill States
  private midasActive = false;
  private overclockTimer = 0;
  private mode: GameMode = 'normal';
  private transitionTime = 0;
  private transitionDuration = BOSS.TRANSITION_DURATION;
  private userSettings: UserSettings = Settings.getDefault();

  // Space key attack holding
  private spaceKeyHeld = false;
  private spaceAttackCooldown = 0;
  private readonly SPACE_ATTACK_RATE = COMBAT.SPACE_ATTACK_RATE;

  // Satellite logic
  private satelliteAngle = 0;
  private readonly SATELLITE_ORBIT_SPEED = 0.5;
  private readonly SATELLITE_ORBIT_RADIUS = 250;
  private satelliteMissileTimer = 0;
  private readonly SATELLITE_MISSILE_INTERVAL = 5; // 5 seconds
  private satelliteMissiles: Array<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    startX: number;
    startY: number;
    progress: number;
    damage: number;
    speed: number; // Individual missile speed
    curveDirection: number; // Direction of curve (-1 to 1, determines left/right curve)
    curveAmount: number; // Amount of curve (0.2 to 0.5)
  }> = [];
  private satelliteImage: HTMLImageElement | null = null;

  // Debug controls
  private gameSpeed = 1.0;

  // Boss retry system (managed by BossManager)
  // private blockedOnBossLevel: number | null = null; // Now in BossManager

  // Combo pause skill system
  private comboPauseButton: HTMLElement | null = null;
  private comboPauseActive = false;
  private comboPauseDuration = 0; // Remaining duration in seconds
  private comboPauseCooldown = 0; // Remaining cooldown in seconds
  private readonly COMBO_PAUSE_DURATION = COMBO_PAUSE.DURATION;
  private readonly COMBO_PAUSE_COOLDOWN = COMBO_PAUSE.COOLDOWN;

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
  private batchInterval = COMBAT.DAMAGE_BATCH_INTERVAL;

  // Frame counting for throttling expensive operations
  private frameCount = 0;
  private readonly BOSS_TIMER_UPDATE_INTERVAL = FRAME_INTERVALS.BOSS_TIMER_UPDATE;
  private readonly ACHIEVEMENT_CHECK_INTERVAL = FRAME_INTERVALS.ACHIEVEMENT_CHECK;
  private readonly HUD_STATS_UPDATE_INTERVAL = FRAME_INTERVALS.HUD_STATS_UPDATE;
  private readonly BEAM_RECALC_INTERVAL = FRAME_INTERVALS.BEAM_RECALC;

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

    // Apply screen shake setting to body class
    if (!this.userSettings.screenShakeEnabled) {
      document.body.classList.add('no-screen-shake');
    }

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

    // Load satellite image
    this.satelliteImage = new Image();
    this.satelliteImage.src = images.satellite;

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
        i18n.t('messages.missionComplete', { title: mission.title }),
        'mission',
        4000,
      );
    });

    // Setup daily mission reset notifications
    this.missionSystem.setOnDailyReset(() => {
      this.notificationSystem.show(
        i18n.t('messages.newDailyMissions'),
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
        this.godModeManager.toggle();
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
        // Disable boss visual effects when low graphics mode is enabled
        if (this.bossEffectFilter.isEnabled()) {
          this.bossEffectFilter.disable(0.5);
        }
      }
      // Note: Boss effects will automatically re-enable on next boss fight if graphics are turned back on
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
    this.settingsModal.setScreenShakeCallback((enabled: boolean) => {
      this.userSettings.screenShakeEnabled = enabled;
      // Add/remove CSS class to disable boss shake animations
      if (enabled) {
        document.body.classList.remove('no-screen-shake');
      } else {
        document.body.classList.add('no-screen-shake');
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
    this.settingsModal.setFontFamilyCallback((fontFamily: string) => {
      this.userSettings.fontFamily = fontFamily;
      Settings.save(this.userSettings);
      // Apply font globally
      document.documentElement.style.setProperty('--font-family', fontFamily);
    });
    this.settingsModal.setOldShopUICallback((enabled: boolean) => {
      this.userSettings.useOldShopUI = enabled;
      Settings.save(this.userSettings);
      // Load/unload old CSS stylesheet
      import('./utils/stylesheetLoader').then(({ toggleOldStylesheet }) => {
        toggleOldStylesheet(enabled);
      });
      // Force shop to re-render with new UI mode
      this.shop.setUseOldUI(enabled);
      this.shop.forceRefresh();
    });

    // Apply loaded settings
    // Apply font family from settings
    if (this.userSettings.fontFamily) {
      document.documentElement.style.setProperty('--font-family', this.userSettings.fontFamily);
    }
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
      this.userSettings.screenShakeEnabled,
      this.userSettings.lcdFilterEnabled,
      this.userSettings.useOldShopUI,
    );
    // Set initial font family in settings modal
    if (this.userSettings.fontFamily) {
      this.settingsModal.setFontFamily(this.userSettings.fontFamily);
    }
    // Setup stats panel button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.setAttribute('aria-label', 'Open Statistics');

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.statsTooltip');
      statsBtn.appendChild(tooltip);

      statsBtn.addEventListener('click', () => {
        this.statsPanel.show();
      });
    }
    this.hud = new Hud();
    this.hud.onSkillActivate = (id) => {
      // Prevent activation during boss mode
      if (this.mode === 'boss') {
        this.hud.showMessage(
          i18n.t('hud.cannotUseSkillsBoss'),
          '#ff4444',
          2000,
        );
        return;
      }

      const result = this.artifactSystem.activateArtifact(id);
      if (result.success && result.effect) {
        this.handleActiveEffect(result.effect);
      } else if (result.reason === 'On cooldown') {
        this.hud.showMessage(i18n.t('hud.skillCooldown'), '#ffaa00', 1500);
      }
    };
    // Configure UpgradeSystem to access game state for discounts
    this.upgradeSystem.setGameStateGetter(() => this.store.getState());

    this.shop = new Shop(this.store, this.upgradeSystem);
    this.shop.setSoundManager(this.soundManager);
    this.shop.setMissionSystem(this.missionSystem);
    this.shop.setAscensionSystem(this.ascensionSystem);
    this.shop.setUseOldUI(this.userSettings.useOldShopUI);

    // Load old stylesheet if setting is enabled
    if (this.userSettings.useOldShopUI) {
      import('./utils/stylesheetLoader').then(({ toggleOldStylesheet }) => {
        toggleOldStylesheet(true);
      });
    }

    this.shop.setOnPurchase(() => {
      this.handleUpgradePurchase();
    });

    this.achievementSystem.setOnUnlock((achievement) => {
      this.achievementSnackbar.show(achievement);
      this.soundManager.playAchievement();
    });
    this.achievementSystem.updateFromState(this.store.getState());

    // Initialize BossManager
    this.bossManager = new BossManager(
      {
        store: this.store,
        soundManager: this.soundManager,
        hud: this.hud,
        canvas: this.canvas,
        artifactsModal: this.artifactsModal,
      },
      {
        onStartTransitionToBoss: () => {
          this.startTransitionToBoss();
        },
        onStartTransitionToNormal: () => {
          this.startTransitionToNormal();
        },
        onBossCreated: (boss) => {
          this.bossBall = boss;
        },
        onBossTimeout: () => {
          // Game-specific cleanup when boss timeout occurs
          // Disable boss effect immediately when timeout occurs
          this.bossEffectFilter.disable(0.5);
          // Pause combo to preserve it during transition back to normal (unless combo pause skill is active)
          if (!this.comboPauseActive) {
            this.comboSystem.pause();
          }
        },
      },
    );
    this.bossManager.setupUI();

    // Initialize EntityManager
    this.entityManager = new EntityManager(
      {
        canvas: this.canvas,
        store: this.store,
      },
      {
        onBallCreated: (ball) => {
          this.ball = ball;
        },
      },
    );

    // Initialize RenderManager
    this.renderManager = new RenderManager({
      canvas: this.canvas,
      draw: this.draw,
      background: this.background,
      customizationSystem: this.customizationSystem,
      userSettings: this.userSettings,
    });

    // Initialize CombatManager
    this.combatManager = new CombatManager(
      {
        upgradeSystem: this.upgradeSystem,
        artifactSystem: this.artifactSystem,
        powerUpSystem: this.powerUpSystem,
        comboSystem: this.comboSystem,
        customizationSystem: this.customizationSystem,
        store: this.store,
      },
      {
        onCriticalHit: () => {
          this.store.getState().stats.criticalHits++;
        },
        onTutorialClick: () => {
          this.tutorialSystem.onAlienClicked();
        },
      },
    );

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

    // Initialize game state (may show boss retry button if player is blocked)
    this.initGame();

    // Initialize InputManager
    this.inputManager = new InputManager(
      {
        store: this.store,
        notificationSystem: this.notificationSystem,
        achievementsModal: this.achievementsModal,
        ascensionModal: this.ascensionModal,
        missionsModal: this.missionsModal,
        artifactsModal: this.artifactsModal,
        statsPanel: this.statsPanel,
        settingsModal: this.settingsModal,
        creditsModal: this.creditsModal,
        gameInfoModal: this.gameInfoModal,
        thankYouModal: this.thankYouModal,
      },
      {
        onSpaceKeyDown: () => {
          if (!this.spaceKeyHeld) {
            this.spaceKeyHeld = true;
            this.spaceAttackCooldown = 0; // Allow immediate first attack
          }
        },
        onSpaceKeyUp: () => {
          this.spaceKeyHeld = false;
        },
      },
    );

    // Initialize GodModeManager
    this.godModeManager = new GodModeManager(
      {
        store: this.store,
        notificationSystem: this.notificationSystem,
        shop: this.shop,
        powerUpSystem: this.powerUpSystem,
        comboSystem: this.comboSystem,
        upgradeSystem: this.upgradeSystem,
        bossManager: this.bossManager,
        canvas: this.canvas,
      },
      {
        handleClick: (pos) => {
          this.handleClick(pos);
        },
        showBossDialog: () => {
          this.showBossDialog();
        },
        startBossFight: () => {
          this.startBossFight();
        },
        startTransitionToNormal: () => {
          this.startTransitionToNormal();
        },
        getGameMode: () => {
          return this.mode;
        },
        getBall: () => {
          return this.ball;
        },
        getBossBall: () => {
          return this.bossBall;
        },
        onBossDefeated: (defeatedBossLevel) => {
          this.godModeManager.recordBossDefeated(defeatedBossLevel);
        },
      },
    );

    // Setup remaining UI and input
    this.setupInput();
    this.inputManager.setupKeyboard();
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

  // Boss setup methods removed - now handled by BossManager.setupUI()
  // Boss timer methods removed - now handled by BossManager
  // Boss timeout handling moved to BossManager with callbacks
  // retryBossFight() removed - now handled directly by BossManager

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
          `Offline Progress!\nAway: ${timeText}\nReward: +${formattedReward}`,
          '#5c5c5cff',
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

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.achievementsTooltip');
      achievementsBtn.appendChild(tooltip);

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

      // Add tooltip with star icon
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.innerHTML = `ASCENSION`;
      ascensionBtn.appendChild(tooltip);

      ascensionBtn.addEventListener('click', () => {
        this.ascensionModal.show();
      });

      // Always show the button from the start (visible from level 1)
      ascensionBtn.style.display = 'block';

      // Track if prestige was previously unlocked to detect when it gets unlocked
      let wasPrestigeUnlocked = false;
      let wasMeaningOfLifeOwned = false;

      // Update button visibility - button is always visible from level 1
      const updateAscensionBtn = () => {
        const state = this.store.getState();
        const hasMeaningOfLife = state.subUpgrades['meaning_of_life'] === true;
        // Button is always visible, but check if prestige was just unlocked
        const isUnlocked = hasMeaningOfLife || state.prestigeLevel > 0;

        // Check if prestige was just unlocked via meaning_of_life purchase
        const isNowUnlocked =
          isUnlocked &&
          !wasPrestigeUnlocked &&
          hasMeaningOfLife &&
          !wasMeaningOfLifeOwned;

        // Always show the button
        ascensionBtn.style.display = 'block';

        if (isNowUnlocked) {
          // Animate the button appearing
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
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.settingsTooltip');
      settingsBtn.appendChild(tooltip);

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

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.missionsTooltip');
      missionsBtn.appendChild(tooltip);

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

      // Store reference to button
      this.artifactsButton = artifactsBtn;

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.artifactsTooltip');
      artifactsBtn.appendChild(tooltip);

      artifactsBtn.addEventListener('click', () => {
        // Remove glow/animation when clicked
        this.removeArtifactNotification();
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

      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'hud-tooltip';
      tooltip.textContent = i18n.t('hud.gameInfoTooltip');
      infoBtn.appendChild(tooltip);

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

      // Also set as CSS custom property on document root for shop panel to use
      document.documentElement.style.setProperty('--bg-gif-url', backgroundUrl);

      // Also update shop panel background directly
      const shopPanel = document.getElementById('shop-panel');
      if (shopPanel) {
        shopPanel.style.backgroundImage = backgroundUrl;
        shopPanel.style.backgroundRepeat = 'repeat';
        shopPanel.style.backgroundSize = 'auto';
      }

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
    this.bossManager.clearBlockedState();

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


  private initGame(): void {
    const state = this.store.getState();

    // Check if player is blocked by a boss (lost previously)
    const isBlockedByBoss =
      state.blockedOnBossLevel !== undefined &&
      state.blockedOnBossLevel !== null;

    // Fix: If player has already passed the blocked boss level, clear the block
    // This handles cases where player levels up past the boss (e.g., gaining too much XP at once)
    if (isBlockedByBoss && state.level > (state.blockedOnBossLevel ?? 0)) {
      this.bossManager.clearBlockedState();
      state.blockedOnBossLevel = null;
      this.store.setState(state);
    }

    // Re-check after potential clearing
    const stillBlocked =
      state.blockedOnBossLevel !== undefined &&
      state.blockedOnBossLevel !== null;

    // Check if player is currently on a boss level
    const isOnBossLevel = this.bossManager.isBossLevel(state.level);

    if (stillBlocked) {
      // Player lost to boss previously - show retry button and normal mode
      this.bossManager.setBlockedBossLevel(state.blockedOnBossLevel ?? null);
      this.mode = 'normal';
      this.createBall();
      this.createShips();
    } else if (isOnBossLevel) {
      // Player is on a boss level and NOT blocked = they refreshed during boss fight
      // Treat this as a loss - apply penalties
      const expRequired = ColorManager.getExpRequired(state.level);
      const xpLoss = Math.floor(expRequired * 0.5); // 50% XP loss
      state.experience = Math.max(0, state.experience - xpLoss);

      // Block progression until boss is defeated
      this.bossManager.setBlockedBossLevel(state.level);
      state.blockedOnBossLevel = state.level;

      // Save the penalized state
      this.store.setState(state);

      // Normal mode with aliens
      this.mode = 'normal';
      this.createBall();
      this.createShips();

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
    const enhancedBall = this.entityManager.createBall();
    this.ball = enhancedBall;
    this.bossBall = null;
  }

  // createBoss() removed - now handled by BossManager.createBoss()

  private createShips(): void {
    const previousShipCount = this.ships.length;
    this.ships = this.entityManager.createShips(this.ships);
    const state = this.store.getState();
    this.autoFireSystem.setShipCount(state.shipsCount);

    // If ships were added, stagger all existing ships to prevent synchronization
    // This ensures lasers stay visually separate even after buying new ships
    if (state.shipsCount > previousShipCount) {
      this.autoFireSystem.staggerExistingShips();
      // Reset swarm connections to start from different ships
      this.resetSwarmConnections();
    }
  }

  private resetSwarmConnections(): void {
    // Reset first swarm connection (Swarm Intelligence Protocol)
    this.swarmConnectionProgress = 0;
    this.swarmVisitedShips.clear();
    this.swarmPreviousFromIndex = -1;

    // Start from ship 0
    if (this.ships.length >= 2) {
      this.swarmConnectionFromIndex = 0;
      // Find closest ship to start with
      const fromShip = this.ships[0];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 1; i < this.ships.length; i++) {
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnectionToIndex = closestIndex !== -1 ? closestIndex : 1;
      }
    }

    // Reset second swarm connection (Fleet Synergy Matrix)
    this.swarmConnection2Progress = 0;
    this.swarm2VisitedShips.clear();
    this.swarm2PreviousFromIndex = -1;

    // Start from ship 1 (or 0 if only 1 ship)
    if (this.ships.length >= 2) {
      const startIndex = Math.min(1, this.ships.length - 1);
      this.swarmConnection2FromIndex = startIndex;
      // Find closest ship to start with (avoiding first connection start)
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0) continue; // Avoid same ship and first connection start
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection2ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    // Reset third swarm connection (Quantum Network Matrix)
    this.swarmConnection3Progress = 0;
    this.swarm3VisitedShips.clear();
    this.swarm3PreviousFromIndex = -1;

    // Start from ship 2 (or appropriate index if fewer ships)
    if (this.ships.length >= 2) {
      const startIndex = Math.min(2, this.ships.length - 1);
      this.swarmConnection3FromIndex = startIndex;
      // Find closest ship to start with (avoiding other connection starts)
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1) continue; // Avoid same ship and other connection starts
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        // Fallback to any available ship if none found
        if (closestIndex === -1) {
          for (let i = 0; i < this.ships.length; i++) {
            if (i !== startIndex) {
              closestIndex = i;
              break;
            }
          }
        }
        this.swarmConnection3ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    // Reset fourth and fifth swarm connections (Dual Network Expansion)
    this.swarmConnection4Progress = 0;
    this.swarm4VisitedShips.clear();
    this.swarm4PreviousFromIndex = -1;
    if (this.ships.length >= 2) {
      const startIndex = Math.min(3, this.ships.length - 1);
      this.swarmConnection4FromIndex = startIndex;
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1 || i === 2) continue;
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection4ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    this.swarmConnection5Progress = 0;
    this.swarm5VisitedShips.clear();
    this.swarm5PreviousFromIndex = -1;
    if (this.ships.length >= 2) {
      const startIndex = Math.min(4, this.ships.length - 1);
      this.swarmConnection5FromIndex = startIndex;
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3) continue;
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection5ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    // Reset sixth, seventh, and eighth swarm connections (Crimson Network Protocol)
    this.swarmConnection6Progress = 0;
    this.swarm6VisitedShips.clear();
    this.swarm6PreviousFromIndex = -1;
    if (this.ships.length >= 2) {
      const startIndex = Math.min(5, this.ships.length - 1);
      this.swarmConnection6FromIndex = startIndex;
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4) continue;
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection6ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    this.swarmConnection7Progress = 0;
    this.swarm7VisitedShips.clear();
    this.swarm7PreviousFromIndex = -1;
    if (this.ships.length >= 2) {
      const startIndex = Math.min(6, this.ships.length - 1);
      this.swarmConnection7FromIndex = startIndex;
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) continue;
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection7ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }

    this.swarmConnection8Progress = 0;
    this.swarm8VisitedShips.clear();
    this.swarm8PreviousFromIndex = -1;
    if (this.ships.length >= 2) {
      const startIndex = Math.min(7, this.ships.length - 1);
      this.swarmConnection8FromIndex = startIndex;
      const fromShip = this.ships[startIndex];
      if (fromShip) {
        let closestIndex = -1;
        let closestDistance = Infinity;
        for (let i = 0; i < this.ships.length; i++) {
          if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5 || i === 6) continue;
          const toShip = this.ships[i];
          if (toShip) {
            const dx = toShip.x - fromShip.x;
            const dy = toShip.y - fromShip.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
        this.swarmConnection8ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
      }
    }
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

      // Shop updates automatically via store subscription, no need to force refresh


      const activeBuffs = this.powerUpSystem.getActiveBuffs();
      this.lastPowerUpCount = activeBuffs.length;
      this.lastHadSpeedBuff = activeBuffs.some((b) => b.type === 'speed');
      this.lastHadDamageBuff = activeBuffs.some((b) => b.type === 'damage');

      return; // Don't fire when collecting power-up - power-ups have highest priority
    }

    // Check for meteor clicks (Second priority)
    const clickedMeteor = this.background.checkMeteoriteClick(pos.x, pos.y);
    if (clickedMeteor) {
      const destroyed = this.background.clickMeteorite(clickedMeteor);
      this.soundManager.playClick();

      if (destroyed) {
        // Reward 1% of current points (minimum 1)
        const currentPoints = this.store.getState().points;
        const reward = Math.max(1, Math.floor(currentPoints * 0.01));
        this.store.addPoints(reward);

        // Visual feedback
        this.damageNumberSystem.spawnDamageNumber(pos.x, pos.y, reward, true);

        // Spawn explosion particles (reduced count)
        if (this.userSettings.highGraphics) {
          this.particleSystem.spawnParticles({
            x: pos.x,
            y: pos.y,
            count: 12, // Slightly more for sparks as they are thin
            color: '#ffaa00', // Golden/Orange
            spread: Math.PI * 2,
            speed: 300, // Fast burst for sparks
            size: 3,
            life: 0.5, // Short life
            glow: true,
            style: 'spark', // New "faísca" style
          });
        }
      } else {
        // Small hit effect for non-fatal clicks
        if (this.userSettings.highGraphics) {
          this.particleSystem.spawnParticles({
            x: pos.x,
            y: pos.y,
            count: 3,
            color: '#ffffff', // White sparkles
            spread: Math.PI * 2,
            speed: 80,
            size: 1.5, // Tiny sparkles
            life: 0.4,
            glow: true,
            style: 'sparkle',
          });
        }
      }

      return; // Don't fire when clicking meteor
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
    // Calculate auto-fire damage per ship (excluding main ship)
    const mode = this.mode === 'transition' ? 'normal' : this.mode;
    const autoFireDamagePerShip = this.combatManager.calculateTotalBeamDamage(state, mode);

    // Total damage = only auto-fire ships (main ship uses regular projectiles)
    const totalShips = Math.max(1, this.ships.length);
    const autoFireShips = totalShips - 1; // Exclude main ship

    return autoFireDamagePerShip * autoFireShips;
  }

  private getEnemyXpScaling(level: number): number {
    return this.combatManager.getEnemyXpScaling(level);
  }

  private fireVolley(): void {
    const state = this.store.getState();

    // Main ship always fires regular projectiles (even in beam mode)
    // This provides click feedback and visual variety
    // Note: Perfect Precision is now handled in handleDamage() to ensure it's checked once per hit
    const mode = this.mode === 'transition' ? 'normal' : this.mode;
    const damage = this.combatManager.calculateClickDamage(state, mode);

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
    const laserThemeId = this.combatManager.getLaserThemeId(state);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.laserSystem.lastBeamThemeId = laserThemeId;

    // Only fire from the main ship (index 0) when clicking
    if (this.ships[0]) {
      // Calculate base shot count
      const shotCount = this.combatManager.getShotCount();

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
    const mode = this.mode === 'transition' ? 'normal' : this.mode;
    const damage = this.combatManager.calculateAutoFireDamage(state, mode);

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

    // All ships can now crit - use crit visuals for all
    const laserVisuals = this.getLaserVisuals(state);

    const laserThemeId = this.combatManager.getLaserThemeId(state);

    // Store theme ID for laser rendering
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.laserSystem.lastBeamThemeId = laserThemeId;

    // No satellite buff - removed
    const finalDamage = damage;

    // Mark laser as from ship so it can be hidden for performance
    this.laserSystem.spawnLaser(origin, hitPoint, finalDamage, {
      ...laserVisuals,
      isFromShip: true,
    });

    return true; // Shot was fired successfully
  }

  private calculateHitPoint(origin: Vec2, center: Vec2, radius: number): Vec2 {
    return this.combatManager.calculateHitPoint(origin, center, radius);
  }

  private getLaserVisuals(state: import('./types').GameState): {
    isCrit: boolean;
    isPerfectPrecision: boolean;
    color: string;
    width: number;
  } {
    return this.combatManager.getLaserVisuals(state);
  }

  private getLaserVisualsNoCrit(state: import('./types').GameState): {
    isCrit: boolean;
    isPerfectPrecision: boolean;
    color: string;
    width: number;
  } {
    return this.combatManager.getLaserVisualsNoCrit(state);
  }

  private handleDamage(
    damage: number,
    isCrit: boolean = false,
    isFromShip: boolean = false,
    hitDirection?: Vec2,
    isBeam?: boolean,
    isPerfectPrecision: boolean = false,
  ): void {
    // Notify tutorial system of click/damage
    if (!isFromShip && !isBeam) {
      this.tutorialSystem.onAlienClicked();
    }

    const state = this.store.getState();
    const targetEntity = this.mode === 'normal' ? this.ball : (this.mode === 'boss' ? this.bossBall : null);

    // Process damage using CombatManager (applies all multipliers)
    const processedResult = this.combatManager.processDamage(
      damage,
      isCrit,
      isFromShip,
      state,
      targetEntity instanceof EnhancedAlienBall || targetEntity instanceof AlienBall ? targetEntity : undefined,
      isBeam,
      isPerfectPrecision,
    );

    const finalDamage = processedResult.finalDamage;
    const finalIsCrit = processedResult.isCrit;

    // Record damage for DPS calculation
    this.hud.recordDamage(finalDamage);

    // v2.0: Track damage and combo for missions
    this.missionSystem.trackDamage(finalDamage);
    this.missionSystem.trackCombo(this.comboSystem.getCombo());

    // Batch damage instead of applying immediately - reuse pre-allocated object
    this.damageBatch.damage += finalDamage;
    if (finalIsCrit) {
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
      if (this.bossManager.isTimeoutHandled()) {
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
    let blockedLevel = this.bossManager.getBlockedBossLevel();

    // Fix: If player has already passed the blocked boss level, clear the block
    // This handles cases where player levels up past the boss (e.g., gaining too much XP at once)
    if (blockedLevel !== null && state.level > blockedLevel) {
      this.bossManager.clearBlockedState();
      blockedLevel = null;
    }

    if (state.level === 100 && blockedLevel === 100) {
      bonusXP = 0; // No XP until boss is defeated
    } else if (blockedLevel !== null) {
      bonusXP *= 0.1;
    }

    state.experience += bonusXP;

    let leveledUp = false;
    let newLevel = state.level;

    // Allow leveling if not blocked, or if player has already passed the blocked level
    if (blockedLevel === null || (blockedLevel !== null && state.level > blockedLevel)) {
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

        // If we leveled past a blocked boss level, clear the block
        if (blockedLevel !== null && state.level > blockedLevel) {
          this.bossManager.clearBlockedState();
          blockedLevel = null;
        }
      }
    }

    if (leveledUp) {
      // Update background immediately when level changes
      this.updateBackgroundByLevel(newLevel);

      this.soundManager.playLevelUp();

      if (this.bossManager.isBossLevel(state.level)) {
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
    this.bossManager.markTimeoutHandled();

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
    state.experience += bossXP;

    // Check if artifact was found
    let artifactFound = false;

    // Level 5 boss on first run (before first ascension) always drops an artifact
    const isFirstRun = state.prestigeLevel === 0;
    const isLevel5Boss = defeatedBossLevel === 5;
    const guaranteedArtifact = isFirstRun && isLevel5Boss;

    // 100% chance for level 5 boss on first run, otherwise 50% chance
    const artifactChance = guaranteedArtifact ? 1.0 : 0.5;

    if (Math.random() < artifactChance) {
      this.artifactSystem.generateArtifact();
      artifactFound = true;

      // Trigger glow and animation on artifacts button instead of opening modal
      this.triggerArtifactNotification();
    }

    // Special handling for level 100 boss: Force player to level 105
    if (defeatedBossLevel === 100) {
      // Calculate total XP needed to reach level 105 from current level
      let totalXPNeeded = 0;
      for (let level = state.level; level < 105; level++) {
        totalXPNeeded += ColorManager.getExpRequired(level);
      }
      
      // Set experience to exactly what's needed for level 105
      state.experience = totalXPNeeded;
      
      // Level up to 105
      while (state.level < 105) {
        const expRequired = ColorManager.getExpRequired(state.level);
        if (state.experience >= expRequired) {
          state.experience -= expRequired;
          state.level++;
          this.store.updateMaxLevel();
          this.updateBackgroundByLevel(state.level);
        } else {
          break; // Safety break
        }
      }
    } else {
      // Normal leveling logic for other bosses
      while (state.experience >= ColorManager.getExpRequired(state.level)) {
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
    }

    this.store.setState(state);

    this.soundManager.playBossDefeat();
    // Pause combo to preserve it during transition back to normal (unless combo pause skill is active)
    if (!this.comboPauseActive) {
      this.comboSystem.pause();
    }
    this.bossManager.hideBossTimer();
    this.bossManager.clearBlockedState();

    this.godModeManager.recordBossDefeated(defeatedBossLevel);

    this.bossManager.hideRetryButton();

    // Only show victory message if artifact modal didn't open
    if (!artifactFound) {
      this.hud.showMessage('BOSS DEFEATED!', '#005800ff', 2000);
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
    this.bossManager.showBossDialog();
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
    this.bossManager.resetTimeoutFlag();

    // Determine boss variant for the upcoming boss
    const state = this.store.getState();
    const bossVariant = this.bossManager.getBossVariant(state.level);

    // Enable boss effect with smooth fade-in during transition (only if high graphics enabled)
    // Effect starts fading in during the transition and reaches full intensity when boss appears
    if (this.userSettings.highGraphics) {
      this.bossEffectFilter.enable(bossVariant, this.transitionDuration * 0.5);
    }

    setTimeout(() => {
      if (this.mode === 'transition') {
        const boss = this.bossManager.createBoss();
        this.bossBall = boss;
        this.mode = 'boss';
        this.bossManager.startBossTimer();
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
        this.hud.showMessage('MIDAS TOUCH ACTIVE', '#ffd700', 2000);
        break;
      case 'overclock':
        this.overclockTimer = 5; // 5 seconds
        this.hud.showMessage('OVERCLOCK ACTIVE', '#00ffff', 2000);
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

    // Update satellite
    if (state.subUpgrades['orbital_satellite']) {
      this.satelliteAngle += dt * this.SATELLITE_ORBIT_SPEED;

      // Calculate satellite position
      const centerX = this.canvas.getCenterX();
      const centerY = this.canvas.getCenterY();
      const satX = centerX + Math.cos(this.satelliteAngle) * this.SATELLITE_ORBIT_RADIUS;
      const satY = centerY + Math.sin(this.satelliteAngle) * this.SATELLITE_ORBIT_RADIUS;

      // Satellite Missile Logic - Launch 3 missiles from satellite
      // Rapid Fire Satellite Array: 2x faster firing rate
      const missileTimerMultiplier = state.subUpgrades?.['rapid_fire_satellite'] ? 2 : 1;
      this.satelliteMissileTimer += dt * missileTimerMultiplier;
      if (this.satelliteMissileTimer >= this.SATELLITE_MISSILE_INTERVAL) {
        this.satelliteMissileTimer = 0;

        // Calculate 30x damage (based on click damage for consistency)
        const mode = this.mode === 'transition' ? 'normal' : this.mode;
        const clickDamage = this.combatManager.calculateClickDamage(state, mode);
        const missileDamage = clickDamage * 30;

        // Spawn 3 missiles from satellite with varied paths for "rain of missiles" effect
        const baseSpeed = 0.8;
        for (let i = 0; i < 3; i++) {
          // Each missile targets the center but with different trajectories
          const targetX = centerX;
          const targetY = centerY;

          // Vary speed for staggered arrival (rain effect)
          const speedVariation = 0.7 + (i * 0.15); // 0.7, 0.85, 1.0
          const missileSpeed = baseSpeed * speedVariation;

          // Each missile curves in a different direction and amount
          // Curve direction: -1 (left curve), 0 (straight), 1 (right curve)
          // Vary between -1 and 1 for different curve directions
          const curveDirection = (i - 1) * 0.8; // -0.8, 0, 0.8
          
          // Curve amount: varies from 0.2 to 0.5 for different arc heights
          const curveAmount = 0.2 + (i * 0.15); // 0.2, 0.35, 0.5

          this.satelliteMissiles.push({
            x: satX,
            y: satY,
            startX: satX,
            startY: satY,
            targetX,
            targetY,
            progress: 0,
            damage: missileDamage,
            speed: missileSpeed,
            curveDirection,
            curveAmount,
          });
        }
      }
    } else {
      // Clear missiles if upgrade not owned
      this.satelliteMissileTimer = 0;
      this.satelliteMissiles = [];
    }

    // Update missiles
    for (let i = this.satelliteMissiles.length - 1; i >= 0; i--) {
      const missile = this.satelliteMissiles[i];
      if (!missile) {
        this.satelliteMissiles.splice(i, 1);
        continue;
      }

      missile.progress += dt * missile.speed; // Individual missile speed

      if (missile.progress >= 1) {
        // Missile hit target
        this.handleDamage(missile.damage, true, false, undefined, true);

        // Spawn meteor-style explosion particles
        if (this.userSettings.highGraphics) {
          this.particleSystem.spawnParticles({
            x: missile.targetX,
            y: missile.targetY,
            count: 8, // Reduced from 30 (explosion) to match meteor style
            color: '#ffaa00', // Golden/Orange like meteors
            spread: Math.PI * 2,
            speed: 300, // Fast burst for sparks
            size: 3,
            life: 0.5, // Short life
            glow: true,
            style: 'spark', // Meteor spark style
          });
        }

        this.satelliteMissiles.splice(i, 1);
      } else {
        // Update missile position using varied quadratic bezier curves for "rain" effect
        const t = missile.progress;
        const t1 = 1 - t;

        // Calculate direction from start to target
        const dx = missile.targetX - missile.startX;
        const dy = missile.targetY - missile.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Midpoint of the path
        const midX = (missile.startX + missile.targetX) / 2;
        const midY = (missile.startY + missile.targetY) / 2;
        
        // Perpendicular direction (rotate 90 degrees) - normalized
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Apply curve direction and amount for varied paths
        // curveDirection determines left (-) or right (+) curve
        // curveAmount determines how much the curve is
        const curveOffset = distance * missile.curveAmount * missile.curveDirection;
        const controlX = midX + perpX * curveOffset;
        const controlY = midY + perpY * curveOffset;

        // Quadratic bezier curve formula - creates varied arc paths
        missile.x = t1 * t1 * missile.startX + 2 * t1 * t * controlX + t * t * missile.targetX;
        missile.y = t1 * t1 * missile.startY + 2 * t1 * t * controlY + t * t * missile.targetY;
      }
    }

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

    // Handle space key attack holding with rate limiting
    if (this.spaceKeyHeld && this.mode !== 'transition') {
      // Update cooldown
      if (this.spaceAttackCooldown > 0) {
        this.spaceAttackCooldown -= dt;
      }

      // Fire when cooldown is ready and there's a valid target
      if (this.spaceAttackCooldown <= 0) {
        const targetEntity = this.mode === 'boss' ? this.bossBall : this.ball;
        if (targetEntity && targetEntity.currentHp > 0) {
          // Trigger attack
          this.store.incrementClick();
          this.soundManager.playClick();
          this.comboSystem.hit(state);
          this.fireVolley();

          // Reset cooldown
          this.spaceAttackCooldown = this.SPACE_ATTACK_RATE;
        }
      }
    }

    if (this.godModeManager.isEnabled()) {
      this.godModeManager.update(scaledDt, realDt);
    }

    // Throttle boss timer updates (expensive DOM updates)
    if (this.mode === 'boss') {
      // Always update timer internally every frame for accurate timeout checking
      const timeoutTriggered = this.bossManager.updateBossTimer(dt);

      // Update DOM display only every N frames (expensive operation)
      if (this.frameCount % this.BOSS_TIMER_UPDATE_INTERVAL === 0) {
        // Force a display update (0 dt so it doesn't double-decrement)
        this.bossManager.updateTimerDisplay();
      }

      if (timeoutTriggered) {
        // Timeout handling is done inside BossManager via callback
        return; // Exit early if timeout was handled
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

        // Track power-up state changes for future use
        // Note: We no longer force shop refresh here as it causes severe lag
        // The shop updates automatically via store subscription
        if (
          currentPowerUpCount !== this.lastPowerUpCount ||
          hasSpeedBuff !== this.lastHadSpeedBuff ||
          hasDamageBuff !== this.lastHadDamageBuff
        ) {
          this.lastPowerUpCount = currentPowerUpCount;
          this.lastHadSpeedBuff = hasSpeedBuff;
          this.lastHadDamageBuff = hasDamageBuff;
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


    // Check if player has universal translator upgrade
    const hasUniversalTranslator = state.subUpgrades?.['universal_translator'] === true;

    this.ball?.update(dt, hasUniversalTranslator, this.canvas.getWidth(), this.canvas.getHeight());
    this.bossBall?.update(dt, hasUniversalTranslator, this.canvas.getWidth(), this.canvas.getHeight());

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
        isPerfectPrecision?: boolean,
      ) => {
        this.handleDamage(damage, isCrit, isFromShip, hitDirection, false, isPerfectPrecision);
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
      true, // Auto-fire always enabled for all ships (including main ship)
      effectiveCooldown,
      (shipIndex) => {
        // All ships (including main ship at index 0) can auto-attack
        return this.fireSingleShip(shipIndex);
      },
    );

    this.saveTimer += dt;
    if (this.saveTimer >= this.saveInterval) {
      Save.save(state);
      this.saveTimer = 0;
    }

    this.titleUpdateTimer += dt;
    if (this.titleUpdateTimer >= UI_THROTTLE.TITLE_UPDATE_INTERVAL) {
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

    // Update swarm connection animation (2 times per second = every 0.5 seconds)
    const hasSwarm = state.subUpgrades?.['ship_swarm'] && this.ships.length >= 2;
    const hasFleetSynergy = state.subUpgrades?.['fleet_synergy_matrix'] && this.ships.length >= 2;
    const hasQuantumNetwork = state.subUpgrades?.['quantum_network_matrix'] && this.ships.length >= 2;
    const hasDualNetworkExpansion = state.subUpgrades?.['dual_network_expansion'] && this.ships.length >= 2;
    const hasNetworkWhiteGlow = state.subUpgrades?.['network_white_glow'] ?? false;
    const hasCrimsonNetwork = state.subUpgrades?.['crimson_network_protocol'] && this.ships.length >= 2;

    if (hasSwarm) {
      // Initialize visited ships set with starting ship
      if (this.swarmVisitedShips.size === 0) {
        // First connection always starts from ship 0
        this.swarmConnectionFromIndex = 0;
        this.swarmVisitedShips.add(this.swarmConnectionFromIndex);
        // Find closest ship to start with (avoiding other connection starting points)
        const fromShip = this.ships[this.swarmConnectionFromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 1; i < this.ships.length; i++) {
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex !== -1) {
            this.swarmConnectionToIndex = closestIndex;
          } else {
            this.swarmConnectionToIndex = 1;
          }
        }
      }

      // Animate connection progress smoothly
      // Quantum Fleet Sync makes it faster (5x speed instead of 3x)
      // Hyper Network Accelerator adds 25% speed boost
      let connectionSpeed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connectionSpeed *= 1.25; // +25% speed boost
      }
      this.swarmConnectionProgress += dt * connectionSpeed;

      if (this.swarmConnectionProgress >= 1.0) {
        // Connection complete - award points and show animation
        const receivingShip = this.ships[this.swarmConnectionToIndex];
        if (receivingShip) {
          // Calculate 5x click damage as points
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;

          // Hyper Network Accelerator: Check for crit (5% base crit chance)
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5; // 5% crit chance
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }

          // Add points to player
          this.store.addPoints(pointsReward);

          // Show points animation above the receiving ship
          // White for non-crit, yellow for crit (handled by DamageNumber system)
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(
            shipPos.x,
            shipPos.y - 20, // Slightly above the ship
            pointsReward,
            isCrit, // Can crit if Hyper Network Accelerator is owned
          );
        }

        // Connection complete, find next closest ship
        this.swarmConnectionProgress = 0;
        this.swarmPreviousFromIndex = this.swarmConnectionFromIndex; // Remember where we came from
        this.swarmConnectionFromIndex = this.swarmConnectionToIndex;

        // Mark the target ship as visited
        this.swarmVisitedShips.add(this.swarmConnectionToIndex);

        // Check if we've visited all ships (complete cycle)
        const allShipsVisited = this.swarmVisitedShips.size >= this.ships.length;

        // Find closest ship that hasn't been visited yet (or all have been visited, start new cycle)
        const fromShip = this.ships[this.swarmConnectionFromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          // If all ships have been visited, reset and start a new cycle
          if (allShipsVisited) {
            this.swarmVisitedShips.clear();
            this.swarmVisitedShips.add(this.swarmConnectionFromIndex); // Current ship is the start of new cycle
            this.swarmPreviousFromIndex = -1; // Reset previous tracking for new cycle
          }

          for (let i = 0; i < this.ships.length; i++) {
            // Skip: same ship or previous source (prevent bouncing back)
            if (i === this.swarmConnectionFromIndex) continue;
            if (i === this.swarmPreviousFromIndex) continue;

            // Only connect to ships that haven't been visited in this cycle
            if (this.swarmVisitedShips.has(i)) continue;

            // Skip ships that are currently being targeted by other connections
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          // If no unvisited ships found (shouldn't happen, but safety check)
          if (closestIndex === -1) {
            // Find any ship that's not the current or previous, and not targeted by other connections
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnectionFromIndex && i !== this.swarmPreviousFromIndex) {
                // Skip ships targeted by other connections in fallback
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          if (closestIndex !== -1) {
            this.swarmConnectionToIndex = closestIndex;
          } else {
            // Ultimate fallback: just use next ship
            this.swarmConnectionToIndex = (this.swarmConnectionFromIndex + 1) % this.ships.length;
          }
        }
      }
    } else {
      // Reset if upgrade not owned or not enough ships
      this.swarmConnectionProgress = 0;
      this.swarmConnectionFromIndex = 0;
      this.swarmConnectionToIndex = 1;
      this.swarmPreviousFromIndex = -1;
      this.swarmVisitedShips.clear();
    }

    // Second connection for Fleet Synergy Matrix
    if (hasFleetSynergy) {
      // Initialize visited ships set with starting ship for second connection
      if (this.swarm2VisitedShips.size === 0) {
        // Start from a different ship than the first connection to create visual variety
        // Use ship 1 if available, otherwise ship 0
        this.swarmConnection2FromIndex = this.ships.length > 1 ? 1 : 0;
        this.swarm2VisitedShips.add(this.swarmConnection2FromIndex);
        // Find closest ship to start with (avoiding first connection's starting point)
        const fromShip = this.ships[this.swarmConnection2FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            // Skip the same ship and the first connection's starting ship
            if (i === this.swarmConnection2FromIndex || i === this.swarmConnectionFromIndex) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex !== -1) {
            this.swarmConnection2ToIndex = closestIndex;
          } else {
            // Fallback: use next available ship
            this.swarmConnection2ToIndex = this.swarmConnection2FromIndex === 0 ? 1 : 0;
          }
        }
      }

      // Animate second connection progress smoothly (slightly offset timing)
      // Quantum Fleet Sync makes it faster (5x speed instead of 3x)
      // Hyper Network Accelerator adds 25% speed boost
      // Network White Glow adds 15% speed boost
      let connection2Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection2Speed *= 1.25; // +25% speed boost
      }
      if (hasNetworkWhiteGlow) {
        connection2Speed *= 1.15; // +15% speed boost
      }
      this.swarmConnection2Progress += dt * connection2Speed;

      if (this.swarmConnection2Progress >= 1.0) {
        // Connection complete - award points and show animation
        const receivingShip = this.ships[this.swarmConnection2ToIndex];
        if (receivingShip) {
          // Calculate 5x click damage as points
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;

          // Hyper Network Accelerator: Check for crit (5% base crit chance)
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5; // 5% crit chance
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }

          // Add points to player
          this.store.addPoints(pointsReward);

          // Show points animation above the receiving ship
          // White for non-crit, yellow for crit (handled by DamageNumber system)
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(
            shipPos.x,
            shipPos.y - 20, // Slightly above the ship
            pointsReward,
            isCrit, // Can crit if Hyper Network Accelerator is owned
          );
        }

        // Connection complete, find next closest ship
        this.swarmConnection2Progress = 0;
        this.swarm2PreviousFromIndex = this.swarmConnection2FromIndex;
        this.swarmConnection2FromIndex = this.swarmConnection2ToIndex;

        // Mark the target ship as visited
        this.swarm2VisitedShips.add(this.swarmConnection2ToIndex);

        // Check if we've visited all ships (complete cycle)
        const allShipsVisited = this.swarm2VisitedShips.size >= this.ships.length;

        // Find closest ship that hasn't been visited yet
        const fromShip = this.ships[this.swarmConnection2FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          // If all ships have been visited, reset and start a new cycle
          if (allShipsVisited) {
            this.swarm2VisitedShips.clear();
            this.swarm2VisitedShips.add(this.swarmConnection2FromIndex);
            this.swarm2PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            // Skip: same ship or previous source
            if (i === this.swarmConnection2FromIndex) continue;
            if (i === this.swarm2PreviousFromIndex) continue;

            // Only connect to ships that haven't been visited in this cycle
            if (this.swarm2VisitedShips.has(i)) continue;

            // Skip ships that are currently being targeted by other connections
            if (i === this.swarmConnectionToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          // If no unvisited ships found
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection2FromIndex && i !== this.swarm2PreviousFromIndex) {
                // Also skip ships targeted by other connections in fallback
                if (i === this.swarmConnectionToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          if (closestIndex !== -1) {
            this.swarmConnection2ToIndex = closestIndex;
          } else {
            this.swarmConnection2ToIndex = (this.swarmConnection2FromIndex + 1) % this.ships.length;
          }
        }
      }
    } else {
      // Reset second connection if upgrade not owned
      this.swarmConnection2Progress = 0;
      this.swarmConnection2FromIndex = 0;
      this.swarmConnection2ToIndex = 1;
      this.swarm2PreviousFromIndex = -1;
      this.swarm2VisitedShips.clear();
    }

    // Third connection for Quantum Network Matrix
    if (hasQuantumNetwork) {
      // Initialize visited ships set with starting ship for third connection
      if (this.swarm3VisitedShips.size === 0) {
        // Start from a different ship than the first two connections to create visual variety
        // Use ship 2 if available, otherwise find the first available ship
        if (this.ships.length > 2) {
          this.swarmConnection3FromIndex = 2;
        } else if (this.ships.length > 1) {
          // If only 2 ships, use ship 1 (first connection uses 0, second uses 1)
          this.swarmConnection3FromIndex = 1;
        } else {
          this.swarmConnection3FromIndex = 0;
        }
        this.swarm3VisitedShips.add(this.swarmConnection3FromIndex);
        // Find closest ship to start with (avoiding first and second connection's starting points)
        const fromShip = this.ships[this.swarmConnection3FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            // Skip the same ship and other connections' starting ships
            if (i === this.swarmConnection3FromIndex ||
              i === this.swarmConnectionFromIndex ||
              i === this.swarmConnection2FromIndex) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex !== -1) {
            this.swarmConnection3ToIndex = closestIndex;
          } else {
            // Fallback: use first available ship that's not the starting ship
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection3FromIndex) {
                this.swarmConnection3ToIndex = i;
                break;
              }
            }
          }
        }
      }

      // Animate third connection progress smoothly
      // Quantum Fleet Sync makes it faster (5x speed instead of 3x)
      // Hyper Network Accelerator adds 25% speed boost
      // Network White Glow adds 15% speed boost
      let connection3Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection3Speed *= 1.25; // +25% speed boost
      }
      if (hasNetworkWhiteGlow) {
        connection3Speed *= 1.15; // +15% speed boost
      }
      this.swarmConnection3Progress += dt * connection3Speed;

      if (this.swarmConnection3Progress >= 1.0) {
        // Connection complete - award points and show animation
        const receivingShip = this.ships[this.swarmConnection3ToIndex];
        if (receivingShip) {
          // Calculate 5x click damage as points
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;

          // Hyper Network Accelerator: Check for crit (5% base crit chance)
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5; // 5% crit chance
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }

          // Add points to player
          this.store.addPoints(pointsReward);

          // Show points animation above the receiving ship
          // White for non-crit, yellow for crit (handled by DamageNumber system)
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(
            shipPos.x,
            shipPos.y - 20, // Slightly above the ship
            pointsReward,
            isCrit, // Can crit if Hyper Network Accelerator is owned
          );
        }

        // Connection complete, find next closest ship
        this.swarmConnection3Progress = 0;
        this.swarm3PreviousFromIndex = this.swarmConnection3FromIndex;
        this.swarmConnection3FromIndex = this.swarmConnection3ToIndex;

        // Mark the target ship as visited
        this.swarm3VisitedShips.add(this.swarmConnection3ToIndex);

        // Check if we've visited all ships (complete cycle)
        const allShipsVisited = this.swarm3VisitedShips.size >= this.ships.length;

        // Find closest ship that hasn't been visited yet
        const fromShip = this.ships[this.swarmConnection3FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          // If all ships have been visited, reset and start a new cycle
          if (allShipsVisited) {
            this.swarm3VisitedShips.clear();
            this.swarm3VisitedShips.add(this.swarmConnection3FromIndex);
            this.swarm3PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            // Skip: same ship or previous source
            if (i === this.swarmConnection3FromIndex) continue;
            if (i === this.swarm3PreviousFromIndex) continue;

            // Only connect to ships that haven't been visited in this cycle
            if (this.swarm3VisitedShips.has(i)) continue;

            // Skip ships that are currently being targeted by other connections
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          // If no unvisited ships found
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection3FromIndex && i !== this.swarm3PreviousFromIndex) {
                // Also skip ships targeted by other connections in fallback
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasDualNetworkExpansion && (i === this.swarmConnection4ToIndex || i === this.swarmConnection5ToIndex)) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          if (closestIndex !== -1) {
            this.swarmConnection3ToIndex = closestIndex;
          } else {
            this.swarmConnection3ToIndex = (this.swarmConnection3FromIndex + 1) % this.ships.length;
          }
        }
      }
    } else {
      // Reset third connection if upgrade not owned
      this.swarmConnection3Progress = 0;
      this.swarmConnection3FromIndex = 0;
      this.swarmConnection3ToIndex = 1;
      this.swarm3PreviousFromIndex = -1;
      this.swarm3VisitedShips.clear();
    }

    // Fourth connection for Dual Network Expansion (level 55)
    if (hasDualNetworkExpansion) {
      // Initialize visited ships set with starting ship for fourth connection
      if (this.swarm4VisitedShips.size === 0) {
        // Start from ship 3 (or appropriate index)
        const startIndex = Math.min(3, this.ships.length - 1);
        this.swarmConnection4FromIndex = startIndex;
        this.swarm4VisitedShips.add(this.swarmConnection4FromIndex);
        // Find closest ship to start with (avoiding other connection starting points)
        const fromShip = this.ships[this.swarmConnection4FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            // Skip the same ship and other connection starting points
            if (i === startIndex || i === 0 || i === 1 || i === 2) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          // Fallback to any available ship
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== startIndex) {
                closestIndex = i;
                break;
              }
            }
          }
          this.swarmConnection4ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
        }
      }

      // Animate fourth connection progress smoothly
      let connection4Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection4Speed *= 1.25;
      }
      if (hasNetworkWhiteGlow) {
        connection4Speed *= 1.15; // +15% speed boost
      }
      this.swarmConnection4Progress += dt * connection4Speed;

      if (this.swarmConnection4Progress >= 1.0) {
        // Connection complete - award points and show animation
        const receivingShip = this.ships[this.swarmConnection4ToIndex];
        if (receivingShip) {
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;

          // Hyper Network Accelerator: Check for crit
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5;
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }

          this.store.addPoints(pointsReward);
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(
            shipPos.x,
            shipPos.y - 20,
            pointsReward,
            isCrit,
          );
        }

        // Connection complete, find next closest ship
        this.swarmConnection4Progress = 0;
        this.swarm4PreviousFromIndex = this.swarmConnection4FromIndex;
        this.swarmConnection4FromIndex = this.swarmConnection4ToIndex;
        this.swarm4VisitedShips.add(this.swarmConnection4ToIndex);

        const allShipsVisited = this.swarm4VisitedShips.size >= this.ships.length;
        const fromShip = this.ships[this.swarmConnection4FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          if (allShipsVisited) {
            this.swarm4VisitedShips.clear();
            this.swarm4VisitedShips.add(this.swarmConnection4FromIndex);
            this.swarm4PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            if (i === this.swarmConnection4FromIndex) continue;
            if (i === this.swarm4PreviousFromIndex) continue;
            if (this.swarm4VisitedShips.has(i)) continue;

            // Skip ships that are currently being targeted by other connections
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (i === this.swarmConnection5ToIndex) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection4FromIndex && i !== this.swarm4PreviousFromIndex) {
                // Also skip ships targeted by other connections in fallback
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (i === this.swarmConnection5ToIndex) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          this.swarmConnection4ToIndex = closestIndex !== -1 ? closestIndex : (this.swarmConnection4FromIndex + 1) % this.ships.length;
        }
      }
    } else {
      // Reset fourth connection if upgrade not owned
      this.swarmConnection4Progress = 0;
      this.swarmConnection4FromIndex = 0;
      this.swarmConnection4ToIndex = 1;
      this.swarm4PreviousFromIndex = -1;
      this.swarm4VisitedShips.clear();
    }

    // Fifth connection for Dual Network Expansion (level 55)
    if (hasDualNetworkExpansion) {
      // Initialize visited ships set with starting ship for fifth connection
      if (this.swarm5VisitedShips.size === 0) {
        // Start from ship 4 (or appropriate index)
        const startIndex = Math.min(4, this.ships.length - 1);
        this.swarmConnection5FromIndex = startIndex;
        this.swarm5VisitedShips.add(this.swarmConnection5FromIndex);
        // Find closest ship to start with (avoiding other connection starting points)
        const fromShip = this.ships[this.swarmConnection5FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            // Skip the same ship and other connection starting points
            if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          // Fallback to any available ship
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== startIndex) {
                closestIndex = i;
                break;
              }
            }
          }
          this.swarmConnection5ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
        }
      }

      // Animate fifth connection progress smoothly
      let connection5Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection5Speed *= 1.25;
      }
      if (hasNetworkWhiteGlow) {
        connection5Speed *= 1.15; // +15% speed boost
      }
      this.swarmConnection5Progress += dt * connection5Speed;

      if (this.swarmConnection5Progress >= 1.0) {
        // Connection complete - award points and show animation
        const receivingShip = this.ships[this.swarmConnection5ToIndex];
        if (receivingShip) {
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;

          // Hyper Network Accelerator: Check for crit
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5;
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }

          this.store.addPoints(pointsReward);
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(
            shipPos.x,
            shipPos.y - 20,
            pointsReward,
            isCrit,
          );
        }

        // Connection complete, find next closest ship
        this.swarmConnection5Progress = 0;
        this.swarm5PreviousFromIndex = this.swarmConnection5FromIndex;
        this.swarmConnection5FromIndex = this.swarmConnection5ToIndex;
        this.swarm5VisitedShips.add(this.swarmConnection5ToIndex);

        const allShipsVisited = this.swarm5VisitedShips.size >= this.ships.length;
        const fromShip = this.ships[this.swarmConnection5FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          if (allShipsVisited) {
            this.swarm5VisitedShips.clear();
            this.swarm5VisitedShips.add(this.swarmConnection5FromIndex);
            this.swarm5PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            if (i === this.swarmConnection5FromIndex) continue;
            if (i === this.swarm5PreviousFromIndex) continue;
            if (this.swarm5VisitedShips.has(i)) continue;

            // Skip ships that are currently being targeted by other connections
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (i === this.swarmConnection4ToIndex) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection5FromIndex && i !== this.swarm5PreviousFromIndex) {
                // Also skip ships targeted by other connections in fallback
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (i === this.swarmConnection4ToIndex) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          this.swarmConnection5ToIndex = closestIndex !== -1 ? closestIndex : (this.swarmConnection5FromIndex + 1) % this.ships.length;
        }
      }
    } else {
      // Reset fifth connection if upgrade not owned
      this.swarmConnection5Progress = 0;
      this.swarmConnection5FromIndex = 0;
      this.swarmConnection5ToIndex = 1;
      this.swarm5PreviousFromIndex = -1;
      this.swarm5VisitedShips.clear();
    }

    // Sixth, seventh, and eighth connections for Crimson Network Protocol (level 90)
    // Sixth connection
    if (hasCrimsonNetwork) {
      if (this.swarm6VisitedShips.size === 0) {
        const startIndex = Math.min(5, this.ships.length - 1);
        this.swarmConnection6FromIndex = startIndex;
        this.swarm6VisitedShips.add(this.swarmConnection6FromIndex);
        const fromShip = this.ships[this.swarmConnection6FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== startIndex) {
                closestIndex = i;
                break;
              }
            }
          }
          this.swarmConnection6ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
        }
      }

      let connection6Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection6Speed *= 1.25;
      }
      if (hasNetworkWhiteGlow) {
        connection6Speed *= 1.15;
      }
      this.swarmConnection6Progress += dt * connection6Speed;

      if (this.swarmConnection6Progress >= 1.0) {
        const receivingShip = this.ships[this.swarmConnection6ToIndex];
        if (receivingShip) {
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5;
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }
          this.store.addPoints(pointsReward);
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(shipPos.x, shipPos.y - 20, pointsReward, isCrit);
        }

        this.swarmConnection6Progress = 0;
        this.swarm6PreviousFromIndex = this.swarmConnection6FromIndex;
        this.swarmConnection6FromIndex = this.swarmConnection6ToIndex;
        this.swarm6VisitedShips.add(this.swarmConnection6ToIndex);

        const allShipsVisited = this.swarm6VisitedShips.size >= this.ships.length;
        const fromShip = this.ships[this.swarmConnection6FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          if (allShipsVisited) {
            this.swarm6VisitedShips.clear();
            this.swarm6VisitedShips.add(this.swarmConnection6FromIndex);
            this.swarm6PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            if (i === this.swarmConnection6FromIndex) continue;
            if (i === this.swarm6PreviousFromIndex) continue;
            if (this.swarm6VisitedShips.has(i)) continue;
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (i === this.swarmConnection4ToIndex) continue;
            if (i === this.swarmConnection5ToIndex) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection6FromIndex && i !== this.swarm6PreviousFromIndex) {
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (i === this.swarmConnection4ToIndex) continue;
                if (i === this.swarmConnection5ToIndex) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection7ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          this.swarmConnection6ToIndex = closestIndex !== -1 ? closestIndex : (this.swarmConnection6FromIndex + 1) % this.ships.length;
        }
      }
    } else {
      this.swarmConnection6Progress = 0;
      this.swarmConnection6FromIndex = 0;
      this.swarmConnection6ToIndex = 1;
      this.swarm6PreviousFromIndex = -1;
      this.swarm6VisitedShips.clear();
    }

    // Seventh connection
    if (hasCrimsonNetwork) {
      if (this.swarm7VisitedShips.size === 0) {
        const startIndex = Math.min(6, this.ships.length - 1);
        this.swarmConnection7FromIndex = startIndex;
        this.swarm7VisitedShips.add(this.swarmConnection7FromIndex);
        const fromShip = this.ships[this.swarmConnection7FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== startIndex) {
                closestIndex = i;
                break;
              }
            }
          }
          this.swarmConnection7ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
        }
      }

      let connection7Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection7Speed *= 1.25;
      }
      if (hasNetworkWhiteGlow) {
        connection7Speed *= 1.15;
      }
      this.swarmConnection7Progress += dt * connection7Speed;

      if (this.swarmConnection7Progress >= 1.0) {
        const receivingShip = this.ships[this.swarmConnection7ToIndex];
        if (receivingShip) {
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5;
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }
          this.store.addPoints(pointsReward);
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(shipPos.x, shipPos.y - 20, pointsReward, isCrit);
        }

        this.swarmConnection7Progress = 0;
        this.swarm7PreviousFromIndex = this.swarmConnection7FromIndex;
        this.swarmConnection7FromIndex = this.swarmConnection7ToIndex;
        this.swarm7VisitedShips.add(this.swarmConnection7ToIndex);

        const allShipsVisited = this.swarm7VisitedShips.size >= this.ships.length;
        const fromShip = this.ships[this.swarmConnection7FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          if (allShipsVisited) {
            this.swarm7VisitedShips.clear();
            this.swarm7VisitedShips.add(this.swarmConnection7FromIndex);
            this.swarm7PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            if (i === this.swarmConnection7FromIndex) continue;
            if (i === this.swarm7PreviousFromIndex) continue;
            if (this.swarm7VisitedShips.has(i)) continue;
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (i === this.swarmConnection4ToIndex) continue;
            if (i === this.swarmConnection5ToIndex) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection8ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection7FromIndex && i !== this.swarm7PreviousFromIndex) {
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (i === this.swarmConnection4ToIndex) continue;
                if (i === this.swarmConnection5ToIndex) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection8ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          this.swarmConnection7ToIndex = closestIndex !== -1 ? closestIndex : (this.swarmConnection7FromIndex + 1) % this.ships.length;
        }
      }
    } else {
      this.swarmConnection7Progress = 0;
      this.swarmConnection7FromIndex = 0;
      this.swarmConnection7ToIndex = 1;
      this.swarm7PreviousFromIndex = -1;
      this.swarm7VisitedShips.clear();
    }

    // Eighth connection
    if (hasCrimsonNetwork) {
      if (this.swarm8VisitedShips.size === 0) {
        const startIndex = Math.min(7, this.ships.length - 1);
        this.swarmConnection8FromIndex = startIndex;
        this.swarm8VisitedShips.add(this.swarmConnection8FromIndex);
        const fromShip = this.ships[this.swarmConnection8FromIndex];
        if (fromShip && this.ships.length > 1) {
          let closestIndex = -1;
          let closestDistance = Infinity;
          for (let i = 0; i < this.ships.length; i++) {
            if (i === startIndex || i === 0 || i === 1 || i === 2 || i === 3 || i === 4 || i === 5 || i === 6) continue;
            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }
          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== startIndex) {
                closestIndex = i;
                break;
              }
            }
          }
          this.swarmConnection8ToIndex = closestIndex !== -1 ? closestIndex : (startIndex === 0 ? 1 : 0);
        }
      }

      let connection8Speed = state.subUpgrades?.['quantum_fleet_sync'] ? 5 : 3;
      if (state.subUpgrades?.['hyper_network_accelerator']) {
        connection8Speed *= 1.25;
      }
      if (hasNetworkWhiteGlow) {
        connection8Speed *= 1.15;
      }
      this.swarmConnection8Progress += dt * connection8Speed;

      if (this.swarmConnection8Progress >= 1.0) {
        const receivingShip = this.ships[this.swarmConnection8ToIndex];
        if (receivingShip) {
          const mode = this.mode === 'transition' ? 'normal' : this.mode;
          const clickDamage = this.combatManager.calculateClickDamage(state, mode);
          let pointsReward = clickDamage * 5;
          let isCrit = false;
          if (state.subUpgrades?.['hyper_network_accelerator']) {
            const critChance = 5;
            if (Math.random() * 100 < critChance) {
              isCrit = true;
              const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
              pointsReward *= critMultiplier;
            }
          }
          this.store.addPoints(pointsReward);
          const shipPos = receivingShip.getFrontPosition();
          this.damageNumberSystem.spawnDamageNumber(shipPos.x, shipPos.y - 20, pointsReward, isCrit);
        }

        this.swarmConnection8Progress = 0;
        this.swarm8PreviousFromIndex = this.swarmConnection8FromIndex;
        this.swarmConnection8FromIndex = this.swarmConnection8ToIndex;
        this.swarm8VisitedShips.add(this.swarmConnection8ToIndex);

        const allShipsVisited = this.swarm8VisitedShips.size >= this.ships.length;
        const fromShip = this.ships[this.swarmConnection8FromIndex];
        if (fromShip) {
          let closestIndex = -1;
          let closestDistance = Infinity;

          if (allShipsVisited) {
            this.swarm8VisitedShips.clear();
            this.swarm8VisitedShips.add(this.swarmConnection8FromIndex);
            this.swarm8PreviousFromIndex = -1;
          }

          for (let i = 0; i < this.ships.length; i++) {
            if (i === this.swarmConnection8FromIndex) continue;
            if (i === this.swarm8PreviousFromIndex) continue;
            if (this.swarm8VisitedShips.has(i)) continue;
            if (i === this.swarmConnectionToIndex) continue;
            if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
            if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
            if (i === this.swarmConnection4ToIndex) continue;
            if (i === this.swarmConnection5ToIndex) continue;
            if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex)) continue;

            const toShip = this.ships[i];
            if (toShip) {
              const dx = toShip.x - fromShip.x;
              const dy = toShip.y - fromShip.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }
          }

          if (closestIndex === -1) {
            for (let i = 0; i < this.ships.length; i++) {
              if (i !== this.swarmConnection8FromIndex && i !== this.swarm8PreviousFromIndex) {
                if (i === this.swarmConnectionToIndex) continue;
                if (hasFleetSynergy && i === this.swarmConnection2ToIndex) continue;
                if (hasQuantumNetwork && i === this.swarmConnection3ToIndex) continue;
                if (i === this.swarmConnection4ToIndex) continue;
                if (i === this.swarmConnection5ToIndex) continue;
                if (hasCrimsonNetwork && (i === this.swarmConnection6ToIndex || i === this.swarmConnection7ToIndex)) continue;
                closestIndex = i;
                break;
              }
            }
          }

          this.swarmConnection8ToIndex = closestIndex !== -1 ? closestIndex : (this.swarmConnection8FromIndex + 1) % this.ships.length;
        }
      }
    } else {
      this.swarmConnection8Progress = 0;
      this.swarmConnection8FromIndex = 0;
      this.swarmConnection8ToIndex = 1;
      this.swarm8PreviousFromIndex = -1;
      this.swarm8VisitedShips.clear();
    }

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }

    // Update ascension animation
    if (this.isAscensionAnimating) {
      this.ascensionAnimationTime += dt;
      const animationDuration = 2.5; // 2.5 seconds total animation

      // Add screen shake during animation (only if enabled)
      if (this.ascensionAnimationTime < animationDuration * 0.8 && this.userSettings.screenShakeEnabled) {
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
    const state = this.store.getState();
    this.renderManager.render(
      {
        ball: this.ball,
        bossBall: this.bossBall,
        ships: this.ships,
        particleSystem: this.particleSystem,
        laserSystem: this.laserSystem,
        damageNumberSystem: this.damageNumberSystem,
        comboSystem: this.comboSystem,
        powerUpSystem: this.powerUpSystem,
        customizationSystem: this.customizationSystem,
        store: this.store,
        swarmConnection: state.subUpgrades?.['ship_swarm'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnectionFromIndex,
            toIndex: this.swarmConnectionToIndex,
            progress: this.swarmConnectionProgress,
          }
          : null,
        swarmConnection2: state.subUpgrades?.['fleet_synergy_matrix'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection2FromIndex,
            toIndex: this.swarmConnection2ToIndex,
            progress: this.swarmConnection2Progress,
          }
          : null,
        swarmConnection3: state.subUpgrades?.['quantum_network_matrix'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection3FromIndex,
            toIndex: this.swarmConnection3ToIndex,
            progress: this.swarmConnection3Progress,
          }
          : null,
        swarmConnection4: state.subUpgrades?.['dual_network_expansion'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection4FromIndex,
            toIndex: this.swarmConnection4ToIndex,
            progress: this.swarmConnection4Progress,
          }
          : null,
        swarmConnection5: state.subUpgrades?.['dual_network_expansion'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection5FromIndex,
            toIndex: this.swarmConnection5ToIndex,
            progress: this.swarmConnection5Progress,
          }
          : null,
        swarmConnection6: state.subUpgrades?.['crimson_network_protocol'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection6FromIndex,
            toIndex: this.swarmConnection6ToIndex,
            progress: this.swarmConnection6Progress,
          }
          : null,
        swarmConnection7: state.subUpgrades?.['crimson_network_protocol'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection7FromIndex,
            toIndex: this.swarmConnection7ToIndex,
            progress: this.swarmConnection7Progress,
          }
          : null,
        swarmConnection8: state.subUpgrades?.['crimson_network_protocol'] && this.ships.length >= 2
          ? {
            fromIndex: this.swarmConnection8FromIndex,
            toIndex: this.swarmConnection8ToIndex,
            progress: this.swarmConnection8Progress,
          }
          : null,
        satellite: state.subUpgrades['orbital_satellite']
          ? {
            x: this.canvas.getCenterX() + Math.cos(this.satelliteAngle) * this.SATELLITE_ORBIT_RADIUS,
            y: this.canvas.getCenterY() + Math.sin(this.satelliteAngle) * this.SATELLITE_ORBIT_RADIUS,
            angle: this.satelliteAngle,
            image: this.satelliteImage,
            missiles: this.satelliteMissiles,
            targetX: this.canvas.getCenterX(),
            targetY: this.canvas.getCenterY(),
          }
          : null,
      },
      {
        mode: this.mode,
        transitionTime: this.transitionTime,
        transitionDuration: this.transitionDuration,
        shakeTime: this.shakeTime,
        shakeAmount: this.shakeAmount,
        isAscensionAnimating: this.isAscensionAnimating,
        ascensionAnimationTime: this.ascensionAnimationTime,
      },
    );
  }


  private resetGame(): void {
    Save.clear();
    const newState = Save.load();
    // Reset totalSubUpgrades in stats
    newState.stats.totalSubUpgrades = 0;
    this.store.setState(newState);
    this.mode = 'normal';

    this.bossManager.setBlockedBossLevel(null);
    this.bossManager.hideRetryButton();

    this.bossManager.hideBossTimer();

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
    // Trigger glow and animation on artifacts button
    this.triggerArtifactNotification();
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



  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  public isGodMode(): boolean {
    return this.godModeManager.isEnabled();
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

  /**
   * Trigger glow and animation on artifacts button when new artifact is gained
   */
  private triggerArtifactNotification(): void {
    if (this.artifactsButton) {
      this.artifactsButton.classList.add('has-new', 'artifact-glow', 'artifact-pulse');
    }
  }

  /**
   * Remove glow and animation from artifacts button
   */
  private removeArtifactNotification(): void {
    if (this.artifactsButton) {
      this.artifactsButton.classList.remove('has-new', 'artifact-glow', 'artifact-pulse');
    }
  }
}
