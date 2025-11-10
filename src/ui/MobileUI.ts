export class MobileUI {
  private isMobile = false;
  private mobileMenu: HTMLElement | null = null;
  private mobileMenuContent: HTMLElement | null = null;
  private shopPanel: HTMLElement | null = null;
  private hudButtonsContainer: HTMLElement | null = null;
  private isShopOpen = false;
  private isMenuOpen = false;

  constructor() {
    this.detectMobile();

    // Immediately hide shop on mobile before setup
    if (this.isMobile) {
      const shopPanel = document.getElementById('shop-panel');
      if (shopPanel) {
        shopPanel.classList.remove('mobile-open');
        shopPanel.style.display = 'none';
      }
    }

    this.setupMobileUI();
    this.setupResizeHandler();
  }

  private detectMobile(): void {
    // Better mobile detection: check both width and touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const isMobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // Consider it mobile if it has touch AND (small screen OR mobile user agent)
    this.isMobile = hasTouch && (isSmallScreen || isMobileUserAgent);
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.detectMobile();
      this.updateUIForScreenSize();
    });
  }

  private setupMobileUI(): void {
    // Get elements
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuContent = document.querySelector('.mobile-menu-content');
    this.shopPanel = document.getElementById('shop-panel');
    this.hudButtonsContainer = document.getElementById('hud-buttons-container');

    // Wait for DOM to be fully ready
    setTimeout(() => {
      // Mobile menu toggle
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenuClose = document.getElementById('mobile-menu-close');

      if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.toggleMobileMenu();
        });
      }

      if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.closeMobileMenu();
        });
      }

      // Mobile shop toggle
      const mobileShopToggle = document.getElementById('mobile-shop-toggle');
      const mobileShopClose = document.getElementById('mobile-shop-close');

      if (mobileShopToggle) {
        // Add both click and touchstart for better mobile compatibility
        const handleShopToggle = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          this.toggleShop();
        };

        mobileShopToggle.addEventListener('click', handleShopToggle);
        mobileShopToggle.addEventListener('touchstart', handleShopToggle, {
          passive: false,
        });

        // Ensure button is visible and clickable
        mobileShopToggle.style.pointerEvents = 'auto';
        mobileShopToggle.style.touchAction = 'manipulation';
        mobileShopToggle.style.zIndex = '2000';
      }

      if (mobileShopClose) {
        // Add both click and touchstart for better mobile compatibility
        const handleShopClose = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          this.closeShop();
        };

        mobileShopClose.addEventListener('click', handleShopClose);
        mobileShopClose.addEventListener('touchstart', handleShopClose, {
          passive: false,
        });

        // Ensure button is visible and clickable
        mobileShopClose.style.pointerEvents = 'auto';
        mobileShopClose.style.touchAction = 'manipulation';
        mobileShopClose.style.zIndex = '2001';
      }

      // Close menus when clicking outside
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (
          this.isMenuOpen &&
          this.mobileMenu &&
          !this.mobileMenu.contains(target) &&
          !target.closest('#mobile-menu-toggle')
        ) {
          this.closeMobileMenu();
        }
      });

      // Initial state - hide shop on mobile
      if (this.isMobile) {
        const shopPanel = document.getElementById('shop-panel');
        if (shopPanel) {
          shopPanel.classList.remove('mobile-open');
          shopPanel.style.display = 'none';
          this.isShopOpen = false;
        }
      }

      // Force update UI after a short delay to ensure all elements are ready
      setTimeout(() => {
        this.updateUIForScreenSize();
      }, 50);
    }, 100);

    // Also set initial state immediately
    if (this.isMobile) {
      const shopPanel = document.getElementById('shop-panel');
      if (shopPanel) {
        shopPanel.classList.remove('mobile-open');
        shopPanel.style.display = 'none';
      }
    }

    // Initial UI update
    this.updateUIForScreenSize();

    // Additional check: if touch device but not detected as mobile, show mobile controls anyway
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (hasTouch && !this.isMobile) {
      // Re-check after a delay in case of timing issues
      setTimeout(() => {
        this.detectMobile();
        if (this.isMobile) {
          this.updateUIForScreenSize();
        }
      }, 200);
    }
  }

  private updateUIForScreenSize(): void {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileShopToggle = document.getElementById('mobile-shop-toggle');
    const mobileShopClose = document.getElementById('mobile-shop-close');
    const hudButtonsContainer = document.getElementById(
      'hud-buttons-container',
    );

    if (this.isMobile) {
      // Show mobile controls
      if (mobileMenuToggle) {
        mobileMenuToggle.style.display = 'flex';
        mobileMenuToggle.style.pointerEvents = 'auto';
        mobileMenuToggle.style.zIndex = '2000';
      }
      if (mobileShopToggle) {
        mobileShopToggle.style.display = 'flex';
        mobileShopToggle.style.pointerEvents = 'auto';
        mobileShopToggle.style.zIndex = '2000';
      }
      if (mobileShopClose) {
        mobileShopClose.style.display = 'flex';
        mobileShopClose.style.pointerEvents = 'auto';
        mobileShopClose.style.zIndex = '2001';
      }

      // Hide desktop HUD buttons container on mobile
      if (hudButtonsContainer) hudButtonsContainer.style.display = 'none';

      // Move buttons to mobile menu
      this.moveButtomnsToMobileMenu();

      // Force hide shop on mobile (but keep it in DOM for animation)
      if (this.shopPanel) {
        this.shopPanel.classList.remove('mobile-open');
        // Don't set display: none immediately - let CSS handle it via transform
        // This ensures the panel can animate in/out properly
        if (!this.isShopOpen) {
          this.shopPanel.style.display = 'none';
        }
      }
    } else {
      // Hide mobile controls
      if (mobileMenuToggle) mobileMenuToggle.style.display = 'none';
      if (mobileShopToggle) mobileShopToggle.style.display = 'none';
      if (mobileShopClose) mobileShopClose.style.display = 'none';

      // Show desktop HUD buttons container
      if (hudButtonsContainer) hudButtonsContainer.style.display = 'grid';

      // Move buttons back to HUD
      this.moveButtonsToHUD();

      // Show shop on desktop
      if (this.shopPanel) {
        this.shopPanel.classList.remove('mobile-open');
      }

      // Close mobile menu
      this.closeMobileMenu();
    }
  }

  private moveButtomnsToMobileMenu(): void {
    if (!this.mobileMenuContent || !this.hudButtonsContainer) return;

    // Move HUD buttons to mobile menu
    const achievementsBtn = document.getElementById('achievements-btn');
    const statsBtn = document.getElementById('stats-btn');
    const missionsBtn = document.getElementById('missions-button');
    const artifactsBtn = document.getElementById('artifacts-button');
    const ascensionBtn = document.getElementById('ascension-button');
    const customizationBtn = document.getElementById('customization-button');
    const gameInfoBtn = document.getElementById('game-info-button');
    const settingsBtn = document.getElementById('settings-button');
    const bossRetryBtn = document.getElementById('boss-retry-btn');

    // Clear mobile menu content
    this.mobileMenuContent.innerHTML = '';

    // Add buttons to mobile menu in order
    const buttons = [
      achievementsBtn,
      statsBtn,
      missionsBtn,
      artifactsBtn,
      ascensionBtn,
      customizationBtn,
      gameInfoBtn,
      settingsBtn,
      bossRetryBtn,
    ];

    buttons.forEach((btn) => {
      if (btn) {
        // Check visibility for ascension button and boss retry button
        if (btn.id === 'ascension-button' || btn.id === 'boss-retry-btn') {
          const computedStyle = window.getComputedStyle(btn);
          if (computedStyle.display === 'none') {
            return; // Skip hidden buttons
          }
        }

        const clone = btn.cloneNode(true) as HTMLElement;
        clone.style.display = 'flex';
        clone.style.width = '100%';
        clone.style.marginBottom = '10px';

        // Copy event listeners by getting the original button's onclick
        const originalBtn = btn as HTMLButtonElement;
        clone.addEventListener('click', () => {
          originalBtn.click();
          this.closeMobileMenu();
        });

        if (this.mobileMenuContent) {
          this.mobileMenuContent.appendChild(clone);
        }
      }
    });
  }

  private moveButtonsToHUD(): void {
    // Buttons are already in HUD, just need to ensure they're visible
    // The original buttons never left the DOM
  }

  private toggleMobileMenu(): void {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  private openMobileMenu(): void {
    if (this.mobileMenu) {
      // Refresh menu buttons to respect current visibility (e.g., ascension button)
      this.moveButtomnsToMobileMenu();
      this.mobileMenu.style.display = 'block';
      // Force reflow for animation
      void this.mobileMenu.offsetHeight;
      this.mobileMenu.classList.add('open');
      this.isMenuOpen = true;
    }
  }

  private closeMobileMenu(): void {
    if (this.mobileMenu) {
      this.mobileMenu.classList.remove('open');
      setTimeout(() => {
        if (this.mobileMenu) {
          this.mobileMenu.style.display = 'none';
        }
      }, 300);
      this.isMenuOpen = false;
    }
  }

  private toggleShop(): void {
    if (this.isShopOpen) {
      this.closeShop();
    } else {
      this.openShop();
    }
  }

  private openShop(): void {
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      // Ensure proper z-index and visibility
      shopPanel.style.zIndex = '1500';
      shopPanel.style.position = 'fixed';
      shopPanel.style.display = 'block';
      shopPanel.style.pointerEvents = 'auto';
      shopPanel.style.visibility = 'visible';

      // Force reflow to ensure display change is applied
      void shopPanel.offsetHeight;

      // Small delay to allow display change to take effect before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (shopPanel) {
            shopPanel.classList.add('mobile-open');
            this.isShopOpen = true;

            // Double-check it's visible
            if (shopPanel.style.display !== 'block') {
              shopPanel.style.display = 'block';
            }
          }
        });
      });
    }
  }

  private closeShop(): void {
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      shopPanel.classList.remove('mobile-open');
      // Wait for animation to finish before hiding
      setTimeout(() => {
        shopPanel.style.display = 'none';
      }, 300); // Match the CSS transition duration
      this.isShopOpen = false;
    }
  }

  public isMobileDevice(): boolean {
    return this.isMobile;
  }
}
