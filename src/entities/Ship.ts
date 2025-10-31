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
    const size = this.isMainShip ? 12 : 8;
    return {
      x: this.x + Math.cos(this.angle + Math.PI) * size,
      y: this.y + Math.sin(this.angle + Math.PI) * size,
    };
  }

  draw(drawer: Draw, state?: GameState): void {
    const ctx = drawer.getContext();
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
    
    // Determine ship appearance based on upgrades (similar to laser system)
    const visuals = this.getShipVisuals(state);
    
    // Calculate ship shape points - more angular, futuristic design
    const frontDist = size * 0.9;
    const backDist = size * 0.3;
    
    // Front point (nose)
    const frontX = this.x + Math.cos(this.angle + Math.PI) * frontDist;
    const frontY = this.y + Math.sin(this.angle + Math.PI) * frontDist;
    
    // Left wing tip
    const leftWingX = this.x + Math.cos(this.angle + Math.PI * 0.65) * size * 0.75;
    const leftWingY = this.y + Math.sin(this.angle + Math.PI * 0.65) * size * 0.75;
    
    // Right wing tip
    const rightWingX = this.x + Math.cos(this.angle + Math.PI * 1.35) * size * 0.75;
    const rightWingY = this.y + Math.sin(this.angle + Math.PI * 1.35) * size * 0.75;
    
    // Back left point
    const backLeftX = this.x + Math.cos(this.angle + Math.PI * 0.8) * backDist;
    const backLeftY = this.y + Math.sin(this.angle + Math.PI * 0.8) * backDist;
    
    // Back right point
    const backRightX = this.x + Math.cos(this.angle + Math.PI * 1.2) * backDist;
    const backRightY = this.y + Math.sin(this.angle + Math.PI * 1.2) * backDist;
    
    // Center/body point
    const bodyX = this.x;
    const bodyY = this.y;

    if (this.isMainShip) {
      // Main ship: dynamic color based on upgrades
      // Draw glow
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        size * 1.8,
      );
      gradient.addColorStop(0, visuals.glowColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw ship body
      drawer.setFill(visuals.fillColor);
      drawer.triangle({ x: tipX, y: tipY }, left, right);
      drawer.setStroke(visuals.outlineColor, 2);
      drawer.triangle({ x: tipX, y: tipY }, left, right, false);

      // Inner detail
      const smallSize = size * 0.4;
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
      drawer.setFill('#ffffff');
      drawer.triangle({ x: innerTipX, y: innerTipY }, innerLeft, innerRight);
    } else {
      // === ALLY SHIPS - Simpler but still cool ===
      
      // Outer glow
      const allyGlow = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        size * 1.5,
      );
      allyGlow.addColorStop(0, this.adjustAlpha(visuals.glowColor, 0.25));
      allyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = allyGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Ship body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(frontX, frontY);
      ctx.lineTo(leftWingX, leftWingY);
      ctx.lineTo(backLeftX, backLeftY);
      ctx.lineTo(bodyX, bodyY);
      ctx.lineTo(backRightX, backRightY);
      ctx.lineTo(rightWingX, rightWingY);
      ctx.closePath();
      
      // Fill with lighter tint
      const lightColor = this.lightenColor(visuals.fillColor, 0.35);
      ctx.fillStyle = lightColor;
      ctx.fill();
      
      // Outline
      ctx.shadowBlur = 4;
      ctx.shadowColor = lightColor;
      ctx.strokeStyle = this.lightenColor(visuals.fillColor, 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      
      // Engine glow (subtle)
      const enginePulseValue = Math.sin(this.enginePulse) * 0.2 + 0.6;
      const engineCenterX = this.x + Math.cos(this.angle) * size * 0.3;
      const engineCenterY = this.y + Math.sin(this.angle) * size * 0.3;
      
      const engineGlow = ctx.createRadialGradient(
        engineCenterX,
        engineCenterY,
        0,
        engineCenterX,
        engineCenterY,
        size * 0.6,
      );
      engineGlow.addColorStop(0, this.hexToRgba(lightColor, 0.4 * enginePulseValue));
      engineGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = engineGlow;
      ctx.beginPath();
      ctx.arc(engineCenterX, engineCenterY, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // Simple core highlight
      ctx.fillStyle = this.hexToRgba(lightColor, 0.5);
      ctx.beginPath();
      ctx.arc(bodyX, bodyY, size * 0.25, 0, Math.PI * 2);
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

  private adjustAlpha(rgba: string, newAlpha: number): string {
    // Extract the RGB values from rgba string and apply new alpha
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match && match[1] && match[2] && match[3]) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${newAlpha.toString()})`;
    }
    return rgba;
  }
}
