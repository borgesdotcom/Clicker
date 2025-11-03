/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';

export class Hud {
  private pointsDisplay: HTMLElement;
  private levelText: HTMLElement;
  private expText: HTMLElement;
  private levelBarFill: HTMLElement;
  private dpsDisplay: HTMLElement | null = null;
  private passiveDisplay: HTMLElement | null = null;
  private totalIncomeDisplay: HTMLElement | null = null; // Combined income display
  private critDisplay: HTMLElement | null = null;

  private damageHistory: Array<{ damage: number; time: number }> = [];
  private readonly DPS_WINDOW = 5000; // 5 seconds window for DPS calculation

  // Cache last values to avoid unnecessary DOM updates
  private lastPointsText = '';
  private lastStatsText = { dps: '', passive: '', totalIncome: '', crit: '' };
  private lastLevelText = { level: '', exp: '', percent: -1 };

  constructor() {
    const pointsEl = document.getElementById('points-display');
    if (!pointsEl) throw new Error('Points display element not found');
    this.pointsDisplay = pointsEl;

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

  public updatePowerUpBuffs(activeBuffs: Array<{ type: string; duration: number; maxDuration: number }>): void {
    const container = document.getElementById('powerup-buffs-container');
    if (!container) return;

    // Clear existing buffs
    container.innerHTML = '';

    if (activeBuffs.length === 0) {
      container.style.display = 'none';
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
      points: '💰',
      damage: '⚔️',
      speed: '⚡',
      multishot: '✨',
      critical: '💥',
    };

    const POWERUP_COLORS: Record<string, string> = {
      points: '#00ff88',
      damage: '#ff4444',
      speed: '#ffff00',
      multishot: '#ff00ff',
      critical: '#ff8800',
    };

    for (const buff of activeBuffs) {
      const buffEl = document.createElement('div');
      const color = POWERUP_COLORS[buff.type] || '#ffffff';
      const icon = POWERUP_ICONS[buff.type] || '⚡';
      const timeLeft = Math.ceil(buff.duration);

      buffEl.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid ${color};
        border-radius: 6px;
        padding: 6px 10px;
        min-width: 50px;
        box-shadow: 0 0 10px ${color}40, inset 0 0 10px ${color}20;
        font-family: 'Courier New', monospace;
      `;

      buffEl.innerHTML = `
        <div style="font-size: 20px; margin-bottom: 2px;">${icon}</div>
        <div style="font-size: 11px; color: ${color}; font-weight: bold; text-shadow: 0 0 4px ${color};">${timeLeft}s</div>
        <div style="width: 40px; height: 3px; background: rgba(255,255,255,0.2); border-radius: 2px; margin-top: 4px; overflow: hidden;">
          <div style="width: ${(buff.duration / buff.maxDuration) * 100}%; height: 100%; background: ${color}; transition: width 0.1s linear; box-shadow: 0 0 4px ${color};"></div>
        </div>
      `;

      container.appendChild(buffEl);
    }
  }

  private createStatsDisplay(): void {
    // Create stats container - Green spaceship style
    const statsContainer = document.createElement('div');
    statsContainer.id = 'stats-display';
    statsContainer.style.cssText = `
      margin-top: 15px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border: 2px solid rgba(0, 255, 136, 0.5);
      border-radius: 4px;
      font-size: 14px;
      width: 300px;
      min-width: 300px;
      max-width: 300px;
      font-family: 'Courier New', monospace;
      box-shadow: 
        0 0 10px rgba(0, 255, 136, 0.3),
        inset 0 0 20px rgba(0, 255, 136, 0.1);
      /* Scanline effect */
      background-image: linear-gradient(
        transparent 50%,
        rgba(0, 255, 136, 0.03) 50%
      );
      background-size: 100% 4px;
    `;

    // DPS Display - White label, green value
    this.dpsDisplay = document.createElement('div');
    this.dpsDisplay.style.cssText = `
      margin-bottom: 5px; 
      color: #fff; 
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8), 0 1px 0 #000, 0 -1px 0 #000;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      border-left: 2px solid rgba(0, 255, 136, 0.5);
      padding-left: 8px;
    `;
    this.dpsDisplay.textContent = `⚔️ ${t('hud.dps')}: 0`;

    // Passive Display - White label, green value
    this.passiveDisplay = document.createElement('div');
    this.passiveDisplay.style.cssText = `
      margin-bottom: 5px; 
      color: #fff; 
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8), 0 1px 0 #000, 0 -1px 0 #000;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      border-left: 2px solid rgba(0, 255, 136, 0.5);
      padding-left: 8px;
    `;
    this.passiveDisplay.textContent = `🏭 ${t('hud.passive')}: 0${t('hud.perSec')}`;

    // Total Income Display - Combined passive + active (DPS)
    this.totalIncomeDisplay = document.createElement('div');
    this.totalIncomeDisplay.style.cssText = `
      margin-bottom: 5px; 
      color: #00ff88; 
      font-weight: bold;
      text-shadow: 0 0 4px rgba(0, 255, 136, 0.8), 0 1px 0 #000, 0 -1px 0 #000;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      border-left: 3px solid rgba(0, 255, 136, 0.8);
      padding-left: 8px;
      font-size: 15px;
    `;
    this.totalIncomeDisplay.textContent = `💰 Total Income: 0${t('hud.perSec')}`;

    // Crit Display - White label, green value
    this.critDisplay = document.createElement('div');
    this.critDisplay.style.cssText = `
      color: #fff; 
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8), 0 1px 0 #000, 0 -1px 0 #000;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      border-left: 2px solid rgba(0, 255, 136, 0.5);
      padding-left: 8px;
    `;
    this.critDisplay.textContent = `✨ ${t('hud.crit')}: 0%`;

    statsContainer.appendChild(this.dpsDisplay);
    statsContainer.appendChild(this.passiveDisplay);
    statsContainer.appendChild(this.totalIncomeDisplay);
    statsContainer.appendChild(this.critDisplay);

    const hudElement = document.getElementById('hud');
    if (hudElement) {
      hudElement.appendChild(statsContainer);
      
      // Move buttons container to be after stats display
      const buttonsContainer = document.getElementById('hud-buttons-container');
      if (buttonsContainer && buttonsContainer.parentElement === hudElement) {
        // Only move if it exists and is already in the HUD
        hudElement.insertBefore(buttonsContainer, statsContainer.nextSibling);
      }
    }
  }

  update(points: number): void {
    const newText = `$ ${NumberFormatter.format(points)}`;
    if (newText !== this.lastPointsText) {
      this.pointsDisplay.textContent = newText;
      this.lastPointsText = newText;
    }
  }

  updateStats(dps: number, passive: number, critChance: number, critBonus: number = 0): void {
    const dpsText = `⚔️ ${t('hud.dps')}: ${NumberFormatter.format(dps)}`;
    const passiveText = `🏭 ${t('hud.passive')}: ${NumberFormatter.format(passive)}${t('hud.perSec')}`;
    
    // Calculate total income (passive + active combat income)
    // DPS represents active income from combat since damage = points
    const totalIncome = passive + dps;
    const totalIncomeText = `💰 Total Income: ${NumberFormatter.format(totalIncome)}${t('hud.perSec')}`;
    
    // Show crit chance with power-up bonus if active
    const totalCritChance = critChance + critBonus;
    let critText = `✨ ${t('hud.crit')}: ${NumberFormatter.formatDecimal(totalCritChance, 1)}%`;
    if (critBonus > 0) {
      critText += ` (+${NumberFormatter.formatDecimal(critBonus, 1)}%)`;
    }

    if (this.dpsDisplay && dpsText !== this.lastStatsText.dps) {
      this.dpsDisplay.textContent = dpsText;
      this.lastStatsText.dps = dpsText;
    }
    if (this.passiveDisplay && passiveText !== this.lastStatsText.passive) {
      this.passiveDisplay.textContent = passiveText;
      this.lastStatsText.passive = passiveText;
    }
    if (this.totalIncomeDisplay && totalIncomeText !== this.lastStatsText.totalIncome) {
      this.totalIncomeDisplay.textContent = totalIncomeText;
      this.lastStatsText.totalIncome = totalIncomeText;
    }
    if (this.critDisplay && critText !== this.lastStatsText.crit) {
      this.critDisplay.textContent = critText;
      this.lastStatsText.crit = critText;
      // Highlight if power-up is active
      if (critBonus > 0) {
        this.critDisplay.style.color = '#ffff00';
        this.critDisplay.style.textShadow = '0 0 8px #ffff00';
      } else {
        this.critDisplay.style.color = '#fff';
        this.critDisplay.style.textShadow = '0 0 2px rgba(255, 255, 255, 0.8), 0 1px 0 #000, 0 -1px 0 #000';
      }
    }
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

    // Add visual feedback for milestone levels - White text with minimal shadow
    if (level % 10 === 0 && level > 0) {
      this.levelText.style.color = '#fff';
      this.levelText.style.textShadow = '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000';
    } else if (level % 5 === 0) {
      this.levelText.style.color = '#fff';
      this.levelText.style.textShadow = '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000';
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
