export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersion();
  }

  private checkVersion(): void {
    const currentVersion = '1.0.0-beta';
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
          <h1>🎮 Welcome to BOBBLE</h1>
          <div class="version-badge">BETA ${version}</div>
        </div>
        <div class="version-splash-body">
          <h2>🌌 The Invasion Begins...</h2>
          <div class="lore-section" style="margin-bottom: 20px; padding: 15px; background: rgba(0, 255, 136, 0.1); border: 2px solid rgba(0, 255, 136, 0.3); border-radius: 8px;">
            <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #fff;">
              <strong>Commander,</strong> these bubblewrap aliens have invaded our profit margins! They're not actually dangerous - just... 
              <em>economically inconvenient</em>. Your mission: pop every single one of them. Build your fleet, upgrade your arsenal, 
              and turn this invasion into pure profit. The universe depends on your clicking skills! 🚀
            </p>
          </div>
          
          <h3 style="margin-top: 25px; margin-bottom: 15px; color: #00ff88;">💡 How to Play</h3>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">👆</div>
              <h3>Click to Attack</h3>
              <p>Click or tap anywhere to fire lasers from your fleet. Each click deals damage to the alien bubblewrap targets!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛒</div>
              <h3>Buy Upgrades</h3>
              <p>Purchase upgrades in the shop to increase damage, add ships, boost crit chance, and unlock powerful abilities!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚔️</div>
              <h3>Defeat Bosses</h3>
              <p>Face massive bosses at regular intervals! Defeat them before time runs out to progress and unlock special rewards!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🌟</div>
              <h3>Ascend for Power</h3>
              <p>Reach level 100 to ascend! Reset your progress but gain Prestige Points to unlock permanent bonuses!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <h3>Complete Missions</h3>
              <p>Complete daily and weekly missions to earn bonus rewards. Check the Missions tab to see your objectives!</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <h3>Customize Your Fleet</h3>
              <p>Unlock and customize visual themes for your ships, lasers, particles, and background as you progress!</p>
            </div>
          </div>
          
          <div class="version-footer" style="margin-top: 25px; padding: 15px; background: rgba(0, 255, 136, 0.05); border-radius: 8px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #aaa;">
              <strong style="color: #00ff88;">💡 Pro Tip:</strong> Use the buy quantity selector (1x, 5x, 10x, MAX) to purchase multiple upgrades at once! 
              Auto-Buy can be unlocked in the Ascension Store for 50 Prestige Points. Good luck, Commander! 🚀
            </p>
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
