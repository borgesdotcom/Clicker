import type { Draw } from '../render/Draw';
import type { Vec2, GameState } from '../types';

export class Ship {
  public x = 0;
  public y = 0;
  private rotationSpeed: number; // Fixed rotation speed per ship
  private enginePulse = Math.random() * Math.PI * 2; // Animation offset for engine glow

  constructor(
    public angle: number,
    private centerX: number,
    private centerY: number,
    private orbitRadius: number,
    public isMainShip = false,
  ) {
    // Give each ship a fixed, slow rotation speed
    this.rotationSpeed = isMainShip ? 0.15 : 0.1 + Math.random() * 0.1; // 0.1 to 0.2 for non-main ships
    this.updatePosition();
  }

  updatePosition(): void {
    this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
    this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
  }

  rotate(dt: number, speed?: number): void {
    // Use the ship's fixed rotation speed if no speed is provided
    const actualSpeed = speed !== undefined ? speed : this.rotationSpeed;
    this.angle += actualSpeed * dt;
    this.updatePosition();
    // Animate engine pulse
    this.enginePulse += dt * 3;
    if (this.enginePulse > Math.PI * 2) {
      this.enginePulse -= Math.PI * 2;
    }
  }

  getRotationSpeed(): number {
    return this.rotationSpeed;
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
    const size = this.isMainShip ? 13 : 8;
    return {
      x: this.x + Math.cos(this.angle + Math.PI) * size,
      y: this.y + Math.sin(this.angle + Math.PI) * size,
    };
  }

  draw(drawer: Draw, state?: GameState): void {
    const ctx = drawer.getContext();
    const size = this.isMainShip ? 13 : 8;
    
    // Determine ship appearance based on upgrades
    const visuals = this.getShipVisuals(state);
    
    // Engine pulse animation
    const enginePulse = Math.sin(this.enginePulse) * 0.25 + 0.75;

    if (this.isMainShip) {
      // === MAIN SHIP - Classic streamlined design ===
      
      // Subtle outer glow
      const glow = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        size * 2,
      );
      glow.addColorStop(0, this.hexToRgba(visuals.fillColor, 0.3));
      glow.addColorStop(0.6, this.hexToRgba(visuals.fillColor, 0.1));
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Simple triangular ship shape - classic fighter design
      const tipX = this.x + Math.cos(this.angle + Math.PI) * size;
      const tipY = this.y + Math.sin(this.angle + Math.PI) * size;
      const leftX = this.x + Math.cos(this.angle + Math.PI * 0.75) * size * 0.6;
      const leftY = this.y + Math.sin(this.angle + Math.PI * 0.75) * size * 0.6;
      const rightX = this.x + Math.cos(this.angle + Math.PI * 1.25) * size * 0.6;
      const rightY = this.y + Math.sin(this.angle + Math.PI * 1.25) * size * 0.6;
      
      // Engine exhaust (behind ship)
      const exhaustX = this.x + Math.cos(this.angle) * size * 0.3;
      const exhaustY = this.y + Math.sin(this.angle) * size * 0.3;
      const exhaustLength = size * 0.7 * enginePulse;
      
      const exhaustGradient = ctx.createLinearGradient(
        this.x,
        this.y,
        exhaustX + Math.cos(this.angle) * exhaustLength,
        exhaustY + Math.sin(this.angle) * exhaustLength,
      );
      exhaustGradient.addColorStop(0, this.hexToRgba(visuals.fillColor, 0.5 * enginePulse));
      exhaustGradient.addColorStop(0.5, this.hexToRgba(visuals.fillColor, 0.2 * enginePulse));
      exhaustGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = exhaustGradient;
      ctx.lineWidth = size * 0.35;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        exhaustX + Math.cos(this.angle) * exhaustLength,
        exhaustY + Math.sin(this.angle) * exhaustLength,
      );
      ctx.stroke();
      
      // Main ship body - filled triangle
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
      
      // Solid fill with slight gradient
      const bodyGradient = ctx.createLinearGradient(
        tipX,
        tipY,
        this.x,
        this.y,
      );
      bodyGradient.addColorStop(0, visuals.fillColor);
      bodyGradient.addColorStop(1, this.lightenColor(visuals.fillColor, 0.15));
      ctx.fillStyle = bodyGradient;
      ctx.fill();
      
      // Clean white outline
      ctx.shadowBlur = 6;
      ctx.shadowColor = visuals.fillColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      
      // Small center highlight
      ctx.fillStyle = this.hexToRgba('#ffffff', 0.4);
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // === ALLY SHIPS - Simple triangular design ===
      
      // Subtle glow
      const allyGlow = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        size * 1.5,
      );
      allyGlow.addColorStop(0, this.hexToRgba(visuals.fillColor, 0.2));
      allyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = allyGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Simple triangle shape
      const tipX = this.x + Math.cos(this.angle + Math.PI) * size;
      const tipY = this.y + Math.sin(this.angle + Math.PI) * size;
      const leftX = this.x + Math.cos(this.angle + Math.PI * 0.75) * size * 0.6;
      const leftY = this.y + Math.sin(this.angle + Math.PI * 0.75) * size * 0.6;
      const rightX = this.x + Math.cos(this.angle + Math.PI * 1.25) * size * 0.6;
      const rightY = this.y + Math.sin(this.angle + Math.PI * 1.25) * size * 0.6;
      
      // Small engine trail
      const exhaustX = this.x + Math.cos(this.angle) * size * 0.25;
      const exhaustY = this.y + Math.sin(this.angle) * size * 0.25;
      const exhaustLength = size * 0.5 * enginePulse;
      
      const lightColor = this.lightenColor(visuals.fillColor, 0.25);
      const exhaustGradient = ctx.createLinearGradient(
        this.x,
        this.y,
        exhaustX + Math.cos(this.angle) * exhaustLength,
        exhaustY + Math.sin(this.angle) * exhaustLength,
      );
      exhaustGradient.addColorStop(0, this.hexToRgba(lightColor, 0.4 * enginePulse));
      exhaustGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = exhaustGradient;
      ctx.lineWidth = size * 0.25;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        exhaustX + Math.cos(this.angle) * exhaustLength,
        exhaustY + Math.sin(this.angle) * exhaustLength,
      );
      ctx.stroke();
      
      // Ship body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
      
      ctx.fillStyle = lightColor;
      ctx.fill();
      
      // Outline
      ctx.shadowBlur = 4;
      ctx.shadowColor = lightColor;
      ctx.strokeStyle = this.lightenColor(lightColor, 0.4);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      
      // Tiny center dot
      ctx.fillStyle = this.hexToRgba(lightColor, 0.5);
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private getShipVisuals(state?: GameState): {
    fillColor: string;
    outlineColor: string;
    glowColor: string;
  } {
    if (!state) {
      return {
        fillColor: '#ffffff',
        outlineColor: '#cccccc',
        glowColor: 'rgba(255, 255, 255, 0.3)',
      };
    }

    // Match laser color progression
    let fillColor = '#ffffff'; // Default white (matches default laser)

    if (state.subUpgrades['cosmic_ascension']) {
      fillColor = '#ff00ff'; // Magenta
    } else if (state.subUpgrades['singularity_core']) {
      fillColor = '#8800ff'; // Purple
    } else if (state.subUpgrades['heart_of_galaxy']) {
      fillColor = '#ff0044'; // Red
    } else if (state.subUpgrades['antimatter_rounds']) {
      fillColor = '#ff0088'; // Pink
    } else if (state.subUpgrades['chaos_emeralds']) {
      fillColor = '#00ff88'; // Emerald green
    } else if (state.subUpgrades['overclocked_reactors']) {
      fillColor = '#ff6600'; // Orange
    } else if (state.subUpgrades['laser_focusing']) {
      fillColor = '#00ffff'; // Cyan
    } else if (state.pointMultiplierLevel >= 10) {
      fillColor = '#88ff88'; // Light green
    }

    return {
      fillColor,
      outlineColor: '#ffffff',
      glowColor: this.hexToRgba(fillColor, 0.4),
    };
  }

  private lightenColor(hex: string, amount: number): string {
    // Extract RGB values
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    // Lighten by mixing with white
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1] ?? '0', 16),
          g: parseInt(result[2] ?? '0', 16),
          b: parseInt(result[3] ?? '0', 16),
        }
      : null;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const rgb = this.hexToRgb(hex);
    return rgb
      ? `rgba(${rgb.r.toString()}, ${rgb.g.toString()}, ${rgb.b.toString()}, ${alpha.toString()})`
      : `rgba(0, 255, 255, ${alpha.toString()})`;
  }

}
