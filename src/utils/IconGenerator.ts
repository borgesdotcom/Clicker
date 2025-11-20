import { PixelGrid } from '@/render/UpgradeSprites';

/**
 * Icon Generator - Creates SVG icons to replace emojis
 * Provides a more professional, consistent look
 */

/**
 * Generates a Data URL for a pixel sprite
 * @param sprite The pixel grid to render
 * @param color The base color for the sprite
 * @param size The output size of the image (square)
 */
export function generateIconUrl(sprite: PixelGrid, color: string, size: number = 64): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const rows = sprite.length;
  if (rows === 0) return '';
  const firstRow = sprite[0];
  if (!firstRow) return '';
  const cols = firstRow.length;

  const pixelW = size / cols;
  const pixelH = size / rows;

  // Helper to adjust color brightness
  const adjustColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  // Clear
  ctx.clearRect(0, 0, size, size);

  // Draw
  for (let r = 0; r < rows; r++) {
    const row = sprite[r];
    if (!row) continue;
    for (let c = 0; c < cols; c++) {
      const type = row[c];
      if (type === undefined || type === 0) continue;

      let pixelColor = color;
      if (type === 2) pixelColor = adjustColor(color, -40); // Shade
      if (type === 3) pixelColor = adjustColor(color, 40);  // Highlight
      if (type === 4) pixelColor = '#1a1a1a';               // Dark/Outline

      ctx.fillStyle = pixelColor;
      // Draw slightly larger to avoid gaps
      ctx.fillRect(c * pixelW, r * pixelH, pixelW + 0.5, pixelH + 0.5);
    }
  }

  return canvas.toDataURL('image/png');
}

export class IconGenerator {
  /**
   * Get SVG icon for upgrade by ID
   */
  static getUpgradeIcon(upgradeId: string): string {
    const iconMap: Record<string, string> = {
      // Original upgrades
      auto_fire: this.createFireIcon(),
      death_pact: this.createSkullIcon(),
      laser_focusing: this.createDiamondIcon(),
      quantum_targeting: this.createTargetIcon(),
      energy_recycling: this.createRecycleIcon(),
      overclocked_reactors: this.createAtomIcon(),
      ship_swarm: this.createSwarmIcon(),
      neural_link: this.createBrainIcon(),
      antimatter_rounds: this.createExplosionIcon(),
      warp_core: this.createWarpIcon(),
      ai_optimizer: this.createRobotIcon(),
      perfect_precision: this.createStarIcon(),
      void_channeling: this.createVoidIcon(),
      temporal_acceleration: this.createClockIcon(),
      singularity_core: this.createSingularityIcon(),
      cosmic_ascension: this.createCosmicIcon(),
      // New V1.0 Upgrades
      coffee_machine: this.createCoffeeIcon(),
      lucky_dice: this.createDiceIcon(),
      space_pizza: this.createPizzaIcon(),
      rubber_duck: this.createDuckIcon(),
      falafel_rollo_special: this.createFoodIcon(),
      motivational_posters: this.createPosterIcon(),
      disco_ball: this.createDiscoIcon(),
      lucky_horseshoe: this.createHorseshoeIcon(),
      arcade_machine: this.createArcadeIcon(),
      chaos_emeralds: this.createEmeraldIcon(),
      time_machine: this.createTimeIcon(),
      philosophers_stone: this.createStoneIcon(),
      golden_goose: this.createGooseIcon(),
      infinity_gauntlet: this.createGauntletIcon(),
      alien_cookbook: this.createBookIcon(),
      nuclear_reactor: this.createNuclearIcon(),
      cheat_codes: this.createGameIcon(),
      dragon_egg: this.createEggIcon(),
      universe_map: this.createMapIcon(),
      answer_to_everything: this.createNumberIcon('42'),
      heart_of_galaxy: this.createHeartIcon(),
      meaning_of_life: this.createCrystalIcon(),
      // Click-focused upgrades
      master_clicker: this.createClickIcon(),
      click_multiplier: this.createSparkleIcon(),
      super_clicker: this.createPowerIcon(),
      // Powerup icons
      powerup_points: this.createMoneyIcon(),
      powerup_damage: this.createSwordIcon(),
      powerup_speed: this.createLightningIcon(),
      powerup_multishot: this.createSparkleIcon(),
      powerup_critical: this.createExplosionIcon(),
    };

    return iconMap[upgradeId] || this.createStarIcon();
  }

  /**
   * Create SVG wrapper with consistent styling
   */
  private static createSVG(
    viewBox: string,
    paths: string,
    width: number = 24,
    height: number = 24,
  ): string {
    return `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${paths}
    </svg>`;
  }

  // Fire icon
  private static createFireIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2C8 6 6 10 6 14C6 18 8 20 12 20C16 20 18 18 18 14C18 10 16 6 12 2Z" fill="#ff6b35" stroke="#ff4500" stroke-width="1"/>
       <path d="M12 6C10 8 9 10 9 12C9 13 9.5 13.5 10.5 13.5C11.5 13.5 12 13 12 12C12 10 13 8 15 6Z" fill="#ffcc00"/>`,
    );
  }

  // Skull icon
  private static createSkullIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="9" cy="10" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
       <circle cx="15" cy="10" r="3" fill="#fff" stroke="#333" stroke-width="1"/>
       <circle cx="9" cy="10" r="1" fill="#000"/>
       <circle cx="15" cy="10" r="1" fill="#000"/>
       <path d="M8 14C8 16 9 18 12 18C15 18 16 16 16 14" stroke="#333" stroke-width="2" fill="none"/>
       <path d="M6 8C6 6 7 5 9 5H15C17 5 18 6 18 8" stroke="#333" stroke-width="2" fill="none"/>`,
    );
  }

  // Diamond icon
  private static createDiamondIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L18 8L12 22L6 8L12 2Z" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <path d="M12 2L18 8L12 10L6 8L12 2Z" fill="#ffffff" opacity="0.3"/>`,
    );
  }

  // Target icon
  private static createTargetIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="10" fill="none" stroke="#66ccff" stroke-width="2"/>
       <circle cx="12" cy="12" r="6" fill="none" stroke="#66ccff" stroke-width="1.5"/>
       <circle cx="12" cy="12" r="2" fill="#66ccff"/>`,
    );
  }

  // Recycle icon
  private static createRecycleIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M6 9L3 12L6 15" stroke="#66ffcc" stroke-width="2" fill="none" stroke-linecap="round"/>
       <path d="M18 9L21 12L18 15" stroke="#66ffcc" stroke-width="2" fill="none" stroke-linecap="round"/>
       <path d="M3 12H21" stroke="#66ffcc" stroke-width="1.5" opacity="0.5"/>
       <path d="M12 3L9 12L12 21" stroke="#66ffcc" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    );
  }

  // Atom icon
  private static createAtomIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="2" fill="#66ccff"/>
       <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="#66ccff" stroke-width="1.5" opacity="0.6"/>
       <ellipse cx="12" cy="12" rx="3" ry="8" fill="none" stroke="#66ccff" stroke-width="1.5" opacity="0.6" transform="rotate(45 12 12)"/>`,
    );
  }

  // Swarm icon
  private static createSwarmIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="8" cy="8" r="2" fill="#66ccff"/>
       <circle cx="16" cy="8" r="2" fill="#66ccff"/>
       <circle cx="12" cy="16" r="2" fill="#66ccff"/>
       <path d="M8 8L12 16M16 8L12 16" stroke="#66ccff" stroke-width="1" opacity="0.4"/>`,
    );
  }

  // Brain icon
  private static createBrainIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 4C10 4 8 5 7 7C6 8 6 10 7 11C7.5 11.5 8 12 8 13C8 14 7 15 6 15C5 15 4 16 4 17C4 18 5 19 6 19C7 19 8 18 9 17C9.5 16.5 10.5 16.5 11 17C12 18 13 19 14 19C15 19 16 18 16 17C16 16 15 15 14 15C13 15 12 14 12 13C12 12 12.5 11.5 13 11C14 10 14 8 13 7C12 5 10 4 12 4Z" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>`,
    );
  }

  // Explosion icon
  private static createExplosionIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill="#ffcc66" stroke="#ff9900" stroke-width="1"/>
       <circle cx="12" cy="10" r="3" fill="#ffff66" opacity="0.6"/>`,
    );
  }

  // Warp icon
  private static createWarpIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2C8 2 5 5 5 9C5 13 8 16 12 16C16 16 19 13 19 9C19 5 16 2 12 2Z" fill="none" stroke="#66ccff" stroke-width="2"/>
       <path d="M12 6C10 6 8 7 8 9C8 11 10 12 12 12C14 12 16 11 16 9C16 7 14 6 12 6Z" fill="#66ccff" opacity="0.3"/>
       <path d="M12 2L12 22M2 12L22 12" stroke="#66ccff" stroke-width="1" opacity="0.3"/>`,
    );
  }

  // Robot icon
  private static createRobotIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="8" y="6" width="8" height="10" fill="#66ccff" stroke="#00b3ff" stroke-width="1" rx="1"/>
       <circle cx="11" cy="10" r="1" fill="#fff"/>
       <circle cx="13" cy="10" r="1" fill="#fff"/>
       <rect x="10" y="12" width="4" height="2" fill="#00b3ff" rx="0.5"/>
       <rect x="6" y="8" width="2" height="2" fill="#66ccff" rx="0.5"/>
       <rect x="16" y="8" width="2" height="2" fill="#66ccff" rx="0.5"/>`,
    );
  }

  // Star icon
  private static createStarIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L14.5 9L22 9L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9L9.5 9L12 2Z" fill="#ffff66" stroke="#ffcc00" stroke-width="1"/>`,
    );
  }

  // Void icon
  private static createVoidIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="10" fill="#1a0033" stroke="#66ccff" stroke-width="2"/>
       <circle cx="12" cy="12" r="6" fill="#330066" opacity="0.5"/>
       <circle cx="12" cy="12" r="2" fill="#66ccff"/>`,
    );
  }

  // Clock icon
  private static createClockIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="9" fill="none" stroke="#66ccff" stroke-width="2"/>
       <path d="M12 6V12L16 14" stroke="#66ccff" stroke-width="2" stroke-linecap="round"/>
       <circle cx="12" cy="12" r="1" fill="#66ccff"/>`,
    );
  }

  // Singularity icon
  private static createSingularityIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="10" fill="#000" stroke="#66ccff" stroke-width="2"/>
       <circle cx="12" cy="12" r="6" fill="#1a1a1a"/>
       <circle cx="12" cy="12" r="2" fill="#66ccff"/>`,
    );
  }

  // Cosmic icon
  private static createCosmicIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="8" fill="#66ccff" opacity="0.2" stroke="#66ccff" stroke-width="1"/>
       <circle cx="12" cy="12" r="4" fill="#66ffcc" opacity="0.4"/>
       <circle cx="12" cy="12" r="1" fill="#fff"/>
       <path d="M12 2L12 22M2 12L22 12" stroke="#66ccff" stroke-width="1" opacity="0.3"/>`,
    );
  }

  // Coffee icon
  private static createCoffeeIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M6 8H16C17 8 18 9 18 10V16C18 17 17 18 16 18H6V8Z" fill="#8B4513" stroke="#654321" stroke-width="1"/>
       <path d="M6 8H16V6C16 5 15 4 14 4H8C7 4 6 5 6 6V8Z" fill="#A0522D"/>
       <path d="M18 10H20C21 10 22 11 22 12V14C22 15 21 16 20 16H18V10Z" fill="#8B4513"/>
       <path d="M8 10H14V12H8V10Z" fill="#fff" opacity="0.3"/>`,
    );
  }

  // Dice icon
  private static createDiceIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="6" y="6" width="12" height="12" fill="#fff" stroke="#333" stroke-width="1.5" rx="2"/>
       <circle cx="9" cy="9" r="1" fill="#000"/>
       <circle cx="15" cy="15" r="1" fill="#000"/>
       <circle cx="9" cy="15" r="1" fill="#000"/>
       <circle cx="15" cy="9" r="1" fill="#000"/>
       <circle cx="12" cy="12" r="1" fill="#000"/>`,
    );
  }

  // Pizza icon
  private static createPizzaIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#ffcc66" stroke="#ff9900" stroke-width="1"/>
       <circle cx="9" cy="9" r="1" fill="#ff0000"/>
       <circle cx="15" cy="9" r="1" fill="#ff0000"/>
       <circle cx="12" cy="15" r="1" fill="#ff0000"/>`,
    );
  }

  // Duck icon
  private static createDuckIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<ellipse cx="10" cy="14" rx="6" ry="4" fill="#ffcc00" stroke="#ff9900" stroke-width="1"/>
       <circle cx="8" cy="12" r="3" fill="#ffcc00"/>
       <circle cx="9" cy="11" r="1" fill="#000"/>
       <path d="M11 10L13 8" stroke="#ff9900" stroke-width="1.5" stroke-linecap="round"/>`,
    );
  }

  // Food icon
  private static createFoodIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 4L14 10L20 12L14 14L12 20L10 14L4 12L10 10L12 4Z" fill="#8B4513" stroke="#654321" stroke-width="1"/>
       <circle cx="12" cy="12" r="3" fill="#ffcc66"/>`,
    );
  }

  // Poster icon
  private static createPosterIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="6" y="4" width="12" height="16" fill="#fff" stroke="#66ccff" stroke-width="1.5" rx="1"/>
       <path d="M8 8H16M8 12H16M8 16H14" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>`,
    );
  }

  // Disco icon
  private static createDiscoIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="8" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <path d="M12 4L14 10L20 12L14 14L12 20L10 14L4 12L10 10L12 4Z" fill="#66ffcc" opacity="0.5"/>`,
    );
  }

  // Horseshoe icon
  private static createHorseshoeIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M8 6C8 8 9 10 11 12C9 14 8 16 8 18C8 20 10 20 12 18C14 20 16 20 16 18C16 16 15 14 13 12C15 10 16 8 16 6C16 4 14 4 12 6C10 4 8 4 8 6Z" fill="#ffcc00" stroke="#ff9900" stroke-width="1"/>`,
    );
  }

  // Arcade icon
  private static createArcadeIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="5" y="6" width="14" height="12" fill="#333" stroke="#66ccff" stroke-width="1.5" rx="2"/>
       <circle cx="10" cy="12" r="2" fill="#66ccff"/>
       <rect x="14" y="10" width="3" height="4" fill="#66ccff" rx="0.5"/>`,
    );
  }

  // Emerald icon
  private static createEmeraldIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L18 8L12 22L6 8L12 2Z" fill="#66ff99" stroke="#00ff66" stroke-width="1"/>
       <path d="M12 2L18 8L12 10L6 8L12 2Z" fill="#ffffff" opacity="0.3"/>`,
    );
  }

  // Time icon
  private static createTimeIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="8" y="4" width="8" height="4" fill="#66ccff" rx="1"/>
       <rect x="8" y="16" width="8" height="4" fill="#66ccff" rx="1"/>
       <rect x="4" y="8" width="4" height="8" fill="#66ccff" rx="1"/>
       <rect x="16" y="8" width="4" height="8" fill="#66ccff" rx="1"/>
       <circle cx="12" cy="12" r="4" fill="#66ffcc" opacity="0.3"/>`,
    );
  }

  // Stone icon
  private static createStoneIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M8 6C7 7 6 9 7 11C6 12 7 14 9 15C8 16 9 18 11 18C12 19 14 19 15 18C17 18 18 16 17 15C19 14 20 12 19 11C20 9 19 7 17 6C16 5 14 5 13 6C12 5 10 5 9 6C8 6 8 6 8 6Z" fill="#888" stroke="#666" stroke-width="1"/>`,
    );
  }

  // Goose icon
  private static createGooseIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<ellipse cx="12" cy="14" rx="5" ry="3" fill="#ffcc00" stroke="#ff9900" stroke-width="1"/>
       <ellipse cx="10" cy="12" rx="2" ry="3" fill="#ffcc00"/>
       <circle cx="10" cy="11" r="0.8" fill="#000"/>
       <path d="M8 10L6 8" stroke="#ff9900" stroke-width="1.5" stroke-linecap="round"/>`,
    );
  }

  // Gauntlet icon
  private static createGauntletIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="8" y="6" width="8" height="12" fill="#ffcc00" stroke="#ff9900" stroke-width="1" rx="1"/>
       <circle cx="10" cy="10" r="1.5" fill="#66ccff"/>
       <circle cx="14" cy="10" r="1.5" fill="#66ccff"/>
       <circle cx="12" cy="14" r="1.5" fill="#66ccff"/>`,
    );
  }

  // Book icon
  private static createBookIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M6 4H18V20H6V4Z" fill="#8B4513" stroke="#654321" stroke-width="1"/>
       <path d="M6 4H12V20H6V4Z" fill="#A0522D"/>
       <path d="M8 8H16M8 12H16M8 16H14" stroke="#fff" stroke-width="1" opacity="0.5"/>`,
    );
  }

  // Nuclear icon
  private static createNuclearIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="8" fill="#66ff99" opacity="0.3" stroke="#00ff66" stroke-width="2"/>
       <circle cx="12" cy="12" r="4" fill="#ffff66" opacity="0.5"/>
       <path d="M12 2L12 22M2 12L22 12" stroke="#00ff66" stroke-width="1.5"/>`,
    );
  }

  // Game icon
  private static createGameIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="6" y="6" width="12" height="12" fill="#333" stroke="#66ccff" stroke-width="1.5" rx="2"/>
       <circle cx="10" cy="10" r="1.5" fill="#66ccff"/>
       <circle cx="14" cy="10" r="1.5" fill="#66ccff"/>
       <rect x="10" y="14" width="4" height="2" fill="#66ccff" rx="0.5"/>`,
    );
  }

  // Egg icon
  private static createEggIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<ellipse cx="12" cy="14" rx="4" ry="6" fill="#ffcc00" stroke="#ff9900" stroke-width="1"/>
       <path d="M10 12C10 10 11 9 12 9C13 9 14 10 14 12" fill="#ffdd44" opacity="0.5"/>`,
    );
  }

  // Map icon
  private static createMapIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="4" y="4" width="16" height="16" fill="none" stroke="#66ccff" stroke-width="1.5" rx="1"/>
       <path d="M8 8H16M8 12H16M8 16H12" stroke="#66ccff" stroke-width="1"/>
       <circle cx="10" cy="10" r="1" fill="#66ccff"/>
       <circle cx="14" cy="14" r="1" fill="#66ccff"/>`,
    );
  }

  // Number icon
  private static createNumberIcon(num: string): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="4" y="4" width="16" height="16" fill="#66ccff" opacity="0.2" stroke="#66ccff" stroke-width="1.5" rx="2"/>
       <text x="12" y="17" font-family="monospace" font-size="12" font-weight="bold" fill="#66ccff" text-anchor="middle">${num}</text>`,
    );
  }

  // Heart icon
  private static createHeartIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 6C10 4 7 4 5 6C3 8 3 11 5 13C7 15 12 20 12 20C12 20 17 15 19 13C21 11 21 8 19 6C17 4 14 4 12 6Z" fill="#ff6666" stroke="#ff3333" stroke-width="1"/>`,
    );
  }

  // Crystal icon
  private static createCrystalIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L16 8L12 22L8 8L12 2Z" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <path d="M12 2L16 8L12 10L8 8L12 2Z" fill="#ffffff" opacity="0.4"/>
       <path d="M8 8L12 10L12 22L8 8Z" fill="#66ffcc" opacity="0.3"/>`,
    );
  }

  // Click icon
  private static createClickIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 4L14 10L20 12L14 14L12 20L10 14L4 12L10 10L12 4Z" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <circle cx="12" cy="12" r="2" fill="#fff"/>`,
    );
  }

  // Sparkle icon
  private static createSparkleIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L13 8L19 9L13 10L12 16L11 10L5 9L11 8L12 2Z" fill="#ffff66" stroke="#ffcc00" stroke-width="1"/>
       <circle cx="12" cy="9" r="1" fill="#fff"/>`,
    );
  }

  // Power icon
  private static createPowerIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L12 8" stroke="#66ccff" stroke-width="2" stroke-linecap="round"/>
       <path d="M8 6C6 8 5 10 5 12C5 16 8 19 12 19C16 19 19 16 19 12C19 10 18 8 16 6" stroke="#66ccff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    );
  }

  // Money icon (for powerup_points)
  private static createMoneyIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<circle cx="12" cy="12" r="8" fill="#ffcc00" stroke="#ff9900" stroke-width="1.5"/>
       <path d="M12 6V18M8 10C8 8 9 7 10 7H14C15 7 16 8 16 10C16 12 15 13 14 13H10C9 13 8 12 8 10Z" stroke="#ff9900" stroke-width="1.5" fill="none"/>
       <text x="12" y="16" font-family="Arial" font-size="8" font-weight="bold" fill="#ff9900" text-anchor="middle">$</text>`,
    );
  }

  // Sword icon (for powerup_damage)
  private static createSwordIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#ff4444" stroke="#cc0000" stroke-width="1"/>
       <rect x="11" y="10" width="2" height="12" fill="#ff4444" stroke="#cc0000" stroke-width="1"/>
       <path d="M8 20L16 20" stroke="#cc0000" stroke-width="2" stroke-linecap="round"/>
       <path d="M9 16L15 16" stroke="#cc0000" stroke-width="1" stroke-linecap="round"/>`,
    );
  }

  // Lightning icon (for powerup_speed)
  private static createLightningIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M13 2L5 14H11L10 22L19 10H13L14 2H13Z" fill="#ffff00" stroke="#ffcc00" stroke-width="1.5" stroke-linejoin="round"/>`,
    );
  }

  // Trophy icon (for achievements)
  private static createTrophyIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<path d="M8 4H16V8H18C19 8 20 9 20 10V12C20 13 19 14 18 14H16V18C16 19 15 20 14 20H10C9 20 8 19 8 18V14H6C5 14 4 13 4 12V10C4 9 5 8 6 8H8V4Z" fill="#ffcc00" stroke="#ff9900" stroke-width="1"/>
       <circle cx="12" cy="12" r="2" fill="#fff" opacity="0.5"/>`,
    );
  }

  // Graph icon (for statistics/credits)
  private static createGraphIcon(): string {
    return this.createSVG(
      '0 0 24 24',
      `<rect x="4" y="16" width="3" height="4" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <rect x="8" y="12" width="3" height="8" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <rect x="12" y="8" width="3" height="12" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <rect x="16" y="4" width="3" height="16" fill="#66ccff" stroke="#00b3ff" stroke-width="1"/>
       <path d="M5.5 16L9.5 12L13.5 8L17.5 4" stroke="#66ffcc" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  /**
   * Get trophy icon SVG
   */
  static getTrophyIcon(): string {
    return this.createTrophyIcon();
  }

  /**
   * Get graph icon SVG
   */
  static getGraphIcon(): string {
    return this.createGraphIcon();
  }
}
