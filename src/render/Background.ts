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

export class Background {
  private stars: Star[] = [];
  private comets: Comet[] = [];
  private time = 0;
  private width: number;
  private height: number;
  private cometSpawnTimer = 0;

  private starCanvas: HTMLCanvasElement | null = null;
  private starCtx: CanvasRenderingContext2D | null = null;
  private starLayerDirty = true;
  private lastStarUpdate = 0;
  private starUpdateInterval = 0.05;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
    this.createStarCanvas();
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
    
    this.starLayerDirty = true;
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
      this.starLayerDirty = true;
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
  }

  private renderStarLayer(): void {
    if (!this.starCtx || !this.starCanvas) return;

    this.starCtx.fillStyle = '#000';
    this.starCtx.fillRect(0, 0, this.starCanvas.width, this.starCanvas.height);

    for (const star of this.stars) {
      const twinkle = Math.sin(
        this.time * star.twinkleSpeed + star.twinkleOffset,
      );
      const brightness = star.brightness + twinkle * 0.3;

      this.starCtx.fillStyle = `rgba(255, 255, 255, ${String(brightness)})`;
      this.starCtx.beginPath();
      this.starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.starCtx.fill();

      if (star.size > 1.5 && Math.floor(this.time * 30) % 2 === 0) {
        this.starCtx.fillStyle = `rgba(200, 220, 255, ${String(brightness * 0.3)})`;
        this.starCtx.beginPath();
        this.starCtx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        this.starCtx.fill();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.starLayerDirty && this.starCtx && this.starCanvas) {
      this.renderStarLayer();
      this.starLayerDirty = false;
    }

    if (this.starCanvas) {
      ctx.drawImage(this.starCanvas, 0, 0);
    }

    for (const comet of this.comets) {
      if (!comet.active) continue;

      const angle = Math.atan2(comet.vy, comet.vx);
      const tailX = comet.x - Math.cos(angle) * comet.length;
      const tailY = comet.y - Math.sin(angle) * comet.length;

      ctx.strokeStyle = 'rgba(150, 190, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(comet.x, comet.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
