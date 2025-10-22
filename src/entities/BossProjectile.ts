import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class BossProjectile {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private radius = 10;
  private lifetime = 5;
  private age = 0;
  private rotationAngle = 0;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    speed: number,
  ) {
    this.x = x;
    this.y = y;

    // Calculate direction to target
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize and apply speed
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
  }

  update(dt: number): boolean {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.age += dt;
    this.rotationAngle += dt * 5;

    // Return true if projectile should be removed
    return this.age >= this.lifetime;
  }

  draw(draw: Draw): void {
    const alpha = Math.max(0, 1 - this.age / this.lifetime);

    // Outer glow
    draw.setAlpha(alpha * 0.3);
    draw.setGlow('#ff0000', 20);
    draw.setFill('#ff0000');
    draw.circle(this.x, this.y, this.radius * 1.5, true);
    draw.clearGlow();

    // Main projectile body
    draw.setAlpha(alpha);
    draw.setGlow('#ff0000', 10);
    draw.setFill('#ff3300');
    draw.circle(this.x, this.y, this.radius, true);

    // Inner core
    draw.setFill('#ffaa00');
    draw.circle(this.x, this.y, this.radius * 0.6, true);

    // Bright center
    draw.setFill('#ffffff');
    draw.setAlpha(alpha * 0.8);
    draw.circle(this.x, this.y, this.radius * 0.3, true);

    draw.clearGlow();
    draw.resetAlpha();

    // Rotating energy lines
    const ctx = draw.getContext();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotationAngle);

    draw.setAlpha(alpha * 0.6);
    draw.setStroke('#ff6600', 2);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x1 = Math.cos(angle) * this.radius * 0.4;
      const y1 = Math.sin(angle) * this.radius * 0.4;
      const x2 = Math.cos(angle) * this.radius * 0.9;
      const y2 = Math.sin(angle) * this.radius * 0.9;
      draw.line(x1, y1, x2, y2);
    }
    draw.resetAlpha();
    ctx.restore();
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }

  getRadius(): number {
    return this.radius;
  }

  checkCollision(point: Vec2, targetRadius: number): boolean {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < this.radius + targetRadius;
  }
}
