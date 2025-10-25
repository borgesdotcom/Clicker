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

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  private initStars(): void {
    // Create multiple layers of stars for parallax effect
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1, // Parallax speed
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  private spawnComet(): void {
    // Random edge spawn
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
      case 1: // Right
        x = this.width + 10;
        y = Math.random() * this.height;
        vx = -(Math.random() * 150 + 100);
        vy = (Math.random() - 0.5) * 100;
        break;
      case 2: // Bottom
        x = Math.random() * this.width;
        y = this.height + 10;
        vx = (Math.random() - 0.5) * 100;
        vy = -(Math.random() * 150 + 100);
        break;
      case 3: // Left
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
    // Reinitialize background elements
    this.stars = [];
    this.initStars();
  }

  public update(dt: number): void {
    this.time += dt;

    // Update stars (slow parallax movement)
    for (const star of this.stars) {
      star.y += star.speed * dt * 10;
      if (star.y > this.height + 10) {
        star.y = -10;
        star.x = Math.random() * this.width;
      }
    }

    // Update comets
    this.cometSpawnTimer += dt;
    if (this.cometSpawnTimer > 15 && this.comets.length < 3) {
      this.spawnComet();
      this.cometSpawnTimer = 0;
    }

    for (const comet of this.comets) {
      if (!comet.active) continue;

      comet.x += comet.vx * dt;
      comet.y += comet.vy * dt;

      // Deactivate if off-screen
      if (
        comet.x < -100 ||
        comet.x > this.width + 100 ||
        comet.y < -100 ||
        comet.y > this.height + 100
      ) {
        comet.active = false;
      }
    }

    // Clean up inactive comets
    this.comets = this.comets.filter((c) => c.active);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Draw stars - batch all fills together
    for (const star of this.stars) {
      const twinkle = Math.sin(
        this.time * star.twinkleSpeed + star.twinkleOffset,
      );
      const brightness = star.brightness + twinkle * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${String(brightness)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow for larger stars (reduced frequency)
      if (star.size > 1.5 && Math.floor(this.time * 30) % 2 === 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${String(brightness * 0.3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw comets
    for (const comet of this.comets) {
      if (!comet.active) continue;

      const angle = Math.atan2(comet.vy, comet.vx);
      const tailX = comet.x - Math.cos(angle) * comet.length;
      const tailY = comet.y - Math.sin(angle) * comet.length;

      // Simplified comet tail (no gradient for better performance)
      ctx.strokeStyle = 'rgba(150, 190, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(comet.x, comet.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Comet head
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Simplified glow
      ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
