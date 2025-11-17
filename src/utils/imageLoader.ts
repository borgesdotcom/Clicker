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

  // Set background GIF on game-container
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.style.backgroundImage = `url(${images.backgroundGif})`;
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


