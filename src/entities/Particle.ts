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
  style?: 'classic' | 'glow' | 'sparkle' | 'trail';
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
  private style!: 'classic' | 'glow' | 'sparkle' | 'trail';
  private creationTime!: number;

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
      this.style = 'classic';
      this.creationTime = Date.now();
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
    this.style = config.style ?? 'classic';
    this.creationTime = Date.now();
    this.active = true;
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= this.decay * dt;

    // Style-specific behavior
    if (this.style === 'trail') {
      // Trails have less gravity and slower decay
      this.vy += 50 * dt;
      this.vx *= 0.995;
      this.vy *= 0.995;
    } else if (this.style === 'sparkle') {
      // Sparkles have minimal gravity and float more
      this.vy += 30 * dt;
      this.vx *= 0.98;
      this.vy *= 0.98;
    } else {
      // Classic and glow: normal gravity
      this.vy += 100 * dt;
      this.vx *= 0.99;
      this.vy *= 0.99;
    }

    if (this.life <= 0) {
      this.active = false;
    }
  }

  draw(drawer: Draw): void {
    const alpha = this.life / this.maxLife;
    const ctx = drawer.getContext();
    const now = Date.now();
    const age = (now - this.creationTime) * 0.001;

    ctx.save();

    if (this.style === 'sparkle') {
      // Sparkle: twinkling star effect with pulsing - more visible
      const twinkle = Math.sin(age * 10.0) * 0.4 + 0.6;
      const sparkleAlpha = Math.min(alpha * twinkle, 1.0);
      ctx.globalAlpha = sparkleAlpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 5;
      ctx.shadowColor = this.color;

      // Draw larger star shape
      ctx.beginPath();
      const points = 5;
      const outerRadius = this.size;
      const innerRadius = this.size * 0.4;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = this.x + Math.cos(angle) * radius;
        const y = this.y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Add bright center glow
      ctx.globalAlpha = sparkleAlpha * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = this.size * 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.style === 'glow') {
      // Glow: enhanced glowing effect - more pronounced
      ctx.globalAlpha = Math.min(alpha * 0.8, 1.0);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 6;
      ctx.shadowColor = this.color;

      // Outer glow - larger
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Middle glow
      ctx.globalAlpha = Math.min(alpha * 0.9, 1.0);
      ctx.shadowBlur = this.size * 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.globalAlpha = Math.min(alpha * 1.0, 1.0);
      ctx.shadowBlur = this.size * 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.style === 'trail') {
      // Trail: elongated particle with fade - more visible
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = this.color;

      // Draw elongated shape in direction of movement using rotated rectangle
      const angle = Math.atan2(this.vy, this.vx);
      const length = this.size * 4.0; // Longer trails
      const width = this.size * 1.2;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);

      // Draw elongated rectangle
      ctx.fillRect(-length / 2, -width / 2, length, width);

      // Add rounded ends with circles
      ctx.beginPath();
      ctx.arc(-length / 2, 0, width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(length / 2, 0, width / 2, 0, Math.PI * 2);
      ctx.fill();

      // Add bright center
      ctx.globalAlpha = alpha * 0.9;
      ctx.shadowBlur = this.size * 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // Classic: simple circle
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;

      if (this.glow) {
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clear shadow properties after drawing
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.restore();
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
    style?: 'classic' | 'glow' | 'sparkle' | 'trail';
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
      style = 'classic',
    } = config;

    for (let i = 0; i < count; i++) {
      const stats = this.particlePool.getStats();
      if (stats.active >= this.maxParticles) {
        break;
      }

      const angle = Math.random() * spread - spread / 2;

      const particle = this.particlePool.acquire();

      // Style-specific adjustments - make styles more distinct
      let particleSize = size * (0.5 + Math.random());
      let particleLife = life;
      let particleSpeed = speed;

      if (style === 'sparkle') {
        // Sparkles: larger, brighter, longer-lived
        particleSize = size * (1.2 + Math.random() * 0.6);
        particleLife = life * 1.5;
        particleSpeed = speed * 0.7;
      } else if (style === 'trail') {
        // Trails: longer-lasting, slower
        particleSize = size * (0.8 + Math.random() * 0.4);
        particleLife = life * 3.0;
        particleSpeed = speed * 0.5;
      } else if (style === 'glow') {
        // Glow: larger, brighter
        particleSize = size * (1.0 + Math.random() * 0.8);
        particleLife = life * 1.3;
      }

      particle.init({
        x,
        y,
        vx: Math.cos(angle) * particleSpeed * (0.5 + Math.random() * 0.5),
        vy: Math.sin(angle) * particleSpeed * (0.5 + Math.random() * 0.5),
        color,
        size: particleSize,
        life: particleLife,
        decay: 1,
        glow,
        style,
      });
    }
  }

  spawnExplosion(
    x: number,
    y: number,
    color = '#ff0000',
    glow: boolean = true,
    style: 'classic' | 'glow' | 'sparkle' | 'trail' = 'classic',
  ): void {
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
      style,
    });
  }

  spawnTrail(
    x: number,
    y: number,
    color = '#ffffff',
    style: 'classic' | 'glow' | 'sparkle' | 'trail' = 'trail',
  ): void {
    this.spawnParticles({
      x,
      y,
      count: 2,
      color,
      spread: Math.PI / 4,
      speed: 30,
      size: 2,
      life: style === 'trail' ? 1.0 : 0.4,
      glow: style === 'glow' || style === 'sparkle',
      style,
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
