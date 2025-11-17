/**
 * Utility to load and set images in HTML elements after page load
 * This ensures images in index.html work correctly in production
 */
import { images } from '../assets/images';

export function initializeHtmlImages(): void {
  // Update images in index.html that are set statically
  const achievementsBtn = document.getElementById('achievements-btn');
  if (achievementsBtn) {
    const img = achievementsBtn.querySelector('img');
    if (img) img.src = images.menu.achievements;
  }

  const statsBtn = document.getElementById('stats-btn');
  if (statsBtn) {
    const img = statsBtn.querySelector('img');
    if (img) img.src = images.menu.statistic;
  }

  const mobileMenuClose = document.getElementById('mobile-menu-close');
  if (mobileMenuClose) {
    const img = mobileMenuClose.querySelector('img');
    if (img) img.src = images.menu.close;
  }

  const mobileShopClose = document.getElementById('mobile-shop-close');
  if (mobileShopClose) {
    const img = mobileShopClose.querySelector('img');
    if (img) img.src = images.menu.close;
  }

  const desktopShopToggle = document.getElementById('desktop-shop-toggle');
  if (desktopShopToggle) {
    const img = desktopShopToggle.querySelector('img');
    if (img) img.src = images.menu.left;
  }

  // Set initial background GIF on game-container
  // Note: This will be overridden by updateBackgroundByLevel in Game.ts
  // but we set it here as a fallback
  const setBackground = () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && images.backgroundGif) {
      // Set background image with all necessary properties
      const bgUrl = images.backgroundGif;
      gameContainer.style.backgroundImage = `url("${bgUrl}")`;
      gameContainer.style.backgroundRepeat = 'repeat';
      gameContainer.style.backgroundSize = 'auto';
      gameContainer.style.backgroundColor = '#000';
      
      // Also set as CSS custom property for fallback
      gameContainer.style.setProperty('--bg-gif-url', `url("${bgUrl}")`);
      
      console.log('Initial background GIF set:', bgUrl);
      return true;
    }
    return false;
  };

  // Try immediately
  if (!setBackground()) {
    // If not ready, try with requestAnimationFrame
    requestAnimationFrame(() => {
      if (!setBackground()) {
        // Last resort: try after a short delay
        setTimeout(() => {
          setBackground();
        }, 100);
        setTimeout(() => {
          setBackground();
        }, 500);
      }
    });
  }

  // Load font dynamically
  const fontUrl = new URL('../animations/m5x7.ttf', import.meta.url).href;
  const fontFace = new FontFace('m5x7', `url(${fontUrl})`, {
    style: 'normal',
    weight: 'normal',
    display: 'swap',
  });
  fontFace.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
  }).catch((error) => {
    console.warn('Failed to load m5x7 font:', error);
  });
}


