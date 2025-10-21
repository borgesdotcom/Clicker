import type { GameState, UpgradeConfig, SubUpgrade } from '../types';

export class UpgradeSystem {
  private basePoints = 1;
  private subUpgrades: SubUpgrade[] = [];
  private ascensionSystem: {
    getDamageMultiplier: (state: GameState) => number;
    getPointsMultiplier: (state: GameState) => number;
    getCritBonus: (state: GameState) => number;
    getPassiveMultiplier: (state: GameState) => number;
    getXPMultiplier: (state: GameState) => number;
    getSpeedMultiplier: (state: GameState) => number;
  } | null = null;

  constructor() {
    this.initializeSubUpgrades();
  }

  setAscensionSystem(ascensionSystem: {
    getDamageMultiplier: (state: GameState) => number;
    getPointsMultiplier: (state: GameState) => number;
    getCritBonus: (state: GameState) => number;
    getPassiveMultiplier: (state: GameState) => number;
    getXPMultiplier: (state: GameState) => number;
    getSpeedMultiplier: (state: GameState) => number;
  }): void {
    this.ascensionSystem = ascensionSystem;
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
        description: 'Passive point generation +50/sec',
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
        description: 'Passive generation +200/sec',
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
        description: 'Passive generation +1000/sec',
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
        id: 'nanobots',
        name: 'Self-Replicating Nanobots',
        description: 'Passive generation +2500/sec',
        flavor: 'They multiply. They evolve. They pay dividends.',
        cost: 5000000,
        owned: false,
        requires: (state) => state.level >= 50,
        isVisible: (state) => state.level >= 50,
        buy: (state) => {
          state.subUpgrades['nanobots'] = true;
        },
      },
      {
        id: 'plasma_matrix',
        name: 'Plasma Energy Matrix',
        description: 'All damage +25%, Attack speed +15%',
        flavor: 'Harness the power of contained supernovas.',
        cost: 7500000,
        owned: false,
        requires: (state) => state.level >= 52,
        isVisible: (state) => state.level >= 52,
        buy: (state) => {
          state.subUpgrades['plasma_matrix'] = true;
        },
      },
      {
        id: 'holographic_decoys',
        name: 'Holographic Decoy System',
        description: 'Ships can attack twice as often',
        flavor: 'One ship becomes many. Confusion intensifies.',
        cost: 10000000,
        owned: false,
        requires: (state) => state.shipsCount >= 18,
        isVisible: (state) => state.shipsCount >= 18,
        buy: (state) => {
          state.subUpgrades['holographic_decoys'] = true;
        },
      },
      {
        id: 'temporal_acceleration',
        name: 'Temporal Acceleration Field',
        description: 'All ships gain +100% attack speed',
        flavor: 'Time is relative. Especially when you control it.',
        cost: 15000000,
        owned: false,
        requires: (state) => state.level >= 55,
        isVisible: (state) => state.level >= 55,
        buy: (state) => {
          state.subUpgrades['temporal_acceleration'] = true;
        },
      },
      {
        id: 'quantum_entanglement',
        name: 'Quantum Entanglement Core',
        description: 'Critical hits +8%, Damage x1.5',
        flavor: 'Spooky action at a distance. Einstein hated it. You\'ll love it.',
        cost: 20000000,
        owned: false,
        requires: (state) => state.critChanceLevel >= 20,
        isVisible: (state) => state.critChanceLevel >= 20,
        buy: (state) => {
          state.subUpgrades['quantum_entanglement'] = true;
        },
      },
      {
        id: 'philosophers_stone',
        name: "Philosopher's Stone",
        description: 'Passive generation x5',
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
        id: 'stellar_forge',
        name: 'Stellar Forge',
        description: 'XP gain +75%, All damage +20%',
        flavor: 'Where stars are born, and enemies meet their end.',
        cost: 30000000,
        owned: false,
        requires: (state) => state.level >= 62,
        isVisible: (state) => state.level >= 62,
        buy: (state) => {
          state.subUpgrades['stellar_forge'] = true;
        },
      },
      {
        id: 'golden_goose',
        name: 'Quantum Golden Goose',
        description: 'Points per click +50%',
        flavor: 'Lays golden eggs. In multiple dimensions. Simultaneously.',
        cost: 40000000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 5000,
        isVisible: (state) => state.stats.totalClicks >= 2500,
        buy: (state) => {
          state.subUpgrades['golden_goose'] = true;
        },
      },
      {
        id: 'dark_matter_engine',
        name: 'Dark Matter Engine',
        description: 'Passive generation x3, Ships +25% speed',
        flavor: '95% of the universe is dark matter. Now it\'s yours.',
        cost: 50000000,
        owned: false,
        requires: (state) => state.level >= 65,
        isVisible: (state) => state.level >= 65,
        buy: (state) => {
          state.subUpgrades['dark_matter_engine'] = true;
        },
      },
      {
        id: 'antimatter_cascade',
        name: 'Antimatter Cascade Reactor',
        description: 'All click damage x4',
        flavor: 'Click once. Destroy everything. Repeat.',
        cost: 60000000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 7500,
        isVisible: (state) => state.stats.totalClicks >= 5000,
        buy: (state) => {
          state.subUpgrades['antimatter_cascade'] = true;
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
        id: 'nebula_harvester',
        name: 'Nebula Energy Harvester',
        description: 'Passive generation +5000/sec, XP +50%',
        flavor: 'Siphon energy from the cosmic clouds themselves.',
        cost: 75000000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 35,
        isVisible: (state) => state.resourceGenLevel >= 35,
        buy: (state) => {
          state.subUpgrades['nebula_harvester'] = true;
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
        id: 'hyper_reactor',
        name: 'Hyper-Dimensional Reactor',
        description: 'All damage x2, Critical chance +5%',
        flavor: 'Powers drawn from dimensions we can\'t even see.',
        cost: 100000000,
        owned: false,
        requires: (state) => state.level >= 75,
        isVisible: (state) => state.level >= 75,
        buy: (state) => {
          state.subUpgrades['hyper_reactor'] = true;
        },
      },
      {
        id: 'nuclear_reactor',
        name: 'Pocket Nuclear Reactor',
        description: 'Passive generation +10000/sec',
        flavor: 'Fits in your pocket. Do not put in pocket.',
        cost: 125000000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 40,
        isVisible: (state) => state.resourceGenLevel >= 40,
        buy: (state) => {
          state.subUpgrades['nuclear_reactor'] = true;
        },
      },
      {
        id: 'photon_amplifier',
        name: 'Photon Wave Amplifier',
        description: 'Ships fire 75% faster, Damage +30%',
        flavor: 'Light speed is too slow. We\'re going to ludicrous speed!',
        cost: 150000000,
        owned: false,
        requires: (state) => state.attackSpeedLevel >= 40,
        isVisible: (state) => state.attackSpeedLevel >= 40,
        buy: (state) => {
          state.subUpgrades['photon_amplifier'] = true;
        },
      },
      {
        id: 'reality_anchor',
        name: 'Reality Anchor',
        description: 'Critical damage x3, All gains +25%',
        flavor: 'Keep reality in check. Or break it. Your choice.',
        cost: 200000000,
        owned: false,
        requires: (state) => state.critChanceLevel >= 35,
        isVisible: (state) => state.critChanceLevel >= 35,
        buy: (state) => {
          state.subUpgrades['reality_anchor'] = true;
        },
      },
      {
        id: 'cosmic_battery',
        name: 'Cosmic Energy Battery',
        description: 'Passive generation x7',
        flavor: 'Stores the energy of dying stars. Batteries not included.',
        cost: 250000000,
        owned: false,
        requires: (state) => state.resourceGenLevel >= 45,
        isVisible: (state) => state.resourceGenLevel >= 45,
        buy: (state) => {
          state.subUpgrades['cosmic_battery'] = true;
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
        description: 'All passive generation x10',
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
      // === CLICK-FOCUSED UPGRADES ===
      {
        id: 'master_clicker',
        name: 'Master Clicker',
        description: 'Clicking gives +100% more points',
        flavor: 'Click, click, boom!',
        cost: 50000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 1000,
        isVisible: (state) => state.stats.totalClicks >= 500,
        buy: (state) => {
          state.subUpgrades['master_clicker'] = true;
        },
      },
      {
        id: 'rapid_fire',
        name: 'Rapid Fire Protocol',
        description: 'Each click fires 2 additional lasers',
        flavor: 'One click, triple threat!',
        cost: 150000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 2500,
        isVisible: (state) => state.stats.totalClicks >= 1500,
        buy: (state) => {
          state.subUpgrades['rapid_fire'] = true;
        },
      },
      {
        id: 'click_multiplier',
        name: 'Click Multiplier Matrix',
        description: 'Clicking multiplies damage by 3x',
        flavor: 'Every click echoes through reality.',
        cost: 500000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 5000,
        isVisible: (state) => state.stats.totalClicks >= 3000,
        buy: (state) => {
          state.subUpgrades['click_multiplier'] = true;
        },
      },
      {
        id: 'super_clicker',
        name: 'Super Clicker Ultimate',
        description: 'Clicks deal 5x damage and grant bonus XP',
        flavor: 'The ultimate clicking evolution.',
        cost: 2000000,
        owned: false,
        requires: (state) => state.stats.totalClicks >= 10000,
        isVisible: (state) => state.stats.totalClicks >= 7500,
        buy: (state) => {
          state.subUpgrades['super_clicker'] = true;
        },
      },
      {
        id: 'missile_launcher',
        name: 'Missile Launcher Array',
        description: 'Enhanced targeting systems for improved precision',
        flavor: 'Advanced missile technology for maximum firepower.',
        cost: 500000,
        owned: false,
        requires: (state) => state.shipsCount >= 15,
        isVisible: (state) => state.shipsCount >= 15,
        buy: (state) => {
          state.subUpgrades['missile_launcher'] = true;
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
      ['death_pact', 'ship_swarm', 'perfect_precision', 'missile_launcher'].includes(u.id)
    );

    // Attack speed related sub-upgrades
    const attackSpeedSubUpgrades = this.subUpgrades.filter(u => 
      ['quantum_targeting', 'warp_core', 'ai_optimizer', 'temporal_acceleration', 'holographic_decoys', 'photon_amplifier'].includes(u.id)
    );

    // Point multiplier related sub-upgrades
    const pointMultiplierSubUpgrades = this.subUpgrades.filter(u => 
      ['laser_focusing', 'overclocked_reactors', 'neural_link', 'antimatter_rounds', 
       'singularity_core', 'cosmic_ascension', 'disco_ball', 'chaos_emeralds',
       'infinity_gauntlet', 'heart_of_galaxy', 'meaning_of_life', 'golden_goose',
       'master_clicker', 'rapid_fire', 'click_multiplier', 'super_clicker', 'plasma_matrix',
       'quantum_entanglement', 'stellar_forge', 'antimatter_cascade', 'hyper_reactor',
       'photon_amplifier', 'reality_anchor'].includes(u.id)
    );

    // Critical hit related sub-upgrades
    const critSubUpgrades = this.subUpgrades.filter(u => 
      ['lucky_dice', 'rubber_duck', 'lucky_horseshoe', 'dragon_egg', 'quantum_entanglement', 'hyper_reactor', 'reality_anchor'].includes(u.id)
    );

    // Resource generation related sub-upgrades
    const resourceSubUpgrades = this.subUpgrades.filter(u => 
      ['coffee_machine', 'space_pizza', 'arcade_machine', 'philosophers_stone',
       'nuclear_reactor', 'answer_to_everything', 'nanobots', 'dark_matter_engine', 'nebula_harvester', 'cosmic_battery'].includes(u.id)
    );

    // XP boost related sub-upgrades
    const xpSubUpgrades = this.subUpgrades.filter(u => 
      ['motivational_posters', 'void_channeling', 'time_machine', 'universe_map', 'stellar_forge', 'nebula_harvester'].includes(u.id)
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
        const cooldown = this.getFireCooldown(state);
        // Don't allow buying if already at minimum cooldown
        return state.points >= cost && cooldown > 50;
      },
      buy: (state: GameState) => {
        state.attackSpeedLevel++;
      },
      getLevel: (state: GameState) => state.attackSpeedLevel,
      getDisplayText: (state: GameState) => {
        const cooldown = this.getFireCooldown(state);
        const suffix = cooldown <= 50 ? ' [MAX]' : '';
        return `Lv.${state.attackSpeedLevel.toString()} (${cooldown.toString()}ms${suffix})`;
      },
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
      description: 'Generate points automatically over time. Scales exponentially!',
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
        `Lv.${state.resourceGenLevel.toString()} (${this.formatPassiveGen(this.getPassiveGen(state))}/sec)`,
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

    // Plasma matrix: +25%
    if (state.subUpgrades['plasma_matrix']) {
      multiplier *= 1.25;
    }

    // Quantum entanglement: x1.5
    if (state.subUpgrades['quantum_entanglement']) {
      multiplier *= 1.5;
    }

    // Stellar forge: +20%
    if (state.subUpgrades['stellar_forge']) {
      multiplier *= 1.20;
    }

    // Antimatter cascade: x4 (for clicks)
    if (state.subUpgrades['antimatter_cascade']) {
      multiplier *= 4;
    }

    // Hyper reactor: x2
    if (state.subUpgrades['hyper_reactor']) {
      multiplier *= 2;
    }

    // Photon amplifier: +30%
    if (state.subUpgrades['photon_amplifier']) {
      multiplier *= 1.30;
    }

    // Reality anchor: +25%
    if (state.subUpgrades['reality_anchor']) {
      multiplier *= 1.25;
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

    // Click-focused upgrades
    if (state.subUpgrades['master_clicker']) {
      multiplier *= 2;
    }

    if (state.subUpgrades['click_multiplier']) {
      multiplier *= 3;
    }

    if (state.subUpgrades['super_clicker']) {
      multiplier *= 5;
    }

    // Perfect precision: 5% chance for 10x (handled in Game.ts)
    if (state.subUpgrades['perfect_precision']) {
      if (Math.random() < 0.05) {
        multiplier *= 10;
      }
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      multiplier *= this.ascensionSystem.getDamageMultiplier(state);
      multiplier *= this.ascensionSystem.getPointsMultiplier(state);
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

    // Quantum entanglement: +8%
    if (state.subUpgrades['quantum_entanglement']) {
      chance += 8;
    }

    // Hyper reactor: +5%
    if (state.subUpgrades['hyper_reactor']) {
      chance += 5;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      chance += this.ascensionSystem.getCritBonus(state);
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

    // Reality anchor: x3
    if (state.subUpgrades['reality_anchor']) {
      multiplier *= 3;
    }

    return multiplier;
  }

  getPassiveGen(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    // Exponential scaling with level progression
    let gen = state.resourceGenLevel * 10 * Math.pow(1.2, state.resourceGenLevel * 0.5);

    // Coffee machine: +50/sec
    if (state.subUpgrades['coffee_machine']) {
      gen += 50;
    }

    // Space pizza: +200/sec
    if (state.subUpgrades['space_pizza']) {
      gen += 200;
    }

    // Arcade machine: +1000/sec
    if (state.subUpgrades['arcade_machine']) {
      gen += 1000;
    }

    // Nanobots: +2500/sec
    if (state.subUpgrades['nanobots']) {
      gen += 2500;
    }

    // Nebula harvester: +5000/sec
    if (state.subUpgrades['nebula_harvester']) {
      gen += 5000;
    }

    // Philosopher's stone: x5
    if (state.subUpgrades['philosophers_stone']) {
      gen *= 5;
    }

    // Dark matter engine: x3
    if (state.subUpgrades['dark_matter_engine']) {
      gen *= 3;
    }

    // Nuclear reactor: +10000/sec
    if (state.subUpgrades['nuclear_reactor']) {
      gen += 10000;
    }

    // Cosmic battery: x7
    if (state.subUpgrades['cosmic_battery']) {
      gen *= 7;
    }

    // Answer to everything: x10
    if (state.subUpgrades['answer_to_everything']) {
      gen *= 10;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      gen *= this.ascensionSystem.getPassiveMultiplier(state);
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

    // Stellar forge: +75%
    if (state.subUpgrades['stellar_forge']) {
      multiplier *= 1.75;
    }

    // Nebula harvester: +50%
    if (state.subUpgrades['nebula_harvester']) {
      multiplier *= 1.50;
    }

    // Universe map: x3
    if (state.subUpgrades['universe_map']) {
      multiplier *= 3;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      multiplier *= this.ascensionSystem.getXPMultiplier(state);
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

    // Plasma matrix: +15% speed
    if (state.subUpgrades['plasma_matrix']) {
      cooldown *= 0.85;
    }

    // Holographic decoys: x2 speed = 0.5x cooldown
    if (state.subUpgrades['holographic_decoys']) {
      cooldown *= 0.5;
    }

    // Temporal acceleration: +100% speed = 0.5x cooldown
    if (state.subUpgrades['temporal_acceleration']) {
      cooldown *= 0.5;
    }

    // Dark matter engine: +25% speed
    if (state.subUpgrades['dark_matter_engine']) {
      cooldown *= 0.75;
    }

    // Photon amplifier: +75% speed
    if (state.subUpgrades['photon_amplifier']) {
      cooldown *= 0.57;
    }

    // Disco ball: +15% speed
    if (state.subUpgrades['disco_ball']) {
      cooldown *= 0.85;
    }

    // Infinity gauntlet: +40% speed
    if (state.subUpgrades['infinity_gauntlet']) {
      cooldown *= 0.60;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      const speedMult = this.ascensionSystem.getSpeedMultiplier(state);
      cooldown /= speedMult;
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

  private formatPassiveGen(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(1);
  }
}
