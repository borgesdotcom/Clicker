interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export class PerformanceMonitor {
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private maxHistoryLength = 60;
  private lastUpdateTime = 0;
  private updateInterval = 100;

  private frameCount = 0;
  private lastFpsUpdate = 0;
  private currentFps = 0;
  private currentFrameTime = 0;
  private currentUpdateTime = 0;
  private currentRenderTime = 0;

  private chartCanvas: HTMLCanvasElement | null = null;
  private chartCtx: CanvasRenderingContext2D | null = null;

  private entityCountProviders: {
    getLasers?: () => number;
    getParticles?: () => number;
    getShips?: () => number;
    getDamageNumbers?: () => number;
  } = {};

  constructor() {
    this.createPanel();
    this.setupKeyboardShortcut();
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'performance-monitor';
    this.panel.className = 'performance-monitor';
    this.panel.style.display = 'none';

    this.panel.innerHTML = `
      <div class="perf-content">
        <div class="perf-header">
          <h3>⚡ Performance Monitor</h3>
          <button id="perf-close" class="perf-close-btn">×</button>
        </div>
        
        <div class="perf-section">
          <div class="perf-metric perf-metric-fps">
            <span class="perf-label">FPS:</span>
            <span id="perf-fps" class="perf-value">--</span>
          </div>
          <div class="perf-metric">
            <span class="perf-label">Frame Time:</span>
            <span id="perf-frametime" class="perf-value">--</span>
          </div>
          <div class="perf-metric">
            <span class="perf-label">Update:</span>
            <span id="perf-updatetime" class="perf-value">--</span>
          </div>
          <div class="perf-metric">
            <span class="perf-label">Render:</span>
            <span id="perf-rendertime" class="perf-value">--</span>
          </div>
        </div>

        <div class="perf-chart-container">
          <canvas id="perf-chart" width="280" height="80"></canvas>
        </div>

        <div class="perf-section">
          <h4>Entity Counts</h4>
          <div class="perf-entities">
            <div class="perf-entity-row">
              <span class="perf-label">Lasers:</span>
              <span id="perf-lasers" class="perf-value">--</span>
            </div>
            <div class="perf-entity-row">
              <span class="perf-label">Particles:</span>
              <span id="perf-particles" class="perf-value">--</span>
            </div>
            <div class="perf-entity-row">
              <span class="perf-label">Ships:</span>
              <span id="perf-ships" class="perf-value">--</span>
            </div>
            <div class="perf-entity-row">
              <span class="perf-label">Damage #s:</span>
              <span id="perf-damagenumbers" class="perf-value">--</span>
            </div>
          </div>
        </div>

        <div class="perf-section" id="perf-memory-section">
          <h4>Memory</h4>
          <div class="perf-memory">
            <div class="perf-entity-row">
              <span class="perf-label">Used:</span>
              <span id="perf-memory-used" class="perf-value">--</span>
            </div>
            <div class="perf-entity-row">
              <span class="perf-label">Total:</span>
              <span id="perf-memory-total" class="perf-value">--</span>
            </div>
            <div class="perf-entity-row">
              <span class="perf-label">Limit:</span>
              <span id="perf-memory-limit" class="perf-value">--</span>
            </div>
          </div>
        </div>

        <div class="perf-info">
          <p>Press <kbd>Ctrl + M</kbd> to toggle</p>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);

    const chartElement = document.getElementById('perf-chart');
    if (chartElement instanceof HTMLCanvasElement) {
      this.chartCanvas = chartElement;
      this.chartCtx = this.chartCanvas.getContext('2d');
    }

    document.getElementById('perf-close')?.addEventListener('click', () => {
      this.hide();
    });

    const memory = (performance as PerformanceWithMemory).memory;
    if (!memory) {
      const memSection = document.getElementById('perf-memory-section');
      if (memSection) {
        memSection.style.display = 'none';
      }
    }
  }

  public setEntityCountProviders(providers: {
    getLasers?: () => number;
    getParticles?: () => number;
    getShips?: () => number;
    getDamageNumbers?: () => number;
  }): void {
    this.entityCountProviders = providers;
  }

  public startFrame(): number {
    return performance.now();
  }

  public endUpdate(startTime: number): void {
    this.currentUpdateTime = performance.now() - startTime;
  }

  public endRender(startTime: number): void {
    this.currentRenderTime = performance.now() - startTime;
  }

  public endFrame(startTime: number): void {
    const now = performance.now();
    this.currentFrameTime = now - startTime;
    this.frameCount++;

    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.fpsHistory.push(this.currentFps);
    this.frameTimeHistory.push(this.currentFrameTime);

    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
      this.frameTimeHistory.shift();
    }

    if (this.isVisible && now - this.lastUpdateTime >= this.updateInterval) {
      this.updateDisplay();
      this.lastUpdateTime = now;
    }
  }

  private updateDisplay(): void {
    const fpsElement = document.getElementById('perf-fps');
    if (fpsElement) {
      fpsElement.textContent = this.currentFps.toString();

      if (this.currentFps >= 55) {
        fpsElement.style.color = '#00ff88';
      } else if (this.currentFps >= 30) {
        fpsElement.style.color = '#ffaa00';
      } else {
        fpsElement.style.color = '#ff4444';
      }
    }

    const frameTimeElement = document.getElementById('perf-frametime');
    if (frameTimeElement) {
      frameTimeElement.textContent = `${this.currentFrameTime.toFixed(2)}ms`;

      if (this.currentFrameTime <= 16.67) {
        frameTimeElement.style.color = '#00ff88';
      } else if (this.currentFrameTime <= 33.33) {
        frameTimeElement.style.color = '#ffaa00';
      } else {
        frameTimeElement.style.color = '#ff4444';
      }
    }

    const updateTimeElement = document.getElementById('perf-updatetime');
    if (updateTimeElement) {
      updateTimeElement.textContent = `${this.currentUpdateTime.toFixed(2)}ms`;
    }

    const renderTimeElement = document.getElementById('perf-rendertime');
    if (renderTimeElement) {
      renderTimeElement.textContent = `${this.currentRenderTime.toFixed(2)}ms`;
    }
    if (this.entityCountProviders.getLasers) {
      const lasersElement = document.getElementById('perf-lasers');
      if (lasersElement) {
        lasersElement.textContent = this.entityCountProviders
          .getLasers()
          .toString();
      }
    }

    if (this.entityCountProviders.getParticles) {
      const particlesElement = document.getElementById('perf-particles');
      if (particlesElement) {
        particlesElement.textContent = this.entityCountProviders
          .getParticles()
          .toString();
      }
    }

    if (this.entityCountProviders.getShips) {
      const shipsElement = document.getElementById('perf-ships');
      if (shipsElement) {
        shipsElement.textContent = this.entityCountProviders
          .getShips()
          .toString();
      }
    }

    if (this.entityCountProviders.getDamageNumbers) {
      const damageNumbersElement =
        document.getElementById('perf-damagenumbers');
      if (damageNumbersElement) {
        damageNumbersElement.textContent = this.entityCountProviders
          .getDamageNumbers()
          .toString();
      }
    }

    const memory = (performance as PerformanceWithMemory).memory;
    if (memory) {
      const usedElement = document.getElementById('perf-memory-used');
      const totalElement = document.getElementById('perf-memory-total');
      const limitElement = document.getElementById('perf-memory-limit');

      if (usedElement) {
        usedElement.textContent = this.formatBytes(memory.usedJSHeapSize);
      }
      if (totalElement) {
        totalElement.textContent = this.formatBytes(memory.totalJSHeapSize);
      }
      if (limitElement) {
        limitElement.textContent = this.formatBytes(memory.jsHeapSizeLimit);
      }
    }

    this.drawChart();
  }

  private drawChart(): void {
    if (!this.chartCtx || !this.chartCanvas) return;

    const ctx = this.chartCtx;
    const width = this.chartCanvas.width;
    const height = this.chartCanvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    const fpsLines = [30, 60, 120];
    for (const fps of fpsLines) {
      const y = height - (fps / 120) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(fps.toString(), 2, y - 2);
    }

    if (this.fpsHistory.length > 1) {
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const xStep = width / this.maxHistoryLength;
      for (let i = 0; i < this.fpsHistory.length; i++) {
        const x = i * xStep;
        const fps = this.fpsHistory[i] ?? 0;
        const y = height - (Math.min(fps, 120) / 120) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (this.frameTimeHistory.length > 1) {
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1;
      ctx.beginPath();

      const xStep = width / this.maxHistoryLength;
      for (let i = 0; i < this.frameTimeHistory.length; i++) {
        const x = i * xStep;
        const frameTime = this.frameTimeHistory[i] ?? 0;
        const y = height - (Math.min(frameTime, 50) / 50) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(width - 100, 5, 15, 3);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('FPS', width - 80, 10);

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(width - 100, 15, 15, 3);
    ctx.fillStyle = '#fff';
    ctx.fillText('Frame Time', width - 80, 20);
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes.toString()}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public show(): void {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isVisible = true;
      this.lastFpsUpdate = performance.now();
      this.frameCount = 0;
    }
  }

  public hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }

  public isOpen(): boolean {
    return this.isVisible;
  }
}
