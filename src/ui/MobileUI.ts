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
    this.isMobile = window.innerWidth <= 768;
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
        mobileShopToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.toggleShop();
        });
      }

      if (mobileShopClose) {
        mobileShopClose.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Shop close button clicked');
          this.closeShop();
        });
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
    }, 100);

    // Also set initial state immediately
    if (this.isMobile) {
      const shopPanel = document.getElementById('shop-panel');
      if (shopPanel) {
        shopPanel.classList.remove('mobile-open');
        shopPanel.style.display = 'none';
      }
    }

    this.updateUIForScreenSize();
  }

  private updateUIForScreenSize(): void {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileShopToggle = document.getElementById('mobile-shop-toggle');
    const mobileShopClose = document.getElementById('mobile-shop-close');
    const achievementsBtn = document.getElementById('achievements-btn');
    const statsBtn = document.getElementById('stats-btn');
    const missionsBtn = document.getElementById('missions-button');
    const artifactsBtn = document.getElementById('artifacts-button');
    const ascensionBtn = document.getElementById('ascension-button');
    const settingsBtn = document.getElementById('settings-button');
    const hudButtonsContainer = document.getElementById(
      'hud-buttons-container',
    );

    if (this.isMobile) {
      // Show mobile controls
      if (mobileMenuToggle) mobileMenuToggle.style.display = 'flex';
      if (mobileShopToggle) mobileShopToggle.style.display = 'flex';
      if (mobileShopClose) mobileShopClose.style.display = 'flex';

      // Hide ALL desktop HUD buttons on mobile
      if (achievementsBtn) achievementsBtn.style.display = 'none';
      if (statsBtn) statsBtn.style.display = 'none';
      if (missionsBtn) missionsBtn.style.display = 'none';
      if (artifactsBtn) artifactsBtn.style.display = 'none';
      if (ascensionBtn) ascensionBtn.style.display = 'none';
      if (settingsBtn) settingsBtn.style.display = 'none';
      if (hudButtonsContainer) hudButtonsContainer.style.display = 'none';

      // Move buttons to mobile menu
      this.moveButtomnsToMobileMenu();

      // Force hide shop on mobile
      if (this.shopPanel) {
        this.shopPanel.classList.remove('mobile-open');
        this.shopPanel.style.display = 'none';
        this.isShopOpen = false;
      }
    } else {
      // Hide mobile controls
      if (mobileMenuToggle) mobileMenuToggle.style.display = 'none';
      if (mobileShopToggle) mobileShopToggle.style.display = 'none';
      if (mobileShopClose) mobileShopClose.style.display = 'none';

      // Show ALL desktop HUD buttons
      if (achievementsBtn) achievementsBtn.style.display = '';
      if (statsBtn) statsBtn.style.display = '';
      if (missionsBtn) missionsBtn.style.display = '';
      if (artifactsBtn) artifactsBtn.style.display = '';
      if (ascensionBtn) ascensionBtn.style.display = '';
      if (settingsBtn) settingsBtn.style.display = '';
      if (hudButtonsContainer) hudButtonsContainer.style.display = '';

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
    const settingsBtn = document.getElementById('settings-button');

    // Clear mobile menu content
    this.mobileMenuContent.innerHTML = '';

    // Add buttons to mobile menu in order
    const buttons = [
      achievementsBtn,
      statsBtn,
      missionsBtn,
      artifactsBtn,
      ascensionBtn,
      settingsBtn,
    ];

    buttons.forEach((btn) => {
      if (btn) {
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
      console.log('Opening shop');
      // First make it visible
      shopPanel.style.display = 'block';
      // Small delay to allow display change to take effect before animation
      setTimeout(() => {
        shopPanel.classList.add('mobile-open');
      }, 10);
      this.isShopOpen = true;
    }
  }

  private closeShop(): void {
    const shopPanel = document.getElementById('shop-panel');
    if (shopPanel) {
      console.log('Closing shop');
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
