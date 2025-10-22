export class Loop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 120; // Increased from 60 to 120 FPS
  private backgroundIntervalId: number | null = null;
  private isVisible = true;

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
  ) {
    // Handle visibility changes to keep game running in background
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;

      if (this.running) {
        if (this.isVisible) {
          // Tab became visible - switch back to requestAnimationFrame
          this.stopBackgroundLoop();
          this.lastTime = performance.now();
          this.loop(this.lastTime);
        } else {
          // Tab became hidden - use interval to keep running
          this.startBackgroundLoop();
        }
      }
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    if (this.isVisible) {
      this.loop(this.lastTime);
    } else {
      this.startBackgroundLoop();
    }
  }

  stop(): void {
    this.running = false;
    this.stopBackgroundLoop();
  }

  private loop = (currentTime: number): void => {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.render();

    // Only continue requestAnimationFrame loop if visible
    if (this.isVisible) {
      requestAnimationFrame(this.loop);
    }
  };

  private startBackgroundLoop(): void {
    if (this.backgroundIntervalId !== null) return;

    // Run at 120 FPS even when hidden to maintain game speed consistency
    this.backgroundIntervalId = window.setInterval(() => {
      if (!this.running || this.isVisible) return;

      const now = performance.now();
      const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.accumulator += deltaTime;

      while (this.accumulator >= this.fixedDt) {
        this.update(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }

      // Don't render when hidden - saves GPU
    }, 1000 / 120); // 8.33ms = 120 FPS
  }

  private stopBackgroundLoop(): void {
    if (this.backgroundIntervalId !== null) {
      clearInterval(this.backgroundIntervalId);
      this.backgroundIntervalId = null;
    }
  }
}
