import type { ArtifactSystem } from '../systems/ArtifactSystem';
import type { Store } from '../core/Store';

export class ArtifactsModal {
  private modal: HTMLElement;
  private artifactSystem: ArtifactSystem;
  private store: Store;

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
          <h2>✨ Artifacts</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="artifacts-info">
            <p>Equipped: <span id="equipped-count">0</span>/${this.artifactSystem.getMaxEquipped().toString()}</p>
            <div class="artifact-bonuses" id="artifact-bonuses"></div>
          </div>
          <div class="artifacts-container" id="artifacts-list"></div>
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
  }

  public show(): void {
    this.modal.style.display = 'flex';
    this.render();
  }

  public hide(): void {
    this.modal.style.display = 'none';
  }

  private render(): void {
    const container = this.modal.querySelector('#artifacts-list');
    const bonusesContainer = this.modal.querySelector('#artifact-bonuses');
    const equippedCount = this.modal.querySelector('#equipped-count');

    if (!container || !bonusesContainer || !equippedCount) return;

    const artifacts = this.artifactSystem.getArtifacts();
    const equipped = this.artifactSystem.getEquippedArtifacts();
    const bonuses = this.artifactSystem.getAllBonuses();

    equippedCount.textContent = equipped.length.toString();

    // Render bonuses
    bonusesContainer.innerHTML = bonuses
      .map((bonus) => `<div class="bonus-item">${bonus}</div>`)
      .join('');

    if (artifacts.length === 0) {
      container.innerHTML =
        '<p class="no-artifacts">No artifacts found. Complete missions and bosses to earn artifacts!</p>';
      return;
    }

    // Sort: equipped first, then by rarity
    const sortedArtifacts = [...artifacts].sort((a, b) => {
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
        const canUpgrade = artifact.level < artifact.maxLevel;
        const state = this.store.getState();

        return `
        <div class="artifact-card ${artifact.equipped ? 'equipped' : ''}" style="border-color: ${color}">
          <div class="artifact-header">
            <div class="artifact-icon">${artifact.icon}</div>
            <div class="artifact-title">
              <h3 style="color: ${color}">${artifact.name}</h3>
              <p class="artifact-rarity" style="color: ${color}">${artifact.rarity.toUpperCase()}</p>
            </div>
          </div>
          <div class="artifact-details">
            <p class="artifact-description">${artifact.description}</p>
            <p class="artifact-level">Level: ${artifact.level.toString()}/${artifact.maxLevel.toString()}</p>
          </div>
          <div class="artifact-actions">
            <button class="artifact-equip-btn ${artifact.equipped ? 'equipped' : ''}" data-id="${artifact.id}">
              ${artifact.equipped ? '✓ Equipped' : 'Equip'}
            </button>
            ${
              canUpgrade
                ? `
              <button class="artifact-upgrade-btn ${state.points >= upgradeCost ? '' : 'disabled'}" 
                      data-id="${artifact.id}" 
                      ${state.points < upgradeCost ? 'disabled' : ''}>
                Upgrade (${upgradeCost.toLocaleString()})
              </button>
            `
                : '<span class="max-level">MAX LEVEL</span>'
            }
          </div>
        </div>
      `;
      })
      .join('');

    // Add event listeners
    const equipBtns = container.querySelectorAll('.artifact-equip-btn');
    equipBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          this.artifactSystem.equipArtifact(id);
          this.render();
        }
      });
    });

    const upgradeBtns = container.querySelectorAll('.artifact-upgrade-btn');
    upgradeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;

        const state = this.store.getState();
        const result = this.artifactSystem.upgradeArtifact(id, state.points);

        if (result.success) {
          state.points -= result.cost;
          this.store.setState(state);
          this.render();
        }
      });
    });
  }
}
