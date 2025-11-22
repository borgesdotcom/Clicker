/**
 * Full-Screen CRT Filter - CSS + Canvas overlay approach
 * Covers entire viewport including all HTML UI elements
 */
export class CRTFilter {
  private overlay: HTMLDivElement;
  private scanlines: HTMLDivElement;
  private noise: HTMLCanvasElement;
  private noiseCtx: CanvasRenderingContext2D | null;
  private enabled = false;
  private animationFrameId: number | null = null;
  private time = 0;

  constructor() {
    // Create SVG filter for barrel distortion
    this.createSVGFilter();

    // Create container for all CRT effects
    this.overlay = document.createElement('div');
    this.overlay.id = 'crt-filter-overlay';
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
    `;

    // Scanlines layer
    this.scanlines = document.createElement('div');
    this.scanlines.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0) 0px,
        rgba(0, 0, 0, 0) 1px,
        rgba(0, 0, 0, 0.3) 1px,
        rgba(0, 0, 0, 0.3) 2px
      );
      pointer-events: none;
      animation: scanline-flicker 0.1s infinite;
    `;

    // Noise/grain layer
    this.noise = document.createElement('canvas');
    this.noise.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.08;
      pointer-events: none;
      mix-blend-mode: overlay;
    `;
    this.noiseCtx = this.noise.getContext('2d', { alpha: true });

    // Assemble layers
    this.overlay.appendChild(this.scanlines);
    this.overlay.appendChild(this.noise);

    // Add to document
    document.body.appendChild(this.overlay);

    // Setup noise canvas
    this.resizeNoise();
    window.addEventListener('resize', () => this.resizeNoise());

    // Add CSS for the CRT effect
    this.addStyles();
  }

  private createSVGFilter(): void {
    // Remove existing filter if any
    const existingFilter = document.getElementById('crt-barrel-distortion-filter');
    if (existingFilter) {
      existingFilter.remove();
    }

    // Create SVG with barrel distortion filter
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'crt-barrel-distortion-filter';
    svg.style.cssText = 'position: absolute; width: 0; height: 0;';
    svg.innerHTML = `
      <defs>
        <filter id="crt-barrel-filter" x="-10%" y="-10%" width="120%" height="120%">
          <!-- Turbulence for organic distortion -->
          <feTurbulence type="turbulence" baseFrequency="0.005" numOctaves="1" result="turbulence" seed="2"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="15" xChannelSelector="R" yChannelSelector="G" result="displacement"/>
          
          <!-- Morph for barrel effect -->
          <feMorphology operator="dilate" radius="0" in="displacement" result="morphed"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  private addStyles(): void {
    // Check if styles already exist
    if (document.getElementById('crt-filter-styles')) return;

    const style = document.createElement('style');
    style.id = 'crt-filter-styles';
    style.textContent = `
      /* CRT Filter Active - Apply to entire page */
      body.crt-filter-active {
        /* Screen curvature - barrel distortion */
        filter: url(#crt-barrel-filter)
          contrast(1.1)
          brightness(1.05)
          saturate(0.95);
        
        /* 3D perspective for depth */
        transform-style: preserve-3d;
        transform: perspective(1200px) rotateX(0deg);
      }
      
      /* Curved glass effect - black edges */
      body.crt-filter-active::after {
        content: '';
        position: fixed;
        top: -2%;
        left: -2%;
        width: 104vw;
        height: 104vh;
        border-radius: 3% / 4%;
        box-shadow: 
          inset 0 0 150px 50px rgba(0, 0, 0, 0.9),
          inset 0 0 100px 20px rgba(0, 0, 0, 0.7),
          inset 0 0 50px 10px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 999997;
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 60%,
          rgba(0, 0, 0, 0.3) 80%,
          rgba(0, 0, 0, 0.6) 90%,
          rgba(0, 0, 0, 0.9) 100%
        );
      }

      /* Vignette effect */
      body.crt-filter-active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(
          ellipse at center,
          rgba(0, 0, 0, 0) 50%,
          rgba(0, 0, 0, 0.3) 80%,
          rgba(0, 0, 0, 0.6) 100%
        );
        pointer-events: none;
        z-index: 999998;
      }

      /* Screen flicker animation */
      @keyframes scanline-flicker {
        0% { opacity: 0.95; }
        50% { opacity: 1; }
        100% { opacity: 0.95; }
      }

      /* Subtle glow on bright elements */
      body.crt-filter-active * {
        text-shadow: 0 0 2px currentColor;
      }

      /* RGB chromatic aberration on text */
      body.crt-filter-active h1,
      body.crt-filter-active h2,
      body.crt-filter-active h3,
      body.crt-filter-active .modal-title {
        text-shadow: 
          -0.5px 0 0 rgba(255, 0, 0, 0.3),
          0.5px 0 0 rgba(0, 255, 255, 0.3),
          0 0 5px currentColor;
      }

      /* Glow effect on buttons */
      body.crt-filter-active button,
      body.crt-filter-active .hud-button {
        box-shadow: 
          0 0 10px currentColor,
          inset 0 0 10px rgba(255, 255, 255, 0.1);
      }

      /* Visual screen bulge - scale content slightly */
      body.crt-filter-active #app,
      body.crt-filter-active #game-container {
        transform: scale(1.03);
        border-radius: 2% / 3%;
      }
      
      /* Add reflection effect on screen surface */
      #crt-filter-overlay::before {
        content: '';
        position: absolute;
        top: 10%;
        left: 10%;
        width: 30%;
        height: 40%;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.03) 0%,
          rgba(255, 255, 255, 0.01) 50%,
          transparent 100%
        );
        border-radius: 50%;
        pointer-events: none;
        animation: screen-glare 3s ease-in-out infinite;
      }
      
      @keyframes screen-glare {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.5; }
      }

      /* Bloom/glow on canvas */
      body.crt-filter-active canvas {
        filter: brightness(1.1) contrast(1.1);
      }
    `;
    document.head.appendChild(style);
  }

  private resizeNoise(): void {
    const dpr = window.devicePixelRatio || 1;
    this.noise.width = window.innerWidth * dpr * 0.5; // Lower res for performance
    this.noise.height = window.innerHeight * dpr * 0.5;
  }

  private generateNoise(): void {
    if (!this.noiseCtx) return;

    const w = this.noise.width;
    const h = this.noise.height;
    const imageData = this.noiseCtx.createImageData(w, h);
    const data = imageData.data;

    // Generate random noise
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255;   // A
    }

    this.noiseCtx.putImageData(imageData, 0, 0);
  }

  private animate = (): void => {
    if (!this.enabled) return;

    this.time += 0.016;

    // Update noise every few frames for performance
    if (Math.floor(this.time * 60) % 3 === 0) {
      this.generateNoise();
    }

    // Subtle flicker effect
    if (Math.random() < 0.03) {
      this.overlay.style.opacity = String(0.95 + Math.random() * 0.05);
    } else {
      this.overlay.style.opacity = '1';
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public enable(): void {
    if (this.enabled) return;
    
    this.enabled = true;
    this.overlay.style.display = 'block';
    document.body.classList.add('crt-filter-active');
    
    // Start animation
    this.animate();
    
    console.log('CRTFilter: Enabled (CSS + Canvas)');
  }

  public disable(): void {
    if (!this.enabled) return;
    
    this.enabled = false;
    this.overlay.style.display = 'none';
    document.body.classList.remove('crt-filter-active');
    
    // Stop animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('CRTFilter: Disabled');
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public resize(): void {
    this.resizeNoise();
  }

  public destroy(): void {
    this.disable();
    
    // Remove elements
    if (this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay);
    }
    
    // Remove SVG filter
    const svgFilter = document.getElementById('crt-barrel-distortion-filter');
    if (svgFilter && svgFilter.parentElement) {
      svgFilter.parentElement.removeChild(svgFilter);
    }
    
    // Remove styles
    const styles = document.getElementById('crt-filter-styles');
    if (styles && styles.parentElement) {
      styles.parentElement.removeChild(styles);
    }
  }
}
