import { AlienBall } from './entities/AlienBall';
import { BossBall } from './entities/BossBall';
import { BossProjectile } from './entities/BossProjectile';
import { Ship } from './entities/Ship';
import { PlayerShip } from './entities/PlayerShip';
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
import { Hud } from './ui/Hud';
import { Shop } from './ui/Shop';
import { UpgradesDisplay } from './ui/UpgradesDisplay';
import { AchievementSnackbar } from './ui/AchievementSnackbar';
import { AchievementsModal } from './ui/AchievementsModal';
import { Layout } from './ui/Layout';
import { ColorManager } from './math/ColorManager';
import type { Vec2, GameMode } from './types';

export class Game {
  private canvas: Canvas;
  private draw: Draw;
  private loop: Loop;
  private input: Input;
  private store: Store;
  private ball: AlienBall | null = null;
  private bossBall: BossBall | null = null;
  private ships: Ship[] = [];
  private playerShip: PlayerShip | null = null;
  private bossProjectiles: BossProjectile[] = [];
  private laserSystem: LaserSystem;
  private rippleSystem: RippleSystem;
  private upgradeSystem: UpgradeSystem;
  private autoFireSystem: AutoFireSystem;
  private achievementSystem: AchievementSystem;
  private achievementSnackbar: AchievementSnackbar;
  private achievementsModal: AchievementsModal;
  private hud: Hud;
  private upgradesDisplay: UpgradesDisplay;
  private saveTimer = 0;
  private saveInterval = 3;
  private playTimeAccumulator = 0;
  private shakeTime = 0;
  private shakeAmount = 0;
  private mode: GameMode = 'normal';
  private transitionTime = 0;
  private transitionDuration = 2;
  private keys: Set<string> = new Set();
  private shootCooldown = 0;
  private shootCooldownMax = 0.2;

  constructor() {
    const canvasElement = document.getElementById(
      'game-canvas',
    ) as HTMLCanvasElement;
    if (!canvasElement) throw new Error('Canvas not found');

    this.canvas = new Canvas(canvasElement);
    this.draw = new Draw(this.canvas.getContext());
    this.store = new Store(Save.load());
    this.upgradeSystem = new UpgradeSystem();
    this.laserSystem = new LaserSystem();
    this.rippleSystem = new RippleSystem();
    this.autoFireSystem = new AutoFireSystem();
    this.achievementSystem = new AchievementSystem();
    this.achievementSnackbar = new AchievementSnackbar();
    this.achievementsModal = new AchievementsModal(this.achievementSystem);
    this.hud = new Hud();
    this.upgradesDisplay = new UpgradesDisplay(this.upgradeSystem);
    new Shop(this.store, this.upgradeSystem);

    this.achievementSystem.setOnUnlock((achievement) => {
      this.achievementSnackbar.show(achievement);
    });
    this.achievementSystem.updateFromState(this.store.getState());

    this.input = new Input(canvasElement);
    this.loop = new Loop(
      (dt) => this.update(dt),
      () => this.render(),
    );

    this.initGame();
    this.setupInput();
    this.setupKeyboard();
    this.setupAutoSave();
    this.setupBossDialog();
    this.setupAchievementsButton();
    Layout.setupResetButton(() => this.resetGame());
  }

  private setupBossDialog(): void {
    const startBtn = document.getElementById('boss-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const dialog = document.getElementById('boss-dialog');
        if (dialog) dialog.style.display = 'none';
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

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ' && this.mode === 'boss') {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
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
    const radius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.12;
    const state = this.store.getState();
    const hp = ColorManager.getBossHp(state.level);
    this.bossBall = new BossBall(cx, cy, radius, hp);
    this.ball = null;
    this.playerShip = new PlayerShip(cx, this.canvas.getHeight() - 100);
  }

  private createShips(): void {
    const state = this.store.getState();
    const cx = this.canvas.getCenterX();
    const cy = this.canvas.getCenterY();
    const orbitRadius =
      Math.min(this.canvas.getWidth(), this.canvas.getHeight()) * 0.4;

    this.ships = [];
    for (let i = 0; i < state.shipsCount; i++) {
      const angle = (i / state.shipsCount) * Math.PI * 2;
      const isMain = i === 0;
      this.ships.push(new Ship(angle, cx, cy, orbitRadius, isMain));
    }
    this.autoFireSystem.setShipCount(state.shipsCount);
  }

  private setupInput(): void {
    this.input.onClick((pos) => this.handleClick(pos));
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
      Save.save(this.store.getState());
    });
  }

  private handleClick(pos: Vec2): void {
    if (this.mode === 'transition') return;

    if (this.mode === 'normal' && this.ball?.isPointInside(pos) && this.ball.currentHp > 0) {
      this.store.incrementClick();
      this.fireVolley();
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
    }

    this.rippleSystem.spawnRipple(target, (this.ball?.radius ?? 50) * 2);
  }

  private shootLaser(): void {
    if (!this.playerShip) return;
    if (this.shootCooldown > 0) return;

    const state = this.store.getState();
    const damage = this.upgradeSystem.getPointsPerHit(state);
    const origin = this.playerShip.getFrontPosition();
    const angle = this.playerShip.getAngle();
    const laserVisuals = this.getLaserVisuals(state);
    
    // Shoot in the direction the ship is facing, not at the boss
    const laserRange = 2000;
    const target = {
      x: origin.x + Math.cos(angle) * laserRange,
      y: origin.y + Math.sin(angle) * laserRange,
    };
    
    this.laserSystem.spawnLaser(origin, target, damage, laserVisuals);
    this.shootCooldown = this.shootCooldownMax;
  }

  private fireSingleShip(shipIndex: number): void {
    const ship = this.ships[shipIndex];
    if (!ship) return;

    const state = this.store.getState();
    const damage = this.upgradeSystem.getPointsPerHit(state);
    const target = { x: this.ball?.x ?? 0, y: this.ball?.y ?? 0 };
    const laserVisuals = this.getLaserVisuals(state);

    this.laserSystem.spawnLaser(ship.getFrontPosition(), target, damage, laserVisuals);
  }

  private getLaserVisuals(state: any): { isCrit: boolean; color: string; width: number } {
    let color = '#fff';
    let width = 2;
    let isCrit = false;

    // Check for perfect precision crit
    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        isCrit = true;
        color = '#ffff00'; // Yellow for crit
        width = 4;
        return { isCrit, color, width };
      }
    }

    // Laser color based on damage upgrades
    if (state.subUpgrades['cosmic_ascension']) {
      color = '#ff00ff'; // Magenta for cosmic
      width = 3;
    } else if (state.subUpgrades['singularity_core']) {
      color = '#8800ff'; // Purple for singularity
      width = 3;
    } else if (state.subUpgrades['antimatter_rounds']) {
      color = '#ff0088'; // Pink for antimatter
      width = 3;
    } else if (state.subUpgrades['overclocked_reactors']) {
      color = '#ff6600'; // Orange for overclocked
      width = 2.5;
    } else if (state.subUpgrades['laser_focusing']) {
      color = '#00ffff'; // Cyan for focusing
      width = 2.5;
    } else if (state.pointMultiplierLevel >= 10) {
      color = '#88ff88'; // Light green for high level
      width = 2.5;
    }

    return { isCrit, color, width };
  }

  private handleDamage(damage: number): void {
    if (this.mode === 'normal' && this.ball) {
      const broken = this.ball.takeDamage(damage);
      this.store.addPoints(damage);
      if (broken) {
        this.onBallDestroyed();
      }
    } else if (this.mode === 'boss' && this.bossBall) {
      const broken = this.bossBall.takeDamage(damage);
      this.store.addPoints(damage * 2);
      if (broken) {
        this.onBossDestroyed();
      }
    }
  }

  private onBallDestroyed(): void {
    const state = this.store.getState();
    this.store.incrementAlienKill();
    
    const bonusXP = this.upgradeSystem.getBonusXP(state);
    state.experience += bonusXP;

    const expRequired = ColorManager.getExpRequired(state.level);
    if (state.experience >= expRequired) {
      state.experience -= expRequired;
      state.level++;
      this.store.updateMaxLevel();

      if (ColorManager.isBossLevel(state.level)) {
        this.showBossDialog();
      } else {
        setTimeout(() => this.createBall(), 400);
      }
    } else {
      setTimeout(() => this.createBall(), 400);
    }

    this.store.setState(state);
  }

  private onBossDestroyed(): void {
    const state = this.store.getState();
    this.store.incrementBossKill();
    state.experience = 0;
    state.level++;
    this.store.updateMaxLevel();
    this.store.setState(state);

    setTimeout(() => {
      this.startTransitionToNormal();
    }, 600);
  }

  private showBossDialog(): void {
    const dialog = document.getElementById('boss-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
    }
  }

  private startBossFight(): void {
    this.startTransitionToBoss();
  }

  private startTransitionToBoss(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    const bossControls = document.getElementById('boss-controls');
    if (bossControls) bossControls.style.display = 'none';
    setTimeout(() => {
      this.createBoss();
      this.mode = 'boss';
      if (bossControls) bossControls.style.display = 'block';
    }, this.transitionDuration * 500);
  }

  private startTransitionToNormal(): void {
    this.mode = 'transition';
    this.transitionTime = 0;
    this.playerShip = null;
    this.bossProjectiles = [];
    const bossControls = document.getElementById('boss-controls');
    if (bossControls) bossControls.style.display = 'none';
    setTimeout(() => {
      this.createBall();
      this.mode = 'normal';
    }, this.transitionDuration * 500);
  }

  private triggerShake(amount: number, duration: number): void {
    this.shakeAmount = amount;
    this.shakeTime = duration;
  }

  private spawnBossProjectiles(): void {
    if (!this.bossBall || !this.playerShip) return;

    const bossPos = this.bossBall.getPosition();
    const playerPos = this.playerShip.getPosition();
    const pattern = this.bossBall.getAttackPattern();
    const projectileSpeed = 200;

    if (pattern === 'single') {
      // Single projectile aimed at player
      this.bossProjectiles.push(
        new BossProjectile(bossPos.x, bossPos.y, playerPos.x, playerPos.y, projectileSpeed)
      );
    } else if (pattern === 'spread') {
      // 3 projectiles in a spread pattern
      const angleToPlayer = Math.atan2(playerPos.y - bossPos.y, playerPos.x - bossPos.x);
      const spreadAngle = Math.PI / 6; // 30 degrees spread
      
      for (let i = -1; i <= 1; i++) {
        const angle = angleToPlayer + (i * spreadAngle);
        const targetX = bossPos.x + Math.cos(angle) * 1000;
        const targetY = bossPos.y + Math.sin(angle) * 1000;
        this.bossProjectiles.push(
          new BossProjectile(bossPos.x, bossPos.y, targetX, targetY, projectileSpeed)
        );
      }
    } else if (pattern === 'spiral') {
      // 8 projectiles in all directions (spiral pattern)
      const numProjectiles = 8;
      for (let i = 0; i < numProjectiles; i++) {
        const angle = (i / numProjectiles) * Math.PI * 2;
        const targetX = bossPos.x + Math.cos(angle) * 1000;
        const targetY = bossPos.y + Math.sin(angle) * 1000;
        this.bossProjectiles.push(
          new BossProjectile(bossPos.x, bossPos.y, targetX, targetY, projectileSpeed * 1.2)
        );
      }
    }
  }

  private update(dt: number): void {
    const state = this.store.getState();

    // Track play time
    this.playTimeAccumulator += dt;
    if (this.playTimeAccumulator >= 1) {
      this.store.addPlayTime(Math.floor(this.playTimeAccumulator));
      this.playTimeAccumulator = this.playTimeAccumulator % 1;
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
    this.laserSystem.update(dt, (damage) => this.handleDamage(damage));
    this.rippleSystem.update(dt);

    // Rotate ships around the alien
    if (this.mode === 'normal') {
      for (const ship of this.ships) {
        ship.rotate(dt, 0.3);
      }
    }

    if (this.mode === 'boss' && this.playerShip) {
      if (this.keys.has('arrowleft') || this.keys.has('a')) {
        this.playerShip.rotate(-1, dt);
      }
      if (this.keys.has('arrowright') || this.keys.has('d')) {
        this.playerShip.rotate(1, dt);
      }
      if (this.keys.has('arrowup') || this.keys.has('w')) {
        this.playerShip.thrust(dt);
      }
      if (this.keys.has(' ') || this.keys.has('spacebar')) {
        this.shootLaser();
      }

      this.playerShip.update(dt, this.canvas.getWidth(), this.canvas.getHeight());

      if (this.shootCooldown > 0) {
        this.shootCooldown = Math.max(0, this.shootCooldown - dt);
      }

      // Boss attacks
      if (this.bossBall && this.bossBall.shouldAttack()) {
        this.spawnBossProjectiles();
      }

      // Update boss projectiles
      this.bossProjectiles = this.bossProjectiles.filter(proj => {
        const shouldRemove = proj.update(dt);
        
        // Check collision with player
        if (!shouldRemove && this.playerShip) {
          const playerPos = this.playerShip.getPosition();
          if (proj.checkCollision(playerPos, 15)) {
            // Hit player - small damage feedback
            this.triggerShake(3, 0.1);
            return true; // Remove projectile
          }
        }
        
        return !shouldRemove;
      });
    } else if (this.mode === 'normal') {
      // Auto-fire for all ships except the main ship (index 0)
      this.autoFireSystem.update(
        dt,
        true, // Auto-fire always enabled for non-main ships
        this.upgradeSystem.getFireCooldown(state),
        (shipIndex) => {
          // Skip main ship (index 0)
          if (shipIndex > 0) {
            this.fireSingleShip(shipIndex);
          }
        },
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
      this.rippleSystem.draw(this.draw);
      this.ball?.draw(this.draw);
      this.bossBall?.draw(this.draw);

      if (this.mode === 'boss') {
        this.playerShip?.draw(this.draw);
        // Draw boss projectiles
        for (const proj of this.bossProjectiles) {
          proj.draw(this.draw);
        }
      } else {
        for (const ship of this.ships) {
          ship.draw(this.draw);
        }
      }

      this.laserSystem.draw(this.draw);
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
    this.autoFireSystem.reset();
    this.saveTimer = 0;
  }
}


