import type { Draw } from '../render/Draw';
import type { Vec2 } from '../types';
import {
  BOSS_SPRITE_COLOSSUS,
  BOSS_SPRITE_SWARM_QUEEN,
  BOSS_SPRITE_VOID_CONSTRUCT,
  BOSS_SPRITE_OMEGA_CORE,
  BOSS_SPRITE_TINY_TYRANT,
  PixelGrid,
} from '../render/AlienSprites';
import { COMBAT } from '../config/constants';

export class BossBall {
  private flashTime = 0;
  private flashDuration = COMBAT.FLASH_DURATION;
  public currentHp: number;
  public maxHp: number;
  private breakAnimTime = 0;
  private breakAnimDuration = 2.0; // Longer for epic death
  public x: number;
  public y: number;
  private attackTimer = 0;
  private attackCooldown = 2;
  private phase = 1;
  private pulseTime = 0;
  private chargeTime = 0;
  private entranceTime = 0;
  private phaseTransitionTime = 0;
  private particleEmitTimer = 0;
  private shakeTime = 0;
  private shakeIntensity = 0;

  // Variant specific properties
  private variant: number; // 0=Colossus, 1=Swarm, 2=Void, 3=Omega
  private sprite: PixelGrid;
  private color: string;
  private glowColor: string;
  private secondaryColor: string;
  private accentColor: string;

  // Effect specific properties
  private drones: Array<{ angle: number; dist: number; speed: number }> = [];
  private sparkles: Array<{ angle: number; dist: number; speed: number; size: number }> = [];
  private shields: Array<{
    angle: number;
    size: number;
    speed: number;
    dist: number;
  }> = [];
  private rings: Array<{
    angle: number;
    radius: number;
    speed: number;
    width: number;
  }> = [];
  private arcs: Array<{
    angle: number;
    radius: number;
    speed: number;
    length: number;
  }> = [];
  private cracks: Array<Array<{ x: number; y: number }>> = []; // Array of crack paths
  private glitchTime = 0;

  constructor(
    x: number,
    y: number,
    public radius: number,
    hp: number,
    variant: number = 0,
  ) {
    this.x = x;
    this.y = y;
    this.maxHp = hp;
    this.currentHp = this.maxHp;
    this.entranceTime = 1.5; // Epic entrance
    this.variant = variant;

    // Generate random cracks for the bubble based on variant
    this.generateCracks();

    // Initialize based on variant (chronological order by level)
    switch (this.variant) {
      case 0: // Tiny Tyrant (Lvl 5 - Tutorial Boss)
        this.sprite = BOSS_SPRITE_TINY_TYRANT;
        this.color = '#A8E6CF'; // Soft mint green
        this.glowColor = '#FFD3B6'; // Soft peach
        this.secondaryColor = '#6BBE92'; // Medium mint
        this.accentColor = '#FFAAA5'; // Coral pink
        // Init twinkling stars - completely unique VFX
        for (let i = 0; i < 8; i++) {
          this.sparkles.push({
            angle: (i / 8) * Math.PI * 2,
            dist: 1.4 + Math.random() * 0.4,
            speed: 0.4 + Math.random() * 0.3,
            size: 2 + Math.random() * 2,
          });
        }
        break;
      case 1: // Colossus (Lvl 25)
        this.sprite = BOSS_SPRITE_COLOSSUS;
        this.color = '#8B0000'; // Dark Red
        this.glowColor = '#FF4500'; // Orange Red
        this.secondaryColor = '#2F4F4F'; // Dark Slate Gray
        this.accentColor = '#FFD700'; // Gold
        // Init Shields
        for (let i = 0; i < 3; i++) {
          this.shields.push({
            angle: (i / 3) * Math.PI * 2,
            size: 12,
            speed: 0.5,
            dist: 1.4,
          });
        }
        break;
      case 2: // Swarm Queen (Lvl 50)
        this.sprite = BOSS_SPRITE_SWARM_QUEEN;
        this.color = '#4B0082'; // Indigo
        this.glowColor = '#9370DB'; // Medium Purple
        this.secondaryColor = '#00FF00'; // Lime (Toxic)
        this.accentColor = '#FF00FF'; // Magenta
        // Init drones
        for (let i = 0; i < 6; i++) {
          this.drones.push({
            angle: (i / 6) * Math.PI * 2,
            dist: 1.5,
            speed: 1 + Math.random(),
          });
        }
        break;
      case 3: // Void Construct (Lvl 75)
        this.sprite = BOSS_SPRITE_VOID_CONSTRUCT;
        this.color = '#001a33'; // Very Dark Blue
        this.glowColor = '#00FFFF'; // Cyan
        this.secondaryColor = '#0066cc'; // Brighter Blue
        this.accentColor = '#66ffff'; // Light Cyan
        // Init Rings
        this.rings.push({ angle: 0, radius: 1.3, speed: 0.8, width: 4 });
        this.rings.push({ angle: Math.PI, radius: 1.6, speed: -0.6, width: 3 });
        this.rings.push({ angle: Math.PI * 0.5, radius: 1.45, speed: 1.0, width: 2 });
        break;
      case 4: // Omega Core (Lvl 100)
        this.sprite = BOSS_SPRITE_OMEGA_CORE;
        this.color = '#FF0000'; // Red
        this.glowColor = '#FFFF00'; // Yellow Glow
        this.secondaryColor = '#FFAA00'; // Orange
        this.accentColor = '#FFFF00'; // Bright Yellow
        // Init Arcs
        for (let i = 0; i < 6; i++) {
          this.arcs.push({
            angle: (i / 6) * Math.PI * 2,
            radius: 1.4,
            speed: 2 + Math.random() * 2,
            length: Math.PI * 0.5,
          });
        }
        break;
      default:
        this.sprite = BOSS_SPRITE_TINY_TYRANT;
        this.color = '#A8E6CF';
        this.glowColor = '#FFD3B6';
        this.secondaryColor = '#6BBE92';
        this.accentColor = '#FFAAA5';
    }
  }

  private generateCracks(): void {
    this.cracks = [];
    const numCracks = 6 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numCracks; i++) {
      const crack: Array<{ x: number; y: number }> = [];
      const angle = Math.random() * Math.PI * 2;
      // Start closer to center for some, edge for others
      const startDist = this.radius * (0.3 + Math.random() * 0.6);
      let cx = Math.cos(angle) * startDist;
      let cy = Math.sin(angle) * startDist;
      crack.push({ x: cx, y: cy });

      const segments = 4 + Math.floor(Math.random() * 5);

      for (let j = 0; j < segments; j++) {
        if (this.variant === 1) {
          // Colossus: Shattered Glass (Straight, sharp angles)
          cx += (Math.random() - 0.5) * this.radius * 0.6;
          cy += (Math.random() - 0.5) * this.radius * 0.6;
        } else if (this.variant === 2) {
          // Swarm: Organic/Web (Curved, smaller steps)
          cx += (Math.random() - 0.5) * this.radius * 0.3;
          cy += (Math.random() - 0.5) * this.radius * 0.3;
        } else if (this.variant === 3) {
          // Void: Digital Glitch (Orthogonal lines)
          if (Math.random() > 0.5) {
            cx += (Math.random() > 0.5 ? 1 : -1) * this.radius * 0.2;
          } else {
            cy += (Math.random() > 0.5 ? 1 : -1) * this.radius * 0.2;
          }
        } else if (this.variant === 0) {
          // Tiny Tyrant: Simple straight cracks (beginner-friendly)
          cx += (Math.random() - 0.5) * this.radius * 0.4;
          cy += (Math.random() - 0.5) * this.radius * 0.4;
        } else {
          // Omega: Energy Fissures (Chaotic, jagged)
          cx += (Math.random() - 0.5) * this.radius * 0.5;
          cy += (Math.random() - 0.5) * this.radius * 0.5;
        }

        // Keep inside radius roughly
        if (Math.sqrt(cx * cx + cy * cy) < this.radius * 0.95) {
          crack.push({ x: cx, y: cy });
        }
      }
      this.cracks.push(crack);
    }
  }

  isPointInside(point: Vec2): boolean {
    const dx = point.x - this.x;
    const dy = point.y - this.y;
    // Pixel sprites are square, but hit detection can remain circular for fairness
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  takeDamage(amount: number): boolean {
    const wasAlive = this.currentHp > 0;
    const oldPhase = this.phase;
    this.currentHp = Math.max(0, this.currentHp - amount);

    // Check for phase transition
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent < 0.33) {
      this.phase = 3;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
    }

    // Trigger phase transition animation (not for Tiny Tyrant)
    if (oldPhase !== this.phase && this.variant !== 4) {
      this.phaseTransitionTime = 1;
      this.shakeTime = 0.5;
      this.shakeIntensity = 10;
    }

    // Flash on damage
    if (this.flashTime <= 0 || amount > this.maxHp * 0.01) {
      this.triggerFlash();
    }

    // Colossus shakes on every hit
    if (this.variant === 1 && amount > this.maxHp * 0.005) {
      this.shakeTime = 0.1;
      this.shakeIntensity = 3;
    }

    // Tiny Tyrant never shakes (gentle tutorial boss)
    if (this.variant === 0) {
      this.shakeTime = 0;
      this.shakeIntensity = 0;
      this.phaseTransitionTime = 0;
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
  isBreaking(): boolean {
    return this.breakAnimTime > 0;
  }

  update(dt: number, _hasUniversalTranslator: boolean = false, _canvasWidth?: number, _canvasHeight?: number): void {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt);
    }
    if (this.breakAnimTime > 0) {
      this.breakAnimTime = Math.max(0, this.breakAnimTime - dt);
      return;
    }

    // Entrance animation - Smooth ease out
    if (this.entranceTime > 0) {
      this.entranceTime = Math.max(0, this.entranceTime - dt);
    }

    // Phase transition animation
    if (this.phaseTransitionTime > 0) {
      this.phaseTransitionTime = Math.max(0, this.phaseTransitionTime - dt);
    }

    // Shake effect
    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
    }

    // Update phase based on HP
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent < 0.33) {
      this.phase = 3;
      this.attackCooldown = 0.8;
    } else if (hpPercent < 0.66) {
      this.phase = 2;
      this.attackCooldown = 1.2;
    }

    // Update attack timer
    this.attackTimer += dt;

    // Update visual effects
    const phaseSpeedMultiplier = 1 + (this.phase - 1) * 0.5;
    this.pulseTime += dt * 2 * phaseSpeedMultiplier;
    this.particleEmitTimer += dt;

    // Variant specific updates
    if (this.variant === 1) {
      // Colossus Shields
      this.shields.forEach((shield) => {
        shield.angle += dt * shield.speed * phaseSpeedMultiplier;
      });
    } else if (this.variant === 2) {
      // Swarm Queen drones
      this.drones.forEach((drone) => {
        drone.angle += dt * drone.speed * phaseSpeedMultiplier;
      });
    } else if (this.variant === 3) {
      // Void Construct glitch & Rings
      // Rings
      this.rings.forEach((ring) => {
        ring.angle += dt * ring.speed * phaseSpeedMultiplier;
      });

      // Reduced glitch frequency and duration
      if (this.glitchTime > 0) {
        this.glitchTime -= dt;
      } else if (Math.random() < 0.02 * phaseSpeedMultiplier) {
        this.glitchTime = 0.15;
      }
    } else if (this.variant === 4) {
      // Omega Core chaotic pulsing & Arcs
      this.pulseTime += dt * 3;
      this.arcs.forEach((arc) => {
        arc.angle += dt * arc.speed * phaseSpeedMultiplier;
      });
    } else if (this.variant === 0) {
      // Tiny Tyrant sparkles
      this.sparkles.forEach((sparkle) => {
        sparkle.angle += dt * sparkle.speed;
      });
    }

    // Charge effect before attacking
    if (this.attackTimer >= this.attackCooldown - 0.5) {
      this.chargeTime += dt * 5;
    } else {
      this.chargeTime = 0;
    }
  }

  shouldAttack(): boolean {
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      return true;
    }
    return false;
  }

  getPhase(): number {
    return this.phase;
  }

  getAttackPattern(): 'single' | 'spread' | 'spiral' {
    if (this.phase === 3) return 'spiral';
    if (this.phase === 2) return 'spread';
    return 'single';
  }

  draw(drawer: Draw): void {
    const ctx = drawer.getContext();

    // Epic death animation
    if (this.breakAnimTime > 0) {
      this.drawDeathAnimation(ctx);
      return;
    }

    // Entrance animation - Elastic pop-in
    let scale = 1;
    if (this.entranceTime > 0) {
      const t = 1 - this.entranceTime / 1.5; // 0 to 1
      // EaseOutBack
      const c1 = 1.70158;
      const c3 = c1 + 1;
      scale = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      // Clamp to avoid weird visual artifacts at start
      scale = Math.max(0, scale);
    }

    // Hit Effect: Scale Punch (Squash) - SUBTLE
    // Uses flashTime as the driver for the animation
    if (this.flashTime > 0) {
      const t = 1 - this.flashTime / this.flashDuration; // 0 to 1
      // Sine wave for a quick squash and recover
      // Reduced from 0.15 to 0.05 for subtlety
      const squash = Math.sin(t * Math.PI) * 0.05;
      scale -= squash;
    }

    // Apply shake - Reduced intensity
    let drawX = this.x;
    let drawY = this.y;
    if (this.shakeTime > 0) {
      const intensity = this.shakeIntensity * (this.shakeTime / 0.5); // Fade out shake
      drawX += (Math.random() - 0.5) * intensity;
      drawY += (Math.random() - 0.5) * intensity;
    }

    const size = this.radius * 2 * scale;

    // Draw Background Effects (Auras, Drones)
    this.drawBackgroundEffects(ctx, drawX, drawY, this.radius * scale);

    // Draw Bubble Shell (The "Ball" look)
    // Pass 'scale' so cracks can align with squash/stretch
    this.drawBubbleShell(ctx, drawX, drawY, this.radius * scale, scale);

    // Draw Pixel Sprite (Inside the bubble)
    // Bobbing animation for floating effect
    const bobY = Math.sin(this.pulseTime) * (this.radius * 0.05);

    // Void Construct RGB Split Effect
    if (this.variant === 3 && this.glitchTime > 0) {
      // Red channel offset
      this.drawPixelSprite(
        ctx,
        drawX - 4,
        drawY + bobY,
        size * 0.8,
        size * 0.8,
        '#ff0000',
        0.7,
      );
      // Blue channel offset
      this.drawPixelSprite(
        ctx,
        drawX + 4,
        drawY + bobY,
        size * 0.8,
        size * 0.8,
        '#0000ff',
        0.7,
      );
      // Main sprite
      this.drawPixelSprite(
        ctx,
        drawX,
        drawY + bobY,
        size * 0.8,
        size * 0.8,
        undefined,
        0.8,
      );
    } else {
      this.drawPixelSprite(ctx, drawX, drawY + bobY, size * 0.8, size * 0.8);
    }

    // Draw Foreground Effects (Shields, Charge)
    this.drawForegroundEffects(ctx, drawX, drawY, this.radius * scale);

    // Draw Health Bar
    this.drawHealthBar(ctx, drawX, drawY, size);
  }

  private drawBubbleShell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    scale: number = 1,
  ): void {
    ctx.save();

    // Main bubble body
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    // Gradient for 3D sphere look
    const gradient = ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      radius * 0.1,
      x,
      y,
      radius,
    );
    // Outer color matches boss theme, inner is transparent/whiteish
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.8, this.hexToRgba(this.secondaryColor, 0.3));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0.6));

    ctx.fillStyle = gradient;
    ctx.fill();

    // Rim glow
    ctx.strokeStyle = this.hexToRgba(this.glowColor, 0.5);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Specular highlight (shiny reflection)
    ctx.beginPath();
    ctx.ellipse(
      x - radius * 0.4,
      y - radius * 0.4,
      radius * 0.2,
      radius * 0.1,
      Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Draw Cracks based on HP
    const hpPercent = this.currentHp / this.maxHp;
    const crackOpacity = 1 - hpPercent;

    if (crackOpacity > 0.1) {
      ctx.save();
      ctx.translate(x, y);

      // Apply variant specific styles
      if (this.variant === 3) {
        // Void
        ctx.strokeStyle = 'rgba(0, 255, 255, ' + crackOpacity + ')';
        ctx.lineWidth = 2;
      } else if (this.variant === 4) {
        // Omega
        ctx.strokeStyle = 'rgba(255, 255, 0, ' + crackOpacity + ')';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + crackOpacity * 0.8 + ')';
        ctx.lineWidth = 2;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      this.cracks.forEach((crack) => {
        if (crack.length < 2) return;
        const firstPoint = crack[0];
        if (!firstPoint) return;
        ctx.beginPath();
        // Scale crack points to match bubble squash
        ctx.moveTo(firstPoint.x * scale, firstPoint.y * scale);
        for (let i = 1; i < crack.length; i++) {
          const point = crack[i];
          if (point) {
            ctx.lineTo(point.x * scale, point.y * scale);
          }
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    ctx.restore();
  }

  private drawPixelSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    colorOverride?: string,
    alphaOverride?: number,
  ): void {
    const grid = this.sprite;
    if (!grid || grid.length === 0 || !grid[0]) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const pixelSize = width / cols;

    const startX = x - width / 2;
    const startY = y - height / 2;

    ctx.save();
    if (alphaOverride !== undefined) ctx.globalAlpha = alphaOverride;

    // Phase color shift
    let mainColor = this.color;
    if (this.phase === 3 && this.variant === 4)
      mainColor = this.getRandomColor(); // Omega Core chaos

    for (let r = 0; r < rows; r++) {
      const row = grid[r];
      if (!row) continue;

      for (let c = 0; c < cols; c++) {
        const pixelType = row[c];
        if (pixelType === 0) continue;

        let fillStyle = mainColor;
        if (pixelType === 2) fillStyle = this.secondaryColor;
        if (pixelType === 3) fillStyle = this.accentColor;
        if (pixelType === 4) fillStyle = this.glowColor;

        if (colorOverride) fillStyle = colorOverride;

        // REMOVED: Flash effect color override
        // if (this.flashTime > 0 && !colorOverride) { ... }

        ctx.fillStyle = fillStyle;

        // Slight gap for pixel art look
        ctx.fillRect(
          startX + c * pixelSize,
          startY + r * pixelSize,
          pixelSize + 0.5,
          pixelSize + 0.5,
        );
      }
    }
    ctx.restore();
  }

  private drawBackgroundEffects(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Tiny Tyrant gets COMPLETELY unique playful effects
    if (this.variant === 0) {
      // Magical rainbow aura with wave pattern
      const waveCount = 3;
      for (let wave = 0; wave < waveCount; wave++) {
        const waveOffset = (wave / waveCount) * Math.PI * 2;
        const waveRadius = radius * (1.2 + wave * 0.15);
        const alpha = 0.15 - wave * 0.04;

        // Create wavy circle
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const wobble = Math.sin(angle * 4 + this.pulseTime * 2 + waveOffset) * (radius * 0.1);
          const r = waveRadius + wobble;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          if (angle === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        // Rainbow gradient
        const rainbowGradient = ctx.createRadialGradient(x, y, waveRadius * 0.5, x, y, waveRadius);
        const hue = (this.pulseTime * 50 + wave * 40) % 360;
        rainbowGradient.addColorStop(0, `hsla(${hue}, 70%, 80%, 0)`);
        rainbowGradient.addColorStop(0.5, `hsla(${hue}, 70%, 80%, ${alpha})`);
        rainbowGradient.addColorStop(1, `hsla(${hue}, 70%, 80%, 0)`);

        ctx.fillStyle = rainbowGradient;
        ctx.fill();
      }

      // Sparkle trail particles
      const trailCount = 12;
      for (let i = 0; i < trailCount; i++) {
        const angle = (i / trailCount) * Math.PI * 2 + this.pulseTime;
        const dist = radius * (0.8 + Math.sin(this.pulseTime * 3 + i) * 0.3);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const sparkleSize = 2 + Math.sin(this.pulseTime * 4 + i) * 1.5;

        // Draw cross sparkle
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(this.pulseTime * 5 + i) * 0.3})`;
        ctx.fillRect(px - sparkleSize, py - 0.5, sparkleSize * 2, 1);
        ctx.fillRect(px - 0.5, py - sparkleSize, 1, sparkleSize * 2);
      }
    } else {
      // Generic pulse aura for other bosses
      const pulse = 1 + Math.sin(this.pulseTime) * 0.05;
      const auraRadius = radius * 1.1 * pulse;

      const gradient = ctx.createRadialGradient(
        x,
        y,
        radius * 0.8,
        x,
        y,
        auraRadius,
      );
      gradient.addColorStop(0, this.hexToRgba(this.glowColor, 0.0));
      gradient.addColorStop(1, this.hexToRgba(this.glowColor, 0.2));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swarm Queen Drones - Orbiting the bubble
    if (this.variant === 2) {
      this.drones.forEach((drone) => {
        const orbitRadius = radius * 1.3; // Orbit outside bubble
        const dx = x + Math.cos(drone.angle) * orbitRadius;
        const dy = y + Math.sin(drone.angle) * orbitRadius;

        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.arc(dx, dy, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = this.hexToRgba(this.glowColor, 0.3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, orbitRadius, drone.angle - 0.3, drone.angle);
        ctx.stroke();
      });
    }

    // Tiny Tyrant Twinkling Stars - UNIQUE personality
    if (this.variant === 0) {
      this.sparkles.forEach((star, index) => {
        const orbitRadius = radius * star.dist;
        const spiralOffset = Math.sin(this.pulseTime + index) * (radius * 0.2);
        const sx = x + Math.cos(star.angle) * (orbitRadius + spiralOffset);
        const sy = y + Math.sin(star.angle) * (orbitRadius + spiralOffset);

        // Twinkling effect
        const twinkle = Math.abs(Math.sin(this.pulseTime * 3 + index * 0.5));
        const starSize = star.size * (0.6 + twinkle * 0.8);

        // Draw 4-pointed star
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.pulseTime + index);

        // Star color cycles through rainbow
        const hue = ((this.pulseTime * 100 + index * 45) % 360);
        ctx.fillStyle = `hsla(${hue}, 80%, 75%, ${0.7 + twinkle * 0.3})`;
        ctx.shadowColor = `hsla(${hue}, 80%, 75%, 0.8)`;
        ctx.shadowBlur = 8;

        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const outerRadius = starSize;
          const innerRadius = starSize * 0.4;

          // Outer point
          ctx.lineTo(
            Math.cos(angle) * outerRadius,
            Math.sin(angle) * outerRadius
          );
          // Inner point
          ctx.lineTo(
            Math.cos(angle + Math.PI / 4) * innerRadius,
            Math.sin(angle + Math.PI / 4) * innerRadius
          );
        }
        ctx.closePath();
        ctx.fill();

        // Add bright center
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, starSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // Void Construct Rings (Back half) - Enhanced
    if (this.variant === 3) {
      // Add outer glow aura
      const voidGlow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2);
      voidGlow.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
      voidGlow.addColorStop(0.5, 'rgba(0, 200, 255, 0.1)');
      voidGlow.addColorStop(1, 'rgba(0, 100, 200, 0)');
      ctx.fillStyle = voidGlow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw energy particles around the boss
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + this.pulseTime;
        const dist = radius * (1.5 + Math.sin(this.pulseTime * 2 + i) * 0.2);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const size = 3 + Math.sin(this.pulseTime * 3 + i) * 2;

        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px, py, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      this.rings.forEach((ring) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ring.angle);
        ctx.scale(1, 0.3); // Flatten to look like 3D ring

        // Enhanced rings with glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, radius * ring.radius, Math.PI, 0); // Back half
        ctx.strokeStyle = this.hexToRgba(this.glowColor, 0.6);
        ctx.lineWidth = ring.width + 2;
        ctx.stroke();

        ctx.restore();
      });
    }

    ctx.restore();
  }

  private drawForegroundEffects(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();

    // Phase Transition Shield
    if (this.phaseTransitionTime > 0) {
      const alpha =
        Math.sin(this.phaseTransitionTime * Math.PI * 5) * 0.5 + 0.5;
      ctx.strokeStyle = this.accentColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Charge Attack
    if (this.chargeTime > 0) {
      const chargeProgress = Math.min(1, this.chargeTime / 1.0);
      ctx.fillStyle = this.glowColor;
      ctx.globalAlpha = 0.3 * chargeProgress;
      ctx.beginPath();
      ctx.arc(x, y, radius * chargeProgress, 0, Math.PI * 2);
      ctx.fill();
    }

    // Colossus Shields
    if (this.variant === 1) {
      this.shields.forEach((shield) => {
        const orbitRadius = radius * shield.dist;
        const dx = x + Math.cos(shield.angle) * orbitRadius;
        const dy = y + Math.sin(shield.angle) * orbitRadius;

        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(shield.angle); // Face inward

        ctx.fillStyle = this.secondaryColor;
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 2;

        // Draw Shield Plate
        ctx.fillRect(
          -shield.size,
          -shield.size * 1.5,
          shield.size * 2,
          shield.size * 3,
        );
        ctx.strokeRect(
          -shield.size,
          -shield.size * 1.5,
          shield.size * 2,
          shield.size * 3,
        );

        ctx.restore();
      });
    }

    // Void Construct Rings (Front half) - Enhanced
    if (this.variant === 3) {
      this.rings.forEach((ring) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ring.angle);
        ctx.scale(1, 0.3); // Flatten to look like 3D ring

        // Enhanced front rings with stronger glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, radius * ring.radius, 0, Math.PI); // Front half
        ctx.strokeStyle = this.hexToRgba(this.glowColor, 1.0);
        ctx.lineWidth = ring.width + 2;
        ctx.stroke();

        // Inner glow line
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, radius * ring.radius, 0, Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = ring.width * 0.5;
        ctx.stroke();

        ctx.restore();
      });

      // Add central void core effect
      const coreSize = 15 + Math.sin(this.pulseTime * 2) * 5;
      const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
      coreGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      coreGradient.addColorStop(0.5, 'rgba(0, 100, 150, 0.8)');
      coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(x, y, coreSize, 0, Math.PI * 2);
      ctx.fill();

      // Core ring
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, coreSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Omega Core Arcs - Enhanced
    if (this.variant === 4) {
      // Add massive energy aura
      const energyGlow = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2.5);
      energyGlow.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
      energyGlow.addColorStop(0.4, 'rgba(255, 150, 0, 0.2)');
      energyGlow.addColorStop(0.7, 'rgba(255, 0, 0, 0.1)');
      energyGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = energyGlow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating energy particles
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + this.pulseTime * 2;
        const dist = radius * (1.6 + Math.sin(this.pulseTime * 4 + i * 0.5) * 0.3);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const size = 4 + Math.sin(this.pulseTime * 5 + i) * 2;

        // Alternate colors between red, yellow, and orange
        const colors = ['rgba(255, 0, 0, 0.9)', 'rgba(255, 255, 0, 0.9)', 'rgba(255, 165, 0, 0.9)'];
        const colorIndex = i % 3;
        const selectedColor = colors[colorIndex] ?? colors[0] ?? 'rgba(255, 255, 0, 0.9)';
        ctx.fillStyle = selectedColor;
        ctx.shadowColor = selectedColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner rotating ring
      const innerRingCount = 8;
      for (let i = 0; i < innerRingCount; i++) {
        const angle = (i / innerRingCount) * Math.PI * 2 - this.pulseTime * 3;
        const startAngle = angle;
        const endAngle = angle + Math.PI * 0.3;

        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.2, startAngle, endAngle);
        ctx.stroke();
      }

      // Enhanced arcs
      this.arcs.forEach((arc, index) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(arc.angle);

        // Main arc with gradient
        const arcGradient = ctx.createLinearGradient(-radius * arc.radius, 0, radius * arc.radius, 0);
        arcGradient.addColorStop(0, '#ffff00');
        arcGradient.addColorStop(0.5, '#ff8800');
        arcGradient.addColorStop(1, '#ff0000');

        ctx.beginPath();
        ctx.arc(0, 0, radius * arc.radius, 0, arc.length);
        ctx.strokeStyle = arcGradient;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = index % 2 === 0 ? '#ffff00' : '#ff0000';
        ctx.shadowBlur = 25;
        ctx.stroke();

        // Inner bright line
        ctx.beginPath();
        ctx.arc(0, 0, radius * arc.radius, 0, arc.length);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // Central energy core - REMOVED to reduce lag
      // Energy spikes radiating from core - REMOVED to reduce lag
    }

    // Omega Core Lightning - REMOVED to reduce lag

    ctx.restore();
  }

  private drawDeathAnimation(ctx: CanvasRenderingContext2D): void {
    const progress = 1 - this.breakAnimTime / this.breakAnimDuration;
    const scale = 1 + progress * 2;
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.rotate(progress * Math.PI * 2);

    // Pixel explosion
    const pixels = 8;
    for (let i = 0; i < pixels; i++) {
      const angle = (i / pixels) * Math.PI * 2;
      const dist = progress * 100;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;

      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(px, py, 10, 10);
    }

    ctx.restore();
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
  ): void {
    const barWidth = size * 1.2;
    const barHeight = 12;
    const barY = centerY - size / 2 - 30;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = this.glowColor;
    ctx.lineWidth = 2;
    ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);
    ctx.strokeRect(centerX - barWidth / 2, barY, barWidth, barHeight);

    // Fill
    const hpPercent = this.currentHp / this.maxHp;
    if (hpPercent > 0) {
      const gradient = ctx.createLinearGradient(
        centerX - barWidth / 2,
        barY,
        centerX - barWidth / 2 + barWidth * hpPercent,
        barY,
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.glowColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        centerX - barWidth / 2 + 2,
        barY + 2,
        (barWidth - 4) * hpPercent,
        barHeight - 4,
      );
    }

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 4;

    let name = 'BOSS';
    if (this.variant === 0) name = 'TYRANT';
    if (this.variant === 1) name = 'COLOSSUS';
    if (this.variant === 2) name = 'SWARM QUEEN';
    if (this.variant === 3) name = 'VOID CONSTRUCT';
    if (this.variant === 4) name = 'OMEGA CORE';

    ctx.fillText(name, centerX, barY - 8);
    ctx.shadowBlur = 0;
  }

  private hexToRgba(hex: string | undefined, alpha: number): string {
    if (!hex) return `rgba(0, 0, 0, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getRandomColor(): string {
    const colors = [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return color ?? '#ff0000'; // Fallback to red if undefined
  }

  getPosition(): Vec2 {
    return { x: this.x, y: this.y };
  }
}
