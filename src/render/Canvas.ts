import { WebGLRenderer } from './WebGLRenderer';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private webglRenderer: WebGLRenderer | null = null;
  private useWebGL: boolean = true;
  private dpr: number;
  private gpuAccelerated: boolean = false;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    // Clamp devicePixelRatio for iframe compatibility (some iframes report incorrect values)
    // Also handle cases where devicePixelRatio might be 0 or negative
    const rawDpr = window.devicePixelRatio || 1;
    this.dpr = Math.max(1, Math.min(rawDpr, 3)); // Clamp between 1 and 3

    // Try to initialize WebGL first for maximum performance
    try {
      this.webglRenderer = new WebGLRenderer(canvasElement);
      this.useWebGL = true;
      this.gpuAccelerated = true;

      // When WebGL is active, create offscreen 2D canvas for text/background
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
        alpha: true,
      });
      if (!this.offscreenCtx) {
        throw new Error('Failed to create offscreen 2D context');
      }
    } catch (error) {
      console.warn('WebGL not available, falling back to 2D canvas:', error);
      this.useWebGL = false;
      this.webglRenderer = null;
    }

    // Create 2D context on main canvas if WebGL not available
    if (!this.useWebGL) {
      const context = this.canvas.getContext('2d', {
        // willReadFrequently: false - default, hints GPU to cache
        // alpha: true - default, needed for transparency
        // desynchronized: false - default, better for GPU
      } as CanvasRenderingContext2DSettings);

      if (!context) throw new Error('Failed to get 2D context');
      this.ctx = context;

      // Optimize context for GPU acceleration
      this.enableGPUAcceleration();
      this.optimizeContextForGPU();
    } else {
      // When using WebGL, use offscreen context for 2D operations
      if (this.offscreenCtx) {
        this.ctx = this.offscreenCtx;
        this.optimizeContextForGPU();
      } else {
        throw new Error('Failed to initialize offscreen 2D context');
      }
    }

    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  /**
   * Enable GPU acceleration via CSS hints
   */
  private enableGPUAcceleration(): void {
    // CSS properties to hint GPU acceleration
    this.canvas.style.willChange = 'transform';
    this.canvas.style.transform = 'translateZ(0)'; // Force GPU layer
    this.canvas.style.backfaceVisibility = 'hidden'; // GPU optimization
    this.canvas.style.perspective = '1000px'; // Enable 3D transforms for GPU
    this.gpuAccelerated = true;
  }

  /**
   * Optimize canvas context settings for GPU performance
   */
  private optimizeContextForGPU(): void {
    // Disable image smoothing for pixel art style (hard edges, no anti-aliasing)
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = 'low';

    // Use composite operations that are GPU-friendly
    // Default 'source-over' is optimal for GPU

    // Disable text metrics caching if not needed (saves memory)
    // Text rendering is optimized automatically by GPU

    // Set optimal rendering hints
    // Note: willReadFrequently is set at context creation
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    // Ensure we have valid dimensions (important for iframe compatibility)
    const rectWidth = Math.max(1, rect.width || this.canvas.clientWidth || 0);
    const rectHeight = Math.max(1, rect.height || this.canvas.clientHeight || 0);
    
    // In iframes, devicePixelRatio might be unreliable, so clamp it
    const safeDpr = Math.max(1, Math.min(this.dpr || 1, 3));
    const width = Math.ceil(rectWidth * safeDpr);
    const height = Math.ceil(rectHeight * safeDpr);

    if (this.webglRenderer) {
      this.webglRenderer.resize();
    }

    // Resize main canvas
    this.canvas.width = width;
    this.canvas.height = height;

    // Resize offscreen canvas if using WebGL
    if (this.useWebGL && this.offscreenCanvas && this.offscreenCtx) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
      // Reset transform and reapply scale
      this.offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
      this.offscreenCtx.scale(safeDpr, safeDpr);
    } else if (!this.useWebGL) {
      // Reset transform and reapply scale
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(safeDpr, safeDpr);
    }

    // Update overlay canvas size
    this.updateOverlaySize();

    // Re-apply GPU optimizations after resize
    this.optimizeContextForGPU();
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getWidth(): number {
    return this.canvas.width / this.dpr;
  }

  getHeight(): number {
    return this.canvas.height / this.dpr;
  }

  getCenterX(): number {
    return this.getWidth() / 2;
  }

  getCenterY(): number {
    return this.getHeight() / 2;
  }

  clear(): void {
    // Clear main canvas (WebGL handles its own clearing)
    // Use transparent clear so CSS background (animated GIF) shows through
    if (this.useWebGL && this.offscreenCanvas && this.offscreenCtx) {
      // Clear offscreen canvas with transparent
      // Use Math.ceil to ensure we clear the entire area, especially important in iframes
      // Ensure dimensions are valid (defensive check for iframe issues)
      const offscreenWidth = Math.max(1, Math.ceil(this.offscreenCanvas.width || 0));
      const offscreenHeight = Math.max(1, Math.ceil(this.offscreenCanvas.height || 0));
      this.offscreenCtx.clearRect(0, 0, offscreenWidth, offscreenHeight);
      
      // Also clear overlay canvas if it exists (critical for iframe compatibility)
      // This was the main issue - overlay canvas wasn't being cleared at frame start
      if (this.overlayCanvas && this.overlayCtx) {
        // Ensure overlay dimensions match main canvas (fixes iframe dimension sync issues)
        if (this.overlayCanvas.width !== this.canvas.width || this.overlayCanvas.height !== this.canvas.height) {
          this.overlayCanvas.width = this.canvas.width;
          this.overlayCanvas.height = this.canvas.height;
        }
        const overlayWidth = Math.max(1, Math.ceil(this.overlayCanvas.width || 0));
        const overlayHeight = Math.max(1, Math.ceil(this.overlayCanvas.height || 0));
        this.overlayCtx.clearRect(0, 0, overlayWidth, overlayHeight);
      }
    } else {
      // Clear main 2D canvas with transparent so CSS background shows through
      // Use Math.ceil to ensure we clear the entire area, especially important in iframes
      // Ensure dimensions are valid (defensive check for iframe issues)
      const canvasWidth = Math.max(1, Math.ceil(this.canvas.width || 0));
      const canvasHeight = Math.max(1, Math.ceil(this.canvas.height || 0));
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
  }

  /**
   * Check if GPU acceleration is enabled
   */
  isGPUAccelerated(): boolean {
    return this.gpuAccelerated;
  }

  /**
   * Get the canvas element for direct manipulation if needed
   */
  getCanvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get WebGL renderer if available
   */
  getWebGLRenderer(): WebGLRenderer | null {
    return this.webglRenderer;
  }

  /**
   * Check if WebGL is being used
   */
  isWebGLEnabled(): boolean {
    return this.useWebGL && this.webglRenderer !== null;
  }

  /**
   * Flush WebGL batches and composite 2D overlay (call at end of frame)
   */
  flushWebGL(): void {
    if (this.webglRenderer) {
      this.webglRenderer.flush();

      // Composite offscreen 2D canvas onto WebGL canvas
      if (this.offscreenCanvas && this.offscreenCtx) {
        // Use 2D context on main canvas to composite the offscreen canvas
        // We need to get a 2D context temporarily, but we can't while WebGL is active
        // So we'll render the offscreen canvas using a temporary 2D context on a new canvas
        // Actually, better: create a hidden 2D canvas for compositing
        // Or even better: use ImageBitmap and render to WebGL as texture
        // For now, simplest: create overlay canvas element in DOM

        // Actually, we can't get 2D context while WebGL is active
        // Solution: Use ImageData and putImageData, or use a separate overlay canvas element
        // For performance, we'll create an overlay canvas that sits on top via CSS
        this.compositeOverlay();
      }
    }
  }

  /**
   * Composite 2D overlay canvas onto main canvas
   * Creates an overlay canvas element if it doesn't exist
   */
  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  private compositeOverlay(): void {
    if (!this.offscreenCanvas || !this.offscreenCtx) return;

    // Create overlay canvas if it doesn't exist
    if (!this.overlayCanvas) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.id = 'webgl-overlay-canvas';
      this.overlayCanvas.style.position = 'absolute';
      this.overlayCanvas.style.top = '0';
      this.overlayCanvas.style.left = '0';
      // CRITICAL: pointer-events must be none to allow clicks through to main canvas
      // This is essential for clicking asteroids and power-ups
      this.overlayCanvas.style.pointerEvents = 'none';
      this.overlayCanvas.style.userSelect = 'none';
      this.overlayCanvas.style.touchAction = 'none';
      // Layering order (bottom to top):
      // 1. Overlay canvas (z-index: 0) - Background and 2D content
      // 2. WebGL canvas (z-index: 1) - Ships, circles, etc.
      // 3. UI elements (z-index: 10+) - HUD, shop, etc.
      this.overlayCanvas.style.zIndex = '0';
      // Ensure WebGL canvas is above overlay (it's already position: absolute from CSS)
      this.canvas.style.zIndex = '1';
      this.canvas.style.pointerEvents = 'auto'; // Ensure main canvas receives clicks

      // Match main canvas position exactly - overlay must be in same container
      this.canvas.getBoundingClientRect();
      const canvasStyle = window.getComputedStyle(this.canvas);

      // Overlay must match main canvas exactly for proper compositing
      this.overlayCanvas.style.position = 'absolute'; // Always absolute to match main canvas
      this.overlayCanvas.style.display = 'block';
      this.overlayCanvas.style.top = '0';
      this.overlayCanvas.style.left = '0';
      this.overlayCanvas.style.width = '100%';
      this.overlayCanvas.style.height = '100%';
      // Match CSS width/height from main canvas
      if (canvasStyle.width) this.overlayCanvas.style.width = canvasStyle.width;
      if (canvasStyle.height)
        this.overlayCanvas.style.height = canvasStyle.height;

      this.overlayCanvas.width = this.canvas.width;
      this.overlayCanvas.height = this.canvas.height;

      this.overlayCtx = this.overlayCanvas.getContext('2d');
      if (!this.overlayCtx) return;

      // Insert BEFORE main canvas in DOM so WebGL canvas is on top
      // This ensures WebGL content (ships) appears above 2D overlay (text, background)
      if (this.canvas.parentNode) {
        this.canvas.parentNode.insertBefore(this.overlayCanvas, this.canvas);
      } else {
        // If no parent, append to body (fallback)
        document.body.appendChild(this.overlayCanvas);
      }
    }

    // Ensure overlay canvas dimensions match main canvas (important for iframe compatibility)
    if (this.overlayCanvas.width !== this.canvas.width || this.overlayCanvas.height !== this.canvas.height) {
      this.overlayCanvas.width = this.canvas.width;
      this.overlayCanvas.height = this.canvas.height;
    }

    // Copy offscreen canvas to overlay (only if there's content to render)
    // IMPORTANT: Only copy non-background content (text, UI elements)
    // Background should be rendered to WebGL, not overlay
    if (this.overlayCtx && this.overlayCanvas) {
      // CRITICAL: Re-enforce pointer-events: none every frame
      // This ensures the overlay never blocks clicks, even if styles are modified elsewhere
      this.overlayCanvas.style.pointerEvents = 'none';
      
      // Clear overlay completely (transparent) - use Math.ceil for iframe compatibility
      const overlayWidth = Math.ceil(this.overlayCanvas.width);
      const overlayHeight = Math.ceil(this.overlayCanvas.height);
      this.overlayCtx.clearRect(0, 0, overlayWidth, overlayHeight);

      // Only copy text/UI elements from offscreen canvas, NOT the background
      // Background is already rendered to WebGL canvas
      // For now, copy everything but this will be optimized later
      // The offscreen canvas should only have text/UI, not background
      this.overlayCtx.drawImage(this.offscreenCanvas, 0, 0);
    }
    
    // Ensure main canvas always receives clicks
    this.canvas.style.pointerEvents = 'auto';
  }

  /**
   * Cleanup overlay canvas on resize
   */
  private updateOverlaySize(): void {
    if (this.overlayCanvas && this.useWebGL) {
      const rect = this.canvas.getBoundingClientRect();
      // Ensure we have valid dimensions (important for iframe compatibility)
      const rectWidth = Math.max(1, rect.width || this.canvas.clientWidth || 0);
      const rectHeight = Math.max(1, rect.height || this.canvas.clientHeight || 0);
      
      // In iframes, devicePixelRatio might be unreliable, so clamp it
      const safeDpr = Math.max(1, Math.min(this.dpr || 1, 3));
      const width = Math.ceil(rectWidth * safeDpr);
      const height = Math.ceil(rectHeight * safeDpr);

      this.overlayCanvas.width = width;
      this.overlayCanvas.height = height;

      // Match CSS size to main canvas
      const canvasStyle = window.getComputedStyle(this.canvas);
      this.overlayCanvas.style.width = canvasStyle.width || `${rectWidth}px`;
      this.overlayCanvas.style.height =
        canvasStyle.height || `${rectHeight}px`;

      // CRITICAL: Re-enforce pointer-events: none on resize
      // This ensures clicks always pass through to the main canvas
      this.overlayCanvas.style.pointerEvents = 'none';
      this.overlayCanvas.style.userSelect = 'none';
      this.overlayCanvas.style.touchAction = 'none';
      // Ensure main canvas can receive clicks
      this.canvas.style.pointerEvents = 'auto';

      if (this.overlayCtx) {
        // Reset transform and don't scale (we're drawing at full resolution)
        this.overlayCtx.setTransform(1, 0, 0, 1, 0, 0);
        // Re-apply image smoothing settings after resize
        this.overlayCtx.imageSmoothingEnabled = false;
        this.overlayCtx.imageSmoothingQuality = 'low';
      }
    }
  }
}
