import type { Store } from '../core/Store';

export class DebugPanel {
  private panel: HTMLElement | null = null;
  private isVisible = false;
  private store: Store;
  private onBossTrigger: () => void;
  private onReset: () => void;
  private onSetSpeed: (speed: number) => void;
  private onToggleGodMode: () => void;
  private godModeActive = false;

  constructor(
    store: Store,
    onBossTrigger: () => void,
    onReset: () => void,
    onSetSpeed: (speed: number) => void,
    onToggleGodMode: () => void,
  ) {
    this.store = store;
    this.onBossTrigger = onBossTrigger;
    this.onReset = onReset;
    this.onSetSpeed = onSetSpeed;
    this.onToggleGodMode = onToggleGodMode;
    this.createPanel();
    this.setupKeyboardShortcut();
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl + D to toggle debug panel
      if (e.ctrlKey && e.key === 'F1') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'debug-panel';
    this.panel.style.display = 'none';

    this.panel.innerHTML = `
      <div class="debug-content">
        <div class="debug-header">
          <h2>🛠️ Admin Debug Panel</h2>
          <button id="debug-close" class="debug-btn debug-btn-close">×</button>
        </div>
        
        <div class="debug-section">
          <h3>💰 Resources</h3>
          <div class="debug-controls">
            <button id="debug-add-points-1k" class="debug-btn">+1K Points</button>
            <button id="debug-add-points-100k" class="debug-btn">+100K Points</button>
            <button id="debug-add-points-1m" class="debug-btn">+1M Points</button>
            <button id="debug-add-points-100m" class="debug-btn">+100M Points</button>
          </div>
          <div class="debug-controls">
            <input type="number" id="debug-points-input" placeholder="Custom amount" />
            <button id="debug-set-points" class="debug-btn">Set Points</button>
          </div>
        </div>

        <div class="debug-section">
          <h3>⭐ Level & XP</h3>
          <div class="debug-controls">
            <input type="number" id="debug-level-input" placeholder="Level" value="1" min="1" max="1000" />
            <button id="debug-set-level" class="debug-btn">Set Level</button>
          </div>
          <div class="debug-controls">
            <button id="debug-add-10-levels" class="debug-btn">+10 Levels</button>
            <button id="debug-add-100-levels" class="debug-btn">+100 Levels</button>
            <button id="debug-max-xp" class="debug-btn">Max Current XP</button>
          </div>
        </div>

        <div class="debug-section">
          <h3>🚀 Fleet & Upgrades</h3>
          <div class="debug-controls">
            <button id="debug-add-5-ships" class="debug-btn">+5 Ships</button>
            <button id="debug-add-20-ships" class="debug-btn">+20 Ships</button>
            <button id="debug-max-ships" class="debug-btn">Max Ships (50)</button>
          </div>
          <div class="debug-controls">
            <button id="debug-unlock-all-upgrades" class="debug-btn debug-btn-special">Unlock All Special Upgrades</button>
          </div>
          <div class="debug-controls">
            <button id="debug-max-all-upgrades" class="debug-btn debug-btn-special">Max All Basic Upgrades</button>
          </div>
        </div>

        <div class="debug-section">
          <h3>👾 Boss Controls</h3>
          <div class="debug-controls">
            <button id="debug-trigger-boss" class="debug-btn debug-btn-boss">Trigger Boss Fight</button>
            <button id="debug-kill-boss" class="debug-btn">Instant Kill Boss</button>
          </div>
        </div>

        <div class="debug-section">
          <h3>📊 Stats</h3>
          <div class="debug-controls">
            <button id="debug-add-1k-clicks" class="debug-btn">+1K Clicks</button>
            <button id="debug-add-100-bosses" class="debug-btn">+100 Boss Kills</button>
          </div>
        </div>

        <div class="debug-section">
          <h3>🎮 Game Controls</h3>
          <div class="debug-controls">
            <button id="debug-god-mode" class="debug-btn debug-btn-special">Toggle God Mode</button>
            <button id="debug-speed-2x" class="debug-btn">2x Speed</button>
            <button id="debug-speed-5x" class="debug-btn">5x Speed</button>
            <button id="debug-speed-normal" class="debug-btn">Normal Speed</button>
          </div>
          <div class="debug-controls">
            <button id="debug-reset" class="debug-btn debug-btn-danger">Reset Game</button>
          </div>
        </div>

        <div class="debug-info">
          <p>Press <kbd>Ctrl + D</kbd> to toggle this panel</p>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Close button
    document.getElementById('debug-close')?.addEventListener('click', () => {
      this.hide();
    });

    // Points controls
    document
      .getElementById('debug-add-points-1k')
      ?.addEventListener('click', () => {
        this.addPoints(1000);
      });
    document
      .getElementById('debug-add-points-100k')
      ?.addEventListener('click', () => {
        this.addPoints(100000);
      });
    document
      .getElementById('debug-add-points-1m')
      ?.addEventListener('click', () => {
        this.addPoints(1000000);
      });
    document
      .getElementById('debug-add-points-100m')
      ?.addEventListener('click', () => {
        this.addPoints(100000000);
      });
    document
      .getElementById('debug-set-points')
      ?.addEventListener('click', () => {
        const input = document.getElementById(
          'debug-points-input',
        ) as HTMLInputElement;
        const amount = parseFloat(input.value);
        if (!isNaN(amount)) {
          this.setPoints(amount);
        }
      });

    // Level controls
    document
      .getElementById('debug-set-level')
      ?.addEventListener('click', () => {
        const input = document.getElementById(
          'debug-level-input',
        ) as HTMLInputElement;
        const level = parseInt(input.value);
        if (!isNaN(level) && level >= 1) {
          this.setLevel(level);
        }
      });
    document
      .getElementById('debug-add-10-levels')
      ?.addEventListener('click', () => {
        this.addLevels(10);
      });
    document
      .getElementById('debug-add-100-levels')
      ?.addEventListener('click', () => {
        this.addLevels(100);
      });
    document.getElementById('debug-max-xp')?.addEventListener('click', () => {
      this.maxCurrentXP();
    });

    // Ship controls
    document
      .getElementById('debug-add-5-ships')
      ?.addEventListener('click', () => {
        this.addShips(5);
      });
    document
      .getElementById('debug-add-20-ships')
      ?.addEventListener('click', () => {
        this.addShips(20);
      });
    document
      .getElementById('debug-max-ships')
      ?.addEventListener('click', () => {
        this.setShips(50);
      });

    // Upgrade controls
    document
      .getElementById('debug-unlock-all-upgrades')
      ?.addEventListener('click', () => {
        this.unlockAllUpgrades();
      });
    document
      .getElementById('debug-max-all-upgrades')
      ?.addEventListener('click', () => {
        this.maxAllUpgrades();
      });

    // Boss controls
    document
      .getElementById('debug-trigger-boss')
      ?.addEventListener('click', () => {
        this.onBossTrigger();
      });
    document
      .getElementById('debug-kill-boss')
      ?.addEventListener('click', () => {
        this.killBoss();
      });

    // Stats controls
    document
      .getElementById('debug-add-1k-clicks')
      ?.addEventListener('click', () => {
        this.addClicks(1000);
      });
    document
      .getElementById('debug-add-100-bosses')
      ?.addEventListener('click', () => {
        this.addBossKills(100);
      });

    // Game controls
    document.getElementById('debug-god-mode')?.addEventListener('click', () => {
      this.godModeActive = !this.godModeActive;
      this.onToggleGodMode();
      const btn = document.getElementById('debug-god-mode');
      if (btn) {
        btn.textContent = this.godModeActive
          ? '🛡️ God Mode: ON'
          : 'Toggle God Mode';
        btn.style.borderColor = this.godModeActive ? '#ffd700' : '#ffaa00';
        btn.style.color = this.godModeActive ? '#ffd700' : '#ffaa00';
      }
      this.showNotification(
        this.godModeActive ? 'God Mode Activated!' : 'God Mode Deactivated!',
      );
    });

    document.getElementById('debug-speed-2x')?.addEventListener('click', () => {
      this.onSetSpeed(2);
      this.showNotification('Speed: 2x');
    });

    document.getElementById('debug-speed-5x')?.addEventListener('click', () => {
      this.onSetSpeed(5);
      this.showNotification('Speed: 5x');
    });

    document
      .getElementById('debug-speed-normal')
      ?.addEventListener('click', () => {
        this.onSetSpeed(1);
        this.showNotification('Speed: Normal');
      });

    document.getElementById('debug-reset')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the game?')) {
        this.onReset();
      }
    });
  }

  private addPoints(amount: number): void {
    this.store.addPoints(amount);
    this.triggerStoreUpdate();
    this.showNotification(`Added ${amount.toLocaleString()} points!`);
  }

  private setPoints(amount: number): void {
    const state = this.store.getState();
    state.points = amount;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Set points to ${amount.toLocaleString()}!`);
  }

  private setLevel(level: number): void {
    const state = this.store.getState();
    state.level = level;
    state.experience = 0;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Set level to ${String(level)}!`);
  }

  private addLevels(count: number): void {
    const state = this.store.getState();
    state.level += count;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Added ${String(count)} levels!`);
  }

  private maxCurrentXP(): void {
    const state = this.store.getState();
    const required = this.getExpRequired(state.level);
    state.experience = required - 1;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification('Maxed current level XP!');
  }

  private getExpRequired(level: number): number {
    return Math.floor(100 * Math.pow(1.15, level - 1));
  }

  private addShips(count: number): void {
    const state = this.store.getState();
    state.shipsCount += count;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Added ${String(count)} ships!`);
  }

  private setShips(count: number): void {
    const state = this.store.getState();
    state.shipsCount = count;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Set ships to ${String(count)}!`);
  }

  private unlockAllUpgrades(): void {
    const state = this.store.getState();
    // This would need the upgrade system to get all upgrade IDs
    // For now, just unlock some common ones
    const commonUpgrades = [
      'death_pact',
      'laser_focusing',
      'coffee_machine',
      'quantum_targeting',
      'lucky_dice',
      'energy_recycling',
      'overclocked_reactors',
      'ship_swarm',
      'neural_link',
      'space_pizza',
      'antimatter_rounds',
      'warp_core',
      'master_clicker',
      'rapid_fire',
      'click_multiplier',
    ];

    for (const id of commonUpgrades) {
      state.subUpgrades[id] = true;
      state.stats.totalSubUpgrades++;
    }

    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification('Unlocked special upgrades!');
  }

  private maxAllUpgrades(): void {
    const state = this.store.getState();
    state.attackSpeedLevel = 100;
    state.pointMultiplierLevel = 100;
    state.critChanceLevel = 100;
    state.resourceGenLevel = 100;
    state.xpBoostLevel = 100;
    state.stats.totalUpgrades += 500; // Approximate number of levels added
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification('Maxed all basic upgrades!');
  }

  private triggerStoreUpdate(): void {
    // Force store to notify subscribers by doing a dummy state change
    const state = this.store.getState();
    this.store.setState({ ...state });
  }

  private killBoss(): void {
    // This needs to be exposed from Game class
    this.showNotification('Boss kill not yet implemented in debug!');
  }

  private addClicks(count: number): void {
    const state = this.store.getState();
    state.stats.totalClicks += count;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Added ${String(count)} clicks to stats!`);
  }

  private addBossKills(count: number): void {
    const state = this.store.getState();
    state.stats.bossesKilled += count;
    this.store.setState(state);
    this.triggerStoreUpdate();
    this.showNotification(`Added ${String(count)} boss kills to stats!`);
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'debug-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public show(): void {
    if (this.panel) {
      this.panel.style.display = 'flex';
      this.isVisible = true;
    }
  }

  public hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }
}
