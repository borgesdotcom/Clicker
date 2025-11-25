/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Store } from '../core/Store';
import type { UpgradeSystem } from '../systems/UpgradeSystem';
import type { GameState, UpgradeConfig, SubUpgrade } from '../types';
import { Button } from './Button';
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';
import { images } from '../assets/images';
import { PixelArtRenderer } from '../utils/PixelArtRenderer';
import { getMainUpgradeSprite } from '../render/MainUpgradeSprites';
import { UI_THROTTLE } from '../config/constants';

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
  private ascensionSystem: {
    isAutoBuyUnlocked: (state: GameState) => boolean;
  } | null = null;
  private lastUpdateTime = 0;
  private updateThrottle = UI_THROTTLE.SHOP_UPDATE_INTERVAL; // Update at most every 30ms (much more responsive)
  private buyQuantity: 1 | 5 | 10 | 'max' = 1; // Buy quantity selector
  private isDesktopCollapsed = false; // Desktop shop collapsed state
  private updateAutoBuyButtonCallback: (() => void) | null = null;
  private activeTooltips: Set<HTMLElement> = new Set(); // Track active tooltips for cleanup
  private useOldUI = false; // Use old/simple shop UI

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
    if (!this.useOldUI) {
      this.setupBuyQuantityButtons();
    }
    this.setupDesktopToggle();
    this.render();

    // Optimize: Only update shop when points change significantly
    let lastPoints = 0;
    this.store.subscribe(() => {
      const state = this.store.getState();
      const currentPoints = state.points;

      // Only schedule render if points changed by >1% or other state changes
      // This prevents excessive shop updates on every tiny point gain
      const pointsDiff = Math.abs(currentPoints - lastPoints);
      const threshold = lastPoints === 0 ? 0 : lastPoints * 0.01;

      if (pointsDiff > threshold) {
        lastPoints = currentPoints;
        this.scheduleRender();
      }
    });
  }

  setSoundManager(soundManager: { playPurchase: () => void }): void {
    this.soundManager = soundManager;
  }

  setMissionSystem(missionSystem: { trackUpgrade: () => void }): void {
    this.missionSystem = missionSystem;
  }

  setAscensionSystem(ascensionSystem: {
    isAutoBuyUnlocked: (state: GameState) => boolean;
  }): void {
    this.ascensionSystem = ascensionSystem;
    // Trigger button state update when ascension system is set
    // This ensures the button is properly enabled if the upgrade is unlocked
    if (this.updateAutoBuyButtonCallback) {
      this.updateAutoBuyButtonCallback();
    }
  }

  setUseOldUI(useOldUI: boolean): void {
    this.useOldUI = useOldUI;
    
    // Add/remove CSS class to shop panel for old UI styling
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      if (useOldUI) {
        shopPanel.classList.add('old-shop-ui');
      } else {
        shopPanel.classList.remove('old-shop-ui');
      }
    }
    
    // Show/hide buy quantity selector
    const quantitySelector = document.querySelector('.buy-quantity-selector') as HTMLElement;
    if (quantitySelector) {
      quantitySelector.style.display = useOldUI ? 'none' : 'flex';
    }
    
    // Reset buy quantity to 1 when switching to old UI
    if (useOldUI) {
      this.buyQuantity = 1;
    }
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
    // Don't setup buy quantity buttons if old UI is enabled
    if (this.useOldUI) return;
    
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
      btn.textContent = qty === 'max' ? t('shop.max') : `x${qty}`;
      btn.className = 'buy-quantity-btn';
      if (this.buyQuantity === qty) {
        btn.classList.add('active');
        btn.style.background = 'rgba(102, 204, 255, 0.2)';
        btn.style.borderColor = 'rgba(102, 204, 255, 0.5)';
        btn.style.borderImage = 'none';
        btn.style.color = '#ffffff';
        btn.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
        btn.style.boxShadow = '0 0 8px rgba(102, 204, 255, 0.3)';
      }
      btn.addEventListener('click', () => {
        this.buyQuantity = qty;
        // Update all button styles
        quantities.forEach((q, i) => {
          const button = quantityContainer.children[i + 1] as HTMLElement;
          if (button) {
            if (q === qty) {
              button.classList.add('active');
              button.style.background = 'rgba(102, 204, 255, 0.2)';
              button.style.borderColor = 'rgba(102, 204, 255, 0.5)';
              button.style.borderImage = 'none';
              button.style.color = '#ffffff';
              button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
              button.style.boxShadow = '0 0 8px rgba(102, 204, 255, 0.3)';
            } else {
              button.classList.remove('active');
              button.style.background = 'rgba(0, 0, 0, 0.3)';
              button.style.borderColor = 'rgba(102, 204, 255, 0.3)';
              button.style.borderImage = 'none';
              button.style.color = '#ffffff';
              button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
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
    autoBuyBtn.textContent = t('shop.autoBuy');
    autoBuyBtn.title = t('shop.autoBuyTitle');
    autoBuyBtn.setAttribute('aria-label', t('shop.toggleAutoBuy'));
    autoBuyBtn.setAttribute('aria-keyshortcuts', 'A');
    autoBuyBtn.setAttribute('role', 'switch');
    autoBuyBtn.setAttribute('aria-checked', 'false');

    // Create tooltip element - append to body to avoid overflow clipping
    const tooltip = document.createElement('div');
    tooltip.className = 'auto-buy-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      color: #fffae5;
      padding: 8px 12px;
      border: 2px solid rgba(255, 255, 255, 0.8);
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 100000;
      font-family: 'Courier New', monospace;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 1), -1px -1px 0 rgba(0, 0, 0, 1);
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    tooltip.textContent = t('shop.autoBuyTooltip');
    document.body.appendChild(tooltip);

    // Update tooltip position on hover
    autoBuyBtn.addEventListener('mouseenter', () => {
      const rect = autoBuyBtn.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.opacity = '1';
    });

    autoBuyBtn.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

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
    infoText.textContent = t('shop.autoBuyLockedInfo');
    container.appendChild(infoText);

    const updateAutoBuyButton = () => {
      const state = this.store.getState();
      // Check if upgrade is unlocked - if ascensionSystem is not set yet, default to false
      // But also check the state directly as a fallback
      const autoBuyLevel = state.prestigeUpgrades?.auto_buy_unlock ?? 0;
      const isUnlocked =
        this.ascensionSystem?.isAutoBuyUnlocked(state) ?? autoBuyLevel >= 1;
      const isEnabled = state.autoBuyEnabled ?? false;

      if (!isUnlocked) {
        // Disabled - not unlocked
        autoBuyBtn.disabled = true;
        autoBuyBtn.classList.remove('auto-buy-enabled', 'auto-buy-disabled');
        autoBuyBtn.classList.add('auto-buy-locked');
        autoBuyBtn.style.background = 'rgba(0, 0, 0, 0.5)';
        autoBuyBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        autoBuyBtn.style.boxShadow =
          'inset 0 0 0 1px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)';
        autoBuyBtn.style.cursor = 'not-allowed';
        autoBuyBtn.style.opacity = '0.6';
        autoBuyBtn.setAttribute('aria-checked', 'false');
        tooltip.textContent = t('shop.autoBuyLockedTooltip');
        infoText.style.display = 'block';
      } else {
        // Unlocked - can toggle (button should be ENABLED/ACTIVE, not disabled)
        autoBuyBtn.disabled = false;
        autoBuyBtn.classList.remove('auto-buy-locked');
        autoBuyBtn.style.cursor = 'pointer';
        autoBuyBtn.style.opacity = '1';
        autoBuyBtn.setAttribute('aria-checked', isEnabled.toString());
        infoText.style.display = 'none';
        if (isEnabled) {
          autoBuyBtn.classList.add('auto-buy-enabled');
          autoBuyBtn.classList.remove('auto-buy-disabled');
          tooltip.textContent = t('shop.autoBuyOnTooltip');
        } else {
          autoBuyBtn.classList.add('auto-buy-disabled');
          autoBuyBtn.classList.remove('auto-buy-enabled');
          tooltip.textContent = t('shop.autoBuyOffTooltip');
        }
      }
    };

    // Store the callback so it can be called when ascensionSystem is set
    this.updateAutoBuyButtonCallback = updateAutoBuyButton;

    autoBuyBtn.addEventListener('click', () => {
      const state = this.store.getState();
      // Use same fallback logic as updateAutoBuyButton
      const autoBuyLevel = state.prestigeUpgrades?.auto_buy_unlock ?? 0;
      const isUnlocked =
        this.ascensionSystem?.isAutoBuyUnlocked(state) ?? autoBuyLevel >= 1;
      if (!isUnlocked) {
        // Show info about needing to unlock
        return;
      }
      state.autoBuyEnabled = !(state.autoBuyEnabled ?? false);
      this.store.setState(state);
      updateAutoBuyButton();
    });

    container.appendChild(autoBuyBtn);

    // Initial update
    updateAutoBuyButton();

    // Also update after a short delay to catch any initialization timing issues
    setTimeout(() => {
      updateAutoBuyButton();
    }, 100);

    // Update button state when store changes
    this.store.subscribe(() => {
      updateAutoBuyButton();
    });
  }

  private updateToggleButtonImage(button: HTMLElement): void {
    const img = button.querySelector('img');
    if (img) {
      img.src = this.isDesktopCollapsed ? images.menu.right : images.menu.left;
      img.alt = this.isDesktopCollapsed ? t('shop.openShop') : t('shop.closeShop');
    }
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
      this.updateToggleButtonImage(toggleButton);
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

      // Update button image
      this.updateToggleButtonImage(toggleButton);

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

    // Initialize button image
    this.updateToggleButtonImage(toggleButton);
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
        if (index === 0) {
          // First button is x1
          button.classList.add('active');
          button.style.background = 'rgba(102, 204, 255, 0.2)';
          button.style.borderColor = 'rgba(102, 204, 255, 0.5)';
          button.style.borderImage = 'none';
          button.style.color = '#ffffff';
          button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
          button.style.boxShadow = '0 0 8px rgba(102, 204, 255, 0.3)';
        } else {
          button.classList.remove('active');
          button.style.background = 'rgba(0, 0, 0, 0.3)';
          button.style.borderColor = 'rgba(102, 204, 255, 0.3)';
          button.style.borderImage = 'none';
          button.style.color = '#ffffff';
          button.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
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
      // Always update button states to ensure they reflect current affordability
      // This is especially important for quantity modes (x5, x10, MAX) where
      // affordability depends on bulk costs, not just single purchase costs
      this.updateButtonStates();
      this.renderTimeout = null;
    });
  }

  private checkForDiscoveries(state: GameState): boolean {
    // Initialize discoveredUpgrades if not present
    if (!state.discoveredUpgrades) {
      state.discoveredUpgrades = { ship: true };
    }

    // Early exit: If player has very few points, skip discovery checks
    // This prevents expensive looping when player is just starting or has spent everything
    if (state.points < 100) {
      return false;
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

      // Check if upgrade is visible (level/stat requirements)
      if (!subUpgrade.isVisible(state)) {
        continue;
      }

      // Check if player has 40% of the cost (with discounts applied)
      const discountedCost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
      if (state.points >= discountedCost * 0.4) {
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

  private calculateBulkAffordability(
    upgrade: UpgradeConfig,
    state: GameState,
  ): boolean {
    // Calculate if player can afford the requested quantity based on buyQuantity setting
    // This MUST match the exact logic in renderAvailableTab (lines 736-760) to ensure consistency
    if (this.buyQuantity === 'max') {
      // For MAX: check if player can afford at least 1 upgrade
      // Don't rely on calculateBulkCost because it returns quantity: 1 even when unaffordable
      const currentLevel = upgrade.getLevel(state);
      const firstUpgradeCost = upgrade.getCost(currentLevel);
      if (state.points < firstUpgradeCost) {
        return false; // Can't afford even one
      }
      // Check if player can actually afford at least one (use same logic as calculateBulkCost)
      const { quantity, totalCost } = this.calculateBulkCost(upgrade, state);
      // Only return true if we can afford the calculated total cost AND quantity is actually > 0
      return quantity > 0 && state.points >= totalCost;
    } else {
      // For specific quantity (x5, x10): calculate cost for EXACT requested quantity
      // This matches the logic in renderAvailableTab exactly (lines 743-760)
      const currentLevel = upgrade.getLevel(state);
      const requestedQty = this.buyQuantity;
      const upgradeId = upgrade.id;
      const affectsSelfCost = upgradeId === 'cosmicKnowledge';

      // Create temporary state for self-affecting upgrades (same as renderAvailableTab)
      const tempState = { ...state };
      let tempLevel = currentLevel;
      let totalCost = 0;

      // Calculate cost for EXACT requested quantity (matches renderAvailableTab logic exactly)
      for (let i = 0; i < requestedQty; i++) {
        const cost = upgrade.getCost(tempLevel);
        totalCost += cost;
        tempLevel++;

        // Update temp state for self-affecting upgrades (same as renderAvailableTab)
        if (affectsSelfCost) {
          if (upgradeId === 'cosmicKnowledge') {
            tempState.cosmicKnowledgeLevel = tempLevel;
          }
        }
      }

      // Check if player can afford the exact requested quantity (matches renderAvailableTab)
      return state.points >= totalCost;
    }
  }

  private updateButtonStates(): void {
    const state = this.store.getState();

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      // Update main upgrade buttons - must account for buyQuantity setting
      const upgrades = this.upgradeSystem.getUpgrades();
      for (const upgrade of upgrades) {
        const button = this.buttonCache.get(upgrade.id);
        if (button) {
          // Calculate affordability based on current buyQuantity setting
          const canAfford = this.calculateBulkAffordability(upgrade, state);

          // Always update button state to ensure it reflects current affordability
          button.disabled = !canAfford;

          // Use CSS classes instead of inline styles (faster)
          if (canAfford) {
            button.classList.remove('disabled');
          } else {
            button.classList.add('disabled');
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

    // Clean up all active tooltips before re-rendering
    this.cleanupTooltips();

    this.container.innerHTML = '';
    const state = this.store.getState();
    this.upgradeSystem.updateSubUpgradesFromState(state);

    // Always check for discoveries before rendering to ensure visibility is correct
    this.checkForDiscoveries(state);

    if (this.currentTab === 'available') {
      this.renderAvailableTab(state);
    } else {
      this.renderOwnedTab(state);
    }

    this.isRendering = false;
  }

  private cleanupTooltips(): void {
    // Remove all active tooltips from DOM
    this.activeTooltips.forEach((tooltip) => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    });
    this.activeTooltips.clear();
  }

  private setBuyButtonContent(
    buttonElement: HTMLButtonElement,
    _displayQuantity: number,
  ): void {
    // Clear existing content
    buttonElement.innerHTML = '';

    // Add image
    const img = document.createElement('img');
    img.src = images.menu.buy;
    img.alt = t('shop.buy');
    buttonElement.appendChild(img);

    // Don't show quantity text for Max button to prevent container size changes
    // Quantity text removed per user request

    // Add hover text "Buy"
    const hoverText = document.createElement('span');
    hoverText.className = 'buy-hover-text';
    hoverText.textContent = t('shop.buy');
    buttonElement.appendChild(hoverText);
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

    // Don't render special upgrades box in old UI
    if (!this.useOldUI) {
      // Render special upgrades box at the top
      // Always render the container to prevent layout shifts when special upgrades appear/disappear
      // Filter: must meet requirements, be visible, AND be discovered (40% of cost OR already owned)
      // Once discovered, upgrades stay visible even if player drops below 40% cost
      const visibleSubUpgrades = allSubUpgrades
      .filter((sub) => {
        const subKey = `sub_${sub.id}`;

        // Must not be owned
        if (sub.owned) return false;

        // Must meet requirements
        if (!sub.requires(state)) return false;

        // Must be visible
        if (!sub.isVisible(state)) return false;

        // Must be discovered (once discovered, it stays visible)
        return Boolean(state.discoveredUpgrades?.[subKey]);
      })
      .sort((a, b) => a.cost - b.cost);

    // Always render the special upgrades box container - always visible with fixed size
    const specialBox = document.createElement('div');
    specialBox.className = 'special-upgrades-box';

    // Always show the title
    const title = document.createElement('h3');
    // Add star emoji before the text
    const starEmoji = document.createElement('span');
    starEmoji.style.fontSize = '16px';
    title.appendChild(starEmoji);
    const titleText = document.createElement('span');
    titleText.textContent = t('shop.specialUpgrades');
    title.appendChild(titleText);
    specialBox.appendChild(title);

    // Create scrollable grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'special-upgrades-grid-container';

    const grid = document.createElement('div');
    grid.className = 'special-upgrades-grid';

    if (visibleSubUpgrades.length > 0) {
      // Create inner wrapper for the animated effect
      const effectWrapper = document.createElement('div');
      effectWrapper.className = 'special-upgrades-effect-wrapper';

      for (const subUpgrade of visibleSubUpgrades) {
        const subItem = this.createSubUpgradeCard(subUpgrade, state);
        grid.appendChild(subItem);
      }

      gridContainer.appendChild(effectWrapper);
    }

    gridContainer.appendChild(grid);
    specialBox.appendChild(gridContainer);
    
    // Always append the container to maintain consistent layout
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

      // Create individual floating container for each upgrade item
      const itemContainer = document.createElement('div');
      itemContainer.className = 'upgrade-item-container';

      const item = document.createElement('div');
      item.className = 'upgrade-item';

      // Enhanced UI: Add visual indicator for ships (only in new UI)
      if (!this.useOldUI && upgrade.id === 'ship') {
        item.classList.add('upgrade-item-ship');
        itemContainer.classList.add('upgrade-item-ship-container');
      }

      const header = document.createElement('div');
      header.className = 'upgrade-header';

      // Only add pixel art icons in new UI
      if (!this.useOldUI) {
        // Add pixel art icon - use new pixel art renderer
        const iconSprite = getMainUpgradeSprite(upgrade.id);
        let icon: HTMLImageElement;

        if (iconSprite) {
          // Use new pixel art sprite
          icon = PixelArtRenderer.renderToImage(iconSprite, upgrade.id, 32, 'upgrade-icon-img');
          icon.style.marginRight = '8px';
          icon.style.verticalAlign = 'middle';
        } else {
          // Fallback to old system
          icon = document.createElement('img');
          icon.className = 'upgrade-icon-img';
          // @ts-ignore - We know upgrades exists on images now
          icon.src = images.upgrades?.[upgrade.id] || images.stars;
          icon.alt = upgrade.name;
          icon.style.width = '32px';
          icon.style.height = '32px';
          icon.style.marginRight = '8px';
          icon.style.imageRendering = 'pixelated';
          icon.style.verticalAlign = 'middle';
        }

        header.appendChild(icon);
      }

      const name = document.createElement('div');
      name.className = 'upgrade-name';
      name.textContent = upgrade.name;

      const level = document.createElement('div');
      level.className = 'upgrade-level';
      level.textContent = upgrade.getDisplayText(state);

      header.appendChild(name);
      header.appendChild(level);

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
        const currentLevel = upgrade.getLevel(state);
        const firstUpgradeCost = upgrade.getCost(currentLevel);

        // First check if we can afford at least one upgrade
        if (state.points < firstUpgradeCost) {
          // Can't afford even one - show cost of one but disable button
          displayCost = firstUpgradeCost;
          displayQuantity = 1;
          canAffordExact = false;
        } else {
          // Can afford at least one - calculate how many
          const { totalCost, quantity } = this.calculateBulkCost(
            upgrade,
            state,
          );
          displayCost = totalCost;
          displayQuantity = quantity;
          // Verify we can actually afford the calculated cost
          canAffordExact = quantity > 0 && state.points >= totalCost;
        }
      } else {
        // For specific quantity: calculate cost for EXACT requested quantity
        const currentLevel = upgrade.getLevel(state);
        let tempLevel = currentLevel;
        const upgradeId = upgrade.id;
        const affectsSelfCost = upgradeId === 'cosmicKnowledge';

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
            }
          }
        }

        displayQuantity = requestedQty;
        canAffordExact = state.points >= displayCost;
      }

      // Simplified cost display - just show the number
      cost.textContent = this.formatNumber(displayCost);
      // Show quantity for all modes (x5, x10, and Max)
      if (displayQuantity > 1) {
        const quantitySpan = document.createElement('span');
        quantitySpan.className = 'upgrade-quantity-text';
        quantitySpan.textContent = ` (×${displayQuantity})`;
        cost.appendChild(quantitySpan);
      }

      // Create button with image instead of text
      const button = new Button('', () => {
        // Buy exactly the requested quantity (or max affordable for MAX mode)
        const qtyToBuy =
          this.buyQuantity === 'max' ? displayQuantity : displayQuantity;
        this.buyUpgrade(upgrade, qtyToBuy);
      });
      button.setEnabled(canAffordExact);

      // Cache the button element for quick updates
      const buttonElement = button.getElement();

      // Set button content with image
      this.setBuyButtonContent(buttonElement, displayQuantity);

      this.buttonCache.set(upgrade.id, buttonElement);

      footer.appendChild(cost);
      footer.appendChild(buttonElement);

      item.appendChild(header);
      item.appendChild(footer);

      // Add item to its container, then add container to shop
      itemContainer.appendChild(item);
      this.container.appendChild(itemContainer);
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

    // Add icon back for visibility - use generated pixel art if available
    const icon = document.createElement('div');
    icon.className = 'sub-upgrade-icon';
    
    // Check if there's a specific icon for this upgrade, otherwise use star emoji
    // @ts-ignore - We know upgrades exists on images now
    if (images.upgrades?.[subUpgrade.id]) {
      const img = document.createElement('img');
      // @ts-ignore - We know upgrades exists on images now
      img.src = images.upgrades[subUpgrade.id];
      img.alt = t(`upgrades.special.${subUpgrade.id}.name`);
      img.style.width = '130%';
      img.style.height = '130%';
      img.style.objectFit = 'contain';
      img.style.transform = 'scale(1.1)';
      // Pixel art rendering
      img.style.imageRendering = 'pixelated';
      icon.appendChild(img);
    } else {
      // Use star emoji instead of images.stars
      const starEmoji = document.createElement('span');
      starEmoji.textContent = '⭐';
      starEmoji.style.fontSize = '32px';
      starEmoji.style.display = 'flex';
      starEmoji.style.alignItems = 'center';
      starEmoji.style.justifyContent = 'center';
      starEmoji.style.width = '100%';
      starEmoji.style.height = '100%';
      icon.appendChild(starEmoji);
    }
    card.appendChild(icon);

    // Name and cost are hidden via CSS for simpler UI
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

    // Tooltip - append to body to avoid overflow clipping
    const tooltip = document.createElement('div');
    tooltip.className = 'sub-upgrade-tooltip';
    const upgradeName = t(`upgrades.special.${subUpgrade.id}.name`);
    const upgradeDescription = t(
      `upgrades.special.${subUpgrade.id}.description`,
    );
    const upgradeFlavor = t(`upgrades.special.${subUpgrade.id}.flavor`);
    const costText = subUpgrade.owned
      ? `✓ ${t('common.owned')}`
      : this.formatNumber(discountedCost);
    tooltip.innerHTML = `<strong>${upgradeName}</strong><br>${upgradeDescription}<br><div style="color: #66ccff; font-weight: 500; margin-top: 4px;">${costText}</div><em style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-top: 4px; display: block;">${upgradeFlavor}</em>`;
    document.body.appendChild(tooltip);
    this.activeTooltips.add(tooltip);

    // Update tooltip position on hover
    const showTooltip = () => {
      const rect = card.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.opacity = '1';
    };

    const hideTooltip = () => {
      tooltip.style.opacity = '0';
    };

    card.addEventListener('mouseenter', showTooltip);
    card.addEventListener('mouseleave', hideTooltip);

    if (!subUpgrade.owned) {
      // Set initial affordability state
      const canAfford = state.points >= discountedCost;
      card.style.opacity = canAfford ? '1' : '0.7';
      card.style.cursor = canAfford ? 'pointer' : 'not-allowed';

      card.addEventListener('click', () => {
        hideTooltip(); // Hide tooltip when clicking to buy
        const currentState = this.store.getState();
        const currentCost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        if (currentState.points >= currentCost) {
          this.buySubUpgrade(subUpgrade);
        }
      });
    }

    return card;
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
    const affectsSelfCost = upgradeId === 'cosmicKnowledge';

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

  private onPurchaseCallback: (() => void) | null = null;

  public setOnPurchase(callback: () => void): void {
    this.onPurchaseCallback = callback;
  }

  private buyUpgrade(upgrade: UpgradeConfig, quantity: number = 1): void {
    // Prevent concurrent purchases
    if (this.isProcessingPurchase) return;
    this.isProcessingPurchase = true;

    const state = this.store.getState();
    // For auto-buy, always use quantity = 1 (ignore buyQuantity setting)
    const isMaxMode = false; // Auto-buy always buys one at a time

    // Calculate actual cost for the quantity
    let totalCost = 0;
    let actualQuantity = 0;
    const currentLevel = upgrade.getLevel(state);
    const upgradeId = upgrade.id;
    const affectsSelfCost = upgradeId === 'cosmicKnowledge';

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
      ? actualQuantity > 0 && state.points >= totalCost
      : actualQuantity === quantity && state.points >= totalCost;

    if (canBuy && actualQuantity > 0) {
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

      // Notify listener
      if (this.onPurchaseCallback) {
        this.onPurchaseCallback();
      }

      // Visual feedback: briefly highlight the purchased upgrade button
      const button = this.buttonCache.get(upgrade.id);
      if (button) {
        const originalTransition = button.style.transition;
        const originalTransform = button.style.transform;
        const originalBoxShadow = button.style.boxShadow;

        button.style.transition = 'all 0.3s ease';
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';

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
      const wasMeaningOfLife =
        upgrade.id === 'meaning_of_life' &&
        !state.subUpgrades['meaning_of_life'];

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

      // Special animation for meaning_of_life upgrade
      if (wasMeaningOfLife) {
        // Trigger store update to show prestige button animation
        this.store.setState(state);

        // Add visual effect to the upgrade card
        const upgradeCard = document.querySelector(
          `[data-upgrade-id="${upgrade.id}"]`,
        );
        if (upgradeCard instanceof HTMLElement) {
          // Create pulsing glow animation
          upgradeCard.style.transition = 'all 0.3s ease-out';
          upgradeCard.style.transform = 'scale(1.15)';
          upgradeCard.style.boxShadow =
            '0 0 50px rgba(255, 215, 0, 1), 0 0 100px rgba(255, 215, 0, 0.6), inset 0 0 40px rgba(255, 215, 0, 0.5)';
          upgradeCard.style.zIndex = '1000';
          upgradeCard.style.filter = 'brightness(1.3)';

          // Pulsing effect
          let pulseCount = 0;
          const pulseInterval = setInterval(() => {
            pulseCount++;
            if (pulseCount >= 3) {
              clearInterval(pulseInterval);
              upgradeCard.style.transition = 'all 0.5s ease-out';
              upgradeCard.style.transform = '';
              upgradeCard.style.boxShadow = '';
              upgradeCard.style.zIndex = '';
              upgradeCard.style.filter = '';
            } else {
              upgradeCard.style.transform =
                pulseCount % 2 === 0 ? 'scale(1.2)' : 'scale(1.15)';
            }
          }, 200);
        }
      }

      // Notify listener
      if (this.onPurchaseCallback) {
        this.onPurchaseCallback();
      }

      // Force immediate UI update
      this.lastAffordability.clear();
      this.render();
    }

    this.isProcessingPurchase = false;
  }

  /**
   * Check and buy discovered special upgrades first (prioritized)
   * Called when there are discovered but unpurchased special upgrades
   */
  public checkAndBuyDiscoveredUpgrades(): void {
    if (this.isProcessingPurchase) return;

    const state = this.store.getState();
    if (!state.discoveredUpgrades) return;

    // Only check sub-upgrades (special upgrades), not main upgrades
    const subUpgrades = this.upgradeSystem.getSubUpgrades();
    const affordableUpgrades: Array<{
      upgrade: (typeof subUpgrades)[0];
      cost: number;
    }> = [];

    // Collect all discovered upgrades that are affordable
    for (const subUpgrade of subUpgrades) {
      const subKey = `sub_${subUpgrade.id}`;
      if (
        state.discoveredUpgrades[subKey] &&
        !subUpgrade.owned &&
        subUpgrade.isVisible(state)
      ) {
        const currentState = this.store.getState();
        const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        if (currentState.points >= cost) {
          affordableUpgrades.push({ upgrade: subUpgrade, cost });
        }
      }
    }

    // Sort by cost (lowest first) and buy the cheapest one
    if (affordableUpgrades.length > 0) {
      affordableUpgrades.sort((a, b) => a.cost - b.cost);
      const cheapestUpgrade = affordableUpgrades[0];
      if (cheapestUpgrade) {
        this.buySubUpgrade(cheapestUpgrade.upgrade);
      }
    }
  }

  /**
   * Check if there are discovered but unpurchased special upgrades (sub-upgrades only)
   * Only returns true if player has at least 80% of the cost
   * Returns false if no special upgrades are discovered or if player doesn't have 80% of any cost
   */
  private hasDiscoveredUpgrades(state: GameState): boolean {
    if (!state.discoveredUpgrades) return false;

    // Only check sub-upgrades (special upgrades), not main upgrades
    const subUpgrades = this.upgradeSystem.getSubUpgrades();

    for (const subUpgrade of subUpgrades) {
      const subKey = `sub_${subUpgrade.id}`;
      // Check if this upgrade is discovered and not owned
      if (state.discoveredUpgrades[subKey] && !subUpgrade.owned) {
        // Check if upgrade meets visibility and requirements
        if (!subUpgrade.isVisible(state) || !subUpgrade.requires(state)) {
          continue;
        }

        // Only prioritize if we have at least 80% of the cost
        const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        const threshold = cost * 0.8;
        if (state.points >= threshold) {
          return true;
        }
      }
    }

    // No discovered special upgrades with 80%+ threshold found
    // This allows normal upgrades to be purchased
    return false;
  }

  /**
   * Auto-buy affordable upgrades
   * Called periodically when auto-buy is enabled
   */
  public checkAndBuyAffordableUpgrades(force = false): void {
    const state = this.store.getState();
    if (!force && !(state.autoBuyEnabled ?? false)) return;
    if (this.isProcessingPurchase) return; // Prevent concurrent purchases

    // First, check for new discoveries (this ensures all affordable upgrades are discovered)
    // Pass the state object so discoveries are saved
    this.checkForDiscoveries(state);
    // Save state after discoveries
    this.store.setState(state);

    // Always try to buy discovered special upgrades first if affordable
    this.checkAndBuyDiscoveredUpgrades();

    // Check if we're saving for discovered upgrades (80%+ threshold)
    // Only block normal upgrades if we're actively saving for a special upgrade
    const freshState = this.store.getState();

    // Only check for discovered upgrades if there are any discovered upgrades at all
    if (freshState.discoveredUpgrades && Object.keys(freshState.discoveredUpgrades).length > 0) {
      const shouldSaveForSpecial = this.hasDiscoveredUpgrades(freshState);

      if (shouldSaveForSpecial) {
        // We have 80%+ of a special upgrade cost, so save money for it
        return; // Skip buying normal upgrades, save money for discovered special upgrades
      }
    }

    // Continue with normal upgrade buying logic
    // This runs when:
    // 1. No special upgrades are discovered, OR
    // 2. Special upgrades are discovered but we don't have 80%+ of any cost

    // Get fresh state after discoveries
    let currentState = this.store.getState();
    const upgrades = this.upgradeSystem.getUpgrades();
    let purchasedAny = false;

    // Sort upgrades by priority: ship > attack speed > point multiplier > crit chance > others
    const upgradePriority: Record<string, number> = {
      ship: 0,
      attackSpeed: 1,
      pointMultiplier: 2,
      critChance: 3,
      resourceGen: 4,
      xpBoost: 5,
      mutationEngine: 6,
      energyCore: 7,
      cosmicKnowledge: 8,
    };

    const sortedUpgrades = [...upgrades].sort((a, b) => {
      const priorityA = upgradePriority[a.id] ?? 999;
      const priorityB = upgradePriority[b.id] ?? 999;
      return priorityA - priorityB;
    });

    // Ensure ship upgrade is always discovered
    if (!currentState.discoveredUpgrades) {
      currentState.discoveredUpgrades = {};
    }
    currentState.discoveredUpgrades['ship'] = true;

    // Check main upgrades in priority order
    // Buy the first affordable upgrade in priority order (not the cheapest)
    // This ensures we buy upgrades in the correct priority order, not just the cheapest ones
    for (const upgrade of sortedUpgrades) {
      if (upgrade.id === 'misc') continue;

      // Get fresh state for each upgrade check (state may have changed)
      currentState = this.store.getState();

      // Auto-discover upgrades if player has 75% of the cost (same as manual discovery)
      const currentLevel = upgrade.getLevel(currentState);
      const cost = upgrade.getCost(currentLevel);
      const discoveryThreshold = cost * 0.75;

      if (
        !currentState.discoveredUpgrades?.[upgrade.id] &&
        currentLevel === 0
      ) {
        // Auto-discover if player has 75% of cost
        if (currentState.points >= discoveryThreshold) {
          if (!currentState.discoveredUpgrades) {
            currentState.discoveredUpgrades = {};
          }
          currentState.discoveredUpgrades[upgrade.id] = true;
          this.store.setState(currentState);
          // Refresh state after discovery
          currentState = this.store.getState();
        } else {
          // Skip if not discovered and can't afford discovery threshold
          continue;
        }
      }

      // Check if we can afford at least one
      // Use canBuy to check, but also verify points directly as a safety check
      // Get fresh state again before checking affordability
      currentState = this.store.getState();
      const upgradeCost = upgrade.getCost(upgrade.getLevel(currentState));
      const canAfford = currentState.points >= upgradeCost;
      const canBuyResult = upgrade.canBuy(currentState);

      if (canBuyResult && canAfford) {
        // Buy one at a time for auto-buy (safer and more predictable)
        this.buyUpgrade(upgrade, 1);
        purchasedAny = true;
        break; // Only buy one upgrade per check to avoid buying too many at once
      }
    }

    // If no main upgrades were purchased, check sub-upgrades
    if (!purchasedAny) {
      // Get fresh state again after potential purchase
      currentState = this.store.getState();
      const subUpgrades = this.upgradeSystem.getSubUpgrades();
      for (const subUpgrade of subUpgrades) {
        if (!subUpgrade.isVisible(currentState) || subUpgrade.owned) continue;

        const cost = this.upgradeSystem.getSubUpgradeCost(subUpgrade);
        if (currentState.points >= cost) {
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
