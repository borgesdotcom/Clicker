export class Loop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1 / 60;

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop(): void {
    this.running = false;
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
    requestAnimationFrame(this.loop);
  };
}

