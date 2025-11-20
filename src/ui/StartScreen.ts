export class StartScreen {
  private container: HTMLElement;
  private onStart: () => void;

  constructor(onStart: () => void) {
    this.onStart = onStart;
    this.container = this.createOverlay();
    this.setupEventListeners();
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'start-screen';
    overlay.className = 'start-screen';

    const content = document.createElement('div');
    content.className = 'start-screen-content';

    const title = document.createElement('h1');
    title.className = 'game-title';
    title.innerHTML = 'BOBBLE';

    const subtitle = document.createElement('p');
    subtitle.className = 'game-subtitle';
    subtitle.textContent = 'The Invasion Begins';

    const startBtn = document.createElement('button');
    startBtn.id = 'start-game-btn';
    startBtn.className = 'start-btn';
    startBtn.innerHTML = '<span class="blink">PRESS START</span>';

    const version = document.createElement('div');
    version.className = 'version-tag';
    version.textContent = 'v1.0.0 RELEASE';

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(startBtn);
    content.appendChild(version);
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    return overlay;
  }

  private setupEventListeners(): void {
    const btn = document.getElementById('start-game-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.hide();
        this.onStart();
      });
    }

    // Also allow clicking anywhere or pressing Enter
    /*
    this.container.addEventListener('click', () => {
      this.hide();
      this.onStart();
    });
    */

    window.addEventListener('keydown', (e) => {
      if (
        this.container.style.display !== 'none' &&
        (e.code === 'Enter' || e.code === 'Space')
      ) {
        this.hide();
        this.onStart();
      }
    });
  }

  public show(): void {
    this.container.style.display = 'flex';
    this.container.style.opacity = '1';
  }

  public hide(): void {
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 500);
  }
}
