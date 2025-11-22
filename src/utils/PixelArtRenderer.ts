import type { PixelGrid } from '../render/AlienSprites';

/**
 * Pixel Art Renderer
 * Converts pixel art grids into canvas/data URLs for use as icons
 */

export interface PixelArtColorScheme {
  primary: string;      // Color 1
  secondary: string;    // Color 2
  highlight: string;    // Color 3
  accent: string;       // Color 4
  transparent: string;  // Color 0
}

export class PixelArtRenderer {
  /**
   * Default color schemes for different upgrade types
   */
  private static readonly COLOR_SCHEMES: Record<string, PixelArtColorScheme> = {
    damage: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#ff3333',      // Bright red (dark base)
      secondary: '#ff6666',    // Light red
      highlight: '#ffcccc',    // Very light red/pink
      accent: '#990000',       // Dark red/maroon
    },
    ship: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#3366ff',      // Blue
      secondary: '#6699ff',    // Light blue
      highlight: '#ffffff',    // White
      accent: '#001133',       // Dark blue
    },
    attackSpeed: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#ffaa00',      // Orange
      secondary: '#ffcc66',    // Light orange
      highlight: '#ffff99',    // Yellow-white
      accent: '#663300',       // Brown
    },
    pointMultiplier: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#cc00cc',      // Purple (energy blade)
      secondary: '#ff66ff',    // Light purple
      highlight: '#ffffff',    // White glow
      accent: '#330033',       // Dark purple
    },
    critChance: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#ff6600',      // Orange-red (target)
      secondary: '#ffaa00',    // Light orange
      highlight: '#ffff00',    // Yellow (impact)
      accent: '#cc0000',       // Dark red
    },
    energyCore: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#00cccc',      // Cyan
      secondary: '#66ffff',    // Light cyan
      highlight: '#ffffff',    // White
      accent: '#006666',       // Dark cyan
    },
    resourceGen: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#00aa00',      // Green (factory)
      secondary: '#66cc66',    // Light green
      highlight: '#99ff99',    // Very light green
      accent: '#003300',       // Dark green
    },
    xpBoost: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#ffcc00',      // Gold
      secondary: '#ffee66',    // Light gold
      highlight: '#ffffff',    // White
      accent: '#996600',       // Dark gold
    },
    mutationEngine: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#00ff00',      // Bright green (DNA)
      secondary: '#66ff99',    // Light green
      highlight: '#ccffcc',    // Very light green
      accent: '#003300',       // Dark green
    },
    misc: {
      transparent: 'rgba(0, 0, 0, 0)',
      primary: '#6666cc',      // Purple-blue
      secondary: '#9999ff',    // Light purple-blue
      highlight: '#ccccff',    // Very light purple
      accent: '#333366',       // Dark purple-blue
    },
  };

  /**
   * Render a pixel art grid to a canvas
   */
  static renderToCanvas(
    grid: PixelGrid,
    colorScheme: PixelArtColorScheme,
    scale: number = 2
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const height = grid.length;
    const width = grid[0]?.length ?? 16;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    const colors = [
      colorScheme.transparent,
      colorScheme.primary,
      colorScheme.secondary,
      colorScheme.highlight,
      colorScheme.accent,
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelValue = grid[y]?.[x] ?? 0;
        const color = colors[pixelValue] ?? colorScheme.transparent;
        
        if (pixelValue !== 0) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    return canvas;
  }

  /**
   * Render a pixel art grid to a data URL
   */
  static renderToDataURL(
    grid: PixelGrid,
    upgradeId: string,
    scale: number = 2
  ): string {
    const colorScheme = (this.COLOR_SCHEMES[upgradeId] ?? this.COLOR_SCHEMES.misc) as PixelArtColorScheme;
    const canvas = this.renderToCanvas(grid, colorScheme, scale);
    return canvas.toDataURL('image/png');
  }

  /**
   * Get color scheme for an upgrade ID
   */
  static getColorScheme(upgradeId: string): PixelArtColorScheme {
    return (this.COLOR_SCHEMES[upgradeId] ?? this.COLOR_SCHEMES.misc) as PixelArtColorScheme;
  }

  /**
   * Render upgrade icon as IMG element
   */
  static renderToImage(
    grid: PixelGrid,
    upgradeId: string,
    size: number = 32,
    className?: string
  ): HTMLImageElement {
    const scale = Math.max(1, Math.floor(size / 16));
    const dataURL = this.renderToDataURL(grid, upgradeId, scale);
    
    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = `${upgradeId} icon`;
    img.width = 16 * scale;
    img.height = 16 * scale;
    img.style.imageRendering = 'pixelated';
    img.style.imageRendering = '-moz-crisp-edges';
    img.style.imageRendering = 'crisp-edges';
    
    if (className) {
      img.className = className;
    }
    
    return img;
  }
}

