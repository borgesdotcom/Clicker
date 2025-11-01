import type { Vec2 } from '../types';

export class Input {
  private clickHandlers: ((pos: Vec2) => void)[] = [];
  private touchStartPos: Vec2 | null = null;
  private touchStartTime = 0;
  private readonly MAX_TOUCH_MOVE = 10; // pixels
  private readonly MAX_TOUCH_TIME = 300; // milliseconds

  constructor(private canvas: HTMLCanvasElement) {
    this.setupListeners();
  }

  private setupListeners(): void {
    // Mouse events for desktop
    this.canvas.addEventListener('click', this.handleClick);

    // Touch events for mobile - track touch start and only trigger on touchend
    // This prevents double-firing and makes power-up collection more reliable
    this.canvas.addEventListener('touchstart', this.handleTouchStart, {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, {
      passive: false,
    });
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel, {
      passive: false,
    });
  }

  private handleClick = (e: MouseEvent): void => {
    e.preventDefault();
    const pos = this.getCanvasPosition(e.clientX, e.clientY);
    this.clickHandlers.forEach((handler) => {
      handler(pos);
    });
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    // Store touch start position and time for tap detection
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        this.touchStartPos = this.getCanvasPosition(touch.clientX, touch.clientY);
        this.touchStartTime = Date.now();
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only process if we have a valid touch start
    if (!this.touchStartPos || e.changedTouches.length === 0) {
      this.resetTouchState();
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      this.resetTouchState();
      return;
    }

    // Get current touch position
    const touchEndPos = this.getCanvasPosition(touch.clientX, touch.clientY);
    const touchDuration = Date.now() - this.touchStartTime;

    // Calculate movement distance
    const dx = touchEndPos.x - this.touchStartPos.x;
    const dy = touchEndPos.y - this.touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only trigger if it's a tap (small movement, short duration)
    if (distance <= this.MAX_TOUCH_MOVE && touchDuration <= this.MAX_TOUCH_TIME) {
      // Use the end position for more accurate power-up clicking
      this.clickHandlers.forEach((handler) => {
        handler(touchEndPos);
      });
    }

    this.resetTouchState();
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    e.preventDefault();
    this.resetTouchState();
  };

  private resetTouchState(): void {
    this.touchStartPos = null;
    this.touchStartTime = 0;
  }

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
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}
