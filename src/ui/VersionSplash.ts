export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersion();
  }

  private checkVersion(): void {
    const currentVersion = '0.0.3';
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
          <div class="version-badge">MAJOR UPDATE</div>
        </div>
        <div class="version-splash-body">
          <h2>Welcome to the Alpha Test!</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <h3>Power-Up System</h3>
              <p>Collect temporary power-ups from defeated enemies! Boost your damage, speed, crit chance, multishot, and points!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <h3>Improved HUD</h3>
              <p>Enhanced heads-up display with real-time power-up buff timers, updated stats, and better visual feedback!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛠️</div>
              <h3>Major Bug Fixes</h3>
              <p>Fixed shop display updates, power-up stacking, attack speed calculations, and multishot mechanics!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚙️</div>
              <h3>Performance Optimizations</h3>
              <p>Improved rendering efficiency, better memory management, and smoother gameplay experience!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎮</div>
              <h3>Debug Panel Updates</h3>
              <p>Added power-up controls to the admin panel for easier testing and debugging!</p>
            </div>
          </div>
          <div class="version-footer">
            <p>Thank you for playing! Collect power-ups to boost your performance and enjoy the improved experience!</p>
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
