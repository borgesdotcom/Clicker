import { Game } from './Game';
import { MobileUI } from './ui/MobileUI';
import '../styles.css';

// Extend Window interface for debugging properties
declare global {
  interface Window {
    game?: Game;
    mobileUI?: MobileUI;
  }
}

// Prevent context menu (right-click) on the entire document
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Prevent drag and drop
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

// Prevent image dragging
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  return false;
});

function init(): void {
  const game = new Game();
  const mobileUI = new MobileUI();
  game.start();

  window.game = game;
  window.mobileUI = mobileUI;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
