/**
 * Boss-Specific Visual Effects Filter
 * Each boss gets a unique WebGL-style effect that matches their vibe
 * - Colossus: Heavy impact with red tint and screen shake
 * - Swarm Queen: Toxic glitch with purple pixelation
 * - Void Construct: Dark vortex with cyan distortion
 * - Omega Core: Energy overload with chromatic aberration
 */

export type BossVariant = 0 | 1 | 2 | 3;

export class BossEffectFilter {
  private overlay: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private enabled = false;
  private currentVariant: BossVariant = 0;
  private animationFrameId: number | null = null;
  private time = 0;
  private intensity = 0; // 0 to 1 for fade in/out
  private targetIntensity = 0;
  private fadeSpeed = 2.0; // Units per second

  constructor() {
    this.createSVGFilters();
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'boss-effect-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999998;
      display: none;
      overflow: hidden;
    `;

    // Create animated canvas layer
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.overlay.appendChild(this.canvas);
    document.body.appendChild(this.overlay);

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.addStyles();
  }

  private createSVGFilters(): void {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position: absolute; width: 0; height: 0;';
    svg.innerHTML = `
      <defs>
        <!-- Colossus: Barrel distortion with red tint -->
        <filter id="boss-colossus-filter">
          <feColorMatrix type="matrix" values="
            1.3 0 0 0 0
            0 0.7 0 0 0
            0 0 0.7 0 0
            0 0 0 1 0
          "/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence"/>
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <!-- Swarm Queen: Pixelation with purple hue -->
        <filter id="boss-swarm-filter">
          <feColorMatrix type="matrix" values="
            0.8 0 0 0 0
            0 0.6 0 0 0
            0 0 1.2 0 0
            0 0 0 1 0
          "/>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <!-- Void Construct: Vortex distortion with cyan -->
        <filter id="boss-void-filter">
          <feColorMatrix type="matrix" values="
            0.5 0 0 0 0
            0 0.8 0 0 0
            0 0 1.3 0 0
            0 0 0 1 0
          "/>
          <feGaussianBlur stdDeviation="1"/>
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="turbulence"/>
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <!-- Omega Core: Chromatic aberration with energy -->
        <filter id="boss-omega-filter">
          <feColorMatrix type="matrix" values="
            1.4 0 0 0 0
            0 1.2 0 0 0
            0 0 0.8 0 0
            0 0 0 1 0
          "/>
          <feGaussianBlur stdDeviation="0.8"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  private addStyles(): void {
    if (document.getElementById('boss-effect-styles')) return;

    const style = document.createElement('style');
    style.id = 'boss-effect-styles';
    style.textContent = `
      /* Colossus Effect - Heavy Impact */
      body.boss-effect-colossus {
        filter: url(#boss-colossus-filter) contrast(1.2) brightness(0.9);
        animation: boss-shake 0.1s infinite;
        transition: filter 0.3s ease-out;
      }

      body.boss-effect-colossus::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(
          ellipse at center,
          rgba(139, 0, 0, 0) 0%,
          rgba(139, 0, 0, 0.3) 70%,
          rgba(139, 0, 0, 0.6) 100%
        );
        pointer-events: none;
        z-index: 999997;
        animation: boss-pulse 2s ease-in-out infinite;
      }

      /* Swarm Queen Effect - Toxic Glitch */
      body.boss-effect-swarm {
        filter: url(#boss-swarm-filter) contrast(1.1);
        animation: boss-glitch 0.3s infinite;
        transition: filter 0.3s ease-out;
      }

      body.boss-effect-swarm::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
          repeating-linear-gradient(
            0deg,
            rgba(75, 0, 130, 0) 0px,
            rgba(75, 0, 130, 0.1) 2px,
            rgba(75, 0, 130, 0) 4px
          ),
          radial-gradient(
            ellipse at center,
            rgba(147, 112, 219, 0) 30%,
            rgba(147, 112, 219, 0.2) 100%
          );
        pointer-events: none;
        z-index: 999997;
        animation: boss-scan 3s linear infinite;
      }

      /* Void Construct Effect - Dark Distortion */
      body.boss-effect-void {
        filter: url(#boss-void-filter) brightness(0.85) contrast(1.3);
        animation: boss-void-distort 3s ease-in-out infinite;
        transition: filter 0.3s ease-out;
      }

      body.boss-effect-void::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
          radial-gradient(
            ellipse at 30% 40%,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.15) 100%
          ),
          radial-gradient(
            ellipse at 70% 60%,
            rgba(0, 255, 255, 0.08) 0%,
            rgba(0, 0, 0, 0) 50%
          ),
          linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(25, 25, 112, 0.15) 50%,
            rgba(0, 0, 0, 0.2) 100%
          );
        pointer-events: none;
        z-index: 999997;
        animation: boss-void-darkness 5s ease-in-out infinite;
      }

      body.boss-effect-void::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
          repeating-linear-gradient(
            45deg,
            transparent 0px,
            rgba(0, 255, 255, 0.02) 2px,
            transparent 4px
          );
        pointer-events: none;
        z-index: 999996;
        animation: boss-void-shimmer 4s linear infinite;
      }

      /* Omega Core Effect - Energy Overload */
      body.boss-effect-omega {
        filter: url(#boss-omega-filter) contrast(1.4) brightness(1.1);
        animation: boss-energy 0.15s infinite;
        transition: filter 0.3s ease-out;
      }

      body.boss-effect-omega::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(
          ellipse at center,
          rgba(255, 0, 0, 0.2) 0%,
          rgba(255, 255, 0, 0.1) 50%,
          rgba(255, 165, 0, 0.3) 100%
        );
        pointer-events: none;
        z-index: 999997;
        animation: boss-energy-pulse 1s ease-in-out infinite;
      }

      /* Chromatic aberration effect for Omega */
      body.boss-effect-omega * {
        text-shadow: 
          -2px 0 0 rgba(255, 0, 0, 0.5),
          2px 0 0 rgba(0, 255, 255, 0.5),
          0 0 10px rgba(255, 255, 0, 0.3);
      }

      /* Animations */
      @keyframes boss-shake {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-2px, 2px) rotate(0.5deg); }
        50% { transform: translate(2px, -2px) rotate(-0.5deg); }
        75% { transform: translate(-2px, -2px) rotate(0.3deg); }
      }

      @keyframes boss-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      @keyframes boss-glitch {
        0% { transform: translate(0, 0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(2px, -2px); }
        60% { transform: translate(-2px, -2px); }
        80% { transform: translate(2px, 2px); }
        100% { transform: translate(0, 0); }
      }

      @keyframes boss-scan {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }

      @keyframes boss-void-distort {
        0%, 100% { 
          filter: url(#boss-void-filter) brightness(0.85) contrast(1.3);
        }
        50% { 
          filter: url(#boss-void-filter) brightness(0.8) contrast(1.35);
        }
      }

      @keyframes boss-void-darkness {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 0.9; }
      }

      @keyframes boss-void-shimmer {
        0% { transform: translateX(0); }
        100% { transform: translateX(20px); }
      }

      @keyframes boss-energy {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-1px, 1px); }
        75% { transform: translate(1px, -1px); }
      }

      @keyframes boss-energy-pulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }

      /* Fade transitions */
      .boss-effect-fade-in {
        animation: boss-fade-in 1s ease-out forwards;
      }

      .boss-effect-fade-out {
        animation: boss-fade-out 1s ease-out forwards;
      }

      @keyframes boss-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes boss-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private animate = (): void => {
    if (!this.enabled || !this.ctx) return;

    this.time += 0.016; // ~60fps

    // Smooth intensity transition
    if (this.intensity !== this.targetIntensity) {
      const delta = this.targetIntensity - this.intensity;
      const step = this.fadeSpeed * 0.016; // Per frame
      if (Math.abs(delta) < step) {
        this.intensity = this.targetIntensity;
      } else {
        this.intensity += Math.sign(delta) * step;
      }
    }

    // Update overlay opacity
    this.overlay.style.opacity = this.intensity.toString();

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Apply intensity to effects
    const alpha = this.intensity;

    // Draw variant-specific animated effects
    switch (this.currentVariant) {
      case 0: // Colossus - Impact particles
        this.drawColossusEffect(width, height, alpha);
        break;
      case 1: // Swarm Queen - Pixelated particles
        this.drawSwarmEffect(width, height, alpha);
        break;
      case 2: // Void Construct - Void particles
        this.drawVoidEffect(width, height, alpha);
        break;
      case 3: // Omega Core - Energy lightning
        this.drawOmegaEffect(width, height, alpha);
        break;
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawColossusEffect(width: number, height: number, alpha: number): void {
    if (!this.ctx) return;

    // Heavy impact rocks falling
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const x = ((i * 137.5 + this.time * 50) % width);
      const y = ((this.time * 100 + i * 50) % height);
      const size = 3 + Math.sin(this.time + i) * 2;
      
      this.ctx.fillStyle = `rgba(139, 0, 0, ${alpha * 0.6})`;
      this.ctx.fillRect(x, y, size, size);
      
      // Glow
      this.ctx.fillStyle = `rgba(255, 69, 0, ${alpha * 0.3})`;
      this.ctx.fillRect(x - 1, y - 1, size + 2, size + 2);
    }

    // Vignette
    const gradient = this.ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(0.7, `rgba(139, 0, 0, ${alpha * 0.2})`);
    gradient.addColorStop(1, `rgba(139, 0, 0, ${alpha * 0.5})`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private drawSwarmEffect(width: number, height: number, alpha: number): void {
    if (!this.ctx) return;

    // Glitchy pixelated particles
    const pixelSize = 4;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.floor(((i * 234.5 + this.time * 80) % width) / pixelSize) * pixelSize;
      const y = Math.floor(((this.time * 60 + i * 70) % height) / pixelSize) * pixelSize;
      const glitchOffset = Math.sin(this.time * 10 + i) > 0.7 ? pixelSize : 0;
      
      this.ctx.fillStyle = `rgba(75, 0, 130, ${alpha * 0.5})`;
      this.ctx.fillRect(x + glitchOffset, y, pixelSize * 2, pixelSize * 2);
      
      // Purple accent
      this.ctx.fillStyle = `rgba(147, 112, 219, ${alpha * 0.4})`;
      this.ctx.fillRect(x, y + pixelSize, pixelSize, pixelSize);
    }

    // Scanlines
    this.ctx.fillStyle = `rgba(75, 0, 130, ${alpha * 0.1})`;
    for (let y = 0; y < height; y += 4) {
      this.ctx.fillRect(0, y + (this.time * 100) % 8, width, 2);
    }
  }

  private drawVoidEffect(width: number, height: number, alpha: number): void {
    if (!this.ctx) return;

    // Floating cyan particles scattered randomly
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const seed = i * 137.5; // Golden angle for distribution
      const x = ((seed + this.time * 30) % width);
      const y = ((seed * 1.7 + this.time * 20) % height);
      const size = 1.5 + Math.sin(this.time * 3 + i) * 1;
      const particleAlpha = alpha * (0.5 + Math.sin(this.time * 2 + i * 0.5) * 0.3);
      
      // Cyan glow particles
      this.ctx.fillStyle = `rgba(0, 255, 255, ${particleAlpha * 0.9})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Outer glow
      this.ctx.fillStyle = `rgba(100, 255, 255, ${particleAlpha * 0.4})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Lighter shadow particles for depth
    const shadowCount = 30;
    for (let i = 0; i < shadowCount; i++) {
      const seed = i * 222.5;
      const x = ((seed + this.time * 15) % width);
      const y = ((seed * 1.3 - this.time * 10) % height);
      const size = 2 + Math.sin(this.time * 2 + i * 0.3) * 1.5;
      
      this.ctx.fillStyle = `rgba(0, 100, 150, ${alpha * 0.2})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Random void rifts (cyan streaks instead of dark)
    const riftCount = 5;
    for (let i = 0; i < riftCount; i++) {
      const x1 = (i * width / riftCount + this.time * 10) % width;
      const y1 = (i * 100 + Math.sin(this.time + i) * 50) % height;
      const x2 = x1 + 40 + Math.sin(this.time * 2 + i) * 25;
      const y2 = y1 + 100;
      
      const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha * 0.15})`);
      gradient.addColorStop(0.5, `rgba(0, 200, 255, ${alpha * 0.25})`);
      gradient.addColorStop(1, `rgba(0, 100, 200, ${alpha * 0.1})`);
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  private drawOmegaEffect(width: number, height: number, alpha: number): void {
    if (!this.ctx) return;

    // Energy lightning bolts
    const boltCount = 8;
    for (let i = 0; i < boltCount; i++) {
      const startX = Math.random() * width;
      const startY = 0;
      let x = startX;
      let y = startY;
      
      this.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha * 0.6})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      
      // Random lightning path
      while (y < height) {
        x += (Math.random() - 0.5) * 50;
        y += Math.random() * 50 + 20;
        this.ctx.lineTo(x, y);
      }
      
      if (Math.sin(this.time * 20 + i) > 0.8) {
        this.ctx.stroke();
      }
    }

    // Energy particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const x = ((i * 197.3 + this.time * 120) % width);
      const y = ((this.time * 80 + i * 40) % height);
      const size = 2 + Math.sin(this.time * 5 + i) * 1;
      
      // Red/Yellow/Orange energy
      const color = i % 3 === 0 ? 'rgba(255, 0, 0' : i % 3 === 1 ? 'rgba(255, 255, 0' : 'rgba(255, 165, 0';
      this.ctx.fillStyle = `${color}, ${alpha * 0.7})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Glow
      this.ctx.fillStyle = `${color}, ${alpha * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Energy pulse overlay
    const pulseAlpha = Math.sin(this.time * 4) * 0.5 + 0.5;
    const gradient = this.ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha * pulseAlpha * 0.2})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha * pulseAlpha * 0.1})`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Enable boss effect with smooth fade-in
   * @param variant Boss variant (0=Colossus, 1=Swarm, 2=Void, 3=Omega)
   * @param fadeDuration Duration of fade-in in seconds (default: 1.0)
   */
  enable(variant: BossVariant, fadeDuration: number = 1.0): void {
    if (this.enabled && this.currentVariant === variant) return;

    this.currentVariant = variant;
    this.enabled = true;
    this.fadeSpeed = 1.0 / fadeDuration;
    this.targetIntensity = 1.0;

    // Show overlay
    this.overlay.style.display = 'block';

    // Remove all boss effect classes
    document.body.classList.remove(
      'boss-effect-colossus',
      'boss-effect-swarm',
      'boss-effect-void',
      'boss-effect-omega'
    );

    // Add appropriate class
    const classNames: Record<BossVariant, string> = {
      0: 'boss-effect-colossus',
      1: 'boss-effect-swarm',
      2: 'boss-effect-void',
      3: 'boss-effect-omega'
    };
    document.body.classList.add(classNames[variant]);

    // Start animation
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  /**
   * Disable boss effect with smooth fade-out
   * @param fadeDuration Duration of fade-out in seconds (default: 1.0)
   */
  disable(fadeDuration: number = 1.0): void {
    if (!this.enabled) return;

    this.fadeSpeed = 1.0 / fadeDuration;
    this.targetIntensity = 0;

    // Wait for fade out to complete before cleanup
    setTimeout(() => {
      if (this.intensity === 0) {
        this.cleanup();
      }
    }, fadeDuration * 1000 + 100);
  }

  private cleanup(): void {
    this.enabled = false;
    this.overlay.style.display = 'none';

    // Remove all boss effect classes
    document.body.classList.remove(
      'boss-effect-colossus',
      'boss-effect-swarm',
      'boss-effect-void',
      'boss-effect-omega'
    );

    // Stop animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Check if effect is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current boss variant
   */
  getCurrentVariant(): BossVariant {
    return this.currentVariant;
  }

  /**
   * Get current intensity (0 to 1)
   */
  getIntensity(): number {
    return this.intensity;
  }
}

