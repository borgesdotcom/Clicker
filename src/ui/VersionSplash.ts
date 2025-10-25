export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersion();
  }

  private checkVersion(): void {
    const currentVersion = '0.0.2';
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
          <h2>Welcome to the Official Release!</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🌌</div>
              <h3>Animated Space Background</h3>
              <p>Explore the cosmos with beautiful star fields, nebulae, and shooting comets!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👾</div>
              <h3>New Enemy Types</h3>
              <p>Face Fast Scouts, Armored Tanks, and Regenerators with unique abilities!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <h3>Mission System</h3>
              <p>Complete daily missions and regular quests for amazing rewards!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✨</div>
              <h3>Artifact System</h3>
              <p>Discover and upgrade powerful artifacts with permanent bonuses!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👹</div>
              <h3>Enhanced Bosses</h3>
              <p>Experience more challenging boss battles with unique mechanics!</p>
            </div>
          </div>
          <div class="version-footer">
            <p>Thank you for playing! Enjoy the new features and have fun conquering the galaxy!</p>
          </div>
        </div>
        <button class="version-splash-close">Start Playing!</button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('.version-splash-close');
    closeBtn?.addEventListener('click', () => this.hide());
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
