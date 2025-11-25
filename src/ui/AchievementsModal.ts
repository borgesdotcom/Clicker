/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { AchievementSystem } from '../systems/AchievementSystem';
import { images } from '../assets/images';

export class AchievementsModal {
  private modal: HTMLElement;
  private achievementSystem: AchievementSystem;

  constructor(achievementSystem: AchievementSystem) {
    this.achievementSystem = achievementSystem;
    this.modal = this.createModal();
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'achievements-modal';
    modal.className = 'achievements-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content achievements-content">
        <div class="modal-header">
          <h2><img src="${images.trophy}" alt="Achievements" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;" /> Achievements</h2>
          <button class="modal-close" id="achievements-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="achievements-progress">
          <div class="progress-text">
            <span id="achievements-count">0/0</span>
            <span id="achievements-percent">0%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="achievements-progress-bar"></div>
          </div>
        </div>
        <div class="achievements-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="combat">Combat</button>
          <button class="filter-btn" data-filter="progression">Progression</button>
          <button class="filter-btn" data-filter="collection">Collection</button>
          <button class="filter-btn" data-filter="mastery">Mastery</button>
          <button class="filter-btn" data-filter="secret">Secret</button>
        </div>
        <div class="achievements-grid" id="achievements-grid"></div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  private setupEventListeners(): void {
    const closeBtn = this.modal.querySelector('#achievements-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }


    const filterBtns = this.modal.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const filter = target.dataset.filter;

        filterBtns.forEach((b) => {
          b.classList.remove('active');
        });
        target.classList.add('active');

        this.applyFilter(filter || 'all');
      });
    });
  }

  private applyFilter(filter: string): void {
    const grid = this.modal.querySelector('#achievements-grid');
    if (!grid) return;

    const items = grid.querySelectorAll('.achievement-item');
    items.forEach((item) => {
      const htmlItem = item as HTMLElement;
      if (filter === 'all' || htmlItem.dataset.category === filter) {
        htmlItem.style.display = '';
      } else {
        htmlItem.style.display = 'none';
      }
    });
  }

  show(): void {
    this.update();
    document.body.style.overflow = 'hidden';
    this.modal.style.display = 'flex';
    // Use requestAnimationFrame to ensure display is set before animation
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
  }

  hide(): void {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    // Wait for animation to complete
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
  }

  update(): void {
    const achievements = this.achievementSystem.getAchievements();
    const grid = this.modal.querySelector('#achievements-grid');
    if (!grid) return;

    // Update progress
    const count = this.achievementSystem.getUnlockedCount();
    const total = this.achievementSystem.getTotalCount();
    const percent = this.achievementSystem.getProgress();

    const countEl = this.modal.querySelector('#achievements-count');
    const percentEl = this.modal.querySelector('#achievements-percent');
    const progressBar = this.modal.querySelector(
      '#achievements-progress-bar',
    ) as HTMLElement;

    if (countEl) countEl.textContent = `${count}/${total}`;
    if (percentEl) percentEl.textContent = `${Math.floor(percent)}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    // Render achievements
    grid.innerHTML = achievements
      .map((achievement) => {
        const isLocked = !achievement.unlocked;
        const isHidden = isLocked && achievement.hidden;

        const iconImg = `<img src="${achievement.icon}" alt="Star" style="width: 64px; height: 64px; image-rendering: pixelated;" />`;
        
        return `
        <div class="achievement-item ${isLocked ? 'locked' : 'unlocked'}" data-category="${achievement.category}">
          <div class="achievement-icon-large ${isLocked ? 'grayscale' : ''}">${iconImg}</div>
          <div class="achievement-details">
            <div class="achievement-item-name">${isHidden ? '???' : achievement.name}</div>
            <div class="achievement-item-desc">${isHidden ? 'Hidden achievement' : achievement.description}</div>
            <div class="achievement-category-badge ${achievement.category}">${this.getCategoryLabel(achievement.category)}</div>
          </div>
          ${isLocked ? '' : '<div class="achievement-checkmark">✓</div>'}
        </div>
      `;
      })
      .join('');
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      combat: 'Combat',
      progression: 'Progression',
      collection: 'Collection',
      mastery: 'Mastery',
      secret: 'Secret',
    };
    return labels[category] || category;
  }
}
