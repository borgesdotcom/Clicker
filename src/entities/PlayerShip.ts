import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class PlayerShip {
  public x: number;
  public y: number;
  private vx = 0;
  private vy = 0;
  private angle = -Math.PI / 2;
  private rotationSpeed = 4;
  private acceleration = 300;
  private maxSpeed = 250;
  private friction = 0.98;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  rotate(direction: number, dt: number): void {
    this.angle += direction * this.rotationSpeed * dt;
  }

  thrust(dt: number): void {
    this.vx += Math.cos(this.angle) * this.acceleration * dt;
    this.vy += Math.sin(this.angle) * this.acceleration * dt;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }
  }

  update(dt: number, canvasWidth: number, canvasHeight: number): void {
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
  }

  getFrontPosition(): Vec2 {
    const size = 15;
    return {
      x: this.x + Math.cos(this.angle) * size,
      y: this.y + Math.sin(this.angle) * size,
    };
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }

  getAngle(): number {
    return this.angle;
  }

  draw(drawer: Draw): void {
    const size = 15;
    const tipX = this.x + Math.cos(this.angle) * size;
    const tipY = this.y + Math.sin(this.angle) * size;
    const left = {
      x: this.x + Math.cos(this.angle + (Math.PI * 2.5) / 3) * size * 0.7,
      y: this.y + Math.sin(this.angle + (Math.PI * 2.5) / 3) * size * 0.7,
    };
    const right = {
      x: this.x + Math.cos(this.angle + (Math.PI * 3.5) / 3) * size * 0.7,
      y: this.y + Math.sin(this.angle + (Math.PI * 3.5) / 3) * size * 0.7,
    };

    drawer.setStroke('#fff', 2);
    drawer.triangle({ x: tipX, y: tipY }, left, right, false);

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 50) {
      const flameLength = (speed / this.maxSpeed) * size * 0.5;
      const flameX = this.x - Math.cos(this.angle) * size * 0.3;
      const flameY = this.y - Math.sin(this.angle) * size * 0.3;
      const flameEndX = flameX - Math.cos(this.angle) * flameLength;
      const flameEndY = flameY - Math.sin(this.angle) * flameLength;

      drawer.setStroke('#fff', 1);
      drawer.line(flameX, flameY, flameEndX, flameEndY);
    }
  }
}

