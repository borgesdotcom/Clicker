import { Game } from './Game';
import { MobileUI } from './ui/MobileUI';
import { i18n } from './core/I18n';
import '../styles.css';
import { initializeHtmlImages } from './utils/imageLoader';

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

async function init(): Promise<void> {
  // Load translations first
  await i18n.loadTranslations();

  // Set HTML lang attribute
  document.documentElement.lang = i18n.getLanguage();

  // Initialize images in static HTML
  initializeHtmlImages();

  const game = new Game();
  const mobileUI = new MobileUI();
  game.start();

  window.game = game;
  window.mobileUI = mobileUI;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch((error) => {
      console.error('Failed to initialize game:', error);
    });
  });
} else {
  init().catch((error) => {
    console.error('Failed to initialize game:', error);
  });
}
