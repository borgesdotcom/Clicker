import type { GameState, ThemeCategory } from '../types';
import { VisualCustomizationSystem } from '../systems/VisualCustomizationSystem';

export class CustomizationModal {
  private modal: HTMLElement | null = null;
  private customizationSystem: VisualCustomizationSystem;
  private currentState: GameState | null = null;
  private onThemeChange?: (category: ThemeCategory, themeId: string) => void;

  constructor(customizationSystem: VisualCustomizationSystem) {
    this.customizationSystem = customizationSystem;
    this.createModal();
  }

  setOnThemeChange(callback: (category: ThemeCategory, themeId: string) => void): void {
    this.onThemeChange = callback;
  }

  updateState(state: GameState): void {
    this.currentState = state;
    this.customizationSystem.updateUnlocks(state);
    this.render();
  }

  show(): void {
    if (!this.modal) return;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hide(): void {
    if (!this.modal) return;
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.className = 'customization-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content customization-modal-content">
        <div class="modal-header">
          <h2>🎨 Visual Customization</h2>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body customization-body">
          <div class="customization-tabs">
            <button class="customization-tab active" data-category="ship">
              <span class="tab-icon">🛸</span>
              <span class="tab-label">Ships</span>
            </button>
            <button class="customization-tab" data-category="laser">
              <span class="tab-icon">⚡</span>
              <span class="tab-label">Lasers</span>
            </button>
            <button class="customization-tab" data-category="particle">
              <span class="tab-icon">✨</span>
              <span class="tab-label">Particles</span>
            </button>
            <button class="customization-tab" data-category="background">
              <span class="tab-icon">🌌</span>
              <span class="tab-label">Background</span>
            </button>
          </div>
          <div class="customization-themes" id="customization-themes"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Close button
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Overlay click
    const overlay = this.modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.hide());
    }

    // Tab switching
    const tabs = this.modal.querySelectorAll('.customization-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const category = (tab as HTMLElement).dataset.category as ThemeCategory;
        if (category) {
          this.switchTab(category);
        }
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.style.display === 'flex') {
        this.hide();
      }
    });
  }

  private switchTab(category: ThemeCategory): void {
    // Update tab active states
    const tabs = this.modal?.querySelectorAll('.customization-tab');
    tabs?.forEach((tab) => {
      if ((tab as HTMLElement).dataset.category === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.renderCategory(category);
  }

  private render(): void {
    const currentTab = this.modal?.querySelector('.customization-tab.active');
    const category = (currentTab as HTMLElement)?.dataset.category as ThemeCategory;
    if (category) {
      this.renderCategory(category);
    }
  }

  private renderCategory(category: ThemeCategory): void {
    const container = document.getElementById('customization-themes');
    if (!container) return;

    const themes = this.customizationSystem.getThemesForCategory(category);
    const selectedTheme = this.customizationSystem.getSelectedTheme(category);

    container.innerHTML = '';

    themes.forEach((theme) => {
      const unlocked = this.customizationSystem.isUnlocked(theme.id);
      const isSelected = selectedTheme?.id === theme.id;
      const unlockProgress = this.currentState
        ? this.customizationSystem.getUnlockProgress(theme, this.currentState)
        : { progress: 0, max: 1, description: '' };

      const progressPercent = unlockProgress.max > 0 ? (unlockProgress.progress / unlockProgress.max) * 100 : 0;

      const themeCard = document.createElement('div');
      themeCard.className = `theme-card ${unlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
      
      if (unlocked && isSelected) {
        themeCard.classList.add('active');
      }

      themeCard.innerHTML = `
        <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary})">
          <div class="theme-icon">${theme.icon}</div>
          ${!unlocked ? '<div class="theme-lock">🔒</div>' : ''}
          ${isSelected ? '<div class="theme-check">✓</div>' : ''}
        </div>
        <div class="theme-info">
          <h3 class="theme-name">${theme.name}</h3>
          <p class="theme-description">${theme.description}</p>
          ${!unlocked ? `
            <div class="theme-unlock-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, progressPercent)}%"></div>
              </div>
              <span class="progress-text">${unlockProgress.description}</span>
            </div>
          ` : ''}
        </div>
      `;

      if (unlocked) {
        themeCard.addEventListener('click', () => {
          this.selectTheme(category, theme.id);
        });
        themeCard.style.cursor = 'pointer';
      }

      container.appendChild(themeCard);
    });

    if (themes.length === 0) {
      container.innerHTML = '<p class="no-themes">No themes available for this category.</p>';
    }
  }

  private selectTheme(category: ThemeCategory, themeId: string): void {
    if (this.customizationSystem.selectTheme(category, themeId)) {
      if (this.onThemeChange) {
        this.onThemeChange(category, themeId);
      }
      this.render(); // Re-render to update selected state
    }
  }
}
