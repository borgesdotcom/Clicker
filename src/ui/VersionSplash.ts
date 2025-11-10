export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersion();
  }

  private checkVersion(): void {
    const currentVersion = '1.10.0-beta';
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');

    if (lastSeenVersion !== currentVersion) {
      this.showSplash(currentVersion);
      localStorage.setItem('lastSeenVersion', currentVersion);
    }
  }

  private showSplash(_version: string): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'version-splash';
    this.overlay.innerHTML = `
      <div class="version-splash-content">
        <div class="version-splash-header">
          <h1>🎮 Welcome to BOBBLE</h1>
          <div class="version-badge">Release Beta 1.10.0</div>
        </div>
        <div class="version-splash-body">
          <h2>🆕 What's New in 1.10.0 (Beta)</h2>
          <div class="changelog-section">
            <h3>👾 New Enemy Archetypes</h3>
            <ul>
              <li>🌀 <strong>Guardian</strong> – shielded core that shrugs off click damage.</li>
              <li>💰 <strong>Hoarder</strong> – ultra-rare loot bubble that always drops a power-up.</li>
              <li>All special aliens now show a mini badge above their HP bar so you can react instantly.</li>
            </ul>
          </div>

          <div class="changelog-section">
            <h3>⚙️ Gameplay Tweaks</h3>
            <ul>
              <li>Boss hold warning now explains the 90% XP slowdown while you rematch.</li>
              <li>Scout, Tank, Healer, Guardian, and Hoarder stats retuned for clearer identities.</li>
              <li>Hoarder spawn rate reduced 10× to keep guaranteed loot exciting.</li>
            </ul>
          </div>

          <div class="changelog-section">
            <h3>🎨 UI & Feedback</h3>
            <ul>
              <li>Enemy effect tags now use concise emoji labels in every language.</li>
              <li>Simplified special-alien overlays to spotlight their mechanics.</li>
              <li>Version badge and splash updated to highlight the new feature set.</li>
            </ul>
          </div>

          <div class="version-footer" style="margin-top: 25px; padding: 15px; background: rgba(255, 0, 255, 0.05); border-radius: 8px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #aaa;">
              <strong style="color: #ffffff; text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);">💡 Tip:</strong> Watch the icon above an alien’s HP bar—pink sparkles mean free loot is guaranteed!
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
