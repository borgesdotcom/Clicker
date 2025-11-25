import { i18n } from '../core/I18n';
import { generateIconUrl } from '../utils/IconGenerator';
import {
  ALIEN_SPRITE_NORMAL,
  POWERUP_SPRITE_DAMAGE,
  POWERUP_SPRITE_POINTS,
  BOSS_SPRITE_COLOSSUS,
} from '../render/AlienSprites';
import { images } from '../assets/images';

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
    const currentVersion = '1.21.0';
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
    this.overlay.className = 'tutorial-modal';
    this.overlay.innerHTML = `
      <div class="modal-content tutorial-modal-content">
        <div class="modal-header tutorial-modal-header">
          <h2>${i18n.t('tutorialSplash.welcome')}</h2>
          <button class="modal-close" id="tutorial-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="modal-body tutorial-modal-body">

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
          <div class="tutorial-gpu-warning" style="margin-top: 20px; padding: 12px; background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 4px; font-size: 12px; color: #ffaa00; font-family: var(--font-family, 'Courier New', monospace);">
            ${i18n.t('tutorialSplash.gpuAccelerationWarning')}
          </div>
          <button class="tutorial-start-btn">${i18n.t('tutorialSplash.startButton')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';
    this.overlay.style.display = 'flex';
    this.overlay.classList.add('show');

    const closeBtn = this.overlay.querySelector('#tutorial-close');
    const startBtn = this.overlay.querySelector('.tutorial-start-btn');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });
    startBtn?.addEventListener('click', () => {
      this.hide();
    });
  }

  private showVersionSplash(_version: string): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-modal';
    this.overlay.innerHTML = `
      <div class="modal-content tutorial-modal-content">
        <div class="modal-header tutorial-modal-header">
          <h2>Welcome to BOBBLE</h2>
          <button class="modal-close" id="version-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="modal-body tutorial-modal-body">
          <h2 style="text-align: center; color: #FFFAE5; margin-bottom: 20px; font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 1px;">${i18n.t('versionSplash.v121Title')}</h2>
          <div class="changelog-section">
            <h3>${i18n.t('versionSplash.accessibility')}</h3>
            <ul>
              <li>${i18n.t('versionSplash.accessibilityFont')}</li>
              <li>${i18n.t('versionSplash.accessibilityScreenShake')}</li>
            </ul>
            <h3 style="margin-top: 15px;">${i18n.t('versionSplash.hudUpdates')}</h3>
            <ul>
              <li>${i18n.t('versionSplash.hudImprovements')}</li>
            </ul>
            <h3 style="margin-top: 15px;">${i18n.t('versionSplash.newContent')}</h3>
            <ul>
              <li>${i18n.t('versionSplash.newBossLevel5')}</li>
            </ul>
            <h3 style="margin-top: 15px;">${i18n.t('versionSplash.optimizations')}</h3>
            <ul>
              <li>${i18n.t('versionSplash.generalOptimizations')}</li>
            </ul>
          </div>
          <button class="tutorial-start-btn">${i18n.t('versionSplash.startPlaying')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';
    this.overlay.style.display = 'flex';
    this.overlay.classList.add('show');

    const closeBtn = this.overlay.querySelector('#version-close');
    const startBtn = this.overlay.querySelector('.tutorial-start-btn');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });
    startBtn?.addEventListener('click', () => {
      this.hide();
    });
  }

  private hide(): void {
    if (this.overlay) {
      this.overlay.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.overlay?.remove();
        this.overlay = null;
      }, 300);
    }
  }
}
