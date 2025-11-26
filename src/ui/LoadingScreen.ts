/**
 * Loading Screen Component
 * Displays a loading screen with progress indicator while assets are being loaded
 */
export class LoadingScreen {
  private container: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressText: HTMLElement | null = null;
  private isVisible = false;

  constructor() {
    this.createLoadingScreen();
  }

  /**
   * Create the loading screen HTML structure
   */
  private createLoadingScreen(): void {
    // Check if loading screen already exists
    let container = document.getElementById('loading-screen');
    if (container) {
      this.container = container;
      this.progressBar = document.getElementById('loading-progress-bar');
      this.progressText = document.getElementById('loading-progress-text');
      return;
    }

    // Create loading screen container
    container = document.createElement('div');
    container.id = 'loading-screen';
    container.className = 'loading-screen';

    // Create loading content
    const content = document.createElement('div');
    content.className = 'loading-content';

    // Create title
    const title = document.createElement('h1');
    title.className = 'loading-title';
    title.textContent = 'BOBBLE';
    content.appendChild(title);

    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'loading-subtitle';
    subtitle.textContent = 'Loading...';
    content.appendChild(subtitle);

    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'loading-progress-container';

    // Create progress bar background
    const progressBarBg = document.createElement('div');
    progressBarBg.className = 'loading-progress-bar-bg';

    // Create progress bar fill
    const progressBar = document.createElement('div');
    progressBar.id = 'loading-progress-bar';
    progressBar.className = 'loading-progress-bar';
    progressBarBg.appendChild(progressBar);

    progressContainer.appendChild(progressBarBg);

    // Create progress text
    const progressText = document.createElement('div');
    progressText.id = 'loading-progress-text';
    progressText.className = 'loading-progress-text';
    progressText.textContent = '0%';
    progressContainer.appendChild(progressText);

    content.appendChild(progressContainer);

    container.appendChild(content);
    document.body.appendChild(container);

    this.container = container;
    this.progressBar = progressBar;
    this.progressText = progressText;
  }

  /**
   * Show the loading screen
   */
  show(): void {
    if (this.container && !this.isVisible) {
      this.container.classList.add('visible');
      this.isVisible = true;
    }
  }

  /**
   * Hide the loading screen
   */
  hide(): void {
    if (this.container && this.isVisible) {
      this.container.classList.add('fade-out');
      setTimeout(() => {
        if (this.container) {
          this.container.classList.remove('visible', 'fade-out');
          this.isVisible = false;
        }
      }, 300); // Match CSS transition duration
    }
  }

  /**
   * Update loading progress
   */
  updateProgress(percentage: number): void {
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `${percentage}%`;
    }
  }

  /**
   * Set loading text
   */
  setText(text: string): void {
    const subtitle = this.container?.querySelector('.loading-subtitle');
    if (subtitle) {
      subtitle.textContent = text;
    }
  }
}


