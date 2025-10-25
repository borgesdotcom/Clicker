import type { AscensionSystem } from '../systems/AscensionSystem';
import type { Store } from '../core/Store';

export class AscensionModal {
  private modal: HTMLElement;
  private onAscend: () => void;

  constructor(
    private ascensionSystem: AscensionSystem,
    private store: Store,
    ascendCallback: () => void,
  ) {
    this.onAscend = ascendCallback;
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal ascension-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content ascension-content">
        <div class="modal-header">
          <h2>🌟 ASCENSION 🌟</h2>
          <button class="modal-close" id="ascension-close">&times;</button>
        </div>
        <div class="ascension-info">
          <div class="ascension-description">
            <p>Ascend to a higher plane of existence. You will lose all progress except:</p>
            <ul>
              <li>✓ Achievements</li>
              <li>✓ Statistics</li>
              <li>✓ Prestige Upgrades</li>
            </ul>
            <p style="margin-top: 15px;"><strong>You will gain Prestige Points to unlock permanent bonuses!</strong></p>
          </div>
          <div class="ascension-rewards">
            <div class="prestige-points-display">
              <div class="prestige-current">Current: <span id="prestige-current">0</span> PP</div>
              <div class="prestige-gain">Gain on Ascension: <span id="prestige-gain">0</span> PP</div>
            </div>
          </div>
        </div>
        <div class="ascension-upgrades">
          <h3>Prestige Upgrades</h3>
          <div id="prestige-upgrades-grid" class="prestige-grid"></div>
        </div>
        <div class="ascension-actions">
          <button id="ascend-btn" class="ascension-btn ascend-confirm">ASCEND NOW</button>
        </div>
      </div>
    `;
    return modal;
  }

  private setupEventListeners(): void {
    const closeBtn = this.modal.querySelector('#ascension-close');
    closeBtn?.addEventListener('click', () => this.hide());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    const ascendBtn = this.modal.querySelector('#ascend-btn');
    ascendBtn?.addEventListener('click', () => {
      if (
        confirm(
          'Are you sure you want to ascend? All non-permanent progress will be reset!',
        )
      ) {
        this.onAscend();
        this.hide();
      }
    });

    // Subscribe to store updates to refresh prestige upgrades
    this.store.subscribe(() => {
      if (this.modal.style.display !== 'none') {
        this.updatePrestigeUpgrades();
      }
    });
  }

  show(): void {
    const state = this.store.getState();

    // Update prestige points display
    const currentPP = document.getElementById('prestige-current');
    const gainPP = document.getElementById('prestige-gain');

    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    if (gainPP) {
      const willGain = this.ascensionSystem.calculatePrestigePoints(state);
      gainPP.textContent = willGain.toString();
    }

    // Update prestige upgrades
    this.updatePrestigeUpgrades();

    // Check if can ascend
    const canAscend = this.ascensionSystem.canAscend(state);
    const ascendBtn = this.modal.querySelector(
      '#ascend-btn',
    ) as HTMLButtonElement;
    if (ascendBtn) {
      if (canAscend) {
        ascendBtn.disabled = false;
        ascendBtn.textContent = 'ASCEND NOW';
      } else {
        ascendBtn.disabled = true;
        ascendBtn.textContent = `REACH LEVEL 100 TO ASCEND (Current: ${state.level})`;
      }
    }

    this.modal.style.display = 'flex';
  }

  hide(): void {
    this.modal.style.display = 'none';
  }

  private updatePrestigeUpgrades(): void {
    const state = this.store.getState();

    // Update current PP display
    const currentPP = document.getElementById('prestige-current');
    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    const grid = this.modal.querySelector('#prestige-upgrades-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const upgrades = this.ascensionSystem.getUpgrades();

    for (const upgrade of upgrades) {
      const currentLevel = upgrade.getCurrentLevel(state);
      const canAfford = state.prestigePoints >= upgrade.cost;
      const maxed = currentLevel >= upgrade.maxLevel;

      const card = document.createElement('div');
      card.className = `prestige-upgrade-card ${maxed ? 'maxed' : ''} ${!canAfford && !maxed ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="prestige-upgrade-name">${upgrade.name}</div>
        <div class="prestige-upgrade-level">Level: ${currentLevel} / ${upgrade.maxLevel}</div>
        <div class="prestige-upgrade-desc">${upgrade.description}</div>
        <div class="prestige-upgrade-effect">${upgrade.effect}</div>
        <div class="prestige-upgrade-cost">
          ${maxed ? 'MAX' : `Cost: ${upgrade.cost} PP`}
        </div>
      `;

      if (!maxed) {
        card.addEventListener('click', () => {
          if (this.ascensionSystem.buyPrestigeUpgrade(state, upgrade.id)) {
            this.store.setState(state);
            this.updatePrestigeUpgrades();
          }
        });
      }

      grid.appendChild(card);
    }
  }
}
