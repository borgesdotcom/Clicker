import type { Store } from '../core/Store';

export class CreditsModal {
  private modal: HTMLElement | null = null;
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    this.createModal();
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
    version.textContent = 'Version 0.0.3 - Alpha Update';
    version.style.fontSize = '14px';
    version.style.color = '#888';
    gameInfoSection.appendChild(version);

    content.appendChild(gameInfoSection);

    // Share Section
    const shareSection = document.createElement('div');
    shareSection.style.marginBottom = '25px';

    const shareTitle = document.createElement('h3');
    shareTitle.textContent = '📢 Share Your Progress';
    shareTitle.style.marginBottom = '15px';
    shareTitle.style.color = '#00ff88';
    shareSection.appendChild(shareTitle);

    // Twitter Share Button
    const twitterBtn = document.createElement('button');
    twitterBtn.className = 'modal-button';
    twitterBtn.innerHTML = '🐦 Share on Twitter (X)';
    twitterBtn.style.width = '100%';
    twitterBtn.style.padding = '15px';
    twitterBtn.style.fontSize = '16px';
    twitterBtn.style.marginBottom = '10px';
    twitterBtn.style.background = '#1DA1F2';
    twitterBtn.style.border = 'none';
    twitterBtn.style.borderRadius = '8px';
    twitterBtn.style.color = '#fff';
    twitterBtn.style.cursor = 'pointer';
    twitterBtn.style.transition = 'all 0.2s';

    twitterBtn.addEventListener('mouseenter', () => {
      twitterBtn.style.background = '#1a8cd8';
      twitterBtn.style.transform = 'scale(1.02)';
    });
    twitterBtn.addEventListener('mouseleave', () => {
      twitterBtn.style.background = '#1DA1F2';
      twitterBtn.style.transform = 'scale(1)';
    });

    twitterBtn.addEventListener('click', () => {
      this.shareOnTwitter();
    });

    shareSection.appendChild(twitterBtn);

    const shareHint = document.createElement('p');
    shareHint.textContent =
      'Share your stats and achievements with your friends!';
    shareHint.style.fontSize = '12px';
    shareHint.style.color = '#888';
    shareHint.style.textAlign = 'center';
    shareHint.style.marginTop = '5px';
    shareSection.appendChild(shareHint);

    content.appendChild(shareSection);

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
      // TODO: Replace with actual Steam store page URL when available
      // For now, show a message
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

    // GitHub Section
    const githubSection = document.createElement('div');
    githubSection.style.marginBottom = '25px';

    const githubTitle = document.createElement('h3');
    githubTitle.textContent = '💻 Development';
    githubTitle.style.marginBottom = '15px';
    githubTitle.style.color = '#00ff88';
    githubSection.appendChild(githubTitle);

    // GitHub Follow Button
    const githubBtn = document.createElement('button');
    githubBtn.className = 'modal-button';
    githubBtn.innerHTML = '⭐ Follow on GitHub';
    githubBtn.style.width = '100%';
    githubBtn.style.padding = '15px';
    githubBtn.style.fontSize = '16px';
    githubBtn.style.marginBottom = '10px';
    githubBtn.style.background = '#24292e';
    githubBtn.style.border = 'none';
    githubBtn.style.borderRadius = '8px';
    githubBtn.style.color = '#fff';
    githubBtn.style.cursor = 'pointer';
    githubBtn.style.transition = 'all 0.2s';

    githubBtn.addEventListener('mouseenter', () => {
      githubBtn.style.background = '#1b1f23';
      githubBtn.style.transform = 'scale(1.02)';
    });
    githubBtn.addEventListener('mouseleave', () => {
      githubBtn.style.background = '#24292e';
      githubBtn.style.transform = 'scale(1)';
    });

    githubBtn.addEventListener('click', () => {
      window.open('https://github.com/borgesdotcom', '_blank');
    });

    githubSection.appendChild(githubBtn);

    const githubHint = document.createElement('p');
    githubHint.textContent = 'Check out more projects and follow for updates!';
    githubHint.style.fontSize = '12px';
    githubHint.style.color = '#888';
    githubHint.style.textAlign = 'center';
    githubHint.style.marginTop = '5px';
    githubSection.appendChild(githubHint);

    content.appendChild(githubSection);

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

  private shareOnTwitter(): void {
    const state = this.store.getState();

    // Format large numbers for readability
    const formatNumber = (num: number): string => {
      if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
      return Math.floor(num).toString();
    };

    // Build stats message
    const stats = [
      `Level ${state.level.toString()}`,
      `${formatNumber(state.points)} Points`,
      `${state.shipsCount.toString()} Ships`,
      state.prestigeLevel > 0
        ? `Prestige ${state.prestigeLevel.toString()}`
        : null,
      `${state.stats.aliensKilled.toLocaleString()} Aliens Destroyed`,
      state.stats.bossesKilled > 0
        ? `${state.stats.bossesKilled.toString()} Bosses Defeated`
        : null,
    ]
      .filter((item): item is string => item !== null)
      .join(' | ');

    const tweetText = `💥 I'm playing BOBBLE!\n\n${stats}\n\nJoin me in popping bubblewrap aliens for profit! 🛸`;

    const gameUrl = window.location.href.split('?')[0] || window.location.href; // Remove query params
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gameUrl)}`;

    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  show(): void {
    if (this.modal) {
      this.modal.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}
