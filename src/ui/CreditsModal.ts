import type { Store } from '../core/Store';
import { Save } from '../core/Save';
import { NumberFormatter } from '../utils/NumberFormatter';
import { images } from '../assets/images';
import { alertDialog } from './AlertDialog';

export class CreditsModal {
  private modal: HTMLElement | null = null;
  private store: Store;
  private sharePreviewCard: HTMLElement | null = null;
  private shareCopyFeedback: HTMLElement | null = null;
  private shareFeedbackTimeout: number | null = null;

  constructor(store: Store) {
    this.store = store;
    this.createModal();
    this.store.subscribe(() => {
      this.updateSharePreview();
    });
  }

  private createModal(): void {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'credits-modal';
    this.modal.className = 'credits-modal';
    this.modal.style.display = 'none';

    // Modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.border = '2px solid #FFFAE5';
    content.style.borderRadius = '0';
    content.style.background = '#000';
    content.style.fontFamily = '"Courier New", monospace';
    content.style.color = '#FFFAE5';

    // Header with title and close button
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.style.borderBottom = '2px solid #FFFAE5';
    header.style.padding = '15px';
    header.style.background = '#3B2D5F';

    const title = document.createElement('h2');
    title.innerHTML = `<img src="${images.graph}" alt="Credits" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 10px; image-rendering: pixelated;" /> CREDITS & SHARE`;
    title.style.fontFamily = '"m5x7", "Courier New", monospace';
    title.style.fontSize = '24px';
    title.style.letterSpacing = '2px';
    title.style.margin = '0';
    title.style.color = '#FFFAE5';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    const closeImg = document.createElement('img');
    closeImg.src = images.menu.close;
    closeImg.alt = 'Close';
    closeBtn.appendChild(closeImg);
    closeBtn.addEventListener('click', () => {
      this.hide();
    });
    header.appendChild(closeBtn);

    content.appendChild(header);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    // Game Info Section
    const gameInfoSection = document.createElement('div');
    gameInfoSection.style.marginBottom = '30px';
    gameInfoSection.style.padding = '20px';
    gameInfoSection.style.background = '#1A122D';
    gameInfoSection.style.border = '2px solid #FFFAE5';

    const gameTitle = document.createElement('h3');
    gameTitle.textContent = 'BOBBLE';
    gameTitle.style.marginBottom = '10px';
    gameTitle.style.color = '#FFFAE5';
    gameTitle.style.fontFamily = '"m5x7", monospace';
    gameTitle.style.fontSize = '32px';
    gameTitle.style.letterSpacing = '2px';
    gameInfoSection.appendChild(gameTitle);

    const gameDesc = document.createElement('p');
    gameDesc.textContent =
      'Pop bubblewrap aliens in the ultimate fake invasion! These bubblewrap creatures are "threatening" your profit margins - pop them all!';
    gameDesc.style.marginBottom = '15px';
    gameDesc.style.lineHeight = '1.6';
    gameDesc.style.color = '#FFFAE5';
    gameDesc.style.fontSize = '14px';
    gameInfoSection.appendChild(gameDesc);

    const version = document.createElement('p');
    version.textContent = 'Release 1.21.0';
    version.style.fontSize = '12px';
    version.style.color = '#999';
    version.style.fontFamily = 'monospace';
    gameInfoSection.appendChild(version);

    modalBody.appendChild(gameInfoSection);

    // Share Section
    const shareSection = document.createElement('div');
    shareSection.style.marginBottom = '30px';
    shareSection.style.padding = '20px';
    shareSection.style.background = '#3B2D5F';
    shareSection.style.border = '2px solid #FFFAE5';
    shareSection.style.position = 'relative';

    // Corner decorations
    const cornerSize = '10px';
    const tl = document.createElement('div');
    tl.style.position = 'absolute';
    tl.style.top = '-2px';
    tl.style.left = '-2px';
    tl.style.width = cornerSize;
    tl.style.height = cornerSize;
    tl.style.borderTop = '4px solid #FFFAE5';
    tl.style.borderLeft = '4px solid #FFFAE5';
    shareSection.appendChild(tl);

    const tr = document.createElement('div');
    tr.style.position = 'absolute';
    tr.style.top = '-2px';
    tr.style.right = '-2px';
    tr.style.width = cornerSize;
    tr.style.height = cornerSize;
    tr.style.borderTop = '4px solid #FFFAE5';
    tr.style.borderRight = '4px solid #FFFAE5';
    shareSection.appendChild(tr);

    const bl = document.createElement('div');
    bl.style.position = 'absolute';
    bl.style.bottom = '-2px';
    bl.style.left = '-2px';
    bl.style.width = cornerSize;
    bl.style.height = cornerSize;
    bl.style.borderBottom = '4px solid #FFFAE5';
    bl.style.borderLeft = '4px solid #FFFAE5';
    shareSection.appendChild(bl);

    const br = document.createElement('div');
    br.style.position = 'absolute';
    br.style.bottom = '-2px';
    br.style.right = '-2px';
    br.style.width = cornerSize;
    br.style.height = cornerSize;
    br.style.borderBottom = '4px solid #FFFAE5';
    br.style.borderRight = '4px solid #FFFAE5';
    shareSection.appendChild(br);

    const shareTitle = document.createElement('h3');
    shareTitle.textContent = 'SHARE YOUR COMMAND CENTER';
    shareTitle.style.marginBottom = '10px';
    shareTitle.style.color = '#FFFAE5';
    shareTitle.style.fontFamily = '"m5x7", monospace';
    shareTitle.style.fontSize = '24px';
    shareTitle.style.letterSpacing = '1px';
    shareSection.appendChild(shareTitle);

    const shareSubtitle = document.createElement('p');
    shareSubtitle.textContent =
      'Your latest BOBBLE feats, wrapped in a holographic stat card ready to flex anywhere.';
    shareSubtitle.style.margin = '0 0 18px';
    shareSubtitle.style.color = '#FFFAE5';
    shareSubtitle.style.fontSize = '14px';
    shareSubtitle.style.lineHeight = '1.5';
    shareSection.appendChild(shareSubtitle);

    const shareCard = document.createElement('div');
    shareCard.style.padding = '20px';
    shareCard.style.background = '#000';
    shareCard.style.border = '2px solid #FFFAE5';
    shareCard.style.marginBottom = '18px';
    shareCard.style.fontFamily = '"Courier New", monospace';
    shareCard.style.position = 'relative';

    // Scanline effect for card
    const scanline = document.createElement('div');
    scanline.style.position = 'absolute';
    scanline.style.top = '0';
    scanline.style.left = '0';
    scanline.style.width = '100%';
    scanline.style.height = '100%';
    scanline.style.background = 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))';
    scanline.style.backgroundSize = '100% 2px, 3px 100%';
    scanline.style.pointerEvents = 'none';
    shareCard.appendChild(scanline);

    this.sharePreviewCard = shareCard;
    this.updateSharePreview();
    shareSection.appendChild(shareCard);

    const shareButtons = document.createElement('div');
    shareButtons.style.display = 'grid';
    shareButtons.style.gap = '12px';
    shareButtons.style.gridTemplateColumns =
      'repeat(auto-fit, minmax(180px, 1fr))';

    // Twitter Share Button
    const twitterBtn = document.createElement('button');
    twitterBtn.className = 'modal-button';
    twitterBtn.innerHTML = 'BROADCAST ON X';
    twitterBtn.style.width = '100%';
    twitterBtn.style.padding = '15px';
    twitterBtn.style.fontSize = '16px';
    twitterBtn.style.background = '#1A122D';
    twitterBtn.style.border = '2px solid #FFFAE5';
    twitterBtn.style.color = '#FFFAE5';
    twitterBtn.style.cursor = 'pointer';
    twitterBtn.style.fontFamily = '"m5x7", monospace';
    twitterBtn.style.letterSpacing = '1px';
    twitterBtn.style.transition = 'all 0.1s';

    twitterBtn.addEventListener('mouseenter', () => {
      twitterBtn.style.background = '#4A3B6F';
      twitterBtn.style.transform = 'translateY(-2px)';
    });
    twitterBtn.addEventListener('mouseleave', () => {
      twitterBtn.style.background = '#1A122D';
      twitterBtn.style.transform = 'translateY(0)';
    });

    twitterBtn.addEventListener('click', () => {
      this.shareOnTwitter();
    });
    shareButtons.appendChild(twitterBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'modal-button';
    copyBtn.innerHTML = 'COPY HOLO-STATS';
    copyBtn.style.width = '100%';
    copyBtn.style.padding = '15px';
    copyBtn.style.fontSize = '16px';
    copyBtn.style.background = '#FFFAE5';
    copyBtn.style.border = '2px solid #FFFAE5';
    copyBtn.style.color = '#1A122D';
    copyBtn.style.fontWeight = 'bold';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.fontFamily = '"m5x7", monospace';
    copyBtn.style.letterSpacing = '1px';
    copyBtn.style.transition = 'all 0.1s';

    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.style.background = '#fff';
      copyBtn.style.transform = 'translateY(-2px)';
    });
    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.style.background = '#FFFAE5';
      copyBtn.style.transform = 'translateY(0)';
    });

    copyBtn.addEventListener('click', () => {
      this.copyShareSummary();
    });
    shareButtons.appendChild(copyBtn);

    shareSection.appendChild(shareButtons);

    const shareHint = document.createElement('p');
    shareHint.textContent =
      'Tip: Drop this card into your Discord squad or socials to recruit more bubblewrap poppers.';
    shareHint.style.fontSize = '12px';
    shareHint.style.color = '#999';
    shareHint.style.textAlign = 'center';
    shareHint.style.marginTop = '14px';
    shareHint.style.lineHeight = '1.6';
    shareHint.style.fontFamily = 'monospace';
    shareSection.appendChild(shareHint);

    const shareFeedback = document.createElement('div');
    shareFeedback.style.marginTop = '10px';
    shareFeedback.style.textAlign = 'center';
    shareFeedback.style.fontSize = '14px';
    shareFeedback.style.color = '#FFFAE5';
    shareFeedback.style.opacity = '0';
    shareFeedback.style.transition = 'opacity 0.3s ease';
    shareFeedback.style.fontFamily = '"m5x7", monospace';
    this.shareCopyFeedback = shareFeedback;
    shareSection.appendChild(shareFeedback);

    modalBody.appendChild(shareSection);

    // Steam Section
    const steamSection = document.createElement('div');
    steamSection.style.marginBottom = '25px';
    steamSection.style.padding = '20px';
    steamSection.style.background = '#1A122D';
    steamSection.style.border = '2px solid #FFFAE5';

    const steamTitle = document.createElement('h3');
    steamTitle.textContent = 'STEAM RELEASE';
    steamTitle.style.marginBottom = '15px';
    steamTitle.style.color = '#FFFAE5';
    steamTitle.style.fontFamily = '"m5x7", monospace';
    steamTitle.style.fontSize = '24px';
    steamTitle.style.letterSpacing = '1px';
    steamSection.appendChild(steamTitle);

    // Steam Wishlist Button
    const steamBtn = document.createElement('button');
    steamBtn.className = 'modal-button';
    steamBtn.innerHTML = 'WISHLIST ON STEAM - COMING SOON!';
    steamBtn.style.width = '100%';
    steamBtn.style.padding = '15px';
    steamBtn.style.fontSize = '16px';
    steamBtn.style.marginBottom = '10px';
    steamBtn.style.background = '#2a475e';
    steamBtn.style.border = '2px solid #66c0f4';
    steamBtn.style.color = '#fff';
    steamBtn.style.cursor = 'pointer';
    steamBtn.style.transition = 'all 0.1s';
    steamBtn.style.position = 'relative';
    steamBtn.style.fontFamily = '"m5x7", monospace';
    steamBtn.style.letterSpacing = '1px';

    // Add "Coming Soon" badge
    const comingSoonBadge = document.createElement('span');
    comingSoonBadge.textContent = 'SOON';
    comingSoonBadge.style.position = 'absolute';
    comingSoonBadge.style.top = '-10px';
    comingSoonBadge.style.right = '10px';
    comingSoonBadge.style.background = '#ff6b6b';
    comingSoonBadge.style.border = '2px solid #fff';
    comingSoonBadge.style.padding = '2px 8px';
    comingSoonBadge.style.fontSize = '12px';
    comingSoonBadge.style.fontWeight = 'bold';
    comingSoonBadge.style.color = '#fff';
    steamBtn.appendChild(comingSoonBadge);

    steamBtn.addEventListener('mouseenter', () => {
      steamBtn.style.background = '#66c0f4';
      steamBtn.style.color = '#1b2838';
      steamBtn.style.transform = 'translateY(-2px)';
    });
    steamBtn.addEventListener('mouseleave', () => {
      steamBtn.style.background = '#2a475e';
      steamBtn.style.color = '#fff';
      steamBtn.style.transform = 'translateY(0)';
    });

    steamBtn.addEventListener('click', async () => {
      // Steam store page - coming soon
      await alertDialog.alert(
        'BOBBLE is coming to Steam soon!\n\nStay tuned for the official announcement and wishlist link!',
        'Steam',
      );
      // When ready, use: window.open('https://store.steampowered.com/app/YOUR_APP_ID', '_blank');
    });

    steamSection.appendChild(steamBtn);

    const steamHint = document.createElement('p');
    steamHint.textContent =
      'Be the first to know when BOBBLE launches on Steam!';
    steamHint.style.fontSize = '12px';
    steamHint.style.color = '#999';
    steamHint.style.textAlign = 'center';
    steamHint.style.marginTop = '5px';
    steamHint.style.fontFamily = 'monospace';
    steamSection.appendChild(steamHint);

    modalBody.appendChild(steamSection);

    // Credits Section
    const creditsSection = document.createElement('div');
    creditsSection.style.marginBottom = '25px';
    creditsSection.style.padding = '15px';
    creditsSection.style.background = '#000';
    creditsSection.style.border = '2px solid #3B2D5F';
    creditsSection.style.textAlign = 'center';

    const creditsText = document.createElement('p');
    creditsText.innerHTML = `
      <strong style="color: #FFFAE5; font-family: 'm5x7', monospace; font-size: 20px;">Game Design & Development</strong><br>
      <span style="color: #999; font-size: 14px;">Built with TypeScript, HTML5 Canvas, and lots of Coffee</span><br><br>
      <strong style="color: #FFFAE5; font-family: 'm5x7', monospace; font-size: 20px;">Special Thanks</strong><br>
      <span style="color: #999; font-size: 14px;">To all players and the incremental games community!</span>
    `;
    creditsText.style.lineHeight = '1.8';
    creditsSection.appendChild(creditsText);

    modalBody.appendChild(creditsSection);
    content.appendChild(modalBody);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

  }

  private buildShareSummary(): {
    headline: string;
    lines: string[];
    shareText: string;
  } {
    const state = this.store.getState();

    const prestigeFragment =
      state.prestigeLevel > 0
        ? ` • Prestige ${state.prestigeLevel.toString()}`
        : '';

    const headline = `Level ${state.level.toString()} • ${state.shipsCount.toString()} ships deployed${prestigeFragment}`;

    const lines: string[] = [
      `Points banked: ${this.prettyNumber(state.points)}`,
      `Aliens popped: ${state.stats.aliensKilled.toLocaleString()}`,
      `Bosses crushed: ${state.stats.bossesKilled.toLocaleString()}`,
      `Upgrades unlocked: ${state.stats.totalUpgrades.toLocaleString()}`,
      `Playtime logged: ${this.formatPlayTime(state.stats.playTime)}`,
    ];

    const shareText = `${headline}\n${lines.join('\n')}`;

    return { headline, lines, shareText };
  }

  private updateSharePreview(): void {
    if (!this.sharePreviewCard) return;

    const summary = this.buildShareSummary();
    // Keep the scanline
    const scanline = this.sharePreviewCard.querySelector('div');
    this.sharePreviewCard.innerHTML = '';
    if (scanline) this.sharePreviewCard.appendChild(scanline);

    const badge = document.createElement('div');
    badge.textContent = 'LIVE FLEET REPORT';
    badge.style.display = 'inline-block';
    badge.style.padding = '4px 8px';
    badge.style.fontSize = '12px';
    badge.style.background = '#FFFAE5';
    badge.style.color = '#000';
    badge.style.marginBottom = '12px';
    badge.style.fontFamily = '"m5x7", monospace';
    badge.style.letterSpacing = '1px';
    badge.style.position = 'relative';
    badge.style.zIndex = '1';
    this.sharePreviewCard.appendChild(badge);

    const headlineEl = document.createElement('div');
    headlineEl.textContent = summary.headline;
    headlineEl.style.fontSize = '16px';
    headlineEl.style.fontWeight = 'bold';
    headlineEl.style.color = '#FFFAE5';
    headlineEl.style.marginBottom = '10px';
    headlineEl.style.position = 'relative';
    headlineEl.style.zIndex = '1';
    this.sharePreviewCard.appendChild(headlineEl);

    const divider = document.createElement('div');
    divider.style.height = '2px';
    divider.style.background = '#3B2D5F';
    divider.style.margin = '10px 0 14px';
    divider.style.position = 'relative';
    divider.style.zIndex = '1';
    this.sharePreviewCard.appendChild(divider);

    for (const line of summary.lines) {
      const lineEl = document.createElement('div');
      lineEl.textContent = `> ${line}`;
      lineEl.style.fontSize = '14px';
      lineEl.style.color = '#ccc';
      lineEl.style.marginBottom = '6px';
      lineEl.style.position = 'relative';
      lineEl.style.zIndex = '1';
      this.sharePreviewCard.appendChild(lineEl);
    }

    const footer = document.createElement('div');
    footer.textContent = '#PopTheProfit • https://bobble-invaders.click/';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.style.marginTop = '12px';
    footer.style.borderTop = '1px dashed #333';
    footer.style.paddingTop = '8px';
    footer.style.position = 'relative';
    footer.style.zIndex = '1';
    this.sharePreviewCard.appendChild(footer);
  }

  private prettyNumber(num: number): string {
    if (!Number.isFinite(num)) return '0';
    if (Math.abs(num) < 1000) {
      return Math.floor(num).toLocaleString();
    }
    return NumberFormatter.format(num);
  }

  private formatPlayTime(seconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${Math.max(1, secs)}s`;
  }

  private copyShareSummary(): void {
    const summary = this.buildShareSummary();
    const gameUrl = window.location.href.split('?')[0] || window.location.href;
    const shareMessage = `BOBBLE Command Center Update\n${summary.shareText}\n\nPop bubblewrap aliens with me:\n${gameUrl}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareMessage)
        .then(() => {
          this.showShareFeedback('Copied cosmic brag to clipboard!');
        })
        .catch(() => {
          const success = this.fallbackCopy(shareMessage);
          this.showShareFeedback(
            success
              ? 'Copied cosmic brag to clipboard!'
              : 'Clipboard blocked - press Ctrl+C to copy.',
            !success,
          );
        });
    } else {
      const success = this.fallbackCopy(shareMessage);
      this.showShareFeedback(
        success
          ? 'Copied cosmic brag to clipboard!'
          : 'Clipboard unsupported - press Ctrl+C to copy.',
        !success,
      );
    }
  }

  private fallbackCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    let success = false;

    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    }

    document.body.removeChild(textarea);
    return success;
  }

  private showShareFeedback(message: string, isError = false): void {
    if (!this.shareCopyFeedback) return;

    if (this.shareFeedbackTimeout !== null) {
      window.clearTimeout(this.shareFeedbackTimeout);
      this.shareFeedbackTimeout = null;
    }

    this.shareCopyFeedback.textContent = message;
    this.shareCopyFeedback.style.color = isError ? '#ff8b8b' : '#FFFAE5';
    this.shareCopyFeedback.style.opacity = '1';

    this.shareFeedbackTimeout = window.setTimeout(() => {
      if (this.shareCopyFeedback) {
        this.shareCopyFeedback.style.opacity = '0';
      }
    }, 2400);
  }

  private shareOnTwitter(): void {
    const summary = this.buildShareSummary();
    const tweetText = `BOBBLE Command Center Update\n${summary.shareText}\n\nJoin the bubblewrap defense force!`;

    const gameUrl = window.location.href.split('?')[0] || window.location.href; // Remove query params
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gameUrl)}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  public async exportSave(): Promise<void> {
    const saveData = Save.export();
    if (!saveData) {
      await alertDialog.alert('No save data found to export!', 'Export Save');
      return;
    }

    // Create a blob and download it
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bobble-save-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    await alertDialog.alert(
      'Save data exported successfully!\n\nSaved as: ' + a.download,
      'Export Save',
    );
  }

  public importSave(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const saveDataString = event.target?.result as string;
          if (!saveDataString) {
            throw new Error('Empty file');
          }

          // Confirm before importing
          const confirmed = await alertDialog.confirm(
            'WARNING: This will replace your current save data!\n\n' +
            'Are you sure you want to continue?',
            'Import Save',
          );

          if (confirmed) {
            try {
              Save.import(saveDataString);
              // Reload game state immediately if game is available (prevents auto-save from overwriting)
              if (window.game && window.game instanceof Object) {
                try {
                  const newState = Save.load();
                  this.store.setState(newState);
                } catch (e) {
                  console.error('Failed to reload state after import:', e);
                }
              }

              await alertDialog.alert(
                'Save data imported successfully!\n\nThe page will reload now.',
                'Import Save',
              );
              // Force immediate reload - the imported data is already properly formatted in localStorage
              window.location.reload();
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              await alertDialog.alert(
                `Failed to import save data!\n\n${errorMessage}\n\nPlease check that the file is valid.`,
                'Import Error',
              );
              console.error('Import error:', error);
            }
          }
        } catch (error) {
          await alertDialog.alert(
            "Error reading save file!\n\nPlease ensure it's a valid save file.",
            'Import Error',
          );
          console.error('Import error:', error);
        }
      };

      reader.readAsText(file);
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  show(): void {
    if (this.modal) {
      document.body.style.overflow = 'hidden';
      this.modal.style.display = 'flex';
      // Use requestAnimationFrame to ensure display is set before animation
      requestAnimationFrame(() => {
        if (this.modal) {
          this.modal.classList.add('show');
        }
      });
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.classList.remove('show');
      document.body.style.overflow = '';
      // Wait for animation to complete
      setTimeout(() => {
        this.modal!.style.display = 'none';
      }, 300);
    }
  }
}
