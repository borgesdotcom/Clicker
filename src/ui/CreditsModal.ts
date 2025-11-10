import type { Store } from '../core/Store';
import { Save } from '../core/Save';
import { NumberFormatter } from '../utils/NumberFormatter';

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
    this.modal.className = 'modal';
    this.modal.style.display = 'none';

    // Modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '600px';
    content.style.maxHeight = '85vh';
    content.style.overflowY = 'auto';

    // Title
    const title = document.createElement('h2');
    title.textContent = '🎮 Credits & Share';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    // Game Info Section
    const gameInfoSection = document.createElement('div');
    gameInfoSection.style.marginBottom = '30px';
    gameInfoSection.style.padding = '20px';
    gameInfoSection.style.background = 'rgba(255, 255, 255, 0.05)';
    gameInfoSection.style.borderRadius = '8px';

    const gameTitle = document.createElement('h3');
    gameTitle.textContent = '💥 BOBBLE';
    gameTitle.style.marginBottom = '10px';
    gameTitle.style.color = '#00ff88';
    gameInfoSection.appendChild(gameTitle);

    const gameDesc = document.createElement('p');
    gameDesc.textContent =
      'Pop bubblewrap aliens in the ultimate fake invasion! These bubblewrap creatures are "threatening" your profit margins - pop them all!';
    gameDesc.style.marginBottom = '15px';
    gameDesc.style.lineHeight = '1.6';
    gameDesc.style.color = '#ccc';
    gameInfoSection.appendChild(gameDesc);

    const version = document.createElement('p');
    version.textContent = 'Release Beta 1.10.0';
    version.style.fontSize = '14px';
    version.style.color = '#888';
    gameInfoSection.appendChild(version);

    content.appendChild(gameInfoSection);

    // Share Section
    const shareSection = document.createElement('div');
    shareSection.style.marginBottom = '30px';
    shareSection.style.padding = '22px';
    shareSection.style.background =
      'linear-gradient(135deg, rgba(30, 15, 60, 0.9), rgba(10, 40, 80, 0.85))';
    shareSection.style.borderRadius = '16px';
    shareSection.style.boxShadow =
      '0 20px 45px rgba(0, 0, 0, 0.55), inset 0 0 35px rgba(0, 255, 136, 0.05)';
    shareSection.style.border = '1px solid rgba(0, 255, 136, 0.16)';

    const shareTitle = document.createElement('h3');
    shareTitle.textContent = '🚀 Share Your Command Center';
    shareTitle.style.marginBottom = '6px';
    shareTitle.style.color = '#00ff88';
    shareSection.appendChild(shareTitle);

    const shareSubtitle = document.createElement('p');
    shareSubtitle.textContent =
      'Your latest BOBBLE feats, wrapped in a holographic stat card ready to flex anywhere.';
    shareSubtitle.style.margin = '0 0 18px';
    shareSubtitle.style.color = '#c8f5ff';
    shareSubtitle.style.fontSize = '14px';
    shareSubtitle.style.lineHeight = '1.5';
    shareSection.appendChild(shareSubtitle);

    const shareCard = document.createElement('div');
    shareCard.style.padding = '18px';
    shareCard.style.background =
      'linear-gradient(145deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.2))';
    shareCard.style.borderRadius = '14px';
    shareCard.style.border = '1px solid rgba(0, 255, 136, 0.18)';
    shareCard.style.boxShadow =
      '0 12px 25px rgba(0, 0, 0, 0.45), inset 0 0 25px rgba(0, 255, 255, 0.08)';
    shareCard.style.marginBottom = '18px';
    shareCard.style.fontFamily = '"Courier New", monospace';

    this.sharePreviewCard = shareCard;
    this.updateSharePreview();
    shareSection.appendChild(shareCard);

    const shareButtons = document.createElement('div');
    shareButtons.style.display = 'grid';
    shareButtons.style.gap = '12px';
    shareButtons.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';

    // Twitter Share Button
    const twitterBtn = document.createElement('button');
    twitterBtn.className = 'modal-button';
    twitterBtn.innerHTML = '✨ Broadcast on X (Twitter)';
    twitterBtn.style.width = '100%';
    twitterBtn.style.padding = '15px';
    twitterBtn.style.fontSize = '15px';
    twitterBtn.style.background =
      'linear-gradient(135deg, #1DA1F2 0%, #1a8cd8 100%)';
    twitterBtn.style.border = 'none';
    twitterBtn.style.borderRadius = '10px';
    twitterBtn.style.color = '#fff';
    twitterBtn.style.cursor = 'pointer';
    twitterBtn.style.transition = 'transform 0.2s, box-shadow 0.2s';
    twitterBtn.style.boxShadow = '0 10px 20px rgba(29, 161, 242, 0.3)';

    twitterBtn.addEventListener('mouseenter', () => {
      twitterBtn.style.transform = 'translateY(-2px) scale(1.01)';
      twitterBtn.style.boxShadow = '0 14px 30px rgba(29, 161, 242, 0.4)';
    });
    twitterBtn.addEventListener('mouseleave', () => {
      twitterBtn.style.transform = 'translateY(0) scale(1)';
      twitterBtn.style.boxShadow = '0 10px 20px rgba(29, 161, 242, 0.3)';
    });

    twitterBtn.addEventListener('click', () => {
      this.shareOnTwitter();
    });
    shareButtons.appendChild(twitterBtn);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'modal-button';
    copyBtn.innerHTML = '📋 Copy Holo-Stats';
    copyBtn.style.width = '100%';
    copyBtn.style.padding = '15px';
    copyBtn.style.fontSize = '15px';
    copyBtn.style.background =
      'linear-gradient(135deg, rgba(0, 255, 136, 0.9), rgba(0, 204, 255, 0.9))';
    copyBtn.style.border = 'none';
    copyBtn.style.borderRadius = '10px';
    copyBtn.style.color = '#001a16';
    copyBtn.style.fontWeight = 'bold';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.transition = 'transform 0.2s, box-shadow 0.2s';
    copyBtn.style.boxShadow = '0 10px 24px rgba(0, 255, 136, 0.35)';

    copyBtn.addEventListener('mouseenter', () => {
      copyBtn.style.transform = 'translateY(-2px) scale(1.01)';
      copyBtn.style.boxShadow = '0 14px 30px rgba(0, 255, 204, 0.45)';
    });
    copyBtn.addEventListener('mouseleave', () => {
      copyBtn.style.transform = 'translateY(0) scale(1)';
      copyBtn.style.boxShadow = '0 10px 24px rgba(0, 255, 136, 0.35)';
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
    shareHint.style.color = '#9edffb';
    shareHint.style.textAlign = 'center';
    shareHint.style.marginTop = '14px';
    shareHint.style.lineHeight = '1.6';
    shareSection.appendChild(shareHint);

    const shareFeedback = document.createElement('div');
    shareFeedback.style.marginTop = '10px';
    shareFeedback.style.textAlign = 'center';
    shareFeedback.style.fontSize = '12px';
    shareFeedback.style.color = '#00ffbf';
    shareFeedback.style.opacity = '0';
    shareFeedback.style.transition = 'opacity 0.3s ease';
    this.shareCopyFeedback = shareFeedback;
    shareSection.appendChild(shareFeedback);

    content.appendChild(shareSection);

    // Save Data Section
    const saveSection = document.createElement('div');
    saveSection.style.marginBottom = '25px';

    const saveTitle = document.createElement('h3');
    saveTitle.textContent = '💾 Save Data Management';
    saveTitle.style.marginBottom = '15px';
    saveTitle.style.color = '#00ff88';
    saveSection.appendChild(saveTitle);

    // Export Button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'modal-button';
    exportBtn.innerHTML = '📥 Export Save Data';
    exportBtn.style.width = '100%';
    exportBtn.style.padding = '12px';
    exportBtn.style.fontSize = '14px';
    exportBtn.style.marginBottom = '10px';
    exportBtn.style.background = '#00ff88';
    exportBtn.style.border = 'none';
    exportBtn.style.borderRadius = '8px';
    exportBtn.style.color = '#000';
    exportBtn.style.cursor = 'pointer';
    exportBtn.style.transition = 'all 0.2s';
    exportBtn.style.fontWeight = 'bold';

    exportBtn.addEventListener('mouseenter', () => {
      exportBtn.style.background = '#00cc6f';
      exportBtn.style.transform = 'scale(1.02)';
    });
    exportBtn.addEventListener('mouseleave', () => {
      exportBtn.style.background = '#00ff88';
      exportBtn.style.transform = 'scale(1)';
    });

    exportBtn.addEventListener('click', () => {
      this.exportSave();
    });
    saveSection.appendChild(exportBtn);

    // Import Button
    const importBtn = document.createElement('button');
    importBtn.className = 'modal-button';
    importBtn.innerHTML = '📤 Import Save Data';
    importBtn.style.width = '100%';
    importBtn.style.padding = '12px';
    importBtn.style.fontSize = '14px';
    importBtn.style.marginBottom = '10px';
    importBtn.style.background = '#ffaa00';
    importBtn.style.border = 'none';
    importBtn.style.borderRadius = '8px';
    importBtn.style.color = '#000';
    importBtn.style.cursor = 'pointer';
    importBtn.style.transition = 'all 0.2s';
    importBtn.style.fontWeight = 'bold';

    importBtn.addEventListener('mouseenter', () => {
      importBtn.style.background = '#cc8800';
      importBtn.style.transform = 'scale(1.02)';
    });
    importBtn.addEventListener('mouseleave', () => {
      importBtn.style.background = '#ffaa00';
      importBtn.style.transform = 'scale(1)';
    });

    importBtn.addEventListener('click', () => {
      this.importSave();
    });
    saveSection.appendChild(importBtn);

    const saveHint = document.createElement('p');
    saveHint.textContent =
      'Backup your progress or transfer it between devices';
    saveHint.style.fontSize = '12px';
    saveHint.style.color = '#888';
    saveHint.style.textAlign = 'center';
    saveHint.style.marginTop = '5px';
    saveSection.appendChild(saveHint);

    content.appendChild(saveSection);

    // Steam Section
    const steamSection = document.createElement('div');
    steamSection.style.marginBottom = '25px';

    const steamTitle = document.createElement('h3');
    steamTitle.textContent = '🎮 Steam Release';
    steamTitle.style.marginBottom = '15px';
    steamTitle.style.color = '#00ff88';
    steamSection.appendChild(steamTitle);

    // Steam Wishlist Button
    const steamBtn = document.createElement('button');
    steamBtn.className = 'modal-button';
    steamBtn.innerHTML = '💙 Wishlist on Steam - Coming Soon!';
    steamBtn.style.width = '100%';
    steamBtn.style.padding = '15px';
    steamBtn.style.fontSize = '16px';
    steamBtn.style.marginBottom = '10px';
    steamBtn.style.background =
      'linear-gradient(90deg, #1b2838 0%, #2a475e 100%)';
    steamBtn.style.border = 'none';
    steamBtn.style.borderRadius = '8px';
    steamBtn.style.color = '#fff';
    steamBtn.style.cursor = 'pointer';
    steamBtn.style.transition = 'all 0.2s';
    steamBtn.style.position = 'relative';
    steamBtn.style.overflow = 'hidden';

    // Add "Coming Soon" badge
    const comingSoonBadge = document.createElement('span');
    comingSoonBadge.textContent = '🚀 SOON';
    comingSoonBadge.style.position = 'absolute';
    comingSoonBadge.style.top = '5px';
    comingSoonBadge.style.right = '10px';
    comingSoonBadge.style.background = '#ff6b6b';
    comingSoonBadge.style.padding = '2px 8px';
    comingSoonBadge.style.borderRadius = '4px';
    comingSoonBadge.style.fontSize = '10px';
    comingSoonBadge.style.fontWeight = 'bold';
    comingSoonBadge.style.animation = 'pulse 2s ease-in-out infinite';
    steamBtn.appendChild(comingSoonBadge);

    steamBtn.addEventListener('mouseenter', () => {
      steamBtn.style.background =
        'linear-gradient(90deg, #2a475e 0%, #1b2838 100%)';
      steamBtn.style.transform = 'scale(1.02)';
    });
    steamBtn.addEventListener('mouseleave', () => {
      steamBtn.style.background =
        'linear-gradient(90deg, #1b2838 0%, #2a475e 100%)';
      steamBtn.style.transform = 'scale(1)';
    });

    steamBtn.addEventListener('click', () => {
      // Steam store page - coming soon
      alert(
        '🎮 BOBBLE is coming to Steam soon!\n\nStay tuned for the official announcement and wishlist link!',
      );
      // When ready, use: window.open('https://store.steampowered.com/app/YOUR_APP_ID', '_blank');
    });

    steamSection.appendChild(steamBtn);

    const steamHint = document.createElement('p');
    steamHint.textContent =
      'Be the first to know when BOBBLE launches on Steam!';
    steamHint.style.fontSize = '12px';
    steamHint.style.color = '#888';
    steamHint.style.textAlign = 'center';
    steamHint.style.marginTop = '5px';
    steamSection.appendChild(steamHint);

    content.appendChild(steamSection);

    // Credits Section
    const creditsSection = document.createElement('div');
    creditsSection.style.marginBottom = '25px';
    creditsSection.style.padding = '15px';
    creditsSection.style.background = 'rgba(255, 255, 255, 0.03)';
    creditsSection.style.borderRadius = '8px';
    creditsSection.style.textAlign = 'center';

    const creditsText = document.createElement('p');
    creditsText.innerHTML = `
      <strong style="color: #00ff88;">Game Design & Development</strong><br>
      <span style="color: #888; font-size: 14px;">Built with TypeScript, HTML5 Canvas, and lots of ☕</span><br><br>
      <strong style="color: #00ff88;">Special Thanks</strong><br>
      <span style="color: #888; font-size: 14px;">To all players and the incremental games community!</span>
    `;
    creditsText.style.lineHeight = '1.8';
    creditsSection.appendChild(creditsText);

    content.appendChild(creditsSection);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'modal-button';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '12px';
    closeBtn.style.fontSize = '16px';
    closeBtn.addEventListener('click', () => {
      this.hide();
    });
    content.appendChild(closeBtn);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
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
    this.sharePreviewCard.innerHTML = '';

    const badge = document.createElement('div');
    badge.textContent = 'LIVE FLEET REPORT';
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.padding = '4px 10px';
    badge.style.fontSize = '11px';
    badge.style.letterSpacing = '0.08em';
    badge.style.borderRadius = '999px';
    badge.style.background =
      'linear-gradient(135deg, rgba(0, 255, 136, 0.35), rgba(0, 204, 255, 0.35))';
    badge.style.color = '#cafff6';
    badge.style.marginBottom = '12px';
    badge.style.width = 'fit-content';
    this.sharePreviewCard.appendChild(badge);

    const headlineEl = document.createElement('div');
    headlineEl.textContent = summary.headline;
    headlineEl.style.fontSize = '16px';
    headlineEl.style.fontWeight = '700';
    headlineEl.style.color = '#f0fff7';
    headlineEl.style.marginBottom = '10px';
    this.sharePreviewCard.appendChild(headlineEl);

    const divider = document.createElement('div');
    divider.style.height = '1px';
    divider.style.background =
      'linear-gradient(90deg, rgba(0, 255, 136, 0.0), rgba(0, 255, 136, 0.55), rgba(0, 255, 136, 0))';
    divider.style.margin = '10px 0 14px';
    this.sharePreviewCard.appendChild(divider);

    for (const line of summary.lines) {
      const lineEl = document.createElement('div');
      lineEl.textContent = line;
      lineEl.style.fontSize = '13px';
      lineEl.style.color = '#d7fff2';
      lineEl.style.marginBottom = '6px';
      this.sharePreviewCard.appendChild(lineEl);
    }

    const footer = document.createElement('div');
    footer.textContent = '#PopTheProfit • https://bobble-invaders.click/';
    footer.style.fontSize = '11px';
    footer.style.color = '#9ce0ff';
    footer.style.marginTop = '6px';
    footer.style.opacity = '0.85';
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
    const gameUrl =
      window.location.href.split('?')[0] || window.location.href;
    const shareMessage = `💥 BOBBLE Command Center Update\n${summary.shareText}\n\nPop bubblewrap aliens with me:\n${gameUrl}`;

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
              : 'Clipboard blocked — press Ctrl+C to copy.',
            !success,
          );
        });
    } else {
      const success = this.fallbackCopy(shareMessage);
      this.showShareFeedback(
        success
          ? 'Copied cosmic brag to clipboard!'
          : 'Clipboard unsupported — press Ctrl+C to copy.',
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
    this.shareCopyFeedback.style.color = isError ? '#ff8b8b' : '#00ffbf';
    this.shareCopyFeedback.style.opacity = '1';

    this.shareFeedbackTimeout = window.setTimeout(() => {
      if (this.shareCopyFeedback) {
        this.shareCopyFeedback.style.opacity = '0';
      }
    }, 2400);
  }

  private shareOnTwitter(): void {
    const summary = this.buildShareSummary();
    const tweetText = `💥 BOBBLE Command Center Update\n${summary.shareText}\n\nJoin the bubblewrap defense force! 🛡️`;

    const gameUrl =
      window.location.href.split('?')[0] || window.location.href; // Remove query params
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gameUrl)}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  private exportSave(): void {
    const saveData = Save.export();
    if (!saveData) {
      alert('❌ No save data found to export!');
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
    alert('✅ Save data exported successfully!\n\nSaved as: ' + a.download);
  }

  private importSave(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const saveDataString = event.target?.result as string;
          if (!saveDataString) {
            throw new Error('Empty file');
          }

          // Confirm before importing
          const confirmed = confirm(
            '⚠️ WARNING: This will replace your current save data!\n\n' +
              'Are you sure you want to continue?',
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

              alert(
                '✅ Save data imported successfully!\n\nThe page will reload now.',
              );
              // Force immediate reload - the imported data is already properly formatted in localStorage
              window.location.reload();
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              alert(
                `❌ Failed to import save data!\n\n${errorMessage}\n\nPlease check that the file is valid.`,
              );
              console.error('Import error:', error);
            }
          }
        } catch (error) {
          alert(
            "❌ Error reading save file!\n\nPlease ensure it's a valid save file.",
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
      this.modal.style.display = 'flex';
      // Trigger animation
      requestAnimationFrame(() => {
        this.modal?.classList.add('show');
      });
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.classList.remove('show');
      // Wait for animation to complete
      setTimeout(() => {
        this.modal!.style.display = 'none';
      }, 300);
    }
  }
}
