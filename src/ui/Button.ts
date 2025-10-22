export class Button {
  private element: HTMLButtonElement;
  private clickHandler: () => void;
  private lastClickTime = 0;
  private clickDelay = 100; // Minimum ms between clicks

  constructor(text: string, onClick: () => void) {
    this.clickHandler = onClick;
    this.element = document.createElement('button');
    this.element.textContent = text;
    this.element.className = 'shop-button';

    // Add throttled click handler
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleClick();
    });

    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.handleClick();
      }
    });
  }

  private handleClick(): void {
    const now = Date.now();
    if (now - this.lastClickTime < this.clickDelay) return;
    if (this.element.disabled) return;

    this.lastClickTime = now;
    this.clickHandler();
  }

  getElement(): HTMLButtonElement {
    return this.element;
  }

  setEnabled(enabled: boolean): void {
    this.element.disabled = !enabled;
  }

  setText(text: string): void {
    this.element.textContent = text;
  }
}
