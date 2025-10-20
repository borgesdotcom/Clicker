import type { Vec2 } from '../types';

export class Draw {
  constructor(private ctx: CanvasRenderingContext2D) {}

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  circle(x: number, y: number, radius: number, fill = true): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  line(x1: number, y1: number, x2: number, y2: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  setStroke(color: string, width = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
  }

  setFill(color: string): void {
    this.ctx.fillStyle = color;
  }

  setAlpha(alpha: number): void {
    this.ctx.globalAlpha = alpha;
  }

  resetAlpha(): void {
    this.ctx.globalAlpha = 1;
  }

  triangle(p1: Vec2, p2: Vec2, p3: Vec2, fill = true): void {
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }
}

