import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export class BossProjectile {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private radius = 12;
  private lifetime = 5;
  private age = 0;
  private rotationAngle = 0;
  private trailLength = 8;
  private trailPositions: Array<{ x: number; y: number; alpha: number }> = [];

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
    // Update trail
    this.trailPositions.unshift({ x: this.x, y: this.y, alpha: 1 });
    if (this.trailPositions.length > this.trailLength) {
      this.trailPositions.pop();
    }
    
    // Fade trail
    for (let i = 0; i < this.trailPositions.length; i++) {
      const pos = this.trailPositions[i];
      if (pos) {
        pos.alpha = 1 - (i / this.trailLength);
      }
    }

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.age += dt;
    this.rotationAngle += dt * 6;

    // Return true if projectile should be removed
    return this.age >= this.lifetime;
  }

  draw(draw: Draw): void {
    const ctx = draw.getContext();
    const alpha = Math.max(0, 1 - this.age / this.lifetime);
    const ageFactor = this.age / this.lifetime;
    const pulse = Math.sin(this.age * 10) * 0.1 + 0.9;

    // Draw trail
    if (this.trailPositions.length > 1) {
      ctx.save();
      for (let i = 0; i < this.trailPositions.length - 1; i++) {
        const pos = this.trailPositions[i];
        const nextPos = this.trailPositions[i + 1];
        if (!pos || !nextPos) continue;

        const trailAlpha = pos.alpha * alpha * 0.4;
        const trailWidth = this.radius * 0.6 * (1 - i / this.trailLength);
        
        ctx.strokeStyle = `rgba(255, 100, 0, ${String(trailAlpha)})`;
        ctx.lineWidth = trailWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(nextPos.x, nextPos.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Outer energy aura - pulsing
    const auraRadius = this.radius * 1.6 * pulse;
    const auraGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      auraRadius,
    );
    auraGradient.addColorStop(0, `rgba(255, 0, 68, ${String(alpha * 0.4)})`);
    auraGradient.addColorStop(0.5, `rgba(255, 100, 0, ${String(alpha * 0.2)})`);
    auraGradient.addColorStop(1, `rgba(255, 0, 68, 0)`);

    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Main projectile body - energy core
    const bodyGradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.1,
      this.x,
      this.y,
      this.radius,
    );
    bodyGradient.addColorStop(0, `rgba(255, 255, 255, ${String(alpha * 0.95)})`);
    bodyGradient.addColorStop(0.3, `rgba(255, 200, 0, ${String(alpha * 0.9)})`);
    bodyGradient.addColorStop(0.6, `rgba(255, 100, 0, ${String(alpha * 0.85)})`);
    bodyGradient.addColorStop(1, `rgba(255, 0, 68, ${String(alpha * 0.8)})`);

    ctx.fillStyle = bodyGradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 0, 68, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    const coreRadius = this.radius * 0.5;
    const coreGradient = ctx.createRadialGradient(
      this.x - coreRadius * 0.3,
      this.y - coreRadius * 0.3,
      0,
      this.x,
      this.y,
      coreRadius,
    );
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${String(alpha)})`);
    coreGradient.addColorStop(0.5, `rgba(255, 255, 150, ${String(alpha * 0.8)})`);
    coreGradient.addColorStop(1, `rgba(255, 200, 0, ${String(alpha * 0.6)})`);

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rotating energy lines - more dynamic
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotationAngle);

    ctx.strokeStyle = `rgba(255, 255, 255, ${String(alpha * 0.7)})`;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(255, 200, 0, 0.8)';
    
    // More energy lines for better visual
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const startRadius = this.radius * 0.3;
      const endRadius = this.radius * 0.95;
      const x1 = Math.cos(angle) * startRadius;
      const y1 = Math.sin(angle) * startRadius;
      const x2 = Math.cos(angle) * endRadius;
      const y2 = Math.sin(angle) * endRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Rotating outer ring
    ctx.strokeStyle = `rgba(255, 0, 68, ${String(alpha * 0.6)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();

    // Fade out effect near end of lifetime
    if (ageFactor > 0.8) {
      const fadeAlpha = (1 - ageFactor) / 0.2;
      ctx.fillStyle = `rgba(255, 0, 68, ${String(fadeAlpha * 0.3)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }
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
