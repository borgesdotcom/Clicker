import type { GameState } from '../types';

export class StatsPanel {
  private modalElement: HTMLElement | null = null;
  private isOpen = false;

  constructor() {
    this.createModal();
    this.setupButton();
  }

  private setupButton(): void {
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
  }

  private createModal(): void {
    // Create modal
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal stats-modal';
    this.modalElement.style.display = 'none';
    
    // Close on background click
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.hide();
      }
    });

    // Modal content
    const content = document.createElement('div');
    content.className = 'modal-content stats-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const title = document.createElement('h2');
    title.textContent = '📊 Statistics';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.hide());
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // Stats container
    const statsContainer = document.createElement('div');
    statsContainer.id = 'stats-container';
    statsContainer.className = 'stats-container';
    
    content.appendChild(header);
    content.appendChild(statsContainer);
    this.modalElement.appendChild(content);
    
    document.body.appendChild(this.modalElement);
  }

  public toggle(): void {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  public show(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'flex';
      this.isOpen = true;
      this.render();
    }
  }

  public hide(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
      this.isOpen = false;
    }
  }

  public update(state: GameState): void {
    if (this.isOpen) {
      this.render();
    }
  }

  private render(): void {
    const container = document.getElementById('stats-container');
    if (!container) return;

    // Get state from somewhere - for now we'll get it from the game
    const stateStr = localStorage.getItem('alien-clicker-save');
    if (!stateStr) return;
    
    const state = JSON.parse(stateStr) as GameState;

    container.innerHTML = '';

    // Create stats categories
    const categories = [
      {
        title: '⚔️ Combat Stats',
        stats: [
          { label: 'Total Clicks', value: this.formatNumber(state.stats.totalClicks) },
          { label: 'Total Damage', value: this.formatNumber(state.stats.totalDamage) },
          { label: 'Aliens Killed', value: this.formatNumber(state.stats.aliensKilled) },
          { label: 'Bosses Defeated', value: this.formatNumber(state.stats.bossesKilled) },
          { label: 'Critical Hits', value: this.formatNumber(state.stats.criticalHits) },
        ],
      },
      {
        title: '📈 Progression Stats',
        stats: [
          { label: 'Current Level', value: state.level.toString() },
          { label: 'Max Level Reached', value: state.stats.maxLevel.toString() },
          { label: 'Total Experience', value: this.formatNumber(Math.floor(state.experience)) },
          { label: 'Play Time', value: this.formatTime(state.stats.playTime) },
        ],
      },
      {
        title: '🛸 Fleet Stats',
        stats: [
          { label: 'Ships', value: state.shipsCount.toString() },
          { label: 'Attack Speed Level', value: state.attackSpeedLevel.toString() },
          { label: 'Damage Level', value: state.pointMultiplierLevel.toString() },
          { label: 'Crit Level', value: state.critChanceLevel.toString() },
          { label: 'Passive Gen Level', value: state.resourceGenLevel.toString() },
          { label: 'XP Boost Level', value: state.xpBoostLevel.toString() },
        ],
      },
      {
        title: '🔬 Technology Stats',
        stats: [
          { label: 'Total Upgrades', value: this.formatNumber(state.stats.totalUpgrades) },
          { label: 'Special Technologies', value: `${state.stats.totalSubUpgrades} / 33` },
          { label: 'Technology Progress', value: `${Math.floor((state.stats.totalSubUpgrades / 33) * 100)}%` },
        ],
      },
      {
        title: '💰 Wealth Stats',
        stats: [
          { label: 'Current Points', value: this.formatNumber(state.points) },
          { label: 'Total Points Earned', value: this.formatNumber(state.stats.totalDamage) },
        ],
      },
    ];

    // Render each category
    for (const category of categories) {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'stats-category';

      const categoryTitle = document.createElement('h3');
      categoryTitle.className = 'stats-category-title';
      categoryTitle.textContent = category.title;
      categoryEl.appendChild(categoryTitle);

      const statsGrid = document.createElement('div');
      statsGrid.className = 'stats-grid';

      for (const stat of category.stats) {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = stat.label;

        const value = document.createElement('div');
        value.className = 'stat-value';
        value.textContent = stat.value;

        statItem.appendChild(label);
        statItem.appendChild(value);
        statsGrid.appendChild(statItem);
      }

      categoryEl.appendChild(statsGrid);
      container.appendChild(categoryEl);
    }
  }

  private formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

