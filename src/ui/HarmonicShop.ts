import type { HarmonicSystem } from '../systems/HarmonicSystem';
import type { Store } from '../core/Store';
import type { SoundManager } from '../systems/SoundManager';

export class HarmonicShop {
  private modal: HTMLElement | null = null;
  private harmonicSystem: HarmonicSystem;
  private store: Store;
  private soundManager: SoundManager | null = null;

  constructor(harmonicSystem: HarmonicSystem, store: Store) {
    this.harmonicSystem = harmonicSystem;
    this.store = store;
    this.createModal();
    
    // Subscribe to store changes to update the shop
    this.store.subscribe(() => {
      if (this.modal && this.modal.style.display === 'flex') {
        this.updateContent();
      }
    });
  }

  setSoundManager(soundManager: SoundManager): void {
    this.soundManager = soundManager;
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.id = 'harmonic-shop-modal';
    this.modal.className = 'modal';
    this.modal.style.display = 'none';

    // Modal will be populated in updateContent
    document.body.appendChild(this.modal);

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  private updateContent(): void {
    if (!this.modal) return;

    this.modal.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxWidth = '700px';
    content.style.maxHeight = '85vh';
    content.style.overflowY = 'auto';
    content.style.overflowX = 'hidden';

    // Title
    const title = document.createElement('h2');
    title.textContent = '🎵 Harmonic Resonance Shop';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    content.appendChild(title);

    // Description
    const desc = document.createElement('p');
    desc.textContent = 'Master the rhythm to multiply your power! Click in sync with the ripple beats for Perfect hits.';
    desc.style.fontSize = '14px';
    desc.style.color = '#aaa';
    desc.style.marginBottom = '20px';
    desc.style.textAlign = 'center';
    content.appendChild(desc);

    // Current stats
    const state = this.harmonicSystem.getState();
    const statsBox = document.createElement('div');
    statsBox.style.cssText = 'background: rgba(0,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #0ff;';
    
    const streakInfo = document.createElement('div');
    streakInfo.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 8px;">Current Streak: <span style="color: #0ff; font-weight: bold;">${state.streak}</span></div>
      <div style="font-size: 14px; color: #aaa;">Streak Multiplier: <span style="color: #0ff;">${this.harmonicSystem.getStreakMultiplier().toFixed(2)}x</span></div>
      <div style="font-size: 14px; color: #aaa; margin-top: 5px;">Timing Window: <span style="color: #0ff;">±${this.harmonicSystem.getTimingWindow()}ms</span></div>
    `;
    statsBox.appendChild(streakInfo);
    content.appendChild(statsBox);

    // Point-based upgrades section
    const pointUpgradesSection = document.createElement('div');
    pointUpgradesSection.style.marginBottom = '25px';

    const pointTitle = document.createElement('h3');
    pointTitle.textContent = '💰 Point Upgrades';
    pointTitle.style.marginBottom = '15px';
    pointTitle.style.borderBottom = '2px solid #666';
    pointTitle.style.paddingBottom = '8px';
    pointUpgradesSection.appendChild(pointTitle);

    // Tuning Fork
    pointUpgradesSection.appendChild(this.createUpgradeCard(
      '🎚️ Tuning Fork',
      `Level ${state.tuningForkLevel}`,
      'Widens the timing window for easier Perfect hits',
      `+10ms window (current: ±${this.harmonicSystem.getTimingWindow()}ms)`,
      this.harmonicSystem.getTuningForkCost(),
      () => {
        const gameState = this.store.getState();
        if (this.harmonicSystem.buyTuningFork(gameState)) {
          this.store.setState(gameState);
          this.soundManager?.playPurchase();
          this.updateContent();
        }
      },
      'points'
    ));

    // Metronome
    if (!state.metronomePurchased) {
      pointUpgradesSection.appendChild(this.createUpgradeCard(
        '⏱️ Metronome',
        'Not Purchased',
        'Adds visual timing indicators and audio cues',
        'Makes rhythm timing much easier to follow',
        300,
        () => {
          const gameState = this.store.getState();
          if (this.harmonicSystem.buyMetronome(gameState)) {
            this.store.setState(gameState);
            this.soundManager?.playPurchase();
            this.updateContent();
          }
        },
        'points'
      ));
    } else {
      const ownedCard = document.createElement('div');
      ownedCard.style.cssText = 'padding: 12px; background: rgba(0,255,0,0.1); border: 2px solid #0f0; border-radius: 8px; margin-bottom: 12px;';
      ownedCard.innerHTML = '<div style="font-size: 16px;">⏱️ Metronome - <span style="color: #0f0;">OWNED</span></div>';
      pointUpgradesSection.appendChild(ownedCard);
    }

    // Chorus
    pointUpgradesSection.appendChild(this.createUpgradeCard(
      '🎼 Chorus',
      `Level ${state.chorusLevel}`,
      'Each Perfect hit adds extra echo lasers',
      `+0.2 echo lasers per Perfect (current: +${(state.chorusLevel * 0.2).toFixed(1)})`,
      this.harmonicSystem.getChorusCost(),
      () => {
        const gameState = this.store.getState();
        if (this.harmonicSystem.buyChorus(gameState)) {
          this.store.setState(gameState);
          this.soundManager?.playPurchase();
          this.updateContent();
        }
      },
      'points'
    ));

    // Quantized Ripples
    pointUpgradesSection.appendChild(this.createUpgradeCard(
      '📐 Quantized Ripples',
      `Level ${state.quantizedRipplesLevel}`,
      'Reduces beat timing drift for more consistent rhythm',
      `-10% drift per level (current: ${(state.quantizedRipplesLevel * 10)}% reduction)`,
      this.harmonicSystem.getQuantizedRipplesCost(),
      () => {
        const gameState = this.store.getState();
        if (this.harmonicSystem.buyQuantizedRipples(gameState)) {
          this.store.setState(gameState);
          this.soundManager?.playPurchase();
          this.updateContent();
        }
      },
      'points'
    ));

    content.appendChild(pointUpgradesSection);

    // Harmonic Cores section
    const coresSection = document.createElement('div');
    coresSection.style.marginBottom = '20px';

    const coresTitle = document.createElement('h3');
    coresTitle.textContent = `💎 Harmonic Sigils (Cores: ${state.harmonicCores})`;
    coresTitle.style.marginBottom = '15px';
    coresTitle.style.borderBottom = '2px solid #f0f';
    coresTitle.style.paddingBottom = '8px';
    coresSection.appendChild(coresTitle);

    const coresDesc = document.createElement('div');
    coresDesc.textContent = 'Permanent upgrades purchased with Harmonic Cores (earned every 10th Perfect hit)';
    coresDesc.style.fontSize = '12px';
    coresDesc.style.color = '#aaa';
    coresDesc.style.marginBottom = '15px';
    coresSection.appendChild(coresDesc);

    // Sigil of Tempo
    coresSection.appendChild(this.createUpgradeCard(
      '⚡ Sigil of Tempo',
      `Level ${state.sigils.tempo}`,
      '+2% attack speed cap per level',
      'Permanent boost to attack speed',
      this.harmonicSystem.getSigilCost('tempo'),
      () => {
        if (this.harmonicSystem.buySigil('tempo')) {
          this.soundManager?.playAchievement();
          this.updateContent();
        }
      },
      'cores'
    ));

    // Sigil of Echo
    coresSection.appendChild(this.createUpgradeCard(
      '🌊 Sigil of Echo',
      `Level ${state.sigils.echo}`,
      '+1% echo laser damage per level',
      'Makes echo volleys more powerful',
      this.harmonicSystem.getSigilCost('echo'),
      () => {
        if (this.harmonicSystem.buySigil('echo')) {
          this.soundManager?.playAchievement();
          this.updateContent();
        }
      },
      'cores'
    ));

    // Sigil of Focus
    coresSection.appendChild(this.createUpgradeCard(
      '🎯 Sigil of Focus',
      `Level ${state.sigils.focus}`,
      '-5% penalty on streak loss per level',
      'Lose less streak when missing beats',
      this.harmonicSystem.getSigilCost('focus'),
      () => {
        if (this.harmonicSystem.buySigil('focus')) {
          this.soundManager?.playAchievement();
          this.updateContent();
        }
      },
      'cores'
    ));

    content.appendChild(coresSection);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-button';
    closeButton.textContent = 'Close';
    closeButton.style.width = '100%';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => {
      this.hide();
    });
    content.appendChild(closeButton);

    this.modal.appendChild(content);
  }

  private createUpgradeCard(
    name: string,
    level: string,
    description: string,
    effect: string,
    cost: number,
    onBuy: () => void,
    currency: 'points' | 'cores'
  ): HTMLElement {
    const card = document.createElement('div');
    const state = this.store.getState();
    const harmonicState = this.harmonicSystem.getState();
    
    const canAfford = currency === 'points' 
      ? state.points >= cost 
      : harmonicState.harmonicCores >= cost;
    
    card.style.cssText = `
      padding: 15px;
      background: ${canAfford ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)'};
      border: 2px solid ${canAfford ? '#fff' : '#444'};
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: ${canAfford ? 'pointer' : 'not-allowed'};
      opacity: ${canAfford ? '1' : '0.6'};
      transition: all 0.2s;
    `;

    if (canAfford) {
      card.addEventListener('mouseenter', () => {
        card.style.background = 'rgba(255,255,255,0.1)';
        card.style.borderColor = '#0ff';
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = 'rgba(255,255,255,0.05)';
        card.style.borderColor = '#fff';
      });
    }

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
    
    const nameLevel = document.createElement('div');
    nameLevel.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${name}</span><br><span style="font-size: 12px; color: #888;">${level}</span>`;
    
    const costDisplay = document.createElement('div');
    const icon = currency === 'points' ? '💰' : '💎';
    costDisplay.innerHTML = `<div style="text-align: right;"><span style="font-size: 18px; color: ${canAfford ? '#0f0' : '#f00'};">${icon} ${this.formatNumber(cost)}</span></div>`;
    
    header.appendChild(nameLevel);
    header.appendChild(costDisplay);
    card.appendChild(header);

    const descElement = document.createElement('div');
    descElement.textContent = description;
    descElement.style.cssText = 'font-size: 14px; color: #ccc; margin-bottom: 6px;';
    card.appendChild(descElement);

    const effectElement = document.createElement('div');
    effectElement.textContent = effect;
    effectElement.style.cssText = 'font-size: 12px; color: #aaa; font-style: italic;';
    card.appendChild(effectElement);

    if (canAfford) {
      card.addEventListener('click', onBuy);
    }

    return card;
  }

  private formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  }

  show(): void {
    if (this.modal) {
      this.updateContent();
      this.modal.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

