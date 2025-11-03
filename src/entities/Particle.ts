import type { Draw } from '../render/Draw';
import { ObjectPool } from '../utils/ObjectPool';

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  decay: number;
  glow?: boolean;
}

export class Particle {
  public active = true;
  public x!: number;
  public y!: number;
  private vx!: number;
  private vy!: number;
  private color!: string;
  private size!: number;
  public life!: number;
  private maxLife!: number;
  private decay!: number;
  private glow!: boolean;

  constructor(config?: ParticleConfig) {
    if (config) {
      this.init(config);
    } else {
      // Default values for pool creation
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.color = '#fff';
      this.size = 1;
      this.life = 1;
      this.maxLife = 1;
      this.decay = 1;
      this.glow = false;
    }
  }

  init(config: ParticleConfig): void {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.color = config.color;
    this.size = config.size;
    this.life = config.life;
    this.maxLife = config.life;
    this.decay = config.decay;
    this.glow = config.glow ?? false;
    this.active = true;
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= this.decay * dt;

    // Apply gravity
    this.vy += 100 * dt;

    // Air resistance
    this.vx *= 0.99;
    this.vy *= 0.99;

    if (this.life <= 0) {
      this.active = false;
    }
  }

  draw(drawer: Draw): void {
    const alpha = this.life / this.maxLife;
    drawer.setAlpha(alpha);

    if (this.glow) {
      drawer.setGlow(this.color, 10);
    }

    drawer.setFill(this.color);
    drawer.circle(this.x, this.y, this.size);

    if (this.glow) {
      drawer.clearGlow();
    }

    drawer.resetAlpha();
  }
}

export class ParticleSystem {
  private particlePool: ObjectPool<Particle>;
  private maxParticles = 200;

  constructor() {
    this.particlePool = new ObjectPool<Particle>(
      () => new Particle(),
      (particle) => {
        particle.active = false;
        particle.life = 0;
      },
      50,
      this.maxParticles,
    );
  }

  spawnParticles(config: {
    x: number;
    y: number;
    count: number;
    color?: string;
    spread?: number;
    speed?: number;
    size?: number;
    life?: number;
    glow?: boolean;
  }): void {
    const {
      x,
      y,
      count,
      color = '#fff',
      spread = Math.PI * 2,
      speed = 100,
      size = 3,
      life = 1,
      glow = false,
    } = config;

    for (let i = 0; i < count; i++) {
      const stats = this.particlePool.getStats();
      if (stats.active >= this.maxParticles) {
        break;
      }

      const angle = Math.random() * spread - spread / 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      const particle = this.particlePool.acquire();
      particle.init({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: size * (0.5 + Math.random()),
        life,
        decay: 1,
        glow,
      });
    }
  }

  spawnExplosion(x: number, y: number, color = '#ff0000', glow: boolean = true): void {
    this.spawnParticles({
      x,
      y,
      count: 30,
      color,
      spread: Math.PI * 2,
      speed: 200,
      size: 4,
      life: 0.8,
      glow,
    });
  }

  spawnTrail(x: number, y: number, color = '#ffffff'): void {
    this.spawnParticles({
      x,
      y,
      count: 2,
      color,
      spread: Math.PI / 4,
      speed: 30,
      size: 2,
      life: 0.4,
      glow: false,
    });
  }

  update(dt: number): void {
    const particles = this.particlePool.getActive();
    const toRelease: Particle[] = [];

    for (const particle of particles) {
      particle.update(dt);
      if (!particle.active) {
        toRelease.push(particle);
      }
    }

    for (const particle of toRelease) {
      this.particlePool.release(particle);
    }
  }

  draw(drawer: Draw): void {
    const particles = this.particlePool.getActive();
    for (const particle of particles) {
      if (particle.active) {
        particle.draw(drawer);
      }
    }
  }

  clear(): void {
    const particles = this.particlePool.getActive();
    this.particlePool.releaseAll([...particles]);
  }

  getParticleCount(): number {
    const stats = this.particlePool.getStats();
    return stats.active;
  }
}
