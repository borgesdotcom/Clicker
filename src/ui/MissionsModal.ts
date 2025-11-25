/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { MissionSystem, MissionType } from '../systems/MissionSystem';
import type { Store } from '../core/Store';
import { images } from '../assets/images';

export class MissionsModal {
  private modal: HTMLElement;
  private missionSystem: MissionSystem;
  private store: Store;
  private onClaim: () => void;

  constructor(missionSystem: MissionSystem, store: Store, onClaim: () => void) {
    this.missionSystem = missionSystem;
    this.store = store;
    this.onClaim = onClaim;
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'missions-modal';
    modal.className = 'missions-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content missions-modal-content">
        <div class="modal-header">
          <h2>MISSIONS & QUESTS</h2>
          <button class="modal-close"><img src="${images.menu.close}" alt="Close" /></button>
        </div>
        <div class="modal-body">
          <div class="missions-tabs">
            <button class="mission-tab active" data-tab="daily">Daily Missions</button>
            <button class="mission-tab" data-tab="regular">Regular Missions</button>
          </div>
          <div class="missions-container" id="missions-list"></div>
        </div>
      </div>
    `;

    return modal;
  }

  private setupEventListeners(): void {
    const closeBtn = this.modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => {
      this.hide();
    });


    // Tab switching
    const tabs = this.modal.querySelectorAll('.mission-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        this.renderMissions();
      });
    });
  }

  public show(): void {
    document.body.style.overflow = 'hidden';
    this.modal.style.display = 'flex';
    this.modal.classList.add('show');
    this.renderMissions();
  }

  public hide(): void {
    this.modal.classList.remove('show');
    document.body.style.overflow = '';
    // Wait for animation to complete
    setTimeout(() => {
      this.modal.style.display = 'none';
    }, 300);
  }

  private getRewardForMission(
    type: MissionType,
    level: number,
  ): { points?: number; ships?: number; xp?: number } {
    // Replicate the reward calculation logic from MissionSystem
    switch (type) {
      case 'clicks':
        return {
          points: Math.floor(level * level * 500),
          xp: Math.floor(level * 15),
        };
      case 'damage':
        return {
          points: Math.floor(level * level * 750),
          ships: Math.max(1, Math.floor(level / 10)),
        };
      case 'kills':
        return {
          points: Math.floor(level * level * 400),
          xp: Math.floor(level * 12),
        };
      case 'boss_kills':
        return {
          points: Math.floor(level * level * 2500),
          ships: Math.max(2, Math.floor(level / 5)),
        };
      case 'upgrades':
        return {
          points: Math.floor(level * level * 600),
        };
      case 'level':
        return {
          points: Math.floor(level * level * 1000),
          xp: Math.floor(level * 30),
        };
      case 'ships':
        return {
          points: Math.floor(level * level * 1500),
        };
      case 'combo':
        return {
          points: Math.floor(level * level * 1250),
          xp: Math.floor(level * 25),
        };
      default:
        return {};
    }
  }

  private renderMissions(): void {
    const container = this.modal.querySelector('#missions-list');
    if (!container) return;

    const activeTab = this.modal.querySelector('.mission-tab.active');
    const isDaily = activeTab?.getAttribute('data-tab') === 'daily';

    const missions = isDaily
      ? this.missionSystem.getDailyMissions()
      : this.missionSystem.getMissions();

    if (missions.length === 0) {
      container.innerHTML = '<p class="no-missions">No missions available</p>';
      return;
    }

    // Get current level to calculate dynamic rewards
    const state = this.store.getState();
    const currentLevel = state.level;

    container.innerHTML = missions
      .map((mission) => {
        // Calculate reward based on current level
        const calculatedReward = this.getRewardForMission(
          mission.type,
          currentLevel,
        );

        // For daily missions, double the points and XP
        const isDailyMission = mission.title.startsWith('[DAILY]');
        const displayedReward = {
          points: isDailyMission
            ? (calculatedReward.points || 0) * 2
            : calculatedReward.points || 0,
          ships: calculatedReward.ships || 0,
          xp: isDailyMission
            ? (calculatedReward.xp || 0) * 2
            : calculatedReward.xp || 0,
        };

        // Map emoji icons to image icons
        const iconMap: Record<string, string> = {
          '🖱️': images.target,
          '⚔️': images.bossbattle,
          '👾': images.bossbattle,
          '🏆': images.trophy,
          '🔧': images.settings,
          '⭐': images.stars,
          '🚀': images.stars,
          '🔥': images.graph,
        };
        const iconSrc = iconMap[mission.icon] || images.target;

        return `
      <div class="mission-card ${mission.completed ? 'completed' : ''} ${mission.claimed ? 'claimed' : ''}">
        <div class="mission-icon"><img src="${iconSrc}" alt="${mission.title}" style="width: 48px; height: 48px; object-fit: contain;" /></div>
        <div class="mission-info">
          <h3 class="mission-title">${mission.title}</h3>
          <p class="mission-description">${mission.description}</p>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" style="width: ${Math.min(100, (mission.progress / mission.target) * 100)}%"></div>
          </div>
          <p class="mission-progress-text">${mission.progress} / ${mission.target}</p>
        </div>
        <div class="mission-reward">
          ${displayedReward.points > 0 ? `<div class="reward-item">$ +${displayedReward.points.toLocaleString()}</div>` : ''}
          ${displayedReward.ships > 0 ? `<div class="reward-item">+${displayedReward.ships} SHIPS</div>` : ''}
          ${displayedReward.xp > 0 ? `<div class="reward-item">+${displayedReward.xp} XP</div>` : ''}
          ${mission.completed && !mission.claimed ? `<button class="claim-btn" data-id="${mission.id}">CLAIM</button>` : ''}
          ${mission.claimed ? '<span class="claimed-badge">CLAIMED</span>' : ''}
        </div>
      </div>
    `;
      })
      .join('');

    // Add claim button listeners
    const claimBtns = container.querySelectorAll('.claim-btn');
    claimBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const missionId = btn.getAttribute('data-id');
        if (missionId && this.missionSystem.claimReward(missionId)) {
          this.renderMissions();
          this.onClaim();
        }
      });
    });
  }

  public getCompletedCount(): number {
    return this.missionSystem.getCompletedCount();
  }
}
