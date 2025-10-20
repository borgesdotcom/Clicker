import type { GameState, UpgradeConfig, SubUpgrade } from '../types';

export class UpgradeSystem {
  private basePoints = 1;
  private subUpgrades: SubUpgrade[] = [];

  constructor() {
    this.initializeSubUpgrades();
  }

  private initializeSubUpgrades(): void {
    this.subUpgrades = [
      // === EARLY GAME UPGRADES (Level 1-20) ===
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
        id: 'coffee_machine',
        name: 'Crew Coffee Machine',
        description: 'Passive point generation +5/sec',
        flavor: 'Caffeine-fueled destruction. Now with extra espresso shots.',
        cost: 2000,
        owned: false,
        requires: (state) => state.level >= 5,
        isVisible: (state) => state.level >= 5,
        buy: (state) => {
          state.subUpgrades['coffee_machine'] = true;
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
        id: 'lucky_dice',
        name: 'Lucky Space Dice',
        description: '+5% critical hit chance',
        flavor: 'Found them in an asteroid. The previous owner won\'t miss them.',
        cost: 3500,
        owned: false,
        requires: (state) => state.critChanceLevel >= 5,
        isVisible: (state) => state.critChanceLevel >= 5,
        buy: (state) => {
          state.subUpgrades['lucky_dice'] = true;
        },
      },

      // === MID GAME UPGRADES (Level 10-40) ===
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
        id: 'space_pizza',
        name: 'Intergalactic Pizza Delivery',
        description: 'Passive generation +20/sec',
        flavor: 'Guaranteed delivery in 30 light-years or less!',
        cost: 30000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 10,
        isVisible: (state) => state.resourceGenLevel >= 10,
        buy: (state) => {
          state.subUpgrades['space_pizza'] = true;
        },
      },
      {
        id: 'rubber_duck',
        name: 'Debugging Rubber Duck',
        description: '+3% critical damage multiplier',
        flavor: 'Explains your problems back to you. Very therapeutic.',
        cost: 35000,
        owned: false,
        requires: (state) => state.stats.criticalHits >= 100,
        isVisible: (state) => state.stats.criticalHits >= 50,
        buy: (state) => {
          state.subUpgrades['rubber_duck'] = true;
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
        id: 'motivational_posters',
        name: 'Motivational Posters',
        description: 'XP gain +25%',
        flavor: '"Hang in there!" says the cat dangling from a satellite dish.',
        cost: 60000,
        owned: false,
        requires: (state) => state.xpBoostLevel >= 10,
        isVisible: (state) => state.xpBoostLevel >= 10,
        buy: (state) => {
          state.subUpgrades['motivational_posters'] = true;
        },
      },

      // === ADVANCED UPGRADES (Level 25-60) ===
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
        id: 'disco_ball',
        name: 'Hypnotic Disco Ball',
        description: 'Aliens confused, +15% all stats',
        flavor: 'Saturday Night Fever, but in space. And deadly.',
        cost: 85000,
        owned: false,
        requires: (state) => state.level >= 30,
        isVisible: (state) => state.level >= 30,
        buy: (state) => {
          state.subUpgrades['disco_ball'] = true;
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
        id: 'lucky_horseshoe',
        name: 'Lucky Horseshoe',
        description: 'Critical hits deal 50% more damage',
        flavor: 'Who needs horses in space? Apparently, luck does.',
        cost: 120000,
        owned: false,
        requires: (state) => state.critChanceLevel >= 15,
        isVisible: (state) => state.critChanceLevel >= 15,
        buy: (state) => {
          state.subUpgrades['lucky_horseshoe'] = true;
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
        id: 'arcade_machine',
        name: 'Retro Arcade Machine',
        description: 'Passive generation +100/sec',
        flavor: 'Plays Pac-Man while generating infinite energy. Science!',
        cost: 175000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 20,
        isVisible: (state) => state.resourceGenLevel >= 20,
        buy: (state) => {
          state.subUpgrades['arcade_machine'] = true;
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
        id: 'chaos_emeralds',
        name: 'Seven Chaos Emeralds',
        description: 'All damage +35%',
        flavor: 'Gotta go fast! Wait, wrong franchise...',
        cost: 250000,
        owned: false,
        requires: (state) => state.level >= 45,
        isVisible: (state) => state.level >= 45,
        buy: (state) => {
          state.subUpgrades['chaos_emeralds'] = true;
        },
      },
      {
        id: 'time_machine',
        name: 'Malfunctioning Time Machine',
        description: 'XP gain +50%',
        flavor: 'Sets time forward, backward, and sideways. Results may vary.',
        cost: 300000,
        owned: false,
        requires: (state) => state.xpBoostLevel >= 20,
        isVisible: (state) => state.xpBoostLevel >= 20,
        buy: (state) => {
          state.subUpgrades['time_machine'] = true;
        },
      },

      // === LATE GAME UPGRADES (Level 50-80) ===
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
        id: 'philosophers_stone',
        name: "Philosopher's Stone",
        description: 'Passive generation x3',
        flavor: 'Turns lead into gold. And boredom into profit.',
        cost: 600000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 30,
        isVisible: (state) => state.resourceGenLevel >= 30,
        buy: (state) => {
          state.subUpgrades['philosophers_stone'] = true;
        },
      },
      {
        id: 'golden_goose',
        name: 'Quantum Golden Goose',
        description: 'Points per click +50%',
        flavor: 'Lays golden eggs. In multiple dimensions. Simultaneously.',
        cost: 700000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 5000,
        isVisible: (state) => state.stats.totalClicks >= 2500,
        buy: (state) => {
          state.subUpgrades['golden_goose'] = true;
        },
      },
      {
        id: 'infinity_gauntlet',
        name: 'Infinity Gauntlet (Replica)',
        description: 'All stats +40%',
        flavor: 'Perfectly balanced, as all things should be. Also, not trademarked.',
        cost: 800000,
        owned: false,
        requires: (state) => state.level >= 70,
        isVisible: (state) => state.level >= 70,
        buy: (state) => {
          state.subUpgrades['infinity_gauntlet'] = true;
        },
      },
      {
        id: 'alien_cookbook',
        name: 'Alien Recipe Book',
        description: 'Boss kill rewards +100%',
        flavor: '"To Serve Aliens" - It\'s a cookbook!',
        cost: 900000,
        owned: false,
        requires: (state) => state.stats.bossesKilled >= 25,
        isVisible: (state) => state.stats.bossesKilled >= 15,
        buy: (state) => {
          state.subUpgrades['alien_cookbook'] = true;
        },
      },
      {
        id: 'nuclear_reactor',
        name: 'Pocket Nuclear Reactor',
        description: 'Passive generation +500/sec',
        flavor: 'Fits in your pocket. Do not put in pocket.',
        cost: 1000000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 40,
        isVisible: (state) => state.resourceGenLevel >= 40,
        buy: (state) => {
          state.subUpgrades['nuclear_reactor'] = true;
        },
      },

      // === END GAME UPGRADES (Level 80-100) ===
      {
        id: 'singularity_core',
        name: 'Singularity Power Core',
        description: 'Gain 5x points from all sources',
        flavor: 'A black hole in a box. What could be safer?',
        cost: 2000000,
        owned: false,
        requires: (state) => state.level >= 80,
        isVisible: (state) => state.level >= 80,
        buy: (state) => {
          state.subUpgrades['singularity_core'] = true;
        },
      },
      {
        id: 'cheat_codes',
        name: 'Cheat Code Manual',
        description: 'All upgrades 20% cheaper',
        flavor: 'Up, Up, Down, Down, Left, Right, Left, Right, B, A, Start.',
        cost: 2500000,
        owned: false,
        requires: (state) => state.stats.totalUpgrades >= 200,
        isVisible: (state) => state.stats.totalUpgrades >= 150,
        buy: (state) => {
          state.subUpgrades['cheat_codes'] = true;
        },
      },
      {
        id: 'dragon_egg',
        name: 'Dragon Egg',
        description: 'Critical hit chance +10%, Critical damage x2',
        flavor: 'It\'s either a dragon egg or a really angry space chicken.',
        cost: 3000000,
        owned: false,
        requires: (state) => state.critChanceLevel >= 30,
        isVisible: (state) => state.critChanceLevel >= 30,
        buy: (state) => {
          state.subUpgrades['dragon_egg'] = true;
        },
      },
      {
        id: 'universe_map',
        name: 'Map of the Universe',
        description: 'XP gain x3',
        flavor: 'You are here. So is everything else. Helpful!',
        cost: 4000000,
        owned: false,
        requires: (state) => state.xpBoostLevel >= 35,
        isVisible: (state) => state.xpBoostLevel >= 35,
        buy: (state) => {
          state.subUpgrades['universe_map'] = true;
        },
      },
      {
        id: 'answer_to_everything',
        name: 'Answer to Everything',
        description: 'All passive generation x5',
        flavor: 'It\'s 42. But what was the question again?',
        cost: 5000000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 50,
        isVisible: (state) => state.resourceGenLevel >= 50,
        buy: (state) => {
          state.subUpgrades['answer_to_everything'] = true;
        },
      },
      {
        id: 'heart_of_galaxy',
        name: 'Heart of the Galaxy',
        description: 'All damage x3',
        flavor: 'The galaxy had a heart. HAD.',
        cost: 7500000,
        owned: false,
        requires: (state) => state.level >= 90,
        isVisible: (state) => state.level >= 90,
        buy: (state) => {
          state.subUpgrades['heart_of_galaxy'] = true;
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
      {
        id: 'meaning_of_life',
        name: 'Meaning of Life',
        description: 'Unlock prestige system & all stats x2',
        flavor: 'Spoiler: It\'s clicking alien balls all the way down.',
        cost: 25000000,
        owned: false,
        requires: (state) => state.level >= 100,
        isVisible: (state) => state.level >= 100,
        buy: (state) => {
          state.subUpgrades['meaning_of_life'] = true;
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
    // Ship-related sub-upgrades
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
       'singularity_core', 'cosmic_ascension', 'disco_ball', 'chaos_emeralds',
       'infinity_gauntlet', 'heart_of_galaxy', 'meaning_of_life', 'golden_goose'].includes(u.id)
    );

    // Critical hit related sub-upgrades
    const critSubUpgrades = this.subUpgrades.filter(u => 
      ['lucky_dice', 'rubber_duck', 'lucky_horseshoe', 'dragon_egg'].includes(u.id)
    );

    // Resource generation related sub-upgrades
    const resourceSubUpgrades = this.subUpgrades.filter(u => 
      ['coffee_machine', 'space_pizza', 'arcade_machine', 'philosophers_stone',
       'nuclear_reactor', 'answer_to_everything'].includes(u.id)
    );

    // XP boost related sub-upgrades
    const xpSubUpgrades = this.subUpgrades.filter(u => 
      ['motivational_posters', 'void_channeling', 'time_machine', 'universe_map'].includes(u.id)
    );

    // General/misc sub-upgrades
    const miscSubUpgrades = this.subUpgrades.filter(u => 
      ['energy_recycling', 'cheat_codes', 'alien_cookbook'].includes(u.id)
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

    const critChanceUpgrade: UpgradeConfig = {
      id: 'critChance',
      name: '✨ Critical Strike',
      description: 'Increase critical hit chance and damage for devastating strikes.',
      getCost: (level: number) => this.applyDiscount(Math.ceil(150 * Math.pow(1.35, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(150 * Math.pow(1.35, state.critChanceLevel)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.critChanceLevel++;
      },
      getLevel: (state: GameState) => state.critChanceLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.critChanceLevel.toString()} (${this.getCritChance(state).toFixed(1)}%)`,
      subUpgrades: critSubUpgrades,
    };

    const resourceGenUpgrade: UpgradeConfig = {
      id: 'resourceGen',
      name: '🏭 Passive Income',
      description: 'Generate points automatically over time. Make money while you sleep!',
      getCost: (level: number) => this.applyDiscount(Math.ceil(200 * Math.pow(1.4, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(200 * Math.pow(1.4, state.resourceGenLevel)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.resourceGenLevel++;
      },
      getLevel: (state: GameState) => state.resourceGenLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.resourceGenLevel.toString()} (${this.getPassiveGen(state).toFixed(1)}/sec)`,
      subUpgrades: resourceSubUpgrades,
    };

    const xpBoostUpgrade: UpgradeConfig = {
      id: 'xpBoost',
      name: '📚 Knowledge Core',
      description: 'Learn faster and level up quicker. Knowledge is power!',
      getCost: (level: number) => this.applyDiscount(Math.ceil(250 * Math.pow(1.38, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(Math.ceil(250 * Math.pow(1.38, state.xpBoostLevel)));
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.xpBoostLevel++;
      },
      getLevel: (state: GameState) => state.xpBoostLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.xpBoostLevel.toString()} (+${(this.getXPMultiplier(state) * 100 - 100).toFixed(0)}% XP)`,
      subUpgrades: xpSubUpgrades,
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

    return [
      shipUpgrade,
      attackSpeedUpgrade,
      pointMultiplierUpgrade,
      critChanceUpgrade,
      resourceGenUpgrade,
      xpBoostUpgrade,
      miscUpgrade,
    ];
  }

  private applyDiscount(cost: number): number {
    let discount = 1.0;
    
    // Energy recycling: 5% discount
    if (this.subUpgrades.find(u => u.id === 'energy_recycling')?.owned) {
      discount *= 0.95;
    }
    
    // Cheat codes: 20% discount
    if (this.subUpgrades.find(u => u.id === 'cheat_codes')?.owned) {
      discount *= 0.80;
    }
    
    return Math.floor(cost * discount);
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

    // Neural link: +10% on clicks
    if (state.subUpgrades['neural_link']) {
      multiplier *= 1.10;
    }

    // Antimatter rounds: 2x
    if (state.subUpgrades['antimatter_rounds']) {
      multiplier *= 2;
    }

    // Disco ball: +15%
    if (state.subUpgrades['disco_ball']) {
      multiplier *= 1.15;
    }

    // Chaos emeralds: +35%
    if (state.subUpgrades['chaos_emeralds']) {
      multiplier *= 1.35;
    }

    // Infinity gauntlet: +40%
    if (state.subUpgrades['infinity_gauntlet']) {
      multiplier *= 1.40;
    }

    // Golden goose: +50%
    if (state.subUpgrades['golden_goose']) {
      multiplier *= 1.50;
    }

    // Heart of galaxy: x3
    if (state.subUpgrades['heart_of_galaxy']) {
      multiplier *= 3;
    }

    // Singularity core: 5x
    if (state.subUpgrades['singularity_core']) {
      multiplier *= 5;
    }

    // Cosmic ascension: 10x
    if (state.subUpgrades['cosmic_ascension']) {
      multiplier *= 10;
    }

    // Meaning of life: x2
    if (state.subUpgrades['meaning_of_life']) {
      multiplier *= 2;
    }

    // Perfect precision: 5% chance for 10x (handled in Game.ts)
    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        multiplier *= 10;
      }
    }

    return multiplier;
  }

  getCritChance(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let chance = 2 + (state.critChanceLevel * 0.5); // Base 2% + 0.5% per level

    // Lucky dice: +5%
    if (state.subUpgrades['lucky_dice']) {
      chance += 5;
    }

    // Dragon egg: +10%
    if (state.subUpgrades['dragon_egg']) {
      chance += 10;
    }

    return Math.min(chance, 75); // Cap at 75%
  }

  getCritMultiplier(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let multiplier = 2.0; // Base 2x damage

    // Rubber duck: +3x
    if (state.subUpgrades['rubber_duck']) {
      multiplier += 3;
    }

    // Lucky horseshoe: +50%
    if (state.subUpgrades['lucky_horseshoe']) {
      multiplier *= 1.5;
    }

    // Dragon egg: x2
    if (state.subUpgrades['dragon_egg']) {
      multiplier *= 2;
    }

    return multiplier;
  }

  getPassiveGen(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let gen = state.resourceGenLevel * 2; // Base 2 points/sec per level

    // Coffee machine: +5/sec
    if (state.subUpgrades['coffee_machine']) {
      gen += 5;
    }

    // Space pizza: +20/sec
    if (state.subUpgrades['space_pizza']) {
      gen += 20;
    }

    // Arcade machine: +100/sec
    if (state.subUpgrades['arcade_machine']) {
      gen += 100;
    }

    // Philosopher's stone: x3
    if (state.subUpgrades['philosophers_stone']) {
      gen *= 3;
    }

    // Nuclear reactor: +500/sec
    if (state.subUpgrades['nuclear_reactor']) {
      gen += 500;
    }

    // Answer to everything: x5
    if (state.subUpgrades['answer_to_everything']) {
      gen *= 5;
    }

    return gen;
  }

  getXPMultiplier(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let multiplier = 1.0 + (state.xpBoostLevel * 0.1); // Base +10% per level

    // Motivational posters: +25%
    if (state.subUpgrades['motivational_posters']) {
      multiplier *= 1.25;
    }

    // Time machine: +50%
    if (state.subUpgrades['time_machine']) {
      multiplier *= 1.5;
    }

    // Universe map: x3
    if (state.subUpgrades['universe_map']) {
      multiplier *= 3;
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

    // Disco ball: +15% speed
    if (state.subUpgrades['disco_ball']) {
      cooldown *= 0.85;
    }

    // Infinity gauntlet: +40% speed
    if (state.subUpgrades['infinity_gauntlet']) {
      cooldown *= 0.60;
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

    // Apply XP multiplier
    bonus *= this.getXPMultiplier(state);

    return bonus;
  }
}
