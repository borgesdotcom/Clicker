import { Game } from './Game';
import { MobileUI } from './ui/MobileUI';
import { i18n } from './core/I18n';
import '../styles.css';
import { initializeHtmlImages } from './utils/imageLoader';
import { AssetPreloader } from './utils/AssetPreloader';
import { LoadingScreen } from './ui/LoadingScreen';

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
  // Show loading screen
  const loadingScreen = new LoadingScreen();
  loadingScreen.show();

  try {
    // Load translations first
    await i18n.loadTranslations();

    // Set HTML lang attribute
    document.documentElement.lang = i18n.getLanguage();

    // Preload all assets
    const preloader = new AssetPreloader();
    await preloader.preloadAll((progress) => {
      loadingScreen.updateProgress(progress.percentage);
    });

    // Initialize images in static HTML (including background)
    initializeHtmlImages();

    // Wait a bit to ensure DOM is fully ready
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Hide loading screen and show game
    loadingScreen.hide();
    const app = document.getElementById('app');
    if (app) {
      app.style.display = 'flex';
    }

    // Small delay to ensure loading screen fade-out completes
    await new Promise((resolve) => setTimeout(resolve, 300));

    const game = new Game();
    const mobileUI = new MobileUI();
    game.start();

    window.game = game;
    window.mobileUI = mobileUI;
  } catch (error) {
    console.error('Failed to initialize game:', error);
    loadingScreen.setText('Failed to load. Please refresh the page.');
    // Still try to show the game even if some assets failed
    const app = document.getElementById('app');
    if (app) {
      app.style.display = 'flex';
    }
  }
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
