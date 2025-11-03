import type { GameState } from '../types';
import type { UpgradeSystem } from '../systems/UpgradeSystem';
import { t } from '../core/I18n';

export class UpgradesDisplay {
  private container: HTMLElement;

  constructor(private upgradeSystem: UpgradeSystem) {
    const element = document.getElementById('upgrades-display');
    if (!element) throw new Error('Upgrades display element not found');
    this.container = element;
  }

  update(state: GameState): void {
    this.container.innerHTML = '';
    this.upgradeSystem.updateSubUpgradesFromState(state);
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();

    const ownedUpgrades = allSubUpgrades.filter((upgrade) => upgrade.owned);

    if (ownedUpgrades.length === 0) {
      return; // Container will be hidden by CSS
    }

    for (const upgrade of ownedUpgrades) {
      const icon = document.createElement('div');
      icon.className = 'upgrade-icon';

      // Add emoji icon
      const emoji = this.getUpgradeEmoji(upgrade.id);
      icon.textContent = emoji;

      // Add tooltip on hover
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = t(`upgrades.special.${upgrade.id}.name`);
      icon.appendChild(tooltip);

      this.container.appendChild(icon);
    }
  }

  private getUpgradeEmoji(upgradeId: string): string {
    const emojiMap: Record<string, string> = {
      auto_fire: '🔥',
      death_pact: '💀',
      laser_focusing: '💎',
      quantum_targeting: '🎯',
      energy_recycling: '♻️',
      overclocked_reactors: '⚛️',
      ship_swarm: '🐝',
      neural_link: '🧠',
      antimatter_rounds: '💥',
      warp_core: '🌀',
      ai_optimizer: '🤖',
      perfect_precision: '✨',
      void_channeling: '🌌',
      temporal_acceleration: '⏰',
      singularity_core: '🕳️',
      cosmic_ascension: '🌟',
    };

    return emojiMap[upgradeId] || '⭐';
  }
}
