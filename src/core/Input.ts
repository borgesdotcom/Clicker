import type { Vec2 } from '../types';

export class Input {
  private clickHandlers: ((pos: Vec2) => void)[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.setupListeners();
  }

  private setupListeners(): void {
    // Mouse events for desktop
    this.canvas.addEventListener('click', this.handleClick);
    
    // Touch events for mobile - use both touchstart and touchend
    this.canvas.addEventListener('touchstart', this.handleTouch, {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, {
      passive: false,
    });
  }

  private handleClick = (e: MouseEvent): void => {
    e.preventDefault();
    const pos = this.getCanvasPosition(e.clientX, e.clientY);
    this.clickHandlers.forEach((handler) => handler(pos));
  };

  private handleTouch = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
        this.clickHandlers.forEach((handler) => handler(pos));
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    // Use changedTouches for touchend
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      if (touch) {
        const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
        this.clickHandlers.forEach((handler) => handler(pos));
      }
    }
  };

  private getCanvasPosition(clientX: number, clientY: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  onClick(handler: (pos: Vec2) => void): void {
    this.clickHandlers.push(handler);
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}

