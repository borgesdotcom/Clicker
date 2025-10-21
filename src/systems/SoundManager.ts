export class SoundManager {
  private enabled = true;
  private context: AudioContext | null = null;
  private volume = 0.3;

  constructor() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
      this.enabled = false;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = this.volume): void {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  playClick(): void {
    // Cookie clicker style "bonk" sound
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    // Quick descending pitch for "bonk" effect
    oscillator.frequency.setValueAtTime(800, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.08);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.25 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.08);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.08);
  }

  // Crit sounds removed to prevent endgame spam

  playPurchase(): void {
    // Satisfying "ka-ching" purchase sound
    if (!this.enabled || !this.context) return;

    // Quick ascending notes with more punch
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'triangle', 0.22 * this.volume);
      }, i * 40);
    });

    // Add a low "thump" at the start
    this.playTone(100, 0.08, 'square', 0.3 * this.volume);
  }

  playLevelUp(): void {
    // Big satisfying level up fanfare
    if (!this.enabled || !this.context) return;

    [392, 523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'triangle', 0.25 * this.volume);
      }, i * 55);
    });

    // Add bass "boom" at the end
    setTimeout(() => {
      this.playTone(98, 0.3, 'sine', 0.35 * this.volume);
    }, 280);
  }

  playBossAppear(): void {
    // Ominous descending tone
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.5);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.5);
  }

  playBossDefeat(): void {
    // Epic victory
    if (!this.enabled || !this.context) return;

    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'triangle', 0.25 * this.volume);
      }, i * 80);
    });
  }

  playCombo(comboLevel: number): void {
    // Satisfying combo "pop" that gets higher with combo level
    if (!this.enabled || !this.context) return;

    const basePitch = 600 + (comboLevel * 30);
    const pitch = Math.min(basePitch, 1500);

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(pitch, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.context.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  playAchievement(): void {
    // Epic achievement fanfare
    if (!this.enabled || !this.context) return;

    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.18, 'triangle', 0.25 * this.volume);
      }, i * 45);
    });

    // Add bass "boom" for extra impact
    setTimeout(() => {
      this.playTone(130, 0.25, 'sine', 0.4 * this.volume);
    }, 225);
  }

  playMetronomeTick(): void {
    // Short tick sound for metronome
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(1200, this.context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.05);
  }

  playPerfectHit(): void {
    // Satisfying "ding" for perfect rhythm hit
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(1500, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(2000, this.context.currentTime + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.25 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  playMissSound(): void {
    // Disappointing "buzz" for missed beat
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.15);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.15);
  }
}


