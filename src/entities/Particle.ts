import type { Draw } from '../render/Draw';

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
  public x: number;
  public y: number;
  private vx: number;
  private vy: number;
  private color: string;
  private size: number;
  private life: number;
  private maxLife: number;
  private decay: number;
  private glow: boolean;

  constructor(config: ParticleConfig) {
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
  }

  update(dt: number): boolean {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= this.decay * dt;
    
    // Apply gravity
    this.vy += 100 * dt;
    
    // Air resistance
    this.vx *= 0.99;
    this.vy *= 0.99;
    
    return this.life <= 0;
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
  private particles: Particle[] = [];
  private maxParticles = 200; // Limit active particles for performance

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
      // Don't spawn if we're at max particles
      if (this.particles.length >= this.maxParticles) {
        break;
      }
      
      const angle = (Math.random() * spread) - (spread / 2);
      const velocity = speed * (0.5 + Math.random() * 0.5);
      
      this.particles.push(new Particle({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: size * (0.5 + Math.random()),
        life,
        decay: 1,
        glow,
      }));
    }
  }

  spawnExplosion(x: number, y: number, color: string = '#ff0000'): void {
    this.spawnParticles({
      x,
      y,
      count: 30,
      color,
      spread: Math.PI * 2,
      speed: 200,
      size: 4,
      life: 0.8,
      glow: true,
    });
  }

  spawnTrail(x: number, y: number, color: string = '#ffffff'): void {
    // Reduced trail particles for performance
    this.spawnParticles({
      x,
      y,
      count: 2, // Reduced from 3
      color,
      spread: Math.PI / 4,
      speed: 30,
      size: 2,
      life: 0.4, // Shorter life
      glow: false, // No glow for trails (performance)
    });
  }

  update(dt: number): void {
    this.particles = this.particles.filter(p => !p.update(dt));
  }

  draw(drawer: Draw): void {
    for (const particle of this.particles) {
      particle.draw(drawer);
    }
  }

  clear(): void {
    this.particles = [];
  }
}

