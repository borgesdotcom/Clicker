import type { Store } from '../core/Store';
import type { UpgradeSystem } from '../systems/UpgradeSystem';
import type { AscensionSystem } from '../systems/AscensionSystem';
import type { ArtifactSystem } from '../systems/ArtifactSystem';
import type { GameState } from '../types';
import { NumberFormatter } from '../utils/NumberFormatter';
import { ColorManager } from '../math/ColorManager';

export class GameInfoModal {
  private modal: HTMLElement;

  constructor(
    private store: Store,
    private upgradeSystem: UpgradeSystem,
    private ascensionSystem: AscensionSystem,
    private artifactSystem?: ArtifactSystem,
  ) {
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal game-info-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content info-content">
        <div class="modal-header">
          <h2>📊 Game Information & Mechanics</h2>
          <button class="modal-close" id="info-close">&times;</button>
        </div>
        <div class="info-tabs">
          <button class="info-tab active" data-tab="combat">Combat</button>
          <button class="info-tab" data-tab="progression">Progression</button>
          <button class="info-tab" data-tab="mechanics">Mechanics</button>
          <button class="info-tab" data-tab="tips">Tips</button>
        </div>
        <div class="info-content-area" id="info-content-area"></div>
      </div>
    `;
    return modal;
  }

  private setupEventListeners(): void {
    const closeBtn = this.modal.querySelector('#info-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Tab switching
    const tabs = this.modal.querySelectorAll('.info-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab') || 'combat';
        this.renderTab(tabName);
      });
    });
  }

  show(): void {
    this.modal.style.display = 'flex';
    this.renderTab('combat');
  }

  hide(): void {
    this.modal.style.display = 'none';
  }

  private renderTab(tabName: string): void {
    const container = this.modal.querySelector('#info-content-area');
    if (!container) return;

    const state = this.store.getState();

    switch (tabName) {
      case 'combat':
        container.innerHTML = this.renderCombatTab(state);
        break;
      case 'progression':
        container.innerHTML = this.renderProgressionTab(state);
        break;
      case 'mechanics':
        container.innerHTML = this.renderMechanicsTab(state);
        break;
      case 'tips':
        container.innerHTML = this.renderTipsTab();
        break;
    }
  }

  private renderCombatTab(state: GameState): string {
    const clickDamage = this.upgradeSystem.getPointsPerHit(state);
    const shipDamage = this.upgradeSystem.getAutoFireDamage(state);
    const fireCooldown = this.upgradeSystem.getFireCooldown(state);
    const attackSpeed = fireCooldown > 0 ? 1000 / fireCooldown : 0; // Convert ms to shots per second
    const totalShipDPS = shipDamage * state.shipsCount * attackSpeed;
    const critChance = this.upgradeSystem.getCritChance(state);
    const critMultiplier = this.upgradeSystem.getCritMultiplier(state);

    // Artifact bonuses
    const artifactDamageBonus = this.artifactSystem
      ? this.artifactSystem.getDamageBonus()
      : 0;
    const artifactSpeedBonus = this.artifactSystem
      ? this.artifactSystem.getSpeedBonus()
      : 0;
    const artifactCritBonus = this.artifactSystem
      ? this.artifactSystem.getCritBonus()
      : 0;
    const artifactPointsBonus = this.artifactSystem
      ? this.artifactSystem.getPointsBonus()
      : 0;
    const artifactXPBonus = this.artifactSystem
      ? this.artifactSystem.getXPBonus()
      : 0;

    return `
      <div class="info-section">
        <h3>⚔️ Your Damage Output</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Click Damage (Main Ship):</span>
            <span class="info-value">${NumberFormatter.format(clickDamage)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Damage Per Ship:</span>
            <span class="info-value">${NumberFormatter.format(shipDamage)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Fleet DPS:</span>
            <span class="info-value">${NumberFormatter.format(totalShipDPS)} (${state.shipsCount.toString()} ships)</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fleet Attack Speed:</span>
            <span class="info-value">${attackSpeed.toFixed(2)} shots/sec</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>✨ Critical Hits</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Crit Chance:</span>
            <span class="info-value">${critChance.toFixed(1)}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Crit Multiplier:</span>
            <span class="info-value">${critMultiplier.toFixed(1)}x damage</span>
          </div>
          <div class="info-item">
            <span class="info-label">Crit Damage (Main Ship):</span>
            <span class="info-value">${NumberFormatter.format(clickDamage * critMultiplier)}</span>
          </div>
        </div>
        <p class="info-note">💡 Critical hits work on both your clicks AND your fleet's automatic shots!</p>
      </div>

      <div class="info-section">
        <h3>🎯 Accuracy Info</h3>
        <p>• <strong>Main Ship (Clicks):</strong> Your clicks always hit and deal ${NumberFormatter.format(clickDamage)} damage</p>
        <p>• <strong>Fleet Ships:</strong> Each ship fires ${attackSpeed.toFixed(2)} times per second, dealing ${NumberFormatter.format(shipDamage)} per hit</p>
        <p>• <strong>Critical Hits:</strong> Both click and fleet damage can crit for ${critMultiplier.toFixed(1)}x damage</p>
      </div>

      ${
        this.artifactSystem &&
        (artifactDamageBonus > 0 ||
          artifactSpeedBonus > 0 ||
          artifactCritBonus > 0 ||
          artifactPointsBonus > 0 ||
          artifactXPBonus > 0)
          ? `
      <div class="info-section">
        <h3>✨ Artifact Bonuses</h3>
        <div class="info-grid">
          ${
            artifactDamageBonus > 0
              ? `<div class="info-item">
            <span class="info-label">Damage Bonus:</span>
            <span class="info-value">+${(artifactDamageBonus * 100).toFixed(1)}%</span>
          </div>`
              : ''
          }
          ${
            artifactSpeedBonus > 0
              ? `<div class="info-item">
            <span class="info-label">Attack Speed Bonus:</span>
            <span class="info-value">+${(artifactSpeedBonus * 100).toFixed(1)}%</span>
          </div>`
              : ''
          }
          ${
            artifactCritBonus > 0
              ? `<div class="info-item">
            <span class="info-label">Critical Bonus:</span>
            <span class="info-value">+${(artifactCritBonus * 100).toFixed(1)}%</span>
          </div>`
              : ''
          }
          ${
            artifactPointsBonus > 0
              ? `<div class="info-item">
            <span class="info-label">Points Bonus:</span>
            <span class="info-value">+${(artifactPointsBonus * 100).toFixed(1)}%</span>
          </div>`
              : ''
          }
          ${
            artifactXPBonus > 0
              ? `<div class="info-item">
            <span class="info-label">XP Bonus:</span>
            <span class="info-value">+${(artifactXPBonus * 100).toFixed(1)}%</span>
          </div>`
              : ''
          }
        </div>
        <p class="info-note">💡 Artifacts are found from boss kills and can be equipped/upgraded in the Artifacts menu</p>
      </div>
      `
          : ''
      }
    `;
  }

  private renderProgressionTab(state: GameState): string {
    const passiveGen = this.upgradeSystem.getPassiveGen(state);
    const xpMult = this.upgradeSystem.getXPMultiplier(state);
    const currentXP = state.experience || 0;
    const xpRequired = ColorManager.getExpRequired(state.level);
    const prestigePoints = this.ascensionSystem.calculatePrestigePoints(state);

    return `
      <div class="info-section">
        <h3>📈 Leveling System</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Current Level:</span>
            <span class="info-value">${state.level.toString()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">XP Progress:</span>
            <span class="info-value">${Math.floor(currentXP).toString()} / ${xpRequired.toString()} (${((currentXP / xpRequired) * 100).toFixed(1)}%)</span>
          </div>
          <div class="info-item">
            <span class="info-label">XP Multiplier:</span>
            <span class="info-value">${xpMult.toFixed(2)}x (+${((xpMult - 1) * 100).toFixed(0)}%)</span>
          </div>
        </div>
        <p class="info-note">💡 You gain 1 XP per enemy killed. Boss enemies give 10x XP!</p>
      </div>

      <div class="info-section">
        <h3>💰 Income Sources</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Passive Generation:</span>
            <span class="info-value">${NumberFormatter.format(passiveGen)}/sec</span>
          </div>
          <div class="info-item">
            <span class="info-label">Per Hour:</span>
            <span class="info-value">${NumberFormatter.format(passiveGen * 3600)}</span>
          </div>
        </div>
        <p class="info-note">⚠️ "Boost All Systems" upgrades increase damage and fleet power, NOT passive generation!</p>
        <p class="info-note">To increase passive income, upgrade the "🏭 Energy Reactor" system.</p>
      </div>

      <div class="info-section">
        <h3>👾 Boss Encounters</h3>
        <p>• Bosses appear at <strong>regular intervals</strong>:</p>
        <p>&nbsp;&nbsp;→ Every 25 levels (1-100): 25, 50, 75, 100</p>
        <p>&nbsp;&nbsp;→ Every 50 levels (101-500): 150, 200, 250, etc.</p>
        <p>&nbsp;&nbsp;→ Every 100 levels (501+): 600, 700, 800, etc.</p>
        <p>• Boss HP scales with level and has a time limit</p>
        <p>• Defeating bosses gives <strong>10x XP</strong> and allows you to continue leveling</p>
        <p>• If you fail, you can retry with better upgrades</p>
      </div>

      <div class="info-section">
        <h3>🌟 Ascension System</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Can Ascend:</span>
            <span class="info-value">${state.level >= 100 ? 'Yes' : `No (reach level 100)`}</span>
          </div>
          <div class="info-item">
            <span class="info-label">PP On Ascension:</span>
            <span class="info-value">${prestigePoints.toString()} Prestige Points</span>
          </div>
        </div>
        <p class="info-note">💡 Prestige Points are earned for each NEW level beyond your previous best</p>
        <p class="info-note">You keep: Achievements, Statistics, and Prestige Upgrades ONLY</p>
        <p class="info-note">⚠️ You LOSE all special upgrades, regular upgrades, levels, and currency</p>
      </div>
    `;
  }

  private renderMechanicsTab(state: GameState): string {
    const cosmicDiscount = state.cosmicKnowledgeLevel * 0.5;
    const fleetDiscount = state.fleetCommandLevel * 1.0;

    return `
      <div class="info-section">
        <h3>💎 Cost Reduction Systems</h3>
        <p><strong>🌌 Cosmic Knowledge:</strong> -${cosmicDiscount.toFixed(1)}% to ALL costs</p>
        <p><strong>🚀 Fleet Command:</strong> -${fleetDiscount.toFixed(1)}% to SHIP upgrade costs only</p>
        <p class="info-note">💡 These stack multiplicatively with Special Upgrade discounts!</p>
      </div>

      <div class="info-section">
        <h3>🔄 Combo System</h3>
        <p>• Build combo by hitting enemies without a 5-second gap</p>
        <p>• Damage multiplier: <strong>1 + (combo × 0.001)</strong></p>
        <p>• Example: 100 combo = 1.1x damage, 1000 combo = 2x damage</p>
        <p>• Combo resets if you don't hit anything for 5 seconds</p>
      </div>

      <div class="info-section">
        <h3>👾 Enemy Types</h3>
        <p><strong>🟢 Normal (60%):</strong> Standard HP, standard rewards</p>
        <p><strong>🟡 Scout (20%, Lv 10+):</strong> 50% HP, 2x speed, 70% size, 1.5x points</p>
        <p><strong>🔴 Tank (15%, Lv 20+):</strong> 3x HP, 0.5x speed, 140% size, 2.5x points</p>
        <p><strong>🟢 Healer (5%, Lv 30+):</strong> 80% HP, 80% speed, regenerates, 3x points</p>
      </div>

      <div class="info-section">
        <h3>⚙️ How Upgrades Affect You</h3>
        <p><strong>Attack Speed:</strong> How fast your fleet fires (does NOT affect your clicks)</p>
        <p><strong>Damage:</strong> Increases both click AND fleet damage</p>
        <p><strong>Crit Chance:</strong> Affects both clicks and fleet shots</p>
        <p><strong>Ships:</strong> Each ship adds to your total DPS</p>
        <p><strong>Energy Reactor:</strong> Passive points per second (offline progress)</p>
        <p><strong>Knowledge Core:</strong> XP gain multiplier for faster leveling</p>
      </div>

      <div class="info-section">
        <h3>📊 Special Technology Progress</h3>
        <p>Unlock Special Technologies by:</p>
        <p>• Meeting level requirements for the base upgrade</p>
        <p>• Having 75% of the cost (technology becomes visible)</p>
        <p>• Purchasing with accumulated points</p>
        <p class="info-note">⚠️ Special Upgrades are LOST on ascension - buy them again with your prestige bonuses!</p>
      </div>
    `;
  }

  private renderTipsTab(): string {
    return `
      <div class="info-section">
        <h3>🎯 Early Game (Levels 1-30)</h3>
        <p>• Focus on <strong>Ships</strong> and <strong>Attack Speed</strong> for consistent DPS</p>
        <p>• Upgrade <strong>Damage</strong> to scale both clicks and fleet power</p>
        <p>• Don't neglect <strong>Crit Chance</strong> - it affects everything!</p>
        <p>• <strong>Knowledge Core</strong> (XP) helps you level faster</p>
      </div>

      <div class="info-section">
        <h3>🚀 Mid Game (Levels 30-100)</h3>
        <p>• Invest in <strong>Cosmic Knowledge</strong> to reduce all costs</p>
        <p>• Start buying <strong>Special Upgrades</strong> (they're permanent!)</p>
        <p>• Balance between damage upgrades and cost reduction</p>
        <p>• <strong>Energy Reactor</strong> provides passive income for when you're away</p>
      </div>

      <div class="info-section">
        <h3>⭐ Late Game (100+)</h3>
        <p>• Ascend at level 100+ to gain <strong>Prestige Points</strong></p>
        <p>• Prestige upgrades provide permanent multiplicative bonuses</p>
        <p>• Push for higher levels before ascending for more PP</p>
        <p>• Collect all Special Upgrades for maximum power</p>
      </div>

      <div class="info-section">
        <h3>💡 Pro Tips</h3>
        <p>• <strong>Combo System:</strong> Keep attacking for damage multipliers!</p>
        <p>• <strong>Boss Prep:</strong> Upgrade before boss fights (every 25+ levels)</p>
        <p>• <strong>Bulk Buy:</strong> Use the buy quantity selector (1, 5, 10, MAX)</p>
        <p>• <strong>Idle Strategy:</strong> Max out Energy Reactor for offline gains</p>
        <p>• <strong>Active Strategy:</strong> Focus on click damage and crit chance</p>
      </div>

      <div class="info-section">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <p>• <strong>Ctrl + F1:</strong> Toggle Debug Panel (cheat mode)</p>
      </div>
    `;
  }
}
