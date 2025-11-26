import type { ArtifactSystem } from '../systems/ArtifactSystem';
import type { Store } from '../core/Store';
import { images, resolveArtifactIcon } from '../assets/images';
import { alertDialog } from './AlertDialog';
import { i18n } from '../core/I18n';

export class ArtifactsModal {
  private modal: HTMLElement;
  private artifactSystem: ArtifactSystem;
  private store: Store;
  private onCloseCallback: (() => void) | null = null;
  private currentFilter: string = 'all';
  private isFusionMode: boolean = false;
  private selectedArtifactIds: Set<string> = new Set();
  private currentPage: number = 1;
  private itemsPerPage: number = 10;

  constructor(artifactSystem: ArtifactSystem, store: Store) {
    this.artifactSystem = artifactSystem;
    this.store = store;
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'artifacts-modal';
    modal.className = 'artifacts-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content artifacts-modal-content">
        <div class="modal-header">
          <h2><img src="${images.stars}" alt="Artifacts" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;" /> Artifacts</h2>
          <button class="modal-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="modal-body">
          <div class="artifacts-header">
            <div class="artifacts-stats">
              <span class="stat-item">Equipped: <strong id="equipped-count">0</strong>/${this.artifactSystem.getMaxEquipped().toString()}</span>
              <span class="stat-item">Total: <strong id="total-count">0</strong></span>
            </div>
            <div class="artifacts-filters">
              <button class="filter-btn active" data-filter="all">All</button>
              <button class="filter-btn" data-filter="equipped">Equipped</button>
              <button class="filter-btn" data-filter="common">Common</button>
              <button class="filter-btn" data-filter="rare">Rare</button>
              <button class="filter-btn" data-filter="epic">Epic</button>
              <button class="filter-btn" data-filter="legendary">Legendary</button>
              <div class="fusion-controls" style="margin-left: 10px; border-left: 1px solid #444; padding-left: 10px; display: flex; gap: 10px;">
                <button id="fusion-mode-btn" class="filter-btn" style="background: linear-gradient(45deg, #2c3e50, #4a69bd); border-color: #6c5ce7;">
                  ⚗️ Fusion Mode
                </button>
                <button id="fuse-action-btn" class="filter-btn" style="display: none; background: linear-gradient(45deg, #27ae60, #2ecc71); border-color: #2ecc71;">
                  Fuse (0/3)
                </button>
              </div>
            </div>
          </div>
          <div class="artifacts-pagination-controls" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; margin-bottom: 10px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <label style="color: #fffae5; font-family: var(--font-family); font-size: 12px;">Items per page:</label>
              <select id="items-per-page-select" style="background: var(--bg-rpg-box); border: var(--border-rpg); color: #fffae5; font-family: var(--font-family); padding: 4px 8px; font-size: 12px; cursor: pointer;">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="0">All</option>
              </select>
            </div>
            <div id="pagination-info" style="color: #fffae5; font-family: var(--font-family); font-size: 12px;"></div>
            <div style="display: flex; gap: 8px;">
              <button id="prev-page-btn" class="filter-btn" style="padding: 6px 12px; font-size: 12px;">« Prev</button>
              <button id="next-page-btn" class="filter-btn" style="padding: 6px 12px; font-size: 12px;">Next »</button>
            </div>
          </div>
          <div class="artifacts-inventory" id="artifacts-list"></div>
        </div>
      </div>
    `;

    return modal;
  }

  private setupEventListeners(): void {
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });


    // Filter buttons
    const filterBtns = this.modal.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn) => {
      if (btn.id === 'fusion-mode-btn' || btn.id === 'fuse-action-btn') return;

      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        if (filter) {
          this.currentFilter = filter;
          this.currentPage = 1; // Reset to first page when filter changes

          // Update active class
          this.modal.querySelectorAll('.filter-btn').forEach((b) => {
            if (b.id !== 'fusion-mode-btn' && b.id !== 'fuse-action-btn') {
              b.classList.remove('active');
            }
          });
          btn.classList.add('active');
          this.render();
        }
      });
    });

    // Fusion Mode Button
    const fusionModeBtn = this.modal.querySelector('#fusion-mode-btn');
    fusionModeBtn?.addEventListener('click', () => {
      this.isFusionMode = !this.isFusionMode;
      this.selectedArtifactIds.clear();

      if (this.isFusionMode) {
        fusionModeBtn.classList.add('active');
        fusionModeBtn.innerHTML = '❌ Exit Fusion';
        // Force filter to 'common' if currently on 'all' or 'equipped' to help user start
        if (this.currentFilter === 'all' || this.currentFilter === 'equipped') {
          this.currentFilter = 'common';
          this.currentPage = 1; // Reset to first page when filter changes
          // Update filter buttons UI
          this.modal.querySelectorAll('.filter-btn').forEach((b) => {
            if (b.getAttribute('data-filter') === 'common')
              b.classList.add('active');
            else if (b.id !== 'fusion-mode-btn') b.classList.remove('active');
          });
        }
      } else {
        fusionModeBtn.classList.remove('active');
        fusionModeBtn.innerHTML = '⚗️ Fusion Mode';
      }
      this.render();
    });

    // Fuse Action Button
    const fuseActionBtn = this.modal.querySelector('#fuse-action-btn');
    fuseActionBtn?.addEventListener('click', async () => {
      if (this.selectedArtifactIds.size !== 3) return;

      const state = this.store.getState();
      const artifacts = this.artifactSystem.getArtifacts();

      // Get rarity of selected artifacts
      const firstId = this.selectedArtifactIds.values().next().value;
      const firstArtifact = artifacts.find((a) => a.id === firstId);
      if (!firstArtifact) return;

      const cost = this.artifactSystem.getFusionCost(firstArtifact.rarity);
      const currentPP = state.prestigePoints || 0;

      if (currentPP < cost) {
        await alertDialog.alert(
          `Not enough Prestige Points! Need ${cost} PP, but you have ${currentPP} PP.`,
          'Fusion',
        );
        return;
      }

      const result = this.artifactSystem.fuseArtifacts(
        Array.from(this.selectedArtifactIds),
        currentPP,
      );
      if (result.success && result.newArtifact && result.cost !== undefined) {
        // Deduct PP
        state.prestigePoints = currentPP - result.cost;
        this.store.setState(state);

        await alertDialog.alert(
          `Fusion Successful! Obtained ${result.newArtifact.name} (${result.newArtifact.rarity}) for ${result.cost} PP`,
          'Fusion',
        );
        this.selectedArtifactIds.clear();
        this.render();
      } else {
        await alertDialog.alert(`Fusion Failed: ${result.reason}`, 'Fusion');
      }
    });

    // Pagination controls
    const itemsPerPageSelect = this.modal.querySelector('#items-per-page-select') as HTMLSelectElement;
    itemsPerPageSelect.value = String(this.itemsPerPage);
    itemsPerPageSelect.addEventListener('change', () => {
      this.itemsPerPage = itemsPerPageSelect.value === '0' ? 0 : parseInt(itemsPerPageSelect.value, 10);
      this.currentPage = 1; // Reset to first page when changing items per page
      this.render();
    });

    const prevPageBtn = this.modal.querySelector('#prev-page-btn');
    prevPageBtn?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.render();
      }
    });

    const nextPageBtn = this.modal.querySelector('#next-page-btn');
    nextPageBtn?.addEventListener('click', () => {
      // Get total pages to check if we can advance
      const artifacts = this.artifactSystem.getArtifacts();
      let filteredArtifacts = artifacts;
      if (this.currentFilter === 'equipped') {
        filteredArtifacts = artifacts.filter((a) => a.equipped);
      } else if (this.currentFilter !== 'all') {
        filteredArtifacts = artifacts.filter((a) => a.rarity === this.currentFilter);
      }
      const itemsPerPage = this.itemsPerPage === 0 ? filteredArtifacts.length : this.itemsPerPage;
      const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredArtifacts.length / itemsPerPage);

      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.render();
      }
    });
  }

  public show(): void {
    // Close boss dialog if open to prevent interference
    const bossDialog = document.getElementById('boss-dialog');
    if (bossDialog && bossDialog.style.display !== 'none') {
      bossDialog.style.display = 'none';
    }
    // Reset to first page when opening modal
    this.currentPage = 1;
    document.body.style.overflow = 'hidden';
    this.modal.style.display = 'flex';
    this.render();
    // Use requestAnimationFrame to ensure display is set before animation
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
  }

  public hide(): void {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    // Wait for animation to complete
    setTimeout(() => {
      this.modal.style.display = 'none';
      // Call callback if set (used for sequencing modals)
      if (this.onCloseCallback) {
        const callback = this.onCloseCallback;
        this.onCloseCallback = null; // Clear callback after use
        callback();
      }
    }, 300);
  }

  public setOnCloseCallback(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  public refresh(): void {
    this.render();
  }

  private render(): void {
    const container = this.modal.querySelector('#artifacts-list');
    const equippedCount = this.modal.querySelector('#equipped-count');
    const totalCount = this.modal.querySelector('#total-count');
    const fuseBtn = this.modal.querySelector('#fuse-action-btn') as HTMLElement;

    if (!container || !equippedCount || !totalCount) return;

    const artifacts = this.artifactSystem.getArtifacts();
    const equipped = this.artifactSystem.getEquippedArtifacts();

    equippedCount.textContent = equipped.length.toString();
    totalCount.textContent = artifacts.length.toString();

    // Update Fuse Button
    if (this.isFusionMode) {
      fuseBtn.style.display = 'block';

      // Calculate PP cost if 3 artifacts selected
      let costText = '';
      if (this.selectedArtifactIds.size === 3) {
        const firstId = this.selectedArtifactIds.values().next().value;
        const firstArtifact = artifacts.find((a) => a.id === firstId);
        if (firstArtifact) {
          const cost = this.artifactSystem.getFusionCost(firstArtifact.rarity);
          const state = this.store.getState();
          const currentPP = state.prestigePoints || 0;
          const canAfford = currentPP >= cost;
          costText = ` (${cost} PP)`;
          fuseBtn.style.opacity = canAfford ? '1' : '0.5';
          fuseBtn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
          if (!canAfford) {
            fuseBtn.title = `Need ${cost} PP, but you have ${currentPP} PP`;
          } else {
            fuseBtn.title = `Fuse for ${cost} PP`;
          }
        }
      } else {
        fuseBtn.style.opacity = '0.5';
        fuseBtn.style.cursor = 'not-allowed';
        fuseBtn.title = 'Select 3 artifacts to fuse';
      }

      fuseBtn.textContent = `Fuse (${this.selectedArtifactIds.size}/3)${costText}`;
    } else {
      fuseBtn.style.display = 'none';
    }

    // Filter artifacts
    let filteredArtifacts = artifacts;
    if (this.currentFilter === 'equipped') {
      filteredArtifacts = artifacts.filter((a) => a.equipped);
    } else if (this.currentFilter !== 'all') {
      filteredArtifacts = artifacts.filter(
        (a) => a.rarity === this.currentFilter,
      );
    }

    if (filteredArtifacts.length === 0) {
      const filterText =
        this.currentFilter === 'all' ? '' : ` (${this.currentFilter})`;
      container.innerHTML = `<div class="no-artifacts">No artifacts found${filterText}. Complete missions and bosses to earn artifacts!</div>`;
      return;
    }

    // Sort: equipped first, then by rarity
    const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
      if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    // Pagination logic
    const totalItems = sortedArtifacts.length;
    const itemsPerPage = this.itemsPerPage === 0 ? totalItems : this.itemsPerPage;
    const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

    // Ensure current page is valid
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages || 1;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    // Get artifacts for current page
    const startIndex = itemsPerPage === 0 ? 0 : (this.currentPage - 1) * itemsPerPage;
    const endIndex = itemsPerPage === 0 ? totalItems : startIndex + itemsPerPage;
    const paginatedArtifacts = sortedArtifacts.slice(startIndex, endIndex);

    // Update pagination controls
    const paginationInfo = this.modal.querySelector('#pagination-info');
    if (paginationInfo) {
      if (itemsPerPage === 0 || totalPages === 0) {
        paginationInfo.textContent = `Showing all ${totalItems} items`;
      } else {
        paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${totalItems} total)`;
      }
    }

    const prevPageBtn = this.modal.querySelector('#prev-page-btn') as HTMLButtonElement;
    const nextPageBtn = this.modal.querySelector('#next-page-btn') as HTMLButtonElement;

    if (prevPageBtn) {
      prevPageBtn.disabled = this.currentPage <= 1;
      prevPageBtn.style.opacity = this.currentPage <= 1 ? '0.5' : '1';
      prevPageBtn.style.cursor = this.currentPage <= 1 ? 'not-allowed' : 'pointer';
    }

    if (nextPageBtn) {
      nextPageBtn.disabled = this.currentPage >= totalPages;
      nextPageBtn.style.opacity = this.currentPage >= totalPages ? '0.5' : '1';
      nextPageBtn.style.cursor = this.currentPage >= totalPages ? 'not-allowed' : 'pointer';
    }

    container.innerHTML = paginatedArtifacts
      .map((artifact) => {
        const color = this.artifactSystem.getRarityColor(artifact.rarity);
        const upgradeCost = this.artifactSystem.getUpgradeCostForDisplay(
          artifact.id,
        );
        const sellValue = this.artifactSystem.getSellValue(artifact.id);
        const canUpgrade = artifact.level < artifact.maxLevel;
        const state = this.store.getState();

        // Fusion Logic
        const isSelected = this.selectedArtifactIds.has(artifact.id);
        let isDimmed = false;

        if (this.isFusionMode) {
          // Dim if: equipped OR legendary OR (selected exists AND diff rarity)
          if (artifact.equipped || artifact.rarity === 'legendary') {
            isDimmed = true;
          } else if (this.selectedArtifactIds.size > 0) {
            // Get rarity of first selected item
            const firstId = this.selectedArtifactIds.values().next().value;
            const firstArtifact = artifacts.find((a) => a.id === firstId);
            if (firstArtifact && firstArtifact.rarity !== artifact.rarity) {
              isDimmed = true;
            }
          }
        }

        return `
        <div class="artifact-slot ${artifact.equipped ? 'equipped' : ''} ${isSelected ? 'selected-for-fusion' : ''}" 
             data-id="${artifact.id}"
             style="border-color: ${isSelected ? '#2ecc71' : color}; 
                    box-shadow: 0 0 ${isSelected ? '20px #2ecc71' : `15px ${color}30`}; 
                    opacity: ${isDimmed ? '0.4' : '1'}; 
                    cursor: ${this.isFusionMode && !isDimmed ? 'pointer' : 'default'};
                    transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};
                    transition: all 0.2s;">
          <div class="artifact-slot-glow" style="background: radial-gradient(circle, ${color}25 0%, transparent 70%);"></div>
          <div class="artifact-slot-icon rarity-${artifact.rarity}" style="background: linear-gradient(135deg, ${color}25, ${color}08); border-color: ${color}40;">
            <div class="artifact-icon-large" style="${artifact.icon.startsWith('/') || artifact.icon.startsWith('http') ? '' : `filter: drop-shadow(0 0 10px ${color});`}">
              ${artifact.icon.startsWith('/') ||
            artifact.icon.startsWith('http')
            ? `<img src="${resolveArtifactIcon(artifact.icon)}" alt="${artifact.name}" style="filter: drop-shadow(0 0 10px ${color});" />`
            : artifact.icon
          }
            </div>
            ${artifact.equipped ? '<div class="equipped-badge">✓</div>' : ''}
            ${isSelected ? '<div class="selected-badge" style="position: absolute; top: -5px; right: -5px; background: #2ecc71; color: #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">✓</div>' : ''}
            <div class="artifact-rarity-badge" style="background: ${color}60; border-color: ${color}; box-shadow: 0 0 8px ${color}50;">
              <span class="rarity-letter">${artifact.rarity.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div class="artifact-slot-info">
            <div class="artifact-slot-name" style="color: ${color}; text-shadow: 0 0 8px ${color}60;">${artifact.name}</div>
            <div class="artifact-slot-desc">${artifact.description}</div>
            <div class="artifact-slot-level">
              <span class="level-label">Level</span>
              <span class="level-value">${artifact.level.toString()}/${artifact.maxLevel.toString()}</span>
            </div>
          </div>
          ${!this.isFusionMode
            ? `
          <div class="artifact-slot-actions">
            <button class="artifact-action-btn equip-btn ${artifact.equipped ? 'active' : ''}" data-id="${artifact.id}" data-action="equip" title="${artifact.equipped ? i18n.t('artifacts.unequip') : i18n.t('artifacts.equip')}">
              <span class="btn-text">${artifact.equipped ? i18n.t('artifacts.unequip') : i18n.t('artifacts.equip')}</span>
            </button>
            ${canUpgrade
              ? `<button class="artifact-action-btn upgrade-btn ${state.points >= upgradeCost ? '' : 'disabled'}" 
                      data-id="${artifact.id}" 
                      data-action="upgrade"
                      ${state.points < upgradeCost ? 'disabled' : ''}
                      title="Upgrade: ${upgradeCost.toLocaleString()}">
                  <span class="btn-icon">⬆</span>
                </button>`
              : ''
            }
            <button class="artifact-action-btn sell-btn" data-id="${artifact.id}" data-action="sell" title="Sell for ${sellValue.toLocaleString()} points">
              <span class="btn-icon">💰</span>
            </button>
          </div>
          `
            : ''
          }
        </div>
      `;
      })
      .join('');

    // Add event listeners
    if (this.isFusionMode) {
      // Selection listeners
      container.querySelectorAll('.artifact-slot').forEach((slot) => {
        slot.addEventListener('click', () => {
          const id = slot.getAttribute('data-id');
          if (!id) return;

          const artifact = artifacts.find((a) => a.id === id);
          if (!artifact) return;

          // Validation for selection
          if (artifact.equipped || artifact.rarity === 'legendary') return;

          // Check rarity consistency
          if (
            this.selectedArtifactIds.size > 0 &&
            !this.selectedArtifactIds.has(id)
          ) {
            const firstId = this.selectedArtifactIds.values().next().value;
            const firstArtifact = artifacts.find((a) => a.id === firstId);
            if (firstArtifact && firstArtifact.rarity !== artifact.rarity)
              return;
          }

          if (this.selectedArtifactIds.has(id)) {
            this.selectedArtifactIds.delete(id);
          } else {
            if (this.selectedArtifactIds.size < 3) {
              this.selectedArtifactIds.add(id);
            }
          }
          this.render();
        });
      });
    } else {
      // Action listeners (Equip/Upgrade/Sell)
      container.querySelectorAll('.artifact-action-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const action = btn.getAttribute('data-action');
          if (!id || !action) return;

          const state = this.store.getState();

          if (action === 'equip') {
            this.artifactSystem.equipArtifact(id);
            this.store.setState({ ...state });
            this.render();
          } else if (action === 'upgrade') {
            const result = this.artifactSystem.upgradeArtifact(
              id,
              state.points,
            );
            if (result.success) {
              state.points -= result.cost;
              this.store.setState(state);
              this.render();
            }
          } else if (action === 'sell') {
            const sellValue = this.artifactSystem.getSellValue(id);
            const confirmed = await alertDialog.confirm(
              `Sell ${this.artifactSystem.getArtifacts().find((a) => a.id === id)?.name} for ${sellValue.toLocaleString()} points?`,
              'Sell Artifact',
            );
            if (confirmed) {
              const pointsGained = this.artifactSystem.sellArtifact(id);
              state.points += pointsGained;
              this.store.setState(state);
              this.render();
            }
          }
        });
      });
    }
  }
}
