import type { ArtifactSystem } from '../systems/ArtifactSystem';
import type { Store } from '../core/Store';

export class ArtifactsModal {
  private modal: HTMLElement;
  private artifactSystem: ArtifactSystem;
  private store: Store;
  private onCloseCallback: (() => void) | null = null;
  private currentFilter: string = 'all';

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
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content artifacts-modal-content">
        <div class="modal-header">
          <h2><img src="/src/icons/stars.png" alt="Artifacts" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;" /> Artifacts</h2>
          <button class="modal-close"><img src="/src/icons/menu/close.png" alt="Close" /></button>
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

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Filter buttons
    const filterBtns = this.modal.querySelectorAll('.filter-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        if (filter) {
          this.currentFilter = filter;
          filterBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.render();
        }
      });
    });
  }

  public show(): void {
    // Close boss dialog if open to prevent interference
    const bossDialog = document.getElementById('boss-dialog');
    if (bossDialog && bossDialog.style.display !== 'none') {
      bossDialog.style.display = 'none';
    }
    this.modal.style.display = 'flex';
    this.render();
    // Trigger animation
    requestAnimationFrame(() => {
      this.modal.classList.add('show');
    });
  }

  public hide(): void {
    this.modal.classList.remove('show');
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

    if (!container || !equippedCount || !totalCount) return;

    const artifacts = this.artifactSystem.getArtifacts();
    const equipped = this.artifactSystem.getEquippedArtifacts();

    equippedCount.textContent = equipped.length.toString();
    totalCount.textContent = artifacts.length.toString();

    // Filter artifacts
    let filteredArtifacts = artifacts;
    if (this.currentFilter === 'equipped') {
      filteredArtifacts = artifacts.filter((a) => a.equipped);
    } else if (this.currentFilter !== 'all') {
      filteredArtifacts = artifacts.filter((a) => a.rarity === this.currentFilter);
    }

    if (filteredArtifacts.length === 0) {
      const filterText = this.currentFilter === 'all' ? '' : ` (${this.currentFilter})`;
      container.innerHTML =
        `<div class="no-artifacts">No artifacts found${filterText}. Complete missions and bosses to earn artifacts!</div>`;
      return;
    }

    // Sort: equipped first, then by rarity
    const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
      if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    container.innerHTML = sortedArtifacts
      .map((artifact) => {
        const color = this.artifactSystem.getRarityColor(artifact.rarity);
        const upgradeCost = this.artifactSystem.getUpgradeCostForDisplay(
          artifact.id,
        );
        const sellValue = this.artifactSystem.getSellValue(artifact.id);
        const canUpgrade = artifact.level < artifact.maxLevel;
        const state = this.store.getState();

        return `
        <div class="artifact-slot ${artifact.equipped ? 'equipped' : ''}" style="border-color: ${color}; box-shadow: 0 0 15px ${color}30;">
          <div class="artifact-slot-glow" style="background: radial-gradient(circle, ${color}25 0%, transparent 70%);"></div>
          <div class="artifact-slot-icon rarity-${artifact.rarity}" style="background: linear-gradient(135deg, ${color}25, ${color}08); border-color: ${color}40;">
            <div class="artifact-icon-large" style="${artifact.icon.startsWith('/') || artifact.icon.startsWith('http') ? '' : `filter: drop-shadow(0 0 10px ${color});`}">
              ${artifact.icon.startsWith('/') || artifact.icon.startsWith('http') 
                ? `<img src="${artifact.icon}" alt="${artifact.name}" style="filter: drop-shadow(0 0 10px ${color});" />`
                : artifact.icon}
            </div>
            ${artifact.equipped ? '<div class="equipped-badge">✓</div>' : ''}
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
          <div class="artifact-slot-actions">
            <button class="artifact-action-btn equip-btn ${artifact.equipped ? 'active' : ''}" data-id="${artifact.id}" data-action="equip" title="${artifact.equipped ? 'Unequip' : 'Equip'}">
              <span class="btn-icon">${artifact.equipped ? '✓' : '⚔'}</span>
            </button>
            ${
              canUpgrade
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
        </div>
      `;
      })
      .join('');

    // Add event listeners
    container.querySelectorAll('.artifact-action-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
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
          const result = this.artifactSystem.upgradeArtifact(id, state.points);
          if (result.success) {
            state.points -= result.cost;
            this.store.setState(state);
            this.render();
          }
        } else if (action === 'sell') {
          const sellValue = this.artifactSystem.getSellValue(id);
          if (confirm(`Sell ${this.artifactSystem.getArtifacts().find(a => a.id === id)?.name} for ${sellValue.toLocaleString()} points?`)) {
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

