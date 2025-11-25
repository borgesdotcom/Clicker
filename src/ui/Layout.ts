// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Layout {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  static setupResetButton(onReset: () => void): void {
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const { alertDialog } = await import('./AlertDialog');
        const confirmed = await alertDialog.confirm(
          'Are you sure you want to reset all progress? This cannot be undone.',
          'Reset Progress',
        );
        if (confirmed) {
          onReset();
        }
      });
    }
  }
}
