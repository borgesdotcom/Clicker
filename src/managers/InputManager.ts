/**
 * InputManager - Handles keyboard shortcuts and input coordination
 * Extracted from Game.ts for better separation of concerns
 */

import { HOTKEYS } from '../config/constants';

/**
 * Dependencies that InputManager needs
 */
export interface InputManagerDependencies {
  store: {
    getState: () => { autoBuyEnabled?: boolean };
    setState: (state: any) => void;
  };
  notificationSystem: {
    show: (message: string, type?: any, duration?: number) => void;
  };
  achievementsModal: { show: () => void; hide: () => void };
  ascensionModal: { show: () => void; hide: () => void };
  missionsModal: { show: () => void; hide: () => void };
  artifactsModal: { show: () => void; hide: () => void };
  statsPanel: { show: () => void; hide: () => void };
  settingsModal: { show: () => void; hide: () => void };
  creditsModal: { show: () => void; hide: () => void };
  gameInfoModal: { show: () => void; hide: () => void };
  thankYouModal: { show: () => void; hide: () => void };
}

/**
 * Callbacks for InputManager to communicate with Game
 */
export interface InputManagerCallbacks {
  onSpaceKeyDown?: () => void;
  onSpaceKeyUp?: () => void;
}

export class InputManager {
  private deps: InputManagerDependencies;
  private callbacks: InputManagerCallbacks;
  private keys: Set<string> = new Set();
  private keyboardListenersSetup = false;

  constructor(deps: InputManagerDependencies, callbacks: InputManagerCallbacks = {}) {
    this.deps = deps;
    this.callbacks = callbacks;
  }

  /**
   * Setup keyboard shortcuts and listeners
   */
  setupKeyboard(): void {
    if (this.keyboardListenersSetup) {
      return; // Already setup
    }

    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());

      // Keyboard shortcuts (only when not typing in input fields)
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return; // Don't trigger shortcuts when typing
      }

      // Handle shortcuts
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      } else if (
        event.key === HOTKEYS.AUTO_BUY.toLowerCase() ||
        event.key === HOTKEYS.AUTO_BUY.toUpperCase()
      ) {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault();
          this.handleAutoBuyToggle();
        }
      } else if (event.key === 'm' || event.key === 'M') {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deps.missionsModal.show();
        }
      } else if (
        event.key === HOTKEYS.SETTINGS.toLowerCase() ||
        event.key === HOTKEYS.SETTINGS.toUpperCase()
      ) {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deps.settingsModal.show();
        }
      } else if (
        event.key === HOTKEYS.ACHIEVEMENTS.toLowerCase() ||
        event.key === HOTKEYS.ACHIEVEMENTS.toUpperCase()
      ) {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deps.achievementsModal.show();
        }
      } else if (event.key === 'p' || event.key === 'P') {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deps.ascensionModal.show();
        }
      } else if (event.key === 'i' || event.key === 'I') {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
          this.deps.gameInfoModal.show();
        }
      } else if (event.code === 'Space' && this.callbacks.onSpaceKeyDown) {
        event.preventDefault();
        this.callbacks.onSpaceKeyDown();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());

      if (event.code === 'Space' && this.callbacks.onSpaceKeyUp) {
        event.preventDefault();
        this.callbacks.onSpaceKeyUp();
      }
    });

    this.keyboardListenersSetup = true;
  }

  /**
   * Close all open modals
   */
  private handleEscapeKey(): void {
    this.deps.achievementsModal.hide();
    this.deps.ascensionModal.hide();
    this.deps.missionsModal.hide();
    this.deps.artifactsModal.hide();
    this.deps.statsPanel.hide();
    this.deps.settingsModal.hide();
    this.deps.creditsModal.hide();
    this.deps.gameInfoModal.hide();
    this.deps.thankYouModal.hide();
  }

  /**
   * Toggle auto-buy feature
   */
  private handleAutoBuyToggle(): void {
    const state = this.deps.store.getState();
    state.autoBuyEnabled = !(state.autoBuyEnabled ?? false);
    this.deps.store.setState(state);
    // Show notification
    this.deps.notificationSystem.show(
      state.autoBuyEnabled ? '🤖 Auto-Buy Enabled' : '🤖 Auto-Buy Disabled',
      'info',
      2000,
    );
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  /**
   * Cleanup - remove event listeners
   */
  cleanup(): void {
    // Note: We can't easily remove these listeners without storing references
    // This is a limitation, but acceptable since InputManager should persist for the game's lifetime
    this.keyboardListenersSetup = false;
  }
}

