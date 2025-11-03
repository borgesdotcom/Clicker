export class Loop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 120; // Increased from 60 to 120 FPS
  private isVisible = true;

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
    private onFrameEnd?: (frameStart: number) => void,
    private onBackgroundProgress?: (elapsedSeconds: number) => void,
  ) {
    // Handle visibility changes to pause simulation when hidden
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;

      if (this.running) {
        if (this.isVisible) {
          // Tab became visible - grant offline progress and resume
          const now = performance.now();
          const elapsed = Math.max(0, (now - this.lastTime) / 1000);
          // Cap offline catch-up to avoid huge jumps on very long absences
          const cappedElapsed = Math.min(elapsed, 60);
          if (this.onBackgroundProgress && cappedElapsed > 0) {
            this.onBackgroundProgress(cappedElapsed);
          }
          this.lastTime = now;
          this.accumulator = 0;
          this.loop(this.lastTime);
        } else {
          // Tab became hidden - pause updates completely to avoid backlog
          this.accumulator = 0;
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
    }
  }

  stop(): void {
    this.running = false;
  }

  private loop = (currentTime: number): void => {
    if (!this.running) return;

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

    // Only continue requestAnimationFrame loop if visible (paused when hidden)
    if (this.isVisible) {
      requestAnimationFrame(this.loop);
    }
  };
}
