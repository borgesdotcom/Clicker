import type { GameState, UpgradeConfig, SubUpgrade } from '../types';

export class UpgradeSystem {
  private basePoints = 1;
  private subUpgrades: SubUpgrade[] = [];

  constructor() {
    this.initializeSubUpgrades();
  }

  private initializeSubUpgrades(): void {
    this.subUpgrades = [
      {
        id: 'death_pact',
        name: 'Death Pact Agreement',
        description: 'Ships gain +10% attack speed',
        flavor: 'In space, no one can hear you sign contracts.',
        cost: 500,
        owned: false,
        requires: (state) => state.shipsCount >= 3,
        isVisible: (state) => state.shipsCount >= 3,
        buy: (state) => {
          state.subUpgrades['death_pact'] = true;
        },
      },
      {
        id: 'laser_focusing',
        name: 'Laser Focusing Crystals',
        description: 'Increase point gain by 15%',
        flavor: 'These crystals are definitely not from that one forbidden planet...',
        cost: 1000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 5,
        isVisible: (state) => state.pointMultiplierLevel >= 5,
        buy: (state) => {
          state.subUpgrades['laser_focusing'] = true;
        },
      },
      {
        id: 'quantum_targeting',
        name: 'Quantum Targeting Array',
        description: 'Ships fire 20% faster',
        flavor: 'Aims at where the target was, is, and will be simultaneously.',
        cost: 2500,
        owned: false,
        requires: (state) => state.attackSpeedLevel >= 10,
        isVisible: (state) => state.attackSpeedLevel >= 10,
        buy: (state) => {
          state.subUpgrades['quantum_targeting'] = true;
        },
      },
      {
        id: 'energy_recycling',
        name: 'Energy Recycling System',
        description: 'All upgrades are 5% cheaper',
        flavor: 'Reduce, reuse, recycle... plasma.',
        cost: 5000,
        owned: false,
        requires: (state) => state.shipsCount >= 10,
        isVisible: (state) => state.shipsCount >= 10,
        buy: (state) => {
          state.subUpgrades['energy_recycling'] = true;
        },
      },
      {
        id: 'overclocked_reactors',
        name: 'Overclocked Reactors',
        description: 'Gain 25% more points per hit',
        flavor: 'Safety protocols are just suggestions anyway.',
        cost: 10000,
        owned: false,
        requires: (state) => state.level >= 10,
        isVisible: (state) => state.level >= 10,
        buy: (state) => {
          state.subUpgrades['overclocked_reactors'] = true;
        },
      },
      {
        id: 'ship_swarm',
        name: 'Swarm Intelligence Protocol',
        description: 'Ships coordinate attacks for +20% damage',
        flavor: 'The hivemind accepts all. Resistance is futile.',
        cost: 15000,
        owned: false,
        requires: (state) => state.shipsCount >= 15,
        isVisible: (state) => state.shipsCount >= 15,
        buy: (state) => {
          state.subUpgrades['ship_swarm'] = true;
        },
      },
      {
        id: 'neural_link',
        name: 'Neural Link Interface',
        description: 'Clicking grants 10% bonus points',
        flavor: 'Think faster, click harder.',
        cost: 25000,
        owned: false,
        requires: (state) => state.level >= 20,
        isVisible: (state) => state.level >= 20,
        buy: (state) => {
          state.subUpgrades['neural_link'] = true;
        },
      },
      {
        id: 'antimatter_rounds',
        name: 'Antimatter Ammunition',
        description: 'Double all point gains',
        flavor: 'What could possibly go wrong with weaponized antimatter?',
        cost: 50000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 20,
        isVisible: (state) => state.pointMultiplierLevel >= 20,
        buy: (state) => {
          state.subUpgrades['antimatter_rounds'] = true;
        },
      },
      {
        id: 'warp_core',
        name: 'Experimental Warp Core',
        description: 'Ships fire 50% faster',
        flavor: 'Theoretical physics becomes practical firepower.',
        cost: 75000,
        owned: false,
        requires: (state) => state.attackSpeedLevel >= 25,
        isVisible: (state) => state.attackSpeedLevel >= 25,
        buy: (state) => {
          state.subUpgrades['warp_core'] = true;
        },
      },
      {
        id: 'ai_optimizer',
        name: 'AI Optimization Subroutines',
        description: 'Ship fire cooldown reduced by 30%',
        flavor: 'The AI promises it won\'t become self-aware. Probably.',
        cost: 100000,
        owned: false,
        requires: (state) => state.attackSpeedLevel >= 30,
        isVisible: (state) => state.attackSpeedLevel >= 30,
        buy: (state) => {
          state.subUpgrades['ai_optimizer'] = true;
        },
      },
      {
        id: 'perfect_precision',
        name: 'Perfect Precision Arrays',
        description: 'Critical hits: 5% chance for 10x damage',
        flavor: 'Every shot finds its mark. Every. Single. One.',
        cost: 150000,
        owned: false,
        requires: (state) => state.shipsCount >= 25,
        isVisible: (state) => state.shipsCount >= 25,
        buy: (state) => {
          state.subUpgrades['perfect_precision'] = true;
        },
      },
      {
        id: 'void_channeling',
        name: 'Void Energy Channeling',
        description: 'Destroying aliens grants bonus XP',
        flavor: 'The void stares back, and it likes what it sees.',
        cost: 200000,
        owned: false,
        requires: (state) => state.level >= 40,
        isVisible: (state) => state.level >= 40,
        buy: (state) => {
          state.subUpgrades['void_channeling'] = true;
        },
      },
      {
        id: 'temporal_acceleration',
        name: 'Temporal Acceleration Field',
        description: 'All ships gain +100% attack speed',
        flavor: 'Time is relative. Especially when you control it.',
        cost: 500000,
        owned: false,
        requires: (state) => state.level >= 60,
        isVisible: (state) => state.level >= 60,
        buy: (state) => {
          state.subUpgrades['temporal_acceleration'] = true;
        },
      },
      {
        id: 'singularity_core',
        name: 'Singularity Power Core',
        description: 'Gain 5x points from all sources',
        flavor: 'A black hole in a box. What could be safer?',
        cost: 1000000,
        owned: false,
        requires: (state) => state.level >= 80,
        isVisible: (state) => state.level >= 80,
        buy: (state) => {
          state.subUpgrades['singularity_core'] = true;
        },
      },
      {
        id: 'cosmic_ascension',
        name: 'Cosmic Ascension Protocol',
        description: 'Unlock ultimate power: 10x all gains',
        flavor: 'You have become death, destroyer of alien balls.',
        cost: 10000000,
        owned: false,
        requires: (state) => state.level >= 95,
        isVisible: (state) => state.level >= 95,
        buy: (state) => {
          state.subUpgrades['cosmic_ascension'] = true;
        },
      },
    ];
  }

  getSubUpgrades(): SubUpgrade[] {
    return this.subUpgrades.map(upgrade => ({
      ...upgrade,
      owned: upgrade.owned
    }));
  }

  updateSubUpgradesFromState(state: GameState): void {
    for (const upgrade of this.subUpgrades) {
      upgrade.owned = state.subUpgrades[upgrade.id] ?? false;
    }
  }

  getUpgrades(): UpgradeConfig[] {
    // Ship-related sub-upgrades (auto-fire removed - now built-in)
    const shipSubUpgrades = this.subUpgrades.filter(u => 
      ['death_pact', 'ship_swarm', 'perfect_precision'].includes(u.id)
    );

    // Attack speed related sub-upgrades
    const attackSpeedSubUpgrades = this.subUpgrades.filter(u => 
      ['quantum_targeting', 'warp_core', 'ai_optimizer', 'temporal_acceleration'].includes(u.id)
    );

    // Point multiplier related sub-upgrades
    const pointMultiplierSubUpgrades = this.subUpgrades.filter(u => 
      ['laser_focusing', 'overclocked_reactors', 'neural_link', 'antimatter_rounds', 
       'singularity_core', 'cosmic_ascension'].includes(u.id)
    );

    // General/misc sub-upgrades
    const miscSubUpgrades = this.subUpgrades.filter(u => 
      ['energy_recycling', 'void_channeling'].includes(u.id)
    );

    const shipUpgrade: UpgradeConfig = {
      id: 'ship',
      name: '🚀 Starship Fleet',
      description: 'Recruit another starship to your armada. More ships = more firepower!',
      getCost: (level: number) => this.applyDiscount(Math.ceil(10 * Math.pow(1.15, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(10 * Math.pow(1.15, state.shipsCount)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.shipsCount++;
      },
      getLevel: (state: GameState) => state.shipsCount,
      getDisplayText: (state: GameState) => `Fleet: ${state.shipsCount.toString()}`,
      subUpgrades: shipSubUpgrades,
    };

    const attackSpeedUpgrade: UpgradeConfig = {
      id: 'attackSpeed',
      name: '⚡ Attack Speed',
      description: 'Upgrade targeting computers to fire faster. Speed is everything.',
      getCost: (level: number) => this.applyDiscount(Math.ceil(50 * Math.pow(1.25, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(50 * Math.pow(1.25, state.attackSpeedLevel)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.attackSpeedLevel++;
      },
      getLevel: (state: GameState) => state.attackSpeedLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.attackSpeedLevel.toString()} (${this.getFireCooldown(state).toString()}ms)`,
      subUpgrades: attackSpeedSubUpgrades,
    };

    const pointMultiplierUpgrade: UpgradeConfig = {
      id: 'pointMultiplier',
      name: '💎 Damage Amplifier',
      description: 'Enhance laser power for maximum destruction per hit.',
      getCost: (level: number) => this.applyDiscount(Math.ceil(100 * Math.pow(1.3, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(100 * Math.pow(1.3, state.pointMultiplierLevel)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.pointMultiplierLevel++;
      },
      getLevel: (state: GameState) => state.pointMultiplierLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.pointMultiplierLevel.toString()} (${this.getPointsPerHit(state).toFixed(1)}/hit)`,
      subUpgrades: pointMultiplierSubUpgrades,
    };

    const miscUpgrade: UpgradeConfig = {
      id: 'misc',
      name: '🔬 Research & Development',
      description: 'Unlock experimental technologies and forbidden knowledge.',
      getCost: () => 0,
      canBuy: () => false,
      buy: () => {},
      getLevel: () => 0,
      getDisplayText: () => 'Special Technologies',
      subUpgrades: miscSubUpgrades,
    };

    return [shipUpgrade, attackSpeedUpgrade, pointMultiplierUpgrade, miscUpgrade];
  }

  private applyDiscount(cost: number): number {
    // Energy recycling gives 5% discount
    if (this.subUpgrades.find(u => u.id === 'energy_recycling')?.owned) {
      return Math.floor(cost * 0.95);
    }
    return cost;
  }

  getPointsPerHit(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let multiplier = this.basePoints * (1 + 0.15 * state.pointMultiplierLevel);

    // Laser focusing crystals: +15%
    if (state.subUpgrades['laser_focusing']) {
      multiplier *= 1.15;
    }

    // Overclocked reactors: +25%
    if (state.subUpgrades['overclocked_reactors']) {
      multiplier *= 1.25;
    }

    // Ship swarm: +20%
    if (state.subUpgrades['ship_swarm']) {
      multiplier *= 1.20;
    }

    // Neural link: +10% on clicks (always active for simplicity)
    if (state.subUpgrades['neural_link']) {
      multiplier *= 1.10;
    }

    // Antimatter rounds: 2x
    if (state.subUpgrades['antimatter_rounds']) {
      multiplier *= 2;
    }

    // Singularity core: 5x
    if (state.subUpgrades['singularity_core']) {
      multiplier *= 5;
    }

    // Cosmic ascension: 10x
    if (state.subUpgrades['cosmic_ascension']) {
      multiplier *= 10;
    }

    // Perfect precision: 5% chance for 10x (average 1.45x)
    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        multiplier *= 10;
      }
    }

    return multiplier;
  }

  getFireCooldown(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let cooldown = Math.max(
      Math.floor(1000 * Math.pow(0.95, state.attackSpeedLevel)),
      120,
    );

    // Death pact: +10% speed = 0.9x cooldown
    if (state.subUpgrades['death_pact']) {
      cooldown *= 0.9;
    }

    // Quantum targeting: +20% speed = 0.8x cooldown
    if (state.subUpgrades['quantum_targeting']) {
      cooldown *= 0.8;
    }

    // Warp core: +50% speed = 0.67x cooldown
    if (state.subUpgrades['warp_core']) {
      cooldown *= 0.67;
    }

    // AI optimizer: -30% cooldown
    if (state.subUpgrades['ai_optimizer']) {
      cooldown *= 0.7;
    }

    // Temporal acceleration: +100% speed = 0.5x cooldown
    if (state.subUpgrades['temporal_acceleration']) {
      cooldown *= 0.5;
    }

    return Math.max(Math.floor(cooldown), 50);
  }

  getBonusXP(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let bonus = 1;

    // Void channeling: double XP
    if (state.subUpgrades['void_channeling']) {
      bonus = 2;
    }

    return bonus;
  }
}
