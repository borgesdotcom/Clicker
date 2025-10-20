export class Layout {
  static setupResetButton(onReset: () => void): void {
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (
          confirm(
            'Are you sure you want to reset all progress? This cannot be undone.',
          )
        ) {
          onReset();
        }
      });
    }
  }
}

