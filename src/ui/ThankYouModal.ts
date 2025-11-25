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
    content.style.background = '#000';
    content.style.border = '2px solid #FFFAE5';
    content.style.borderRadius = '0';

    // Title (matches modal-header styling)
    const title = document.createElement('h2');
    title.textContent = 'THANK YOU FOR PLAYING!';
    title.style.marginBottom = '20px';
    title.style.color = '#FFFAE5';
    title.style.fontSize = '32px';
    title.style.fontWeight = 'normal';
    title.style.fontFamily = '"m5x7", "Courier New", monospace';
    title.style.textTransform = 'uppercase';
    title.style.letterSpacing = '2px';
    content.appendChild(title);

    // Thank you message
    const message = document.createElement('p');
    message.textContent =
      'Congratulations on your first ascension! Your journey has just begun.';
    message.style.marginBottom = '30px';
    message.style.color = '#FFFAE5';
    message.style.fontSize = '18px';
    message.style.lineHeight = '1.6';
    message.style.fontFamily = '"Courier New", monospace';
    content.appendChild(message);

    // Discord section
    const discordSection = document.createElement('div');
    discordSection.style.marginBottom = '30px';
    discordSection.style.padding = '25px';
    discordSection.style.background = '#1A122D';
    discordSection.style.border = '2px solid #FFFAE5';

    const discordTitle = document.createElement('h3');
    discordTitle.textContent = 'JOIN OUR DISCORD COMMUNITY';
    discordTitle.style.marginBottom = '15px';
    discordTitle.style.color = '#FFFAE5';
    discordTitle.style.fontSize = '22px';
    discordTitle.style.fontFamily = '"m5x7", monospace';
    discordTitle.style.letterSpacing = '1px';
    discordSection.appendChild(discordTitle);

    const discordMessage = document.createElement('p');
    discordMessage.textContent =
      'Help us improve the game! Share your feedback, report bugs, suggest features, and connect with other players.';
    discordMessage.style.marginBottom = '20px';
    discordMessage.style.color = '#ccc';
    discordMessage.style.fontSize = '16px';
    discordMessage.style.lineHeight = '1.5';
    discordMessage.style.fontFamily = '"Courier New", monospace';
    discordSection.appendChild(discordMessage);

    // Discord button (uses modal-button class)
    const discordButton = document.createElement('a');
    discordButton.href = 'https://discord.gg/bfxYsvnw2S';
    discordButton.target = '_blank';
    discordButton.rel = 'noopener noreferrer';
    discordButton.className = 'modal-button';
    discordButton.textContent = 'JOIN DISCORD';
    discordButton.style.display = 'inline-block';
    discordButton.style.textDecoration = 'none';
    discordButton.style.fontFamily = '"m5x7", monospace';
    discordButton.style.letterSpacing = '1px';
    discordButton.style.background = '#3B2D5F';
    discordButton.style.border = '2px solid #FFFAE5';
    discordButton.style.color = '#FFFAE5';
    discordButton.style.padding = '10px 20px';
    discordButton.style.transition = 'all 0.1s';

    discordButton.addEventListener('mouseenter', () => {
      discordButton.style.background = '#4A3B6F';
      discordButton.style.transform = 'translateY(-2px)';
    });
    discordButton.addEventListener('mouseleave', () => {
      discordButton.style.background = '#3B2D5F';
      discordButton.style.transform = 'translateY(0)';
    });

    discordSection.appendChild(discordButton);
    content.appendChild(discordSection);

    // Continue Playing button (uses modal-button class)
    const continueButton = document.createElement('button');
    continueButton.className = 'modal-button';
    continueButton.textContent = 'CONTINUE PLAYING';
    continueButton.style.display = 'block';
    continueButton.style.width = '100%';
    continueButton.style.marginTop = '20px';
    continueButton.style.fontSize = '20px';
    continueButton.style.padding = '15px 30px';
    continueButton.style.fontFamily = '"m5x7", monospace';
    continueButton.style.letterSpacing = '1px';
    continueButton.style.background = '#FFFAE5';
    continueButton.style.border = '2px solid #FFFAE5';
    continueButton.style.color = '#1A122D';
    continueButton.style.fontWeight = 'bold';
    continueButton.style.cursor = 'pointer';
    continueButton.style.transition = 'all 0.1s';

    continueButton.addEventListener('mouseenter', () => {
      continueButton.style.background = '#fff';
      continueButton.style.transform = 'translateY(-2px)';
    });
    continueButton.addEventListener('mouseleave', () => {
      continueButton.style.background = '#FFFAE5';
      continueButton.style.transform = 'translateY(0)';
    });

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
