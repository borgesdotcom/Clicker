import type { SoundManager } from '../systems/SoundManager';

export class SettingsModal {
  private modal: HTMLElement | null = null;
  private soundManager: SoundManager;
  private volumeSlider: HTMLInputElement | null = null;
  private volumeValue: HTMLSpanElement | null = null;
  private graphicsCallback: ((enabled: boolean) => void) | null = null;
  private shipLasersCallback: ((enabled: boolean) => void) | null = null;
  private ripplesCallback: ((enabled: boolean) => void) | null = null;
  private damageNumbersCallback: ((enabled: boolean) => void) | null = null;
  private soundCallback: ((enabled: boolean) => void) | null = null;
  private volumeCallback: ((volume: number) => void) | null = null;
  private graphicsToggle: HTMLButtonElement | null = null;
  private shipLasersToggle: HTMLButtonElement | null = null;
  private ripplesToggle: HTMLButtonElement | null = null;
  private damageNumbersToggle: HTMLButtonElement | null = null;

  constructor(soundManager: SoundManager) {
    this.soundManager = soundManager;
    this.createModal();
  }

  setGraphicsCallback(callback: (enabled: boolean) => void): void {
    this.graphicsCallback = callback;
  }

  setShipLasersCallback(callback: (enabled: boolean) => void): void {
    this.shipLasersCallback = callback;
  }

  setRipplesCallback(callback: (enabled: boolean) => void): void {
    this.ripplesCallback = callback;
  }

  setDamageNumbersCallback(callback: (enabled: boolean) => void): void {
    this.damageNumbersCallback = callback;
  }

  setSoundCallback(callback: (enabled: boolean) => void): void {
    this.soundCallback = callback;
  }

  setVolumeCallback(callback: (volume: number) => void): void {
    this.volumeCallback = callback;
  }

  updateGraphicsToggles(graphics: boolean, shipLasers: boolean, ripples: boolean, damageNumbers: boolean): void {
    if (this.graphicsToggle) {
      this.graphicsToggle.textContent = graphics ? 'ON' : 'OFF';
      this.graphicsToggle.style.backgroundColor = graphics ? '#4CAF50' : '#666';
    }
    if (this.shipLasersToggle) {
      this.shipLasersToggle.textContent = shipLasers ? 'ON' : 'OFF';
      this.shipLasersToggle.style.backgroundColor = shipLasers ? '#4CAF50' : '#666';
    }
    if (this.ripplesToggle) {
      this.ripplesToggle.textContent = ripples ? 'ON' : 'OFF';
      this.ripplesToggle.style.backgroundColor = ripples ? '#4CAF50' : '#666';
    }
    if (this.damageNumbersToggle) {
      this.damageNumbersToggle.textContent = damageNumbers ? 'ON' : 'OFF';
      this.damageNumbersToggle.style.backgroundColor = damageNumbers ? '#4CAF50' : '#666';
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
    title.textContent = '⚙️ Settings';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    // Sound section
    const soundSection = document.createElement('div');
    soundSection.style.marginBottom = '25px';

    const soundTitle = document.createElement('h3');
    soundTitle.textContent = 'Sound Settings';
    soundTitle.style.marginBottom = '15px';
    soundSection.appendChild(soundTitle);

    // Sound enabled toggle
    const soundToggleContainer = document.createElement('div');
    soundToggleContainer.style.marginBottom = '15px';
    soundToggleContainer.style.display = 'flex';
    soundToggleContainer.style.alignItems = 'center';
    soundToggleContainer.style.justifyContent = 'space-between';

    const soundLabel = document.createElement('label');
    soundLabel.textContent = 'Sound Enabled:';
    soundLabel.style.fontSize = '16px';

    const soundToggle = document.createElement('button');
    soundToggle.className = 'modal-button';
    soundToggle.textContent = this.soundManager.isEnabled() ? 'ON' : 'OFF';
    soundToggle.style.width = '80px';
    soundToggle.addEventListener('click', () => {
      const newState = !this.soundManager.isEnabled();
      this.soundManager.setEnabled(newState);
      soundToggle.textContent = newState ? 'ON' : 'OFF';
      soundToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.soundCallback) {
        this.soundCallback(newState);
      }
    });
    soundToggle.style.backgroundColor = this.soundManager.isEnabled() ? '#4CAF50' : '#666';

    soundToggleContainer.appendChild(soundLabel);
    soundToggleContainer.appendChild(soundToggle);
    soundSection.appendChild(soundToggleContainer);

    const soundHint = document.createElement('div');
    soundHint.textContent = 'Enable or disable all game sounds';
    soundHint.style.fontSize = '12px';
    soundHint.style.color = '#888';
    soundHint.style.marginTop = '5px';
    soundHint.style.marginBottom = '15px';
    soundSection.appendChild(soundHint);

    // Volume slider
    const volumeContainer = document.createElement('div');
    volumeContainer.style.marginBottom = '15px';

    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = 'Volume:';
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
    this.volumeSlider.value = String(Math.round(this.soundManager.getVolume() * 100));
    this.volumeSlider.style.flex = '1';
    this.volumeSlider.style.cursor = 'pointer';

    this.volumeValue = document.createElement('span');
    this.volumeValue.textContent = `${this.volumeSlider.value}%`;
    this.volumeValue.style.minWidth = '45px';
    this.volumeValue.style.textAlign = 'right';
    this.volumeValue.style.fontSize = '14px';

    // Store reference to this for the event listener
    const self = this;
    this.volumeSlider.addEventListener('input', function() {
      const value = parseInt(this.value) / 100;
      self.soundManager.setVolume(value);
      if (self.volumeValue) {
        self.volumeValue.textContent = String(this.value) + '%';
      }
      if (self.volumeCallback) {
        self.volumeCallback(value);
      }
      // Play a test sound to hear the volume change
      self.soundManager.playClick();
    });

    sliderRow.appendChild(this.volumeSlider);
    sliderRow.appendChild(this.volumeValue);
    volumeContainer.appendChild(sliderRow);
    soundSection.appendChild(volumeContainer);

    content.appendChild(soundSection);

    // Graphics section
    const graphicsSection = document.createElement('div');
    graphicsSection.style.marginBottom = '25px';

    const graphicsTitle = document.createElement('h3');
    graphicsTitle.textContent = 'Graphics Settings';
    graphicsTitle.style.marginBottom = '15px';
    graphicsSection.appendChild(graphicsTitle);

    // High graphics toggle
    const graphicsToggleContainer = document.createElement('div');
    graphicsToggleContainer.style.marginBottom = '10px';
    graphicsToggleContainer.style.display = 'flex';
    graphicsToggleContainer.style.alignItems = 'center';
    graphicsToggleContainer.style.justifyContent = 'space-between';

    const graphicsLabel = document.createElement('label');
    graphicsLabel.textContent = 'High Graphics (Particles):';
    graphicsLabel.style.fontSize = '16px';

    this.graphicsToggle = document.createElement('button');
    this.graphicsToggle.className = 'modal-button';
    this.graphicsToggle.textContent = 'ON';
    this.graphicsToggle.style.width = '80px';
    this.graphicsToggle.style.backgroundColor = '#4CAF50';
    
    this.graphicsToggle.addEventListener('click', () => {
      if (!this.graphicsToggle) return;
      const newState = this.graphicsToggle.textContent === 'OFF';
      this.graphicsToggle.textContent = newState ? 'ON' : 'OFF';
      this.graphicsToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.graphicsCallback) {
        this.graphicsCallback(newState);
      }
    });

    graphicsToggleContainer.appendChild(graphicsLabel);
    graphicsToggleContainer.appendChild(this.graphicsToggle);
    graphicsSection.appendChild(graphicsToggleContainer);

    const graphicsHint = document.createElement('div');
    graphicsHint.textContent = 'Disable particles for better performance';
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
    shipLasersLabel.textContent = 'Ship Auto-Fire Lasers:';
    shipLasersLabel.style.fontSize = '16px';

    this.shipLasersToggle = document.createElement('button');
    this.shipLasersToggle.className = 'modal-button';
    this.shipLasersToggle.textContent = 'ON';
    this.shipLasersToggle.style.width = '80px';
    this.shipLasersToggle.style.backgroundColor = '#4CAF50';
    
    this.shipLasersToggle.addEventListener('click', () => {
      if (!this.shipLasersToggle) return;
      const newState = this.shipLasersToggle.textContent === 'OFF';
      this.shipLasersToggle.textContent = newState ? 'ON' : 'OFF';
      this.shipLasersToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.shipLasersCallback) {
        this.shipLasersCallback(newState);
      }
    });

    shipLasersContainer.appendChild(shipLasersLabel);
    shipLasersContainer.appendChild(this.shipLasersToggle);
    graphicsSection.appendChild(shipLasersContainer);

    const shipLasersHint = document.createElement('div');
    shipLasersHint.textContent = 'Disable to reduce lag (only your clicks will fire lasers)';
    shipLasersHint.style.fontSize = '12px';
    shipLasersHint.style.color = '#888';
    shipLasersHint.style.marginTop = '5px';
    graphicsSection.appendChild(shipLasersHint);

    // Ripples toggle
    const ripplesContainer = document.createElement('div');
    ripplesContainer.style.marginBottom = '10px';
    ripplesContainer.style.marginTop = '15px';
    ripplesContainer.style.display = 'flex';
    ripplesContainer.style.alignItems = 'center';
    ripplesContainer.style.justifyContent = 'space-between';

    const ripplesLabel = document.createElement('label');
    ripplesLabel.textContent = 'Click Ripples:';
    ripplesLabel.style.fontSize = '16px';

    this.ripplesToggle = document.createElement('button');
    this.ripplesToggle.className = 'modal-button';
    this.ripplesToggle.textContent = 'ON';
    this.ripplesToggle.style.width = '80px';
    this.ripplesToggle.style.backgroundColor = '#4CAF50';
    
    this.ripplesToggle.addEventListener('click', () => {
      if (!this.ripplesToggle) return;
      const newState = this.ripplesToggle.textContent === 'OFF';
      this.ripplesToggle.textContent = newState ? 'ON' : 'OFF';
      this.ripplesToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.ripplesCallback) {
        this.ripplesCallback(newState);
      }
    });

    ripplesContainer.appendChild(ripplesLabel);
    ripplesContainer.appendChild(this.ripplesToggle);
    graphicsSection.appendChild(ripplesContainer);

    const ripplesHint = document.createElement('div');
    ripplesHint.textContent = 'Disable for minimal visual clutter';
    ripplesHint.style.fontSize = '12px';
    ripplesHint.style.color = '#888';
    ripplesHint.style.marginTop = '5px';
    graphicsSection.appendChild(ripplesHint);

    // Damage numbers toggle
    const damageNumbersContainer = document.createElement('div');
    damageNumbersContainer.style.marginBottom = '10px';
    damageNumbersContainer.style.marginTop = '15px';
    damageNumbersContainer.style.display = 'flex';
    damageNumbersContainer.style.alignItems = 'center';
    damageNumbersContainer.style.justifyContent = 'space-between';

    const damageNumbersLabel = document.createElement('label');
    damageNumbersLabel.textContent = 'Damage Numbers:';
    damageNumbersLabel.style.fontSize = '16px';

    this.damageNumbersToggle = document.createElement('button');
    this.damageNumbersToggle.className = 'modal-button';
    this.damageNumbersToggle.textContent = 'ON';
    this.damageNumbersToggle.style.width = '80px';
    this.damageNumbersToggle.style.backgroundColor = '#4CAF50';
    
    this.damageNumbersToggle.addEventListener('click', () => {
      if (!this.damageNumbersToggle) return;
      const newState = this.damageNumbersToggle.textContent === 'OFF';
      this.damageNumbersToggle.textContent = newState ? 'ON' : 'OFF';
      this.damageNumbersToggle.style.backgroundColor = newState ? '#4CAF50' : '#666';
      if (this.damageNumbersCallback) {
        this.damageNumbersCallback(newState);
      }
    });

    damageNumbersContainer.appendChild(damageNumbersLabel);
    damageNumbersContainer.appendChild(this.damageNumbersToggle);
    graphicsSection.appendChild(damageNumbersContainer);

    const damageNumbersHint = document.createElement('div');
    damageNumbersHint.textContent = 'Disable to improve performance (damage still applies)';
    damageNumbersHint.style.fontSize = '12px';
    damageNumbersHint.style.color = '#888';
    damageNumbersHint.style.marginTop = '5px';
    graphicsSection.appendChild(damageNumbersHint);

    content.appendChild(graphicsSection);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-button';
    closeButton.textContent = 'Close';
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
      this.modal.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

