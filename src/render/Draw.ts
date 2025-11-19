import type { Vec2 } from '../types';
import type { WebGLRenderer } from './WebGLRenderer';
import type { PixelGrid } from './AlienSprites';

export class Draw {
  private webglRenderer: WebGLRenderer | null = null;
  private useWebGL: boolean = false;
  private static bufferCanvas: HTMLCanvasElement | null = null;
  private static bufferCtx: CanvasRenderingContext2D | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    webglRenderer?: WebGLRenderer | null,
  ) {
    if (webglRenderer) {
      this.webglRenderer = webglRenderer;
      this.useWebGL = true;
    }
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  private adjustColor(color: string, amount: number): string {
    if (!color.startsWith('#')) return color;
    const num = parseInt(color.slice(1), 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }

  private static getBuffer(width: number, height: number): { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
    if (!Draw.bufferCanvas) {
      Draw.bufferCanvas = document.createElement('canvas');
      Draw.bufferCtx = Draw.bufferCanvas.getContext('2d', { willReadFrequently: false })!;
    }

    // Resize if necessary (grow only to avoid thrashing)
    if (Draw.bufferCanvas.width < width || Draw.bufferCanvas.height < height) {
      Draw.bufferCanvas.width = Math.max(Draw.bufferCanvas.width, Math.ceil(width));
      Draw.bufferCanvas.height = Math.max(Draw.bufferCanvas.height, Math.ceil(height));
    }

    return { canvas: Draw.bufferCanvas, ctx: Draw.bufferCtx! };
  }

  pixelSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite: PixelGrid,
    color: string,
    opacity: number = 1
  ): void {
    const rows = sprite.length;
    if (rows === 0) return;
    const firstRow = sprite[0];
    if (!firstRow) return;
    const cols = firstRow.length;
    const pixelW = width / cols;
    const pixelH = height / rows;

    const startX = x - width / 2;
    const startY = y - height / 2;

    // Use a buffer to draw the semi-transparent body parts as a single coherent shape
    const { canvas: buffer, ctx: bCtx } = Draw.getBuffer(width, height);

    // Clear buffer
    bCtx.clearRect(0, 0, width, height);

    // First pass: Draw body (Type 1) to buffer at full opacity
    bCtx.fillStyle = color;
    let hasBody = false;

    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        if (row[c] === 1) { // Body
          // Draw with slight overlap to prevent gaps
          bCtx.fillRect(c * pixelW, r * pixelH, pixelW + 0.5, pixelH + 0.5);
          hasBody = true;
        }
      }
    }

    if (hasBody) {
      this.ctx.save();
      this.ctx.globalAlpha = opacity * 0.9; // Body opacity (higher for power-ups)
      // Draw the buffered body shape
      this.ctx.drawImage(buffer, 0, 0, width, height, startX, startY, width, height);
      this.ctx.restore();
    }

    // Clear buffer for next layer
    bCtx.clearRect(0, 0, width, height);

    // Second pass: Draw shade/rim (Type 2) to buffer
    const shadeColor = this.adjustColor(color, -60);
    bCtx.fillStyle = shadeColor;
    let hasShade = false;

    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        if (row[c] === 2) { // Shade
          bCtx.fillRect(c * pixelW, r * pixelH, pixelW + 0.5, pixelH + 0.5);
          hasShade = true;
        }
      }
    }

    if (hasShade) {
      this.ctx.save();
      this.ctx.globalAlpha = opacity; // Shade opacity
      this.ctx.drawImage(buffer, 0, 0, width, height, startX, startY, width, height);
      this.ctx.restore();
    }

    // Highlights (Type 3) and Eyes/Accents (Type 4) are drawn directly for sharpness
    for (let r = 0; r < rows; r++) {
      const row = sprite[r];
      if (!row) continue;
      for (let c = 0; c < cols; c++) {
        const pixelType = row[c];
        if (pixelType === 3) {
          // Highlight - bright white and opaque
          this.ctx.save();
          this.ctx.globalAlpha = opacity;
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(startX + c * pixelW, startY + r * pixelH, pixelW + 0.5, pixelH + 0.5);
          this.ctx.restore();
        } else if (pixelType === 4) {
          // Accent/Eye - dark contrast
          this.ctx.save();
          this.ctx.globalAlpha = opacity;
          this.ctx.fillStyle = '#000000'; // Or darker shade of color
          this.ctx.fillRect(startX + c * pixelW, startY + r * pixelH, pixelW + 0.5, pixelH + 0.5);
          this.ctx.restore();
        }
      }
    }
  }

  circle(x: number, y: number, radius: number, fill = true): void {
    if (this.useWebGL && this.webglRenderer && fill) {
      // Use WebGL for filled circles (major performance boost)
      this.webglRenderer.circle(x, y, radius, fill);
    } else {
      // Fallback to 2D canvas for stroked circles or when WebGL unavailable
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (fill) {
        this.ctx.fill();
      } else {
        this.ctx.stroke();
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number): void {
    if (this.useWebGL && this.webglRenderer) {
      // Use WebGL for lines (major performance boost)
      this.webglRenderer.line(x1, y1, x2, y2);
    } else {
      // Fallback to 2D canvas
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  setStroke(color: string, width = 1): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.setStroke(color, width);
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
  }

  setFill(color: string): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.setFill(color);
    }
    this.ctx.fillStyle = color;
  }

  setAlpha(alpha: number): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.setAlpha(alpha);
    }
    this.ctx.globalAlpha = alpha;
  }

  resetAlpha(): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.resetAlpha();
    }
    this.ctx.globalAlpha = 1;
  }

  setGlow(color: string, blur: number): void {
    // Glow effects still use 2D canvas (shadowBlur)
    // WebGL glow would require post-processing, which is more complex
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
  }

  clearGlow(): void {
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }

  triangle(p1: Vec2, p2: Vec2, p3: Vec2, fill = true): void {
    if (this.useWebGL && this.webglRenderer && fill) {
      // Use WebGL for filled triangles (major performance boost)
      this.webglRenderer.triangle(p1, p2, p3, fill);
    } else {
      // Fallback to 2D canvas for stroked triangles or when WebGL unavailable
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.lineTo(p3.x, p3.y);
      this.ctx.closePath();
      if (fill) {
        this.ctx.fill();
      } else {
        this.ctx.stroke();
      }
    }
  }

  text(
    text: string,
    x: number,
    y: number,
    color = '#fff',
    font = '16px monospace',
    align: CanvasTextAlign = 'left',
  ): void {
    // Text rendering always uses 2D canvas (WebGL text requires texture atlases)
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Add a ship for batched WebGL rendering (much faster than individual draws)
   */
  addShip(
    x: number,
    y: number,
    angle: number,
    size: number,
    color: string,
    isMainShip: boolean = false,
    themeId?: string,
  ): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.addShip(x, y, angle, size, color, isMainShip, themeId);
    }
  }

  /**
   * Flush WebGL batches (call at end of frame before swapping buffers)
   */
  flush(): void {
    if (this.useWebGL && this.webglRenderer) {
      this.webglRenderer.flush();
    }
  }

  /**
   * Get WebGL renderer (for systems that need direct access)
   */
  getWebGLRenderer(): WebGLRenderer | null {
    return this.webglRenderer;
  }

  /**
   * Check if WebGL is enabled
   */
  isWebGLEnabled(): boolean {
    return this.useWebGL;
  }
}
