export class Hud {
  private pointsDisplay: HTMLElement;
  private levelText: HTMLElement;
  private expText: HTMLElement;
  private levelBarFill: HTMLElement;

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
  }

  update(points: number): void {
    this.pointsDisplay.textContent = `Points: ${this.formatNumber(points)}`;
  }

  updateLevel(level: number, experience: number, expToNext: number): void {
    this.levelText.textContent = `Level ${level}`;
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

