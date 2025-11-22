/**
 * Subtle LCD Filter - Gives the game a smooth retro monitor look
 * Much lighter than the CRT effect - suitable for constant use
 * Creates a subtle pixel grid and slight glow without heavy distortion
 */

export class LCDFilter {
  private overlay: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private enabled = false;
  private animationFrameId: number | null = null;
  private time = 0;

  constructor() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'lcd-filter-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
      display: none;
      overflow: hidden;
      transition: opacity 0.5s ease-out;
    `;

    // Create canvas for subtle effects
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.15;
      mix-blend-mode: overlay;
    `;
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.overlay.appendChild(this.canvas);
    document.body.appendChild(this.overlay);

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.addStyles();
  }

  private addStyles(): void {
    if (document.getElementById('lcd-filter-styles')) return;

    const style = document.createElement('style');
    style.id = 'lcd-filter-styles';
    style.textContent = `
      /* LCD Filter Active - Subtle retro monitor effect */
      body.lcd-filter-active {
        /* Very subtle contrast and brightness adjustment */
        filter: contrast(1.02) brightness(1.01);
      }

      /* Subtle pixel grid overlay */
      body.lcd-filter-active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 2px,
            rgba(0, 0, 0, 0.02) 2px,
            rgba(0, 0, 0, 0.02) 3px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 2px,
            rgba(0, 0, 0, 0.01) 2px,
            rgba(0, 0, 0, 0.01) 3px
          );
        pointer-events: none;
        z-index: 999998;
        opacity: 0.3;
      }

      /* Very subtle scanline effect */
      body.lcd-filter-active::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 1px,
          rgba(0, 0, 0, 0.015) 1px,
          rgba(0, 0, 0, 0.015) 2px
        );
        pointer-events: none;
        z-index: 999997;
        animation: lcd-subtle-flicker 3s ease-in-out infinite;
      }

      /* Subtle text glow for LCD effect */
      body.lcd-filter-active h1,
      body.lcd-filter-active h2,
      body.lcd-filter-active h3,
      body.lcd-filter-active .stat-value,
      body.lcd-filter-active .modal-title {
        text-shadow: 0 0 1px currentColor;
      }

      /* Subtle button glow */
      body.lcd-filter-active button:not(:disabled),
      body.lcd-filter-active .hud-button {
        box-shadow: 0 0 2px rgba(255, 255, 255, 0.1);
      }

      /* Very gentle flicker */
      @keyframes lcd-subtle-flicker {
        0%, 100% { opacity: 0.95; }
        50% { opacity: 1; }
      }

      /* Smooth transitions */
      body.lcd-filter-active,
      body.lcd-filter-active::before,
      body.lcd-filter-active::after {
        transition: opacity 0.5s ease-out, filter 0.5s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  private resizeCanvas(): void {
    // Lower resolution for subtle grain effect
    this.canvas.width = window.innerWidth / 2;
    this.canvas.height = window.innerHeight / 2;
  }

  private animate = (): void => {
    if (!this.enabled || !this.ctx) return;

    this.time += 0.016; // ~60fps

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Very subtle animated grain
    this.drawSubtleGrain(width, height);

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawSubtleGrain(width: number, height: number): void {
    if (!this.ctx) return;

    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    // Very light grain - only occasionally add a pixel
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.02) { // 2% chance per pixel
        const value = Math.random() * 60 + 20; // Light gray values
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 80;    // Low alpha for subtlety
      }
    }

    this.ctx.putImageData(imageData, 0, 0);

    // Add very subtle RGB pixels (LCD subpixels)
    const pixelCount = 15;
    for (let i = 0; i < pixelCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 1;
      
      // Random RGB subpixel
      const colors = [
        'rgba(255, 0, 0, 0.1)',
        'rgba(0, 255, 0, 0.1)',
        'rgba(0, 0, 255, 0.1)'
      ];
      const colorIndex = Math.floor(Math.random() * colors.length);
      this.ctx.fillStyle = colors[colorIndex] ?? colors[0] ?? 'rgba(255, 0, 0, 0.1)';
      this.ctx.fillRect(x, y, size, size);
    }
  }

  /**
   * Enable LCD filter with smooth fade-in
   */
  enable(): void {
    if (this.enabled) return;

    this.enabled = true;
    this.overlay.style.display = 'block';
    document.body.classList.add('lcd-filter-active');

    // Fade in
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 10);

    // Start animation
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  /**
   * Disable LCD filter with smooth fade-out
   */
  disable(): void {
    if (!this.enabled) return;

    // Fade out
    this.overlay.style.opacity = '0';

    setTimeout(() => {
      this.enabled = false;
      this.overlay.style.display = 'none';
      document.body.classList.remove('lcd-filter-active');

      // Stop animation
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }, 500);
  }

  /**
   * Toggle LCD filter on/off
   */
  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Check if LCD filter is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

