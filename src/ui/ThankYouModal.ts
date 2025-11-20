export class ThankYouModal {
  private modal: HTMLElement | null = null;

  constructor() {
    this.createModal();
  }

  private createModal(): void {
    // Create modal container (matches other modals)
    this.modal = document.createElement('div');
    this.modal.id = 'thank-you-modal';
    this.modal.className = 'modal';
    this.modal.style.display = 'none';

    // Modal content (matches game's modal styling)
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '700px';
    content.style.textAlign = 'center';
    content.style.padding = '40px';

    // Title (matches modal-header styling)
    const title = document.createElement('h2');
    title.textContent = '🌟 Thank You for Playing! 🌟';
    title.style.marginBottom = '20px';
    title.style.color = '#fffae5';
    title.style.fontSize = '32px';
    title.style.fontWeight = 'normal';
    title.style.textShadow =
      '2px 2px 0 rgba(0, 0, 0, 1), -1px -1px 0 rgba(0, 0, 0, 0.8)';
    title.style.fontFamily = 'var(--font-family)';
    title.style.textTransform = 'uppercase';
    title.style.letterSpacing = '1px';
    content.appendChild(title);

    // Thank you message
    const message = document.createElement('p');
    message.textContent =
      'Congratulations on your first ascension! Your journey has just begun.';
    message.style.marginBottom = '30px';
    message.style.color = '#ffffff';
    message.style.fontSize = '18px';
    message.style.lineHeight = '1.6';
    content.appendChild(message);

    // Discord section
    const discordSection = document.createElement('div');
    discordSection.style.marginBottom = '30px';
    discordSection.style.padding = '25px';
    discordSection.style.background = 'rgba(255, 255, 255, 0.05)';
    discordSection.style.border = '1px solid rgba(255, 255, 255, 0.3)';

    const discordTitle = document.createElement('h3');
    discordTitle.textContent = '💬 Join Our Discord Community';
    discordTitle.style.marginBottom = '15px';
    discordTitle.style.color = '#fffae5';
    discordTitle.style.fontSize = '22px';
    discordTitle.style.fontFamily = 'var(--font-family)';
    discordSection.appendChild(discordTitle);

    const discordMessage = document.createElement('p');
    discordMessage.textContent =
      'Help us improve the game! Share your feedback, report bugs, suggest features, and connect with other players.';
    discordMessage.style.marginBottom = '20px';
    discordMessage.style.color = '#cccccc';
    discordMessage.style.fontSize = '16px';
    discordMessage.style.lineHeight = '1.5';
    discordSection.appendChild(discordMessage);

    // Discord button (uses modal-button class)
    const discordButton = document.createElement('a');
    discordButton.href = 'https://discord.gg/bfxYsvnw2S';
    discordButton.target = '_blank';
    discordButton.rel = 'noopener noreferrer';
    discordButton.className = 'modal-button';
    discordButton.textContent = '🚀 Join Discord';
    discordButton.style.display = 'inline-block';
    discordButton.style.textDecoration = 'none';

    discordSection.appendChild(discordButton);
    content.appendChild(discordSection);

    // Continue Playing button (uses modal-button class)
    const continueButton = document.createElement('button');
    continueButton.className = 'modal-button';
    continueButton.textContent = 'Continue Playing';
    continueButton.style.display = 'block';
    continueButton.style.width = '100%';
    continueButton.style.marginTop = '20px';
    continueButton.style.fontSize = '18px';
    continueButton.style.padding = '15px 30px';

    continueButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      this.hide();
    });

    content.appendChild(continueButton);
    this.modal.appendChild(content);

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Prevent content clicks from closing modal
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);
  }

  public show(): void {
    if (!this.modal) {
      console.error('ThankYouModal: modal element not found');
      return;
    }

    // Ensure modal is in the DOM
    if (!document.body.contains(this.modal)) {
      document.body.appendChild(this.modal);
    }

    // Show modal (matches other modals pattern)
    this.modal.style.display = 'flex';
    // Trigger animation using requestAnimationFrame (matches other modals)
    requestAnimationFrame(() => {
      if (this.modal) {
        this.modal.classList.add('show');
      }
    });
  }

  public hide(): void {
    if (!this.modal) return;

    // Remove show class to trigger fade out animation (matches other modals)
    this.modal.classList.remove('show');
    // Wait for animation to complete before hiding (matches other modals)
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    }, 300);
  }

  public isVisible(): boolean {
    return this.modal?.style.display !== 'none';
  }
}

