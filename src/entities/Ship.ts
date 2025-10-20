import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class Ship {
  public x = 0;
  public y = 0;

  constructor(
    public angle: number,
    private centerX: number,
    private centerY: number,
    private orbitRadius: number,
    public isMainShip = false,
  ) {
    this.updatePosition();
  }

  updatePosition(): void {
    this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
  }

  rotate(dt: number, speed = 0.5): void {
    this.angle += speed * dt;
    this.updatePosition();
  }

  setOrbit(centerX: number, centerY: number, orbitRadius: number): void {
    this.centerX = centerX;
    this.centerY = centerY;
    this.orbitRadius = orbitRadius;
    this.updatePosition();
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }

  getFrontPosition(): Vec2 {
    const size = this.isMainShip ? 12 : 8;
    return {
      x: this.x + Math.cos(this.angle + Math.PI) * size,
      y: this.y + Math.sin(this.angle + Math.PI) * size,
    };
  }

  draw(drawer: Draw): void {
    const size = this.isMainShip ? 12 : 8;
    const tipX = this.x + Math.cos(this.angle + Math.PI) * size;
    const tipY = this.y + Math.sin(this.angle + Math.PI) * size;
    const left = {
      x: this.x + Math.cos(this.angle + Math.PI * 0.7) * size * 0.6,
      y: this.y + Math.sin(this.angle + Math.PI * 0.7) * size * 0.6,
    };
    const right = {
      x: this.x + Math.cos(this.angle + Math.PI * 1.3) * size * 0.6,
      y: this.y + Math.sin(this.angle + Math.PI * 1.3) * size * 0.6,
    };

    if (this.isMainShip) {
      drawer.setStroke('#fff', 2);
      drawer.triangle({ x: tipX, y: tipY }, left, right, false);
      drawer.setFill('#fff');
      const smallSize = size * 0.5;
      const innerTipX = this.x + Math.cos(this.angle + Math.PI) * smallSize;
      const innerTipY = this.y + Math.sin(this.angle + Math.PI) * smallSize;
      const innerLeft = {
        x: this.x + Math.cos(this.angle + Math.PI * 0.75) * smallSize * 0.6,
        y: this.y + Math.sin(this.angle + Math.PI * 0.75) * smallSize * 0.6,
      };
      const innerRight = {
        x: this.x + Math.cos(this.angle + Math.PI * 1.25) * smallSize * 0.6,
        y: this.y + Math.sin(this.angle + Math.PI * 1.25) * smallSize * 0.6,
      };
      drawer.triangle({ x: innerTipX, y: innerTipY }, innerLeft, innerRight);
    } else {
      drawer.setFill('#fff');
      drawer.triangle({ x: tipX, y: tipY }, left, right);
    }
  }
}

