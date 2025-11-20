import type { Draw } from '../render/Draw';
import type { Vec2, BallColor } from '../types';
import { ColorManager } from '../math/ColorManager';
import { getSpriteForType, PixelGrid } from '../render/AlienSprites';

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

  // New visual effects
  protected shakeTime = 0;
  protected shakeIntensity = 0;

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

  protected drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
  ): void {
    if (!this.speechBubbleDisplayedText) return;

    // Save canvas state to ensure proper rendering order
    ctx.save();

    // Calculate fade out animation (fade out in last 0.5 seconds)
    // Only fade out if typing is complete
    let opacity = 1;
    if (this.typingProgress >= 1 && this.speechBubbleHideTime > 0) {
      const timeUntilHide = this.speechBubbleHideTime - this.lifetime;
      const fadeDuration = 0.5; // seconds
      if (timeUntilHide <= fadeDuration && timeUntilHide > 0) {
        opacity = timeUntilHide / fadeDuration;
      } else if (timeUntilHide <= 0) {
        ctx.restore();
        return; // Don't draw if completely faded
      }
    }

    // Position bubble to the side and above the alien
    // Make sure it's high enough to avoid HP bar (HP bar is at centerY - spriteHeight/2 - 18)
    // Position bubble higher to ensure it's always above HP bar
    const bubbleOffsetX =
      this.speechBubbleSide === 'left'
        ? -(radius + 50) // Left side
        : radius + 50; // Right side
    // Position higher to avoid HP bar overlap (HP bar is ~18px above sprite top)
    // Add extra space for bubble height and tail
    const bubbleOffsetY = -(radius + 60); // Higher up to avoid HP bar

    const bubbleX = x + bubbleOffsetX;
    const bubbleY = y + bubbleOffsetY;

    // Measure text to size bubble (handle multi-line text)
    ctx.font = '20px "m5x7", "Courier New", monospace';
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
    const lineHeight = 20;
    const textWidth = maxWidth;
    const textHeight =
      lineHeight * lines.length +
      (lines.length > 1 ? (lines.length - 1) * 2 : 0); // Line height * lines + spacing

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

    // Draw bubble background with opacity (dark interior like game UI)
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.85})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 2;

    // Draw speech bubble path with tail
    ctx.beginPath();
    const r = cornerRadius;
    const bX = bubbleXPos;
    const bY = bubbleYPos;
    const bW = bubbleWidth;
    const bH = bubbleHeight;

    // Start at top-left
    ctx.moveTo(bX + r, bY);

    // Top edge
    ctx.lineTo(bX + bW - r, bY);
    // Top-right corner (chamfered)
    ctx.lineTo(bX + bW, bY + r);

    // Right edge
    ctx.lineTo(bX + bW, bY + bH - r);
    // Bottom-right corner (chamfered)
    ctx.lineTo(bX + bW - r, bY + bH);

    // Bottom edge with tail
    if (this.speechBubbleSide === 'left') {
      // Bubble is on left, alien is on right -> Tail on bottom-right
      const tailBaseRight = bX + bW - 15;
      const tailBaseLeft = bX + bW - 35;
      const tailTipX = bX + bW + 5; // Point towards alien
      const tailTipY = bY + bH + 15;

      ctx.lineTo(tailBaseRight, bY + bH);
      ctx.lineTo(tailTipX, tailTipY);
      ctx.lineTo(tailBaseLeft, bY + bH);
    } else {
      // Normal line for this section if tail is on other side
      // We handle the other tail in the next segment?
      // No, we are drawing the bottom edge from right to left.
      // If side is 'right', tail is on bottom-left.

      if (this.speechBubbleSide === 'right') {
        const tailBaseRight = bX + 35;
        const tailBaseLeft = bX + 15;
        const tailTipX = bX - 5; // Point towards alien
        const tailTipY = bY + bH + 15;

        ctx.lineTo(tailBaseRight, bY + bH);
        ctx.lineTo(tailTipX, tailTipY);
        ctx.lineTo(tailBaseLeft, bY + bH);
      }
    }

    // Finish bottom edge to left corner
    ctx.lineTo(bX + r, bY + bH);
    // Bottom-left corner (chamfered)
    ctx.lineTo(bX, bY + bH - r);

    // Left edge
    ctx.lineTo(bX, bY + r);
    // Top-left corner (chamfered)
    ctx.lineTo(bX + r, bY);

    ctx.closePath();

    // Fill and stroke the unified path
    ctx.fill();
    ctx.stroke();

    // Draw typing cursor if still typing (blinking effect)
    const showCursor =
      this.typingProgress < 1 && Math.floor(this.animationTime * 3) % 2 === 0;
    const cursorChar = showCursor ? '_' : '';
    const displayText = this.speechBubbleDisplayedText + cursorChar;

    // Draw text (white text on dark background like game UI) - handle multi-line
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.textBaseline = 'top';
    const textLines = displayText.split('\n').filter((line) => line.length > 0);
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

    // Restore canvas state
    ctx.restore();
  }

  protected adjustColor(color: string, amount: number): string {
    if (!color.startsWith('#')) return color;
    const num = parseInt(color.slice(1), 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00ff) + amount;
    let b = (num & 0x0000ff) + amount;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  private static bufferCanvas: HTMLCanvasElement | null = null;
  private static bufferCtx: CanvasRenderingContext2D | null = null;

  private static getBuffer(
    width: number,
    height: number,
  ): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!AlienBall.bufferCanvas) {
      AlienBall.bufferCanvas = document.createElement('canvas');
      AlienBall.bufferCtx = AlienBall.bufferCanvas.getContext('2d', {
        willReadFrequently: false,
      })!;
    }

    // Resize if necessary (grow only to avoid thrashing)
    if (
      AlienBall.bufferCanvas.width < width ||
      AlienBall.bufferCanvas.height < height
    ) {
      AlienBall.bufferCanvas.width = Math.max(
        AlienBall.bufferCanvas.width,
        Math.ceil(width),
      );
      AlienBall.bufferCanvas.height = Math.max(
        AlienBall.bufferCanvas.height,
        Math.ceil(height),
      );
    }

    return { canvas: AlienBall.bufferCanvas, ctx: AlienBall.bufferCtx! };
  }

  protected drawPixelSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    sprite: PixelGrid,
    color: string,
    opacity: number = 1,
  ): void {
    const rows = sprite.length;
    if (rows === 0) return;
    const firstRow = sprite[0];
    if (!firstRow) return;
    const cols = firstRow.length;
    const pixelW = width / cols;
    const pixelH = height / rows;

    const startX = x - width / 2;
    const startY = y - height / 2;

    // Use a buffer to draw the semi-transparent body parts as a single coherent shape
    // This prevents internal "grid lines" where semi-transparent pixels overlap
    const { canvas: buffer, ctx: bCtx } = AlienBall.getBuffer(width, height);

    // Clear buffer
    bCtx.clearRect(0, 0, width, height);

    // First pass: Draw body (Type 1) to buffer at full opacity
    bCtx.fillStyle = color;
    let hasBody = false;

    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        if (row[c] === 1) {
          // Body
          // Draw with slight overlap to prevent gaps
          bCtx.fillRect(c * pixelW, r * pixelH, pixelW + 0.5, pixelH + 0.5);
          hasBody = true;
        }
      }
    }

    if (hasBody) {
      ctx.save();
      ctx.globalAlpha = opacity * 0.4; // Body opacity
      // Draw the buffered body shape
      ctx.drawImage(buffer, 0, 0, width, height, startX, startY, width, height);
      ctx.restore();
    }

    // Clear buffer for next layer
    bCtx.clearRect(0, 0, width, height);

    // Second pass: Draw shade/rim (Type 2) to buffer
    const shadeColor = this.adjustColor(color, -60);
    bCtx.fillStyle = shadeColor;
    let hasShade = false;

    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        if (row[c] === 2) {
          // Shade
          bCtx.fillRect(c * pixelW, r * pixelH, pixelW + 0.5, pixelH + 0.5);
          hasShade = true;
        }
      }
    }

    if (hasShade) {
      ctx.save();
      ctx.globalAlpha = opacity * 0.6; // Shade opacity
      ctx.drawImage(buffer, 0, 0, width, height, startX, startY, width, height);
      ctx.restore();
    }

    // Highlights (Type 3) and Eyes (Type 4) are drawn directly for sharpness
    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        const pixelType = row[c];
        if (pixelType === 3) {
          // Highlight - bright white and opaque
          ctx.save();
          ctx.globalAlpha = opacity * 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(
            startX + c * pixelW,
            startY + r * pixelH,
            pixelW + 0.5,
            pixelH + 0.5,
          );
          ctx.restore();
        } else if (pixelType === 4) {
          // Eye - black/dark - solid
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#000000';
          ctx.fillRect(
            startX + c * pixelW,
            startY + r * pixelH,
            pixelW + 0.5,
            pixelH + 0.5,
          );
          ctx.restore();
        }
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

    // Enhanced squash and stretch effect
    const squashAmount = deformationAmount * 0.25; // Increased from 0.15
    const stretchAmount = deformationAmount * 0.2; // Increased from 0.1

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

    const centerX =
      this.x +
      deformationX +
      (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);
    const centerY =
      this.y +
      deformationY +
      (Math.random() - 0.5) * (this.shakeTime > 0 ? this.shakeIntensity : 0);

    // Subtle pulsing animation
    const pulseValue =
      Math.sin(this.animationTime * 1.5 + this.rotationOffset) * 0.02;
    const currentRadius = this.radius * (1 + pulseValue);

    const spriteWidth = currentRadius * 2 * scaleX;
    const spriteHeight = currentRadius * 2 * scaleY;

    // Draw pixel sprite (default normal)
    const sprite = getSpriteForType('normal');
    this.drawPixelSprite(
      ctx,
      centerX,
      centerY,
      spriteWidth,
      spriteHeight,
      sprite,
      this.color.fill,
    );

    // Health bar (bubble integrity) - position relative to deformed center
    // Draw HP bar before speech bubble so bubble appears on top
    const hpBarWidth = this.radius * 2;
    const hpBarHeight = 6;
    const hpBarY = centerY - spriteHeight / 2 - 18;
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

    // Draw speech bubble if visible (after HP bar so it appears on top)
    if (this.speechBubbleVisible && this.currentHp > 0) {
      this.drawSpeechBubble(
        ctx,
        centerX,
        centerY,
        Math.max(spriteWidth, spriteHeight) / 2,
      );
    }

    // Simple flash effect when damaged
    if (this.flashTime > 0) {
      const flashAlpha = this.flashTime / this.flashDuration;
      this.drawPixelSprite(
        ctx,
        centerX,
        centerY,
        spriteWidth,
        spriteHeight,
        sprite,
        '#ffffff',
        flashAlpha * 0.7,
      );
    }
  }
}
