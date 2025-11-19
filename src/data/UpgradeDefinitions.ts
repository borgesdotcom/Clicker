import { SubUpgrade } from '../types';

export const UPGRADE_DEFINITIONS: SubUpgrade[] = [
  // === EARLY GAME UPGRADES (Level 1-20) ===
  {
    id: 'death_pact',
    name: 'Death Pact Agreement',
    description: 'Ships gain +10% attack speed',
    flavor:
      'Signed contract guarantees "hostile" alien supply chain. Very convenient.',
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
    flavor:
      'These crystals make the aliens make a very satisfying *pop* sound when destroyed.',
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
    flavor:
      'Crew stays awake for 24/7 defense operations. The aliens are coming. Definitely coming.',
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
    flavor:
      'Precise targeting ensures maximum... elimination efficiency. The paperwork checks out.',
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
    description: '+2% critical hit chance',
    flavor:
      'Rolled a 7! These dice ensure maximum alien destruction rates. The invasion pays... wait.',
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
    flavor:
      'Recycle alien material for maximum efficiency. Very environmentally conscious defense operation.',
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
    flavor:
      'Overclock reactors beyond safety limits. Defense emergencies require... creative solutions.',
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
    flavor:
      'Fleet coordinates synchronized attacks. The aliens never stand a chance. Especially these ones.',
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
    flavor:
      'Neural link directly to your trigger finger. Click faster, eliminate faster. Very efficient.',
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
    flavor:
      'Keep crews fed during extended defense operations. Happy workers eliminate aliens better.',
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
    id: 'falafel_rollo_special',
    name: 'Falafel Rollo Special',
    description: '+10% damage',
    flavor:
      "The aliens can't resist the delicious smell. The secret ingredient is... well, we're not entirely sure, but it works! Warning: may cause space indigestion.",
    cost: 40000,
    owned: false,
    requires: (state) => state.subUpgrades['space_pizza'] === true,
    isVisible: (state) => state.subUpgrades['space_pizza'] === true,
    buy: (state) => {
      state.subUpgrades['falafel_rollo_special'] = true;
    },
  },
  {
    id: 'antimatter_rounds',
    name: 'Antimatter Ammunition',
    description: 'Double all point gains',
    flavor:
      'Antimatter makes the aliens pop twice as satisfyingly. Very therapeutic for stress relief.',
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
    flavor:
      "The aliens can't resist the disco beat. They line up perfectly for... elimination.",
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
    flavor: "The AI promises it won't become self-aware. Probably.",
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
    description: 'Critical hits deal 20% more damage',
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
    flavor:
      'The void stares back. It approves of your... efficient defense operations.',
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
    description: 'Critical hits +3%, Damage x1.5',
    flavor:
      "Spooky action at a distance. Einstein hated it. You'll love it.",
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
    flavor:
      'Turns lead into gold. And boredom into... productivity. Very efficient.',
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
    flavor: "95% of the universe is dark matter. Now it's yours.",
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
    flavor:
      'Perfectly balanced, as all things should be. Also, not trademarked.',
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
    flavor:
      '"To Serve Aliens" - A cookbook! Wait, what? These are definitely hostile aliens, right?',
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
    description: 'All damage x2, Critical chance +2%',
    flavor: "Powers drawn from dimensions we can't even see.",
    cost: 100000000,
    owned: false,
    requires: (state) => state.level >= 75,
    isVisible: (state) => state.level >= 75,
    buy: (state) => {
      state.subUpgrades['hyper_reactor'] = true;
    },
  },
  {
    id: 'fleet_command_center',
    name: 'Fleet Command Center',
    description: 'Attack damage x1.4',
    flavor: 'Centralized coordination multiplies fleet effectiveness. Every ship fires in perfect harmony.',
    cost: 500000000,
    owned: false,
    requires: (state) => state.level >= 75 && state.shipsCount >= 70,
    isVisible: (state) => state.level >= 75 && state.shipsCount >= 70, // Must meet both requirements
    buy: (state) => {
      state.subUpgrades['fleet_command_center'] = true;
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
    flavor: "Light speed is too slow. We're going to ludicrous speed!",
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
    description: 'Critical damage +50%, All gains +25%',
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
    description: 'Critical hit chance +2%, Critical damage +20%',
    flavor: "It's either a dragon egg or a really angry space chicken.",
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
    flavor: "It's 42. But what was the question again?",
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
    flavor:
      "Spoiler: It's clicking aliens all the way down. The meaning of life? Clicking. Definitely.",
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
    flavor:
      'Click, click, eliminate! Master the art of alien destruction. Very satisfying.',
    cost: 50000,
    owned: false,
    requires: (state) => state.stats.totalClicks >= 1000,
    isVisible: (state) => state.stats.totalClicks >= 500,
    buy: (state) => {
      state.subUpgrades['master_clicker'] = true;
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
  // === ULTRA LATE GAME UPGRADES (Level 200-500) ===
  {
    id: 'multiversal_matrix',
    name: 'Multiversal Probability Matrix',
    description: 'Damage x5, Critical chance +5%',
    flavor: 'Exists in all timelines simultaneously. Very confusing.',
    cost: 500000000,
    owned: false,
    requires: (state) => state.level >= 200,
    isVisible: (state) => state.level >= 200,
    buy: (state) => {
      state.subUpgrades['multiversal_matrix'] = true;
    },
  },
  {
    id: 'entropy_reversal',
    name: 'Entropy Reversal Engine',
    description: 'Passive generation x15, XP gain +100%',
    flavor: 'Time flows backwards. Or forwards. Hard to tell.',
    cost: 750000000,
    owned: false,
    requires: (state) => state.resourceGenLevel >= 70,
    isVisible: (state) => state.resourceGenLevel >= 70,
    buy: (state) => {
      state.subUpgrades['entropy_reversal'] = true;
    },
  },
  {
    id: 'omniscient_ai',
    name: 'Omniscient AI Core',
    description: 'All stats +75%, Upgrades 30% cheaper',
    flavor: "Knows what you're going to buy before you do.",
    cost: 1000000000,
    owned: false,
    requires: (state) => state.level >= 250,
    isVisible: (state) => state.level >= 250,
    buy: (state) => {
      state.subUpgrades['omniscient_ai'] = true;
    },
  },
  {
    id: 'big_bang_generator',
    name: 'Big Bang Generator',
    description: 'All damage x10, Creates universes per hit',
    flavor: 'Let there be light! And death! Mostly death.',
    cost: 2500000000,
    owned: false,
    requires: (state) => state.level >= 300,
    isVisible: (state) => state.level >= 300,
    buy: (state) => {
      state.subUpgrades['big_bang_generator'] = true;
    },
  },
  {
    id: 'dimensional_collapse',
    name: 'Dimensional Collapse Weapon',
    description: 'Critical damage +80%, Attack speed +100%',
    flavor: 'Collapses dimensions. Please aim responsibly.',
    cost: 5000000000,
    owned: false,
    requires: (state) => state.critChanceLevel >= 60,
    isVisible: (state) => state.critChanceLevel >= 60,
    buy: (state) => {
      state.subUpgrades['dimensional_collapse'] = true;
    },
  },

  // === TRANSCENDENT UPGRADES (Level 500-750) ===
  {
    id: 'reality_compiler',
    name: 'Reality Compiler',
    description: 'Recompile reality: All gains x20',
    flavor: 'Compiled in Release mode for maximum performance.',
    cost: 10000000000,
    owned: false,
    requires: (state) => state.level >= 500,
    isVisible: (state) => state.level >= 500,
    buy: (state) => {
      state.subUpgrades['reality_compiler'] = true;
    },
  },
  {
    id: 'akashic_records',
    name: 'Akashic Records Access',
    description: 'XP x10, Retain all knowledge between lives',
    flavor: "The universe's library card. No late fees.",
    cost: 25000000000,
    owned: false,
    requires: (state) => state.xpBoostLevel >= 75,
    isVisible: (state) => state.xpBoostLevel >= 75,
    buy: (state) => {
      state.subUpgrades['akashic_records'] = true;
    },
  },
  {
    id: 'void_heart',
    name: 'Heart of the Void',
    description: 'Boss damage +500%, Absorb enemy essence',
    flavor: 'The void stares back. You stare harder.',
    cost: 50000000000,
    owned: false,
    requires: (state) => state.stats.bossesKilled >= 100,
    isVisible: (state) => state.stats.bossesKilled >= 75,
    buy: (state) => {
      state.subUpgrades['void_heart'] = true;
    },
  },
  {
    id: 'eternal_engine',
    name: 'Eternal Engine',
    description: 'Passive generation x50, Never stops',
    flavor: 'Perpetual motion achieved. Physics weeps.',
    cost: 100000000000,
    owned: false,
    requires: (state) => state.resourceGenLevel >= 100,
    isVisible: (state) => state.resourceGenLevel >= 100,
    buy: (state) => {
      state.subUpgrades['eternal_engine'] = true;
    },
  },

  // === ULTIMATE UPGRADES (Level 750-1000+) ===
  {
    id: 'omega_protocol',
    name: 'Omega Protocol: Final Form',
    description: 'ALL MULTIPLIERS x25',
    flavor: "This isn't even my final form. Wait, yes it is.",
    cost: 500000000000,
    owned: false,
    requires: (state) => state.level >= 750,
    isVisible: (state) => state.level >= 750,
    buy: (state) => {
      state.subUpgrades['omega_protocol'] = true;
    },
  },
  {
    id: 'infinity_engine',
    name: 'Infinity Engine',
    description: 'Clicks deal ∞ × 0.01 damage (effectively x100)',
    flavor: 'Infinity contained in a box. Do not open.',
    cost: 1000000000000,
    owned: false,
    requires: (state) => state.stats.totalClicks >= 100000,
    isVisible: (state) => state.stats.totalClicks >= 75000,
    buy: (state) => {
      state.subUpgrades['infinity_engine'] = true;
    },
  },
  {
    id: 'universe_seed',
    name: 'Universe Seed',
    description: 'Plant new universes: All gains x100',
    flavor: 'Water daily. Harvest in 13.8 billion years.',
    cost: 5000000000000,
    owned: false,
    requires: (state) => state.level >= 1000,
    isVisible: (state) => state.level >= 1000,
    buy: (state) => {
      state.subUpgrades['universe_seed'] = true;
    },
  },
  {
    id: 'transcendence',
    name: 'True Transcendence',
    description: 'Ascend beyond ascension: Prestige points x10',
    flavor: 'You have become clicking itself.',
    cost: 10000000000000,
    owned: false,
    requires: (state) => state.prestigeLevel >= 5,
    isVisible: (state) => state.prestigeLevel >= 3,
    buy: (state) => {
      state.subUpgrades['transcendence'] = true;
    },
  },

  // === v3.0: MUTATION ENGINE UPGRADES (Transformative Abilities) ===
  {
    id: 'adaptive_evolution',
    name: 'Adaptive Evolution',
    description: '+5% all damage, adapts to enemy types',
    flavor: 'Survival of the fittest. You are the fittest.',
    cost: 200000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 1,
    isVisible: (state) => state.mutationEngineLevel >= 1,
    buy: (state) => {
      state.subUpgrades['adaptive_evolution'] = true;
    },
  },
  {
    id: 'symbiotic_weapons',
    name: 'Symbiotic Weapons',
    description: '+8% all damage, weapons evolve with use',
    flavor: 'Your weapons are alive. And hungry.',
    cost: 400000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 3,
    isVisible: (state) => state.mutationEngineLevel >= 3,
    buy: (state) => {
      state.subUpgrades['symbiotic_weapons'] = true;
    },
  },
  {
    id: 'regenerative_hull',
    name: 'Regenerative Hull',
    description: '+12% all damage, passive healing',
    flavor: 'Damage? What damage?',
    cost: 800000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 5,
    isVisible: (state) => state.mutationEngineLevel >= 5,
    buy: (state) => {
      state.subUpgrades['regenerative_hull'] = true;
    },
  },
  {
    id: 'hive_mind',
    name: 'Hive Mind Connection',
    description: '+18% all damage, shared consciousness',
    flavor: 'We are many. We are one.',
    cost: 1500000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 10,
    isVisible: (state) => state.mutationEngineLevel >= 10,
    buy: (state) => {
      state.subUpgrades['hive_mind'] = true;
    },
  },
  {
    id: 'perfect_organism',
    name: 'Perfect Organism',
    description: '+25% all damage, immune to debuffs',
    flavor: 'Perfection achieved. Evolution complete.',
    cost: 3000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 15,
    isVisible: (state) => state.mutationEngineLevel >= 15,
    buy: (state) => {
      state.subUpgrades['perfect_organism'] = true;
    },
  },
  {
    id: 'eldritch_evolution',
    name: 'Eldritch Evolution',
    description: '+35% all damage, unknowable forms',
    flavor: 'You have seen beyond the veil. It stares back.',
    cost: 7000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 25,
    isVisible: (state) => state.mutationEngineLevel >= 25,
    buy: (state) => {
      state.subUpgrades['eldritch_evolution'] = true;
    },
  },
  {
    id: 'cosmic_horror',
    name: 'Cosmic Horror',
    description: '+50% all damage, enemies fear you',
    flavor: 'That is not dead which can eternal lie...',
    cost: 15000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 35,
    isVisible: (state) => state.mutationEngineLevel >= 35,
    buy: (state) => {
      state.subUpgrades['cosmic_horror'] = true;
    },
  },
  {
    id: 'transcendent_form',
    name: 'Transcendent Form',
    description: '+75% all damage, beyond mortality',
    flavor: 'You are no longer bound by flesh.',
    cost: 35000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 50,
    isVisible: (state) => state.mutationEngineLevel >= 50,
    buy: (state) => {
      state.subUpgrades['transcendent_form'] = true;
    },
  },
  {
    id: 'living_weapon',
    name: 'Living Weapon',
    description: '+100% all damage, you ARE the weapon',
    flavor: 'Weapon and wielder are one.',
    cost: 80000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 75,
    isVisible: (state) => state.mutationEngineLevel >= 75,
    buy: (state) => {
      state.subUpgrades['living_weapon'] = true;
    },
  },
  {
    id: 'apex_predator',
    name: 'Apex Predator',
    description: '+150% all damage, top of the food chain',
    flavor: 'Nothing survives your hunt.',
    cost: 200000000,
    owned: false,
    requires: (state) => state.mutationEngineLevel >= 100,
    isVisible: (state) => state.mutationEngineLevel >= 100,
    buy: (state) => {
      state.subUpgrades['apex_predator'] = true;
    },
  },

  // === v3.0: ENERGY CORE UPGRADES (Energy and Speed) ===
  {
    id: 'fusion_reactor',
    name: 'Fusion Reactor',
    description: '+5% attack speed, +100/sec passive',
    flavor: 'The power of the sun, in your hands.',
    cost: 100000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 1,
    isVisible: (state) => state.energyCoreLevel >= 1,
    buy: (state) => {
      state.subUpgrades['fusion_reactor'] = true;
    },
  },
  {
    id: 'zero_point',
    name: 'Zero Point Energy',
    description: '+8% attack speed, +250/sec passive',
    flavor: 'Harvest energy from the quantum foam.',
    cost: 250000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 3,
    isVisible: (state) => state.energyCoreLevel >= 3,
    buy: (state) => {
      state.subUpgrades['zero_point'] = true;
    },
  },
  {
    id: 'perpetual_motion',
    name: 'Perpetual Motion Machine',
    description: '+12% attack speed, +500/sec passive',
    flavor: 'Physics professors hate this one trick!',
    cost: 500000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 5,
    isVisible: (state) => state.energyCoreLevel >= 5,
    buy: (state) => {
      state.subUpgrades['perpetual_motion'] = true;
    },
  },
  {
    id: 'tesla_coils',
    name: 'Tesla Coils',
    description: '+15% attack speed, chain lightning',
    flavor: 'Unlimited power!',
    cost: 1000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 10,
    isVisible: (state) => state.energyCoreLevel >= 10,
    buy: (state) => {
      state.subUpgrades['tesla_coils'] = true;
    },
  },
  {
    id: 'arc_reactor',
    name: 'Arc Reactor',
    description: '+20% attack speed, +1000/sec passive',
    flavor: 'Proof that you have a heart. A mechanical one.',
    cost: 2500000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 15,
    isVisible: (state) => state.energyCoreLevel >= 15,
    buy: (state) => {
      state.subUpgrades['arc_reactor'] = true;
    },
  },
  {
    id: 'harvested_star',
    name: 'Harvested Star',
    description: '+30% attack speed, +5000/sec passive',
    flavor: 'You plucked a star from the sky. Now it works for you.',
    cost: 5000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 25,
    isVisible: (state) => state.energyCoreLevel >= 25,
    buy: (state) => {
      state.subUpgrades['harvested_star'] = true;
    },
  },
  {
    id: 'vacuum_energy_tap',
    name: 'Vacuum Energy Tap',
    description: '+40% attack speed, +10000/sec passive',
    flavor: 'Siphon energy from the fabric of space.',
    cost: 12000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 35,
    isVisible: (state) => state.energyCoreLevel >= 35,
    buy: (state) => {
      state.subUpgrades['vacuum_energy_tap'] = true;
    },
  },
  {
    id: 'entropy_reversal_engine',
    name: 'Entropy Reversal Engine',
    description: '+55% attack speed, time flows backward',
    flavor: 'Heat death? Not on your watch.',
    cost: 25000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 50,
    isVisible: (state) => state.energyCoreLevel >= 50,
    buy: (state) => {
      state.subUpgrades['entropy_reversal_engine'] = true;
    },
  },
  {
    id: 'big_crunch_generator',
    name: 'Big Crunch Generator',
    description: '+75% attack speed, reverse the universe',
    flavor: 'Contains a miniature universe collapse.',
    cost: 60000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 75,
    isVisible: (state) => state.energyCoreLevel >= 75,
    buy: (state) => {
      state.subUpgrades['big_crunch_generator'] = true;
    },
  },
  {
    id: 'multiversal_tap',
    name: 'Multiversal Energy Tap',
    description: '+100% attack speed, infinite parallel power',
    flavor: 'Draw power from infinite realities.',
    cost: 150000000,
    owned: false,
    requires: (state) => state.energyCoreLevel >= 100,
    isVisible: (state) => state.energyCoreLevel >= 100,
    buy: (state) => {
      state.subUpgrades['multiversal_tap'] = true;
    },
  },

  // === v3.0: COSMIC KNOWLEDGE UPGRADES (Cost Reduction and XP) ===
  {
    id: 'ancient_texts',
    name: 'Ancient Texts',
    description: '-3% all costs, +10% XP',
    flavor: 'The wisdom of civilizations long dead.',
    cost: 150000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 1,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 1,
    buy: (state) => {
      state.subUpgrades['ancient_texts'] = true;
    },
  },
  {
    id: 'akashic_records_library',
    name: 'Akashic Records',
    description: '-5% all costs, +15% XP',
    flavor: 'Access the universal library.',
    cost: 350000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 3,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 3,
    buy: (state) => {
      state.subUpgrades['akashic_records_library'] = true;
    },
  },
  {
    id: 'prophetic_vision',
    name: 'Prophetic Vision',
    description: '-7% all costs, +20% XP, see the future',
    flavor: 'You know what comes next.',
    cost: 750000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 5,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 5,
    buy: (state) => {
      state.subUpgrades['prophetic_vision'] = true;
    },
  },
  {
    id: 'universal_translator',
    name: 'Universal Translator',
    description: '-10% all costs, +25% XP',
    flavor: 'Understand all languages. Even alien ones.',
    cost: 1500000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 10,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 10,
    buy: (state) => {
      state.subUpgrades['universal_translator'] = true;
    },
  },
  {
    id: 'omniscience_lite',
    name: 'Omniscience Lite',
    description: '-15% all costs, +35% XP',
    flavor: 'Know almost everything. Almost.',
    cost: 3500000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 15,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 15,
    buy: (state) => {
      state.subUpgrades['omniscience_lite'] = true;
    },
  },
  {
    id: 'forbidden_theorems',
    name: 'Forbidden Theorems',
    description: '-20% all costs, +50% XP',
    flavor: "Mathematics that shouldn't exist.",
    cost: 8000000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 25,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 25,
    buy: (state) => {
      state.subUpgrades['forbidden_theorems'] = true;
    },
  },
  {
    id: 'schrodinger_upgrade',
    name: "Schrödinger's Upgrade",
    description: '-25% all costs, both bought and not bought',
    flavor: 'It exists in a superposition of states.',
    cost: 18000000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 35,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 35,
    buy: (state) => {
      state.subUpgrades['schrodinger_upgrade'] = true;
    },
  },
  {
    id: 'universal_constants',
    name: 'Universal Constants',
    description: '-30% all costs, +75% XP, modify physics',
    flavor: 'The speed of light is now negotiable.',
    cost: 40000000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 50,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 50,
    buy: (state) => {
      state.subUpgrades['universal_constants'] = true;
    },
  },
  {
    id: 'apotheosis',
    name: 'Apotheosis',
    description: '-40% all costs, +100% XP, become divine',
    flavor: 'Mortals worship you now.',
    cost: 90000000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 75,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 75,
    buy: (state) => {
      state.subUpgrades['apotheosis'] = true;
    },
  },
  {
    id: 'omniscience',
    name: 'True Omniscience',
    description: '-50% all costs, +150% XP, know everything',
    flavor: 'There are no more secrets.',
    cost: 250000000,
    owned: false,
    requires: (state) => state.cosmicKnowledgeLevel >= 100,
    isVisible: (state) => state.cosmicKnowledgeLevel >= 100,
    buy: (state) => {
      state.subUpgrades['omniscience'] = true;
    },
  },
];

