/**
 * Asset Preloader
 * Preloads all game assets (images, sounds, fonts) before starting the game
 */
import { images } from '../assets/images';
import laserSound from '../sound/laser.mp3';
import popSound from '../sound/pop.mp3';
import soundtrackSound from '../sound/soundtrack.ogg';
import bossSoundtrackSound from '../sound/bossbattlesoundtrack.ogg';
import buyClickSound from '../sound/buy-click.mp3';
import achievementSound from '../sound/achievement.mp3';
import shipGifSrc from '@/animations/littleships.gif';

export interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type PreloadCallback = (progress: PreloadProgress) => void;

export class AssetPreloader {
  private loadedCount = 0;
  private totalCount = 0;
  private onProgress: PreloadCallback | null = null;
  private imagePromises: Promise<void>[] = [];
  private soundPromises: Promise<void>[] = [];
  private fontPromise: Promise<void> | null = null;

  /**
   * Preload all game assets
   */
  async preloadAll(onProgress?: PreloadCallback): Promise<void> {
    this.onProgress = onProgress || null;
    this.loadedCount = 0;
    this.totalCount = 0;

    // Collect all assets to preload
    const imageUrls: string[] = [];
    const soundUrls: string[] = [];

    // Collect all image URLs
    // Menu icons
    Object.values(images.menu).forEach((url) => imageUrls.push(url));
    
    // General icons
    imageUrls.push(
      images.bossbattle,
      images.graph,
      images.stars,
      images.target,
      images.trophy,
      images.books,
      images.settings,
      images.art,
      images.hitmarker,
      images.satellite,
    );

    // Artifact icons
    Object.values(images.artifacts).forEach((url) => imageUrls.push(url));

    // Upgrade icons (generated URLs)
    Object.values(images.upgrades).forEach((url) => imageUrls.push(url));

    // Background GIFs
    Object.values(images.backgroundGifs).forEach((url) => imageUrls.push(url));

    // Ship GIF
    imageUrls.push(shipGifSrc);

    // Collect all sound URLs
    soundUrls.push(
      laserSound,
      popSound,
      soundtrackSound,
      bossSoundtrackSound,
      buyClickSound,
      achievementSound,
    );

    this.totalCount = imageUrls.length + soundUrls.length + 1; // +1 for font

    // Preload images
    this.imagePromises = imageUrls.map((url) => this.preloadImage(url));

    // Preload sounds
    this.soundPromises = soundUrls.map((url) => this.preloadSound(url));

    // Preload font
    this.fontPromise = this.preloadFont();

    // Wait for all assets to load
    await Promise.all([
      ...this.imagePromises,
      ...this.soundPromises,
      this.fontPromise,
    ]);
  }

  /**
   * Preload a single image
   */
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.incrementProgress();
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        this.incrementProgress();
        resolve(); // Continue even if one image fails
      };
      img.src = url;
    });
  }

  /**
   * Preload a single sound
   */
  private preloadSound(url: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'auto';
      
      const handleCanPlay = () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        this.incrementProgress();
        resolve();
      };

      const handleError = () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        console.warn(`Failed to preload sound: ${url}`);
        this.incrementProgress();
        resolve(); // Continue even if one sound fails
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.src = url;
      
      // Try to load the audio
      audio.load();
      
      // Timeout fallback (some browsers may not fire canplaythrough)
      setTimeout(() => {
        if (audio.readyState >= 2) {
          // HAVE_CURRENT_DATA or higher
          handleCanPlay();
        } else {
          handleError();
        }
      }, 5000);
    });
  }

  /**
   * Preload the game font
   */
  private preloadFont(): Promise<void> {
    return new Promise((resolve) => {
      const fontUrl = new URL('../animations/m5x7.ttf', import.meta.url).href;
      const fontFace = new FontFace('m5x7', `url(${fontUrl})`, {
        style: 'normal',
        weight: 'normal',
        display: 'swap',
      });

      fontFace
        .load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          this.incrementProgress();
          resolve();
        })
        .catch((error) => {
          console.warn('Failed to preload font:', error);
          this.incrementProgress();
          resolve(); // Continue even if font fails
        });
    });
  }

  /**
   * Increment progress and notify callback
   */
  private incrementProgress(): void {
    this.loadedCount++;
    const percentage = Math.min(
      100,
      Math.round((this.loadedCount / this.totalCount) * 100),
    );

    if (this.onProgress) {
      this.onProgress({
        loaded: this.loadedCount,
        total: this.totalCount,
        percentage,
      });
    }
  }
}

