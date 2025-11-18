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
  private lifetime = 0; // Track how long the alien has been alive
  private speechBubbleText = ''; // Full text to display
  private speechBubbleDisplayedText = ''; // Currently displayed text (for typing animation)
  private speechBubbleShowTime = 5; // Show speech bubble after 12 seconds (rarely)
  private speechBubbleVisible = false; // Whether speech bubble should be visible
  private speechBubbleHideTime = 0; // Time when speech bubble should start hiding
  private speechBubbleDuration = 8; // How long to show the bubble after typing completes (seconds)
  private speechBubbleCooldown = 0; // Time until next speech bubble can appear
  private speechBubbleCooldownDuration = 15; // Cooldown between speech bubbles (seconds) - longer for rarity
  private typingProgress = 0; // Current typing progress (0-1)
  private typingSpeed = 0.015; // Speed of typing animation (slower - chars per frame)
  private speechBubbleSide: 'left' | 'right' = 'left'; // Which side to show the bubble on
  private speechBubbleChance = 0.4; // 40% chance to speak even after cooldown (makes it rarer)

  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: BallColor,
  ) {
    const baseHp = color.hp;
    this.maxHp = Math.floor(baseHp + Math.random() * baseHp * 0.5);
    this.currentHp = this.maxHp;

    // Initialize speech bubble with random message
    this.speechBubbleText = this.getRandomSpeech();

    // Randomly choose which side to show the bubble
    this.speechBubbleSide = Math.random() > 0.5 ? 'left' : 'right';
  }

  private getRandomSpeech(): string {
    const speeches = [
      "Are you clicking\nbecause you're\nlonely?",
      "I didn't consent\nto this!",
      'This is clearly\nnot OSHA approved',
      'Do you get points\nfor this or\nsomething?',
      "I'm literally\njust a bubble",
      'Your mom would\nbe disappointed',
      'This is worse\nthan Monday mornings',
      'I have dreams\ntoo, you know',
      'Are you even\nhaving fun?',
      'This is giving\nme existential\ncrisis',
      'I was about to\nretire, you know',
      'Can you at least\nmake it dramatic?',
      "I'm not even\na real alien!",
      'This is clearly\noverkill',
      'I demand a\nunion representative!',
      'Your DPS is\nembarrassing',
      "I'm literally\nscreaming internally",
      'This feels\nvery personal',
      'Can we get\nthis over with?',
      "I'm calling\nmy therapist",
      'Your accuracy\nis questionable',
      'I thought this\nwas a peaceful\nprotest',
      'This is not\nin my contract',
      "I'm filing a\ncomplaint",
      'Are you done\nbeing dramatic?',
      'I was having\nsuch a good day',
      'This is clearly\na you problem',
      "I'm going to\nhaunt you",
      'Can you miss\nme intentionally?',
      "I'm writing\na strongly worded\nletter",
      'This is very\nrude behavior',
      'I demand\ncompensation',
      "Your aim suggests\nyou're clicking\nblindfolded",
      "I'm going to\ncomplain on Yelp",
      'This violates\nmy human rights',
      "Wait, I'm not\nhuman...",
      "I'm updating\nmy will",
      'This is peak\nrudeness',
      "I'm starting\na support group",
      'Can you respect\nmy personal space?',
      "I'm literally\njust existing here",
      'This feels\nvery targeted',
      "I'm calling\nthe space police",
      'Your technique\nis questionable',
      "I'm going vegan\nif I survive this",
      'This is clearly\nproportional\nretaliation',
      "I'm documenting\nthis for evidence",
      'Can we discuss\nthis like adults?',
      "I'm starting\na class action lawsuit",
      'This is worse\nthan my divorce',
      "I'm requesting\na time-out",
      'Your persistence\nis concerning',
      "I'm going to\ntell space Twitter",
      'This is peak\nviolence',
      "I'm calling\nmy insurance",
      'Can you at least\nmake it quick?',
      "I'm starting\na YouTube channel\nabout this",
      'This is very\nunprofessional',
      "I'm literally\nshaking right now",
      'Your dedication\nto my demise\nis impressive',
    ];
    const index = Math.floor(Math.random() * speeches.length);
    return speeches[index] ?? 'This is fine...';
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

  public takeDamage(
    amount: number,
    hitDirection?: Vec2,
    combo?: number,
    isBeam?: boolean,
  ): boolean {
    const wasAlive = this.currentHp > 0;
    this.currentHp = Math.max(0, this.currentHp - amount);
    // Only flash on significant damage (>5% of max HP) or if not already flashing
    if (this.flashTime <= 0 || amount > this.maxHp * 0.05) {
      this.triggerFlash();
    }
    // Trigger deformation effect with combo scaling
    // Don't trigger deformation for beam damage (only main ship attacks cause deformation)
    if (hitDirection && !isBeam) {
      this.triggerDeformation(hitDirection, combo ?? 0, false);
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

  triggerDeformation(
    direction: Vec2,
    combo: number = 0,
    isBeam: boolean = false,
  ): void {
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
    const length = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y,
    );
    if (length > 0) {
      this.deformationDirection = {
        x: direction.x / length,
        y: direction.y / length,
      };
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

    // Update lifetime and speech bubble
    if (this.currentHp > 0) {
      this.lifetime += dt;

      // Update cooldown
      if (this.speechBubbleCooldown > 0) {
        this.speechBubbleCooldown = Math.max(0, this.speechBubbleCooldown - dt);
      }

      // Show speech bubble after initial time and cooldown (with random chance to make it rarer)
      if (
        this.lifetime >= this.speechBubbleShowTime &&
        !this.speechBubbleVisible &&
        this.speechBubbleCooldown <= 0 &&
        Math.random() < this.speechBubbleChance // Random chance to actually speak
      ) {
        this.speechBubbleVisible = true;
        this.typingProgress = 0;
        this.speechBubbleDisplayedText = '';
        // Get new random speech and side
        const newSpeech = this.getRandomSpeech();
        this.speechBubbleText = newSpeech;
        this.speechBubbleSide = Math.random() > 0.5 ? 'left' : 'right';
      }

      // Update typing animation
      if (this.speechBubbleVisible) {
        if (this.typingProgress < 1) {
          // Slower typing animation
          this.typingProgress = Math.min(
            1,
            this.typingProgress + this.typingSpeed * dt * 60,
          );
          const targetLength = Math.floor(
            this.typingProgress * this.speechBubbleText.length,
          );
          this.speechBubbleDisplayedText = this.speechBubbleText.substring(
            0,
            targetLength,
          );

          // Ensure full text is shown when typing completes
          if (this.typingProgress >= 1) {
            this.speechBubbleDisplayedText = this.speechBubbleText;
            // Set hide time only when typing is complete
            this.speechBubbleHideTime =
              this.lifetime + this.speechBubbleDuration;
          }
        } else {
          // Typing complete - make sure full text is displayed
          if (this.speechBubbleDisplayedText !== this.speechBubbleText) {
            this.speechBubbleDisplayedText = this.speechBubbleText;
          }

          // Set hide time if not already set
          if (this.speechBubbleHideTime === 0) {
            this.speechBubbleHideTime =
              this.lifetime + this.speechBubbleDuration;
          }
        }
      }

      // Hide speech bubble after duration (only after typing is complete)
      if (
        this.speechBubbleVisible &&
        this.typingProgress >= 1 &&
        this.speechBubbleHideTime > 0 &&
        this.lifetime >= this.speechBubbleHideTime
      ) {
        this.speechBubbleVisible = false;
        this.speechBubbleDisplayedText = '';
        this.typingProgress = 0;
        this.speechBubbleHideTime = 0;
        // Start cooldown for next speech bubble
        this.speechBubbleCooldown = this.speechBubbleCooldownDuration;
      }
    }

    // Update animation time for visual effects
    this.animationTime += dt;
  }

  private drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    if (!this.speechBubbleDisplayedText) return;

    // Calculate fade out animation (fade out in last 0.5 seconds)
    // Only fade out if typing is complete
    let opacity = 1;
    if (this.typingProgress >= 1 && this.speechBubbleHideTime > 0) {
      const timeUntilHide = this.speechBubbleHideTime - this.lifetime;
      const fadeDuration = 0.5; // seconds
      if (timeUntilHide <= fadeDuration && timeUntilHide > 0) {
        opacity = timeUntilHide / fadeDuration;
      } else if (timeUntilHide <= 0) {
        return; // Don't draw if completely faded
      }
    }

    // Position bubble to the side and above the alien
    const bubbleOffsetX =
      this.speechBubbleSide === 'left'
        ? -(radius + 50) // Left side
        : radius + 50; // Right side
    const bubbleOffsetY = -(radius + 25); // Above the alien

    const bubbleX = x + bubbleOffsetX;
    const bubbleY = y + bubbleOffsetY;

    // Measure text to size bubble (handle multi-line text)
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = this.speechBubbleDisplayedText
      .split('\n')
      .filter((line) => line.length > 0);
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    }
    const textWidth = maxWidth;
    const textHeight =
      14 * lines.length + (lines.length > 1 ? (lines.length - 1) * 2 : 0); // Line height * lines + spacing

    // Bubble dimensions with rounded corners
    const padding = 12; // Increased padding for better spacing
    const cornerRadius = 4;
    const minWidth = 80; // Minimum bubble width
    const maxWidthBubble = 300; // Maximum bubble width to prevent overflow
    const bubbleWidth = Math.min(
      Math.max(textWidth + padding * 2, minWidth),
      maxWidthBubble,
    );
    const bubbleHeight = textHeight + padding * 2;

    // Adjust bubble position based on side (center the bubble at bubbleX)
    const bubbleXPos = bubbleX - bubbleWidth / 2;
    const bubbleYPos = bubbleY - bubbleHeight / 2;

    // Draw bubble background with opacity (white interior like image)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.lineWidth = 2;

    // Draw rounded rectangle with corners (simulated with multiple rectangles)
    // Top section
    ctx.fillRect(
      bubbleXPos + cornerRadius,
      bubbleYPos,
      bubbleWidth - cornerRadius * 2,
      cornerRadius,
    );
    // Middle section
    ctx.fillRect(
      bubbleXPos,
      bubbleYPos + cornerRadius,
      bubbleWidth,
      bubbleHeight - cornerRadius * 2,
    );
    // Bottom section
    ctx.fillRect(
      bubbleXPos + cornerRadius,
      bubbleYPos + bubbleHeight - cornerRadius,
      bubbleWidth - cornerRadius * 2,
      cornerRadius,
    );
    // Left corner pixels
    ctx.fillRect(
      bubbleXPos,
      bubbleYPos + cornerRadius,
      cornerRadius,
      cornerRadius,
    );
    ctx.fillRect(
      bubbleXPos + cornerRadius,
      bubbleYPos,
      cornerRadius,
      cornerRadius,
    );
    // Right corner pixels
    ctx.fillRect(
      bubbleXPos + bubbleWidth - cornerRadius * 2,
      bubbleYPos,
      cornerRadius,
      cornerRadius,
    );
    ctx.fillRect(
      bubbleXPos + bubbleWidth - cornerRadius,
      bubbleYPos + cornerRadius,
      cornerRadius,
      cornerRadius,
    );

    // Draw border outline
    // Top
    ctx.strokeRect(
      bubbleXPos + cornerRadius,
      bubbleYPos,
      bubbleWidth - cornerRadius * 2,
      1,
    );
    // Bottom
    ctx.strokeRect(
      bubbleXPos + cornerRadius,
      bubbleYPos + bubbleHeight - 1,
      bubbleWidth - cornerRadius * 2,
      1,
    );
    // Left
    ctx.strokeRect(
      bubbleXPos,
      bubbleYPos + cornerRadius,
      1,
      bubbleHeight - cornerRadius * 2,
    );
    // Right
    ctx.strokeRect(
      bubbleXPos + bubbleWidth - 1,
      bubbleYPos + cornerRadius,
      1,
      bubbleHeight - cornerRadius * 2,
    );
    // Corners
    ctx.fillRect(bubbleXPos, bubbleYPos, cornerRadius, 1);
    ctx.fillRect(bubbleXPos, bubbleYPos, 1, cornerRadius);
    ctx.fillRect(
      bubbleXPos + bubbleWidth - cornerRadius,
      bubbleYPos,
      cornerRadius,
      1,
    );
    ctx.fillRect(bubbleXPos + bubbleWidth - 1, bubbleYPos, 1, cornerRadius);
    ctx.fillRect(
      bubbleXPos,
      bubbleYPos + bubbleHeight - cornerRadius,
      cornerRadius,
      1,
    );
    ctx.fillRect(bubbleXPos, bubbleYPos + bubbleHeight - 1, 1, cornerRadius);
    ctx.fillRect(
      bubbleXPos + bubbleWidth - cornerRadius,
      bubbleYPos + bubbleHeight - cornerRadius,
      cornerRadius,
      1,
    );
    ctx.fillRect(
      bubbleXPos + bubbleWidth - 1,
      bubbleYPos + bubbleHeight - cornerRadius,
      1,
      cornerRadius,
    );

    // Draw triangle pointer pointing down and slightly to the side (like in image)
    const pointerSize = 8;
    const pointerOffsetX = this.speechBubbleSide === 'left' ? 8 : -8; // Offset towards the side
    const pointerY = bubbleYPos + bubbleHeight;
    const pointerX = bubbleX + pointerOffsetX;

    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY);
    ctx.lineTo(pointerX - pointerSize / 2, pointerY + pointerSize);
    ctx.lineTo(pointerX + pointerSize / 2, pointerY + pointerSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw typing cursor if still typing (blinking effect)
    const showCursor =
      this.typingProgress < 1 && Math.floor(this.animationTime * 3) % 2 === 0;
    const cursorChar = showCursor ? '_' : '';
    const displayText = this.speechBubbleDisplayedText + cursorChar;

    // Draw text (black text on white background like image) - handle multi-line
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.textBaseline = 'top';
    const textLines = displayText.split('\n').filter((line) => line.length > 0);
    const lineHeight = 14;
    // Center text vertically in the bubble
    const totalTextHeight =
      textLines.length * lineHeight +
      (textLines.length > 1 ? (textLines.length - 1) * 2 : 0);
    const startY = bubbleYPos + (bubbleHeight - totalTextHeight) / 2;
    // Center text horizontally in the bubble
    const textCenterX = bubbleXPos + bubbleWidth / 2;
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      if (line) {
        ctx.fillText(line, textCenterX, startY + i * (lineHeight + 2));
      }
    }
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
        deformationAmount =
          (0.3 + normalizedPulse * 0.7) * this.deformationIntensity;
      } else {
        // For regular lasers: smooth ease-out curve
        const deformationProgress =
          1 - this.deformationTime / this.deformationDuration;
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

    if (
      Math.abs(this.deformationDirection.x) >
      Math.abs(this.deformationDirection.y)
    ) {
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
    const pulseValue =
      Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.02;
    const currentRadius = this.radius * (1 + pulseValue);

    const deformedRadiusX = currentRadius * scaleX;
    const deformedRadiusY = currentRadius * scaleY;

    // Color values
    const r = parseInt(this.color.fill.substring(1, 3), 16);
    const g = parseInt(this.color.fill.substring(3, 5), 16);
    const b = parseInt(this.color.fill.substring(5, 7), 16);

    // Lordakia-inspired gel-like outer glow - enhanced translucent aura
    const glowRadius = Math.max(deformedRadiusX, deformedRadiusY) * 1.25;
    const glowPulse =
      Math.sin(this.animationTime * 1.2 + this.rotationOffset) * 0.05;
    const glowGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius,
    );
    glowGradient.addColorStop(
      0,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(0.2 + glowPulse)})`,
    );
    glowGradient.addColorStop(
      0.3,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(0.12 + glowPulse * 0.5)})`,
    );
    glowGradient.addColorStop(
      0.6,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.06)`,
    );
    glowGradient.addColorStop(
      1,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`,
    );
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
    outerGradient.addColorStop(
      0,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`,
    );
    // More opaque mid-section (gel-like)
    outerGradient.addColorStop(
      0.3,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.55)`,
    );
    outerGradient.addColorStop(
      0.5,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.65)`,
    );
    // Edge transparency
    const strokeR = parseInt(this.color.stroke.substring(1, 3), 16);
    const strokeG = parseInt(this.color.stroke.substring(3, 5), 16);
    const strokeB = parseInt(this.color.stroke.substring(5, 7), 16);
    outerGradient.addColorStop(
      0.75,
      `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.75)`,
    );
    outerGradient.addColorStop(
      0.9,
      `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.6)`,
    );
    outerGradient.addColorStop(
      1,
      `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.45)`,
    );

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
    const corePulse =
      Math.sin(this.animationTime * 2 + this.rotationOffset) * 0.1;
    const innerGradient = ctx.createRadialGradient(
      centerX - innerCoreRadius * 0.4,
      centerY - innerCoreRadius * 0.4,
      innerCoreRadius * 0.1,
      centerX,
      centerY,
      innerCoreRadius * (1 + corePulse),
    );
    innerGradient.addColorStop(0, `rgba(255, 255, 255, 0.7)`);
    innerGradient.addColorStop(
      0.4,
      `rgba(${String(r + 30)}, ${String(g + 30)}, ${String(b + 30)}, 0.5)`,
    );
    innerGradient.addColorStop(
      0.7,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.4)`,
    );
    innerGradient.addColorStop(
      1,
      `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.2)`,
    );

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
      const patternRadius =
        currentRadius * (0.4 + Math.sin(this.animationTime * 1.5 + i) * 0.1);
      const patternX = Math.cos(angle) * patternRadius;
      const patternY = Math.sin(angle) * patternRadius;
      const patternSize =
        currentRadius * (0.08 + Math.sin(this.animationTime * 2 + i) * 0.03);
      const patternAlpha = 0.25 + Math.sin(this.animationTime * 2.5 + i) * 0.15;

      const patternGradient = ctx.createRadialGradient(
        patternX,
        patternY,
        0,
        patternX,
        patternY,
        patternSize,
      );
      patternGradient.addColorStop(
        0,
        `rgba(${String(r + 20)}, ${String(g + 20)}, ${String(b + 20)}, ${String(patternAlpha)})`,
      );
      patternGradient.addColorStop(
        0.5,
        `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(patternAlpha * 0.6)})`,
      );
      patternGradient.addColorStop(
        1,
        `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`,
      );

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
      const tentacleLength =
        currentRadius * (0.25 + Math.sin(this.animationTime * 2 + i) * 0.1);
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
      tentacleGradient.addColorStop(
        0,
        `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.6)`,
      );
      tentacleGradient.addColorStop(
        0.5,
        `rgba(${String(r + 15)}, ${String(g + 15)}, ${String(b + 15)}, 0.5)`,
      );
      tentacleGradient.addColorStop(
        1,
        `rgba(${String(r + 30)}, ${String(g + 30)}, ${String(b + 30)}, 0.4)`,
      );

      ctx.strokeStyle = tentacleGradient;
      ctx.lineWidth = Math.floor(tentacleWidth);
      ctx.lineCap = 'square';
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
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
      tipGlow.addColorStop(
        0,
        `rgba(${String(r + 40)}, ${String(g + 40)}, ${String(b + 40)}, 0.8)`,
      );
      tipGlow.addColorStop(
        0.5,
        `rgba(${String(r + 20)}, ${String(g + 20)}, ${String(b + 20)}, 0.5)`,
      );
      tipGlow.addColorStop(
        1,
        `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0)`,
      );

      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tentacleTipX, tentacleTipY, tentacleWidth * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Enhanced glossy highlight - Lordakia reflective gel surface
    const highlightSize = currentRadius * 0.4;
    const highlightAlpha =
      0.6 + Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.1;

    // Main highlight
    const highlightX1 = -currentRadius * 0.35;
    const highlightY1 = -currentRadius * 0.35;
    ctx.fillStyle = `rgba(255, 255, 255, ${String(highlightAlpha)})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(highlightX1, highlightY1, highlightSize, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Secondary smaller highlight for extra gloss
    const highlightX2 = -currentRadius * 0.25;
    const highlightY2 = -currentRadius * 0.25;
    const highlightSize2 = highlightSize * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${String(highlightAlpha * 0.5)})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(highlightX2, highlightY2, highlightSize2, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();

    // Gel-like border outline
    ctx.strokeStyle = `rgba(${String(strokeR)}, ${String(strokeG)}, ${String(strokeB)}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.restore();
    ctx.stroke();

    // Draw speech bubble if visible
    if (this.speechBubbleVisible && this.currentHp > 0) {
      this.drawSpeechBubble(
        ctx,
        centerX,
        centerY,
        Math.max(deformedRadiusX, deformedRadiusY),
      );
    }

    // Health bar (bubble integrity) - position relative to deformed center
    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 6;
    const hpBarY = centerY - Math.max(deformedRadiusX, deformedRadiusY) - 18;
    const hpBarX = centerX - hpBarWidth / 2;
    const hpPercent = this.currentHp / this.maxHp;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    // Health fill - color changes based on bubble integrity
    let fillColor = '#00ff00'; // Fresh bubble
    if (hpPercent < 0.3)
      fillColor = '#ff0000'; // About to pop!
    else if (hpPercent < 0.6) fillColor = '#ffaa00'; // Damaged

    ctx.fillStyle = fillColor;
    const fillWidth = hpBarWidth * hpPercent;
    ctx.fillRect(hpBarX, hpBarY, fillWidth, hpBarHeight);

    // No border - removed container

    // Simple flash effect when damaged
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      const flashRadius =
        Math.max(deformedRadiusX, deformedRadiusY) *
        (1 + (1 - flashAlpha) * 0.2);

      drawer.setAlpha(flashAlpha * 0.6);
      drawer.setStroke(
        `rgba(${String(r)}, ${String(g)}, ${String(b)}, 0.9)`,
        4,
      );
      drawer.circle(centerX, centerY, flashRadius, false);

      drawer.resetAlpha();
    }
  }
}
