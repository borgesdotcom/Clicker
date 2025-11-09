/* eslint-disable @typescript-eslint/no-unused-vars */
// Import sound files
import laserSound from '../sound/laser.mp3';
import popSound from '../sound/pop.mp3';
import soundtrackSound from '../sound/soundtrack.mp3';

export class SoundManager {
  private enabled = true;
  private soundtrackEnabled = true;
  private context: AudioContext | null = null;
  private volume = 0.3;
  private laserAudio: HTMLAudioElement | null = null;
  private popAudio: HTMLAudioElement | null = null;
  private soundtrackAudio: HTMLAudioElement | null = null;
  private readonly soundtrackVolumeRatio = 0.40; // Soundtrack is 40% of main volume

  constructor() {
    try {
      if (typeof window.AudioContext !== 'undefined') {
        this.context = new window.AudioContext();
      } else {
        const WebkitAudioContext = (
          window as Window & { webkitAudioContext?: typeof AudioContext }
        ).webkitAudioContext;
        if (WebkitAudioContext) {
          this.context = new WebkitAudioContext();
        }
      }

      // Load sound files
      if (typeof laserSound === 'string') {
        this.laserAudio = new Audio(laserSound);
        this.laserAudio.preload = 'auto';
        this.laserAudio.volume = this.volume * 0.70;
      }

      if (typeof popSound === 'string') {
        this.popAudio = new Audio(popSound);
        this.popAudio.preload = 'auto';
        this.popAudio.volume = Math.max(0, Math.min(1, this.volume * 1.4));
      }

      // Load soundtrack for background music
      if (typeof soundtrackSound === 'string') {
        this.soundtrackAudio = new Audio(soundtrackSound);
        this.soundtrackAudio.preload = 'auto';
        this.soundtrackAudio.loop = true;
        this.soundtrackAudio.volume = this.volume * this.soundtrackVolumeRatio;
      }
    } catch {
      console.warn('Audio not supported');
      this.enabled = false;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    // Pause/resume soundtrack based on enabled state and soundtrack setting
    if (this.soundtrackAudio) {
      if (enabled && this.soundtrackEnabled) {
        // Try to start soundtrack (will work if user has interacted)
        this.attemptSoundtrackStart();
      } else {
        // Pause if sound disabled or soundtrack disabled
        this.soundtrackAudio.pause();
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setSoundtrackEnabled(enabled: boolean): void {
    this.soundtrackEnabled = enabled;
    if (this.soundtrackAudio) {
      if (enabled && this.enabled) {
        // Ensure volume is set correctly before starting
        this.soundtrackAudio.volume = this.volume * this.soundtrackVolumeRatio;
        // Try to start soundtrack if enabled
        this.attemptSoundtrackStart();
      } else {
        // Stop soundtrack if disabled
        this.soundtrackAudio.pause();
      }
    }
  }

  isSoundtrackEnabled(): boolean {
    return this.soundtrackEnabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    // Update audio file volumes (clamp to [0, 1] to prevent IndexSizeError)
    if (this.laserAudio) {
      this.laserAudio.volume = Math.max(0, Math.min(1, this.volume * 0.70));
    }
    if (this.popAudio) {
      // Pop sound uses 140% of main volume
      this.popAudio.volume = Math.max(0, Math.min(1, this.volume * 1.4));
    }
    // Soundtrack uses a percentage of main volume based on ratio
    if (this.soundtrackAudio) {
      this.soundtrackAudio.volume = Math.max(0, Math.min(1, this.volume * this.soundtrackVolumeRatio));
    }
  }

  getVolume(): number {
    return this.volume;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = this.volume,
  ): void {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + duration,
    );

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  playClick(): void {
    // Play laser sound when player shoots
    if (!this.enabled || !this.laserAudio) return;

    // Try to start soundtrack on first user interaction (browser autoplay policy)
    this.attemptSoundtrackStart();

    // Resume AudioContext if suspended (required for some browsers)
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch((_error: unknown) => {
        // AudioContext resume error (silent fail for production)
      });
    }

    // Clone the audio to allow overlapping sounds (rapid fire)
    const audio = this.laserAudio.cloneNode() as HTMLAudioElement;
    // Laser sound uses 5% of main volume
    audio.volume = this.volume * 0.05;
    audio.play().catch((_error: unknown) => {
      // Ignore playback errors (e.g., user interaction required)
      // Laser sound playback error (silent fail for production)
    });
  }

  playPop(): void {
    // Play pop sound when alien dies
    if (!this.enabled || !this.popAudio) return;

    // Clone the audio to allow overlapping sounds (multiple pops)
    const audio = this.popAudio.cloneNode() as HTMLAudioElement;
    // Pop sound uses 140% of main volume (clamped to [0, 1])
    audio.volume = Math.max(0, Math.min(1, this.volume * 1.4));
    audio.play().catch((_error: unknown) => {
      // Ignore playback errors (e.g., user interaction required)
      // Pop sound playback error (silent fail for production)
    });
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
    oscillator.frequency.exponentialRampToValueAtTime(
      100,
      this.context.currentTime + 0.5,
    );
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.3 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.5,
    );

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

    const basePitch = 600 + comboLevel * 30;
    const pitch = Math.min(basePitch, 1500);

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(pitch, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      pitch * 0.5,
      this.context.currentTime + 0.1,
    );
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.1,
    );

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
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.05,
    );

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
    oscillator.frequency.exponentialRampToValueAtTime(
      2000,
      this.context.currentTime + 0.1,
    );
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.25 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.1,
    );

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
    oscillator.frequency.exponentialRampToValueAtTime(
      100,
      this.context.currentTime + 0.15,
    );
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2 * this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.15,
    );

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.15);
  }

  startSoundtrack(): void {
    // Start the background soundtrack
    // Note: May not work until user interaction due to browser autoplay policies
    this.attemptSoundtrackStart();
  }

  private attemptSoundtrackStart(): void {
    // Try to start soundtrack (will only succeed after user interaction due to autoplay policy)
    if (
      !this.enabled ||
      !this.soundtrackEnabled ||
      !this.soundtrackAudio ||
      !this.soundtrackAudio.paused
    ) {
      return;
    }

    // Resume AudioContext if suspended (required for some browsers)
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch((_error: unknown) => {
        // AudioContext resume error (silent fail for production)
      });
    }

    // Ensure volume is set correctly before playing (soundtrackAudio already checked above)
    this.soundtrackAudio.volume = this.volume * this.soundtrackVolumeRatio;

    this.soundtrackAudio.play().catch((_error: unknown) => {
      // Ignore playback errors - will retry on next user interaction
      // Soundtrack playback error (will retry silently)
    });
  }

  stopSoundtrack(): void {
    // Stop the background soundtrack
    if (this.soundtrackAudio) {
      this.soundtrackAudio.pause();
      this.soundtrackAudio.currentTime = 0;
    }
  }
}
