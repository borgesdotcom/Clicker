/**
 * Utility to dynamically load/unload the old CSS stylesheet
 */

let oldStylesheetLink: HTMLLinkElement | null = null;

/**
 * Load the old CSS stylesheet
 */
export function loadOldStylesheet(): void {
  // Don't load if already loaded
  if (oldStylesheetLink) {
    return;
  }

  // Find the main stylesheet to insert after it
  const mainStylesheet = document.querySelector('link[href="/styles.css"]') as HTMLLinkElement;
  
  // Create new link element for old stylesheet
  oldStylesheetLink = document.createElement('link');
  oldStylesheetLink.rel = 'stylesheet';
  oldStylesheetLink.href = '/stylesOld.css';
  oldStylesheetLink.id = 'old-stylesheet';
  
  // Insert after main stylesheet or in head
  if (mainStylesheet && mainStylesheet.parentNode) {
    mainStylesheet.parentNode.insertBefore(oldStylesheetLink, mainStylesheet.nextSibling);
  } else {
    document.head.appendChild(oldStylesheetLink);
  }
}

/**
 * Unload the old CSS stylesheet
 */
export function unloadOldStylesheet(): void {
  if (oldStylesheetLink) {
    oldStylesheetLink.remove();
    oldStylesheetLink = null;
  }
}

/**
 * Toggle the old CSS stylesheet based on enabled state
 */
export function toggleOldStylesheet(enabled: boolean): void {
  if (enabled) {
    loadOldStylesheet();
  } else {
    unloadOldStylesheet();
  }
}

