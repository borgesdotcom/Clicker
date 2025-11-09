import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';

export interface LaserConfig {
  origin: Vec2;
  target: Vec2;
  damage: number;
  isCrit?: boolean;
  color?: string;
  width?: number;
  isFromShip?: boolean;
}

export class Laser {
  public alive = true;
  private travelTime = 0.15;
  public age = 0;
  public hasHit = false;
  public damage!: number;
  public isCrit = false;
  public color = '#fff';
  public width = 2.5;
  public isFromShip = false;
  public origin!: Vec2;
  public target!: Vec2;
  public themeId?: string;

  constructor(config?: LaserConfig) {
    if (config) {
      this.init(config);
    } else {
      this.origin = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.damage = 0;
    }
  }

  init(config: LaserConfig): void {
    this.origin = config.origin;
    this.target = config.target;
    this.damage = config.damage;
    this.isCrit = config.isCrit ?? false;
    this.color = config.color ?? '#fff';
    this.width = config.width ?? 2.5;
    this.isFromShip = config.isFromShip ?? false;
    this.alive = true;
    this.age = 0;
    this.hasHit = false;
  }

  update(dt: number): void {
    this.age += dt;

    // Lasers should complete their animation even if target is gone
    // Only mark as dead after animation completes and a short delay for visual effect
    if (this.hasHit && this.age >= this.travelTime + 0.05) {
      this.alive = false;
    }
  }

  getCurrentPosition(): Vec2 {
    // Always calculate position based on animation progress
    const progress = Math.min(1, this.age / this.travelTime);

    // Straight line laser beam
    return {
      x: this.origin.x + (this.target.x - this.origin.x) * progress,
      y: this.origin.y + (this.target.y - this.origin.y) * progress,
    };
  }

  checkHit(): boolean {
    // Only check hit once, and only if we haven't already hit
    // This allows the laser to complete its visual animation
    if (this.hasHit) return false;
    if (this.age >= this.travelTime) {
      this.hasHit = true;
      // Don't immediately kill the laser - let it finish animating
      return true;
    }
    return false;
  }
  
  // Check if laser should be removed (after animation completes)
  shouldRemove(): boolean {
    // Remove after animation completes + small delay for visual effect
    return this.age >= this.travelTime + 0.1;
  }

  draw(drawer: Draw): void {
    if (!this.alive) return;

    const current = this.getCurrentPosition();
    const progress = Math.min(1, this.age / this.travelTime);
    const fadeInAlpha = Math.min(1, progress * 3.0);

    const ctx = drawer.getContext();
    ctx.save();

    const dx = current.x - this.origin.x;
    const dy = current.y - this.origin.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len < 0.1) {
      ctx.restore();
      return;
    }
    
    const angle = Math.atan2(dy, dx);
    const boltLength = Math.max(Math.min(len * 0.35, 20), 6);
    const boltStartX = current.x - Math.cos(angle) * boltLength;
    const boltStartY = current.y - Math.sin(angle) * boltLength;
    
    const now = Date.now();
    const pulse = Math.sin(now * 0.02) * 0.05 + 0.95;
    
    const coreWidth = this.width * 0.5;
    const glowWidth = this.width * 2.0;
    
    ctx.shadowBlur = glowWidth * 1.8;
    ctx.shadowColor = this.color;
    
    ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.6, 0.25);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = glowWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(boltStartX, boltStartY);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    
    ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.85, 0.45);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width * 1.2;
    ctx.beginPath();
    ctx.moveTo(boltStartX, boltStartY);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    
    ctx.globalAlpha = Math.max(fadeInAlpha * pulse, 0.7);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = coreWidth;
    ctx.beginPath();
    ctx.moveTo(boltStartX, boltStartY);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    
    const boltTipSize = this.width * 1.3 * pulse;
    ctx.globalAlpha = Math.max(fadeInAlpha * pulse, 0.8);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = boltTipSize * 2;
    ctx.beginPath();
    ctx.arc(current.x, current.y, boltTipSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.75, 0.6);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = boltTipSize * 1.5;
    ctx.beginPath();
    ctx.arc(current.x, current.y, boltTipSize * 0.7, 0, Math.PI * 2);
    ctx.fill();

    if (this.isCrit) {
      const critPulse = Math.sin(now * 0.03) * 0.2 + 0.8;
      const critTime = now * 0.001;
      
      if (this.themeId === 'rainbow_laser') {
        const colors = [
          '#ffff00', '#ff8800', '#ff0000', '#ff0088',
          '#ff00ff', '#8800ff', '#0000ff', '#0088ff'
        ];
        const critColorOffset = Math.floor(critTime * 12.0 + progress * 30.0) % colors.length;
        const critColor = colors[critColorOffset % colors.length] ?? '#ffff00';
        
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.5;
        ctx.strokeStyle = critColor;
        ctx.lineWidth = this.width * 3.0;
        ctx.shadowBlur = 15;
        ctx.shadowColor = critColor;
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        
        ctx.globalAlpha = fadeInAlpha * critPulse;
        ctx.fillStyle = critColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 2.0 * critPulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.7;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 1.5 * critPulse, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.themeId === 'plasma_laser') {
        const plasmaCritColors = ['#ffaa00', '#ff6600', '#ff4400'];
        const critColorIndex = Math.floor(critTime * 15.0 + progress * 35.0) % plasmaCritColors.length;
        const critColor = plasmaCritColors[critColorIndex] ?? '#ff8800';
        
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.6;
        ctx.strokeStyle = critColor;
        ctx.lineWidth = this.width * 3.2;
        ctx.shadowBlur = 18;
        ctx.shadowColor = critColor;
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        
        ctx.globalAlpha = fadeInAlpha * critPulse;
        ctx.fillStyle = critColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 2.2 * critPulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.75;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 1.6 * critPulse, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.themeId === 'void_laser') {
        const voidCritPulse = Math.sin(critTime * 20.0 + progress * 40.0) * 0.2 + 0.8;
        
        ctx.globalAlpha = fadeInAlpha * voidCritPulse * 0.5;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = this.width * 3.0;
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        
        ctx.globalAlpha = fadeInAlpha * voidCritPulse * 0.4;
        ctx.strokeStyle = '#8800ff';
        ctx.lineWidth = this.width * 3.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#8800ff';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        
        ctx.globalAlpha = fadeInAlpha * voidCritPulse;
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 2.1 * voidCritPulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = fadeInAlpha * voidCritPulse * 0.7;
        ctx.fillStyle = '#8800ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 1.6 * voidCritPulse, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.4;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = this.width * 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
        
        ctx.globalAlpha = fadeInAlpha * critPulse;
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(current.x, current.y, this.width * 1.8 * critPulse, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

}
