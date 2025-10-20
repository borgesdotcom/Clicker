import { Game } from './Game';
import '../styles.css';

function init(): void {
  const game = new Game();
  game.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

