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
            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 0, 255, 0.1); border: 2px solid rgba(255, 0, 255, 0.3); border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px; color: #ff00ff; text-shadow: 0 0 5px rgba(255, 0, 255, 0.8);">🌟 How Prestige Points Work:</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Base PP:</strong> You always earn Prestige Points for ascending past level 99!</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Bonus PP:</strong> Earn extra valuable Prestige Points by surpassing your previous best level!</p>
              <div style="margin-top: 10px; font-size: 13px;">
                <p style="margin: 5px 0; color: #00ffff; font-weight: bold;">Current Level: <span id="current-level-display">0</span></p>
                <p style="margin: 5px 0; color: #ffff00; font-weight: bold;">Previous Best Level: <span id="previous-best-level">0</span></p>
              </div>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(255, 255, 0, 0.1); border: 2px solid rgba(255, 255, 0, 0.3); border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px; color: #ffff00; text-shadow: 0 0 5px rgba(255, 255, 0, 0.8);">⚡ Unspent Prestige Points Bonus:</p>
              <p style="margin: 5px 0; font-size: 14px;">Each <strong>unspent Prestige Point gives +0.25% income</strong> to all point sources!</p>
              <p style="margin: 5px 0; font-size: 13px; color: #aaa;">This applies to clicks, kills, and passive generation.</p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #ffff00; font-weight: bold;">Current Income Bonus: <span id="unspent-pp-bonus">+0%</span></p>
            </div>
          </div>
          <div class="ascension-rewards">
            <div class="prestige-points-display">
              <div class="prestige-current">Current: <span id="prestige-current">0</span> PP</div>
              <div class="prestige-gain">
                <div style="margin-bottom: 5px;">Total Gain: <span id="prestige-gain">0</span> PP</div>
                <div style="font-size: 13px; color: #aaa; margin-left: 10px;">Base: <span id="prestige-base">0</span> PP</div>
                <div style="font-size: 13px; color: #ffff00; margin-left: 10px; font-weight: bold;">Bonus: <span id="prestige-bonus">0</span> PP</div>
              </div>
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
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });

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
    const basePP = document.getElementById('prestige-base');
    const bonusPP = document.getElementById('prestige-bonus');
    const previousBestLevel = document.getElementById('previous-best-level');
    const currentLevelDisplay = document.getElementById(
      'current-level-display',
    );

    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    if (currentLevelDisplay) {
      currentLevelDisplay.textContent = state.level.toString();
    }

    // Get breakdown of PP gain
    const breakdown =
      this.ascensionSystem.calculatePrestigePointsBreakdown(state);
    const totalGain = breakdown.base + breakdown.bonus;

    if (gainPP) {
      gainPP.textContent = totalGain.toString();
    }

    if (basePP) {
      basePP.textContent = breakdown.base.toString();
    }

    if (bonusPP) {
      bonusPP.textContent = breakdown.bonus.toString();
    }

    if (previousBestLevel) {
      previousBestLevel.textContent = breakdown.previousBest.toString();
    }

    // Update unspent PP bonus display
    const unspentPPBonus = document.getElementById('unspent-pp-bonus');
    if (unspentPPBonus) {
      const unspentPP = state.prestigePoints ?? 0;
      const bonusPercent = (unspentPP * 0.25).toFixed(1);
      unspentPPBonus.textContent = `+${bonusPercent}%`;
    }

    // Update prestige upgrades
    this.updatePrestigeUpgrades();

    // Check if can ascend
    const canAscend = this.ascensionSystem.canAscend(state);
    const ascendBtn = this.modal.querySelector('#ascend-btn');
    if (ascendBtn instanceof HTMLButtonElement) {
      if (canAscend) {
        // Warn if they'll get 0 or very low PP
        if (totalGain === 0) {
          ascendBtn.disabled = true;
          ascendBtn.textContent = 'REACH LEVEL 100 TO ASCEND';
        } else if (totalGain < 5) {
          ascendBtn.disabled = false;
          ascendBtn.textContent = `ASCEND NOW (Only ${totalGain} PP - Push higher for more!)`;
        } else {
          ascendBtn.disabled = false;
          ascendBtn.textContent = 'ASCEND NOW';
        }
      } else {
        ascendBtn.disabled = true;
        ascendBtn.textContent = `REACH LEVEL 100 TO ASCEND (Current: ${state.level.toString()})`;
      }
    }

    this.modal.style.display = 'flex';
    // Trigger animation
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
  }

  hide(): void {
    this.modal.classList.remove('show');
    // Wait for animation to complete
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
  }

  private updatePrestigeUpgrades(): void {
    const state = this.store.getState();

    // Update current PP display and breakdown
    const currentPP = document.getElementById('prestige-current');
    const gainPP = document.getElementById('prestige-gain');
    const basePP = document.getElementById('prestige-base');
    const bonusPP = document.getElementById('prestige-bonus');
    const previousBestLevel = document.getElementById('previous-best-level');
    const currentLevelDisplay = document.getElementById(
      'current-level-display',
    );

    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    if (currentLevelDisplay) {
      currentLevelDisplay.textContent = state.level.toString();
    }

    // Update breakdown
    const breakdown =
      this.ascensionSystem.calculatePrestigePointsBreakdown(state);
    const totalGain = breakdown.base + breakdown.bonus;

    if (gainPP) {
      gainPP.textContent = totalGain.toString();
    }

    if (basePP) {
      basePP.textContent = breakdown.base.toString();
    }

    if (bonusPP) {
      bonusPP.textContent = breakdown.bonus.toString();
    }

    if (previousBestLevel) {
      previousBestLevel.textContent = breakdown.previousBest.toString();
    }

    // Update unspent PP bonus display
    const unspentPPBonus = document.getElementById('unspent-pp-bonus');
    if (unspentPPBonus) {
      const unspentPP = state.prestigePoints ?? 0;
      const bonusPercent = (unspentPP * 0.25).toFixed(1);
      unspentPPBonus.textContent = `+${bonusPercent}%`;
    }

    const grid = this.modal.querySelector('#prestige-upgrades-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const upgrades = this.ascensionSystem.getUpgrades();

    for (const upgrade of upgrades) {
      const currentLevel = upgrade.getCurrentLevel(state);
      const actualCost = this.ascensionSystem.getUpgradeCost(upgrade.id, state);
      const canAfford = state.prestigePoints >= actualCost;
      const maxed = currentLevel >= upgrade.maxLevel;

      const card = document.createElement('div');
      card.className = `prestige-upgrade-card ${maxed ? 'maxed' : ''} ${!canAfford && !maxed ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="prestige-upgrade-name">${upgrade.name}</div>
        <div class="prestige-upgrade-level">Level: ${currentLevel.toString()} / ${upgrade.maxLevel.toString()}</div>
        <div class="prestige-upgrade-desc">${upgrade.description}</div>
        <div class="prestige-upgrade-effect">${upgrade.effect}</div>
        <div class="prestige-upgrade-cost">
          ${maxed ? 'MAX' : `Cost: ${actualCost.toString()} PP${actualCost > upgrade.cost ? ` (base: ${upgrade.cost.toString()})` : ''}`}
        </div>
      `;

      if (!maxed) {
        card.addEventListener('click', () => {
          if (this.ascensionSystem.buyPrestigeUpgrade(state, upgrade.id)) {
            this.store.setState(state);
            this.updatePrestigeUpgrades();
            // Update combo pause button if the upgrade was purchased
            if (upgrade.id === 'combo_pause_unlock' && window.game) {
              (window.game as any).updateComboPauseButton?.();
            }
          }
        });
      }

      grid.appendChild(card);
    }
  }
}
