interface Meteorite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  active: boolean;
  clickable: boolean; // Whether this meteor can be clicked
  clicking: boolean; // Animation state when clicked
  clickTime: number; // Time since click for animation
  clicks: number; // Current clicks received
  maxClicks: number; // Clicks required to destroy
}

export class Background {
  private meteorites: Meteorite[] = [];
  private width: number;
  private height: number;
  private meteoriteSpawnTimer = 0;
  private meteoriteSpawnInterval = 16; // Spawn a meteorite every 16 seconds on average
  private meteoriteImage: HTMLImageElement | null = null;
  private meteoriteImageLoaded = false;

  // Note: Background GIF is now handled by CSS on #game-container
  // This allows the GIF to animate properly

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.loadMeteoriteSprite();
    // Background GIF is now set via CSS on #game-container for proper animation
  }

  /**
   * Load the meteorite sprite image
   */
  private loadMeteoriteSprite(): void {
    this.meteoriteImage = new Image();
    this.meteoriteImage.onload = () => {
      this.meteoriteImageLoaded = true;
    };
    this.meteoriteImage.onerror = () => {
      console.warn('Failed to load meteorite sprite');
      this.meteoriteImageLoaded = false;
    };
    // Use new URL() for dynamic asset path resolution
    // Note: new URL() doesn't understand Vite aliases, so we use relative path
    this.meteoriteImage.src = new URL(
      '../animations/Asteroid 01 - Base.png',
      import.meta.url,
    ).href;
  }

  /**
   * Set theme colors for background (no-op since background is now handled by CSS GIF)
   */
  setThemeColors(
    _colors: { primary: string; secondary: string },
    _themeId?: string,
  ): void {
    // Background is now handled by CSS background-image on #game-container
    // This method is kept for API compatibility but does nothing
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    // Clear meteorites on resize (they'll respawn naturally)
    this.meteorites = [];
    this.meteoriteSpawnTimer = 0;
  }

  public update(dt: number): void {
    // Update meteorites
    this.meteoriteSpawnTimer += dt;
    if (this.meteoriteSpawnTimer >= this.meteoriteSpawnInterval) {
      // Randomize next spawn time (10-24 seconds) - reduced spawn rate by 50%
      this.meteoriteSpawnInterval = 10 + Math.random() * 14;
      this.meteoriteSpawnTimer = 0;
      this.spawnMeteorite();
    }

    // Update active meteorites
    for (const meteorite of this.meteorites) {
      if (!meteorite.active) continue;

      meteorite.x += meteorite.vx * dt;
      meteorite.y += meteorite.vy * dt;
      meteorite.rotation += meteorite.rotationSpeed * dt;

      // Update click animation
      if (meteorite.clicking) {
        meteorite.clickTime += dt;
        // Deactivate after animation completes (0.3 seconds)
        if (meteorite.clickTime >= 0.3) {
          meteorite.active = false;
        }
      }

      // Remove if off screen
      if (
        meteorite.x < -200 ||
        meteorite.x > this.width + 200 ||
        meteorite.y < -200 ||
        meteorite.y > this.height + 200
      ) {
        meteorite.active = false;
      }
    }

    this.meteorites = this.meteorites.filter((m) => m.active);
  }

  /**
   * Spawn a new meteorite from random edge
   */
  private spawnMeteorite(): void {
    const side = Math.floor(Math.random() * 4);
    let x = 0,
      y = 0,
      vx = 0,
      vy = 0;

    // Spawn from random edge and move diagonally
    switch (side) {
      case 0: // Top
        x = Math.random() * this.width;
        y = -100;
        vx = (Math.random() - 0.5) * 80;
        vy = Math.random() * 120 + 80;
        break;
      case 1: // Right
        x = this.width + 100;
        y = Math.random() * this.height;
        vx = -(Math.random() * 120 + 80);
        vy = (Math.random() - 0.5) * 80;
        break;
      case 2: // Bottom
        x = Math.random() * this.width;
        y = this.height + 100;
        vx = (Math.random() - 0.5) * 80;
        vy = -(Math.random() * 120 + 80);
        break;
      case 3: // Left
        x = -100;
        y = Math.random() * this.height;
        vx = Math.random() * 120 + 80;
        vy = (Math.random() - 0.5) * 80;
        break;
    }

    this.meteorites.push({
      x,
      y,
      vx,
      vy,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2, // Random rotation speed
      size: Math.random() * 80 + 40, // Size between 40-120px for more variety
      active: true,
      clickable: true,
      clicking: false,
      clickTime: 0,
      clicks: 0,
      maxClicks: 3, // Require 3 clicks to destroy
    });
  }

  /**
   * Check if a click hits a meteorite
   * Returns the meteorite if hit, null otherwise
   */
  public checkMeteoriteClick(x: number, y: number): Meteorite | null {
    for (const meteorite of this.meteorites) {
      if (!meteorite.active || !meteorite.clickable || meteorite.clicking) continue;

      const dx = meteorite.x - x;
      const dy = meteorite.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = meteorite.size / 2;

      if (distance <= hitRadius) {
        return meteorite;
      }
    }
    return null;
  }

  /**
   * Mark a meteorite as clicked and start destruction animation
   * Returns true if destroyed, false if just damaged
   */
  public clickMeteorite(meteorite: Meteorite): boolean {
    meteorite.clicks++;

    if (meteorite.clicks >= meteorite.maxClicks) {
      meteorite.clicking = true;
      meteorite.clickable = false;
      meteorite.clickTime = 0;
      return true;
    } else {
      // Visual feedback for non-fatal click (shake/flash)
      // We can implement a simple shake by adding a small offset or rotation bump
      meteorite.rotationSpeed += 5; // Spin faster when hit
      return false;
    }
  }

  public render(ctx: CanvasRenderingContext2D, highGraphics: boolean = true): void {
    // Background is now handled by CSS background-image on #game-container
    // which properly animates GIFs. Canvas is transparent so the GIF shows through.
    // Render meteorites as overlay effect

    // Skip meteorites if low graphics mode enabled
    if (!highGraphics) {
      return;
    }

    // Render meteorites
    if (this.meteoriteImageLoaded && this.meteoriteImage) {
      for (const meteorite of this.meteorites) {
        if (!meteorite.active) continue;

        ctx.save();

        // Move to meteorite position and rotate
        ctx.translate(meteorite.x, meteorite.y);
        ctx.rotate(meteorite.rotation);

        // Enable pixelated rendering for sprite
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'low';

        // Click animation: shrink and fade out
        let scale = 1;
        let alpha = 0.7;
        if (meteorite.clicking) {
          const progress = meteorite.clickTime / 0.3; // 0.3 second animation
          scale = 1 - progress * 0.5; // Shrink to 50%
          alpha = (1 - progress) * 0.7; // Fade out

          // Add explosion glow
          ctx.shadowBlur = 30 * (1 - progress);
          ctx.shadowColor = '#ff8800';
        }

        // Draw meteorite with opacity for depth effect
        ctx.globalAlpha = alpha;
        const halfSize = (meteorite.size * scale) / 2;
        ctx.drawImage(
          this.meteoriteImage,
          -halfSize,
          -halfSize,
          meteorite.size * scale,
          meteorite.size * scale,
        );

        ctx.restore();
        ctx.globalAlpha = 1.0;
      }
    }
  }
}
