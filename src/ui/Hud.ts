/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';
import { IconGenerator } from '../utils/IconGenerator';

export class Hud {
  private pointsDisplay: HTMLElement;
  private levelText: HTMLElement;
  private expText: HTMLElement;
  private levelBarFill: HTMLElement;
  private totalIncomeDisplay: HTMLElement | null = null; // Combined income display
  private combatStatsContainer: HTMLElement | null = null; // Always visible combat stats
  private dpsFullDisplay: HTMLElement | null = null;

  private damageHistory: Array<{ damage: number; time: number }> = [];
  private killRewardHistory: Array<{ reward: number; time: number }> = [];
  private readonly DPS_WINDOW = 5000; // 5 seconds window for DPS calculation

  // Cache last values to avoid unnecessary DOM updates
  private lastPointsText = '';
  private lastStatsText = { totalIncome: '' };
  private lastLevelText = { level: '', exp: '', percent: -1 };

  constructor() {
    const pointsEl = document.getElementById('points-display');
    if (!pointsEl) throw new Error('Points display element not found');
    this.pointsDisplay = pointsEl;
    
    // Wrap the money text in a span for easier updates
    const moneyText = pointsEl.textContent || 'Points: 0';
    pointsEl.textContent = '';
    const moneySpan = document.createElement('span');
    moneySpan.id = 'money-text';
    moneySpan.textContent = moneyText;
    pointsEl.appendChild(moneySpan);

    const levelTextEl = document.getElementById('level-text');
    if (!levelTextEl) throw new Error('Level text element not found');
    this.levelText = levelTextEl;

    const expTextEl = document.getElementById('exp-text');
    if (!expTextEl) throw new Error('Exp text element not found');
    this.expText = expTextEl;

    const levelBarFillEl = document.getElementById('level-bar-fill');
    if (!levelBarFillEl) throw new Error('Level bar fill element not found');
    this.levelBarFill = levelBarFillEl;

    this.createStatsDisplay();
    this.createPowerUpBuffsDisplay();
  }

  private createPowerUpBuffsDisplay(): void {
    // Create container above XP bar container (not inside it)
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const levelBarContainer = document.getElementById('level-bar-container');
    if (!levelBarContainer) return;

    const buffsContainer = document.createElement('div');
    buffsContainer.id = 'powerup-buffs-container';

    // Position it absolutely above the level-bar-container
    // We'll update the position after the container is inserted to get accurate measurements
    buffsContainer.style.cssText = `
      display: none;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      align-items: flex-start;
      position: absolute;
      z-index: 100;
      pointer-events: none;
    `;

    // Insert into game container, right before level-bar-container
    gameContainer.insertBefore(buffsContainer, levelBarContainer);

    // Update position after DOM insertion to get accurate measurements
    const updatePosition = () => {
      const rect = levelBarContainer.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();
      const bottomOffset = containerRect.bottom - rect.top;

      buffsContainer.style.bottom = `${bottomOffset + 8}px`;
      buffsContainer.style.left = '50%';
      buffsContainer.style.transform = 'translateX(-50%)';
    };

    setTimeout(updatePosition, 0);

    // Update position on window resize
    window.addEventListener('resize', updatePosition);
  }

  private lastBuffKeys: string[] = [];

  public updatePowerUpBuffs(
    activeBuffs: Array<{ type: string; duration: number; maxDuration: number }>,
  ): void {
    const container = document.getElementById('powerup-buffs-container');
    if (!container) return;

    // Generate keys for current buffs to detect changes
    const currentBuffKeys = activeBuffs
      .map((b) => `${b.type}-${b.maxDuration}`)
      .sort();

    // Check if buffs changed (new buffs added/removed)
    const buffsChanged =
      currentBuffKeys.length !== this.lastBuffKeys.length ||
      currentBuffKeys.some((key, i) => key !== this.lastBuffKeys[i]);

    if (activeBuffs.length === 0) {
      container.style.display = 'none';
      this.lastBuffKeys = [];
      return;
    }

    container.style.display = 'flex';

    // Ensure position is correct (in case of resize)
    const levelBarContainer = document.getElementById('level-bar-container');
    const gameContainer = document.getElementById('game-container');
    if (levelBarContainer && gameContainer) {
      const rect = levelBarContainer.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();
      const bottomOffset = containerRect.bottom - rect.top;
      container.style.bottom = `${bottomOffset + 8}px`;
    }

    const POWERUP_ICONS: Record<string, string> = {
      points: IconGenerator.getUpgradeIcon('powerup_points'),
      damage: IconGenerator.getUpgradeIcon('powerup_damage'),
      speed: IconGenerator.getUpgradeIcon('powerup_speed'),
      multishot: IconGenerator.getUpgradeIcon('powerup_multishot'),
      critical: IconGenerator.getUpgradeIcon('powerup_critical'),
      combo_pause: IconGenerator.getUpgradeIcon('temporal_acceleration'), // Use clock icon
    };

    const POWERUP_COLORS: Record<string, string> = {
      points: '#00ff88',
      damage: '#ff4444',
      speed: '#ffff00',
      multishot: '#ff00ff',
      critical: '#ff8800',
      combo_pause: '#00aaff',
    };

    const POWERUP_NAMES: Record<string, string> = {
      points: 'Points',
      damage: 'Damage',
      speed: 'Speed',
      multishot: 'Multi',
      critical: 'Crit',
      combo_pause: 'Combo Pause',
    };

    // If buffs changed, recreate elements
    if (buffsChanged) {
      container.innerHTML = '';
      this.lastBuffKeys = currentBuffKeys;

      for (const buff of activeBuffs) {
        const color = POWERUP_COLORS[buff.type] || '#ffffff';
        const iconSvg = POWERUP_ICONS[buff.type] || IconGenerator.getUpgradeIcon('powerup_speed');
        const name = POWERUP_NAMES[buff.type] || 'Buff';
        const timeLeft = Math.ceil(buff.duration);
        const percent = (buff.duration / buff.maxDuration) * 100;
        const isLow = buff.duration <= 3;

        const buffEl = document.createElement('div');
        buffEl.className = 'powerup-buff-card powerup-buff-new';
        buffEl.setAttribute('data-type', buff.type);
        buffEl.setAttribute('data-percent', percent.toString());

        // Ensure card is visible
        buffEl.style.opacity = '1';
        buffEl.style.visibility = 'visible';

        if (isLow) {
          buffEl.classList.add('powerup-buff-low');
        }

        // Remove animation class after animation completes
        setTimeout(() => {
          buffEl.classList.remove('powerup-buff-new');
        }, 400);

        buffEl.innerHTML = `
          <div class="powerup-buff-glow" style="background: radial-gradient(circle, ${color}40 0%, transparent 70%);"></div>
          <div class="powerup-buff-content">
            <div class="powerup-buff-icon" style="color: ${color}; filter: drop-shadow(0 0 8px ${color});">${iconSvg}</div>
            <div class="powerup-buff-name" style="color: ${color}; text-shadow: 0 0 6px ${color};">${name}</div>
            <div class="powerup-buff-timer" style="color: ${color}; text-shadow: 0 0 8px ${color};">
              <span class="powerup-buff-time-value">${timeLeft}</span>
              <span class="powerup-buff-time-unit">s</span>
            </div>
            <div class="powerup-buff-bar-container">
              <div class="powerup-buff-bar-bg"></div>
              <div class="powerup-buff-bar-fill" style="background: linear-gradient(90deg, ${color}, ${color}CC, ${color}); width: ${percent}%; box-shadow: 0 0 8px ${color}, inset 0 0 4px ${color}80;"></div>
              <div class="powerup-buff-bar-shimmer"></div>
            </div>
          </div>
        `;

        container.appendChild(buffEl);
      }
    } else {
      // Just update existing elements (update timer and progress bar)
      const buffCards = container.querySelectorAll('.powerup-buff-card');
      activeBuffs.forEach((buff, index) => {
        const buffEl = buffCards[index] as HTMLElement;
        if (!buffEl) return;

        const timeLeft = Math.ceil(buff.duration);
        const percent = (buff.duration / buff.maxDuration) * 100;
        const isLow = buff.duration <= 3;

        // Update timer
        const timeValue = buffEl.querySelector('.powerup-buff-time-value');
        if (timeValue) {
          timeValue.textContent = timeLeft.toString();
        }

        // Update progress bar
        const barFill = buffEl.querySelector(
          '.powerup-buff-bar-fill',
        ) as HTMLElement;
        if (barFill) {
          barFill.style.width = `${percent}%`;
        }

        // Update low state class
        if (isLow) {
          buffEl.classList.add('powerup-buff-low');
        } else {
          buffEl.classList.remove('powerup-buff-low');
        }
      });
    }
  }

  private createStatsDisplay(): void {
    const hudElement = document.getElementById('hud');
    if (!hudElement) return;

    // Create income display first (right after points)
    this.createIncomeDisplay();
  }


  private createIncomeDisplay(): void {
    // Put income display inside points display container
    const pointsDisplay = document.getElementById('points-display');
    if (!pointsDisplay) return;

    // Main total income display
    this.totalIncomeDisplay = document.createElement('div');
    this.totalIncomeDisplay.id = 'income-display';
    this.totalIncomeDisplay.textContent = `Total Income: 0${t('hud.perSec')}`;
    this.totalIncomeDisplay.title = 'Click to toggle income breakdown';

    // Income breakdown (collapsible)
    const breakdownContainer = document.createElement('div');
    breakdownContainer.id = 'income-breakdown';

    // Breakdown items will be created dynamically
    const breakdownContent = document.createElement('div');
    breakdownContent.id = 'income-breakdown-content';
    breakdownContainer.appendChild(breakdownContent);

    // Toggle breakdown on click
    let breakdownVisible = false;
    this.totalIncomeDisplay.addEventListener('click', () => {
      breakdownVisible = !breakdownVisible;
      breakdownContainer.style.display = breakdownVisible ? 'block' : 'none';
      if (this.totalIncomeDisplay) {
        this.totalIncomeDisplay.style.opacity = breakdownVisible ? '0.8' : '1';
      }
      // Refresh breakdown content with last values when opening
      if (breakdownVisible) {
        const lastValues = (this as any).lastBreakdownValues;
        if (lastValues) {
          this.updateIncomeBreakdown(
            lastValues.passive,
            lastValues.dps,
            lastValues.killRewards,
            lastValues.total,
            lastValues.critChance,
            lastValues.hitDamage,
            lastValues.attackSpeed,
          );
        }
      }
    });

    // Create always visible combat stats container
    this.combatStatsContainer = document.createElement('div');
    this.combatStatsContainer.id = 'combat-stats-container';
    
    // DPS (full number, no abbreviation)
    this.dpsFullDisplay = document.createElement('div');
    this.dpsFullDisplay.className = 'combat-stat';
    this.combatStatsContainer.appendChild(this.dpsFullDisplay);

    // Append income to points display container
    pointsDisplay.appendChild(this.totalIncomeDisplay);
    pointsDisplay.appendChild(this.combatStatsContainer);
    pointsDisplay.appendChild(breakdownContainer);

    // Store breakdown container reference
    (this as any).incomeBreakdownContainer = breakdownContainer;
    (this as any).incomeBreakdownContent = breakdownContent;
  }

  update(points: number): void {
    const newText = `$ ${NumberFormatter.format(points)}`;
    if (newText !== this.lastPointsText) {
      // Update only the money text span
      const moneySpan = document.getElementById('money-text');
      if (moneySpan) {
        moneySpan.textContent = newText;
      } else {
        // Fallback: update first child if span doesn't exist
        const firstChild = this.pointsDisplay.firstChild;
        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
          firstChild.textContent = newText;
        }
      }
      this.lastPointsText = newText;
    }
  }

  showPointsGain(amount: number): void {
    const hudElement = document.getElementById('hud');
    if (!hudElement) return;

    const gainElement = document.createElement('div');
    gainElement.className = 'points-gain';
    gainElement.textContent = `+${NumberFormatter.format(amount)}`;

    const pointsRect = this.pointsDisplay.getBoundingClientRect();
    const hudRect = hudElement.getBoundingClientRect();

    const offsetX = pointsRect.left - hudRect.left + pointsRect.width / 2;
    const offsetY = pointsRect.top - hudRect.top;

    gainElement.style.left = `${offsetX}px`;
    gainElement.style.top = `${offsetY}px`;

    hudElement.appendChild(gainElement);

    requestAnimationFrame(() => {
      gainElement.style.transform = 'translate(-50%, -40px)';
      gainElement.style.opacity = '0';
    });

    window.setTimeout(() => {
      if (gainElement.parentElement === hudElement) {
        hudElement.removeChild(gainElement);
      }
    }, 600);
  }

  updateStats(
    dps: number,
    passive: number,
    critChance: number,
    _critBonus: number = 0,
    hitDamage?: number,
    attackSpeed?: number,
  ): void {
    // Calculate kill rewards per second (kill bounty)
    const killRewardsPerSec = this.calculateKillRewardsPerSecond();

    // Calculate total income (passive + active combat income + kill rewards)
    // DPS represents active income from combat since damage = points
    // Kill rewards are the bonus points from killing enemies (kill bounty)
    const totalIncome = passive + dps + killRewardsPerSec;
    const totalIncomeText = `Total Income: ${NumberFormatter.format(totalIncome)}${t('hud.perSec')}`;

    // Update total income display
    if (
      this.totalIncomeDisplay &&
      totalIncomeText !== this.lastStatsText.totalIncome
    ) {
      this.totalIncomeDisplay.textContent = totalIncomeText;
      this.lastStatsText.totalIncome = totalIncomeText;
    }

    // Update always visible combat stats (only DPS)
    if (this.dpsFullDisplay) {
      this.dpsFullDisplay.textContent = `DPS: ${NumberFormatter.format(dps)}`;
    }

    // Enhanced UI: Update income breakdown with combat stats
    this.updateIncomeBreakdown(
      passive,
      dps,
      killRewardsPerSec,
      totalIncome,
      critChance,
      hitDamage,
      attackSpeed,
    );
  }


  /**
   * Update income breakdown display (Enhanced UI)
   */
  private updateIncomeBreakdown(
    passive: number,
    dps: number,
    killRewards: number,
    total: number,
    critChance?: number,
    hitDamage?: number,
    attackSpeed?: number,
  ): void {
    const breakdownContent = (this as any).incomeBreakdownContent;
    if (!breakdownContent) return;

    // Store last values for potential later use
    (this as any).lastBreakdownValues = {
      passive,
      dps,
      killRewards,
      total,
      critChance,
      hitDamage,
      attackSpeed,
    };

    const passivePercent = total > 0 ? (passive / total) * 100 : 0;
    const dpsPercent = total > 0 ? (dps / total) * 100 : 0;
    const killPercent = total > 0 ? (killRewards / total) * 100 : 0;

    // Always show combat stats section even if values are 0
    const hasCombatStats = hitDamage !== undefined || attackSpeed !== undefined || critChance !== undefined;

    breakdownContent.innerHTML = `
      <div style="margin-bottom: 3px;">
        <span style="color: #00ffff;">🏭 Passive:</span>
        <span style="float: right; color: #88ffff;">${NumberFormatter.format(passive)}/s (${passivePercent.toFixed(1)}%)</span>
      </div>
      <div style="margin-bottom: 3px;">
        <span style="color: #ff4444;">⚔️ Combat:</span>
        <span style="float: right; color: #ff8888;">${NumberFormatter.format(dps)}/s (${dpsPercent.toFixed(1)}%)</span>
      </div>
      ${killRewards > 0 ? `
      <div style="margin-bottom: 3px;">
        <span style="color: #ffaa00;">💥 Kills:</span>
        <span style="float: right; color: #ffcc88;">${NumberFormatter.format(killRewards)}/s (${killPercent.toFixed(1)}%)</span>
      </div>
      ` : ''}
      ${hasCombatStats ? `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">DPS:</span>
          <span style="float: right; color: #ffffff;">${NumberFormatter.format(dps)}</span>
        </div>
        ${hitDamage !== undefined && hitDamage !== null ? `
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">Hit Damage:</span>
          <span style="float: right; color: #ffffff;">${NumberFormatter.format(hitDamage)}</span>
        </div>
        ` : ''}
        ${attackSpeed !== undefined && attackSpeed !== null && attackSpeed > 0 ? `
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">Attack Speed:</span>
          <span style="float: right; color: #ffffff;">${attackSpeed.toFixed(2)} shots/sec</span>
        </div>
        ` : ''}
        ${critChance !== undefined && critChance !== null ? `
        <div>
          <span style="color: #ffffff;">Critical Chance:</span>
          <span style="float: right; color: #ffffff;">${critChance.toFixed(1)}%</span>
        </div>
        ` : ''}
      </div>
      ` : ''}
    `;
  }

  recordDamage(amount: number): void {
    const now = Date.now();
    this.damageHistory.push({ damage: amount, time: now });

    // Remove old entries outside the DPS window in-place (more efficient than filter)
    // Since entries are time-ordered, we can remove from the start until we find valid ones
    const cutoff = now - this.DPS_WINDOW;
    let removeCount = 0;
    for (let i = 0; i < this.damageHistory.length; i++) {
      const entry = this.damageHistory[i];
      if (entry && entry.time >= cutoff) {
        break;
      }
      removeCount++;
    }
    if (removeCount > 0) {
      this.damageHistory.splice(0, removeCount);
    }
  }

  calculateDPS(): number {
    if (this.damageHistory.length === 0) return 0;

    const now = Date.now();
    const windowStart = now - this.DPS_WINDOW;

    // Single pass: find first valid entry and calculate total
    let totalDamage = 0;
    let firstValidIndex = -1;

    for (let i = 0; i < this.damageHistory.length; i++) {
      const entry = this.damageHistory[i];
      if (entry && entry.time >= windowStart) {
        if (firstValidIndex === -1) {
          firstValidIndex = i;
        }
        totalDamage += entry.damage;
      }
    }

    if (firstValidIndex === -1 || totalDamage === 0) return 0;

    const timeSpan = (now - this.damageHistory[firstValidIndex]!.time) / 1000;
    return timeSpan > 0 ? totalDamage / timeSpan : 0;
  }

  recordKillReward(reward: number): void {
    const now = Date.now();
    this.killRewardHistory.push({ reward, time: now });

    // Remove old entries outside the DPS window in-place (more efficient than filter)
    // Since entries are time-ordered, we can remove from the start until we find valid ones
    const cutoff = now - this.DPS_WINDOW;
    let removeCount = 0;
    for (let i = 0; i < this.killRewardHistory.length; i++) {
      const entry = this.killRewardHistory[i];
      if (entry && entry.time >= cutoff) {
        break;
      }
      removeCount++;
    }
    if (removeCount > 0) {
      this.killRewardHistory.splice(0, removeCount);
    }
  }

  calculateKillRewardsPerSecond(): number {
    if (this.killRewardHistory.length === 0) return 0;

    const now = Date.now();
    const windowStart = now - this.DPS_WINDOW;

    // Single pass: find first valid entry and calculate total
    let totalReward = 0;
    let firstValidIndex = -1;

    for (let i = 0; i < this.killRewardHistory.length; i++) {
      const entry = this.killRewardHistory[i];
      if (entry && entry.time >= windowStart) {
        if (firstValidIndex === -1) {
          firstValidIndex = i;
        }
        totalReward += entry.reward;
      }
    }

    if (firstValidIndex === -1 || totalReward === 0) return 0;

    const timeSpan = (now - this.killRewardHistory[firstValidIndex]!.time) / 1000;
    return timeSpan > 0 ? totalReward / timeSpan : 0;
  }

  updateLevel(level: number, experience: number, expToNext: number): void {
    const levelText = `${t('hud.level')} ${level}`;
    const expText = `${Math.floor(experience)} / ${expToNext}`;
    const percent = Math.min(100, (experience / expToNext) * 100);

    // Only update DOM if changed
    if (levelText !== this.lastLevelText.level) {
      this.levelText.textContent = levelText;
      this.lastLevelText.level = levelText;
    }
    if (expText !== this.lastLevelText.exp) {
      this.expText.textContent = expText;
      this.lastLevelText.exp = expText;
    }
    // Use a larger threshold to prevent flickering (only update if change is significant)
    if (Math.abs(percent - this.lastLevelText.percent) > 0.5) {
      this.levelBarFill.style.width = `${percent}%`;
      this.lastLevelText.percent = percent;
    }

    // Add visual feedback for level milestones - White text with minimal shadow
    if (level % 10 === 0 && level > 0) {
      this.levelText.style.color = '#fff';
      this.levelText.style.textShadow =
        '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000';
    } else if (level % 5 === 0) {
      this.levelText.style.color = '#fff';
      this.levelText.style.textShadow =
        '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000';
    } else {
      this.levelText.style.color = '#fff';
      this.levelText.style.textShadow = '0 1px 0 #000, 0 -1px 0 #000';
    }
  }

  showMessage(
    message: string,
    color: string = '#ffffff',
    duration: number = 2000,
  ): void {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: ${color};
      padding: 20px 40px;
      border: 3px solid ${color};
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 10000;
      text-shadow: 0 0 10px ${color};
      animation: pulse 0.5s ease-in-out;
      pointer-events: none;
    `;

    document.body.appendChild(messageEl);

    // Remove after duration
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, duration);
  }
}
