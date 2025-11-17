interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  active: boolean;
}

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
  private stars: Star[] = [];
  private comets: Comet[] = [];
  private meteorites: Meteorite[] = [];
  private time = 0;
  private width: number;
  private height: number;
  private cometSpawnTimer = 0;
  private meteoriteSpawnTimer = 0;
  private meteoriteSpawnInterval = 16; // Spawn a meteorite every 16 seconds on average (reduced spawn rate)
  private meteoriteImage: HTMLImageElement | null = null;
  private meteoriteImageLoaded = false;

  private starCanvas: HTMLCanvasElement | null = null;
  private starCtx: CanvasRenderingContext2D | null = null;
  private lastStarUpdate = 0;
  private starUpdateInterval = 0.05;


  // Note: Background GIF is now handled by CSS on #game-container
  // This allows the GIF to animate properly


  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
    this.createStarCanvas();
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

  private initStars(): void {
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  private createStarCanvas(): void {
    this.starCanvas = document.createElement('canvas');
    this.starCanvas.width = this.width;
    this.starCanvas.height = this.height;

    // Enable GPU acceleration for off-screen canvas
    this.starCanvas.style.willChange = 'transform';

    // Request GPU-accelerated context
    this.starCtx = this.starCanvas.getContext('2d', {
      // GPU-friendly settings (willReadFrequently defaults to false)
    } as CanvasRenderingContext2DSettings);

    if (this.starCtx) {
      // Optimize for GPU
      this.starCtx.imageSmoothingEnabled = true;
      this.starCtx.imageSmoothingQuality = 'high';
    }

  }

  private spawnComet(): void {
    const side = Math.floor(Math.random() * 4);
    let x = 0,
      y = 0,
      vx = 0,
      vy = 0;

    switch (side) {
      case 0: // Top
        x = Math.random() * this.width;
        y = -10;
        vx = (Math.random() - 0.5) * 100;
        vy = Math.random() * 150 + 100;
        break;
      case 1:
        x = this.width + 10;
        y = Math.random() * this.height;
        vx = -(Math.random() * 150 + 100);
        vy = (Math.random() - 0.5) * 100;
        break;
      case 2:
        x = Math.random() * this.width;
        y = this.height + 10;
        vx = (Math.random() - 0.5) * 100;
        vy = -(Math.random() * 150 + 100);
        break;
      case 3:
        x = -10;
        y = Math.random() * this.height;
        vx = Math.random() * 150 + 100;
        vy = (Math.random() - 0.5) * 100;
        break;
    }

    this.comets.push({
      x,
      y,
      vx,
      vy,
      length: Math.random() * 40 + 30,
      active: true,
    });
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.initStars();
    this.createStarCanvas();
    
    // Clear meteorites on resize (they'll respawn naturally)
    this.meteorites = [];
    this.meteoriteSpawnTimer = 0;

    // Theme effects removed - background is now handled by CSS GIF
  }

  public update(dt: number): void {
    this.time += dt;
    this.lastStarUpdate += dt;

    if (this.lastStarUpdate >= this.starUpdateInterval) {
      for (const star of this.stars) {
        star.y += star.speed * this.lastStarUpdate * 10;
        if (star.y > this.height + 10) {
          star.y = -10;
          star.x = Math.random() * this.width;
        }
      }
      this.lastStarUpdate = 0;
    }

    this.cometSpawnTimer += dt;
    if (this.cometSpawnTimer > 15 && this.comets.length < 3) {
      this.spawnComet();
      this.cometSpawnTimer = 0;
    }

    for (const comet of this.comets) {
      if (!comet.active) continue;

      comet.x += comet.vx * dt;
      comet.y += comet.vy * dt;

      if (
        comet.x < -100 ||
        comet.x > this.width + 100 ||
        comet.y < -100 ||
        comet.y > this.height + 100
      ) {
        comet.active = false;
      }
    }

    this.comets = this.comets.filter((c) => c.active);

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
