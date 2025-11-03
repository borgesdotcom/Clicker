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

    // Disable deformation on mobile for performance
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

    // Calculate deformation effect - different for beams vs lasers
    let deformationAmount = 0;
    
    if (!isMobile && this.deformationTime > 0) {
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
    
    // Draw simple bubble
    const centerX = this.x + deformationX;
    const centerY = this.y + deformationY;
    
    // Subtle pulsing animation
    const pulseValue = Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.02;
    const currentRadius = this.radius * (1 + pulseValue);
    
    const deformedRadiusX = currentRadius * scaleX;
    const deformedRadiusY = currentRadius * scaleY;
    
    // Color values
    const r = parseInt(this.color.fill.substring(1, 3), 16);
    const g = parseInt(this.color.fill.substring(3, 5), 16);
    const b = parseInt(this.color.fill.substring(5, 7), 16);
    
    // Lordakia-inspired gel-like outer glow - enhanced translucent aura
    const glowRadius = Math.max(deformedRadiusX, deformedRadiusY) * 1.25;
    const glowPulse = Math.sin(this.animationTime * 1.2 + this.rotationOffset) * 0.05;
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius,
    );
    glowGradient.addColorStop(0, `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(0.2 + glowPulse)})`);
    glowGradient.addColorStop(0.3, `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(0.12 + glowPulse * 0.5)})`);
    glowGradient.addColorStop(0.6, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.06)`);
    glowGradient.addColorStop(1, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`);
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Main gel-like body - Lordakia translucent bubble with inner structure
    // Outer gel layer
    const outerGradient = ctx.createRadialGradient(
      centerX - deformedRadiusX * 0.25,
      centerY - deformedRadiusY * 0.25,
      Math.min(deformedRadiusX, deformedRadiusY) * 0.05,
      centerX,
      centerY,
      Math.max(deformedRadiusX, deformedRadiusY),
    );
    // Translucent center
    outerGradient.addColorStop(0, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`);
    // More opaque mid-section (gel-like)
    outerGradient.addColorStop(0.3, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.55)`);
    outerGradient.addColorStop(0.5, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.65)`);
    // Edge transparency
    const strokeR = parseInt(this.color.stroke.substring(1, 3), 16);
    const strokeG = parseInt(this.color.stroke.substring(3, 5), 16);
    const strokeB = parseInt(this.color.stroke.substring(5, 7), 16);
    outerGradient.addColorStop(0.75, `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.75)`);
    outerGradient.addColorStop(0.9, `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.6)`);
    outerGradient.addColorStop(1, `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.45)`);

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Inner gel core - visible through translucent shell (Lordakia inner structure)
    const innerCoreRadius = currentRadius * 0.35;
    const corePulse = Math.sin(this.animationTime * 2 + this.rotationOffset) * 0.1;
    const innerGradient = ctx.createRadialGradient(
      centerX - innerCoreRadius * 0.4,
      centerY - innerCoreRadius * 0.4,
      innerCoreRadius * 0.1,
      centerX,
      centerY,
      innerCoreRadius * (1 + corePulse),
    );
    innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.7)`);
    innerGradient.addColorStop(0.4, `rgba(${String(r + 30)}, ${String(g + 30)}, ${String(b + 30)}, 0.5)`);
    innerGradient.addColorStop(0.7, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`);
    innerGradient.addColorStop(1, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.2)`);
    
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, innerCoreRadius * (1 + corePulse), 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Organic inner structures - visible through gel (Lordakia organ-like details)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(this.animationTime * 0.3 + this.rotationOffset);
    
    // Draw organic patterns inside the gel
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const patternRadius = currentRadius * (0.4 + Math.sin(this.animationTime * 1.5 + i) * 0.1);
      const patternX = Math.cos(angle) * patternRadius;
      const patternY = Math.sin(angle) * patternRadius;
      const patternSize = currentRadius * (0.08 + Math.sin(this.animationTime * 2 + i) * 0.03);
      const patternAlpha = 0.25 + Math.sin(this.animationTime * 2.5 + i) * 0.15;
      
      const patternGradient = ctx.createRadialGradient(
        patternX,
        patternY,
        0,
        patternX,
        patternY,
        patternSize,
      );
      patternGradient.addColorStop(0, `rgba(${String(r + 20)}, ${String(g + 20)}, ${String(b + 20)}, ${String(patternAlpha)})`);
      patternGradient.addColorStop(0.5, `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(patternAlpha * 0.6)})`);
      patternGradient.addColorStop(1, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`);
      
      ctx.fillStyle = patternGradient;
      ctx.beginPath();
      ctx.arc(patternX, patternY, patternSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Tentacle-like appendages (Lordakia characteristic feature)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.rotate(this.animationTime * 0.5 + this.rotationOffset);
    
    const tentacleCount = 4;
    for (let i = 0; i < tentacleCount; i++) {
      const tentacleAngle = (i / tentacleCount) * Math.PI * 2;
      const tentacleSway = Math.sin(this.animationTime * 1.8 + i) * 0.2;
      const baseAngle = tentacleAngle + tentacleSway;
      
      // Tentacle base (attached to body)
      const baseX = Math.cos(baseAngle) * currentRadius * 0.85;
      const baseY = Math.sin(baseAngle) * currentRadius * 0.85;
      const tentacleLength = currentRadius * (0.25 + Math.sin(this.animationTime * 2 + i) * 0.1);
      const tentacleTipX = baseX + Math.cos(baseAngle) * tentacleLength;
      const tentacleTipY = baseY + Math.sin(baseAngle) * tentacleLength;
      const tentacleWidth = currentRadius * 0.08;
      
      // Tentacle gradient (gel-like)
      const tentacleGradient = ctx.createLinearGradient(
        baseX,
        baseY,
        tentacleTipX,
        tentacleTipY,
      );
      tentacleGradient.addColorStop(0, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.6)`);
      tentacleGradient.addColorStop(0.5, `rgba(${String(r + 15)}, ${String(g + 15)}, ${String(b + 15)}, 0.5)`);
      tentacleGradient.addColorStop(1, `rgba(${String(r + 30)}, ${String(g + 30)}, ${String(b + 30)}, 0.4)`);
      
      ctx.strokeStyle = tentacleGradient;
      ctx.lineWidth = tentacleWidth;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(tentacleTipX, tentacleTipY);
      ctx.stroke();
      
      // Tentacle tip (glowing)
      const tipGlow = ctx.createRadialGradient(
        tentacleTipX,
        tentacleTipY,
        0,
        tentacleTipX,
        tentacleTipY,
        tentacleWidth * 1.5,
      );
      tipGlow.addColorStop(0, `rgba(${String(r + 40)}, ${String(g + 40)}, ${String(b + 40)}, 0.8)`);
      tipGlow.addColorStop(0.5, `rgba(${String(r + 20)}, ${String(g + 20)}, ${String(b + 20)}, 0.5)`);
      tipGlow.addColorStop(1, `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`);
      
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tentacleTipX, tentacleTipY, tentacleWidth * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Enhanced glossy highlight - Lordakia reflective gel surface
    const highlightSize = currentRadius * 0.4;
    const highlightAlpha = 0.6 + Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.1;
    
    // Main highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${String(highlightAlpha)})`;
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
    
    // Secondary smaller highlight for extra gloss
    ctx.fillStyle = `rgba(255, 255, 255, ${String(highlightAlpha * 0.5)})`;
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

    // Gel-like border outline - subtle but visible
    ctx.strokeStyle = `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 3;
    ctx.shadowColor = `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();
    ctx.shadowBlur = 0;

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

    // Simple flash effect when damaged
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      const flashRadius = Math.max(deformedRadiusX, deformedRadiusY) * (1 + (1 - flashAlpha) * 0.2);
      
      drawer.setAlpha(flashAlpha * 0.6);
      drawer.setStroke(`rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.9)`, 4);
      drawer.circle(centerX, centerY, flashRadius, false);
      
      drawer.resetAlpha();
    }
  }
}
