import type { Draw } from '../render/Draw';
import type { Vec2, BallColor } from '../types';

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
    return colors[Math.floor(Math.random() * colors.length)]!;
  }

  static createRandom(x: number, y: number, radius: number, level: number): AlienBall {
    const color = AlienBall.getRandomColor();
    // HP scales with level
    const levelScaledColor = {
      ...color,
      hp: Math.floor(color.hp * (1 + level * 0.3))
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

  update(dt: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
    }
  }

  draw(drawer: Draw): void {
    if (this.breakAnimTime > 0) {
      const progress = 1 - this.breakAnimTime / this.breakAnimDuration;
      const alpha = 1 - progress;
      const scale = 1 + progress * 0.5;
      
      drawer.setAlpha(alpha);
      drawer.setFill(this.color.fill);
      drawer.circle(this.x, this.y, this.radius * scale);
      drawer.setStroke(this.color.stroke, 3);
      drawer.circle(this.x, this.y, this.radius * scale, false);
      drawer.resetAlpha();
      return;
    }

    drawer.setFill(this.color.fill);
    drawer.circle(this.x, this.y, this.radius);
    drawer.setStroke(this.color.stroke, 2);
    drawer.circle(this.x, this.y, this.radius, false);

    const hpBarWidth = this.radius * 1.5;
    const hpBarHeight = 6;
    const hpBarY = this.y - this.radius - 15;
    const hpPercent = this.currentHp / this.maxHp;

    drawer.setStroke('#fff', 1);
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

    drawer.setFill(this.color.fill);
    drawer.getContext().fillRect(
      this.x - hpBarWidth / 2 + 1,
      hpBarY + 1,
      (hpBarWidth - 2) * hpPercent,
      hpBarHeight - 2,
    );

    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      drawer.setAlpha(flashAlpha * 0.5);
      drawer.setStroke('#fff', 3);
      const flashRadius = this.radius * (1 + (1 - flashAlpha) * 0.3);
      drawer.circle(this.x, this.y, flashRadius, false);
      drawer.resetAlpha();
    }
  }
}

