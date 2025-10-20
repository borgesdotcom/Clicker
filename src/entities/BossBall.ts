import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class BossBall {
  private flashTime = 0;
  private flashDuration = 0.15;
  public currentHp: number;
  public maxHp: number;
  private breakAnimTime = 0;
  private breakAnimDuration = 0.6;
  public x: number;
  public y: number;
  private vx = 0;
  private vy = 0;
  private speed = 150;
  private attackTimer = 0;
  private attackCooldown = 2;
  private phase = 1;

  constructor(
    x: number,
    y: number,
    public radius: number,
    hp: number,
  ) {
    this.x = x;
    this.y = y;
    this.maxHp = hp;
    this.currentHp = this.maxHp;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  isPointInside(point: Vec2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  takeDamage(amount: number): boolean {
    const wasAlive = this.currentHp > 0;
    this.currentHp = Math.max(0, this.currentHp - amount);
    this.triggerFlash();
    if (this.currentHp <= 0 && wasAlive) {
      this.breakAnimTime = this.breakAnimDuration;
      return true;
    }
    return false;
  }

  triggerFlash(): void {
    this.flashTime = this.flashDuration;
  }

  isBreaking(): boolean {
    return this.breakAnimTime > 0;
  }

  update(dt: number, canvasWidth: number, canvasHeight: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
      return;
    }

    // Update phase based on HP
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent < 0.33) {
      this.phase = 3;
      this.speed = 250;
      this.attackCooldown = 0.8;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
      this.speed = 200;
      this.attackCooldown = 1.2;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
      this.vx *= -1;
      this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
      this.vy *= -1;
      this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
    }

    // Update attack timer
    this.attackTimer += dt;
  }

  shouldAttack(): boolean {
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      return true;
    }
    return false;
  }

  getPhase(): number {
    return this.phase;
  }

  getAttackPattern(): 'single' | 'spread' | 'spiral' {
    if (this.phase === 3) return 'spiral';
    if (this.phase === 2) return 'spread';
    return 'single';
  }

  draw(drawer: Draw): void {
    if (this.breakAnimTime > 0) {
      const progress = 1 - this.breakAnimTime / this.breakAnimDuration;
      const alpha = 1 - progress;
      const scale = 1 + progress * 0.8;
      
      drawer.setAlpha(alpha);
      drawer.setFill('#fff');
      drawer.circle(this.x, this.y, this.radius * scale);
      drawer.setStroke('#fff', 4);
      drawer.circle(this.x, this.y, this.radius * scale, false);
      drawer.resetAlpha();
      return;
    }

    drawer.setFill('#fff');
    drawer.circle(this.x, this.y, this.radius);
    drawer.setStroke('#fff', 3);
    drawer.circle(this.x, this.y, this.radius, false);

    const eyeOffset = this.radius * 0.3;
    const eyeSize = this.radius * 0.15;
    drawer.setFill('#000');
    drawer.circle(this.x - eyeOffset, this.y - eyeOffset * 0.5, eyeSize);
    drawer.circle(this.x + eyeOffset, this.y - eyeOffset * 0.5, eyeSize);

    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 10;
    const hpBarY = this.y - this.radius - 20;
    const hpPercent = this.currentHp / this.maxHp;

    drawer.setStroke('#fff', 2);
    drawer.setFill('#000');
    drawer.getContext().fillRect(
      this.x - hpBarWidth / 2,
      hpBarY,
      hpBarWidth,
      hpBarHeight,
    );
    drawer.getContext().strokeRect(
      this.x - hpBarWidth / 2,
      hpBarY,
      hpBarWidth,
      hpBarHeight,
    );

    drawer.setFill('#fff');
    drawer.getContext().fillRect(
      this.x - hpBarWidth / 2 + 2,
      hpBarY + 2,
      (hpBarWidth - 4) * hpPercent,
      hpBarHeight - 4,
    );

    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      drawer.setAlpha(flashAlpha * 0.6);
      drawer.setStroke('#fff', 4);
      const flashRadius = this.radius * (1 + (1 - flashAlpha) * 0.4);
      drawer.circle(this.x, this.y, flashRadius, false);
      drawer.resetAlpha();
    }
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}

