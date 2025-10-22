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
  private attackTimer = 0;
  private attackCooldown = 2;
  private phase = 1;
  private pulseTime = 0;
  private chargeTime = 0;
  private tentacleAngles: number[] = [];
  private tentacleLengths: number[] = [];
  private eyeBlink = 0;
  private shieldPulse = 0;

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

    // Initialize tentacles
    const tentacleCount = 8;
    for (let i = 0; i < tentacleCount; i++) {
      this.tentacleAngles.push((i / tentacleCount) * Math.PI * 2);
      this.tentacleLengths.push(this.radius * (1.2 + Math.random() * 0.3));
    }
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

  update(dt: number, _canvasWidth: number, _canvasHeight: number): void {
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
      this.attackCooldown = 0.8;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
      this.attackCooldown = 1.2;
    }

    // Boss stays stationary in center - no movement!

    // Update attack timer
    this.attackTimer += dt;

    // Update visual effects
    this.pulseTime += dt * 2;
    this.shieldPulse += dt * 3;

    // Tentacle animation - writhe and wave
    for (let i = 0; i < this.tentacleAngles.length; i++) {
      const currentAngle = this.tentacleAngles[i];
      if (currentAngle !== undefined) {
        this.tentacleAngles[i] =
          currentAngle + dt * 0.5 * (i % 2 === 0 ? 1 : -1);
      }
    }

    // Eye blink
    this.eyeBlink = Math.max(0, this.eyeBlink - dt * 5);
    if (Math.random() < 0.01) {
      this.eyeBlink = 1;
    }

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
    const ctx = drawer.getContext();

    // Phase-based colors - more evil as HP drops
    let bodyColor = '#2a4a2a';
    let accentColor = '#00ff00';
    let eyeColor = '#ff0000';
    if (this.phase === 3) {
      bodyColor = '#4a0000';
      accentColor = '#ff0000';
      eyeColor = '#ffff00';
    } else if (this.phase === 2) {
      bodyColor = '#4a2a00';
      accentColor = '#ff6600';
      eyeColor = '#ff4400';
    }

    // Energy shield pulse
    const shieldPulse = Math.sin(this.shieldPulse) * 0.5 + 0.5;
    drawer.setAlpha(0.2 + shieldPulse * 0.15);
    drawer.setGlow(accentColor, 20);
    drawer.setStroke(accentColor, 2);
    drawer.circle(this.x, this.y, this.radius * 1.4, false);
    drawer.clearGlow();
    drawer.resetAlpha();

    // Draw writhing tentacles
    for (let i = 0; i < this.tentacleAngles.length; i++) {
      const angle = this.tentacleAngles[i];
      const length = this.tentacleLengths[i];
      if (angle === undefined || length === undefined) continue;

      const wave = Math.sin(this.pulseTime + i) * 10;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      // Tentacle body - thick to thin
      drawer.setAlpha(0.8);
      drawer.setStroke(bodyColor, 6);
      drawer.setGlow(accentColor, 5);

      // Draw curved tentacle
      ctx.beginPath();
      ctx.moveTo(this.radius * 0.8, 0);
      ctx.quadraticCurveTo(
        this.radius + length * 0.5,
        wave,
        this.radius + length,
        wave * 1.5,
      );
      ctx.stroke();

      // Tentacle tip - glowing
      drawer.setFill(accentColor);
      const tipX = this.radius + length;
      const tipY = wave * 1.5;
      drawer.circle(tipX, tipY, 3);

      drawer.clearGlow();
      drawer.resetAlpha();
      ctx.restore();
    }

    // Main alien body - organic and scary
    const pulse = Math.sin(this.pulseTime) * 0.5 + 0.5;

    // Outer membrane
    drawer.setGlow(accentColor, 10);
    drawer.setFill(bodyColor);
    drawer.setStroke(accentColor, 3);
    drawer.circle(this.x, this.y, this.radius);

    // Inner organs/core
    drawer.setAlpha(0.6);
    drawer.setFill(accentColor);
    drawer.circle(this.x, this.y, this.radius * (0.5 + pulse * 0.1));
    drawer.resetAlpha();
    drawer.clearGlow();

    // Spikes/ridges around body
    ctx.save();
    ctx.translate(this.x, this.y);
    drawer.setFill(bodyColor);
    drawer.setStroke(accentColor, 2);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + this.pulseTime * 0.2;
      const spikeLength = this.radius * 0.2;
      const x1 = Math.cos(angle) * this.radius;
      const y1 = Math.sin(angle) * this.radius;
      const x2 = Math.cos(angle) * (this.radius + spikeLength);
      const y2 = Math.sin(angle) * (this.radius + spikeLength);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(
        Math.cos(angle + 0.1) * this.radius,
        Math.sin(angle + 0.1) * this.radius,
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Multiple eyes - scary and alien
    const eyePositions = [
      { x: -0.35, y: -0.25 },
      { x: 0.35, y: -0.25 },
      { x: 0, y: -0.45 },
    ];

    for (const pos of eyePositions) {
      const eyeX = this.x + pos.x * this.radius;
      const eyeY = this.y + pos.y * this.radius;
      const eyeSize = this.radius * 0.15;

      // Eye socket
      drawer.setGlow('#000000', 5);
      drawer.setFill('#000000');
      drawer.circle(eyeX, eyeY, eyeSize);

      // Iris
      const irisSize =
        this.eyeBlink > 0 ? eyeSize * (1 - this.eyeBlink) * 0.6 : eyeSize * 0.6;
      drawer.setGlow(eyeColor, 10);
      drawer.setFill(eyeColor);
      drawer.circle(eyeX, eyeY, irisSize);

      // Pupil
      drawer.setFill('#000000');
      drawer.circle(eyeX, eyeY, irisSize * 0.4);

      drawer.clearGlow();
    }

    // Mouth/maw - opens based on phase
    const mouthY = this.y + this.radius * 0.4;
    const mouthWidth = this.radius * 0.6;
    const mouthOpen = this.phase * 0.15 + pulse * 0.05;

    ctx.save();
    ctx.translate(this.x, mouthY);
    drawer.setGlow(eyeColor, 5);
    drawer.setFill('#000000');
    drawer.setStroke(eyeColor, 2);

    ctx.beginPath();
    ctx.ellipse(0, 0, mouthWidth, this.radius * mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    drawer.clearGlow();
    ctx.restore();

    // Charge attack effect
    if (this.chargeTime > 0) {
      const chargeAlpha = Math.min(this.chargeTime, 1) * 0.5;
      drawer.setAlpha(chargeAlpha);
      drawer.setGlow(accentColor, 30);
      drawer.setStroke(accentColor, 4);
      drawer.circle(
        this.x,
        this.y,
        this.radius * (1 + this.chargeTime * 0.3),
        false,
      );
      drawer.circle(
        this.x,
        this.y,
        this.radius * (0.8 + this.chargeTime * 0.2),
        false,
      );
      drawer.clearGlow();
      drawer.resetAlpha();
    }

    // HP bar
    const hpBarWidth = this.radius * 2.5;
    const hpBarHeight = 12;
    const hpBarY = this.y - this.radius - 50;

    drawer.setGlow(accentColor, 8);
    drawer.setStroke(accentColor, 2);
    drawer.setFill('#000');
    drawer
      .getContext()
      .fillRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);
    drawer
      .getContext()
      .strokeRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    drawer.setFill(accentColor);
    drawer
      .getContext()
      .fillRect(
        this.x - hpBarWidth / 2 + 2,
        hpBarY + 2,
        (hpBarWidth - 4) * hpPercent,
        hpBarHeight - 4,
      );
    drawer.clearGlow();

    // Flash effect on hit
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      drawer.setAlpha(flashAlpha * 0.6);
      drawer.setGlow('#ffffff', 30);
      drawer.setStroke('#ffffff', 8);
      drawer.circle(this.x, this.y, this.radius * 1.2, false);

      // Impact waves
      for (let i = 0; i < 3; i++) {
        const waveRadius =
          this.radius * (1.2 + i * 0.3 + (1 - flashAlpha) * 0.5);
        drawer.circle(this.x, this.y, waveRadius, false);
      }

      drawer.clearGlow();
      drawer.resetAlpha();
    }
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}
