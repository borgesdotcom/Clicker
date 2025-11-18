interface Meteorite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  active: boolean;
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
    this.meteoriteImage.src = new URL('../animations/Asteroid 01 - Base.png', import.meta.url).href;
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
    });
  }



  public render(ctx: CanvasRenderingContext2D): void {
    // Background is now handled by CSS background-image on #game-container
    // which properly animates GIFs. Canvas is transparent so the GIF shows through.
    // Render meteorites as overlay effect
    
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
        
        // Draw meteorite with opacity for depth effect
        ctx.globalAlpha = 0.7;
        const halfSize = meteorite.size / 2;
        ctx.drawImage(
          this.meteoriteImage,
          -halfSize,
          -halfSize,
          meteorite.size,
          meteorite.size,
        );
        
        ctx.restore();
        ctx.globalAlpha = 1.0;
      }
    }
  }
}
