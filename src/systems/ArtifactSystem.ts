export type ArtifactRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ArtifactType =
  | 'damage'
  | 'speed'
  | 'critical'
  | 'points'
  | 'xp'
  | 'special';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: ArtifactRarity;
  type: ArtifactType;
  bonus: number;
  icon: string;
  level: number;
  maxLevel: number;
  equipped: boolean;
}

interface ArtifactTemplate {
  name: string;
  description: string;
  type: ArtifactType;
  baseBonus: number;
  icon: string;
  maxLevel: number;
}

const ARTIFACT_TEMPLATES: Record<ArtifactRarity, ArtifactTemplate[]> = {
  common: [
    {
      name: 'Rusty Laser Coil',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 5,
      icon: '/src/icons/artifacts/rusty_coil.png',
      maxLevel: 10,
    },
    {
      name: 'Basic Targeting System',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 3,
      icon: '/src/icons/artifacts/baisc_targeting_system.png',
      maxLevel: 10,
    },
    {
      name: 'Lucky Charm',
      description: '+{bonus}% crit chance',
      type: 'critical',
      baseBonus: 2,
      icon: '/src/icons/artifacts/lucky_charm.png',
      maxLevel: 10,
    },
    {
      name: 'Alien Head',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 4,
      icon: '/src/icons/artifacts/alien_head.png',
      maxLevel: 10,
    },
    {
      name: 'Battery Pack',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 4,
      icon: '/src/icons/artifacts/battery.png',
      maxLevel: 10,
    },
    {
      name: 'Cookie',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 6,
      icon: '/src/icons/artifacts/cookie.png',
      maxLevel: 10,
    },
    {
      name: 'Water Bottle',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 5,
      icon: '/src/icons/artifacts/water_bottle.png',
      maxLevel: 10,
    },
    {
      name: 'Small Meteor',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 6,
      icon: '/src/icons/artifacts/small_sized_meteor.png',
      maxLevel: 10,
    },
  ],
  rare: [
    {
      name: 'Alien Power Core',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 10,
      icon: '/src/icons/artifacts/alien_power_core.png',
      maxLevel: 15,
    },
    {
      name: 'Enhanced Capacitor',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 12,
      icon: '/src/icons/artifacts/enhance_capacitor.png',
      maxLevel: 15,
    },
    {
      name: 'Quantum Processor',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 8,
      icon: '/src/icons/artifacts/quantum_processor.png',
      maxLevel: 15,
    },
    {
      name: 'Anxiety Pills',
      description: '+{bonus}% crit chance',
      type: 'critical',
      baseBonus: 9,
      icon: '/src/icons/artifacts/anxiety_pills.png',
      maxLevel: 15,
    },
    {
      name: 'Gold Bar',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 12,
      icon: '/src/icons/artifacts/gold_bar.png',
      maxLevel: 15,
    },
    {
      name: 'Magnetizer',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 11,
      icon: '/src/icons/artifacts/magnetizer.png',
      maxLevel: 15,
    },
    {
      name: 'Satellite',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 10,
      icon: '/src/icons/artifacts/sattelite.png',
      maxLevel: 15,
    },
    {
      name: 'Strange Potion',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 9,
      icon: '/src/icons/artifacts/strange_potion.png',
      maxLevel: 15,
    },
    {
      name: 'Strange Key',
      description: '+{bonus}% crit chance',
      type: 'critical',
      baseBonus: 8,
      icon: '/src/icons/artifacts/strange_key.png',
      maxLevel: 15,
    },
    {
      name: 'Lollipop',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 7,
      icon: '/src/icons/artifacts/lolipop.png',
      maxLevel: 15,
    },
    {
      name: 'Credit Card',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 13,
      icon: '/src/icons/artifacts/credit_card.png',
      maxLevel: 15,
    },
    {
      name: 'Moon Fragment',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 14,
      icon: '/src/icons/artifacts/moon.png',
      maxLevel: 15,
    },
  ],
  epic: [
    {
      name: 'Plasma Reactor',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 20,
      icon: '/src/icons/artifacts/plasma_reactor.png',
      maxLevel: 20,
    },
    {
      name: 'Temporal Accelerator',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 15,
      icon: '/src/icons/artifacts/temporal_accelerator.png',
      maxLevel: 20,
    },
    {
      name: 'Fortune Fragment',
      description: '+{bonus}% crit damage',
      type: 'critical',
      baseBonus: 25,
      icon: '/src/icons/artifacts/fortune_fragment.png',
      maxLevel: 20,
    },
    {
      name: 'Adrenaline Injection',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 18,
      icon: '/src/icons/artifacts/adrenaline_injection.png',
      maxLevel: 20,
    },
    {
      name: 'Black Hole Core',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 22,
      icon: '/src/icons/artifacts/black_hole.png',
      maxLevel: 20,
    },
    {
      name: 'Galaxy Spiral',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 16,
      icon: '/src/icons/artifacts/galaxy_spiral.png',
      maxLevel: 20,
    },
    {
      name: 'Nuke Warhead',
      description: '+{bonus}% crit damage',
      type: 'critical',
      baseBonus: 28,
      icon: '/src/icons/artifacts/nuke.png',
      maxLevel: 20,
    },
  ],
  legendary: [
    {
      name: 'Heart of a Dying Star',
      description: '+{bonus}% all damage',
      type: 'damage',
      baseBonus: 35,
      icon: '/src/icons/artifacts/heart_of_dying_star.png',
      maxLevel: 25,
    },
    {
      name: 'Infinity Crystal',
      description: '+{bonus}% points and XP',
      type: 'special',
      baseBonus: 30,
      icon: '/src/icons/artifacts/infinity_cristals.png',
      maxLevel: 25,
    },
    {
      name: 'Cosmic Harmonizer',
      description: '+{bonus}% to all bonuses',
      type: 'special',
      baseBonus: 20,
      icon: '/src/icons/artifacts/cosmic_harmonizer.png',
      maxLevel: 25,
    },
    {
      name: 'Constellation Map',
      description: '+{bonus}% points and XP',
      type: 'special',
      baseBonus: 32,
      icon: '/src/icons/artifacts/constelation_map.png',
      maxLevel: 25,
    },
  ],
};

const RARITY_COLORS: Record<ArtifactRarity, string> = {
  common: '#9d9d9d',
  rare: '#4dabf7',
  epic: '#a855f7',
  legendary: '#ffa94d',
};

export class ArtifactSystem {
  private artifacts: Artifact[] = [];
  private equippedArtifacts: Artifact[] = [];
  private maxEquipped = 5;

  constructor() {
    this.load();
  }

  private load(): void {
    const saved = localStorage.getItem('artifacts');
    if (saved) {
      try {
        const data = JSON.parse(saved) as { artifacts?: Artifact[] };
        this.artifacts = data.artifacts ?? [];
        this.equippedArtifacts = this.artifacts.filter((a) => a.equipped);
      } catch (e) {
        console.error('Failed to load artifacts:', e);
      }
    }
  }

  private save(): void {
    const data = {
      artifacts: this.artifacts,
    };
    localStorage.setItem('artifacts', JSON.stringify(data));
  }

  public generateArtifact(rarity?: ArtifactRarity): Artifact {
    // Random rarity if not specified
    if (!rarity) {
      const rand = Math.random();
      if (rand < 0.5) rarity = 'common';
      else if (rand < 0.8) rarity = 'rare';
      else if (rand < 0.95) rarity = 'epic';
      else rarity = 'legendary';
    }

    const templates = ARTIFACT_TEMPLATES[rarity];
    const randomIndex = Math.floor(Math.random() * templates.length);
    const template = templates[randomIndex];
    if (!template) {
      // Fallback to first template if somehow undefined
      throw new Error('No artifact templates found');
    }

    const artifact: Artifact = {
      id: `artifact_${Date.now().toString()}_${Math.random().toString()}`,
      name: template.name,
      description: template.description.replace(
        '{bonus}',
        template.baseBonus.toString(),
      ),
      rarity,
      type: template.type,
      bonus: template.baseBonus,
      icon: template.icon,
      level: 1,
      maxLevel: template.maxLevel,
      equipped: false,
    };

    this.artifacts.push(artifact);
    this.save();
    return artifact;
  }

  public equipArtifact(artifactId: string): boolean {
    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return false;

    if (
      this.equippedArtifacts.length >= this.maxEquipped &&
      !artifact.equipped
    ) {
      return false; // Already at max equipped
    }

    artifact.equipped = !artifact.equipped;
    this.equippedArtifacts = this.artifacts.filter((a) => a.equipped);
    this.save();
    return true;
  }

  public upgradeArtifact(
    artifactId: string,
    points: number,
  ): { success: boolean; cost: number } {
    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact || artifact.level >= artifact.maxLevel) {
      return { success: false, cost: 0 };
    }

    const cost = this.getUpgradeCost(artifact);
    if (points < cost) {
      return { success: false, cost };
    }

    artifact.level++;
    artifact.bonus = this.calculateBonus(artifact);
    artifact.description = artifact.description.replace(
      /\d+/,
      artifact.bonus.toString(),
    );
    this.save();

    return { success: true, cost };
  }

  private calculateBonus(artifact: Artifact): number {
    const template = ARTIFACT_TEMPLATES[artifact.rarity].find(
      (t) => t.name === artifact.name,
    );
    if (!template) return artifact.bonus;

    return Math.floor(template.baseBonus * (1 + (artifact.level - 1) * 0.2));
  }

  private getUpgradeCost(artifact: Artifact): number {
    const baseCost = {
      common: 5000,
      rare: 15000,
      epic: 50000,
      legendary: 150000,
    }[artifact.rarity];

    return Math.floor(baseCost * Math.pow(1.5, artifact.level - 1));
  }

  public getUpgradeCostForDisplay(artifactId: string): number {
    const artifact = this.artifacts.find((a) => a.id === artifactId);
    return artifact ? this.getUpgradeCost(artifact) : 0;
  }

  public getDamageBonus(): number {
    let bonus = 0;
    let cosmicHarmonizerBonus = 0;
    
    // First, collect all damage bonuses and find Cosmic Harmonizer
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'damage') {
        bonus += artifact.bonus;
      } else if (artifact.name === 'Cosmic Harmonizer') {
        // Cosmic Harmonizer boosts all other bonuses
        cosmicHarmonizerBonus = artifact.bonus;
      }
    }
    
    // Apply Cosmic Harmonizer bonus to all damage bonuses
    if (cosmicHarmonizerBonus > 0 && bonus > 0) {
      bonus = bonus * (1 + cosmicHarmonizerBonus / 100);
    }
    
    return bonus / 100;
  }

  public getSpeedBonus(): number {
    let bonus = 0;
    let cosmicHarmonizerBonus = 0;
    
    // First, collect all speed bonuses and find Cosmic Harmonizer
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'speed') {
        bonus += artifact.bonus;
      } else if (artifact.name === 'Cosmic Harmonizer') {
        cosmicHarmonizerBonus = artifact.bonus;
      }
    }
    
    // Apply Cosmic Harmonizer bonus to all speed bonuses
    if (cosmicHarmonizerBonus > 0 && bonus > 0) {
      bonus = bonus * (1 + cosmicHarmonizerBonus / 100);
    }
    
    return bonus / 100;
  }

  public getCritBonus(): number {
    let bonus = 0;
    let cosmicHarmonizerBonus = 0;
    
    // First, collect all crit bonuses and find Cosmic Harmonizer
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'critical') {
        bonus += artifact.bonus;
      } else if (artifact.name === 'Cosmic Harmonizer') {
        cosmicHarmonizerBonus = artifact.bonus;
      }
    }
    
    // Apply Cosmic Harmonizer bonus to all crit bonuses
    if (cosmicHarmonizerBonus > 0 && bonus > 0) {
      bonus = bonus * (1 + cosmicHarmonizerBonus / 100);
    }
    
    return bonus / 100;
  }

  public getPointsBonus(): number {
    let bonus = 0;
    let cosmicHarmonizerBonus = 0;
    
    // First, collect all points bonuses and find special artifacts
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'points') {
        bonus += artifact.bonus;
      } else if (artifact.name === 'Infinity Crystal' || artifact.name === 'Constellation Map') {
        // These special artifacts affect both points and XP
        bonus += artifact.bonus;
      } else if (artifact.name === 'Cosmic Harmonizer') {
        cosmicHarmonizerBonus = artifact.bonus;
      }
    }
    
    // Apply Cosmic Harmonizer bonus to all points bonuses
    if (cosmicHarmonizerBonus > 0 && bonus > 0) {
      bonus = bonus * (1 + cosmicHarmonizerBonus / 100);
    }
    
    return bonus / 100;
  }

  public getXPBonus(): number {
    let bonus = 0;
    let cosmicHarmonizerBonus = 0;
    
    // First, collect all XP bonuses and find special artifacts
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'xp') {
        bonus += artifact.bonus;
      } else if (artifact.name === 'Infinity Crystal' || artifact.name === 'Constellation Map') {
        // These special artifacts affect both points and XP
        bonus += artifact.bonus;
      } else if (artifact.name === 'Cosmic Harmonizer') {
        cosmicHarmonizerBonus = artifact.bonus;
      }
    }
    
    // Apply Cosmic Harmonizer bonus to all XP bonuses
    if (cosmicHarmonizerBonus > 0 && bonus > 0) {
      bonus = bonus * (1 + cosmicHarmonizerBonus / 100);
    }
    
    return bonus / 100;
  }

  public getAllBonuses(): string[] {
    const bonuses: string[] = [];
    const equipped = this.equippedArtifacts;

    if (equipped.length === 0) return ['No artifacts equipped'];

    for (const artifact of equipped) {
      bonuses.push(
        `${artifact.icon} ${artifact.name} (Lv.${artifact.level.toString()}): ${artifact.description}`,
      );
    }

    return bonuses;
  }

  public getArtifacts(): Artifact[] {
    return this.artifacts;
  }

  public getEquippedArtifacts(): Artifact[] {
    return this.equippedArtifacts;
  }

  public getMaxEquipped(): number {
    return this.maxEquipped;
  }

  public getRarityColor(rarity: ArtifactRarity): string {
    return RARITY_COLORS[rarity];
  }

  public sellArtifact(artifactId: string): number {
    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return 0;

    // Calculate sell value based on rarity, level, and upgrade costs invested
    const baseValue = {
      common: 1000,
      rare: 5000,
      epic: 25000,
      legendary: 100000,
    }[artifact.rarity];

    // Add value for each level (represents invested upgrade costs)
    let totalUpgradeCost = 0;
    for (let level = 1; level < artifact.level; level++) {
      const cost = Math.floor(baseValue * Math.pow(1.5, level - 1));
      totalUpgradeCost += cost;
    }

    // Sell value is 50% of base + 30% of invested upgrade costs
    const sellValue = Math.floor(baseValue * 0.5 + totalUpgradeCost * 0.3);

    // Remove artifact from list
    this.artifacts = this.artifacts.filter((a) => a.id !== artifactId);
    this.equippedArtifacts = this.artifacts.filter((a) => a.equipped);
    this.save();

    return sellValue;
  }

  public getSellValue(artifactId: string): number {
    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return 0;

    const baseValue = {
      common: 1000,
      rare: 5000,
      epic: 25000,
      legendary: 100000,
    }[artifact.rarity];

    let totalUpgradeCost = 0;
    for (let level = 1; level < artifact.level; level++) {
      const cost = Math.floor(baseValue * Math.pow(1.5, level - 1));
      totalUpgradeCost += cost;
    }

    return Math.floor(baseValue * 0.5 + totalUpgradeCost * 0.3);
  }
}




