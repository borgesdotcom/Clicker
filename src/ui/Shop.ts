/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Store } from '../core/Store';
import type { UpgradeSystem } from '../systems/UpgradeSystem';
import type { GameState, UpgradeConfig, SubUpgrade } from '../types';
import { Button } from './Button';
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';

export class Shop {
  private container: HTMLElement;
  private renderTimeout: number | null = null;
  private isRendering = false;
  private isProcessingPurchase = false;
  private lastAffordability: Map<string, boolean> = new Map();
  private currentTab: 'available' | 'owned' = 'available';
  private buttonCache: Map<string, HTMLButtonElement> = new Map();
  private soundManager: { playPurchase: () => void } | null = null;
  private missionSystem: { trackUpgrade: () => void } | null = null;
  private ascensionSystem: { isAutoBuyUnlocked: (state: GameState) => boolean } | null = null;
  private lastUpdateTime = 0;
  private updateThrottle = 30; // Update at most every 30ms (much more responsive)
  private buyQuantity: 1 | 5 | 10 | 'max' = 1; // Buy quantity selector
  private isDesktopCollapsed = false; // Desktop shop collapsed state

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
      shopPanel.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      shopPanel.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      });
      shopPanel.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
    }

    this.setupTabs();
    this.setupBuyQuantityButtons();
    this.setupDesktopToggle();
    this.render();
    this.store.subscribe(() => {
      this.scheduleRender();
    });
  }

  setSoundManager(soundManager: { playPurchase: () => void }): void {
    this.soundManager = soundManager;
  }

  setMissionSystem(missionSystem: { trackUpgrade: () => void }): void {
    this.missionSystem = missionSystem;
  }

  setAscensionSystem(ascensionSystem: { isAutoBuyUnlocked: (state: GameState) => boolean }): void {
    this.ascensionSystem = ascensionSystem;
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

  private setupBuyQuantityButtons(): void {
    const shopPanel = document.getElementById('shop-panel');
    const shopTabs = document.getElementById('shop-tabs');
    if (!shopPanel || !shopTabs) return;

    // Create buy quantity container - place it before tabs
    const quantityContainer = document.createElement('div');
    quantityContainer.className = 'buy-quantity-selector';

    const label = document.createElement('span');
    label.textContent = t('shop.buyQuantity');
    quantityContainer.appendChild(label);

    const quantities: (1 | 5 | 10 | 'max')[] = [1, 5, 10, 'max'];
    quantities.forEach((qty) => {
      const btn = document.createElement('button');
      btn.textContent = qty === 'max' ? 'MAX' : `x${qty}`;
      btn.className = 'buy-quantity-btn';
      if (this.buyQuantity === qty) {
        btn.style.background = 'rgba(0, 255, 136, 0.4)';
        btn.style.borderColor = '#00ff88';
        btn.style.color = '#00ff88';
        btn.style.textShadow = '0 0 3px #00ff88, 0 1px 0 #000, 0 -1px 0 #000';
        btn.style.boxShadow = '0 0 12px rgba(0, 255, 136, 0.6)';
      }
      btn.addEventListener('click', () => {
        this.buyQuantity = qty;
        // Update all button styles
        quantities.forEach((q, i) => {
          const button = quantityContainer.children[i + 1] as HTMLElement;
          if (button) {
            if (q === qty) {
              button.style.background = 'rgba(0, 255, 136, 0.4)';
              button.style.borderColor = '#00ff88';
              button.style.color = '#00ff88';
              button.style.textShadow = '0 0 3px #00ff88, 0 1px 0 #000, 0 -1px 0 #000';
              button.style.boxShadow = '0 0 12px rgba(0, 255, 136, 0.6)';
            } else {
              button.style.background = 'rgba(0, 255, 136, 0.1)';
              button.style.borderColor = 'rgba(0, 255, 136, 0.5)';
              button.style.color = '#00ff88';
              button.style.textShadow = '0 0 3px #00ff88, 0 1px 0 #000, 0 -1px 0 #000';
              button.style.boxShadow = 'none';
            }
          }
        });
        this.render();
      });
      quantityContainer.appendChild(btn);
    });

    // Insert before shop tabs
    shopTabs.parentNode?.insertBefore(quantityContainer, shopTabs);

    // Add auto-buy toggle button
    this.setupAutoBuyToggle(quantityContainer);
  }

  private setupAutoBuyToggle(container: HTMLElement): void {
    const autoBuyBtn = document.createElement('button');
    autoBuyBtn.className = 'buy-quantity-btn auto-buy-toggle';
    autoBuyBtn.innerHTML = '🤖 Auto-Buy';
    autoBuyBtn.title = 'Automatically purchase affordable upgrades every 0.5 seconds when enabled';
    autoBuyBtn.setAttribute('aria-label', 'Toggle Auto-Buy');
    autoBuyBtn.setAttribute('aria-keyshortcuts', 'A');
    autoBuyBtn.setAttribute('role', 'switch');
    autoBuyBtn.setAttribute('aria-checked', 'false');

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'auto-buy-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      background: rgba(0, 0, 0, 0.95);
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 136, 0.5);
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      text-shadow: 0 1px 0 #000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    `;
    tooltip.textContent = 'Automatically purchase affordable upgrades every 0.5 seconds';
    container.appendChild(tooltip);

    // Create info text for locked state
    const infoText = document.createElement('div');
    infoText.className = 'auto-buy-info-text';
    infoText.style.cssText = `
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 4px;
      text-align: center;
      font-family: 'Courier New', monospace;
      display: none;
    `;
    infoText.textContent = 'Purchase in Ascension Store (50 PP)';
    container.appendChild(infoText);

    const updateAutoBuyButton = () => {
      const state = this.store.getState();
      const isUnlocked = this.ascensionSystem?.isAutoBuyUnlocked(state) ?? false;
      const isEnabled = state.autoBuyEnabled ?? false;
      
      if (!isUnlocked) {
        // Disabled - not unlocked
        autoBuyBtn.disabled = true;
        autoBuyBtn.style.background = 'rgba(100, 100, 100, 0.3)';
        autoBuyBtn.style.borderColor = 'rgba(100, 100, 100, 0.5)';
        autoBuyBtn.style.boxShadow = 'none';
        autoBuyBtn.style.cursor = 'not-allowed';
        autoBuyBtn.style.opacity = '0.6';
        autoBuyBtn.setAttribute('aria-checked', 'false');
        tooltip.textContent = 'Auto-Buy: LOCKED - Purchase in Ascension Store for 50 Ascension Points';
        infoText.style.display = 'block';
      } else {
        // Unlocked - can toggle
        autoBuyBtn.disabled = false;
        autoBuyBtn.style.cursor = 'pointer';
        autoBuyBtn.style.opacity = '1';
        autoBuyBtn.setAttribute('aria-checked', isEnabled.toString());
        infoText.style.display = 'none';
        if (isEnabled) {
          autoBuyBtn.style.background = 'rgba(0, 255, 136, 0.4)';
          autoBuyBtn.style.borderColor = '#00ff88';
          autoBuyBtn.style.boxShadow = '0 0 12px rgba(0, 255, 136, 0.6)';
          tooltip.textContent = 'Auto-Buy: ON - Automatically purchases affordable upgrades every 0.5 seconds';
        } else {
          autoBuyBtn.style.background = 'rgba(0, 255, 136, 0.1)';
          autoBuyBtn.style.borderColor = 'rgba(0, 255, 136, 0.5)';
          autoBuyBtn.style.boxShadow = 'none';
          tooltip.textContent = 'Auto-Buy: OFF - Click to enable automatic purchase of affordable upgrades';
        }
      }
    };

    // Show tooltip on hover
    autoBuyBtn.addEventListener('mouseenter', () => {
      tooltip.style.opacity = '1';
    });

    autoBuyBtn.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    autoBuyBtn.addEventListener('click', () => {
      const state = this.store.getState();
      const isUnlocked = this.ascensionSystem?.isAutoBuyUnlocked(state) ?? false;
      if (!isUnlocked) {
        // Show info about needing to unlock
        return;
      }
      state.autoBuyEnabled = !(state.autoBuyEnabled ?? false);
      this.store.setState(state);
      updateAutoBuyButton();
    });

    container.appendChild(autoBuyBtn);
    updateAutoBuyButton();

    // Update button state when store changes
    this.store.subscribe(() => {
      updateAutoBuyButton();
    });
  }

  private setupDesktopToggle(): void {
    const toggleButton = document.getElementById('desktop-shop-toggle');
    const shopPanel = document.getElementById('shop-panel');

    if (!toggleButton || !shopPanel) return;

    // Load saved state from localStorage
    const savedState = localStorage.getItem('desktop-shop-collapsed');
    if (savedState === 'true') {
      this.isDesktopCollapsed = true;
      shopPanel.classList.add('desktop-collapsed');
      // Trigger resize after a short delay to ensure proper canvas sizing
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }

    // Toggle button click handler
    toggleButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isDesktopCollapsed = !this.isDesktopCollapsed;

      if (this.isDesktopCollapsed) {
        shopPanel.classList.add('desktop-collapsed');
      } else {
        shopPanel.classList.remove('desktop-collapsed');
      }

      // Save state to localStorage
      localStorage.setItem(
        'desktop-shop-collapsed',
        String(this.isDesktopCollapsed),
      );

      // Trigger window resize event after transition (300ms) to ensure canvas resizes properly
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 350);
    });
  }

  public forceRefresh(): void {
    // Force immediate render (for power-up changes) - bypass throttling
    if (this.renderTimeout !== null) {
      cancelAnimationFrame(this.renderTimeout);
      this.renderTimeout = null;
    }
    this.lastUpdateTime = 0; // Reset throttle
    
    // Use requestAnimationFrame to ensure it happens in the next frame
    // but bypass all throttling checks
    requestAnimationFrame(() => {
      this.render(); // Call render directly, bypassing scheduleRender throttling
    });
  }

  public reset(): void {
    // Reset shop UI state
    this.currentTab = 'available';
    this.buyQuantity = 1;
    this.lastAffordability.clear();
    this.buttonCache.clear();
    
    // Reset tab UI
    const availableTab = document.getElementById('tab-available');
    const ownedTab = document.getElementById('tab-owned');
    if (availableTab) {
      availableTab.classList.add('active');
    }
    if (ownedTab) {
      ownedTab.classList.remove('active');
    }
    
    // Reset buy quantity buttons
    const quantityContainer = document.querySelector('.buy-quantity-selector');
    if (quantityContainer) {
      const buttons = quantityContainer.querySelectorAll('.buy-quantity-btn');
      buttons.forEach((btn, index) => {
        const button = btn as HTMLElement;
        if (index === 0) { // First button is x1
          button.style.background = 'rgba(0, 255, 136, 0.4)';
          button.style.borderColor = '#00ff88';
          button.style.color = '#00ff88';
          button.style.textShadow = '0 0 3px #00ff88, 0 1px 0 #000, 0 -1px 0 #000';
          button.style.boxShadow = '0 0 12px rgba(0, 255, 136, 0.6)';
        } else {
          button.style.background = 'rgba(0, 255, 136, 0.1)';
          button.style.borderColor = 'rgba(0, 255, 136, 0.5)';
          button.style.color = '#00ff88';
          button.style.textShadow = '0 0 3px #00ff88, 0 1px 0 #000, 0 -1px 0 #000';
          button.style.boxShadow = 'none';
        }
      });
    }
    
    // Force a refresh to show the reset state
    this.forceRefresh();
  }

  private scheduleRender(): void {
    // Don't schedule renders while processing a purchase
    if (this.isProcessingPurchase) return;

    const state = this.store.getState();
    const currentPoints = state.points;

    // Check for new discoveries (this might trigger a full re-render)
    const discoveredSomethingNew = this.checkForDiscoveries(state);

    // If we discovered something new, do a full render
    if (discoveredSomethingNew) {
      this.render();
      return;
    }

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

  private checkForDiscoveries(state: GameState): boolean {
    // Initialize discoveredUpgrades if not present
    if (!state.discoveredUpgrades) {
      state.discoveredUpgrades = { ship: true };
    }

    let discoveredNew = false;
    const upgrades = this.upgradeSystem.getUpgrades();
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();

    // Check main upgrades
    for (const upgrade of upgrades) {
      if (upgrade.id === 'misc') continue;

      // Skip if already discovered or already purchased
      if (state.discoveredUpgrades[upgrade.id] || upgrade.getLevel(state) > 0) {
        if (upgrade.getLevel(state) > 0) {
          state.discoveredUpgrades[upgrade.id] = true;
        }
        continue;
      }

      // Check if player has 75% of the cost
      const cost = upgrade.getCost(upgrade.getLevel(state));
      if (state.points >= cost * 0.75) {
        state.discoveredUpgrades[upgrade.id] = true;
        discoveredNew = true;
      }
    }

    // Check subupgrades
    for (const subUpgrade of allSubUpgrades) {
      const subKey = `sub_${subUpgrade.id}`;

      // Skip if already owned or already discovered
      if (subUpgrade.owned || state.discoveredUpgrades[subKey]) {
        if (subUpgrade.owned) {
          state.discoveredUpgrades[subKey] = true;
        }
        continue;
      }

      // Check if base requirements are met
      if (!subUpgrade.requires(state)) {
        continue;
      }

      // Check if player has 75% of the cost (with discounts applied)
      const discountedCost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
      if (state.points >= discountedCost * 0.75) {
        state.discoveredUpgrades[subKey] = true;
        discoveredNew = true;
      }
    }

    // If we discovered something new, save the state
    if (discoveredNew) {
      this.store.setState(state);
    }

    return discoveredNew;
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
      const cost = this.upgradeSystem.getSubUpgradeCost(upgrade);
      if (points >= cost * 0.9 && points < cost) {
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
      const cost = this.upgradeSystem.getSubUpgradeCost(upgrade);
      const canAfford = !upgrade.owned && state.points >= cost;
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
        const card = document.querySelector(
          `[data-upgrade-id="${subUpgrade.id}"]`,
        ) as HTMLElement;
        if (card && !subUpgrade.owned) {
          const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
          const canAfford = state.points >= cost;

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

  private renderAvailableTab(state: GameState): void {
    const upgrades = this.upgradeSystem.getUpgrades();
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();

    // Discovery check is now done in scheduleRender for automatic updates
    // Just ensure it's initialized here
    if (!state.discoveredUpgrades) {
      state.discoveredUpgrades = { ship: true };
    }

    // Clear button cache for fresh render
    this.buttonCache.clear();

    // Render special upgrades box at the top
    // Filter: must meet requirements AND be discovered (75% of cost OR already owned)
    const visibleSubUpgrades = allSubUpgrades.filter((sub) => {
      const subKey = `sub_${sub.id}`;
      return (
        !sub.owned &&
        sub.requires(state) &&
        (Boolean(state.discoveredUpgrades?.[subKey]) || sub.owned)
      );
    });

    if (visibleSubUpgrades.length > 0) {
      const specialBox = document.createElement('div');
      specialBox.className = 'special-upgrades-box';

      // Create inner wrapper for the animated effect
      const effectWrapper = document.createElement('div');
      effectWrapper.className = 'special-upgrades-effect-wrapper';

      const title = document.createElement('h3');
      title.textContent = t('shop.specialUpgrades');
      specialBox.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'special-upgrades-grid';

      for (const subUpgrade of visibleSubUpgrades) {
        const subItem = this.createSubUpgradeCard(subUpgrade, state);
        grid.appendChild(subItem);
      }

      specialBox.appendChild(effectWrapper);
      specialBox.appendChild(grid);
      this.container.appendChild(specialBox);
    }

    // Render main upgrades (exclude R&D category and undiscovered upgrades)
    for (const upgrade of upgrades) {
      if (upgrade.id === 'misc') continue;

      // Only show if discovered OR already purchased
      if (
        !state.discoveredUpgrades?.[upgrade.id] &&
        upgrade.getLevel(state) === 0
      ) {
        continue;
      }

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

      // Calculate cost for the exact requested quantity
      const requestedQty = this.buyQuantity === 'max' ? 0 : this.buyQuantity;
      
      let displayCost = 0;
      let displayQuantity = 1;
      let canAffordExact = false;
      
      if (this.buyQuantity === 'max') {
        // For MAX: calculate affordable quantity and cost
        const { totalCost, quantity } = this.calculateBulkCost(upgrade, state);
        displayCost = totalCost;
        displayQuantity = quantity;
        canAffordExact = state.points >= totalCost && quantity > 0;
      } else {
        // For specific quantity: calculate cost for EXACT requested quantity
        const currentLevel = upgrade.getLevel(state);
        let tempLevel = currentLevel;
        const upgradeId = upgrade.id;
        const affectsSelfCost = upgradeId === 'cosmicKnowledge' || upgradeId === 'fleetCommand';
        
        // Create temporary state for self-affecting upgrades
        const tempState = { ...state };
        
        for (let i = 0; i < requestedQty; i++) {
          const cost = upgrade.getCost(tempLevel);
          displayCost += cost;
          tempLevel++;
          
          // Update temp state for self-affecting upgrades
          if (affectsSelfCost) {
            if (upgradeId === 'cosmicKnowledge') {
              tempState.cosmicKnowledgeLevel = tempLevel;
            } else if (upgradeId === 'fleetCommand') {
              tempState.fleetCommandLevel = tempLevel;
            }
          }
        }
        
        displayQuantity = requestedQty;
        canAffordExact = state.points >= displayCost;
      }

      // Show cost with requested quantity (matching button text)
      const costText =
        displayQuantity > 1
          ? `${t('common.cost')}: ${this.formatNumber(displayCost)} (x${displayQuantity})`
          : `${t('common.cost')}: ${this.formatNumber(displayCost)}`;
      cost.textContent = costText;

      // Show requested quantity in button text
      const buttonText = this.buyQuantity === 'max' 
        ? (displayQuantity > 1 ? `${t('common.buy')} x${displayQuantity}` : t('common.buy'))
        : (displayQuantity > 1 ? `${t('common.buy')} x${displayQuantity}` : t('common.buy'));
      
      const button = new Button(
        buttonText,
        () => {
          // Buy exactly the requested quantity (or max affordable for MAX mode)
          const qtyToBuy = this.buyQuantity === 'max' 
            ? displayQuantity 
            : displayQuantity;
          this.buyUpgrade(upgrade, qtyToBuy);
        },
      );
      button.setEnabled(canAffordExact);

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

  private renderOwnedTab(state: GameState): void {
    const allSubUpgrades = this.upgradeSystem.getSubUpgrades();
    const ownedUpgrades = allSubUpgrades.filter((sub) => sub.owned);

    if (ownedUpgrades.length === 0) {
      const message = document.createElement('div');
      message.style.padding = '40px';
      message.style.textAlign = 'center';
      message.style.color = '#666';
      message.textContent = t('shop.noOwned');
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

  private createSubUpgradeCard(
    subUpgrade: SubUpgrade,
    state: GameState,
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = `sub-upgrade ${subUpgrade.owned ? 'owned' : ''}`;
    card.setAttribute('data-upgrade-id', subUpgrade.id);

    const icon = document.createElement('div');
    icon.className = 'sub-upgrade-icon';
    icon.textContent = this.getUpgradeEmoji(subUpgrade.id);
    card.appendChild(icon);

    const name = document.createElement('div');
    name.className = 'sub-upgrade-name';
    name.textContent = t(`upgrades.special.${subUpgrade.id}.name`);
    card.appendChild(name);

    const cost = document.createElement('div');
    cost.className = 'sub-upgrade-cost';
    const discountedCost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
    cost.textContent = subUpgrade.owned
      ? `✓ ${t('common.owned')}`
      : this.formatNumber(discountedCost);
    card.appendChild(cost);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'sub-upgrade-tooltip';
    const upgradeName = t(`upgrades.special.${subUpgrade.id}.name`);
    const upgradeDescription = t(`upgrades.special.${subUpgrade.id}.description`);
    const upgradeFlavor = t(`upgrades.special.${subUpgrade.id}.flavor`);
    tooltip.innerHTML = `<strong>${upgradeName}</strong><br>${upgradeDescription}<br><em style="color: #888; font-size: 10px;">${upgradeFlavor}</em>`;
    card.appendChild(tooltip);

    if (!subUpgrade.owned) {
      // Set initial affordability state
      const canAfford = state.points >= discountedCost;
      card.style.opacity = canAfford ? '1' : '0.7';
      card.style.cursor = canAfford ? 'pointer' : 'not-allowed';

      card.addEventListener('click', () => {
        const currentState = this.store.getState();
        const currentCost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        if (currentState.points >= currentCost) {
          this.buySubUpgrade(subUpgrade);
        }
      });
    }

    return card;
  }

  private getUpgradeEmoji(upgradeId: string): string {
    const emojiMap: Record<string, string> = {
      // Original
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
      // New V1.0 Upgrades
      coffee_machine: '☕',
      lucky_dice: '🎲',
      space_pizza: '🍕',
      rubber_duck: '🦆',
      motivational_posters: '📋',
      disco_ball: '🪩',
      lucky_horseshoe: '🍀',
      arcade_machine: '🕹️',
      chaos_emeralds: '💚',
      time_machine: '⏱️',
      philosophers_stone: '🗿',
      golden_goose: '🦢',
      infinity_gauntlet: '💍',
      alien_cookbook: '📖',
      nuclear_reactor: '☢️',
      cheat_codes: '🎮',
      dragon_egg: '🥚',
      universe_map: '🗺️',
      answer_to_everything: '4️⃣2️⃣',
      heart_of_galaxy: '❤️',
      meaning_of_life: '🔮',
      // Click-focused upgrades
      master_clicker: '👆',
      rapid_fire: '⚡',
      click_multiplier: '✨',
      super_clicker: '💪',
    };
    return emojiMap[upgradeId] || '⭐';
  }

  private calculateBulkCost(
    upgrade: UpgradeConfig,
    state: GameState,
  ): { totalCost: number; quantity: number } {
    const currentLevel = upgrade.getLevel(state);
    let totalCost = 0;
    let quantity = 0;

    // Create a temporary state copy for upgrades that affect their own costs
    const tempState = { ...state };
    const upgradeId = upgrade.id;
    const affectsSelfCost =
      upgradeId === 'cosmicKnowledge' || upgradeId === 'fleetCommand';

    if (this.buyQuantity === 'max') {
      // Calculate max affordable quantity
      let cost = 0;
      let tempLevel = currentLevel;
      let tempPoints = state.points;

      while (tempPoints >= (cost = upgrade.getCost(tempLevel))) {
        tempPoints -= cost;
        totalCost += cost;
        tempLevel++;
        quantity++;

        // Update temp state for self-affecting upgrades
        if (affectsSelfCost) {
          if (upgradeId === 'cosmicKnowledge') {
            tempState.cosmicKnowledgeLevel = tempLevel;
          } else if (upgradeId === 'fleetCommand') {
            tempState.fleetCommandLevel = tempLevel;
          }
        }

        // Safety limit to prevent infinite loops
        if (quantity >= 1000) break;
      }

      // If can't afford any, show cost of 1
      if (quantity === 0) {
        return { totalCost: upgrade.getCost(currentLevel), quantity: 1 };
      }
    } else {
      // Calculate cost for specific quantity (only what's affordable)
      const targetQuantity = this.buyQuantity;
      let tempPoints = state.points;
      let tempLevel = currentLevel;

      for (let i = 0; i < targetQuantity; i++) {
        const cost = upgrade.getCost(tempLevel);
        if (tempPoints >= cost) {
          tempPoints -= cost;
          totalCost += cost;
          tempLevel++;
          quantity++;

          // Update temp state for self-affecting upgrades
          if (affectsSelfCost) {
            if (upgradeId === 'cosmicKnowledge') {
              tempState.cosmicKnowledgeLevel = tempLevel;
            } else if (upgradeId === 'fleetCommand') {
              tempState.fleetCommandLevel = tempLevel;
            }
          }
        } else {
          break; // Can't afford more
        }
      }

      // If can't afford any, show cost of requested quantity anyway for display
      if (quantity === 0) {
        let displayLevel = currentLevel;
        for (let i = 0; i < targetQuantity; i++) {
          totalCost += upgrade.getCost(displayLevel);
          displayLevel++;
        }
        quantity = targetQuantity;
      }
    }

    return { totalCost, quantity };
  }

  private buyUpgrade(upgrade: UpgradeConfig, quantity: number = 1): void {
    // Prevent concurrent purchases
    if (this.isProcessingPurchase) return;
    this.isProcessingPurchase = true;

    const state = this.store.getState();
    const isMaxMode = this.buyQuantity === 'max';

    // Calculate actual cost for the quantity
    let totalCost = 0;
    let actualQuantity = 0;
    const currentLevel = upgrade.getLevel(state);
    const upgradeId = upgrade.id;
    const affectsSelfCost = upgradeId === 'cosmicKnowledge' || upgradeId === 'fleetCommand';
    
    // Create temporary state for self-affecting upgrades
    const tempState = { ...state };
    let tempLevel = currentLevel;

    for (let i = 0; i < quantity; i++) {
      const cost = upgrade.getCost(tempLevel);
      if (state.points >= totalCost + cost) {
        totalCost += cost;
        actualQuantity++;
        tempLevel++;
        
        // Update temp state for self-affecting upgrades
        if (affectsSelfCost) {
          if (upgradeId === 'cosmicKnowledge') {
            tempState.cosmicKnowledgeLevel = tempLevel;
          } else if (upgradeId === 'fleetCommand') {
            tempState.fleetCommandLevel = tempLevel;
          }
        }
      } else {
        // For non-MAX mode: must buy exact quantity, so stop if can't afford
        if (!isMaxMode) {
          break;
        }
        // For MAX mode: stop if can't afford more
        break;
      }
    }

    // For non-MAX mode: only buy if we can afford the exact quantity
    // For MAX mode: buy as many as affordable
    const canBuy = isMaxMode 
      ? (actualQuantity > 0 && state.points >= totalCost)
      : (actualQuantity === quantity && state.points >= totalCost);

    if (canBuy) {
      state.points -= totalCost;

      // Buy multiple times
      for (let i = 0; i < actualQuantity; i++) {
        upgrade.buy(state);
        this.store.incrementUpgrade();
        // Track for missions
        if (this.missionSystem) {
          this.missionSystem.trackUpgrade();
        }
      }

      this.store.setState(state);

      // Play purchase sound
      if (this.soundManager) {
        this.soundManager.playPurchase();
      }

      // Visual feedback: briefly highlight the purchased upgrade button
      const button = this.buttonCache.get(upgrade.id);
      if (button) {
        const originalTransition = button.style.transition;
        const originalTransform = button.style.transform;
        const originalBoxShadow = button.style.boxShadow;
        
        button.style.transition = 'all 0.3s ease';
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8), 0 4px 12px rgba(0, 255, 136, 0.5)';
        
        setTimeout(() => {
          button.style.transform = originalTransform;
          button.style.boxShadow = originalBoxShadow;
          setTimeout(() => {
            button.style.transition = originalTransition;
          }, 300);
        }, 300);
      }

      // Force immediate UI update
      this.lastAffordability.clear();
      this.render();
    }

    this.isProcessingPurchase = false;
  }

  private buySubUpgrade(upgrade: SubUpgrade): void {
    // Prevent concurrent purchases
    if (this.isProcessingPurchase) return;
    if (upgrade.owned) return;
    this.isProcessingPurchase = true;

    const state = this.store.getState();
    const discountedCost = this.upgradeSystem.getSubUpgradeCost(upgrade);
    if (state.points >= discountedCost) {
      state.points -= discountedCost;
      upgrade.buy(state);
      this.store.incrementSubUpgrade();
      // Track for missions
      if (this.missionSystem) {
        this.missionSystem.trackUpgrade();
      }
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

  /**
   * Auto-buy affordable upgrades
   * Called periodically when auto-buy is enabled
   */
  public checkAndBuyAffordableUpgrades(): void {
    const state = this.store.getState();
    if (!(state.autoBuyEnabled ?? false)) return;
    if (this.isProcessingPurchase) return; // Prevent concurrent purchases

    const upgrades = this.upgradeSystem.getUpgrades();
    let purchasedAny = false;

    // Check main upgrades (skip misc category)
    for (const upgrade of upgrades) {
      if (upgrade.id === 'misc') continue;
      
      // Only buy discovered upgrades
      if (!state.discoveredUpgrades?.[upgrade.id] && upgrade.getLevel(state) === 0) {
        continue;
      }

      // Check if we can afford at least one
      if (upgrade.canBuy(state)) {
        // Buy one at a time for auto-buy (safer and more predictable)
        this.buyUpgrade(upgrade, 1);
        purchasedAny = true;
        break; // Only buy one upgrade per check to avoid buying too many at once
      }
    }

    // If no main upgrades were purchased, check sub-upgrades
    if (!purchasedAny) {
      const subUpgrades = this.upgradeSystem.getSubUpgrades();
      for (const subUpgrade of subUpgrades) {
        if (!subUpgrade.isVisible(state) || subUpgrade.owned) continue;
        
        const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        if (state.points >= cost) {
          this.buySubUpgrade(subUpgrade);
          break; // Only buy one sub-upgrade per check
        }
      }
    }
  }

  // Deprecated - use NumberFormatter instead
  private formatNumber(num: number): string {
    return NumberFormatter.format(num);
  }
}
