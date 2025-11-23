import { i18n } from '../core/I18n';
import { generateIconUrl } from '../utils/IconGenerator';
import {
  ALIEN_SPRITE_NORMAL,
  POWERUP_SPRITE_DAMAGE,
  POWERUP_SPRITE_POINTS,
  BOSS_SPRITE_COLOSSUS,
} from '../render/AlienSprites';

export class VersionSplash {
  private overlay: HTMLElement | null = null;

  constructor() {
    this.checkVersionOrTutorial();
  }

  private checkVersionOrTutorial(): void {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');

    // First-time user - show tutorial
    if (!hasSeenTutorial) {
      this.showTutorial();
      localStorage.setItem('hasSeenTutorial', 'true');
      return;
    }

    // Returning user - check version
    const currentVersion = '1.11.0-beta';
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');

    if (lastSeenVersion !== currentVersion) {
      this.showVersionSplash(currentVersion);
      localStorage.setItem('lastSeenVersion', currentVersion);
    }
  }

  private showTutorial(): void {
    // Generate pixel art icons
    const alienIcon = generateIconUrl(ALIEN_SPRITE_NORMAL, '#00ff88', 48);
    const shopIcon = generateIconUrl(POWERUP_SPRITE_POINTS, '#ffcc00', 48);
    const powerUpIcon = generateIconUrl(POWERUP_SPRITE_DAMAGE, '#ff4444', 48);
    const bossIcon = generateIconUrl(BOSS_SPRITE_COLOSSUS, '#ff00ff', 48);

    this.overlay = document.createElement('div');
    this.overlay.className = 'version-splash';
    this.overlay.innerHTML = `
      <div class="version-splash-content">
        <div class="version-splash-header">
          <h1>${i18n.t('tutorialSplash.welcome')}</h1>
          <p style="font-size: 14px; opacity: 0.8; margin-top: 8px;">${i18n.t('tutorialSplash.subtitle')}</p>
        </div>
        <div class="version-splash-body" style="padding: 20px 30px;">
          <div class="tutorial-steps">
            <!-- Step 1: Click to Attack -->
            <div class="tutorial-step">
              <div class="tutorial-icon">
                <img src="${alienIcon}" alt="Alien" style="width: 48px; height: 48px; image-rendering: pixelated;">
              </div>
              <div class="tutorial-text">
                <h3>${i18n.t('tutorialSplash.step1Title')}</h3>
                <p>${i18n.t('tutorialSplash.step1Desc')}</p>
              </div>
            </div>

            <!-- Step 2: Build Fleet -->
            <div class="tutorial-step">
              <div class="tutorial-icon">
                <img src="${shopIcon}" alt="Shop" style="width: 48px; height: 48px; image-rendering: pixelated;">
              </div>
              <div class="tutorial-text">
                <h3>${i18n.t('tutorialSplash.step2Title')}</h3>
                <p>${i18n.t('tutorialSplash.step2Desc')}</p>
              </div>
            </div>

            <!-- Step 3: Collect Power-Ups -->
            <div class="tutorial-step">
              <div class="tutorial-icon">
                <img src="${powerUpIcon}" alt="Power-Up" style="width: 48px; height: 48px; image-rendering: pixelated;">
              </div>
              <div class="tutorial-text">
                <h3>${i18n.t('tutorialSplash.step3Title')}</h3>
                <p>${i18n.t('tutorialSplash.step3Desc')}</p>
              </div>
            </div>

            <!-- Step 4: Defeat Bosses -->
            <div class="tutorial-step">
              <div class="tutorial-icon">
                <img src="${bossIcon}" alt="Boss" style="width: 48px; height: 48px; image-rendering: pixelated;">
              </div>
              <div class="tutorial-text">
                <h3>${i18n.t('tutorialSplash.step4Title')}</h3>
                <p>${i18n.t('tutorialSplash.step4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
        <button class="version-splash-close">${i18n.t('tutorialSplash.startButton')}</button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('.version-splash-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });
  }

  private showVersionSplash(_version: string): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'version-splash';
    this.overlay.innerHTML = `
      <div class="version-splash-content">
        <div class="version-splash-header">
          <h1>🎮 Welcome to BOBBLE</h1>
          <div class="version-badge">${i18n.t('versionSplash.welcome')}</div>
        </div>
        <div class="version-splash-body">
          <h2>🆕 ${i18n.t('versionSplash.v111Title')}</h2>
          <div class="changelog-section">
            <h3>⌨️ ${i18n.t('versionSplash.newControl')}</h3>
            <ul>
              <li>🎯 ${i18n.t('versionSplash.holdSpace')}</li>
              <li>${i18n.t('versionSplash.rateLimit')}</li>
              <li>${i18n.t('versionSplash.sustainedCombat')}</li>
            </ul>
          </div>

          <div class="changelog-section">
            <h3>🎨 ${i18n.t('versionSplash.enhancedTutorial')}</h3>
            <ul>
              <li>✨ ${i18n.t('versionSplash.beautifulUI')}</li>
              <li>🌈 ${i18n.t('versionSplash.animatedBorders')}</li>
              <li>💡 ${i18n.t('versionSplash.clearerVisual')}</li>
              <li>📱 ${i18n.t('versionSplash.responsive')}</li>
            </ul>
          </div>

          <div class="changelog-section">
            <h3>🐛 ${i18n.t('versionSplash.bugFixes')}</h3>
            <ul>
              <li>🎭 ${i18n.t('versionSplash.tinyTyrantFix')}</li>
              <li>⚡ ${i18n.t('versionSplash.powerupPerf')}</li>
              <li>🎬 ${i18n.t('versionSplash.screenShakeFix')}</li>
              <li>🌈 ${i18n.t('versionSplash.omegaFilter')}</li>
              <li>🚀 ${i18n.t('versionSplash.rainbowLaser')}</li>
            </ul>
          </div>

          <div class="version-footer" style="margin-top: 25px; padding: 15px; background: rgba(102, 204, 255, 0.05); border-radius: 8px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #aaa;">
              <strong style="color: #ffffff; text-shadow: 0 0 5px rgba(102, 204, 255, 0.5);">💡 Tip:</strong> ${i18n.t('versionSplash.tipSpace')}
            </p>
          </div>
        </div>
        <button class="version-splash-close">${i18n.t('versionSplash.startPlaying')}</button>
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
