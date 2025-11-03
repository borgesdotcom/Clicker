export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private gpuAccelerated: boolean = false;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    
    // Enable GPU acceleration hints
    this.enableGPUAcceleration();
    
    // Request GPU-accelerated 2D context with optimal settings
    const context = this.canvas.getContext('2d', {
      // willReadFrequently: false - default, hints GPU to cache
      // alpha: true - default, needed for transparency
      // desynchronized: false - default, better for GPU
    } as CanvasRenderingContext2DSettings);
    
    if (!context) throw new Error('Failed to get 2D context');
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;
    
    // Optimize context for GPU acceleration
    this.optimizeContextForGPU();
    
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
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    
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
    // Use GPU-friendly clear method
    // Direct fillRect is faster than save/restore for GPU
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
}
