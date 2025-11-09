import type { Vec2 } from '../types';
import type { WebGLRenderer } from './WebGLRenderer';

export class Draw {
  private webglRenderer: WebGLRenderer | null = null;
  private useWebGL: boolean = false;

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
