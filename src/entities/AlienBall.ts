import type { Draw } from '../render/Draw';
import type { Vec2, BallColor } from '../types';
import { ColorManager } from '../math/ColorManager';

export class AlienBall {
  private flashTime = 0;
  private flashDuration = 0.15;
  public currentHp: number;
  public maxHp: number;
  private breakAnimTime = 0;
  private breakAnimDuration = 0.4;
  private deformationTime = 0;
  private deformationDuration = 0.15; // Snappy, quick animation
  private deformationDirection: Vec2 = { x: 0, y: 0 };
  private deformationIntensity = 0; // Store intensity for combo scaling
  private isBeamDeformation = false; // Whether this is a continuous beam deformation
  private beamDeformationTime = 0; // Time accumulator for beam pulsing
  protected animationTime = 0; // For visual animations (pulsing, rotation) - protected so subclasses can access
  private rotationOffset = Math.random() * Math.PI * 2; // Random rotation offset for variety

  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: BallColor,
  ) {
    const baseHp = color.hp;
    this.maxHp = Math.floor(baseHp + Math.random() * baseHp * 0.5);
    this.currentHp = this.maxHp;
  }

  private static getRandomColor(): BallColor {
    const colors = [
      { fill: '#ff4444', stroke: '#cc0000', hp: 100 },
      { fill: '#ff8800', stroke: '#cc6600', hp: 100 },
      { fill: '#ffdd00', stroke: '#ccaa00', hp: 100 },
      { fill: '#88ff00', stroke: '#66cc00', hp: 100 },
      { fill: '#00ff88', stroke: '#00cc66', hp: 100 },
      { fill: '#0088ff', stroke: '#0066cc', hp: 100 },
      { fill: '#8800ff', stroke: '#6600cc', hp: 100 },
      { fill: '#ff0088', stroke: '#cc0066', hp: 100 },
      { fill: '#ff6600', stroke: '#cc4400', hp: 100 },
      { fill: '#ffaa00', stroke: '#cc8800', hp: 100 },
      { fill: '#00ffff', stroke: '#00cccc', hp: 100 },
      { fill: '#ff00ff', stroke: '#cc00cc', hp: 100 },
      { fill: '#66ff66', stroke: '#44cc44', hp: 100 },
      { fill: '#ff6666', stroke: '#cc4444', hp: 100 },
      { fill: '#6666ff', stroke: '#4444cc', hp: 100 },
    ];
    const index = Math.floor(Math.random() * colors.length);
    return (
      colors[index] ??
      colors[0] ?? { fill: '#ff6666', stroke: '#cc4444', hp: 100 }
    );
  }

  static createRandom(
    x: number,
    y: number,
    radius: number,
    level: number,
  ): AlienBall {
    const color = AlienBall.getRandomColor();
    // Use ColorManager for consistent HP scaling across the game
    const hp = ColorManager.getHp(level);

    const levelScaledColor = {
      ...color,
      hp: hp,
    };
    return new AlienBall(x, y, radius, levelScaledColor);
  }

  isPointInside(point: Vec2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  public takeDamage(amount: number, hitDirection?: Vec2, combo?: number, isBeam?: boolean): boolean {
    const wasAlive = this.currentHp > 0;
    this.currentHp = Math.max(0, this.currentHp - amount);
    // Only flash on significant damage (>5% of max HP) or if not already flashing
    if (this.flashTime <= 0 || amount > this.maxHp * 0.05) {
      this.triggerFlash();
    }
    // Trigger deformation effect with combo scaling
    if (hitDirection) {
      this.triggerDeformation(hitDirection, combo ?? 0, isBeam ?? false);
    }
    if (this.currentHp <= 0 && wasAlive) {
      this.breakAnimTime = this.breakAnimDuration;
      return true;
    }
    return false;
  }

  triggerFlash(): void {
    this.flashTime = this.flashDuration;
  }

  triggerDeformation(direction: Vec2, combo: number = 0, isBeam: boolean = false): void {
    this.isBeamDeformation = isBeam;
    
    if (isBeam) {
      // For beams: continuous pulsing deformation, reset timer to keep it active
      this.deformationTime = this.deformationDuration; // Keep refreshing for continuous effect
      this.beamDeformationTime = 0; // Reset pulse timer
    } else {
      // For regular lasers: quick pulse animation
      this.deformationTime = this.deformationDuration;
    }
    
    // Normalize direction vector
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (length > 0) {
      this.deformationDirection = { x: direction.x / length, y: direction.y / length };
    } else {
      this.deformationDirection = { x: 0, y: -1 }; // Default upward
    }
    
    // Calculate intensity based on combo - subtle base, scales more with combo
    // Base intensity: 0.08 (8% deformation) - very subtle
    // Max intensity with combo: 0.08 + (combo / 50) * 0.18, capped at 0.35 (35%)
    // Example: combo 0 = 0.08, combo 50 = 0.26, combo 75 = 0.35 max
    // For beams: slightly stronger base intensity for better visibility
    const baseIntensity = isBeam ? 0.12 : 0.08;
    const comboMultiplier = Math.min(combo / 50, 1.5); // Cap at 150% boost
    this.deformationIntensity = baseIntensity + comboMultiplier * 0.18;
    this.deformationIntensity = Math.min(this.deformationIntensity, 0.35); // Cap at 35%
  }

  isBreaking(): boolean {
    return this.breakAnimTime > 0;
  }

  update(dt: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
    }
    if (this.deformationTime > 0) {
      if (this.isBeamDeformation) {
        // For beams: keep deformation active and accumulate pulse time
        this.beamDeformationTime += dt;
        // Keep refreshing deformation time while beam is active (will be reset by next hit)
        this.deformationTime = this.deformationDuration;
      } else {
        // For regular lasers: decay normally
        this.deformationTime = Math.max(0, this.deformationTime - dt);
      }
    } else if (this.isBeamDeformation) {
      // Beam stopped hitting - reset beam deformation
      this.isBeamDeformation = false;
      this.beamDeformationTime = 0;
    }
    
    // Update animation time for visual effects
    this.animationTime += dt;
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();

    // Calculate deformation effect - different for beams vs lasers
    let deformationAmount = 0;
    
    if (this.deformationTime > 0) {
      if (this.isBeamDeformation) {
        // For beams: continuous pulsing sine wave for sustained effect
        // Pulse at ~4Hz (4 cycles per second) for smooth, noticeable pulsing
        const pulseSpeed = 4 * 2 * Math.PI; // 4 Hz = 4 complete cycles per second = 8π radians/sec
        const pulseValue = Math.sin(this.beamDeformationTime * pulseSpeed);
        // Map sine wave (-1 to 1) to (0 to 1) with some base intensity
        const normalizedPulse = (pulseValue + 1) / 2; // 0 to 1
        // Apply pulse with some base deformation (30% to 100% of intensity)
        deformationAmount = (0.3 + normalizedPulse * 0.7) * this.deformationIntensity;
      } else {
        // For regular lasers: smooth ease-out curve
        const deformationProgress = 1 - (this.deformationTime / this.deformationDuration);
        const easeOut = 1 - Math.pow(1 - deformationProgress, 2);
        deformationAmount = easeOut * this.deformationIntensity;
      }
    }
    
    // Subtle displacement
    const pushDistance = deformationAmount * this.radius * 0.3; // Much less push
    const deformationX = this.deformationDirection.x * pushDistance;
    const deformationY = this.deformationDirection.y * pushDistance;
    
    // Subtle squash and stretch effect
    const squashAmount = deformationAmount * 0.15; // Much less squash
    const stretchAmount = deformationAmount * 0.1; // Much less stretch
    
    // Calculate scale factors - subtle
    const perpendicularScale = 1 - squashAmount;
    const parallelScale = 1 + stretchAmount;
    
    // Apply scales based on hit direction
    let scaleX = 1;
    let scaleY = 1;
    
    if (Math.abs(this.deformationDirection.x) > Math.abs(this.deformationDirection.y)) {
      // Horizontal hit
      scaleX = parallelScale;
      scaleY = perpendicularScale;
    } else {
      // Vertical hit
      scaleX = perpendicularScale;
      scaleY = parallelScale;
    }
    
    // Draw space-themed alien bubble with enhanced visuals
    const centerX = this.x + deformationX;
    const centerY = this.y + deformationY;
    
    // Subtle pulsing animation for energy effect
    const pulseValue = Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.02;
    const currentRadius = this.radius * (1 + pulseValue);
    
    const deformedRadiusX = currentRadius * scaleX;
    const deformedRadiusY = currentRadius * scaleY;
    
    // Outer energy glow - space-themed pulsing aura (enhanced multi-layer)
    const glowRadius = Math.max(deformedRadiusX, deformedRadiusY) * (1.3 + pulseValue * 0.1);
    const glowAlpha = 0.2 + Math.sin(this.animationTime * 2) * 0.05;
    const r = parseInt(this.color.fill.substring(1, 3), 16);
    const g = parseInt(this.color.fill.substring(3, 5), 16);
    const b = parseInt(this.color.fill.substring(5, 7), 16);
    
    // Multi-layer glow for depth
    for (let glowLayer = 0; glowLayer < 2; glowLayer++) {
      const layerRadius = glowRadius * (0.8 + glowLayer * 0.4);
      const layerAlpha = glowAlpha * (1 - glowLayer * 0.3);
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        layerRadius,
      );
      glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layerAlpha})`);
      glowGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.6})`);
      glowGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${layerAlpha * 0.3})`);
      glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Energy particles orbiting around (subtle sparkles)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + this.animationTime * 1.2 + this.rotationOffset;
      const distance = currentRadius * (1.1 + Math.sin(this.animationTime * 4 + i) * 0.05);
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      const particleAlpha = 0.3 + Math.sin(this.animationTime * 5 + i) * 0.2;
      const particleSize = 1.5 + Math.sin(this.animationTime * 3 + i) * 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Subtle color shift during deformation - much less noticeable
    const colorShift = deformationAmount * 0.2; // Much less color shift
    const shiftedR = Math.min(255, r + colorShift * 100);
    const shiftedG = Math.min(255, g + colorShift * 100);
    const shiftedB = Math.min(255, b + colorShift * 50);
    const deformedColor = `rgba(${Math.floor(shiftedR)}, ${Math.floor(shiftedG)}, ${Math.floor(shiftedB)}, 0.7)`;
    
    // Enhanced multi-layer gradient for depth with color transitions
    const gradient = ctx.createRadialGradient(
      centerX - deformedRadiusX * 0.3,
      centerY - deformedRadiusY * 0.3,
      Math.min(deformedRadiusX, deformedRadiusY) * 0.08,
      centerX,
      centerY,
      Math.max(deformedRadiusX, deformedRadiusY),
    );
    // Bright energy core
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.7 + Math.sin(this.animationTime * 3) * 0.1})`);
    // Transition to main color
    gradient.addColorStop(0.12, deformedColor);
    // Rich mid-tone
    gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.85)`);
    // Deep color
    gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.9)`);
    // Convert hex stroke color to rgba format
    const strokeR = parseInt(this.color.stroke.substring(1, 3), 16);
    const strokeG = parseInt(this.color.stroke.substring(3, 5), 16);
    const strokeB = parseInt(this.color.stroke.substring(5, 7), 16);
    // Edge transition
    gradient.addColorStop(0.8, `rgba(${strokeR}, ${strokeG}, ${strokeB}, 0.95)`);
    // Outer rim
    gradient.addColorStop(0.95, `rgba(${strokeR}, ${strokeG}, ${strokeB}, 0.7)`);
    gradient.addColorStop(1, `rgba(${strokeR}, ${strokeG}, ${strokeB}, 0.5)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Draw ellipse for dramatic deformation effect
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Inner energy rings - space-themed pattern with enhanced effects
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(this.animationTime * 0.3 + this.rotationOffset); // Slow rotation
    
    for (let ring = 1; ring <= 3; ring++) {
      const ringRadius = currentRadius * (0.35 + ring * 0.18);
      const ringAlpha = 0.18 + Math.sin(this.animationTime * 3 + ring) * 0.06;
      const ringPulse = Math.sin(this.animationTime * 4 + ring * 0.5) * 0.02;
      
      // Main ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
      ctx.lineWidth = 1.5 + ringPulse;
      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Glowing segments on ring
      if (ring <= 2) {
        for (let segment = 0; segment < 4; segment++) {
          const segmentAngle = (segment / 4) * Math.PI * 2 + this.animationTime * 0.5;
          const segmentAlpha = 0.3 + Math.sin(this.animationTime * 5 + segment) * 0.2;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${segmentAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            Math.cos(segmentAngle) * ringRadius * 0.3,
            Math.sin(segmentAngle) * ringRadius * 0.3,
            ringRadius * 0.15,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Surface texture pattern - energy grid overlay
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(this.animationTime * 0.15);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + pulseValue * 2})`;
    ctx.lineWidth = 0.8;
    const gridSize = currentRadius * 0.5;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if ((i + j) % 2 === 0) continue; // Checkerboard pattern
        const gridX = i * gridSize;
        const gridY = j * gridSize;
        const dist = Math.sqrt(gridX * gridX + gridY * gridY);
        if (dist < currentRadius * 0.9) {
          ctx.beginPath();
          ctx.arc(gridX, gridY, currentRadius * 0.08, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Enhanced glossy highlight with energy effect and secondary highlight
    const highlightSize = currentRadius * 0.4;
    const highlightAlpha = 0.4 + Math.sin(this.animationTime * 2) * 0.1;
    
    // Main highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.35,
      -currentRadius * 0.35,
      highlightSize,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();
    
    // Secondary smaller highlight for extra depth
    ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha * 0.6})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(
      -currentRadius * 0.25,
      -currentRadius * 0.25,
      highlightSize * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.restore();
    ctx.fill();

    // Outer energy border - enhanced glow with multiple layers
    ctx.strokeStyle = this.color.stroke;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Secondary outer border with glow
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + pulseValue * 3})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 1.05, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner energy border - subtle depth with pulsing
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + pulseValue * 2})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 2;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 0.88, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Additional inner ring for extra depth
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + pulseValue * 1.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius * 0.75, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();

    // Health bar (bubble integrity) - position relative to deformed center
    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 6;
    const hpBarY = centerY - Math.max(deformedRadiusX, deformedRadiusY) - 18;
    const hpPercent = this.currentHp / this.maxHp;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(centerX - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    // Health fill - color changes based on bubble integrity
    let fillColor = '#00ff00'; // Fresh bubble
    if (hpPercent < 0.3)
      fillColor = '#ff0000'; // About to pop!
    else if (hpPercent < 0.6) fillColor = '#ffaa00'; // Damaged

    ctx.fillStyle = fillColor;
    ctx.fillRect(
      centerX - hpBarWidth / 2,
      hpBarY,
      hpBarWidth * hpPercent,
      hpBarHeight,
    );

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - hpBarWidth / 2, hpBarY, hpBarWidth, hpBarHeight);

    // Enhanced flash effect when damaged - space-themed energy burst
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      const flashRadius = Math.max(deformedRadiusX, deformedRadiusY) * (1 + (1 - flashAlpha) * 0.25);
      
      // Outer flash glow
      drawer.setAlpha(flashAlpha * 0.5);
      drawer.setStroke(`rgba(${r}, ${g}, ${b}, 0.8)`, 6);
      drawer.circle(centerX, centerY, flashRadius, false);
      
      // Inner bright flash
      drawer.setAlpha(flashAlpha * 0.9);
      drawer.setStroke('#fff', 3);
      drawer.circle(centerX, centerY, flashRadius * 0.8, false);
      
      drawer.resetAlpha();
    }
  }
}
