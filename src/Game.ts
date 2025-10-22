/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlienBall } from './entities/AlienBall';
import { EnhancedAlienBall, selectEnemyType } from './entities/EnemyTypes';
import { BossBall } from './entities/BossBall';
import { Ship } from './entities/Ship';
import { Canvas } from './render/Canvas';
import { Draw } from './render/Draw';
import { Background } from './render/Background';
import { Loop } from './core/Loop';
import { Input } from './core/Input';
import { Store } from './core/Store';
import { Save } from './core/Save';
import { LaserSystem } from './systems/LaserSystem';
import { RippleSystem } from './systems/RippleSystem';
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
import { ColorManager } from './math/ColorManager';
import { Settings } from './core/Settings';
import type { Vec2, GameMode } from './types';
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
  private rippleSystem: RippleSystem;
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
  private achievementSnackbar: AchievementSnackbar;
  private achievementsModal: AchievementsModal;
  private ascensionModal: AscensionModal;
  private missionsModal: MissionsModal;
  private artifactsModal: ArtifactsModal;
  private statsPanel: StatsPanel;
  private settingsModal: SettingsModal;
  private hud: Hud;
  private saveTimer = 0;
  private saveInterval = 3;
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

  // Debug controls
  private gameSpeed = 1.0;
  private godMode = false;

  // Boss retry system
  private bossRetryButton: HTMLElement | null = null;
  private blockedOnBossLevel: number | null = null;

  // Damage batching for performance
  private damageBatch = 0;
  private critBatch = false;
  private batchTimer = 0;
  private batchInterval = 0.05; // Apply damage every 50ms

  constructor() {
    const canvasElement = document.getElementById(
      'game-canvas',
    ) as HTMLCanvasElement | null;
    if (!canvasElement) {
      throw new Error('Canvas not found');
    }

    this.canvas = new Canvas(canvasElement);
    this.draw = new Draw(this.canvas.getContext());
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
    this.rippleSystem = new RippleSystem();
    this.particleSystem = new ParticleSystem();
    this.damageNumberSystem = new DamageNumberSystem();
    this.comboSystem = new ComboSystem();
    this.soundManager = new SoundManager();
    this.soundManager.setEnabled(this.userSettings.soundEnabled);
    this.soundManager.setVolume(this.userSettings.volume);
    this.autoFireSystem = new AutoFireSystem();
    this.achievementSystem = new AchievementSystem();
    this.ascensionSystem = new AscensionSystem();
    this.artifactSystem = new ArtifactSystem();
    this.missionSystem = new MissionSystem(this.store);
    this.upgradeSystem.setAscensionSystem(this.ascensionSystem);
    this.achievementSnackbar = new AchievementSnackbar();
    this.achievementsModal = new AchievementsModal(this.achievementSystem);
    this.ascensionModal = new AscensionModal(
      this.ascensionSystem,
      this.store,
      () => {
        this.performAscension();
      },
    );
    this.missionsModal = new MissionsModal(this.missionSystem, () => {
      const state = this.store.getState();
      this.hud.update(state.points);
      this.store.setState({ ...state });
    });
    this.artifactsModal = new ArtifactsModal(this.artifactSystem, this.store);
    this.statsPanel = new StatsPanel(this.upgradeSystem);
    this.settingsModal = new SettingsModal(this.soundManager);
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
    this.settingsModal.setRipplesCallback((enabled: boolean) => {
      this.userSettings.showRipples = enabled;
      if (!enabled) {
        this.rippleSystem.clear();
      }
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
      this.userSettings.showRipples,
      this.userSettings.showDamageNumbers,
    );
    // Setup stats panel button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        this.statsPanel.show();
      });
    }
    this.hud = new Hud();
    const shop = new Shop(this.store, this.upgradeSystem);
    shop.setSoundManager(this.soundManager);
    shop.setMissionSystem(this.missionSystem);

    this.achievementSystem.setOnUnlock((achievement) => {
      this.achievementSnackbar.show(achievement);
      this.soundManager.playAchievement();
    });
    this.achievementSystem.updateFromState(this.store.getState());

    this.input = new Input(canvasElement);
    this.loop = new Loop(
      (dt) => {
        this.update(dt);
      },
      () => {
        this.render();
      },
    );

    this.initGame();
    this.setupInput();
    this.setupKeyboard();
    this.setupAutoSave();
    this.setupBossDialog();
    this.setupBossTimer();
    this.setupBossRetryButton();
    this.setupAchievementsButton();
    this.setupAscensionButton();
    this.setupSettingsButton();
    this.setupMissionsButton();
    this.setupArtifactsButton();
    this.setupGraphicsToggle();
    Layout.setupResetButton(() => {
      this.resetGame();
    });
  }

  private setupGraphicsToggle(): void {
    // Legacy method kept for backwards compatibility
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
    this.bossRetryButton = document.createElement('button');
    this.bossRetryButton.id = 'boss-retry-btn';
    this.bossRetryButton.className = 'hud-button boss-retry-button';
    this.bossRetryButton.textContent = '⚔️ Retry Boss';
    this.bossRetryButton.style.display = 'none';
    this.bossRetryButton.style.pointerEvents = 'auto';

    this.bossRetryButton.addEventListener('click', () => {
      this.retryBossFight();
    });

    const hudElement = document.getElementById('hud');
    if (hudElement) {
      hudElement.appendChild(this.bossRetryButton);
    }
  }

  private startBossTimer(): void {
    const state = this.store.getState();
    // Use ColorManager for dynamic boss timer scaling
    this.bossTimeLimit = ColorManager.getBossTimeLimit(state.level);
    this.bossTimeRemaining = this.bossTimeLimit;

    // Show timer
    if (this.bossTimerElement) {
      this.bossTimerElement.style.display = 'block';
    }

    // Update dialog timer display
    const dialogTimer = document.getElementById('boss-dialog-timer');
    if (dialogTimer) {
      const span = dialogTimer.querySelector('span');
      if (span) {
        span.textContent = `${this.bossTimeLimit.toString()}s`;
      }
    }
  }

  private updateBossTimer(dt: number): void {
    if (this.mode !== 'boss') return;

    this.bossTimeRemaining -= dt;

    // Update timer display
    const timerText = document.getElementById('boss-timer-text');
    const timerBar = document.getElementById('boss-timer-bar');

    if (timerText) {
      const timeLeft = Math.ceil(Math.max(0, this.bossTimeRemaining));
      timerText.textContent = `TIME: ${timeLeft.toString()}s`;

      // Change color as time runs out (adjusted for 30s timer)
      if (this.bossTimeRemaining <= 5) {
        timerText.style.color = '#ff0000';
        timerText.classList.add('critical');
      } else if (this.bossTimeRemaining <= 10) {
        timerText.style.color = '#ffaa00';
      } else {
        timerText.style.color = '#ffffff';
      }
    }

    if (timerBar) {
      const percent = Math.max(
        0,
        (this.bossTimeRemaining / this.bossTimeLimit) * 100,
      );
      timerBar.style.width = `${percent.toString()}%`;

      // Change bar color based on time remaining (adjusted for 30s timer)
      if (this.bossTimeRemaining <= 5) {
        timerBar.style.backgroundColor = '#ff0000';
      } else if (this.bossTimeRemaining <= 10) {
        timerBar.style.backgroundColor = '#ffaa00';
      } else {
        timerBar.style.backgroundColor = '#00ff88';
      }
    }

    // Time's up!
    if (this.bossTimeRemaining <= 0) {
      this.handleBossTimeout();
    }
  }

  private hideBossTimer(): void {
    if (this.bossTimerElement) {
      this.bossTimerElement.style.display = 'none';
    }
  }

  private handleBossTimeout(): void {
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

    // Show message
    this.hud.showMessage(
      "⏱️ TIME'S UP! The boss escaped! You must defeat it to progress.",
      '#ff0000',
      4000,
    );

    // Clean up and return to normal mode
    this.hideBossTimer();
    this.comboSystem.reset();

    // Show retry button
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'block';
    }

    setTimeout(() => {
      this.startTransitionToNormal();
    }, 500);
  }

  private retryBossFight(): void {
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }
    this.showBossDialog();
  }

  start(): void {
    // Initialize page title
    const state = this.store.getState();
    this.updatePageTitle(state.points);

    this.loop.start();
  }

  private setupAchievementsButton(): void {
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => {
        this.achievementsModal.show();
      });
    }
  }

  private setupAscensionButton(): void {
    // Create ascension button dynamically
    const hudElement = document.getElementById('hud');
    if (hudElement) {
      const ascensionBtn = document.createElement('button');
      ascensionBtn.id = 'ascension-btn';
      ascensionBtn.className = 'hud-button ascension-hud-btn';
      ascensionBtn.textContent = '🌟 Ascend';
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

      hudElement.appendChild(ascensionBtn);
    }
  }

  private setupSettingsButton(): void {
    const hudElement = document.getElementById('hud');
    if (hudElement) {
      const settingsBtn = document.createElement('button');
      settingsBtn.id = 'settings-btn';
      settingsBtn.className = 'hud-button';
      settingsBtn.textContent = '⚙️ Settings';
      settingsBtn.addEventListener('click', () => {
        this.settingsModal.show();
      });
      hudElement.appendChild(settingsBtn);
    }
  }

  private setupMissionsButton(): void {
    const hudElement = document.getElementById('hud');
    if (hudElement) {
      const missionsBtn = document.createElement('button');
      missionsBtn.id = 'missions-button';
      missionsBtn.className = 'hud-button';
      missionsBtn.textContent = '🎯 Missions';
      missionsBtn.addEventListener('click', () => {
        this.missionsModal.show();
      });
      hudElement.appendChild(missionsBtn);
    }
  }

  private setupArtifactsButton(): void {
    const hudElement = document.getElementById('hud');
    if (hudElement) {
      const artifactsBtn = document.createElement('button');
      artifactsBtn.id = 'artifacts-button';
      artifactsBtn.className = 'hud-button';
      artifactsBtn.textContent = '✨ Artifacts';
      artifactsBtn.addEventListener('click', () => {
        this.artifactsModal.show();
      });
      hudElement.appendChild(artifactsBtn);
    }
  }

  private performAscension(): void {
    const state = this.store.getState();

    // Calculate prestige points to gain
    const prestigeGain = this.ascensionSystem.calculatePrestigePoints(state);

    // Save what we're keeping (ONLY artifacts, achievements, stats, and prestige)
    const keepAchievements = { ...state.achievements };
    const keepStats = { ...state.stats };
    const keepPrestigeUpgrades = { ...state.prestigeUpgrades };
    const newPrestigePoints = state.prestigePoints + prestigeGain;
    const newPrestigeLevel = state.prestigeLevel + 1;

    // Update prestige stats
    keepStats.totalPrestige = newPrestigeLevel;

    // Get starting level from prestige upgrades
    const startingLevel = this.ascensionSystem.getStartingLevel(state);

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
      subUpgrades: {}, // Reset all subupgrades - only artifacts persist!
      achievements: keepAchievements, // Keep achievements
      stats: keepStats, // Keep stats
      prestigeLevel: newPrestigeLevel,
      prestigePoints: newPrestigePoints,
      prestigeUpgrades: keepPrestigeUpgrades, // Keep prestige upgrades
      harmonicState: {
        streak: 0,
        harmonicCores: 0,
        tuningForkLevel: 0,
        metronomePurchased: false,
        chorusLevel: 0,
        quantizedRipplesLevel: 0,
        sigils: {
          tempo: 0,
          echo: 0,
          focus: 0,
        },
        echoAccumulator: 0,
      },
      blockedOnBossLevel: null, // Reset boss block on ascension
      // v3.0: New upgrades (reset on ascension - only artifacts persist)
      weaponMasteryLevel: 0,
      fleetCommandLevel: 0,
      mutationEngineLevel: 0,
      energyCoreLevel: 0,
      cosmicKnowledgeLevel: 0,
      discoveredUpgrades: { ship: true }, // Reset discoveries, ship always visible
    };

    // Clear local boss block state
    this.blockedOnBossLevel = null;
    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    this.store.setState(freshState);
    Save.save(this.store.getState());

    // Reinitialize game
    this.mode = 'normal';
    this.createBall();
    this.createShips();
    this.laserSystem.clear();
    this.rippleSystem.clear();
    this.particleSystem.clear();
    this.damageNumberSystem.clear();
    this.comboSystem.reset();
    this.autoFireSystem.reset();
    this.saveTimer = 0;
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  private initGame(): void {
    this.createBall();
    this.createShips();
    const state = this.store.getState();

    // Restore blocked boss level state from save
    if (
      state.blockedOnBossLevel !== undefined &&
      state.blockedOnBossLevel !== null
    ) {
      this.blockedOnBossLevel = state.blockedOnBossLevel;
      // Show the retry button if blocked
      if (this.bossRetryButton) {
        this.bossRetryButton.style.display = 'block';
      }
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

    // Set up damage callback for visual effects (particles and ripples)
    enhancedBall.setOnDamageCallback(
      (_damage: number, x: number, y: number, alienRadius: number) => {
        // Spawn particles (only if high graphics enabled)
        if (this.userSettings.highGraphics) {
          this.particleSystem.spawnParticles({
            x,
            y,
            count: Math.min(10, Math.floor(_damage / 100)),
            color: '#ffffff',
            speed: 50,
            life: 0.8,
          });
        }

        // Spawn ripples (only if enabled)
        if (this.userSettings.showRipples) {
          this.rippleSystem.spawnRipple({ x, y }, alienRadius * 2);
        }
      },
    );

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

  private handleClick(_pos: Vec2): void {
    if (this.mode === 'transition') return;

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

  private fireVolley(): void {
    const state = this.store.getState();
    // Use main ship damage (stronger!)
    let damage = this.upgradeSystem.getMainShipDamage(state);

    // v2.0: Apply artifact bonuses
    damage *= 1 + this.artifactSystem.getDamageBonus();

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

    const target = { x: targetEntity.x, y: targetEntity.y };
    const laserVisuals = this.getLaserVisuals(state);

    // Only fire from the main ship (index 0) when clicking
    if (this.ships[0]) {
      this.laserSystem.spawnLaser(
        this.ships[0].getFrontPosition(),
        target,
        damage,
        laserVisuals,
      );

      // Rapid fire upgrade: fire additional lasers from 2 random ships
      if (state.subUpgrades['rapid_fire'] && this.ships.length > 1) {
        const otherShips = this.ships.slice(1);
        const count = Math.min(2, otherShips.length);
        for (let i = 0; i < count; i++) {
          const ship = otherShips[i];
          if (ship) {
            this.laserSystem.spawnLaser(
              ship.getFrontPosition(),
              target,
              damage,
              laserVisuals,
            );
          }
        }
      }
    }

    // v2.0: Track mission progress
    this.missionSystem.trackClick();

    // Spawn visual ripple (only if enabled)
    if (this.userSettings.showRipples) {
      const rippleRadius =
        this.mode === 'boss'
          ? this.bossBall
            ? this.bossBall.radius * 2.5
            : 150
          : this.ball
            ? this.ball.radius * 2
            : 100;
      this.rippleSystem.spawnRipple(target, rippleRadius);
    }

    // Spawn particles (only if high graphics enabled)
    if (this.userSettings.highGraphics && this.ball && Math.random() < 0.4) {
      const hitColor = '#ffffff';
      this.particleSystem.spawnParticles({
        x: this.ball.x + (Math.random() - 0.5) * this.ball.radius,
        y: this.ball.y + (Math.random() - 0.5) * this.ball.radius,
        count: 3,
        color: hitColor,
        spread: Math.PI * 2,
        speed: 100,
        size: 2,
        life: 0.5,
        glow: false,
      });
    }
  }

  private fireSingleShip(shipIndex: number): boolean {
    if (shipIndex >= this.ships.length) return false;
    const ship = this.ships[shipIndex];
    if (!ship) return false;

    const state = this.store.getState();
    // Use auto-fire damage (weaker but scales with ship count)
    let damage = this.upgradeSystem.getAutoFireDamage(state);

    // v2.0: Apply artifact bonuses (at reduced rate for auto-fire)
    damage *= 1 + this.artifactSystem.getDamageBonus() * 0.5;

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

    const target = { x: targetEntity.x, y: targetEntity.y };
    const laserVisuals = this.getLaserVisuals(state);

    // Mark laser as from ship so it can be hidden for performance
    this.laserSystem.spawnLaser(ship.getFrontPosition(), target, damage, {
      ...laserVisuals,
      isFromShip: true,
    });

    return true; // Shot was fired successfully
  }

  // Debug method to check laser statistics
  private debugLaserStats(): void {
    const stats = this.laserSystem.getLaserStats();
    if (stats.total > 200) {
      console.log(
        `Lasers: ${stats.total.toString()} total (${stats.playerLasers.toString()} player, ${stats.shipLasers.toString()} ship)`,
      );
    }
  }

  private getLaserVisuals(state: import('./types').GameState): {
    isCrit: boolean;
    color: string;
    width: number;
  } {
    let color = '#fff';
    let width = 1.5; // Thin lasers
    let isCrit = false;

    // Check for critical hit
    const critChance = this.upgradeSystem.getCritChance(state);
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      color = '#ffff00'; // Yellow for crit
      width = 2; // Thin even for crits
      this.store.getState().stats.criticalHits++;
      return { isCrit, color, width };
    }

    // Check for perfect precision super crit
    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        isCrit = true;
        color = '#ff00ff'; // Magenta for super crit
        width = 2; // Thin even for super crits
        this.store.getState().stats.criticalHits++;
        return { isCrit, color, width };
      }
    }

    // Laser color based on damage upgrades (all thin)
    if (state.subUpgrades['cosmic_ascension']) {
      color = '#ff00ff'; // Magenta for cosmic
      width = 2;
    } else if (state.subUpgrades['singularity_core']) {
      color = '#8800ff'; // Purple for singularity
      width = 2;
    } else if (state.subUpgrades['heart_of_galaxy']) {
      color = '#ff0044'; // Red for heart of galaxy
      width = 2;
    } else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff0088'; // Pink for antimatter
      width = 1.5;
    } else if (state.subUpgrades['chaos_emeralds']) {
      color = '#00ff88'; // Emerald green
      width = 1.5;
    } else if (state.subUpgrades['overclocked_reactors']) {
      color = '#ff6600'; // Orange for overclocked
      width = 1.5;
    } else if (state.subUpgrades['laser_focusing']) {
      color = '#00ffff'; // Cyan for focusing
      width = 1.5;
    } else if (state.pointMultiplierLevel >= 10) {
      color = '#88ff88'; // Light green for high level
      width = 1.5;
    }

    return { isCrit, color, width };
  }

  private handleDamage(damage: number, isCrit: boolean = false): void {
    let finalDamage = damage;

    // Apply critical damage multiplier
    if (isCrit) {
      const state = this.store.getState();
      const critMultiplier = this.upgradeSystem.getCritMultiplier(state);
      finalDamage = damage * critMultiplier;
    }

    // Apply combo multiplier (works in all modes now!)
    const comboMult = this.comboSystem.getMultiplier();
    finalDamage *= comboMult;

    // Play combo sound on milestone combos (boss mode only for sound)
    if (this.mode === 'boss') {
      const currentCombo = this.comboSystem.getCombo();
      if (currentCombo % 10 === 0 && currentCombo > 0) {
        this.soundManager.playCombo(currentCombo / 10);
      }
    }

    // Record damage for DPS calculation
    this.hud.recordDamage(finalDamage);

    // v2.0: Track damage and combo for missions
    this.missionSystem.trackDamage(finalDamage);
    this.missionSystem.trackCombo(this.comboSystem.getCombo());

    // Batch damage instead of applying immediately
    this.damageBatch += finalDamage;
    if (isCrit) {
      this.critBatch = true;
    }
  }

  private applyDamageBatch(): void {
    if (this.damageBatch <= 0) return;

    const finalDamage = this.damageBatch;
    const isCrit = this.critBatch;

    if (this.mode === 'normal' && this.ball) {
      const broken = this.ball.takeDamage(finalDamage);
      this.store.addPoints(finalDamage);

      // Spawn one damage number for the batched damage
      this.damageNumberSystem.spawnDamageNumber(
        this.ball.x,
        this.ball.y - this.ball.radius - 20,
        finalDamage,
        isCrit,
      );

      if (broken) {
        this.onBallDestroyed();
      }
    } else if (this.mode === 'boss' && this.bossBall) {
      const broken = this.bossBall.takeDamage(finalDamage);
      const state = this.store.getState();
      const bossBonus = state.subUpgrades['alien_cookbook'] ? 2 : 1;
      this.store.addPoints(finalDamage * 2 * bossBonus);

      // Spawn one damage number for the batched damage
      const bossPos = this.bossBall.getPosition();
      this.damageNumberSystem.spawnDamageNumber(
        bossPos.x,
        bossPos.y - this.bossBall.radius - 40,
        finalDamage,
        isCrit,
      );

      // Spawn hit particles occasionally (only if high graphics)
      if (this.userSettings.highGraphics && Math.random() < 0.3) {
        const hitColor = isCrit ? '#ffff00' : '#ffffff';
        this.particleSystem.spawnParticles({
          x: bossPos.x + (Math.random() - 0.5) * this.bossBall.radius,
          y: bossPos.y + (Math.random() - 0.5) * this.bossBall.radius,
          count: isCrit ? 10 : 5,
          color: hitColor,
          spread: Math.PI,
          speed: 150,
          size: isCrit ? 4 : 3,
          life: 0.6,
          glow: false,
        });
      }

      if (broken) {
        // Boss defeated!
        this.handleBossDefeat();
      }
    }

    // Reset batch
    this.damageBatch = 0;
    this.critBatch = false;
  }

  private onBallDestroyed(): void {
    // Don't process if in transition or boss mode
    if (this.mode === 'transition' || this.mode === 'boss') {
      return;
    }

    if (this.damageBatch > 0) {
      this.applyDamageBatch();
    }

    this.ball = null;

    const state = this.store.getState();
    this.store.incrementAlienKill();
    this.missionSystem.trackKill();

    const baseXP = 3;
    let bonusXP = this.upgradeSystem.getBonusXP(state) * baseXP;
    bonusXP *= 1 + this.artifactSystem.getXPBonus();

    state.experience += bonusXP;

    let leveledUp = false;
    if (this.blockedOnBossLevel === null) {
      while (state.experience >= ColorManager.getExpRequired(state.level)) {
        const expRequired = ColorManager.getExpRequired(state.level);
        state.experience -= expRequired;
        state.level++;
        this.store.updateMaxLevel();
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

    this.store.addPoints(bossReward);

    let bossXP = Math.floor(state.level * 50);
    bossXP *= 1 + this.artifactSystem.getXPBonus();

    state.experience += bossXP;

    if (Math.random() < 0.5) {
      const artifact = this.artifactSystem.generateArtifact();
      this.hud.showMessage(
        `🎁 Artifact Found: ${artifact.icon} ${artifact.name}!`,
        '#ffa94d',
        3000,
      );
    }

    while (state.experience >= ColorManager.getExpRequired(state.level)) {
      const expRequired = ColorManager.getExpRequired(state.level);
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();
    }

    this.store.setState(state);

    this.soundManager.playBossDefeat();
    this.comboSystem.reset();
    this.hideBossTimer();

    this.blockedOnBossLevel = null;
    state.blockedOnBossLevel = null;
    this.store.setState(state);

    if (this.bossRetryButton) {
      this.bossRetryButton.style.display = 'none';
    }

    this.hud.showMessage('🎉 BOSS DEFEATED! 🎉', '#00ff88', 2000);

    if (this.userSettings.highGraphics) {
      const centerX = this.canvas.getCenterX();
      const centerY = this.canvas.getCenterY();
      this.particleSystem.spawnExplosion(centerX, centerY, '#ffaa00');
      setTimeout(() => {
        this.particleSystem.spawnExplosion(centerX, centerY, '#ff0000');
      }, 200);
    }

    // Faster transition - immediately start returning to normal mode
    setTimeout(() => {
      this.startTransitionToNormal();
    }, 1000); // Reduced from 1000ms to 300ms
  }

  private showBossDialog(): void {
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
    this.comboSystem.reset();

    setTimeout(() => {
      if (this.mode === 'transition') {
        this.createBoss();
        this.mode = 'boss';
        this.startBossTimer();
      }
    }, this.transitionDuration * 500);
  }

  private startTransitionToNormal(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.bossBall = null;

    // Faster transition back to normal - reduced delay
    setTimeout(() => {
      if (this.mode === 'transition') {
        this.mode = 'normal';
        this.createBall();
      }
    }, this.transitionDuration * 500);
  }

  private update(dt: number): void {
    dt = dt * this.gameSpeed;

    const state = this.store.getState();

    this.updateBossTimer(dt);

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

    try {
      const dps = this.hud.calculateDPS();
      const passiveGen = this.upgradeSystem.getPassiveGen(state);
      const critChance = this.upgradeSystem.getCritChance(state);
      this.hud.updateStats(dps, passiveGen, critChance);
    } catch {
      // Ignore errors in HUD update
    }

    this.achievementSystem.checkAchievements(state);

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

    this.laserSystem.update(dt, (damage, isCrit) => {
      this.handleDamage(damage, isCrit);
    });
    this.rippleSystem.update(dt);
    this.particleSystem.update(dt);
    this.damageNumberSystem.update(dt);
    this.comboSystem.update(dt);

    if (Math.random() < 0.01) {
      this.debugLaserStats();
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

      this.particleSystem.spawnTrail(bossPos.x, bossPos.y, trailColor);
    }

    for (const ship of this.ships) {
      ship.rotate(dt);
    }

    this.autoFireSystem.update(
      dt,
      true, // Auto-fire always enabled for non-main ships
      this.upgradeSystem.getFireCooldown(state),
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

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
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

    document.title = `${formattedPoints} points - Space Clicker`;
  }

  private render(): void {
    this.canvas.clear();
    const ctx = this.canvas.getContext();

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
    } else {
      if (this.userSettings.highGraphics) {
        this.particleSystem.draw(this.draw);
      }
      if (this.userSettings.showRipples) {
        this.rippleSystem.draw(this.draw);
      }

      this.laserSystem.draw(this.draw);

      if (this.ball && this.ball.currentHp > 0) {
        this.ball.draw(this.draw);
      }
      if (this.bossBall && this.bossBall.currentHp > 0) {
        this.bossBall.draw(this.draw);
      }

      const state = this.store.getState();
      for (const ship of this.ships) {
        ship.draw(this.draw, state);
      }

      this.damageNumberSystem.draw(this.draw);

      if (this.comboSystem.getCombo() > 0) {
        this.comboSystem.draw(
          this.draw,
          this.canvas.getWidth(),
          this.canvas.getHeight(),
        );
      }
    }

    ctx.restore();
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
    this.store.setState(Save.load());
    this.mode = 'normal';
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
  }

  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  public isGodMode(): boolean {
    return this.godMode;
  }

  private handleResize(): void {
    this.background.resize(this.canvas.getWidth(), this.canvas.getHeight());

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
