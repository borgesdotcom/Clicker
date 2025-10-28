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
      icon: '🔧',
      maxLevel: 10,
    },
    {
      name: 'Basic Targeting System',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 3,
      icon: '🎯',
      maxLevel: 10,
    },
    {
      name: 'Lucky Charm',
      description: '+{bonus}% crit chance',
      type: 'critical',
      baseBonus: 2,
      icon: '🍀',
      maxLevel: 10,
    },
  ],
  rare: [
    {
      name: 'Alien Power Core',
      description: '+{bonus}% points gained',
      type: 'points',
      baseBonus: 10,
      icon: '💎',
      maxLevel: 15,
    },
    {
      name: 'Enhanced Capacitor',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 12,
      icon: '⚡',
      maxLevel: 15,
    },
    {
      name: 'Quantum Processor',
      description: '+{bonus}% XP gained',
      type: 'xp',
      baseBonus: 8,
      icon: '🧠',
      maxLevel: 15,
    },
  ],
  epic: [
    {
      name: 'Plasma Reactor',
      description: '+{bonus}% damage',
      type: 'damage',
      baseBonus: 20,
      icon: '⚛️',
      maxLevel: 20,
    },
    {
      name: 'Temporal Accelerator',
      description: '+{bonus}% attack speed',
      type: 'speed',
      baseBonus: 15,
      icon: '⏱️',
      maxLevel: 20,
    },
    {
      name: 'Fortune Fragment',
      description: '+{bonus}% crit damage',
      type: 'critical',
      baseBonus: 25,
      icon: '✨',
      maxLevel: 20,
    },
  ],
  legendary: [
    {
      name: 'Heart of a Dying Star',
      description: '+{bonus}% all damage',
      type: 'damage',
      baseBonus: 35,
      icon: '🌟',
      maxLevel: 25,
    },
    {
      name: 'Infinity Crystal',
      description: '+{bonus}% points and XP',
      type: 'special',
      baseBonus: 30,
      icon: '💠',
      maxLevel: 25,
    },
    {
      name: 'Cosmic Harmonizer',
      description: '+{bonus}% to all bonuses',
      type: 'special',
      baseBonus: 20,
      icon: '🔮',
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
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'damage' || artifact.type === 'special') {
        bonus += artifact.bonus;
      }
    }
    return bonus / 100;
  }

  public getSpeedBonus(): number {
    let bonus = 0;
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'speed' || artifact.type === 'special') {
        bonus += artifact.bonus;
      }
    }
    return bonus / 100;
  }

  public getCritBonus(): number {
    let bonus = 0;
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'critical' || artifact.type === 'special') {
        bonus += artifact.bonus;
      }
    }
    return bonus / 100;
  }

  public getPointsBonus(): number {
    let bonus = 0;
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'points' || artifact.type === 'special') {
        bonus += artifact.bonus;
      }
    }
    return bonus / 100;
  }

  public getXPBonus(): number {
    let bonus = 0;
    for (const artifact of this.equippedArtifacts) {
      if (artifact.type === 'xp' || artifact.type === 'special') {
        bonus += artifact.bonus;
      }
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
}
