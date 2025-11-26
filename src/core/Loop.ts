export class Loop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60; // Standard 60 FPS for smooth gameplay
  private isVisible = true;
  private animationFrameId: number | null = null;
  private timeoutId: number | null = null;
  private readonly targetFps = 60;
  private readonly targetFrameTime = 1000 / this.targetFps; // ~16.67ms for 60fps

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
    private onFrameEnd?: (frameStart: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onBackgroundProgress?: (elapsedSeconds: number) => void, // Kept for backward compatibility, not used since game runs continuously
  ) {
    // Handle visibility changes - switch between requestAnimationFrame and setTimeout
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isVisible;
      this.isVisible = !document.hidden;

      if (this.running) {
        if (this.isVisible && !wasVisible) {
          // Tab became visible - switch from setTimeout to requestAnimationFrame
          if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }
          this.lastTime = performance.now();
          this.accumulator = 0;
          // Start requestAnimationFrame loop if not already running
          if (this.animationFrameId === null) {
            this.animationFrameId = requestAnimationFrame(this.loop);
          }
        } else if (!this.isVisible && wasVisible) {
          // Tab became hidden - switch from requestAnimationFrame to setTimeout
          if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
          this.lastTime = performance.now();
          this.accumulator = 0;
          // Start setTimeout loop if not already running
          if (this.timeoutId === null) {
            this.timeoutId = window.setTimeout(this.timeoutLoop, this.targetFrameTime);
          }
        }
      }
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    // Use requestAnimationFrame if visible, setTimeout if hidden
    if (this.isVisible) {
      if (this.animationFrameId === null) {
        this.animationFrameId = requestAnimationFrame(this.loop);
      }
    } else {
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(this.timeoutLoop, this.targetFrameTime);
      }
    }
  }

  stop(): void {
    this.running = false;
    // Cancel any pending animation frame or timeout
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private loop = (currentTime: number): void => {
    // Clear the frame ID since this frame is now executing
    this.animationFrameId = null;

    if (!this.running) return;

    this.processFrame(currentTime);

    // Continue requestAnimationFrame loop if visible and not already scheduled
    if (this.isVisible && this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private timeoutLoop = (): void => {
    // Clear the timeout ID since this frame is now executing
    this.timeoutId = null;

    if (!this.running) return;

    const currentTime = performance.now();
    this.processFrame(currentTime);

    // Continue setTimeout loop if hidden and not already scheduled
    if (!this.isVisible && this.timeoutId === null) {
      this.timeoutId = window.setTimeout(this.timeoutLoop, this.targetFrameTime);
    }
  };

  private processFrame(currentTime: number): void {
    const frameStart = currentTime;
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Prevent spiral-of-death: limit fixed steps per frame
    let steps = 0;
    const maxSteps = 5;
    while (this.accumulator >= this.fixedDt && steps < maxSteps) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps++;
    }

    // If we exceeded max steps, drop the remainder to keep the game responsive
    if (steps === maxSteps) {
      this.accumulator = 0;
    }

    this.render();

    // Call frame end callback for performance monitoring
    if (this.onFrameEnd) {
      this.onFrameEnd(frameStart);
    }
  }
}
