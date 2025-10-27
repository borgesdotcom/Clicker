import type { Draw } from '../render/Draw';
import type { Vec2, BallColor } from '../types';
import { ColorManager } from '../math/ColorManager';

export class AlienBall {
  private flashTime = 0;
  private flashDuration = 0.15;
  public currentHp: number;
  public maxHp: number;
  private breakAnimTime = 0;
  private breakAnimDuration = 0.4;

  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: BallColor,
  ) {
    const baseHp = color.hp;
    this.maxHp = Math.floor(baseHp + Math.random() * baseHp * 0.5);
    this.currentHp = this.maxHp;
  }

  private static getRandomColor(): BallColor {
    const colors = [
      { fill: '#ff4444', stroke: '#cc0000', hp: 100 },
      { fill: '#ff8800', stroke: '#cc6600', hp: 100 },
      { fill: '#ffdd00', stroke: '#ccaa00', hp: 100 },
      { fill: '#88ff00', stroke: '#66cc00', hp: 100 },
      { fill: '#00ff88', stroke: '#00cc66', hp: 100 },
      { fill: '#0088ff', stroke: '#0066cc', hp: 100 },
      { fill: '#8800ff', stroke: '#6600cc', hp: 100 },
      { fill: '#ff0088', stroke: '#cc0066', hp: 100 },
      { fill: '#ff6600', stroke: '#cc4400', hp: 100 },
      { fill: '#ffaa00', stroke: '#cc8800', hp: 100 },
      { fill: '#00ffff', stroke: '#00cccc', hp: 100 },
      { fill: '#ff00ff', stroke: '#cc00cc', hp: 100 },
      { fill: '#66ff66', stroke: '#44cc44', hp: 100 },
      { fill: '#ff6666', stroke: '#cc4444', hp: 100 },
      { fill: '#6666ff', stroke: '#4444cc', hp: 100 },
    ];
    const index = Math.floor(Math.random() * colors.length);
    return (
      colors[index] ??
      colors[0] ?? { fill: '#ff6666', stroke: '#cc4444', hp: 100 }
    );
  }

  static createRandom(
    x: number,
    y: number,
    radius: number,
    level: number,
  ): AlienBall {
    const color = AlienBall.getRandomColor();
    // Use ColorManager for consistent HP scaling across the game
    const hp = ColorManager.getHp(level);

    const levelScaledColor = {
      ...color,
      hp: hp,
    };
    return new AlienBall(x, y, radius, levelScaledColor);
  }

  isPointInside(point: Vec2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  takeDamage(amount: number): boolean {
    const wasAlive = this.currentHp > 0;
    this.currentHp = Math.max(0, this.currentHp - amount);
    // Only flash on significant damage (>5% of max HP) or if not already flashing
    if (this.flashTime <= 0 || amount > this.maxHp * 0.05) {
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

  update(dt: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
    }
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();

    if (this.breakAnimTime > 0) {
      // Bubble popping animation!
      const progress = 1 - this.breakAnimTime / this.breakAnimDuration;
      const alpha = 1 - progress;
      const scale = 1 + progress * 0.8; // More dramatic pop

      drawer.setAlpha(alpha * 0.6);

      // Draw bubble segments flying apart
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = progress * this.radius * 2;
        const x = this.x + Math.cos(angle) * dist;
        const y = this.y + Math.sin(angle) * dist;

        drawer.setFill(this.color.fill);
        drawer.circle(x, y, this.radius * scale * 0.3);
      }

      drawer.resetAlpha();
      return;
    }

    // Draw bubble wrap bubble!
    // Main bubble body with gradient - more translucent
    const gradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius,
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Reduced highlight
    gradient.addColorStop(0.3, this.color.fill + '99'); // More transparent color
    gradient.addColorStop(1, this.color.stroke + 'cc'); // Slightly transparent edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle glossy highlight (reduced white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(
      this.x - this.radius * 0.35,
      this.y - this.radius * 0.35,
      this.radius * 0.35,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Outer ring (bubble wrap cell edge)
    ctx.strokeStyle = this.color.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner shadow for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();

    // Health bar (bubble integrity)
    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 6;
    const hpBarY = this.y - this.radius - 18;
    const hpPercent = this.currentHp / this.maxHp;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    // Health fill - color changes based on bubble integrity
    let fillColor = '#00ff00'; // Fresh bubble
    if (hpPercent < 0.3)
      fillColor = '#ff0000'; // About to pop!
    else if (hpPercent < 0.6) fillColor = '#ffaa00'; // Damaged

    ctx.fillStyle = fillColor;
    ctx.fillRect(
      this.x - hpBarWidth / 2,
      hpBarY,
      hpBarWidth * hpPercent,
      hpBarHeight,
    );

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    // Flash effect when damaged
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      drawer.setAlpha(flashAlpha * 0.7);
      drawer.setStroke('#fff', 4);
      const flashRadius = this.radius * (1 + (1 - flashAlpha) * 0.2);
      drawer.circle(this.x, this.y, flashRadius, false);
      drawer.resetAlpha();
    }
  }
}
