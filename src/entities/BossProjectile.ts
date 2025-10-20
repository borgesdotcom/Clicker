import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class BossProjectile {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private radius = 8;
  private lifetime = 5;
  private age = 0;

  constructor(x: number, y: number, targetX: number, targetY: number, speed: number) {
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

    // Return true if projectile should be removed
    return this.age >= this.lifetime;
  }

  draw(draw: Draw): void {
    const alpha = Math.max(0, 1 - this.age / this.lifetime);
    draw.setAlpha(alpha);
    draw.setFill('#ff0000');
    draw.circle(this.x, this.y, this.radius, true);
    draw.setFill('#ff6666');
    draw.circle(this.x, this.y, this.radius * 0.5, true);
    draw.resetAlpha();
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

