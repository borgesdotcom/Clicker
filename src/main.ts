import { Game } from './Game';
import { MobileUI } from './ui/MobileUI';
import '../styles.css';

function init(): void {
  const game = new Game();
  const mobileUI = new MobileUI();
  game.start();

  (window as any).game = game;
  (window as any).mobileUI = mobileUI;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
