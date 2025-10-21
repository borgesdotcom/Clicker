import type { GameState } from '../types';
import type { Draw } from '../render/Draw';

export interface HarmonicState {
  streak: number;
  harmonicCores: number;
  tuningForkLevel: number;
  metronomePurchased: boolean;
  chorusLevel: number;
  quantizedRipplesLevel: number;
  sigils: {
    tempo: number;
    echo: number;
    focus: number;
  };
  echoAccumulator: number; // Tracks fractional echo lasers
}

export interface Beat {
  time: number; // Time in ms when beat should occur
  hit: boolean; // Whether this beat was successfully hit
}

export interface RhythmRing {
  rippleId: number;
  beats: Beat[];
  spawnTime: number;
  bpm: number;
  drift: number; // Random drift factor
}

export type HitTiming = 'perfect' | 'good' | 'miss';

export class HarmonicSystem {
  private state: HarmonicState;
  private rhythmRings: Map<number, RhythmRing> = new Map();
  private nextRippleId = 0;
  private baseBPM = 150; // 150 BPM = 400ms per beat
  private lastHitFeedback: { text: string; time: number; x: number; y: number } | null = null;
  private feedbackDuration = 500; // ms
  private hasActiveRhythmRing = false; // Only one rhythm ring active at a time

  constructor(initialState?: HarmonicState) {
    this.state = initialState ?? {
      streak: 0,
      harmonicCores: 0,
      tuningForkLevel: 0,
      metronomePurchased: false,
      chorusLevel: 0,
      quantizedRipplesLevel: 0,
      sigils: {
        tempo: 0,
        echo: 0,
        focus: 0,
      },
      echoAccumulator: 0,
    };
  }

  getState(): HarmonicState {
    return { ...this.state };
  }

  setState(state: HarmonicState): void {
    this.state = state;
  }

  /**
   * Register a new ripple spawn for rhythm tracking
   * Only creates a rhythm ring if there isn't one already active
   */
  registerRipple(x: number, y: number): number {
    // Only create a new rhythm ring if we don't have an active one
    if (this.hasActiveRhythmRing) {
      return -1; // Don't create a new ring
    }

    const rippleId = this.nextRippleId++;
    const beatInterval = 60000 / this.baseBPM; // ms per beat
    
    // Calculate drift based on Quantized Ripples upgrade
    const driftReduction = this.state.quantizedRipplesLevel * 0.1;
    const maxDrift = 0.03 * (1 - Math.min(driftReduction, 0.9)); // 3% base, reduced by upgrade
    const drift = 1 + (Math.random() * 2 - 1) * maxDrift; // ±3% (or less)

    // Create beats schedule (12 beats per ripple for longer engagement)
    const beats: Beat[] = [];
    const now = Date.now();
    for (let i = 1; i <= 12; i++) {
      beats.push({
        time: now + beatInterval * i * drift,
        hit: false,
      });
    }

    this.rhythmRings.set(rippleId, {
      rippleId,
      beats,
      spawnTime: now,
      bpm: this.baseBPM * drift,
      drift,
    });

    this.hasActiveRhythmRing = true;
    return rippleId;
  }

  /**
   * Handle a click/tap at a specific time and position
   */
  onPlayerClick(x: number, y: number, targetX: number, targetY: number): {
    timing: HitTiming;
    streakChange: number;
    echoCount: number;
    coresGained: number;
  } {
    const now = Date.now();
    const timingWindow = this.getTimingWindow();
    
    // Find the closest beat (past or future) across all active rhythm rings
    let closestBeat: { ring: RhythmRing; beat: Beat; distance: number; timeDiff: number } | null = null;

    for (const ring of this.rhythmRings.values()) {
      for (const beat of ring.beats) {
        if (beat.hit) continue; // Skip already hit beats
        
        const timeDiff = beat.time - now; // Positive = future, negative = past
        const distance = Math.abs(timeDiff);
        
        if (distance <= timingWindow && (!closestBeat || distance < closestBeat.distance)) {
          closestBeat = { ring, beat, distance, timeDiff };
        }
      }
    }

    if (closestBeat) {
      // Perfect hit!
      closestBeat.beat.hit = true;
      this.state.streak++;
      
      // Calculate echo count
      const baseEchoCount = 1; // Base: 1 echo per ship
      const chorusBonus = this.state.chorusLevel * 0.2;
      this.state.echoAccumulator += chorusBonus;
      
      // Spawn whole echoes, keep fractional part
      const wholeEchoes = Math.floor(this.state.echoAccumulator);
      this.state.echoAccumulator -= wholeEchoes;
      const totalEchoCount = baseEchoCount + wholeEchoes;

      // Check for Harmonic Core drops (every 10th Perfect)
      let coresGained = 0;
      if (this.state.streak % 10 === 0) {
        coresGained = 1;
        if (this.state.streak >= 50) coresGained += 1;
        if (this.state.streak >= 100) coresGained += 1;
        this.state.harmonicCores += coresGained;
      }

      // Show feedback based on accuracy
      let feedbackText = 'PERFECT!';
      if (closestBeat.distance > timingWindow * 0.7) {
        feedbackText = 'GOOD';
      } else if (closestBeat.distance < timingWindow * 0.3) {
        feedbackText = 'PERFECT!!';
      }

      this.lastHitFeedback = {
        text: feedbackText,
        time: now,
        x: targetX,
        y: targetY,
      };

      return {
        timing: 'perfect',
        streakChange: 1,
        echoCount: totalEchoCount,
        coresGained,
      };
    }

    // No beat found within window - this is a miss
    if (this.state.streak > 0) {
      // Soft reset
      const oldStreak = this.state.streak;
      const focusPenalty = 1.0 - (this.state.sigils.focus * 0.05);
      const penaltyDivisor = Math.max(3 * focusPenalty, 2); // Minimum divisor of 2
      this.state.streak = Math.floor(this.state.streak / penaltyDivisor);
      
      this.lastHitFeedback = {
        text: 'MISS',
        time: now,
        x: targetX,
        y: targetY,
      };

      return {
        timing: 'miss',
        streakChange: this.state.streak - oldStreak,
        echoCount: 0,
        coresGained: 0,
      };
    }

    return {
      timing: 'miss',
      streakChange: 0,
      echoCount: 0,
      coresGained: 0,
    };
  }

  /**
   * Get the current timing window (in ms) based on Tuning Fork upgrade
   */
  getTimingWindow(): number {
    const baseWindow = 110; // ±110ms
    const bonus = Math.min(this.state.tuningForkLevel * 10, 60); // +10ms per level, cap at +60ms
    return baseWindow + bonus;
  }

  /**
   * Get the damage multiplier based on current streak
   */
  getStreakMultiplier(): number {
    const S = this.state.streak;
    let bonus = 0;
    
    if (S <= 50) {
      bonus = S * 0.06;
    } else if (S <= 200) {
      bonus = 50 * 0.06 + (S - 50) * 0.02;
    } else {
      bonus = 50 * 0.06 + 150 * 0.02; // Hard cap at S=200
    }

    return 1 + bonus;
  }

  /**
   * Clean up old rhythm rings and check for missed beats
   */
  update(dt: number): void {
    const now = Date.now();
    const timingWindow = this.getTimingWindow();

    // Remove rings where all beats are done or expired
    for (const [id, ring] of this.rhythmRings.entries()) {
      const lastBeat = ring.beats[ring.beats.length - 1];
      if (!lastBeat) continue;
      
      // Ring is done if last beat was hit or expired
      if (lastBeat.hit || now > lastBeat.time + timingWindow * 3) {
        this.rhythmRings.delete(id);
        this.hasActiveRhythmRing = false; // Allow new rhythm ring to spawn
      }
    }
  }

  /**
   * Get the next beat time for visual indicators
   */
  getNextBeat(x: number, y: number): { time: number; progress: number } | null {
    const now = Date.now();
    const timingWindow = this.getTimingWindow();
    
    let closestBeat: { time: number; ring: RhythmRing } | null = null;

    for (const ring of this.rhythmRings.values()) {
      for (const beat of ring.beats) {
        if (beat.hit) continue;
        
        if (!closestBeat || beat.time < closestBeat.time) {
          closestBeat = { time: beat.time, ring };
        }
      }
    }

    if (closestBeat) {
      const beatInterval = 60000 / closestBeat.ring.bpm;
      const timeSinceSpawn = now - closestBeat.ring.spawnTime;
      const progress = (timeSinceSpawn % beatInterval) / beatInterval;
      
      return {
        time: closestBeat.time,
        progress,
      };
    }

    return null;
  }

  /**
   * Draw visual feedback and beat indicators
   */
  draw(drawer: Draw, ballX: number, ballY: number, ballRadius: number): void {
    const now = Date.now();

    // Draw beat indicators for metronome
    if (this.state.metronomePurchased) {
      const nextBeat = this.getNextBeat(ballX, ballY);
      if (nextBeat) {
        const timeToBeat = nextBeat.time - now;
        const timingWindow = this.getTimingWindow();
        
        // Draw timing window ring
        const ringRadius = ballRadius * 2.5;
        const windowProgress = Math.max(0, 1 - Math.abs(timeToBeat) / timingWindow);
        
        // Always show the ring if there's an active beat
        if (Math.abs(timeToBeat) < timingWindow * 2) {
          let ringColor = '#666666';
          let ringWidth = 2;
          let ringAlpha = 0.3;
          
          if (Math.abs(timeToBeat) < timingWindow) {
            // Within timing window
            ringColor = windowProgress > 0.7 ? '#00ff00' : '#ffff00';
            ringWidth = 3;
            ringAlpha = 0.5 + windowProgress * 0.5;
          }
          
          drawer.setStroke(ringColor, ringWidth);
          drawer.setAlpha(ringAlpha);
          drawer.circle(ballX, ballY, ringRadius, false);
          drawer.resetAlpha();
        }

        // Draw beat pulse when very close
        if (Math.abs(timeToBeat) < 150) {
          const pulseProgress = 1 - Math.abs(timeToBeat) / 150;
          const pulseSize = pulseProgress * 15;
          drawer.setStroke('#ffffff', 5);
          drawer.setAlpha(pulseProgress * 0.8);
          drawer.circle(ballX, ballY, ringRadius + pulseSize, false);
          drawer.resetAlpha();
        }

        // Draw countdown indicator
        if (Math.abs(timeToBeat) < 500 && timeToBeat > 0) {
          const countdownMs = Math.ceil(timeToBeat);
          drawer.setAlpha(0.7);
          drawer.text(
            `${countdownMs}ms`,
            ballX,
            ballY + ballRadius + 40,
            '#ffffff',
            '14px monospace',
            'center'
          );
          drawer.resetAlpha();
        }
      }
    }

    // Draw hit feedback text
    if (this.lastHitFeedback && now - this.lastHitFeedback.time < this.feedbackDuration) {
      const age = now - this.lastHitFeedback.time;
      const alpha = 1 - age / this.feedbackDuration;
      const yOffset = (age / this.feedbackDuration) * 40;
      
      drawer.setAlpha(alpha);
      let color = '#ff0000';
      let fontSize = '20px';
      
      if (this.lastHitFeedback.text.includes('PERFECT')) {
        color = '#00ff00';
        fontSize = '24px';
      } else if (this.lastHitFeedback.text === 'GOOD') {
        color = '#ffff00';
        fontSize = '20px';
      }
      
      drawer.text(
        this.lastHitFeedback.text,
        this.lastHitFeedback.x,
        this.lastHitFeedback.y - 60 - yOffset,
        color,
        `bold ${fontSize} monospace`,
        'center'
      );
      drawer.resetAlpha();
    }
  }

  /**
   * Purchase upgrades with points or harmonic cores
   */
  buyTuningFork(state: GameState): boolean {
    const cost = this.getTuningForkCost();
    if (state.points >= cost) {
      state.points -= cost;
      this.state.tuningForkLevel++;
      return true;
    }
    return false;
  }

  buyMetronome(state: GameState): boolean {
    const cost = 300;
    if (!this.state.metronomePurchased && state.points >= cost) {
      state.points -= cost;
      this.state.metronomePurchased = true;
      return true;
    }
    return false;
  }

  buyChorus(state: GameState): boolean {
    const cost = this.getChorusCost();
    if (state.points >= cost) {
      state.points -= cost;
      this.state.chorusLevel++;
      return true;
    }
    return false;
  }

  buyQuantizedRipples(state: GameState): boolean {
    const cost = this.getQuantizedRipplesCost();
    if (state.points >= cost) {
      state.points -= cost;
      this.state.quantizedRipplesLevel++;
      return true;
    }
    return false;
  }

  // Sigil purchases with Harmonic Cores
  buySigil(type: 'tempo' | 'echo' | 'focus'): boolean {
    const cost = this.getSigilCost(type);
    if (this.state.harmonicCores >= cost) {
      this.state.harmonicCores -= cost;
      this.state.sigils[type]++;
      return true;
    }
    return false;
  }

  // Cost calculations
  getTuningForkCost(): number {
    return Math.ceil(200 * Math.pow(1.35, this.state.tuningForkLevel));
  }

  getChorusCost(): number {
    return Math.ceil(500 * Math.pow(1.45, this.state.chorusLevel));
  }

  getQuantizedRipplesCost(): number {
    return Math.ceil(350 * Math.pow(1.4, this.state.quantizedRipplesLevel));
  }

  getSigilCost(type: 'tempo' | 'echo' | 'focus'): number {
    const level = this.state.sigils[type];
    return Math.ceil(5 * Math.pow(1.5, level));
  }

  getStreak(): number {
    return this.state.streak;
  }

  getHarmonicCores(): number {
    return this.state.harmonicCores;
  }

  reset(): void {
    this.state.streak = 0;
    this.rhythmRings.clear();
    this.lastHitFeedback = null;
    this.hasActiveRhythmRing = false;
  }

  // Keep some upgrades after ascension
  applyAscensionKeep(): void {
    // Keep first 2 levels of Tuning Fork
    const keepLevel = Math.min(this.state.tuningForkLevel, 2);
    this.state = {
      streak: 0,
      harmonicCores: this.state.harmonicCores, // Keep cores
      tuningForkLevel: keepLevel,
      metronomePurchased: this.state.metronomePurchased, // Keep metronome
      chorusLevel: 0,
      quantizedRipplesLevel: 0,
      sigils: { ...this.state.sigils }, // Keep sigils
      echoAccumulator: 0,
    };
    this.rhythmRings.clear();
  }
}

