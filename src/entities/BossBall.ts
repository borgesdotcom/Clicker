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
  private rotationAngle = 0;
  private pulseTime = 0;
  private chargeTime = 0;

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
    // Only flash on significant damage (>2% of max HP) or if not already flashing
    if (this.flashTime <= 0 || amount > this.maxHp * 0.02) {
      this.triggerFlash();
    }
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
    
    // Update visual effects
    this.rotationAngle += dt * this.phase;
    this.pulseTime += dt * 2;
    
    // Charge effect before attacking
    if (this.attackTimer >= this.attackCooldown - 0.5) {
      this.chargeTime += dt * 5;
    } else {
      this.chargeTime = 0;
    }
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
      drawer.setGlow('#ff0000', 30);
      drawer.setFill('#ff0000');
      drawer.circle(this.x, this.y, this.radius * scale);
      drawer.setStroke('#ff0000', 4);
      drawer.circle(this.x, this.y, this.radius * scale, false);
      drawer.clearGlow();
      drawer.resetAlpha();
      return;
    }

    const hpPercent = this.currentHp / this.maxHp;
    
    // Phase-based color
    let mainColor = '#ffffff';
    let accentColor = '#ffaa00';
    if (this.phase === 3) {
      mainColor = '#ff0000';
      accentColor = '#ff6600';
    } else if (this.phase === 2) {
      mainColor = '#ffaa00';
      accentColor = '#ffff00';
    }

    // Pulsing glow effect
    const pulse = Math.sin(this.pulseTime) * 0.5 + 0.5;
    const glowIntensity = 10 + pulse * 20 * this.phase;
    
    // Draw outer glow rings
    for (let i = 3; i >= 1; i--) {
      const ringAlpha = 0.15 / i;
      drawer.setAlpha(ringAlpha);
      drawer.setGlow(mainColor, glowIntensity);
      drawer.setStroke(mainColor, 2);
      drawer.circle(this.x, this.y, this.radius + i * 15 + pulse * 5, false);
      drawer.clearGlow();
      drawer.resetAlpha();
    }

    // Charge effect
    if (this.chargeTime > 0) {
      const chargeAlpha = Math.min(this.chargeTime, 1) * 0.4;
      drawer.setAlpha(chargeAlpha);
      drawer.setGlow(accentColor, 20);
      drawer.setFill(accentColor);
      drawer.circle(this.x, this.y, this.radius * (1 + this.chargeTime * 0.2));
      drawer.clearGlow();
      drawer.resetAlpha();
    }

    // Main body
    drawer.setGlow(mainColor, glowIntensity);
    drawer.setFill(mainColor);
    drawer.circle(this.x, this.y, this.radius);
    drawer.clearGlow();

    // Rotating energy patterns
    const ctx = drawer.getContext();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotationAngle);
    
    drawer.setAlpha(0.6);
    drawer.setStroke(accentColor, 3);
    for (let i = 0; i < this.phase * 3; i++) {
      const angle = (i / (this.phase * 3)) * Math.PI * 2;
      const x1 = Math.cos(angle) * this.radius * 0.5;
      const y1 = Math.sin(angle) * this.radius * 0.5;
      const x2 = Math.cos(angle) * this.radius;
      const y2 = Math.sin(angle) * this.radius;
      drawer.line(x1, y1, x2, y2);
    }
    drawer.resetAlpha();
    ctx.restore();

    // Eyes - more menacing as phases progress
    const eyeOffset = this.radius * 0.3;
    const eyeSize = this.radius * (0.12 + this.phase * 0.03);
    drawer.setGlow('#ff0000', 5);
    drawer.setFill('#000000');
    drawer.circle(this.x - eyeOffset, this.y - eyeOffset * 0.5, eyeSize);
    drawer.circle(this.x + eyeOffset, this.y - eyeOffset * 0.5, eyeSize);
    
    // Eye glow
    drawer.setFill('#ff0000');
    drawer.setAlpha(0.8);
    drawer.circle(this.x - eyeOffset, this.y - eyeOffset * 0.5, eyeSize * 0.5);
    drawer.circle(this.x + eyeOffset, this.y - eyeOffset * 0.5, eyeSize * 0.5);
    drawer.resetAlpha();
    drawer.clearGlow();

    // HP bar with phase color
    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 10;
    const hpBarY = this.y - this.radius - 30;

    drawer.setGlow(mainColor, 5);
    drawer.setStroke(mainColor, 2);
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

    drawer.setFill(mainColor);
    drawer.getContext().fillRect(
      this.x - hpBarWidth / 2 + 2,
      hpBarY + 2,
      (hpBarWidth - 4) * hpPercent,
      hpBarHeight - 4,
    );
    drawer.clearGlow();

    // Flash effect on hit
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      drawer.setAlpha(flashAlpha * 0.8);
      drawer.setGlow('#ffffff', 30);
      drawer.setStroke('#ffffff', 6);
      const flashRadius = this.radius * (1 + (1 - flashAlpha) * 0.3);
      drawer.circle(this.x, this.y, flashRadius, false);
      drawer.clearGlow();
      drawer.resetAlpha();
    }
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}

