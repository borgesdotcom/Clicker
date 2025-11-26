import type { AscensionSystem } from '../systems/AscensionSystem';
import type { Store } from '../core/Store';
import { images } from '../assets/images';
import { Config } from '../core/GameConfig';

// Map ship hull levels to images
const getShipHullImage = (level: number): string | null => {
  const shipHullMap: Record<number, string> = {
    1: images.ships.ship_1,
    2: images.ships.ship_2,
    3: images.ships.ship_3,
    4: images.ships.ship_4,
    5: images.ships.ship_5,
  };
  return shipHullMap[level] || null;
};

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
        <div class="ascension-content-wrapper">
          <div class="ship-hull-section">
            <h3>Ship Hull Upgrades</h3>
            <div class="ship-hull-description">Upgrade your ship hull to double base damage per level</div>
            <div id="ship-hull-row" class="ship-hull-row"></div>
          </div>
          <div class="ascension-upgrades">
            <h3>Prestige Upgrades</h3>
            <div id="prestige-upgrades-grid" class="prestige-grid"></div>
          </div>
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

    // Event delegation for ship hull upgrades (special row)
    const shipHullRow = this.modal.querySelector('#ship-hull-row');
    if (shipHullRow) {
      shipHullRow.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const shipCard = target.closest('.ship-hull-card') as HTMLElement;
        if (shipCard) {
          const targetLevel = parseInt(shipCard.getAttribute('data-hull-level') || '0');
          if (targetLevel > 0) {
            e.stopPropagation();
            const state = this.store.getState();
            const currentLevel = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
            
            // Only allow buying the next level
            if (targetLevel === currentLevel + 1) {
              // Check if we can afford it
              const cost = this.ascensionSystem.getUpgradeCost('prestige_ship_hull', state);
              if (state.prestigePoints >= cost) {
                if (this.ascensionSystem.buyPrestigeUpgrade(state, 'prestige_ship_hull')) {
                  this.store.setState(state);
                  this.updateShipHullRow();
                  this.updatePrestigeUpgrades();
                  // Recreate ships to show new hull
                  if (window.game) {
                    (window.game as any).createShips?.();
                  }
                }
              }
            }
          }
        }
      });
    }

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
    let lastPrestigePoints = 0;
    let lastHullLevel = 0;
    this.store.subscribe(() => {
      if (this.modal.style.display !== 'none') {
        const state = this.store.getState();
        const currentPP = state.prestigePoints ?? 0;
        const currentHullLevel = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
        
        // Only update if values actually changed to prevent flickering
        if (currentPP !== lastPrestigePoints || currentHullLevel !== lastHullLevel) {
          lastPrestigePoints = currentPP;
          lastHullLevel = currentHullLevel;
          
          // Throttle updates to prevent flickering
          if (updateTimeout !== null) {
            clearTimeout(updateTimeout);
          }
          updateTimeout = window.setTimeout(() => {
            this.updateShipHullRow();
            this.updatePrestigeUpgrades();
            updateTimeout = null;
          }, 50); // 50ms throttle
        }
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
    this.updateShipHullRow();
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
    // Use requestAnimationFrame to ensure display is set before animation
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
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
    
    // Filter out ship hull upgrade (it's displayed separately)
    const regularUpgrades = upgrades.filter(u => u.id !== 'prestige_ship_hull');

    for (const upgrade of regularUpgrades) {
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
        // Add ship hull image if this is the ship hull upgrade
        const shipHullImage = upgrade.id === 'prestige_ship_hull' && currentLevel > 0 
          ? getShipHullImage(currentLevel) 
          : null;
        const imageHtml = shipHullImage 
          ? `<div class="prestige-upgrade-image" style="text-align: center; margin-bottom: 8px;"><img src="${shipHullImage}" alt="Ship Hull ${currentLevel}" style="max-width: 64px; max-height: 64px; image-rendering: pixelated;" /></div>`
          : '';
        
        card.innerHTML = `
          ${imageHtml}
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
        
        // Update ship hull image if this is the ship hull upgrade
        if (upgrade.id === 'prestige_ship_hull' && currentLevel > 0) {
          const imageEl = card.querySelector('.prestige-upgrade-image');
          const shipHullImage = getShipHullImage(currentLevel);
          if (shipHullImage) {
            if (!imageEl) {
              const newImageEl = document.createElement('div');
              newImageEl.className = 'prestige-upgrade-image';
              newImageEl.style.textAlign = 'center';
              newImageEl.style.marginBottom = '8px';
              const img = document.createElement('img');
              img.src = shipHullImage;
              img.alt = `Ship Hull ${currentLevel}`;
              img.style.maxWidth = '64px';
              img.style.maxHeight = '64px';
              img.style.imageRendering = 'pixelated';
              newImageEl.appendChild(img);
              card.insertBefore(newImageEl, card.firstChild);
            } else {
              const img = imageEl.querySelector('img');
              if (img && img.src !== shipHullImage) {
                img.src = shipHullImage;
                img.alt = `Ship Hull ${currentLevel}`;
              }
            }
          }
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

  private updateShipHullRow(): void {
    const state = this.store.getState();
    const row = this.modal.querySelector('#ship-hull-row');
    if (!row) return;

    const currentLevel = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
    const maxLevel = 5;

    // Store existing cards to avoid flickering
    const existingCards = new Map<number, HTMLElement>();
    row.querySelectorAll('.ship-hull-card').forEach((card) => {
      const level = parseInt(card.getAttribute('data-hull-level') || '0');
      if (level > 0) {
        existingCards.set(level, card as HTMLElement);
      }
    });

    for (let level = 1; level <= maxLevel; level++) {
      let shipCard = existingCards.get(level);
      const isNew = !shipCard;

      if (isNew) {
        shipCard = document.createElement('div');
        shipCard.className = 'ship-hull-card';
        shipCard.setAttribute('data-hull-level', level.toString());
        row.appendChild(shipCard);
      }

      // Ensure shipCard is defined before using it
      if (!shipCard) continue;

      const isOwned = level <= currentLevel;
      const isNext = level === currentLevel + 1;
      
      // Calculate cost for this specific level
      let cost = 0;
      if (level === 1) {
        cost = 1;
      } else if (level === 2) {
        cost = 100;
      } else if (level === 3) {
        cost = 200;
      } else if (level === 4) {
        cost = 300;
      } else if (level === 5) {
        cost = 400;
      }
      
      const canAfford = state.prestigePoints >= cost;

      // Update classes
      shipCard.className = 'ship-hull-card';
      if (isOwned) {
        shipCard.classList.add('owned');
      } else if (isNext && canAfford) {
        shipCard.classList.add('purchasable');
      } else {
        shipCard.classList.add('locked');
      }

      // Only update innerHTML if it's new or if state changed
      if (isNew) {
        const shipImage = getShipHullImage(level);
        const multiplier = Math.pow(2, level);
        
        shipCard.innerHTML = `
          <div class="ship-hull-image-wrapper">
            ${shipImage ? `<img src="${shipImage}" alt="Hull ${level}" class="ship-hull-image" />` : ''}
            ${isOwned ? '<div class="ship-hull-checkmark">✓</div>' : ''}
          </div>
          <div class="ship-hull-level">Level ${level}</div>
          <div class="ship-hull-multiplier">${multiplier}x Damage</div>
          ${!isOwned ? `<div class="ship-hull-cost">${cost} PP</div>` : '<div class="ship-hull-cost owned-text">OWNED</div>'}
        `;
      } else {
        // Update only the parts that might change
        const checkmark = shipCard.querySelector('.ship-hull-checkmark');
        const costEl = shipCard.querySelector('.ship-hull-cost');
        
        if (isOwned && !checkmark) {
          const imageWrapper = shipCard.querySelector('.ship-hull-image-wrapper');
          if (imageWrapper) {
            const checkmarkDiv = document.createElement('div');
            checkmarkDiv.className = 'ship-hull-checkmark';
            checkmarkDiv.textContent = '✓';
            imageWrapper.appendChild(checkmarkDiv);
          }
        } else if (!isOwned && checkmark) {
          checkmark.remove();
        }
        
        if (costEl) {
          if (isOwned) {
            costEl.className = 'ship-hull-cost owned-text';
            costEl.textContent = 'OWNED';
          } else {
            costEl.className = 'ship-hull-cost';
            costEl.textContent = `${cost} PP`;
          }
        }
      }
    }

    // Remove any extra cards
    const allCards = row.querySelectorAll('.ship-hull-card');
    allCards.forEach((card) => {
      const level = parseInt(card.getAttribute('data-hull-level') || '0');
      if (level < 1 || level > maxLevel) {
        card.remove();
      }
    });
  }
}
