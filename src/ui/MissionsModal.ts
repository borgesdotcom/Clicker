/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { MissionSystem } from '../systems/MissionSystem';

export class MissionsModal {
  private modal: HTMLElement;
  private missionSystem: MissionSystem;
  private onClaim: () => void;

  constructor(missionSystem: MissionSystem, onClaim: () => void) {
    this.missionSystem = missionSystem;
    this.onClaim = onClaim;
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'missions-modal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content missions-modal-content">
        <div class="modal-header">
          <h2>🎯 Missions & Quests</h2>
          <button class="modal-close">&times;</button>
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

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
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
    this.modal.style.display = 'flex';
    this.renderMissions();
  }

  public hide(): void {
    this.modal.style.display = 'none';
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

    container.innerHTML = missions
      .map(
        (mission) => `
      <div class="mission-card ${mission.completed ? 'completed' : ''} ${mission.claimed ? 'claimed' : ''}">
        <div class="mission-icon">${mission.icon}</div>
        <div class="mission-info">
          <h3 class="mission-title">${mission.title}</h3>
          <p class="mission-description">${mission.description}</p>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" style="width: ${Math.min(100, (mission.progress / mission.target) * 100)}%"></div>
          </div>
          <p class="mission-progress-text">${mission.progress} / ${mission.target}</p>
        </div>
        <div class="mission-reward">
          ${mission.reward.points ? `<div class="reward-item">💰 +${mission.reward.points.toLocaleString()}</div>` : ''}
          ${mission.reward.ships ? `<div class="reward-item">🚀 +${mission.reward.ships}</div>` : ''}
          ${mission.reward.xp ? `<div class="reward-item">⭐ +${mission.reward.xp} XP</div>` : ''}
          ${mission.completed && !mission.claimed ? `<button class="claim-btn" data-id="${mission.id}">Claim</button>` : ''}
          ${mission.claimed ? '<span class="claimed-badge">✓ Claimed</span>' : ''}
        </div>
      </div>
    `,
      )
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
