/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';
import { IconGenerator } from '../utils/IconGenerator';
import { resolveArtifactIcon } from '../assets/images';
import type { Artifact } from '../systems/ArtifactSystem';

export class Hud {
  private pointsDisplay: HTMLElement;
  private levelText: HTMLElement;
  private expText: HTMLElement;
  private levelBarFill: HTMLElement;
  private totalIncomeDisplay: HTMLElement | null = null; // Combined income display
  private combatStatsContainer: HTMLElement | null = null; // Always visible combat stats
  private dpsFullDisplay: HTMLElement | null = null;
  private skillBarContainer: HTMLElement | null = null; // New Skill Bar

  private damageHistory: Array<{ damage: number; time: number }> = [];
  private killRewardHistory: Array<{ reward: number; time: number }> = [];
  private readonly DPS_WINDOW = 5000; // 5 seconds window for DPS calculation

  // Cache last values to avoid unnecessary DOM updates
  private lastPointsText = '';
  private lastStatsText = { totalIncome: '' };
  private lastLevelText = { level: '', exp: '', percent: -1 };

  public onSkillActivate: ((artifactId: string) => void) | null = null;

  constructor() {
    const pointsEl = document.getElementById('points-display');
    if (!pointsEl) throw new Error('Points display element not found');
    this.pointsDisplay = pointsEl;

    // Wrap the money text in a span for easier updates
    const moneyText = pointsEl.textContent || '0';
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
    this.createSkillBar();
  }

  private createSkillBar(): void {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    this.skillBarContainer = document.createElement('div');
    this.skillBarContainer.id = 'skill-bar';
    this.skillBarContainer.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 90;
      pointer-events: auto;
    `;

    gameContainer.appendChild(this.skillBarContainer);
  }

  public updateSkillBar(equippedArtifacts: Artifact[]): void {
    if (!this.skillBarContainer) return;

    const activeArtifacts = equippedArtifacts.filter(
      (a) => a.type === 'active',
    );

    if (activeArtifacts.length === 0) {
      this.skillBarContainer.style.display = 'none';
      return;
    }

    this.skillBarContainer.style.display = 'flex';

    // Clear and rebuild if count changed (simple approach)
    if (this.skillBarContainer.children.length !== activeArtifacts.length) {
      this.skillBarContainer.innerHTML = '';
      activeArtifacts.forEach((artifact, index) => {
        const btn = document.createElement('div');
        btn.className = 'skill-slot';
        btn.style.cssText = `
          width: 50px;
          height: 50px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #444;
          border-radius: 5px;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        `;
        btn.onclick = () => {
          if (this.onSkillActivate) this.onSkillActivate(artifact.id);
        };

        const icon = document.createElement('img');
        icon.src = resolveArtifactIcon(artifact.icon);
        icon.style.cssText = 'width: 40px; height: 40px; object-fit: contain;';
        btn.appendChild(icon);

        const hotkey = document.createElement('div');
        hotkey.textContent = (index + 1).toString();
        hotkey.style.cssText = `
          position: absolute;
          top: 2px;
          left: 2px;
          font-size: 10px;
          color: #fff;
          background: rgba(0,0,0,0.5);
          padding: 1px 4px;
          border-radius: 3px;
        `;
        btn.appendChild(hotkey);

        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay';
        cooldownOverlay.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background: rgba(0, 0, 0, 0.7);
          transition: height 0.1s linear;
        `;
        btn.appendChild(cooldownOverlay);

        const cooldownText = document.createElement('div');
        cooldownText.className = 'cooldown-text';
        cooldownText.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-weight: bold;
          text-shadow: 0 0 3px #000;
          display: none;
        `;
        btn.appendChild(cooldownText);

        // Add tooltip logic (basic)
        btn.title = `${artifact.name}: ${artifact.description}`;

        this.skillBarContainer!.appendChild(btn);
      });
    }

    // Update state (cooldowns)
    const slots = this.skillBarContainer.children;
    activeArtifacts.forEach((artifact, index) => {
      const slot = slots[index] as HTMLElement;
      const overlay = slot.querySelector('.cooldown-overlay') as HTMLElement;
      const text = slot.querySelector('.cooldown-text') as HTMLElement;

      if (
        artifact.cooldownTimer &&
        artifact.cooldown &&
        artifact.cooldownTimer > 0
      ) {
        const percent = (artifact.cooldownTimer / artifact.cooldown) * 100;
        overlay.style.height = `${percent}%`;
        text.style.display = 'block';
        text.textContent = Math.ceil(artifact.cooldownTimer).toString();
        slot.style.borderColor = '#444';
        slot.style.cursor = 'default';
      } else {
        overlay.style.height = '0%';
        text.style.display = 'none';
        slot.style.borderColor = '#00ff88'; // Ready color
        slot.style.cursor = 'pointer';
      }
    });
  }

  private createPowerUpBuffsDisplay(): void {
    // Create container
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const buffsContainer = document.createElement('div');
    buffsContainer.id = 'powerup-buffs-container';

    // Position it absolutely at top right
    buffsContainer.style.cssText = `
      display: none;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      position: absolute;
      top: 120px;
      right: 20px;
      z-index: 100;
      pointer-events: none;
    `;

    // Insert into game container
    gameContainer.appendChild(buffsContainer);
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
      points: t('powerups.moonies'),
      damage: t('powerups.damage'),
      speed: t('powerups.speed'),
      multishot: t('powerups.multi'),
      critical: t('powerups.crit'),
      combo_pause: t('powerups.comboPause'),
    };

    // If buffs changed, recreate elements
    if (buffsChanged) {
      container.innerHTML = '';
      this.lastBuffKeys = currentBuffKeys;

      for (const buff of activeBuffs) {
        const color = POWERUP_COLORS[buff.type] || '#ffffff';
        const iconSvg =
          POWERUP_ICONS[buff.type] ||
          IconGenerator.getUpgradeIcon('powerup_speed');
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
          <div class="powerup-buff-glow" style="background-color: ${color}40;"></div>
          <div class="powerup-buff-content">
            <div class="powerup-buff-icon" style="color: ${color};">${iconSvg}</div>
            <div class="powerup-buff-name" style="color: ${color};">${name}</div>
            <div class="powerup-buff-timer" style="color: ${color};">
              <span class="powerup-buff-time-value">${timeLeft}</span>
              <span class="powerup-buff-time-unit">s</span>
            </div>
            <div class="powerup-buff-bar-container">
              <div class="powerup-buff-bar-bg"></div>
              <div class="powerup-buff-bar-fill" style="background-color: ${color}; width: ${percent}%;"></div>
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
    this.totalIncomeDisplay.textContent = `${t('hud.totalIncome')}: 0${t('hud.perSec')}`;
    this.totalIncomeDisplay.title = t('hud.clickToToggle');

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

    // Crit Chance display
    const critChanceDisplay = document.createElement('div');
    critChanceDisplay.id = 'crit-chance-display';
    critChanceDisplay.className = 'combat-stat';
    this.combatStatsContainer.appendChild(critChanceDisplay);

    // Append income to points display container
    pointsDisplay.appendChild(this.totalIncomeDisplay);
    pointsDisplay.appendChild(this.combatStatsContainer);
    pointsDisplay.appendChild(breakdownContainer);

    // Store breakdown container reference
    (this as any).incomeBreakdownContainer = breakdownContainer;
    (this as any).incomeBreakdownContent = breakdownContent;
  }

  update(points: number): void {
    //make the symbol font size smaller
    const symbol = document.getElementById('money-text');
    if (symbol) {
      symbol.style.fontSize = '50px';
    }
    const newText = `നoonies: ${NumberFormatter.format(points)}`;
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
    const totalIncomeText = `${t('hud.totalIncome')}: ${NumberFormatter.format(totalIncome)}${t('hud.perSec')}`;

    // Update total income display
    if (
      this.totalIncomeDisplay &&
      totalIncomeText !== this.lastStatsText.totalIncome
    ) {
      this.totalIncomeDisplay.textContent = totalIncomeText;
      this.lastStatsText.totalIncome = totalIncomeText;
    }

    // Update always visible combat stats (DPS, Attack Speed, Crit Chance)
    if (this.dpsFullDisplay) {
      this.dpsFullDisplay.textContent = `${t('hud.dps')}: ${NumberFormatter.format(dps)}`;
    }

    // Update attack speed display
    const attackSpeedDisplay = document.getElementById('attack-speed-display');
    if (attackSpeedDisplay && attackSpeed !== undefined && attackSpeed !== null && attackSpeed > 0) {
      attackSpeedDisplay.textContent = `${t('hud.attackSpeed')}: ${attackSpeed.toFixed(2)} ${t('hud.shotsPerSec')}`;
    }

    // Update crit chance display
    const critChanceDisplay = document.getElementById('crit-chance-display');
    if (critChanceDisplay && critChance !== undefined && critChance !== null) {
      critChanceDisplay.textContent = `${t('hud.critChance')}: ${critChance.toFixed(1)}%`;
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
    const hasCombatStats =
      hitDamage !== undefined ||
      attackSpeed !== undefined ||
      critChance !== undefined;

    breakdownContent.innerHTML = `
      <div style="margin-bottom: 3px;">
        <span style="color: #00ffff;">🏭 ${t('hud.passive')}:</span>
        <span style="float: right; color: #88ffff;">${NumberFormatter.format(passive)}/s (${passivePercent.toFixed(1)}%)</span>
      </div>
      <div style="margin-bottom: 3px;">
        <span style="color: #ff4444;">⚔️ ${t('hud.combat')}:</span>
        <span style="float: right; color: #ff8888;">${NumberFormatter.format(dps)}/s (${dpsPercent.toFixed(1)}%)</span>
      </div>
      ${killRewards > 0
        ? `
      <div style="margin-bottom: 3px;">
        <span style="color: #ffaa00;">💥 ${t('hud.kills')}:</span>
        <span style="float: right; color: #ffcc88;">${NumberFormatter.format(killRewards)}/s (${killPercent.toFixed(1)}%)</span>
      </div>
      `
        : ''
      }
      ${hasCombatStats
        ? `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">${t('hud.dps')}:</span>
          <span style="float: right; color: #ffffff;">${NumberFormatter.format(dps)}</span>
        </div>
        ${hitDamage !== undefined && hitDamage !== null
          ? `
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">${t('hud.hitDamage')}:</span>
          <span style="float: right; color: #ffffff;">${NumberFormatter.format(hitDamage)}</span>
        </div>
        `
          : ''
        }
        ${attackSpeed !== undefined && attackSpeed !== null && attackSpeed > 0
          ? `
        <div style="margin-bottom: 3px;">
          <span style="color: #ffffff;">${t('hud.attackSpeed')}:</span>
          <span style="float: right; color: #ffffff;">${attackSpeed.toFixed(2)} ${t('hud.shotsPerSec')}</span>
        </div>
        `
          : ''
        }
        ${critChance !== undefined && critChance !== null
          ? `
        <div>
          <span style="color: #ffffff;">${t('hud.critChance')}:</span>
          <span style="float: right; color: #ffffff;">${critChance.toFixed(1)}%</span>
        </div>
        `
          : ''
        }
      </div>
      `
        : ''
      }
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

    const timeSpan =
      (now - this.killRewardHistory[firstValidIndex]!.time) / 1000;
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
    // Create message element with modern UI styling
    const messageEl = document.createElement('div');
    messageEl.textContent = message;

    // Create glow color with reduced opacity for box-shadow
    let glowColor: string;
    if (color.includes('rgba')) {
      glowColor = color.replace(/[\d.]+\)$/, '0.3)');
    } else if (color.startsWith('#')) {
      // Convert hex to rgba with opacity
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      glowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else {
      glowColor = `${color}4D`; // Fallback
    }

    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translate(-50%, -100px);
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 16px 24px;
      border-radius: 6px;
      border: 2px solid ${color};
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.5),
        0 0 8px ${glowColor},
        inset 0 0 0 1px rgba(0, 0, 0, 0.3);
      font-size: 16px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      z-index: 10000;
      text-shadow: 
        0 1px 0 rgba(0, 0, 0, 1),
        0 -1px 0 rgba(0, 0, 0, 1),
        0 0 8px ${glowColor};
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    `;

    document.body.appendChild(messageEl);

    // Animate in
    requestAnimationFrame(() => {
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translate(-50%, 0)';
    });

    // Remove after duration
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translate(-50%, -30px)';
      setTimeout(() => {
        if (messageEl.parentElement) {
          document.body.removeChild(messageEl);
        }
      }, 400);
    }, duration);
  }
}
