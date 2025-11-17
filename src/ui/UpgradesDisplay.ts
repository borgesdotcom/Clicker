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

      // Use star PNG image for all special upgrades
      const img = document.createElement('img');
      img.src = '/src/icons/stars.png';
      img.alt = t(`upgrades.special.${upgrade.id}.name`);
      img.style.width = '130%';
      img.style.height = '130%';
      img.style.objectFit = 'contain';
      img.style.transform = 'scale(1.1)';
      icon.appendChild(img);

      // Add tooltip on hover
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = t(`upgrades.special.${upgrade.id}.name`);
      icon.appendChild(tooltip);

      this.container.appendChild(icon);
    }
  }
}
