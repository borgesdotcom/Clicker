import type { SoundManager } from '../systems/SoundManager';
import { i18n, t } from '../core/I18n';
import type { Language } from '../core/I18n';

export class SettingsModal {
  private modal: HTMLElement | null = null;
  private soundManager: SoundManager;
  private volumeSlider: HTMLInputElement | null = null;
  private volumeValue: HTMLSpanElement | null = null;
  private graphicsCallback: ((enabled: boolean) => void) | null = null;
  private shipLasersCallback: ((enabled: boolean) => void) | null = null;
  private damageNumbersCallback: ((enabled: boolean) => void) | null = null;
  private soundCallback: ((enabled: boolean) => void) | null = null;
  private soundtrackCallback: ((enabled: boolean) => void) | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;
  private graphicsToggle: HTMLButtonElement | null = null;
  private shipLasersToggle: HTMLButtonElement | null = null;
  private damageNumbersToggle: HTMLButtonElement | null = null;
  private soundtrackToggle: HTMLButtonElement | null = null;
  private languageSelect: HTMLSelectElement | null = null;

  constructor(soundManager: SoundManager) {
    this.soundManager = soundManager;
    this.createModal();
    
    // Subscribe to language changes (subscription persists for modal lifetime)
    i18n.subscribe(() => {
      this.updateTranslations();
    });
  }

  setGraphicsCallback(callback: (enabled: boolean) => void): void {
    this.graphicsCallback = callback;
  }

  setShipLasersCallback(callback: (enabled: boolean) => void): void {
    this.shipLasersCallback = callback;
  }

  setDamageNumbersCallback(callback: (enabled: boolean) => void): void {
    this.damageNumbersCallback = callback;
  }

  setSoundCallback(callback: (enabled: boolean) => void): void {
    this.soundCallback = callback;
  }

  setSoundtrackCallback(callback: (enabled: boolean) => void): void {
    this.soundtrackCallback = callback;
  }

  setVolumeCallback(callback: (volume: number) => void): void {
    this.volumeCallback = callback;
  }

  updateGraphicsToggles(
    graphics: boolean,
    shipLasers: boolean,
    damageNumbers: boolean,
  ): void {
    if (this.graphicsToggle) {
      this.graphicsToggle.textContent = graphics ? t('common.on') : t('common.off');
      this.graphicsToggle.style.backgroundColor = graphics ? '#4CAF50' : '#666';
    }
    if (this.shipLasersToggle) {
      this.shipLasersToggle.textContent = shipLasers ? t('common.on') : t('common.off');
      this.shipLasersToggle.style.backgroundColor = shipLasers
        ? '#4CAF50'
        : '#666';
    }
    if (this.damageNumbersToggle) {
      this.damageNumbersToggle.textContent = damageNumbers ? t('common.on') : t('common.off');
      this.damageNumbersToggle.style.backgroundColor = damageNumbers
        ? '#4CAF50'
        : '#666';
    }
  }

  private createModal(): void {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'settings-modal';
    this.modal.className = 'modal';
    this.modal.style.display = 'none';

    // Modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '600px';
    content.style.maxHeight = '85vh';
    content.style.overflowY = 'auto';

    // Title
    const title = document.createElement('h2');
    title.textContent = t('settings.title');
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    // Sound section
    const soundSection = document.createElement('div');
    soundSection.style.marginBottom = '25px';

    const soundTitle = document.createElement('h3');
    soundTitle.textContent = t('settings.soundSettings');
    soundTitle.style.marginBottom = '15px';
    soundSection.appendChild(soundTitle);

    // Sound enabled toggle
    const soundToggleContainer = document.createElement('div');
    soundToggleContainer.style.marginBottom = '15px';
    soundToggleContainer.style.display = 'flex';
    soundToggleContainer.style.alignItems = 'center';
    soundToggleContainer.style.justifyContent = 'space-between';

    const soundLabel = document.createElement('label');
    soundLabel.textContent = t('settings.soundEnabled');
    soundLabel.style.fontSize = '16px';

    const soundToggle = document.createElement('button');
    soundToggle.className = 'modal-button';
    soundToggle.textContent = this.soundManager.isEnabled() ? t('common.on') : t('common.off');
    soundToggle.style.width = '80px';
    soundToggle.addEventListener('click', () => {
      const newState = !this.soundManager.isEnabled();
      this.soundManager.setEnabled(newState);
      soundToggle.textContent = newState ? t('common.on') : t('common.off');
      soundToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.soundCallback) {
        this.soundCallback(newState);
      }
    });
    soundToggle.style.backgroundColor = this.soundManager.isEnabled()
      ? '#4CAF50'
      : '#666';

    soundToggleContainer.appendChild(soundLabel);
    soundToggleContainer.appendChild(soundToggle);
    soundSection.appendChild(soundToggleContainer);

    const soundHint = document.createElement('div');
    soundHint.textContent = t('settings.soundEnabledHint');
    soundHint.style.fontSize = '12px';
    soundHint.style.color = '#888';
    soundHint.style.marginTop = '5px';
    soundHint.style.marginBottom = '15px';
    soundSection.appendChild(soundHint);

    // Soundtrack toggle
    const soundtrackToggleContainer = document.createElement('div');
    soundtrackToggleContainer.style.marginBottom = '15px';
    soundtrackToggleContainer.style.display = 'flex';
    soundtrackToggleContainer.style.alignItems = 'center';
    soundtrackToggleContainer.style.justifyContent = 'space-between';

    const soundtrackLabel = document.createElement('label');
    soundtrackLabel.textContent = t('settings.backgroundMusic');
    soundtrackLabel.style.fontSize = '16px';

    this.soundtrackToggle = document.createElement('button');
    this.soundtrackToggle.className = 'modal-button';
    this.soundtrackToggle.textContent = this.soundManager.isSoundtrackEnabled()
      ? t('common.on')
      : t('common.off');
    this.soundtrackToggle.style.width = '80px';
    this.soundtrackToggle.addEventListener('click', () => {
      if (!this.soundtrackToggle) return;
      const newState = !this.soundManager.isSoundtrackEnabled();
      this.soundManager.setSoundtrackEnabled(newState);
      this.soundtrackToggle.textContent = newState ? t('common.on') : t('common.off');
      this.soundtrackToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.soundtrackCallback) {
        this.soundtrackCallback(newState);
      }
    });
    this.soundtrackToggle.style.backgroundColor = this.soundManager.isSoundtrackEnabled()
      ? '#4CAF50'
      : '#666';

    soundtrackToggleContainer.appendChild(soundtrackLabel);
    soundtrackToggleContainer.appendChild(this.soundtrackToggle);
    soundSection.appendChild(soundtrackToggleContainer);

    const soundtrackHint = document.createElement('div');
    soundtrackHint.textContent = t('settings.backgroundMusicHint');
    soundtrackHint.style.fontSize = '12px';
    soundtrackHint.style.color = '#888';
    soundtrackHint.style.marginTop = '5px';
    soundtrackHint.style.marginBottom = '15px';
    soundSection.appendChild(soundtrackHint);

    // Volume slider
    const volumeContainer = document.createElement('div');
    volumeContainer.style.marginBottom = '15px';

    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = t('settings.volume');
    volumeLabel.style.display = 'block';
    volumeLabel.style.marginBottom = '8px';
    volumeLabel.style.fontSize = '16px';
    volumeContainer.appendChild(volumeLabel);

    const sliderRow = document.createElement('div');
    sliderRow.style.display = 'flex';
    sliderRow.style.alignItems = 'center';
    sliderRow.style.gap = '10px';

    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.value = String(
      Math.round(this.soundManager.getVolume() * 100),
    );
    this.volumeSlider.style.flex = '1';
    this.volumeSlider.style.cursor = 'pointer';

    this.volumeValue = document.createElement('span');
    this.volumeValue.textContent = `${this.volumeSlider.value}%`;
    this.volumeValue.style.minWidth = '45px';
    this.volumeValue.style.textAlign = 'right';
    this.volumeValue.style.fontSize = '14px';

    // Use arrow function to maintain this context
    this.volumeSlider.addEventListener('input', () => {
      const sliderValue = this.volumeSlider?.value ?? '30';
      const value = parseInt(sliderValue) / 100;
      this.soundManager.setVolume(value);
      if (this.volumeValue) {
        this.volumeValue.textContent = sliderValue + '%';
      }
      if (this.volumeCallback) {
        this.volumeCallback(value);
      }
      // Play a test sound to hear the volume change
      this.soundManager.playClick();
    });

    sliderRow.appendChild(this.volumeSlider);
    sliderRow.appendChild(this.volumeValue);
    volumeContainer.appendChild(sliderRow);
    soundSection.appendChild(volumeContainer);

    content.appendChild(soundSection);

    // Language section
    const languageSection = document.createElement('div');
    languageSection.style.marginBottom = '25px';

    const languageTitle = document.createElement('h3');
    languageTitle.textContent = t('settings.languageSettings');
    languageTitle.style.marginBottom = '15px';
    languageSection.appendChild(languageTitle);

    const languageContainer = document.createElement('div');
    languageContainer.style.marginBottom = '15px';
    languageContainer.style.display = 'flex';
    languageContainer.style.alignItems = 'center';
    languageContainer.style.justifyContent = 'space-between';

    const languageLabel = document.createElement('label');
    languageLabel.textContent = t('settings.language');
    languageLabel.style.fontSize = '16px';

    this.languageSelect = document.createElement('select');
    this.languageSelect.className = 'modal-button';
    this.languageSelect.style.width = '200px';
    this.languageSelect.style.padding = '8px';
    
    const languages: { code: Language; name: string }[] = [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' },
      { code: 'es', name: 'Español' },
    ];

    languages.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.name;
      if (i18n.getLanguage() === lang.code) {
        option.selected = true;
      }
      if (this.languageSelect) {
        this.languageSelect.appendChild(option);
      }
    });

    this.languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const newLang = target.value as Language;
      i18n.setLanguage(newLang);
      // Reload page to apply language changes fully
      window.location.reload();
    });

    languageContainer.appendChild(languageLabel);
    languageContainer.appendChild(this.languageSelect);
    languageSection.appendChild(languageContainer);

    const languageHint = document.createElement('div');
    languageHint.textContent = t('settings.languageHint');
    languageHint.style.fontSize = '12px';
    languageHint.style.color = '#888';
    languageHint.style.marginTop = '5px';
    languageHint.style.marginBottom = '15px';
    languageSection.appendChild(languageHint);

    content.appendChild(languageSection);

    // Graphics section
    const graphicsSection = document.createElement('div');
    graphicsSection.style.marginBottom = '25px';

    const graphicsTitle = document.createElement('h3');
    graphicsTitle.textContent = t('settings.graphicsSettings');
    graphicsTitle.style.marginBottom = '15px';
    graphicsSection.appendChild(graphicsTitle);

    // High graphics toggle
    const graphicsToggleContainer = document.createElement('div');
    graphicsToggleContainer.style.marginBottom = '10px';
    graphicsToggleContainer.style.display = 'flex';
    graphicsToggleContainer.style.alignItems = 'center';
    graphicsToggleContainer.style.justifyContent = 'space-between';

    const graphicsLabel = document.createElement('label');
    graphicsLabel.textContent = t('settings.highGraphics');
    graphicsLabel.style.fontSize = '16px';

    this.graphicsToggle = document.createElement('button');
    this.graphicsToggle.className = 'modal-button';
    this.graphicsToggle.textContent = t('common.on');
    this.graphicsToggle.style.width = '80px';
    this.graphicsToggle.style.backgroundColor = '#4CAF50';

    this.graphicsToggle.addEventListener('click', () => {
      if (!this.graphicsToggle) return;
      const newState = this.graphicsToggle.textContent === t('common.off');
      this.graphicsToggle.textContent = newState ? t('common.on') : t('common.off');
      this.graphicsToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.graphicsCallback) {
        this.graphicsCallback(newState);
      }
    });

    graphicsToggleContainer.appendChild(graphicsLabel);
    graphicsToggleContainer.appendChild(this.graphicsToggle);
    graphicsSection.appendChild(graphicsToggleContainer);

    const graphicsHint = document.createElement('div');
    graphicsHint.textContent = t('settings.highGraphicsHint');
    graphicsHint.style.fontSize = '12px';
    graphicsHint.style.color = '#888';
    graphicsHint.style.marginTop = '5px';
    graphicsSection.appendChild(graphicsHint);

    // Ship lasers toggle
    const shipLasersContainer = document.createElement('div');
    shipLasersContainer.style.marginBottom = '10px';
    shipLasersContainer.style.display = 'flex';
    shipLasersContainer.style.alignItems = 'center';
    shipLasersContainer.style.justifyContent = 'space-between';

    const shipLasersLabel = document.createElement('label');
    shipLasersLabel.textContent = t('settings.shipLasers');
    shipLasersLabel.style.fontSize = '16px';

    this.shipLasersToggle = document.createElement('button');
    this.shipLasersToggle.className = 'modal-button';
    this.shipLasersToggle.textContent = t('common.on');
    this.shipLasersToggle.style.width = '80px';
    this.shipLasersToggle.style.backgroundColor = '#4CAF50';

    this.shipLasersToggle.addEventListener('click', () => {
      if (!this.shipLasersToggle) return;
      const newState = this.shipLasersToggle.textContent === t('common.off');
      this.shipLasersToggle.textContent = newState ? t('common.on') : t('common.off');
      this.shipLasersToggle.style.backgroundColor = newState
        ? '#4CAF50'
        : '#666';
      if (this.shipLasersCallback) {
        this.shipLasersCallback(newState);
      }
    });

    shipLasersContainer.appendChild(shipLasersLabel);
    shipLasersContainer.appendChild(this.shipLasersToggle);
    graphicsSection.appendChild(shipLasersContainer);

    const shipLasersHint = document.createElement('div');
    shipLasersHint.textContent = t('settings.shipLasersHint');
    shipLasersHint.style.fontSize = '12px';
    shipLasersHint.style.color = '#888';
    shipLasersHint.style.marginTop = '5px';
    graphicsSection.appendChild(shipLasersHint);

    // Damage numbers toggle
    const damageNumbersContainer = document.createElement('div');
    damageNumbersContainer.style.marginBottom = '10px';
    damageNumbersContainer.style.marginTop = '15px';
    damageNumbersContainer.style.display = 'flex';
    damageNumbersContainer.style.alignItems = 'center';
    damageNumbersContainer.style.justifyContent = 'space-between';

    const damageNumbersLabel = document.createElement('label');
    damageNumbersLabel.textContent = t('settings.damageNumbers');
    damageNumbersLabel.style.fontSize = '16px';

    this.damageNumbersToggle = document.createElement('button');
    this.damageNumbersToggle.className = 'modal-button';
    this.damageNumbersToggle.textContent = t('common.on');
    this.damageNumbersToggle.style.width = '80px';
    this.damageNumbersToggle.style.backgroundColor = '#4CAF50';

    this.damageNumbersToggle.addEventListener('click', () => {
      if (!this.damageNumbersToggle) return;
      const newState = this.damageNumbersToggle.textContent === t('common.off');
      this.damageNumbersToggle.textContent = newState ? t('common.on') : t('common.off');
      this.damageNumbersToggle.style.backgroundColor = newState
        ? '#4CAF50'
        : '#666';
      if (this.damageNumbersCallback) {
        this.damageNumbersCallback(newState);
      }
    });

    damageNumbersContainer.appendChild(damageNumbersLabel);
    damageNumbersContainer.appendChild(this.damageNumbersToggle);
    graphicsSection.appendChild(damageNumbersContainer);

    const damageNumbersHint = document.createElement('div');
    damageNumbersHint.textContent = t('settings.damageNumbersHint');
    damageNumbersHint.style.fontSize = '12px';
    damageNumbersHint.style.color = '#888';
    damageNumbersHint.style.marginTop = '5px';
    graphicsSection.appendChild(damageNumbersHint);

    content.appendChild(graphicsSection);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-button';
    closeButton.textContent = t('common.close');
    closeButton.style.width = '100%';
    closeButton.style.marginTop = '20px';
    closeButton.addEventListener('click', () => {
      this.hide();
    });
    content.appendChild(closeButton);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  show(): void {
    if (this.modal) {
      // Update slider to current volume when opening
      if (this.volumeSlider && this.volumeValue) {
        const currentVolume = Math.round(this.soundManager.getVolume() * 100);
        this.volumeSlider.value = String(currentVolume);
        this.volumeValue.textContent = String(currentVolume) + '%';
      }
      // Update soundtrack toggle when opening
      if (this.soundtrackToggle) {
        const soundtrackEnabled = this.soundManager.isSoundtrackEnabled();
        this.soundtrackToggle.textContent = soundtrackEnabled ? t('common.on') : t('common.off');
        this.soundtrackToggle.style.backgroundColor = soundtrackEnabled
          ? '#4CAF50'
          : '#666';
      }
      // Update language selector
      if (this.languageSelect) {
        this.languageSelect.value = i18n.getLanguage();
      }
      this.modal.style.display = 'flex';
      // Trigger animation
      requestAnimationFrame(() => {
        this.modal?.classList.add('show');
      });
    }
  }

  private updateTranslations(): void {
    if (!this.modal) return;
    
    // Store current state
    const wasVisible = this.modal.style.display !== 'none';
    
    // Recreate modal content
    const content = this.modal.querySelector('.modal-content');
    if (content) {
      content.remove();
    }
    
    // Recreate modal (this will reset all references, so we need to store callbacks)
    const soundCallback = this.soundCallback;
    const soundtrackCallback = this.soundtrackCallback;
    const volumeCallback = this.volumeCallback;
    const graphicsCallback = this.graphicsCallback;
    const shipLasersCallback = this.shipLasersCallback;
    const damageNumbersCallback = this.damageNumbersCallback;
    
    this.createModal();
    
    // Restore callbacks
    if (soundCallback) this.soundCallback = soundCallback;
    if (soundtrackCallback) this.soundtrackCallback = soundtrackCallback;
    if (volumeCallback) this.volumeCallback = volumeCallback;
    if (graphicsCallback) this.graphicsCallback = graphicsCallback;
    if (shipLasersCallback) this.shipLasersCallback = shipLasersCallback;
    if (damageNumbersCallback) this.damageNumbersCallback = damageNumbersCallback;
    
    // Restore visibility
    if (wasVisible) {
      this.modal.style.display = 'flex';
      this.show(); // This will update all the values
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.classList.remove('show');
      // Wait for animation to complete
      setTimeout(() => {
        if (this.modal) {
          this.modal.style.display = 'none';
        }
      }, 300);
    }
  }
}
