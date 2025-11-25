import type { AscensionSystem } from '../systems/AscensionSystem';
import type { Store } from '../core/Store';
import { images } from '../assets/images';
import { Config } from '../core/GameConfig';

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
    modal.className = 'ascension-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content ascension-content">
        <div class="modal-header">
          <h2>ASCENSION</h2>
          <button class="modal-close" id="ascension-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="ascension-info">
          <div class="ascension-stats">
            <div class="stat-item">
              <span class="stat-label">Current PP:</span>
              <strong id="prestige-current">0</strong>
            </div>
            <div class="stat-item">
              <span class="stat-label">Gain:</span>
              <strong id="prestige-gain">0</strong> PP
              <span style="font-size: 11px; color: rgba(255, 250, 229, 0.6); margin-left: 8px;">
                (<span id="prestige-base">0</span> base + <span id="prestige-achievement-bonus">0</span> achievements + <span id="prestige-bonus">0</span> bonus)
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Unspent Bonus:</span>
              <strong id="unspent-pp-bonus">+0%</strong> income
            </div>
          </div>
          <div class="ascension-preserved">
            <div style="font-size: 12px; color: #fffae5; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
              Preserved After Ascension:
            </div>
            <div style="display: flex; gap: 20px; font-size: 12px; color: #fffae5; flex-wrap: wrap;">
              <span>Achievements</span>
              <span>Statistics</span>
              <span>Prestige Upgrades</span>
              <span>Artifacts</span>
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

    // Remove overlay click to close - only X button closes now

    const ascendBtn = this.modal.querySelector('#ascend-btn');
    ascendBtn?.addEventListener('click', async () => {
      const { alertDialog } = await import('./AlertDialog');
      const confirmed = await alertDialog.confirm(
        'Are you sure you want to ascend? All non-permanent progress will be reset!',
        'Ascend',
      );
      if (confirmed) {
        this.onAscend();
        this.hide();
      }
    });

    // Use event delegation for upgrade cards to prevent issues with re-rendering
    const grid = this.modal.querySelector('#prestige-upgrades-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('.prestige-upgrade-card') as HTMLElement;
        if (card && !card.classList.contains('maxed')) {
          const upgradeId = card.getAttribute('data-upgrade-id');
          if (upgradeId) {
            e.stopPropagation();
            const state = this.store.getState();
            if (this.ascensionSystem.buyPrestigeUpgrade(state, upgradeId)) {
              this.store.setState(state);
              this.updatePrestigeUpgrades();
              // Update combo pause button if the upgrade was purchased
              if (upgradeId === 'combo_pause_unlock' && window.game) {
                (window.game as any).updateComboPauseButton?.();
              }
            }
          }
        }
      });
    }

    // Subscribe to store updates to refresh prestige upgrades (throttled)
    let updateTimeout: number | null = null;
    this.store.subscribe(() => {
      if (this.modal.style.display !== 'none') {
        // Throttle updates to prevent flickering
        if (updateTimeout !== null) {
          clearTimeout(updateTimeout);
        }
        updateTimeout = window.setTimeout(() => {
          this.updatePrestigeUpgrades();
          updateTimeout = null;
        }, 50); // 50ms throttle
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

    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    // Get breakdown of PP gain
    const breakdown =
      this.ascensionSystem.calculatePrestigePointsBreakdown(state);
    // Calculate total gain with multiplier applied
    const totalGain = this.ascensionSystem.calculatePrestigePoints(state);

    if (gainPP) {
      gainPP.textContent = totalGain.toString();
    }

    if (basePP) {
      basePP.textContent = breakdown.base.toString();
    }

    const achievementBonusPP = document.getElementById('prestige-achievement-bonus');
    if (achievementBonusPP) {
      achievementBonusPP.textContent = breakdown.achievementBonus.toString();
    }

    if (bonusPP) {
      bonusPP.textContent = breakdown.bonus.toString();
    }

    // Update unspent PP bonus display
    const unspentPPBonus = document.getElementById('unspent-pp-bonus');
    if (unspentPPBonus) {
      const unspentPP = state.prestigePoints ?? 0;
      const percentagePerPP = Config.ascension.unspentPPMultiplier.percentagePerPP;
      const bonusPercent = (unspentPP * percentagePerPP).toFixed(1);
      unspentPPBonus.textContent = `+${bonusPercent}%`;
    }

    // Clear and update prestige upgrades
    const grid = this.modal.querySelector('#prestige-upgrades-grid');
    if (grid) {
      grid.innerHTML = ''; // Clear on show to ensure clean state
    }
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
        // Check if blocked by boss at level 100
        if (state.level === 100 && state.blockedOnBossLevel === 100) {
          ascendBtn.textContent = 'DEFEAT THE BOSS TO ASCEND';
        } else if (
          state.subUpgrades['meaning_of_life'] !== true &&
          state.prestigeLevel === 0
        ) {
          ascendBtn.textContent =
            'PURCHASE "MEANING OF LIFE" UPGRADE TO UNLOCK PRESTIGE';
        } else {
          ascendBtn.textContent = `REACH LEVEL 100 TO ASCEND (Current: ${state.level.toString()})`;
        }
      }
    }

    document.body.style.overflow = 'hidden';
    this.modal.style.display = 'flex';
    this.modal.classList.add('show');
  }

  hide(): void {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
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

    if (currentPP) {
      currentPP.textContent = state.prestigePoints.toString();
    }

    // Update breakdown
    const breakdown =
      this.ascensionSystem.calculatePrestigePointsBreakdown(state);
    const totalGain = breakdown.base + breakdown.achievementBonus + breakdown.bonus;

    if (gainPP) {
      gainPP.textContent = totalGain.toString();
    }

    if (basePP) {
      basePP.textContent = breakdown.base.toString();
    }

    const achievementBonusPP = document.getElementById('prestige-achievement-bonus');
    if (achievementBonusPP) {
      achievementBonusPP.textContent = breakdown.achievementBonus.toString();
    }

    if (bonusPP) {
      bonusPP.textContent = breakdown.bonus.toString();
    }

    // Update unspent PP bonus display
    const unspentPPBonus = document.getElementById('unspent-pp-bonus');
    if (unspentPPBonus) {
      const unspentPP = state.prestigePoints ?? 0;
      const percentagePerPP = Config.ascension.unspentPPMultiplier.percentagePerPP;
      const bonusPercent = (unspentPP * percentagePerPP).toFixed(1);
      unspentPPBonus.textContent = `+${bonusPercent}%`;
    }

    const grid = this.modal.querySelector('#prestige-upgrades-grid');
    if (!grid) return;

    const upgrades = this.ascensionSystem.getUpgrades();

    for (const upgrade of upgrades) {
      const currentLevel = upgrade.getCurrentLevel(state);
      const actualCost = this.ascensionSystem.getUpgradeCost(upgrade.id, state);
      const canAfford = state.prestigePoints >= actualCost;
      const maxed = currentLevel >= upgrade.maxLevel;

      // Try to find existing card to update instead of recreating
      let card = grid.querySelector(
        `[data-upgrade-id="${upgrade.id}"]`,
      ) as HTMLElement;

      if (!card) {
        // Create new card if it doesn't exist
        card = document.createElement('div');
        card.setAttribute('data-upgrade-id', upgrade.id);
        grid.appendChild(card);
      }

      // Update classes
      card.className = `prestige-upgrade-card ${maxed ? 'maxed' : ''} ${!canAfford && !maxed ? 'locked' : ''}`;

      // Update content only if it changed (to prevent flickering)
      const nameEl = card.querySelector('.prestige-upgrade-name');
      const levelEl = card.querySelector('.prestige-upgrade-level');
      const costEl = card.querySelector('.prestige-upgrade-cost');

      if (!nameEl || !levelEl || !costEl) {
        // First time rendering - set innerHTML
        card.innerHTML = `
          <div class="prestige-upgrade-name">${upgrade.name}</div>
          <div class="prestige-upgrade-level">Level: ${currentLevel.toString()} / ${upgrade.maxLevel.toString()}</div>
          <div class="prestige-upgrade-desc">${upgrade.description}</div>
          <div class="prestige-upgrade-effect">${upgrade.effect}</div>
          <div class="prestige-upgrade-cost">
            ${maxed ? 'MAX' : `Cost: ${actualCost.toString()} PP${actualCost > upgrade.cost ? ` (base: ${upgrade.cost.toString()})` : ''}`}
          </div>
        `;
      } else {
        // Update only changed content
        if (nameEl.textContent !== upgrade.name) {
          nameEl.textContent = upgrade.name;
        }
        const levelText = `Level: ${currentLevel.toString()} / ${upgrade.maxLevel.toString()}`;
        if (levelEl.textContent !== levelText) {
          levelEl.textContent = levelText;
        }
        const costText = maxed
          ? 'MAX'
          : `Cost: ${actualCost.toString()} PP${actualCost > upgrade.cost ? ` (base: ${upgrade.cost.toString()})` : ''}`;
        if (costEl.textContent !== costText) {
          costEl.textContent = costText;
        }
      }
    }

    // Remove any cards that no longer exist (cleanup)
    const existingCards = grid.querySelectorAll('.prestige-upgrade-card');
    existingCards.forEach((card) => {
      const upgradeId = card.getAttribute('data-upgrade-id');
      if (!upgrades.find((u) => u.id === upgradeId)) {
        card.remove();
      }
    });
  }
}
