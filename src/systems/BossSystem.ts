import type { GameState } from '../types';
import type { Draw } from '../render/Draw';

/**
 * BossSystem.ts - QTE-based boss encounter system
 * 
 * Implements a finite-state machine for boss fights with:
 * - Multiple phases based on boss HP
 * - QTE (Quick Time Event) mechanics with precision grading
 * - Smooth scaling formulas with softcaps for levels 1-1000+
 * - Visual feedback and telegraphs
 */

// ===== CONFIGURATION CONSTANTS =====
// Tune these values to adjust boss difficulty and rewards

/** Base boss HP at level 1 */
const BOSS_HP_BASE = 5000;

/** Boss HP exponent for exponential growth */
const BOSS_HP_EXPONENT = 1.18;

/** Level exponent for HP formula - creates gentle curve */
const BOSS_HP_LEVEL_EXP = 0.92;

/** Softcap thresholds - reduce growth at these levels */
const SOFTCAP_L1 = 200; // First softcap
const SOFTCAP_L2 = 500; // Second softcap
const SOFTCAP_L3 = 800; // Third softcap

/** Softcap exponent reductions (percentage) */
const SOFTCAP_REDUCTION_1 = 0.05; // -5% at level 200
const SOFTCAP_REDUCTION_2 = 0.08; // Additional -8% at level 500
const SOFTCAP_REDUCTION_3 = 0.12; // Additional -12% at level 800

/** Base reward multiplier for boss defeats */
const BOSS_REWARD_BASE = 10000;

/** Reward growth exponent */
const BOSS_REWARD_EXPONENT = 1.15;

/** Milestone bonus levels and multipliers */
const MILESTONES = [
  { level: 100, bonus: 5000 },
  { level: 250, bonus: 25000 },
  { level: 500, bonus: 100000 },
  { level: 750, bonus: 500000 },
  { level: 1000, bonus: 2000000 },
];

/** QTE timing windows (in seconds) */
const QTE_WINDOW_TAP = 0.8; // Time to press for tap QTEs
const QTE_WINDOW_HOLD = 1.2; // Time window for hold-and-release
const QTE_WINDOW_PATTERN = 0.6; // Time per input in pattern sequences

/** QTE grading thresholds (as percentage of window) */
const GRADE_PERFECT_MIN = 0.90; // Within 90% of perfect timing
const GRADE_GOOD_MIN = 0.70; // Within 70% of perfect timing
const GRADE_OKAY_MIN = 0.40; // Within 40% of perfect timing

/** Grade damage multipliers */
const GRADE_MULTIPLIERS = {
  miss: 0,
  okay: 0.8,
  good: 1.0,
  perfect: 1.5,
};

/** Phase count - boss has this many phases based on HP % */
const PHASE_COUNT = 5;

/** Attack patterns per phase increase */
const PATTERN_SPEED_INCREASE = 0.15; // +15% speed per phase

// ===== TYPE DEFINITIONS =====

export type BossState = 'idle' | 'intro' | 'active' | 'defeated' | 'enraged';
export type QTEType = 'tap' | 'hold' | 'pattern';
export type QTEGrade = 'miss' | 'okay' | 'good' | 'perfect';

export interface QTEPrompt {
  type: QTEType;
  startTime: number;
  duration: number;
  pattern?: string[]; // For pattern QTEs: ['Space', 'Space', 'Enter']
  patternIndex?: number; // Current index in pattern
}

export interface BossStats {
  level: number;
  maxHp: number;
  currentHp: number;
  phase: number;
  defeated: boolean;
}

export interface BossEncounterResult {
  victory: boolean;
  pointsGained: number;
  xpGained: number;
  grade: QTEGrade;
  perfectCount: number;
}

// ===== BOSS SYSTEM CLASS =====

export class BossSystem {
  private state: BossState = 'idle';
  private stats: BossStats | null = null;
  private currentQTE: QTEPrompt | null = null;
  private qteTimer = 0;
  private phaseTransitionTimer = 0;
  private attackCooldown = 0;
  private attackCooldownBase = 3.0; // Seconds between QTE prompts
  
  // Performance tracking
  private perfectCount = 0;
  private goodCount = 0;
  private okayCount = 0;
  private missCount = 0;
  
  // Visual feedback
  private lastGrade: QTEGrade | null = null;
  private gradeDisplayTimer = 0;
  private shakeIntensity = 0;
  
  // Callbacks
  private onDefeatCallback: ((result: BossEncounterResult) => void) | null = null;
  private onPhaseChangeCallback: ((phase: number) => void) | null = null;
  private onQTEResultCallback: ((grade: QTEGrade) => void) | null = null;
  
  /**
   * Spawn a new boss encounter
   * @param level - Game level for scaling
   */
  spawnBoss(level: number): void {
    const maxHp = this.calculateBossHP(level);
    
    this.stats = {
      level,
      maxHp,
      currentHp: maxHp,
      phase: 1,
      defeated: false,
    };
    
    this.state = 'intro';
    this.phaseTransitionTimer = 2.0; // 2 second intro
    this.resetPerformanceTracking();
  }
  
  /**
   * Calculate boss HP with smooth exponential scaling and softcaps
   */
  private calculateBossHP(level: number): number {
    let exponent = BOSS_HP_LEVEL_EXP;
    
    // Apply softcaps to reduce exponent at high levels
    if (level >= SOFTCAP_L3) {
      exponent -= SOFTCAP_REDUCTION_3;
    } else if (level >= SOFTCAP_L2) {
      exponent -= SOFTCAP_REDUCTION_2;
    } else if (level >= SOFTCAP_L1) {
      exponent -= SOFTCAP_REDUCTION_1;
    }
    
    // Formula: HP = BASE * (GROWTH)^(level^exponent)
    const hp = BOSS_HP_BASE * Math.pow(BOSS_HP_EXPONENT, Math.pow(level, exponent));
    
    return Math.floor(hp);
  }
  
  /**
   * Calculate rewards for defeating the boss
   */
  private calculateRewards(level: number): { points: number; xp: number } {
    // Base reward with exponential growth
    let points = BOSS_REWARD_BASE * Math.pow(BOSS_REWARD_EXPONENT, level);
    
    // Add milestone bonuses
    for (const milestone of MILESTONES) {
      if (level >= milestone.level) {
        points += milestone.bonus;
      }
    }
    
    // XP is proportional to level
    const xp = Math.floor(level * 50 + level * level * 2);
    
    // Bonus for perfect performance
    const perfectBonus = this.perfectCount / Math.max(1, this.getTotalQTEs());
    points *= (1 + perfectBonus * 0.5); // Up to +50% for all perfects
    
    return {
      points: Math.floor(points),
      xp: Math.floor(xp),
    };
  }
  
  /**
   * Update boss system state
   * @param dt - Delta time in seconds
   */
  update(dt: number): void {
    if (this.state === 'idle') return;
    
    // Update grade display timer
    if (this.gradeDisplayTimer > 0) {
      this.gradeDisplayTimer -= dt;
    }
    
    // Update shake effect
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 3);
    }
    
    // Handle intro transition
    if (this.state === 'intro') {
      this.phaseTransitionTimer -= dt;
      if (this.phaseTransitionTimer <= 0) {
        this.state = 'active';
        this.startNewQTE();
      }
      return;
    }
    
    // Handle active boss fight
    if (this.state === 'active' && this.stats) {
      // Update current QTE
      if (this.currentQTE) {
        this.qteTimer += dt;
        
        // Check if QTE expired
        if (this.qteTimer >= this.currentQTE.duration) {
          this.handleQTEResult('miss');
        }
      } else {
        // Wait for next QTE
        this.attackCooldown -= dt;
        if (this.attackCooldown <= 0) {
          this.startNewQTE();
        }
      }
      
      // Check for phase transitions based on HP
      this.updatePhase();
      
      // Check for enrage (time limit could be added here)
    }
  }
  
  /**
   * Update boss phase based on HP percentage
   */
  private updatePhase(): void {
    if (!this.stats) return;
    
    const hpPercent = this.stats.currentHp / this.stats.maxHp;
    const newPhase = Math.max(1, PHASE_COUNT - Math.floor(hpPercent * PHASE_COUNT) + 1);
    
    if (newPhase > this.stats.phase) {
      this.stats.phase = newPhase;
      this.phaseTransitionTimer = 1.0; // Brief pause for phase change
      if (this.onPhaseChangeCallback) {
        this.onPhaseChangeCallback(newPhase);
      }
    }
  }
  
  /**
   * Start a new QTE prompt
   */
  private startNewQTE(): void {
    if (!this.stats) return;
    
    // Choose QTE type based on phase
    const qteType = this.selectQTEType(this.stats.phase);
    const duration = this.getQTEDuration(qteType, this.stats.phase);
    
    this.currentQTE = {
      type: qteType,
      startTime: Date.now(),
      duration,
    };
    
    // For pattern QTEs, generate a sequence
    if (qteType === 'pattern') {
      const patternLength = Math.min(2 + this.stats.phase, 6);
      this.currentQTE.pattern = this.generatePattern(patternLength);
      this.currentQTE.patternIndex = 0;
    }
    
    this.qteTimer = 0;
    this.attackCooldown = this.getAttackCooldown(this.stats.phase);
  }
  
  /**
   * Select QTE type based on current phase
   */
  private selectQTEType(phase: number): QTEType {
    if (phase <= 2) {
      return 'tap';
    } else if (phase <= 4) {
      return Math.random() < 0.5 ? 'tap' : 'hold';
    } else {
      // Phase 5: all types including patterns
      const rand = Math.random();
      if (rand < 0.3) return 'tap';
      if (rand < 0.6) return 'hold';
      return 'pattern';
    }
  }
  
  /**
   * Get QTE duration adjusted for phase
   */
  private getQTEDuration(type: QTEType, phase: number): number {
    let baseDuration = QTE_WINDOW_TAP;
    
    if (type === 'hold') {
      baseDuration = QTE_WINDOW_HOLD;
    } else if (type === 'pattern') {
      baseDuration = QTE_WINDOW_PATTERN;
    }
    
    // Speed increases with phase
    const speedMultiplier = 1 - (phase - 1) * PATTERN_SPEED_INCREASE;
    return baseDuration * Math.max(0.5, speedMultiplier);
  }
  
  /**
   * Get attack cooldown (time between QTEs)
   */
  private getAttackCooldown(phase: number): number {
    return this.attackCooldownBase * Math.max(0.4, 1 - (phase - 1) * 0.15);
  }
  
  /**
   * Generate a random pattern sequence
   */
  private generatePattern(length: number): string[] {
    const keys = ['Space', 'Enter', 'Q', 'E'];
    const pattern: string[] = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(keys[Math.floor(Math.random() * keys.length)]!);
    }
    
    return pattern;
  }
  
  /**
   * Handle player input for QTE
   * @param key - Key pressed by player
   */
  handleInput(key: string): void {
    if (!this.currentQTE || this.state !== 'active') return;
    
    if (this.currentQTE.type === 'tap') {
      // Simple tap - grade based on timing
      const grade = this.gradeQTE(this.qteTimer, this.currentQTE.duration);
      this.handleQTEResult(grade);
      
    } else if (this.currentQTE.type === 'hold') {
      // Hold must be released near end of window
      const releaseTime = this.qteTimer;
      const targetTime = this.currentQTE.duration * 0.8; // Release at 80% of window
      const accuracy = 1 - Math.abs(releaseTime - targetTime) / targetTime;
      const grade = this.gradeAccuracy(accuracy);
      this.handleQTEResult(grade);
      
    } else if (this.currentQTE.type === 'pattern' && this.currentQTE.pattern) {
      // Check if correct key in pattern
      const expectedKey = this.currentQTE.pattern[this.currentQTE.patternIndex ?? 0];
      
      if (key.toLowerCase() === expectedKey?.toLowerCase() || key === expectedKey) {
        this.currentQTE.patternIndex = (this.currentQTE.patternIndex ?? 0) + 1;
        
        // Completed pattern?
        if (this.currentQTE.patternIndex >= this.currentQTE.pattern.length) {
          const grade = this.gradeQTE(this.qteTimer, this.currentQTE.duration);
          this.handleQTEResult(grade);
        }
      } else {
        // Wrong key = miss
        this.handleQTEResult('miss');
      }
    }
  }
  
  /**
   * Grade a QTE based on timing
   */
  private gradeQTE(timeTaken: number, timeWindow: number): QTEGrade {
    const accuracy = 1 - Math.abs(timeTaken - timeWindow * 0.5) / (timeWindow * 0.5);
    return this.gradeAccuracy(accuracy);
  }
  
  /**
   * Grade based on accuracy percentage
   */
  private gradeAccuracy(accuracy: number): QTEGrade {
    if (accuracy >= GRADE_PERFECT_MIN) return 'perfect';
    if (accuracy >= GRADE_GOOD_MIN) return 'good';
    if (accuracy >= GRADE_OKAY_MIN) return 'okay';
    return 'miss';
  }
  
  /**
   * Handle the result of a QTE
   */
  private handleQTEResult(grade: QTEGrade): void {
    // Track performance
    this.lastGrade = grade;
    this.gradeDisplayTimer = 1.5;
    
    switch (grade) {
      case 'perfect':
        this.perfectCount++;
        break;
      case 'good':
        this.goodCount++;
        break;
      case 'okay':
        this.okayCount++;
        break;
      case 'miss':
        this.missCount++;
        this.shakeIntensity = 1.0;
        break;
    }
    
    // Clear current QTE
    this.currentQTE = null;
    
    // Notify callback
    if (this.onQTEResultCallback) {
      this.onQTEResultCallback(grade);
    }
  }
  
  /**
   * Apply damage to boss (called after QTE with grade multiplier)
   * @param baseDamage - Base damage before QTE multiplier
   * @param grade - QTE grade for multiplier
   * @returns true if boss was defeated
   */
  applyDamage(baseDamage: number, grade: QTEGrade): boolean {
    if (!this.stats || this.state !== 'active') return false;
    
    const multiplier = GRADE_MULTIPLIERS[grade];
    const finalDamage = baseDamage * multiplier;
    
    this.stats.currentHp = Math.max(0, this.stats.currentHp - finalDamage);
    
    if (this.stats.currentHp <= 0) {
      this.onBossDefeated();
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle boss defeat
   */
  private onBossDefeated(): void {
    if (!this.stats) return;
    
    this.stats.defeated = true;
    this.state = 'defeated';
    
    const rewards = this.calculateRewards(this.stats.level);
    
    const result: BossEncounterResult = {
      victory: true,
      pointsGained: rewards.points,
      xpGained: rewards.xp,
      grade: this.getOverallGrade(),
      perfectCount: this.perfectCount,
    };
    
    if (this.onDefeatCallback) {
      this.onDefeatCallback(result);
    }
  }
  
  /**
   * Get overall performance grade for the encounter
   */
  private getOverallGrade(): QTEGrade {
    const total = this.getTotalQTEs();
    if (total === 0) return 'okay';
    
    const perfectRatio = this.perfectCount / total;
    if (perfectRatio >= 0.8) return 'perfect';
    if (perfectRatio >= 0.5) return 'good';
    if (perfectRatio >= 0.3) return 'okay';
    return 'miss';
  }
  
  private getTotalQTEs(): number {
    return this.perfectCount + this.goodCount + this.okayCount + this.missCount;
  }
  
  private resetPerformanceTracking(): void {
    this.perfectCount = 0;
    this.goodCount = 0;
    this.okayCount = 0;
    this.missCount = 0;
  }
  
  // ===== PUBLIC GETTERS =====
  
  isActive(): boolean {
    return this.state === 'active' || this.state === 'intro';
  }
  
  getState(): BossState {
    return this.state;
  }
  
  getStats(): BossStats | null {
    return this.stats;
  }
  
  getCurrentQTE(): QTEPrompt | null {
    return this.currentQTE;
  }
  
  getQTEProgress(): number {
    if (!this.currentQTE) return 0;
    return this.qteTimer / this.currentQTE.duration;
  }
  
  getLastGrade(): QTEGrade | null {
    return this.gradeDisplayTimer > 0 ? this.lastGrade : null;
  }
  
  getShakeIntensity(): number {
    return this.shakeIntensity;
  }
  
  getGradeMultiplier(grade: QTEGrade): number {
    return GRADE_MULTIPLIERS[grade];
  }
  
  // ===== CALLBACKS =====
  
  setOnDefeat(callback: (result: BossEncounterResult) => void): void {
    this.onDefeatCallback = callback;
  }
  
  setOnPhaseChange(callback: (phase: number) => void): void {
    this.onPhaseChangeCallback = callback;
  }
  
  setOnQTEResult(callback: (grade: QTEGrade) => void): void {
    this.onQTEResultCallback = callback;
  }
  
  /**
   * Render boss QTE UI
   */
  draw(drawer: Draw, canvasWidth: number, canvasHeight: number): void {
    if (this.state === 'idle') return;
    
    const ctx = drawer.getContext();
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Draw boss HP bar at top
    if (this.stats) {
      this.drawBossHP(ctx, centerX, 80);
    }
    
    // Draw current QTE prompt
    if (this.currentQTE && this.state === 'active') {
      this.drawQTEPrompt(ctx, centerX, centerY + 150);
    }
    
    // Draw grade feedback
    if (this.lastGrade && this.gradeDisplayTimer > 0) {
      this.drawGradeFeedback(ctx, centerX, centerY - 100);
    }
    
    // Draw phase indicator
    if (this.stats && this.stats.phase > 1) {
      this.drawPhaseIndicator(ctx, centerX, 40);
    }
  }
  
  private drawBossHP(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.stats) return;
    
    const width = 400;
    const height = 30;
    const hpPercent = this.stats.currentHp / this.stats.maxHp;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - width / 2, y, width, height);
    
    // HP fill with phase color
    const phaseColors = ['#ffffff', '#ffff00', '#ff8800', '#ff4400', '#ff0000'];
    const phaseColor = phaseColors[this.stats.phase - 1] ?? '#ff0000';
    
    ctx.fillStyle = phaseColor;
    ctx.fillRect(x - width / 2 + 2, y + 2, (width - 4) * hpPercent, height - 4);
    
    // Border
    ctx.strokeStyle = phaseColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2, y, width, height);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`BOSS HP: ${Math.ceil(hpPercent * 100)}%`, x, y + height / 2);
  }
  
  private drawQTEPrompt(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.currentQTE) return;
    
    const progress = this.getQTEProgress();
    const size = 120;
    
    // Draw timing circle
    ctx.save();
    ctx.translate(x, y);
    
    // Outer ring (window)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Progress arc
    ctx.strokeStyle = progress < 0.8 ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2 + 10, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
    ctx.stroke();
    
    // Inner prompt
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (this.currentQTE.type === 'tap') {
      ctx.fillText('SPACE', 0, 0);
    } else if (this.currentQTE.type === 'hold') {
      ctx.fillText('HOLD', 0, -10);
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Release!', 0, 15);
    } else if (this.currentQTE.type === 'pattern' && this.currentQTE.pattern) {
      const remaining = this.currentQTE.pattern.slice(this.currentQTE.patternIndex ?? 0);
      ctx.font = 'bold 20px Arial';
      ctx.fillText(remaining.join(' '), 0, 0);
    }
    
    ctx.restore();
  }
  
  private drawGradeFeedback(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.lastGrade) return;
    
    const alpha = this.gradeDisplayTimer / 1.5;
    const scale = 1 + (1 - alpha) * 0.5;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Grade colors
    const gradeColors = {
      perfect: '#ffff00',
      good: '#00ff00',
      okay: '#ff8800',
      miss: '#ff0000',
    };
    
    const gradeText = {
      perfect: 'PERFECT!',
      good: 'GOOD',
      okay: 'OKAY',
      miss: 'MISS',
    };
    
    ctx.fillStyle = gradeColors[this.lastGrade];
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Glow effect
    ctx.shadowColor = gradeColors[this.lastGrade];
    ctx.shadowBlur = 20;
    
    ctx.fillText(gradeText[this.lastGrade], 0, 0);
    
    ctx.restore();
  }
  
  private drawPhaseIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.stats) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`PHASE ${this.stats.phase}`, x, y);
  }
  
  /**
   * Reset the boss system
   */
  reset(): void {
    this.state = 'idle';
    this.stats = null;
    this.currentQTE = null;
    this.resetPerformanceTracking();
  }
}

