import { AlienBall } from './entities/AlienBall';
import { BossBall } from './entities/BossBall';
import { Ship } from './entities/Ship';
import { Canvas } from './render/Canvas';
import { Draw } from './render/Draw';
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
import { ParticleSystem } from './entities/Particle';
import { DamageNumberSystem } from './systems/DamageNumberSystem';
import { ComboSystem } from './systems/ComboSystem';
import { SoundManager } from './systems/SoundManager';
import { Hud } from './ui/Hud';
import { Shop } from './ui/Shop';
import { UpgradesDisplay } from './ui/UpgradesDisplay';
import { AchievementSnackbar } from './ui/AchievementSnackbar';
import { AchievementsModal } from './ui/AchievementsModal';
import { AscensionModal } from './ui/AscensionModal';
import { StatsPanel } from './ui/StatsPanel';
import { SettingsModal } from './ui/SettingsModal';
import { Layout } from './ui/Layout';
import { ColorManager } from './math/ColorManager';
import { Settings } from './core/Settings';
import type { Vec2, GameMode } from './types';
import type { UserSettings } from './core/Settings';

export class Game {
  private canvas: Canvas;
  private draw: Draw;
  private loop: Loop;
  private input: Input;
  private store: Store;
  private ball: AlienBall | null = null;
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
  private achievementSnackbar: AchievementSnackbar;
  private achievementsModal: AchievementsModal;
  private ascensionModal: AscensionModal;
  private statsPanel: StatsPanel;
  private settingsModal: SettingsModal;
  private hud: Hud;
  private upgradesDisplay: UpgradesDisplay;
  private saveTimer = 0;
  private saveInterval = 3;
  private playTimeAccumulator = 0;
  private passiveGenAccumulator = 0;
  private shakeTime = 0;
  private shakeAmount = 0;
  private mode: GameMode = 'normal';
  private transitionTime = 0;
  private transitionDuration = 2;
  private keys: Set<string> = new Set();
  private userSettings: UserSettings = Settings.getDefault();
  
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
    this.upgradeSystem.setAscensionSystem(this.ascensionSystem);
    this.achievementSnackbar = new AchievementSnackbar();
    this.achievementsModal = new AchievementsModal(this.achievementSystem);
    this.ascensionModal = new AscensionModal(this.ascensionSystem, this.store, () => { this.performAscension(); });
    this.statsPanel = new StatsPanel();
    this.settingsModal = new SettingsModal(this.soundManager);
    
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
      this.userSettings.showDamageNumbers
    );
    // Setup stats panel button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        this.statsPanel.show();
      });
    }
    this.hud = new Hud();
    this.upgradesDisplay = new UpgradesDisplay(this.upgradeSystem);
    const shop = new Shop(this.store, this.upgradeSystem);
    shop.setSoundManager(this.soundManager);

    this.achievementSystem.setOnUnlock((achievement) => {
      this.achievementSnackbar.show(achievement);
      this.soundManager.playAchievement();
    });
    this.achievementSystem.updateFromState(this.store.getState());
    
    // Boss system is simplified - no callbacks needed

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
    this.setupAchievementsButton();
    this.setupAscensionButton();
    this.setupSettingsButton();
    this.setupGraphicsToggle();
    Layout.setupResetButton(() => {
      this.resetGame();
    });
  }

  private setupGraphicsToggle(): void {
    // Graphics and sound toggles are now in the Settings modal
    // This method is kept for backwards compatibility but does nothing
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
        ascensionBtn.style.display = canAscend || state.prestigeLevel > 0 ? 'block' : 'none';
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

  private performAscension(): void {
    const state = this.store.getState();
    
    // Calculate prestige points to gain
    const prestigeGain = this.ascensionSystem.calculatePrestigePoints(state);
    
    // Save what we're keeping
    const keepSubUpgrades = { ...state.subUpgrades };
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
      subUpgrades: keepSubUpgrades, // Keep special upgrades
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
    };
    
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
    this.hud.update(state.points);
    this.hud.updateLevel(
      state.level,
      state.experience,
      ColorManager.getExpRequired(state.level),
    );
    this.upgradesDisplay.update(state);
  }

  private createBall(): void {
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const radius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.08;
    const state = this.store.getState();
    this.ball = AlienBall.createRandom(cx, cy, radius, state.level);
    this.bossBall = null;
  }

  private createBoss(): void {
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    // Boss is 50% bigger than normal aliens
    const radius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.15;
    const state = this.store.getState();
    const hp = ColorManager.getBossHp(state.level);
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
      this.upgradesDisplay.update(state);
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

    // Both normal and boss modes work the same way now - just click and shoot!
    if (this.mode === 'normal' && this.ball?.isPointInside(pos) && this.ball.currentHp > 0) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit();
      this.fireVolley();
    } else if (this.mode === 'boss' && this.bossBall?.isPointInside(pos) && this.bossBall.currentHp > 0) {
      this.store.incrementClick();
      this.soundManager.playClick();
      this.comboSystem.hit();
      this.fireBossVolley();
    }
  }

  private fireVolley(): void {
    const state = this.store.getState();
    const damage = this.upgradeSystem.getPointsPerHit(state);
    const target = { x: this.ball?.x ?? 0, y: this.ball?.y ?? 0 };
    const laserVisuals = this.getLaserVisuals(state);

    // Only fire from the main ship (index 0) when clicking
    if (this.ships[0]) {
      this.laserSystem.spawnLaser(this.ships[0].getFrontPosition(), target, damage, laserVisuals);
      
      // Rapid fire upgrade: fire additional lasers from 2 random ships
      if (state.subUpgrades['rapid_fire'] && this.ships.length > 1) {
        const otherShips = this.ships.slice(1);
        const count = Math.min(2, otherShips.length);
        for (let i = 0; i < count; i++) {
          const ship = otherShips[i];
          if (ship) {
            this.laserSystem.spawnLaser(ship.getFrontPosition(), target, damage, laserVisuals);
          }
        }
      }
    }

    // Spawn visual ripple
    const rippleRadius = this.ball ? this.ball.radius * 2 : 100;
    this.rippleSystem.spawnRipple(target, rippleRadius);
  }

  private fireBossVolley(): void {
    const state = this.store.getState();
    let damage = this.upgradeSystem.getPointsPerHit(state);
    
    // Apply boss damage bonus from prestige
    const prestigeBossLevel = state.prestigeUpgrades?.prestige_boss_power ?? 0;
    const bossDamageBonus = 1 + (prestigeBossLevel * 0.2);
    damage *= bossDamageBonus;
    
    // Check for void heart upgrade (extra boss damage)
    const voidHeartBonus = state.subUpgrades['void_heart'] ? 6 : 1; // +500% = 6x
    const bossTargetDamage = damage * voidHeartBonus;
    
    const target = { x: this.bossBall?.x ?? 0, y: this.bossBall?.y ?? 0 };
    const laserVisuals = this.getLaserVisuals(state);

    // Fire from ALL ships at the boss for epic effect!
    for (const ship of this.ships) {
      this.laserSystem.spawnLaser(ship.getFrontPosition(), target, bossTargetDamage, laserVisuals);
    }

    // Bigger ripple for boss
    const rippleRadius = this.bossBall ? this.bossBall.radius * 2.5 : 150;
    this.rippleSystem.spawnRipple(target, rippleRadius);
  }

  private fireSingleShip(shipIndex: number): void {
    if (shipIndex >= this.ships.length) return;
    const ship = this.ships[shipIndex];
    if (!ship) return;

    const state = this.store.getState();
    const damage = this.upgradeSystem.getPointsPerHit(state);
    const target = { x: this.ball?.x ?? 0, y: this.ball?.y ?? 0 };
    const laserVisuals = this.getLaserVisuals(state);

    // Mark laser as from ship so it can be hidden for performance
    this.laserSystem.spawnLaser(ship.getFrontPosition(), target, damage, { 
      ...laserVisuals, 
      isFromShip: true
    });
  }

  // Debug method to check laser statistics
  private debugLaserStats(): void {
    const stats = this.laserSystem.getLaserStats();
    if (stats.total > 200) {
      console.log(`Lasers: ${stats.total.toString()} total (${stats.playerLasers.toString()} player, ${stats.shipLasers.toString()} ship)`);
    }
  }

  private getLaserVisuals(state: import('./types').GameState): { isCrit: boolean; color: string; width: number } {
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
        isCrit
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
        isCrit
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
          glow: false, // No glow for performance
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
    // Apply any remaining batched damage before destroying
    if (this.damageBatch > 0) {
      this.applyDamageBatch();
    }
    
    const state = this.store.getState();
    this.store.incrementAlienKill();
    
    // Reduced XP gain - more balanced progression
    // Base XP is just 1 per kill, scales with multipliers
    const baseXP = 1;
    const bonusXP = this.upgradeSystem.getBonusXP(state) * baseXP;
    state.experience += bonusXP;

    // Handle multiple level ups if we gained enough XP
    let leveledUp = false;
    while (state.experience >= ColorManager.getExpRequired(state.level)) {
      const expRequired = ColorManager.getExpRequired(state.level);
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();
      leveledUp = true;
    }

    if (leveledUp) {
      this.soundManager.playLevelUp();

      if (ColorManager.isBossLevel(state.level)) {
        this.showBossDialog();
      } else {
        setTimeout(() => {
          this.createBall();
        }, 400);
      }
    } else {
      setTimeout(() => {
        this.createBall();
      }, 400);
    }

    this.store.setState(state);
  }

  /**
   * Handle boss defeat - now works just like normal alien
   */
  private handleBossDefeat(): void {
    const state = this.store.getState();
    this.store.incrementBossKill();
    
    // Boss rewards scale with level
    const baseReward = state.level * 10000;
    const bonusMultiplier = 1 + (this.comboSystem.getCombo() * 0.01); // Combo gives extra bonus
    const bossReward = Math.floor(baseReward * bonusMultiplier);
    
    // Grant points
    this.store.addPoints(bossReward);
    
    // Boss XP - reduced from 100 to 50 per level for better balance
    const bossXP = Math.floor(state.level * 50);
    state.experience += bossXP;
    
    // Handle level ups (should always level up at least once after boss)
    while (state.experience >= ColorManager.getExpRequired(state.level)) {
      const expRequired = ColorManager.getExpRequired(state.level);
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();
    }
    
    this.store.setState(state);
    
    this.soundManager.playBossDefeat();
    this.comboSystem.reset(); // Reset combo after boss fight
    
    // Visual celebration
    if (this.userSettings.highGraphics && this.bossBall) {
      const bossPos = { x: this.bossBall.x, y: this.bossBall.y };
      this.particleSystem.spawnExplosion(bossPos.x, bossPos.y, '#ffaa00');
      // Second delayed explosion
      setTimeout(() => {
        this.particleSystem.spawnExplosion(bossPos.x, bossPos.y, '#ff0000');
      }, 200);
    }
    
    setTimeout(() => {
      this.startTransitionToNormal();
    }, 1000);
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
    this.comboSystem.reset();
    
    setTimeout(() => {
      this.createBoss();
      this.mode = 'boss';
    }, this.transitionDuration * 500);
  }

  private startTransitionToNormal(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.bossBall = null; // Clear boss
    
    setTimeout(() => {
      this.createBall();
      this.mode = 'normal';
    }, this.transitionDuration * 500);
  }

  private update(dt: number): void {
    const state = this.store.getState();

    // Track play time
    this.playTimeAccumulator += dt;
    if (this.playTimeAccumulator >= 1) {
      this.store.addPlayTime(Math.floor(this.playTimeAccumulator));
      this.playTimeAccumulator = this.playTimeAccumulator % 1;
    }

    // Passive point generation
    this.passiveGenAccumulator += dt;
    if (this.passiveGenAccumulator >= 1) {
      const passiveGen = this.upgradeSystem.getPassiveGen(state);
      if (passiveGen > 0) {
        this.store.addPoints(passiveGen);
      }
      this.passiveGenAccumulator = this.passiveGenAccumulator % 1;
    }

    // Update HUD stats
    try {
      const dps = this.hud.calculateDPS();
      const passiveGen = this.upgradeSystem.getPassiveGen(state);
      const critChance = this.upgradeSystem.getCritChance(state);
      this.hud.updateStats(dps, passiveGen, critChance);
    } catch {
      // Ignore errors in stat updates
    }

    // Check achievements every frame
    this.achievementSystem.checkAchievements(state);

    if (this.mode === 'transition') {
      this.transitionTime += dt;
      if (this.transitionTime >= this.transitionDuration) {
        this.transitionTime = 0;
      }
    }

    this.ball?.update(dt);
    this.bossBall?.update(dt, this.canvas.getWidth(), this.canvas.getHeight());
    
    this.laserSystem.update(dt, (damage, isCrit) => {
      this.handleDamage(damage, isCrit);
    });
    this.rippleSystem.update(dt);
    this.particleSystem.update(dt);
    this.damageNumberSystem.update(dt);
    this.comboSystem.update(dt);
    
    // Debug laser stats occasionally
    if (Math.random() < 0.01) { // 1% chance per frame
      this.debugLaserStats();
    }
    
    // Apply damage batches periodically
    this.batchTimer += dt;
    if (this.batchTimer >= this.batchInterval) {
      this.applyDamageBatch();
      this.batchTimer = 0;
    }
    
    // Add boss trail particles (only if high graphics)
    if (this.userSettings.highGraphics && this.mode === 'boss' && this.bossBall) {
      const bossPos = this.bossBall.getPosition();
      const phase = this.bossBall.getPhase();
      let trailColor = '#ffffff';
      if (phase === 3) trailColor = '#ff0000';
      else if (phase === 2) trailColor = '#ffaa00';
      
      this.particleSystem.spawnTrail(bossPos.x, bossPos.y, trailColor);
    }

    // Rotate ships around the alien (uses each ship's own fixed rotation speed)
    if (this.mode === 'normal') {
      for (const ship of this.ships) {
        ship.rotate(dt); // Uses ship's fixed rotation speed
      }
    }

    // Auto-fire only in normal mode
    // In boss mode, player manually fires all ships with each click
    if (this.mode === 'normal') {
      // Auto-fire for all ships except the main ship (index 0)
      // Always fire (for damage), but may not render visually
      this.autoFireSystem.update(
        dt,
        true, // Auto-fire always enabled for non-main ships
        this.upgradeSystem.getFireCooldown(state),
        (shipIndex) => {
          if (shipIndex > 0) {
            this.fireSingleShip(shipIndex);
          }
        }
      );
    }

    this.saveTimer += dt;
    if (this.saveTimer >= this.saveInterval) {
      Save.save(state);
      this.saveTimer = 0;
    }

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }
  }

  private render(): void {
    this.canvas.clear();
    const ctx = this.canvas.getContext();

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
      // Layer 1: Background effects
      if (this.userSettings.highGraphics) {
        this.particleSystem.draw(this.draw);
      }
      if (this.userSettings.showRipples) {
        this.rippleSystem.draw(this.draw);
      }
      
      // Layer 2: Lasers (behind the ball for 3D depth effect)
      this.laserSystem.draw(this.draw);
      
      // Layer 3: Main entities (ball appears in front of lasers)
      this.ball?.draw(this.draw);
      this.bossBall?.draw(this.draw);

      // Layer 4: Ships (always visible now)
      for (const ship of this.ships) {
        ship.draw(this.draw);
      }

      // Layer 5: UI elements on top
      this.damageNumberSystem.draw(this.draw);
      
      // Draw combo
      if (this.comboSystem.getCombo() > 0) {
        this.comboSystem.draw(this.draw, this.canvas.getWidth());
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
    const maxRadius = Math.max(
      this.canvas.getWidth(),
      this.canvas.getHeight(),
    );

    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (progress + i * 0.2);
      this.draw.setStroke('#fff', 2);
      this.draw.circle(cx, cy, radius, false);
    }

    this.draw.resetAlpha();
  }

  start(): void {
    this.loop.start();
  }

  private resetGame(): void {
    Save.clear();
    this.store.setState(Save.load());
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

  private handleResize(): void {
    // Reposition ball to center
    if (this.ball) {
      this.ball.x = this.canvas.getCenterX();
      this.ball.y = this.canvas.getCenterY();
    }
    
    // Reposition boss ball
    if (this.bossBall) {
      const cx = this.canvas.getCenterX();
      const cy = this.canvas.getCenterY();
      this.bossBall.x = cx;
      this.bossBall.y = cy;
    }
    
    // Recreate ships with new positions
    if (this.ships.length > 0) {
      this.createShips();
    }
  }
}



