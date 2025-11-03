export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersion();
  }

  private checkVersion(): void {
    const currentVersion = '0.0.4';
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');

    if (lastSeenVersion !== currentVersion) {
      this.showSplash(currentVersion);
      localStorage.setItem('lastSeenVersion', currentVersion);
    }
  }

  private showSplash(version: string): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'version-splash';
    this.overlay.innerHTML = `
      <div class="version-splash-content">
        <div class="version-splash-header">
          <h1>🚀 VERSION ${version}</h1>
          <div class="version-badge">FEATURE UPDATE</div>
        </div>
        <div class="version-splash-body">
          <h2>UI Improvements & New Features!</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🌍</div>
              <h3>Internationalization</h3>
              <p>Full multi-language support! Play in English, Portuguese, Spanish, and more. The game automatically detects your language preference!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⏰</div>
              <h3>Offline Progress</h3>
              <p>Your progress continues even when you're away! Get rewarded for offline time with passive generation bonuses!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚔️</div>
              <h3>Boss Retry Button Redesigned</h3>
              <p>The boss retry button is now integrated with other HUD buttons for a cleaner, more organized interface!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <h3>Improved Button Design</h3>
              <p>Buttons now use elegant tooltips instead of expanding horizontally, preventing layout shifts and keeping everything neat!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <h3>Mobile Support Enhanced</h3>
              <p>Boss retry button now appears in the mobile menu, ensuring all features are accessible on mobile devices!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✨</div>
              <h3>Consistent Button Layout</h3>
              <p>All buttons maintain a perfect square grid layout - no more buttons pushing each other around on hover!</p>
            </div>
          </div>
          <div class="version-footer">
            <p>Enjoy the improved interface and new features! The game now supports multiple languages and rewards you for offline progress!</p>
          </div>
        </div>
        <button class="version-splash-close">Start Playing!</button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('.version-splash-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });
  }

  private hide(): void {
    if (this.overlay) {
      this.overlay.classList.add('fade-out');
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
      }, 500);
    }
  }
}
