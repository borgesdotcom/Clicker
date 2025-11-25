export class AlertDialog {
  private modal: HTMLElement | null = null;
  private resolveCallback: ((value: boolean) => void) | null = null;

  constructor() {
    this.createModal();
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.id = 'alert-dialog';
    this.modal.className = 'alert-dialog';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="alert-dialog-backdrop"></div>
      <div class="alert-dialog-content">
        <div class="alert-dialog-header">
          <h2 class="alert-dialog-title" id="alert-dialog-title">Alert</h2>
        </div>
        <div class="alert-dialog-body">
          <p class="alert-dialog-message" id="alert-dialog-message"></p>
        </div>
        <div class="alert-dialog-buttons" id="alert-dialog-buttons">
          <!-- Buttons will be added dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
  }

  /**
   * Show an alert dialog (single OK button)
   */
  alert(message: string, title: string = 'Alert'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.modal) return;

      const titleEl = this.modal.querySelector('#alert-dialog-title');
      const messageEl = this.modal.querySelector('#alert-dialog-message');
      const buttonsEl = this.modal.querySelector('#alert-dialog-buttons');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;

      if (buttonsEl) {
        buttonsEl.innerHTML = '';
        const okBtn = document.createElement('button');
        okBtn.className = 'alert-dialog-btn alert-dialog-btn-primary';
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', () => {
          this.hide();
          resolve();
        });
        buttonsEl.appendChild(okBtn);
      }

      this.show();
    });
  }

  /**
   * Show a confirm dialog (OK and Cancel buttons)
   */
  confirm(message: string, title: string = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.modal) {
        resolve(false);
        return;
      }

      this.resolveCallback = resolve;

      const titleEl = this.modal.querySelector('#alert-dialog-title');
      const messageEl = this.modal.querySelector('#alert-dialog-message');
      const buttonsEl = this.modal.querySelector('#alert-dialog-buttons');

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;

      if (buttonsEl) {
        buttonsEl.innerHTML = '';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'alert-dialog-btn alert-dialog-btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
          this.hide();
          if (this.resolveCallback) {
            this.resolveCallback(false);
            this.resolveCallback = null;
          }
        });
        buttonsEl.appendChild(cancelBtn);

        const okBtn = document.createElement('button');
        okBtn.className = 'alert-dialog-btn alert-dialog-btn-primary';
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', () => {
          this.hide();
          if (this.resolveCallback) {
            this.resolveCallback(true);
            this.resolveCallback = null;
          }
        });
        buttonsEl.appendChild(okBtn);
      }

      this.show();
    });
  }

  private show(): void {
    if (!this.modal) return;
    document.body.style.overflow = 'hidden';
    this.modal.style.display = 'flex';
    this.modal.classList.add('show');
  }

  private hide(): void {
    if (!this.modal) return;
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.display = 'none';
      }
    }, 300);
  }
}

// Create a singleton instance
export const alertDialog = new AlertDialog();

