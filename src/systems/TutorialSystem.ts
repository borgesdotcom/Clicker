import { Store } from '../core/Store';
import { t } from '../core/I18n';

export type TutorialStep =
  | 'click_alien'
  | 'buy_upgrade'
  | 'boss_warning'
  | 'completed';

export class TutorialSystem {
  private store: Store;
  private currentStep: TutorialStep = 'click_alien';
  private overlay: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private active = false;

  constructor(store: Store) {
    this.store = store;

    // Check if tutorial is already completed
    const state = this.store.getState();
    if (state.tutorialCompleted) {
      this.currentStep = 'completed';
      return;
    }

    this.createOverlay();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    document.body.appendChild(this.overlay);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    document.body.appendChild(this.tooltip);
  }

  public start(): void {
    if (this.currentStep === 'completed') return;
    this.active = true;
    this.showStep(this.currentStep);
  }

  private showStep(step: TutorialStep): void {
    if (!this.tooltip || !this.active) return;

    this.currentStep = step;
    this.tooltip.style.display = 'block';
    this.tooltip.className = 'tutorial-tooltip bounce';

    switch (step) {
      case 'click_alien':
        this.highlightElement(
          'game-canvas',
          t('tutorial.clickAlien'),
          'top',
        );
        break;
      case 'buy_upgrade':
        // Check if shop is already open
        const shopPanel = document.getElementById('shop-panel');
        const isCollapsed = shopPanel?.classList.contains('desktop-collapsed');

        if (shopPanel && !isCollapsed) {
          // Shop is open, point to the content
          this.highlightElement(
            'shop-content',
            t('tutorial.buyUpgrade'),
            'left',
          );
        } else {
          // Shop is closed, point to the toggle
          this.highlightElement(
            'desktop-shop-toggle',
            t('tutorial.openShop'),
            'right',
          );
        }
        break;
      case 'boss_warning':
        // This is triggered by external events (boss spawn)
        this.highlightElement(
          'boss-timer-hud',
          t('tutorial.bossWarning'),
          'bottom',
        );
        break;
      case 'completed':
        this.complete();
        break;
    }
  }

  private highlightElement(
    elementId: string,
    text: string,
    position: 'top' | 'bottom' | 'left' | 'right',
  ): void {
    const element = document.getElementById(elementId);
    if (!element || !this.tooltip) return;

    const rect = element.getBoundingClientRect();
    this.tooltip.textContent = text;

    // Position tooltip
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 15;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 15;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 15;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 15;
        break;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;

    // Add arrow class
    this.tooltip.classList.remove(
      'arrow-top',
      'arrow-bottom',
      'arrow-left',
      'arrow-right',
    );
    this.tooltip.classList.add(`arrow-${position}`);
  }

  public onAlienClicked(): void {
    if (this.currentStep === 'click_alien') {
      // Advance after a few clicks
      const state = this.store.getState();
      if (state.points >= 10) {
        this.showStep('buy_upgrade');
      }
    }
  }

  public onShopOpened(): void {
    if (this.currentStep === 'buy_upgrade') {
      // If shop is opened, update the tooltip to point to the content
      const shopPanel = document.getElementById('shop-panel');
      const isCollapsed = shopPanel?.classList.contains('desktop-collapsed');

      if (shopPanel && !isCollapsed) {
        this.highlightElement(
          'shop-content',
          t('tutorial.buyUpgrade'),
          'left',
        );
      }
    }
  }

  public onUpgradeBought(): void {
    if (this.currentStep === 'buy_upgrade') {
      this.complete();
    }
  }

  public complete(): void {
    this.active = false;
    this.currentStep = 'completed';
    if (this.overlay) this.overlay.style.display = 'none';
    if (this.tooltip) this.tooltip.style.display = 'none';

    // Save completion state
    const state = this.store.getState();
    state.tutorialCompleted = true;
    this.store.setState(state);
  }
}
