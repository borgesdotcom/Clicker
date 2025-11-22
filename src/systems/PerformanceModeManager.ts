/**
 * Performance Mode Manager
 * Detects device capabilities and manages performance settings
 */

export enum PerformanceMode {
  HIGH = 'high',     // Desktop/high-end: Full effects
  MEDIUM = 'medium', // Good mobile: Reduced effects
  LOW = 'low',       // Weak mobile: Minimal effects
  AUTO = 'auto'      // Automatic detection
}

export interface PerformanceSettings {
  mode: PerformanceMode;
  particleMultiplier: number;    // 0.0 to 1.0
  enableShadows: boolean;
  enableGradients: boolean;
  enableComplexEffects: boolean;
  effectUpdateRate: number;      // Updates per second (15, 30, 60)
  maxParticles: number;
  simplifyShaders: boolean;
  reduceFilterQuality: boolean;
}

export class PerformanceModeManager {
  private detectedMode: PerformanceMode = PerformanceMode.MEDIUM;
  private currentSettings: PerformanceSettings;
  private userMode: PerformanceMode = PerformanceMode.AUTO;

  constructor() {
    this.detectedMode = this.detectPerformanceMode();
    this.currentSettings = this.getSettingsForMode(this.detectedMode);
  }

  /**
   * Detect device performance capabilities
   */
  private detectPerformanceMode(): PerformanceMode {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Check if tablet (larger screen mobile device)
    const isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(
      navigator.userAgent
    );

    // Device capabilities
    const dpr = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 2;
    const ram = (navigator as any).deviceMemory || 4; // GB (only in Chrome)
    const screenSize = window.innerWidth * window.innerHeight;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Performance score calculation
    let score = 0;

    // CPU cores
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else if (cores >= 2) score += 1;

    // RAM
    if (ram >= 8) score += 3;
    else if (ram >= 4) score += 2;
    else score += 1;

    // Device type
    if (!isMobile && !isTablet) score += 3; // Desktop
    else if (isTablet) score += 1; // Tablet
    else score += 0; // Mobile phone

    // Screen resolution
    if (screenSize > 1920 * 1080) score += 2;
    else if (screenSize > 1280 * 720) score += 1;

    // Device Pixel Ratio (higher = more pixels to render)
    if (dpr <= 1.5) score += 1;
    else if (dpr >= 3) score -= 1;

    console.log('[Performance] Detection score:', score, {
      isMobile,
      isTablet,
      cores,
      ram,
      dpr,
      screenSize,
      hasTouch
    });

    // Determine mode based on score
    if (score >= 8) return PerformanceMode.HIGH;
    if (score >= 5) return PerformanceMode.MEDIUM;
    return PerformanceMode.LOW;
  }

  /**
   * Get performance settings for a specific mode
   */
  private getSettingsForMode(mode: PerformanceMode): PerformanceSettings {
    switch (mode) {
      case PerformanceMode.HIGH:
        return {
          mode: PerformanceMode.HIGH,
          particleMultiplier: 1.0,
          enableShadows: true,
          enableGradients: true,
          enableComplexEffects: true,
          effectUpdateRate: 60,
          maxParticles: 500,
          simplifyShaders: false,
          reduceFilterQuality: false
        };

      case PerformanceMode.MEDIUM:
        return {
          mode: PerformanceMode.MEDIUM,
          particleMultiplier: 0.5,
          enableShadows: false,
          enableGradients: true,
          enableComplexEffects: true,
          effectUpdateRate: 30,
          maxParticles: 200,
          simplifyShaders: false,
          reduceFilterQuality: true
        };

      case PerformanceMode.LOW:
        return {
          mode: PerformanceMode.LOW,
          particleMultiplier: 0.2,
          enableShadows: false,
          enableGradients: false,
          enableComplexEffects: false,
          effectUpdateRate: 20,
          maxParticles: 50,
          simplifyShaders: true,
          reduceFilterQuality: true
        };

      default:
        return this.getSettingsForMode(PerformanceMode.MEDIUM);
    }
  }

  /**
   * Set performance mode (can be overridden by user)
   */
  setMode(mode: PerformanceMode): void {
    this.userMode = mode;
    
    if (mode === PerformanceMode.AUTO) {
      this.currentSettings = this.getSettingsForMode(this.detectedMode);
    } else {
      this.currentSettings = this.getSettingsForMode(mode);
    }

    console.log('[Performance] Mode set to:', mode, 'Settings:', this.currentSettings);
  }

  /**
   * Get current performance settings
   */
  getSettings(): PerformanceSettings {
    return this.currentSettings;
  }

  /**
   * Get current active mode
   */
  getCurrentMode(): PerformanceMode {
    if (this.userMode === PerformanceMode.AUTO) {
      return this.detectedMode;
    }
    return this.userMode;
  }

  /**
   * Get detected mode (what the system thinks is best)
   */
  getDetectedMode(): PerformanceMode {
    return this.detectedMode;
  }

  /**
   * Check if a specific feature should be enabled
   */
  shouldEnableFeature(feature: keyof Omit<PerformanceSettings, 'mode' | 'particleMultiplier' | 'effectUpdateRate' | 'maxParticles'>): boolean {
    return this.currentSettings[feature];
  }

  /**
   * Get particle count multiplier
   */
  getParticleMultiplier(): number {
    return this.currentSettings.particleMultiplier;
  }

  /**
   * Get effect update rate (FPS for effects)
   */
  getEffectUpdateRate(): number {
    return this.currentSettings.effectUpdateRate;
  }

  /**
   * Get maximum particle count
   */
  getMaxParticles(): number {
    return this.currentSettings.maxParticles;
  }

  /**
   * Check if mobile device
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Get performance recommendation text
   */
  getModeRecommendation(): string {
    const mode = this.getDetectedMode();
    switch (mode) {
      case PerformanceMode.HIGH:
        return 'Your device can handle all visual effects at maximum quality.';
      case PerformanceMode.MEDIUM:
        return 'Recommended: Medium quality for optimal performance.';
      case PerformanceMode.LOW:
        return 'Recommended: Low quality for smooth gameplay on your device.';
      default:
        return '';
    }
  }
}

