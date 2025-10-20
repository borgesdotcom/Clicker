import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class Ripple {
  public alive = true;
  private lifespan = 0.5;
  private age = 0;
  private maxRadius: number;

  constructor(
    public center: Vec2,
    maxRadius: number,
  ) {
    this.maxRadius = maxRadius;
  }

  update(dt: number): void {
    this.age += dt;
    if (this.age >= this.lifespan) {
      this.alive = false;
    }
  }

  draw(drawer: Draw): void {
    if (!this.alive) return;

    const progress = this.age / this.lifespan;
    const radius = this.maxRadius * progress;
    const alpha = (1 - progress) * 0.8;

    const grayValue = Math.floor(255 * 0.7);
    drawer.setAlpha(alpha);
    drawer.setStroke(`rgb(${grayValue},${grayValue},${grayValue})`, 2);
    drawer.circle(this.center.x, this.center.y, radius, false);
    drawer.resetAlpha();
  }
}

