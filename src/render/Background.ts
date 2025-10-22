interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
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
  private nebulae: Nebula[] = [];
  private comets: Comet[] = [];
  private time = 0;
  private width: number;
  private height: number;
  private cometSpawnTimer = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
    this.initNebulae();
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

  private initNebulae(): void {
    const nebulaColors = [
      'rgba(138, 43, 226, 0.15)', // Purple
      'rgba(0, 191, 255, 0.1)', // Deep Sky Blue
      'rgba(255, 20, 147, 0.12)', // Deep Pink
      'rgba(0, 255, 127, 0.08)', // Spring Green
      'rgba(255, 69, 0, 0.1)', // Red-Orange
    ];

    for (let i = 0; i < 8; i++) {
      const colorIndex = Math.floor(Math.random() * nebulaColors.length);
      this.nebulae.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 150 + 100,
        color: nebulaColors[colorIndex] ?? 'rgba(138, 43, 226, 0.3)',
        alpha: Math.random() * 0.3 + 0.2,
        pulseSpeed: Math.random() * 0.5 + 0.3,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  private spawnComet(): void {
    // Random edge spawn
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0, vx = 0, vy = 0;

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
    this.nebulae = [];
    this.initStars();
    this.initNebulae();
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
    // Draw nebulae (background layer)
    for (const nebula of this.nebulae) {
      const pulse = Math.sin(this.time * nebula.pulseSpeed + nebula.pulseOffset);
      const radius = nebula.radius + pulse * 20;
      const alpha = nebula.alpha + pulse * 0.05;

      const gradient = ctx.createRadialGradient(
        nebula.x,
        nebula.y,
        0,
        nebula.x,
        nebula.y,
        radius,
      );

      gradient.addColorStop(0, nebula.color.replace(/[\d.]+\)$/, `${String(alpha)})`));
      gradient.addColorStop(0.5, nebula.color.replace(/[\d.]+\)$/, `${String(alpha * 0.5)})`));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(nebula.x - radius, nebula.y - radius, radius * 2, radius * 2);
    }

    // Draw stars
    for (const star of this.stars) {
      const twinkle = Math.sin(this.time * star.twinkleSpeed + star.twinkleOffset);
      const brightness = star.brightness + twinkle * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${String(brightness)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow for larger stars
      if (star.size > 1.5) {
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

      // Comet tail gradient
      const gradient = ctx.createLinearGradient(
        comet.x,
        comet.y,
        tailX,
        tailY,
      );
      gradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
      gradient.addColorStop(0.3, 'rgba(100, 150, 255, 0.6)');
      gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

      ctx.strokeStyle = gradient;
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

      // Glow
      ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

