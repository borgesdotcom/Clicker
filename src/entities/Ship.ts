import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';
// Import ship GIF image using Vite's asset handling
import shipGifSrc from '@/animations/littleships.gif';

// Load ship GIF image
let shipImage: HTMLImageElement | null = null;
let shipImageLoaded = false;

const loadShipImage = (): void => {
  if (shipImageLoaded || shipImage) return;

  shipImage = new Image();
  shipImage.onload = () => {
    shipImageLoaded = true;
    console.log('Ship GIF image loaded successfully');
  };
  shipImage.onerror = () => {
    console.error('Failed to load ship GIF image');
    shipImage = null;
  };
  shipImage.src = shipGifSrc;
};

// Preload the image when module loads
if (typeof window !== 'undefined') {
  loadShipImage();
}

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

  destroy(): void {
    // No cleanup needed - using canvas rendering, not DOM elements
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
    // Match the WebGL rendering scale calculation exactly
    // WebGL vertex shader: scale = a_size * (isMainShip > 0.5 ? 1.0 : 0.61538461538)
    // WebGL fragment shader: tipPos = v_center + vec2(cos(tipAngle), sin(tipAngle)) * v_size
    // Where tipAngle = v_angle + PI and v_size = scale
    const baseSize = this.isMainShip ? 20 : 14; // Match increased sizes
    const scale = this.isMainShip ? baseSize : baseSize * 0.61538461538;
    // Ship tip is at angle + PI, and extends by scale distance from center
    // This matches exactly where the WebGL shader renders the ship tip
    return {
      x: this.x + Math.cos(this.angle + Math.PI) * scale,
      y: this.y + Math.sin(this.angle + Math.PI) * scale,
    };
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();
    const size = this.isMainShip ? 20 : 14; // Match increased sizes for 2D fallback

    // Try to load image if not already loaded
    if (!shipImageLoaded && !shipImage) {
      loadShipImage();
    }

    // Use canvas rendering for better performance (GIF will show first frame only)
    // This is much faster than DOM overlay elements when there are many ships
    if (
      shipImage &&
      (shipImage.complete || shipImageLoaded) &&
      shipImage.naturalWidth > 0
    ) {
      ctx.save();

      // Enable pixelated rendering for GIF
      ctx.imageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = 'low';

      // Move to ship position and rotate
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle + Math.PI); // Rotate so ship faces correct direction

      // Draw the ship GIF (first frame only - for performance)
      const drawSize = size * 1.1; // Make GIF a bit bigger for visibility

      // Always draw the original ship image without color customization
      ctx.drawImage(
        shipImage,
        -drawSize / 2,
        -drawSize / 2,
        drawSize,
        drawSize,
      );

      ctx.restore();
      return;
    }

    // If image is still loading, wait a bit before falling back
    if (shipImage && !shipImage.complete) {
      // Image is loading, skip this frame and try again next frame
      return;
    }

    // Fallback to original triangle rendering if GIF not loaded
    // Always use default white colors (no customization)
    const defaultFillColor = '#ffffff';
    const defaultGlowColor = 'rgba(255, 255, 255, 0.3)';

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
      glow.addColorStop(0, defaultGlowColor);
      glow.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
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
      const rightX =
        this.x + Math.cos(this.angle + Math.PI * 1.25) * size * 0.6;
      const rightY =
        this.y + Math.sin(this.angle + Math.PI * 1.25) * size * 0.6;

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
      exhaustGradient.addColorStop(
        0,
        `rgba(255, 255, 255, ${0.5 * enginePulse})`,
      );
      exhaustGradient.addColorStop(
        0.5,
        `rgba(255, 255, 255, ${0.2 * enginePulse})`,
      );
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

      // Solid fill with slight gradient (white)
      const bodyGradient = ctx.createLinearGradient(tipX, tipY, this.x, this.y);
      bodyGradient.addColorStop(0, defaultFillColor);
      bodyGradient.addColorStop(1, '#f0f0f0');
      ctx.fillStyle = bodyGradient;
      ctx.fill();

      // Clean white outline
      ctx.shadowBlur = 6;
      ctx.shadowColor = defaultFillColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Small center highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
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
      allyGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
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
      const rightX =
        this.x + Math.cos(this.angle + Math.PI * 1.25) * size * 0.6;
      const rightY =
        this.y + Math.sin(this.angle + Math.PI * 1.25) * size * 0.6;

      // Small engine trail
      const exhaustX = this.x + Math.cos(this.angle) * size * 0.25;
      const exhaustY = this.y + Math.sin(this.angle) * size * 0.25;
      const exhaustLength = size * 0.5 * enginePulse;

      const exhaustGradient = ctx.createLinearGradient(
        this.x,
        this.y,
        exhaustX + Math.cos(this.angle) * exhaustLength,
        exhaustY + Math.sin(this.angle) * exhaustLength,
      );
      exhaustGradient.addColorStop(
        0,
        `rgba(255, 255, 255, ${0.4 * enginePulse})`,
      );
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

      ctx.fillStyle = defaultFillColor;
      ctx.fill();

      // Outline
      ctx.shadowBlur = 4;
      ctx.shadowColor = defaultFillColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Tiny center dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
