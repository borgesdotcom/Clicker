import type { Achievement } from '../types';

export class AchievementSnackbar {
  private queue: Achievement[] = [];
  private currentSnackbar: HTMLElement | null = null;
  private isShowing = false;

  show(achievement: Achievement): void {
    this.queue.push(achievement);
    if (!this.isShowing) {
      this.showNext();
    }
  }

  private showNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievement = this.queue.shift();
    if (!achievement) {
      this.isShowing = false;
      return;
    }

    // Create snackbar element
    const snackbar = document.createElement('div');
    snackbar.className = 'achievement-snackbar';
    snackbar.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      </div>
    `;

    document.body.appendChild(snackbar);
    this.currentSnackbar = snackbar;

    // Trigger animation
    setTimeout(() => {
      snackbar.classList.add('show');
    }, 10);

    // Remove after 4 seconds
    setTimeout(() => {
      snackbar.classList.remove('show');
      setTimeout(() => {
        if (snackbar.parentElement) {
          snackbar.parentElement.removeChild(snackbar);
        }
        this.currentSnackbar = null;
        this.showNext();
      }, 300);
    }, 4000);
  }

  clear(): void {
    this.queue = [];
    if (this.currentSnackbar) {
      if (this.currentSnackbar.parentElement) {
        this.currentSnackbar.parentElement.removeChild(this.currentSnackbar);
      }
      this.currentSnackbar = null;
    }
    this.isShowing = false;
  }
}
