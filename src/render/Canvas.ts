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
    this.dpr = window.devicePixelRatio || 1;
    
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
    // Enable image smoothing for better quality (GPU handles this efficiently)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Use composite operations that are GPU-friendly
    // Default 'source-over' is optimal for GPU
    
    // Disable text metrics caching if not needed (saves memory)
    // Text rendering is optimized automatically by GPU
    
    // Set optimal rendering hints
    // Note: willReadFrequently is set at context creation
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width * this.dpr;
    const height = rect.height * this.dpr;
    
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
      this.offscreenCtx.scale(this.dpr, this.dpr);
    } else if (!this.useWebGL) {
      // Reset transform and reapply scale
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
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

  clear(color: string = '#000'): void {
    // Clear main canvas (WebGL handles its own clearing)
    if (this.useWebGL && this.offscreenCanvas && this.offscreenCtx) {
      // Clear offscreen canvas
      this.offscreenCtx.fillStyle = color;
      this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    } else {
      // Clear main 2D canvas
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
      this.overlayCanvas.style.pointerEvents = 'none';
      // Layering order (bottom to top):
      // 1. Overlay canvas (z-index: 0) - Background and 2D content
      // 2. WebGL canvas (z-index: 1) - Ships, circles, etc.
      // 3. UI elements (z-index: 10+) - HUD, shop, etc.
      this.overlayCanvas.style.zIndex = '0';
      // Ensure WebGL canvas is above overlay (it's already position: absolute from CSS)
      this.canvas.style.zIndex = '1';
      
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
      if (canvasStyle.height) this.overlayCanvas.style.height = canvasStyle.height;
      
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
    
    // Copy offscreen canvas to overlay (only if there's content to render)
    // IMPORTANT: Only copy non-background content (text, UI elements)
    // Background should be rendered to WebGL, not overlay
    if (this.overlayCtx && this.overlayCanvas) {
      // Clear overlay completely (transparent)
      this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      
      // Only copy text/UI elements from offscreen canvas, NOT the background
      // Background is already rendered to WebGL canvas
      // For now, copy everything but this will be optimized later
      // The offscreen canvas should only have text/UI, not background
      this.overlayCtx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }
  
  /**
   * Cleanup overlay canvas on resize
   */
  private updateOverlaySize(): void {
    if (this.overlayCanvas && this.useWebGL) {
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width * this.dpr;
      const height = rect.height * this.dpr;
      
      this.overlayCanvas.width = width;
      this.overlayCanvas.height = height;
      
      // Match CSS size to main canvas
      const canvasStyle = window.getComputedStyle(this.canvas);
      this.overlayCanvas.style.width = canvasStyle.width || `${rect.width}px`;
      this.overlayCanvas.style.height = canvasStyle.height || `${rect.height}px`;
      
      if (this.overlayCtx) {
        // Reset transform and don't scale (we're drawing at full resolution)
        this.overlayCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }
}
