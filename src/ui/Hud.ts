export class Hud {
  private pointsDisplay: HTMLElement;
  private levelText: HTMLElement;
  private expText: HTMLElement;
  private levelBarFill: HTMLElement;
  private dpsDisplay: HTMLElement | null = null;
  private passiveDisplay: HTMLElement | null = null;
  private critDisplay: HTMLElement | null = null;
  
  private damageHistory: number[] = [];
  private lastDamageTime = Date.now();
  private readonly DPS_WINDOW = 5000; // 5 seconds window for DPS calculation

  constructor() {
    const pointsEl = document.getElementById('points-display');
    if (!pointsEl) throw new Error('Points display element not found');
    this.pointsDisplay = pointsEl;

    const levelTextEl = document.getElementById('level-text');
    if (!levelTextEl) throw new Error('Level text element not found');
    this.levelText = levelTextEl;

    const expTextEl = document.getElementById('exp-text');
    if (!expTextEl) throw new Error('Exp text element not found');
    this.expText = expTextEl;

    const levelBarFillEl = document.getElementById('level-bar-fill');
    if (!levelBarFillEl) throw new Error('Level bar fill element not found');
    this.levelBarFill = levelBarFillEl;
    
    this.createStatsDisplay();
  }
  
  private createStatsDisplay(): void {
    // Create stats container
    const statsContainer = document.createElement('div');
    statsContainer.id = 'stats-display';
    statsContainer.style.cssText = `
      margin-top: 15px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      font-size: 14px;
      max-width: 300px;
    `;
    
    // DPS Display
    this.dpsDisplay = document.createElement('div');
    this.dpsDisplay.style.cssText = 'margin-bottom: 5px; color: #ff8888;';
    this.dpsDisplay.textContent = '⚔️ DPS: 0';
    
    // Passive Display
    this.passiveDisplay = document.createElement('div');
    this.passiveDisplay.style.cssText = 'margin-bottom: 5px; color: #88ff88;';
    this.passiveDisplay.textContent = '🏭 Passive: 0/sec';
    
    // Crit Display
    this.critDisplay = document.createElement('div');
    this.critDisplay.style.cssText = 'color: #ffff88;';
    this.critDisplay.textContent = '✨ Crit: 0%';
    
    statsContainer.appendChild(this.dpsDisplay);
    statsContainer.appendChild(this.passiveDisplay);
    statsContainer.appendChild(this.critDisplay);
    
    const hudElement = document.getElementById('hud');
    if (hudElement) {
      hudElement.appendChild(statsContainer);
    }
  }

  update(points: number): void {
    this.pointsDisplay.textContent = `💰 Points: ${this.formatNumber(points)}`;
  }
  
  updateStats(dps: number, passive: number, critChance: number): void {
    if (this.dpsDisplay) {
      this.dpsDisplay.textContent = `⚔️ DPS: ${this.formatNumber(dps)}`;
    }
    if (this.passiveDisplay) {
      this.passiveDisplay.textContent = `🏭 Passive: ${this.formatNumber(passive)}/sec`;
    }
    if (this.critDisplay) {
      this.critDisplay.textContent = `✨ Crit: ${critChance.toFixed(1)}%`;
    }
  }
  
  recordDamage(amount: number): void {
    const now = Date.now();
    this.damageHistory.push({ damage: amount, time: now } as any);
    
    // Remove old entries outside the DPS window
    this.damageHistory = this.damageHistory.filter(
      (entry: any) => now - entry.time < this.DPS_WINDOW
    );
  }
  
  calculateDPS(): number {
    if (this.damageHistory.length === 0) return 0;
    
    const now = Date.now();
    const windowStart = now - this.DPS_WINDOW;
    const recentDamage = this.damageHistory.filter((entry: any) => entry.time >= windowStart);
    
    if (recentDamage.length === 0) return 0;
    
    const totalDamage = recentDamage.reduce((sum: number, entry: any) => sum + entry.damage, 0);
    const timeSpan = (now - (recentDamage[0] as any).time) / 1000; // Convert to seconds
    
    return timeSpan > 0 ? totalDamage / timeSpan : 0;
  }

  updateLevel(level: number, experience: number, expToNext: number): void {
    this.levelText.textContent = `⭐ Level ${level}`;
    this.expText.textContent = `${Math.floor(experience)} / ${expToNext}`;
    const percent = Math.min(100, (experience / expToNext) * 100);
    this.levelBarFill.style.width = `${percent}%`;
  }

  private formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  }
}

