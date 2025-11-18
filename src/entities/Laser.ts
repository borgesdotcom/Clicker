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
    // Calculate progress - allow > 1.0 when laser has hit to continue into target
    let progress = this.age / this.travelTime;
    
    // If laser has hit, allow it to continue moving into the target (progress > 1.0)
    // This makes the laser "enter" the alien while fading out
    if (this.hasHit && progress > 1.0) {
      // Continue the movement direction but with slower speed after hit
      const hitProgress = (progress - 1.0) * 0.5; // Slow down movement after hit
      progress = 1.0 + hitProgress;
    } else {
      // Normal travel - cap at 1.0
      progress = Math.min(1, progress);
    }

    // Straight line laser beam - can extend beyond target when hasHit
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

    const rawProgress = this.age / this.travelTime;
    
    // Don't render laser if it has hit and is entering the alien (progress > 1.0)
    // This prevents the laser from being visible inside the alien
    if (this.hasHit && rawProgress > 1.0) {
      return; // Laser disappears immediately when entering the alien
    }

    const current = this.getCurrentPosition();
    const progress = Math.min(1, rawProgress);
    // Fade-in only at the very beginning (first 10% of travel), then full opacity
    const fadeInAlpha = progress < 0.1 ? Math.min(1, progress * 10.0) : 1.0;

    const ctx = drawer.getContext();
    ctx.save();

    const dx = current.x - this.origin.x;
    const dy = current.y - this.origin.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.1) {
      ctx.restore();
      return;
    }

    const now = Date.now();
    const pulse = Math.sin(now * 0.03) * 0.05 + 0.95; // Reduced pulse variation for more consistent visibility

    // Thin projectile design - thinner but still a projectile bolt
    const coreWidth = Math.max(this.width * 0.4, 1.2); // Thin core
    const glowWidth = this.width * 1.0; // Subtle glow

    // Calculate bolt length (shorter than full distance for projectile effect)
    const angle = Math.atan2(dy, dx);
    const boltLength = Math.max(Math.min(len * 0.4, 25), 8);
    const boltStartX = current.x - Math.cos(angle) * boltLength;
    const boltStartY = current.y - Math.sin(angle) * boltLength;

    ctx.shadowBlur = glowWidth * 0.8; // Subtle glow
    ctx.shadowColor = this.color;

    // Style variations based on theme
    if (this.themeId === 'rainbow_laser') {
      const colors = [
        '#ff0080', // Hot pink
        '#ff4000', // Red-orange
        '#ff8000', // Orange
        '#ffc000', // Yellow-orange
        '#ffff00', // Yellow
        '#c0ff00', // Yellow-green
        '#80ff00', // Green
        '#40ff80', // Green-cyan
        '#00ffc0', // Cyan
        '#00c0ff', // Light blue
        '#0080ff', // Blue
        '#4000ff', // Indigo
        '#8000ff', // Purple
        '#c000ff', // Magenta
        '#ff00c0', // Pink
        '#ff0080', // Back to hot pink
      ];
      const timeOffset = now * 0.012 + Math.min(1, rawProgress) * 25.0;
      const colorIndex1 = Math.floor(timeOffset) % colors.length;
      const colorIndex2 = (colorIndex1 + 1) % colors.length;
      const color1 = colors[colorIndex1] ?? '#ff0080';
      const color2 = colors[colorIndex2] ?? '#ff0080';

      // Create gradient for smooth color transition
      const gradient = ctx.createLinearGradient(boltStartX, boltStartY, current.x, current.y);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color1);

      // Outer rainbow glow - multiple layers for richness
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.7, 0.5);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = glowWidth * 1.3;
      ctx.lineCap = 'round';
      ctx.shadowBlur = glowWidth * 1.2;
      ctx.shadowColor = color2;
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      // Middle glow layer
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.8, 0.6);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = glowWidth * 0.9;
      ctx.shadowBlur = glowWidth * 0.8;
      ctx.shadowColor = color1;
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      // Main bright core - white with rainbow tint
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse, 1.0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = coreWidth;
      ctx.shadowBlur = coreWidth * 2.5;
      ctx.shadowColor = color2;
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    } else if (this.themeId === 'plasma_laser') {
      const plasmaColors = ['#ff4400', '#ff6600', '#ff8800', '#ff4400', '#ff0044'];
      const colorIndex = Math.floor(now * 0.01 + Math.min(1, rawProgress) * 25.0) % plasmaColors.length;
      const boltColor = plasmaColors[colorIndex] ?? this.color;

      // Outer glow - slightly thicker for plasma
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.7, 0.5);
      ctx.strokeStyle = boltColor;
      ctx.lineWidth = glowWidth * 1.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      // Main core
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse, 1.0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = coreWidth * 1.1;
      ctx.shadowBlur = coreWidth * 1.8;
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    } else if (this.themeId === 'void_laser') {
      const voidPulse = Math.sin(now * 0.02 + Math.min(1, rawProgress) * 40.0) * 0.15 + 0.85;

      // Outer void glow - purple
      ctx.globalAlpha = Math.max(fadeInAlpha * voidPulse * 0.6, 0.4);
      ctx.strokeStyle = '#8800ff';
      ctx.lineWidth = glowWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      // Inner void core - magenta
      ctx.globalAlpha = Math.max(fadeInAlpha * voidPulse, 1.0);
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = coreWidth;
      ctx.shadowBlur = coreWidth * 1.6;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    } else {
      // Default laser style
      // Outer glow
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse * 0.6, 0.4);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = glowWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();

      // Main laser core - thin and bright
      ctx.globalAlpha = Math.max(fadeInAlpha * pulse, 1.0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = coreWidth;
      ctx.shadowBlur = coreWidth * 1.5;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(boltStartX, boltStartY);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
    }

    if (this.isCrit) {
      const critPulse = Math.sin(now * 0.04) * 0.15 + 0.85;
      const critTime = now * 0.001;

      if (this.themeId === 'rainbow_laser') {
        const critColors = [
          '#ffff00', // Bright yellow
          '#ff8000', // Orange
          '#ff0080', // Hot pink
          '#ff00ff', // Magenta
          '#8000ff', // Purple
          '#0080ff', // Blue
          '#00ffff', // Cyan
          '#00ff80', // Green
          '#80ff00', // Yellow-green
          '#ffff00', // Back to yellow
        ];
        const critTimeOffset = critTime * 15.0 + Math.min(1, rawProgress) * 35.0;
        const critColorIndex1 = Math.floor(critTimeOffset) % critColors.length;
        const critColorIndex2 = (critColorIndex1 + 1) % critColors.length;
        const critColor1 = critColors[critColorIndex1] ?? '#ffff00';
        const critColor2 = critColors[critColorIndex2] ?? '#ffff00';

        // Crit rainbow gradient
        const critGradient = ctx.createLinearGradient(boltStartX, boltStartY, current.x, current.y);
        critGradient.addColorStop(0, critColor1);
        critGradient.addColorStop(0.5, critColor2);
        critGradient.addColorStop(1, critColor1);

        // Outer crit glow
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.8;
        ctx.strokeStyle = critGradient;
        ctx.lineWidth = coreWidth * 2.5;
        ctx.shadowBlur = coreWidth * 3.5;
        ctx.shadowColor = critColor2;
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();

        // Inner crit core
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.9;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = coreWidth * 1.8;
        ctx.shadowBlur = coreWidth * 2.8;
        ctx.shadowColor = critColor1;
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      } else if (this.themeId === 'plasma_laser') {
        const plasmaCritColors = ['#ffaa00', '#ff6600', '#ff4400'];
        const critColorIndex =
          Math.floor(critTime * 15.0 + Math.min(1, rawProgress) * 35.0) %
          plasmaCritColors.length;
        const critColor = plasmaCritColors[critColorIndex] ?? '#ff8800';

        // Plasma crit overlay
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.75;
        ctx.strokeStyle = critColor;
        ctx.lineWidth = coreWidth * 2.2;
        ctx.shadowBlur = coreWidth * 2.8;
        ctx.shadowColor = critColor;
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      } else if (this.themeId === 'void_laser') {
        const voidCritPulse =
          Math.sin(critTime * 20.0 + Math.min(1, rawProgress) * 40.0) * 0.15 + 0.85;

        // Void crit overlay - dual color
        ctx.globalAlpha = fadeInAlpha * voidCritPulse * 0.6;
        ctx.strokeStyle = '#8800ff';
        ctx.lineWidth = coreWidth * 2.3;
        ctx.shadowBlur = coreWidth * 2.5;
        ctx.shadowColor = '#8800ff';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();

        ctx.globalAlpha = fadeInAlpha * voidCritPulse * 0.75;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = coreWidth * 1.8;
        ctx.shadowBlur = coreWidth * 2.0;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      } else {
        // Default crit overlay - yellow
        ctx.globalAlpha = fadeInAlpha * critPulse * 0.7;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = coreWidth * 2.0;
        ctx.shadowBlur = coreWidth * 2.5;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(boltStartX, boltStartY);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
