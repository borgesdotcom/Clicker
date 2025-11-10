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

  // Theme colors - initialized to default visible values
  private backgroundColor: string = '#000000';
  private starColor: string = '#ffffff';
  private cometColor: string = '#96beff';
  private currentThemeId: string = 'default_background';

  // Nebula clouds for nebula theme
  private nebulaClouds: Array<{
    x: number;
    y: number;
    radius: number;
    color1: number; // Hue value for HSL
    color2: number; // Hue value for HSL
    lightness1: number; // Lightness for color1
    lightness2: number; // Lightness for color2
    pulse: number;
    pulseSpeed: number;
  }> = [];

  // Void effects for void theme
  private voidPortals: Array<{
    x: number;
    y: number;
    radius: number;
    rotation: number;
    pulse: number;
  }> = [];

  private energyOrbs: Array<{
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    pulse: number;
  }> = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
    this.createStarCanvas();
  }

  /**
   * Set theme colors for background
   */
  setThemeColors(
    colors: { primary: string; secondary: string },
    themeId?: string,
  ): void {
    this.backgroundColor = colors.primary;
    this.starColor = colors.secondary ?? '#ffffff';
    this.cometColor = colors.secondary ?? '#96beff';

    // Track theme ID for special effects
    if (themeId) {
      this.currentThemeId = themeId;

      // Initialize theme-specific effects
      if (themeId === 'nebula_background' && this.nebulaClouds.length === 0) {
        this.initNebulaClouds();
      } else if (
        themeId === 'void_background' &&
        this.voidPortals.length === 0
      ) {
        this.initVoidEffects();
      }
    }

    this.starLayerDirty = true; // Force redraw with new colors
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

    // Keep starLayerDirty = true so initial render happens with theme colors
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

    // Reinitialize theme effects if needed
    if (this.currentThemeId === 'nebula_background') {
      this.nebulaClouds = [];
      this.initNebulaClouds();
    } else if (this.currentThemeId === 'void_background') {
      this.voidPortals = [];
      this.energyOrbs = [];
      this.initVoidEffects();
    }
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

    // Update theme-specific effects
    if (this.currentThemeId === 'nebula_background') {
      this.updateNebulaClouds(dt);
    } else if (this.currentThemeId === 'void_background') {
      this.updateVoidEffects(dt);
    }
  }

  private renderStarLayer(): void {
    if (!this.starCtx || !this.starCanvas) return;

    // Use theme background color
    this.starCtx.fillStyle = this.backgroundColor;
    this.starCtx.fillRect(0, 0, this.starCanvas.width, this.starCanvas.height);

    // Render theme-specific base layers
    if (this.currentThemeId === 'nebula_background') {
      this.renderNebulaBase(this.starCtx);
    } else if (this.currentThemeId === 'void_background') {
      this.renderVoidBase(this.starCtx);
    }

    const starRgb = this.hexToRgb(this.starColor);

    // Ensure minimum brightness for visibility (especially for dark themes like void)
    const minBrightness = 0.15; // Minimum 15% opacity so stars are always visible

    for (const star of this.stars) {
      const twinkle = Math.sin(
        this.time * star.twinkleSpeed + star.twinkleOffset,
      );
      const brightness = Math.max(
        minBrightness,
        star.brightness + twinkle * 0.3,
      );

      // For nebula theme, use varied star colors
      let starColor = starRgb;
      if (this.currentThemeId === 'nebula_background') {
        // Varied colors for nebula stars (red, blue, yellow, purple)
        const colorIndex = Math.floor((star.x + star.y) * 0.1) % 4;
        if (colorIndex === 0)
          starColor = [255, 150, 150]; // Red
        else if (colorIndex === 1)
          starColor = [150, 200, 255]; // Blue
        else if (colorIndex === 2)
          starColor = [255, 255, 150]; // Yellow
        else starColor = [200, 150, 255]; // Purple
      }

      // Use theme star color with ensured visibility
      this.starCtx.fillStyle = `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${String(brightness)})`;
      this.starCtx.beginPath();
      this.starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.starCtx.fill();

      if (star.size > 1.5 && Math.floor(this.time * 30) % 2 === 0) {
        const haloBrightness = Math.max(minBrightness * 0.3, brightness * 0.3);
        this.starCtx.fillStyle = `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${String(haloBrightness)})`;
        this.starCtx.beginPath();
        this.starCtx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        this.starCtx.fill();
      }
    }
  }

  private initNebulaClouds(): void {
    this.nebulaClouds = [];
    for (let i = 0; i < 8; i++) {
      const hue1 = 240 + Math.random() * 60;
      const hue2 = 280 + Math.random() * 40;
      const lightness1 = 30 + Math.random() * 20;
      const lightness2 = 20 + Math.random() * 15;
      this.nebulaClouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 80 + Math.random() * 120,
        color1: hue1, // Store hue for HSL conversion
        color2: hue2, // Store hue for HSL conversion
        lightness1,
        lightness2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 0.5,
      });
    }
  }

  private initVoidEffects(): void {
    // Initialize void portals (mysterious energy rifts)
    this.voidPortals = [];
    for (let i = 0; i < 4; i++) {
      this.voidPortals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 40 + Math.random() * 60,
        rotation: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Initialize energy orbs (floating void energy)
    this.energyOrbs = [];
    for (let i = 0; i < 6; i++) {
      this.energyOrbs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 8 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  private updateNebulaClouds(dt: number): void {
    for (const cloud of this.nebulaClouds) {
      cloud.pulse += cloud.pulseSpeed * dt;
      // Slow drift
      cloud.x += Math.sin(cloud.pulse * 0.5) * 5 * dt;
      cloud.y += Math.cos(cloud.pulse * 0.3) * 3 * dt;

      // Wrap around edges
      if (cloud.x < -cloud.radius) cloud.x = this.width + cloud.radius;
      if (cloud.x > this.width + cloud.radius) cloud.x = -cloud.radius;
      if (cloud.y < -cloud.radius) cloud.y = this.height + cloud.radius;
      if (cloud.y > this.height + cloud.radius) cloud.y = -cloud.radius;
    }
  }

  private updateVoidEffects(dt: number): void {
    for (const portal of this.voidPortals) {
      portal.rotation += 0.3 * dt;
      portal.pulse += 0.8 * dt;
    }

    for (const orb of this.energyOrbs) {
      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;
      orb.pulse += 1.5 * dt;

      // Bounce off edges or wrap
      if (orb.x < 0 || orb.x > this.width) orb.vx *= -1;
      if (orb.y < 0 || orb.y > this.height) orb.vy *= -1;

      // Keep in bounds
      orb.x = Math.max(0, Math.min(this.width, orb.x));
      orb.y = Math.max(0, Math.min(this.height, orb.y));
    }
  }

  private renderNebulaBase(ctx: CanvasRenderingContext2D): void {
    // Render colorful nebula clouds
    for (const cloud of this.nebulaClouds) {
      const pulseValue = (Math.sin(cloud.pulse) + 1) * 0.5;
      const currentRadius = cloud.radius * (0.8 + pulseValue * 0.2);

      const gradient = ctx.createRadialGradient(
        cloud.x,
        cloud.y,
        0,
        cloud.x,
        cloud.y,
        currentRadius,
      );
      // Use hsla() format with proper opacity values
      gradient.addColorStop(
        0,
        `hsla(${Math.round(cloud.color1)}, 70%, ${Math.round(cloud.lightness1)}%, 0.5)`,
      );
      gradient.addColorStop(
        0.5,
        `hsla(${Math.round(cloud.color2)}, 60%, ${Math.round(cloud.lightness2)}%, 0.25)`,
      );
      gradient.addColorStop(
        1,
        `hsla(${Math.round(cloud.color2)}, 60%, ${Math.round(cloud.lightness2)}%, 0)`,
      );

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderVoidBase(ctx: CanvasRenderingContext2D): void {
    // Render void portals (dark energy rifts)
    for (const portal of this.voidPortals) {
      const pulseValue = (Math.sin(portal.pulse) + 1) * 0.5;
      const radius = portal.radius * (0.9 + pulseValue * 0.1);

      ctx.save();
      ctx.translate(portal.x, portal.y);
      ctx.rotate(portal.rotation);

      // Outer glow
      const outerGradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        radius * 1.5,
      );
      outerGradient.addColorStop(0, 'rgba(51, 51, 102, 0.4)');
      outerGradient.addColorStop(0.7, 'rgba(51, 51, 102, 0.1)');
      outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Portal ring
      ctx.strokeStyle = `rgba(102, 51, 153, ${0.3 + pulseValue * 0.4})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dark void
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Rotating energy lines
      ctx.strokeStyle = `rgba(153, 102, 204, ${0.2 + pulseValue * 0.3})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + portal.rotation * 2;
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * radius * 0.7,
          Math.sin(angle) * radius * 0.7,
        );
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1] ?? '0', 16),
          parseInt(result[2] ?? '0', 16),
          parseInt(result[3] ?? '0', 16),
        ]
      : [255, 255, 255];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.starLayerDirty && this.starCtx && this.starCanvas) {
      this.renderStarLayer();
      this.starLayerDirty = false;
    }

    if (this.starCanvas) {
      ctx.drawImage(this.starCanvas, 0, 0);
    }

    // Render theme-specific overlay effects
    if (this.currentThemeId === 'nebula_background') {
      this.renderNebulaOverlay(ctx);
    } else if (this.currentThemeId === 'void_background') {
      this.renderVoidOverlay(ctx);
    }

    for (const comet of this.comets) {
      if (!comet.active) continue;

      const angle = Math.atan2(comet.vy, comet.vx);
      const tailX = comet.x - Math.cos(angle) * comet.length;
      const tailY = comet.y - Math.sin(angle) * comet.length;

      // Use theme comet color
      const cometRgb = this.hexToRgb(this.cometColor);
      ctx.strokeStyle = `rgba(${cometRgb[0]}, ${cometRgb[1]}, ${cometRgb[2]}, 0.7)`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(comet.x, comet.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = `rgba(${cometRgb[0]}, ${cometRgb[1]}, ${cometRgb[2]}, 1)`;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${cometRgb[0]}, ${cometRgb[1]}, ${cometRgb[2]}, 0.4)`;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderNebulaOverlay(ctx: CanvasRenderingContext2D): void {
    // Additional colorful wisps and highlights
    for (let i = 0; i < 5; i++) {
      const wispX = (this.width / 6) * (i + 1);
      const wispY = this.height * (0.2 + (i % 3) * 0.3);
      const wispPulse = Math.sin(this.time * 0.8 + i) * 0.5 + 0.5;

      const wispGradient = ctx.createRadialGradient(
        wispX,
        wispY,
        0,
        wispX,
        wispY,
        150,
      );
      const hue = 260 + i * 15;
      // Use hsla() format with proper opacity values (0-1 range)
      wispGradient.addColorStop(
        0,
        `hsla(${hue}, 70%, 50%, ${(0.3 * wispPulse).toFixed(3)})`,
      );
      wispGradient.addColorStop(1, `hsla(${hue}, 60%, 30%, 0)`);

      ctx.fillStyle = wispGradient;
      ctx.beginPath();
      ctx.arc(wispX, wispY, 150, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderVoidOverlay(ctx: CanvasRenderingContext2D): void {
    // Render floating energy orbs
    for (const orb of this.energyOrbs) {
      const pulseValue = (Math.sin(orb.pulse) + 1) * 0.5;
      const currentRadius = orb.radius * (0.8 + pulseValue * 0.2);

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        currentRadius * 3,
      );
      glowGradient.addColorStop(0, 'rgba(102, 51, 153, 0.6)');
      glowGradient.addColorStop(0.5, 'rgba(51, 51, 102, 0.3)');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, currentRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core orb
      ctx.fillStyle = `rgba(153, 102, 204, ${0.8 + pulseValue * 0.2})`;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright center
      ctx.fillStyle = `rgba(204, 153, 255, ${0.9 + pulseValue * 0.1})`;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, currentRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
