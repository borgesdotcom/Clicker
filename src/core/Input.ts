import type { Vec2 } from '../types';

export class Input {
  private clickHandlers: ((pos: Vec2) => void)[] = [];
  private touchStartPos: Vec2 | null = null;

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
    // Store touch start position for accurate targeting
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        this.touchStartPos = this.getCanvasPosition(
          touch.clientX,
          touch.clientY,
        );
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.changedTouches.length === 0) {
      this.resetTouchState();
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      this.resetTouchState();
      return;
    }

    // Get touch position - use start position if available, otherwise end position
    let touchPos: Vec2;
    if (this.touchStartPos) {
      // Use start position - this is where the user intended to tap
      touchPos = this.touchStartPos;
    } else {
      // Fallback to end position
      touchPos = this.getCanvasPosition(touch.clientX, touch.clientY);
    }

    // Always trigger click handlers - power-up system will check if click is valid
    // This ensures power-ups can be clicked even with slight movement
    this.clickHandlers.forEach((handler) => {
      handler(touchPos);
    });

    this.resetTouchState();
  };

  private handleTouchCancel = (e: TouchEvent): void => {
    e.preventDefault();
    this.resetTouchState();
  };

  private resetTouchState(): void {
    this.touchStartPos = null;
  }

  private getCanvasPosition(clientX: number, clientY: number): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    // The canvas uses device pixel ratio, but game coordinates are in logical pixels
    // So we need to use logical dimensions (not physical canvas.width/height)
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = this.canvas.width / dpr;
    const logicalHeight = this.canvas.height / dpr;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
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
