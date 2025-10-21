/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Store } from '../core/Store';
import type { UpgradeSystem } from '../systems/UpgradeSystem';
import { Button } from './Button';

export class Shop {
  private container: HTMLElement;
  private renderTimeout: number | null = null;
  private isRendering = false;
  private isProcessingPurchase = false;
  private lastAffordability: Map<string, boolean> = new Map();
  private currentTab: 'available' | 'owned' = 'available';
  private buttonCache: Map<string, HTMLButtonElement> = new Map();
  private soundManager: { playPurchase: () => void } | null = null;
  private lastUpdateTime = 0;
  private updateThrottle = 30; // Update at most every 30ms (much more responsive)

  constructor(
    private store: Store,
    private upgradeSystem: UpgradeSystem,
  ) {
    const element = document.getElementById('shop-content');
    if (!element) throw new Error('Shop content element not found');
    this.container = element;
    
    // Prevent shop clicks from bubbling to canvas (use bubble phase, not capture)
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      shopPanel.addEventListener('click', (e) => { e.stopPropagation(); });
      shopPanel.addEventListener('touchstart', (e) => { e.stopPropagation(); });
      shopPanel.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    }
    
    this.setupTabs();
    this.render();
    this.store.subscribe(() => { this.scheduleRender(); });
  }

  setSoundManager(soundManager: { playPurchase: () => void }): void {
    this.soundManager = soundManager;
  }

  private setupTabs(): void {
    const availableTab = document.getElementById('tab-available');
    const ownedTab = document.getElementById('tab-owned');

    availableTab?.addEventListener('click', () => {
      this.currentTab = 'available';
      availableTab.classList.add('active');
      ownedTab?.classList.remove('active');
      this.render();
    });

    ownedTab?.addEventListener('click', () => {
      this.currentTab = 'owned';
      ownedTab.classList.add('active');
      availableTab?.classList.remove('active');
      this.render();
    });
  }

  private scheduleRender(): void {
    // Don't schedule renders while processing a purchase
    if (this.isProcessingPurchase) return;
    
    const state = this.store.getState();
    const currentPoints = state.points;
    
    // Check if we're close to affording something (within 10%)
    const nearAffordable = this.isNearAffordable(currentPoints);
    
    // Use faster updates when close to affording something
    const throttle = nearAffordable ? 10 : this.updateThrottle;
    
    // Throttle updates to prevent lag
    const now = Date.now();
    if (now - this.lastUpdateTime < throttle) {
      return;
    }
    this.lastUpdateTime = now;
    
    // Use requestAnimationFrame for immediate smooth update
    if (this.renderTimeout !== null) {
      cancelAnimationFrame(this.renderTimeout);
    }
    this.renderTimeout = requestAnimationFrame(() => {
      // Check if affordability changed before updating
      if (this.hasAffordabilityChanged()) {
        this.updateButtonStates();
      }
      this.renderTimeout = null;
    });
  }

  private isNearAffordable(points: number): boolean {
    const state = this.store.getState();
    const upgrades = this.upgradeSystem.getUpgrades();
    
    // Check if we're within 10% of affording any upgrade
    for (const upgrade of upgrades) {
      const cost = upgrade.getCost(upgrade.getLevel(state));
      if (points >= cost * 0.9 && points < cost) {
        return true;
      }
    }
    
    // Also check sub-upgrades
    const subUpgrades = this.upgradeSystem.getSubUpgrades();
    for (const upgrade of subUpgrades) {
      if (!upgrade.isVisible(state) || upgrade.owned) continue;
      if (points >= upgrade.cost * 0.9 && points < upgrade.cost) {
        return true;
      }
    }
    
    return false;
  }

  private hasAffordabilityChanged(): boolean {
    const state = this.store.getState();
    const upgrades = this.upgradeSystem.getUpgrades();
    
    let changed = false;
    
    // Check main upgrades
    for (const upgrade of upgrades) {
      const key = upgrade.id;
      const canAfford = upgrade.canBuy(state);
      const wasAffordable = this.lastAffordability.get(key);
      
      if (wasAffordable !== canAfford) {
        changed = true;
        this.lastAffordability.set(key, canAfford);
      }
    }
    
    // Always check sub-upgrades (they're important for user experience)
    const subUpgrades = this.upgradeSystem.getSubUpgrades();
    for (const upgrade of subUpgrades) {
      if (!upgrade.isVisible(state)) continue;
      const key = `sub_${upgrade.id}`;
      const canAfford = !upgrade.owned && state.points >= upgrade.cost;
      const wasAffordable = this.lastAffordability.get(key);
      
      if (wasAffordable !== canAfford) {
        changed = true;
        this.lastAffordability.set(key, canAfford);
      }
    }
    
    return changed;
  }

  private updateButtonStates(): void {
    const state = this.store.getState();
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      // Update main upgrade buttons
      const upgrades = this.upgradeSystem.getUpgrades();
      for (const upgrade of upgrades) {
        const button = this.buttonCache.get(upgrade.id);
        if (button) {
          const canAfford = upgrade.canBuy(state);
          
          // Only update if state changed
          const wasDisabled = button.disabled;
          if (wasDisabled === canAfford) {
            button.disabled = !canAfford;
            
            // Use CSS classes instead of inline styles (faster)
            if (canAfford) {
              button.classList.remove('disabled');
            } else {
              button.classList.add('disabled');
            }
          }
        }
      }
      
      // Update sub-upgrade affordability classes
      const subUpgrades = this.upgradeSystem.getSubUpgrades();
      for (const subUpgrade of subUpgrades) {
        const card = document.querySelector(`[data-upgrade-id="${subUpgrade.id}"]`) as HTMLElement;
        if (card && !subUpgrade.owned) {
          const canAfford = state.points >= subUpgrade.cost;
          
          // Always update to ensure responsiveness
          card.style.opacity = canAfford ? '1' : '0.7';
          card.style.cursor = canAfford ? 'pointer' : 'not-allowed';
          card.style.border = canAfford ? '2px solid #fff' : '1px solid #666';
          card.style.pointerEvents = 'auto';
        }
      }
    });
  }

  private render(): void {
    if (this.isRendering) return;
    this.isRendering = true;

    this.container.innerHTML = '';
    const state = this.store.getState();
    this.upgradeSystem.updateSubUpgradesFromState(state);

    if (this.currentTab === 'available') {
      this.renderAvailableTab(state);
    } else {
      this.renderOwnedTab(state);
    }

    this.isRendering = false;
  }

  private renderAvailableTab(state: any): void {
    const upgrades = this.upgradeSystem.getUpgrades();
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();

    // Clear button cache for fresh render
    this.buttonCache.clear();

    // Render special upgrades box at the top
    const visibleSubUpgrades = allSubUpgrades.filter(sub => sub.isVisible(state) && !sub.owned);
    if (visibleSubUpgrades.length > 0) {
      const specialBox = document.createElement('div');
      specialBox.className = 'special-upgrades-box';

      const title = document.createElement('h3');
      title.textContent = '⭐ SPECIAL UPGRADES ⭐';
      specialBox.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'special-upgrades-grid';

      for (const subUpgrade of visibleSubUpgrades) {
        const subItem = this.createSubUpgradeCard(subUpgrade, state);
        grid.appendChild(subItem);
      }

      specialBox.appendChild(grid);
      this.container.appendChild(specialBox);
    }

    // Render main upgrades (exclude R&D category)
    for (const upgrade of upgrades) {
      if (upgrade.id === 'misc') continue;

      const item = document.createElement('div');
      item.className = 'upgrade-item';

      const header = document.createElement('div');
      header.className = 'upgrade-header';

      const name = document.createElement('div');
      name.className = 'upgrade-name';
      name.textContent = upgrade.name;

      const level = document.createElement('div');
      level.className = 'upgrade-level';
      level.textContent = upgrade.getDisplayText(state);

      header.appendChild(name);
      header.appendChild(level);

      const description = document.createElement('div');
      description.className = 'upgrade-description';
      description.textContent = upgrade.description;

      const footer = document.createElement('div');
      footer.className = 'upgrade-footer';

      const cost = document.createElement('div');
      cost.className = 'upgrade-cost';
      const currentCost = upgrade.getCost(upgrade.getLevel(state));
      cost.textContent = `Cost: ${this.formatNumber(currentCost)}`;

      const button = new Button('BUY', () => { this.buyUpgrade(upgrade); });
      button.setEnabled(upgrade.canBuy(state));
      
      // Cache the button element for quick updates
      const buttonElement = button.getElement();
      this.buttonCache.set(upgrade.id, buttonElement);

      footer.appendChild(cost);
      footer.appendChild(buttonElement);

      item.appendChild(header);
      item.appendChild(description);
      item.appendChild(footer);

      this.container.appendChild(item);
    }
  }

  private renderOwnedTab(state: any): void {
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();
    const ownedUpgrades = allSubUpgrades.filter(sub => sub.owned);

    if (ownedUpgrades.length === 0) {
      const message = document.createElement('div');
      message.style.padding = '40px';
      message.style.textAlign = 'center';
      message.style.color = '#666';
      message.textContent = 'No special upgrades owned yet.';
      this.container.appendChild(message);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'special-upgrades-grid';
    grid.style.padding = '10px 0';

    for (const subUpgrade of ownedUpgrades) {
      const card = this.createSubUpgradeCard(subUpgrade, state);
      grid.appendChild(card);
    }

    this.container.appendChild(grid);
  }

  private createSubUpgradeCard(subUpgrade: any, state: any): HTMLElement {
    const card = document.createElement('div');
    card.className = `sub-upgrade ${subUpgrade.owned ? 'owned' : ''}`;
    card.setAttribute('data-upgrade-id', subUpgrade.id);

    const icon = document.createElement('div');
    icon.className = 'sub-upgrade-icon';
    icon.textContent = this.getUpgradeEmoji(subUpgrade.id);
    card.appendChild(icon);

    const name = document.createElement('div');
    name.className = 'sub-upgrade-name';
    name.textContent = subUpgrade.name;
    card.appendChild(name);

    const cost = document.createElement('div');
    cost.className = 'sub-upgrade-cost';
    cost.textContent = subUpgrade.owned ? '✓ OWNED' : this.formatNumber(subUpgrade.cost);
    card.appendChild(cost);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'sub-upgrade-tooltip';
    tooltip.innerHTML = `<strong>${subUpgrade.name}</strong><br>${subUpgrade.description}<br><em style="color: #888; font-size: 10px;">${subUpgrade.flavor}</em>`;
    card.appendChild(tooltip);

    if (!subUpgrade.owned) {
      // Set initial affordability state
      const canAfford = state.points >= subUpgrade.cost;
      card.style.opacity = canAfford ? '1' : '0.7';
      card.style.cursor = canAfford ? 'pointer' : 'not-allowed';
      
      card.addEventListener('click', () => {
        const currentState = this.store.getState();
        if (currentState.points >= subUpgrade.cost) {
          this.buySubUpgrade(subUpgrade);
        }
      });
    }

    return card;
  }

  private getUpgradeEmoji(upgradeId: string): string {
    const emojiMap: Record<string, string> = {
      // Original
      'auto_fire': '🔥',
      'death_pact': '💀',
      'laser_focusing': '💎',
      'quantum_targeting': '🎯',
      'energy_recycling': '♻️',
      'overclocked_reactors': '⚛️',
      'ship_swarm': '🐝',
      'neural_link': '🧠',
      'antimatter_rounds': '💥',
      'warp_core': '🌀',
      'ai_optimizer': '🤖',
      'perfect_precision': '✨',
      'void_channeling': '🌌',
      'temporal_acceleration': '⏰',
      'singularity_core': '🕳️',
      'cosmic_ascension': '🌟',
      // New V1.0 Upgrades
      'coffee_machine': '☕',
      'lucky_dice': '🎲',
      'space_pizza': '🍕',
      'rubber_duck': '🦆',
      'motivational_posters': '📋',
      'disco_ball': '🪩',
      'lucky_horseshoe': '🍀',
      'arcade_machine': '🕹️',
      'chaos_emeralds': '💚',
      'time_machine': '⏱️',
      'philosophers_stone': '🗿',
      'golden_goose': '🦢',
      'infinity_gauntlet': '💍',
      'alien_cookbook': '📖',
      'nuclear_reactor': '☢️',
      'cheat_codes': '🎮',
      'dragon_egg': '🥚',
      'universe_map': '🗺️',
      'answer_to_everything': '4️⃣2️⃣',
      'heart_of_galaxy': '❤️',
      'meaning_of_life': '🔮',
      // Click-focused upgrades
      'master_clicker': '👆',
      'rapid_fire': '⚡',
      'click_multiplier': '✨',
      'super_clicker': '💪',
      'missile_launcher': '🚀',
    };
    return emojiMap[upgradeId] || '⭐';
  }

  private buyUpgrade(upgrade: { canBuy: (state: any) => boolean; getCost: (level: number) => number; getLevel: (state: any) => number; buy: (state: any) => void }): void {
    // Prevent concurrent purchases
    if (this.isProcessingPurchase) return;
    this.isProcessingPurchase = true;

    const state = this.store.getState();
    if (!upgrade.canBuy(state)) {
      this.isProcessingPurchase = false;
      return;
    }

    const price = upgrade.getCost(upgrade.getLevel(state));
    if (state.points >= price) {
      state.points -= price;
      upgrade.buy(state);
      this.store.incrementUpgrade();
      this.store.setState(state);
      
      // Play purchase sound
      if (this.soundManager) {
        this.soundManager.playPurchase();
      }
      
      // Force immediate UI update
      this.lastAffordability.clear();
      this.render();
    }
    
    this.isProcessingPurchase = false;
  }

  private buySubUpgrade(upgrade: { owned: boolean; cost: number; buy: (state: any) => void }): void {
    // Prevent concurrent purchases
    if (this.isProcessingPurchase) return;
    if (upgrade.owned) return;
    this.isProcessingPurchase = true;

    const state = this.store.getState();
    if (state.points >= upgrade.cost) {
      state.points -= upgrade.cost;
      upgrade.buy(state);
      this.store.incrementSubUpgrade();
      this.store.setState(state);
      
      // Play purchase sound
      if (this.soundManager) {
        this.soundManager.playPurchase();
      }
      
      // Force immediate UI update
      this.lastAffordability.clear();
      this.render();
    }
    
    this.isProcessingPurchase = false;
  }

  private formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  }
}

