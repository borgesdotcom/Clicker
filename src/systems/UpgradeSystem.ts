import type { GameState, UpgradeConfig, SubUpgrade } from '../types';
import { NumberFormatter } from '../utils/NumberFormatter';

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

  private artifactSystem: {
    getDamageBonus: () => number;
    getSpeedBonus: () => number;
    getCritBonus: () => number;
    getPointsBonus: () => number;
    getXPBonus: () => number;
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

  setArtifactSystem(artifactSystem: {
    getDamageBonus: () => number;
    getSpeedBonus: () => number;
    getCritBonus: () => number;
    getPointsBonus: () => number;
    getXPBonus: () => number;
  }): void {
    this.artifactSystem = artifactSystem;
  }

  private initializeSubUpgrades(): void {
    this.subUpgrades = [
      // === EARLY GAME UPGRADES (Level 1-20) ===
      {
        id: 'death_pact',
        name: 'Death Pact Agreement',
        description: 'Ships gain +10% attack speed',
        flavor: 'Signed contract guarantees "hostile" alien supply chain. Very convenient.',
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
        flavor: 'Crew stays awake for 24/7 defense operations. The aliens are coming. Definitely coming.',
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
        flavor: 'Precise targeting ensures maximum... elimination efficiency. The paperwork checks out.',
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
        flavor:
          "Rolled a 7! These dice ensure maximum alien destruction rates. The invasion pays... wait.",
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
        flavor: 'Recycle alien material for maximum efficiency. Very environmentally conscious defense operation.',
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
        flavor: 'Overclock reactors beyond safety limits. Defense emergencies require... creative solutions.',
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
        flavor: 'Fleet coordinates synchronized attacks. The aliens never stand a chance. Especially these ones.',
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
        flavor: 'Neural link directly to your trigger finger. Click faster, eliminate faster. Very efficient.',
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
        flavor: 'Keep crews fed during extended defense operations. Happy workers eliminate aliens better.',
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
        flavor: 'Antimatter makes the aliens pop twice as satisfyingly. Very therapeutic for stress relief.',
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
        flavor: 'The aliens can\'t resist the disco beat. They line up perfectly for... elimination.',
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
        flavor: 'The void stares back. It approves of your... efficient defense operations.',
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
        flavor: 'Turns lead into gold. And boredom into... productivity. Very efficient.',
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
        flavor: '"To Serve Aliens" - A cookbook! Wait, what? These are definitely hostile aliens, right?',
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
        flavor: "Spoiler: It's clicking aliens all the way down. The meaning of life? Clicking. Definitely.",
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
        flavor: 'Click, click, eliminate! Master the art of alien destruction. Very satisfying.',
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
      // === ULTRA LATE GAME UPGRADES (Level 200-500) ===
      {
        id: 'multiversal_matrix',
        name: 'Multiversal Probability Matrix',
        description: 'Damage x5, Critical chance +15%',
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
        description: 'Critical damage x5, Attack speed +200%',
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

      // === v3.0: WEAPON MASTERY UPGRADES (Main Ship Damage) ===
      {
        id: 'scope_calibration',
        name: 'Scope Calibration',
        description: '+10% main ship damage',
        flavor: 'Measure twice, destroy once.',
        cost: 50000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 1,
        isVisible: (state) => state.weaponMasteryLevel >= 1,
        buy: (state) => {
          state.subUpgrades['scope_calibration'] = true;
        },
      },
      {
        id: 'hair_trigger',
        name: 'Hair Trigger Mechanism',
        description: '+15% main ship damage, +5% click speed',
        flavor: 'Accidents happen. A lot.',
        cost: 100000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 3,
        isVisible: (state) => state.weaponMasteryLevel >= 3,
        buy: (state) => {
          state.subUpgrades['hair_trigger'] = true;
        },
      },
      {
        id: 'hollow_point',
        name: 'Hollow Point Rounds',
        description: '+20% main ship damage, +10% crit damage',
        flavor: 'They expand on impact. So does your damage.',
        cost: 250000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 5,
        isVisible: (state) => state.weaponMasteryLevel >= 5,
        buy: (state) => {
          state.subUpgrades['hollow_point'] = true;
        },
      },
      {
        id: 'explosive_payload',
        name: 'Explosive Payload',
        description: '+30% main ship damage',
        flavor: 'Sometimes subtlety is overrated.',
        cost: 500000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 10,
        isVisible: (state) => state.weaponMasteryLevel >= 10,
        buy: (state) => {
          state.subUpgrades['explosive_payload'] = true;
        },
      },
      {
        id: 'particle_accelerator',
        name: 'Particle Accelerator Cannon',
        description: '+50% main ship damage',
        flavor: 'Accelerates particles. And destruction.',
        cost: 1000000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 15,
        isVisible: (state) => state.weaponMasteryLevel >= 15,
        buy: (state) => {
          state.subUpgrades['particle_accelerator'] = true;
        },
      },
      {
        id: 'singularity_cannon',
        name: 'Singularity Cannon',
        description: '+75% main ship damage, small AoE',
        flavor: 'Contains a microscopic black hole. Totally safe.',
        cost: 2500000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 25,
        isVisible: (state) => state.weaponMasteryLevel >= 25,
        buy: (state) => {
          state.subUpgrades['singularity_cannon'] = true;
        },
      },
      {
        id: 'antimatter_warheads',
        name: 'Antimatter Warheads',
        description: '+100% main ship damage',
        flavor: 'When matter meets antimatter, things get interesting.',
        cost: 5000000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 35,
        isVisible: (state) => state.weaponMasteryLevel >= 35,
        buy: (state) => {
          state.subUpgrades['antimatter_warheads'] = true;
        },
      },
      {
        id: 'quark_disruptor',
        name: 'Quark Disruptor',
        description: '+150% main ship damage',
        flavor: 'Disrupts quarks. And everything else.',
        cost: 10000000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 50,
        isVisible: (state) => state.weaponMasteryLevel >= 50,
        buy: (state) => {
          state.subUpgrades['quark_disruptor'] = true;
        },
      },
      {
        id: 'gamma_ray_burst',
        name: 'Gamma Ray Burst',
        description: '+200% main ship damage',
        flavor: 'Harness the power of dying stars.',
        cost: 25000000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 75,
        isVisible: (state) => state.weaponMasteryLevel >= 75,
        buy: (state) => {
          state.subUpgrades['gamma_ray_burst'] = true;
        },
      },
      {
        id: 'planck_piercer',
        name: 'Planck Piercer',
        description: '+300% main ship damage, ignores 25% defense',
        flavor: 'Strikes at the fabric of reality itself.',
        cost: 100000000,
        owned: false,
        requires: (state) => state.weaponMasteryLevel >= 100,
        isVisible: (state) => state.weaponMasteryLevel >= 100,
        buy: (state) => {
          state.subUpgrades['planck_piercer'] = true;
        },
      },

      // === v3.0: FLEET COMMAND UPGRADES (Auto-Fire Ships) ===
      {
        id: 'drill_sergeant',
        name: 'Drill Sergeant AI',
        description: '+8% auto-fire damage',
        flavor: 'DROP AND GIVE ME TWENTY... MILLION DAMAGE!',
        cost: 75000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 1,
        isVisible: (state) => state.fleetCommandLevel >= 1,
        buy: (state) => {
          state.subUpgrades['drill_sergeant'] = true;
        },
      },
      {
        id: 'formation_delta',
        name: 'Formation Delta',
        description: '+12% auto-fire damage, ships move in formation',
        flavor: 'Unity is strength. And more damage.',
        cost: 150000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 3,
        isVisible: (state) => state.fleetCommandLevel >= 3,
        buy: (state) => {
          state.subUpgrades['formation_delta'] = true;
        },
      },
      {
        id: 'emergency_repairs',
        name: 'Emergency Repair Drones',
        description: '+15% auto-fire damage, ships self-repair',
        flavor: 'Duct tape in space. It works!',
        cost: 300000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 5,
        isVisible: (state) => state.fleetCommandLevel >= 5,
        buy: (state) => {
          state.subUpgrades['emergency_repairs'] = true;
        },
      },
      {
        id: 'fleet_tactics',
        name: 'Advanced Fleet Tactics',
        description: '+20% auto-fire damage per 10 ships',
        flavor: 'Coordination makes the dream work.',
        cost: 600000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 10,
        isVisible: (state) => state.fleetCommandLevel >= 10,
        buy: (state) => {
          state.subUpgrades['fleet_tactics'] = true;
        },
      },
      {
        id: 'automated_repairs',
        name: 'Automated Repair System',
        description: '+25% auto-fire damage, reduced ship costs',
        flavor: 'Ships that fix themselves. The future is now.',
        cost: 1200000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 15,
        isVisible: (state) => state.fleetCommandLevel >= 15,
        buy: (state) => {
          state.subUpgrades['automated_repairs'] = true;
        },
      },
      {
        id: 'ai_swarm',
        name: 'AI Swarm Intelligence',
        description: '+35% auto-fire damage, ships learn from each other',
        flavor: 'The collective knows all. The collective destroys all.',
        cost: 3000000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 25,
        isVisible: (state) => state.fleetCommandLevel >= 25,
        buy: (state) => {
          state.subUpgrades['ai_swarm'] = true;
        },
      },
      {
        id: 'nanite_reconstruction',
        name: 'Nanite Reconstruction',
        description: '+50% auto-fire damage, ships rebuild instantly',
        flavor: 'Nanomachines, son!',
        cost: 6000000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 35,
        isVisible: (state) => state.fleetCommandLevel >= 35,
        buy: (state) => {
          state.subUpgrades['nanite_reconstruction'] = true;
        },
      },
      {
        id: 'fleet_synchronization',
        name: 'Fleet Synchronization Matrix',
        description: '+75% auto-fire damage, perfect coordination',
        flavor: 'One mind, infinite ships.',
        cost: 12000000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 50,
        isVisible: (state) => state.fleetCommandLevel >= 50,
        buy: (state) => {
          state.subUpgrades['fleet_synchronization'] = true;
        },
      },
      {
        id: 'quantum_coordination',
        name: 'Quantum Coordination',
        description: '+100% auto-fire damage, instant communication',
        flavor: 'Entangled ships attack as one.',
        cost: 30000000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 75,
        isVisible: (state) => state.fleetCommandLevel >= 75,
        buy: (state) => {
          state.subUpgrades['quantum_coordination'] = true;
        },
      },
      {
        id: 'universal_fleet',
        name: 'Universal Fleet Consciousness',
        description: '+150% auto-fire damage, ships share damage',
        flavor: 'The fleet is eternal. The fleet is unstoppable.',
        cost: 120000000,
        owned: false,
        requires: (state) => state.fleetCommandLevel >= 100,
        isVisible: (state) => state.fleetCommandLevel >= 100,
        buy: (state) => {
          state.subUpgrades['universal_fleet'] = true;
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
  }

  getSubUpgrades(): SubUpgrade[] {
    return this.subUpgrades.map((upgrade) => ({
      ...upgrade,
      owned: upgrade.owned,
    }));
  }

  updateSubUpgradesFromState(state: GameState): void {
    for (const upgrade of this.subUpgrades) {
      upgrade.owned = state.subUpgrades[upgrade.id] ?? false;
    }
  }

  getUpgrades(): UpgradeConfig[] {
    // Ship-related sub-upgrades
    const shipSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'death_pact',
        'ship_swarm',
        'perfect_precision',
      ].includes(u.id),
    );

    // Attack speed related sub-upgrades
    const attackSpeedSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'quantum_targeting',
        'warp_core',
        'ai_optimizer',
        'temporal_acceleration',
        'holographic_decoys',
        'photon_amplifier',
      ].includes(u.id),
    );

    // Point multiplier related sub-upgrades
    const pointMultiplierSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'laser_focusing',
        'overclocked_reactors',
        'neural_link',
        'antimatter_rounds',
        'singularity_core',
        'cosmic_ascension',
        'disco_ball',
        'chaos_emeralds',
        'infinity_gauntlet',
        'heart_of_galaxy',
        'meaning_of_life',
        'golden_goose',
        'master_clicker',
        'rapid_fire',
        'click_multiplier',
        'super_clicker',
        'plasma_matrix',
        'quantum_entanglement',
        'stellar_forge',
        'antimatter_cascade',
        'hyper_reactor',
        'photon_amplifier',
        'reality_anchor',
      ].includes(u.id),
    );

    // Critical hit related sub-upgrades
    const critSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'lucky_dice',
        'rubber_duck',
        'lucky_horseshoe',
        'dragon_egg',
        'quantum_entanglement',
        'hyper_reactor',
        'reality_anchor',
      ].includes(u.id),
    );

    // Resource generation related sub-upgrades
    const resourceSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'coffee_machine',
        'space_pizza',
        'arcade_machine',
        'philosophers_stone',
        'nuclear_reactor',
        'answer_to_everything',
        'nanobots',
        'dark_matter_engine',
        'nebula_harvester',
        'cosmic_battery',
      ].includes(u.id),
    );

    // XP boost related sub-upgrades
    const xpSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'motivational_posters',
        'void_channeling',
        'time_machine',
        'universe_map',
        'stellar_forge',
        'nebula_harvester',
      ].includes(u.id),
    );

    // General/misc sub-upgrades
    const miscSubUpgrades = this.subUpgrades.filter((u) =>
      ['energy_recycling', 'cheat_codes', 'alien_cookbook'].includes(u.id),
    );

    const shipUpgrade: UpgradeConfig = {
      id: 'ship',
      name: '🚀 Starship Fleet',
      description:
        'Recruit another starship to your armada. More ships = more firepower!',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(10 * Math.pow(1.15, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(10 * Math.pow(1.15, state.shipsCount)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.shipsCount++;
      },
      getLevel: (state: GameState) => state.shipsCount,
      getDisplayText: (state: GameState) =>
        `Fleet: ${state.shipsCount.toString()}`,
      subUpgrades: shipSubUpgrades,
    };

    const attackSpeedUpgrade: UpgradeConfig = {
      id: 'attackSpeed',
      name: '⚡ Attack Speed',
      description:
        'Upgrade targeting computers to fire faster. Speed is everything.',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(50 * Math.pow(1.25, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(50 * Math.pow(1.25, state.attackSpeedLevel)),
        );
        const cooldown = this.getFireCooldown(state);
        // Don't allow buying if already at minimum cooldown (50ms)
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
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(100 * Math.pow(1.3, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(100 * Math.pow(1.3, state.pointMultiplierLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.pointMultiplierLevel++;
      },
      getLevel: (state: GameState) => state.pointMultiplierLevel,
      getDisplayText: (state: GameState) => {
        const damage = this.getMainShipDamage(state);
        const formattedDamage =
          damage >= 1000 ? NumberFormatter.format(damage) : damage.toFixed(1);
        return `Lv.${state.pointMultiplierLevel.toString()} (${formattedDamage}/hit)`;
      },
      subUpgrades: pointMultiplierSubUpgrades,
    };

    const critChanceUpgrade: UpgradeConfig = {
      id: 'critChance',
      name: '✨ Critical Strike',
      description:
        'Master the perfect critical hit. Maximum destruction efficiency. Very satisfying.',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(150 * Math.pow(1.35, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(150 * Math.pow(1.35, state.critChanceLevel)),
        );
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
      description:
        'Automated alien elimination stations. They work while you sleep. Very efficient defense system.',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(200 * Math.pow(1.4, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(200 * Math.pow(1.4, state.resourceGenLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.resourceGenLevel++;
      },
      getLevel: (state: GameState) => state.resourceGenLevel,
      getDisplayText: (state: GameState) => {
        const passiveGen = this.getPassiveGen(state);
        const formatted =
          passiveGen >= 1000
            ? NumberFormatter.format(passiveGen)
            : this.formatPassiveGen(passiveGen);
        return `Lv.${state.resourceGenLevel.toString()} (${formatted}/sec)`;
      },
      subUpgrades: resourceSubUpgrades,
    };

    const xpBoostUpgrade: UpgradeConfig = {
      id: 'xpBoost',
      name: '📚 Knowledge Core',
      description: 'Learn advanced alien elimination techniques. Knowledge is power. Especially when eliminating.',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(250 * Math.pow(1.38, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(250 * Math.pow(1.38, state.xpBoostLevel)),
        );
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

    // v3.0: Weapon Mastery (main ship damage)
    const weaponMasterySubUpgrades = this.subUpgrades.filter((u) =>
      [
        'scope_calibration',
        'hair_trigger',
        'hollow_point',
        'explosive_payload',
        'particle_accelerator',
        'singularity_cannon',
        'antimatter_warheads',
        'quark_disruptor',
        'gamma_ray_burst',
        'planck_piercer',
      ].includes(u.id),
    );

    const weaponMasteryUpgrade: UpgradeConfig = {
      id: 'weaponMastery',
      name: '🔥 Weapon Mastery',
      description:
        'Master the art of destruction - increase main ship firepower',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(5000 * Math.pow(1.55, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(5000 * Math.pow(1.55, state.weaponMasteryLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.weaponMasteryLevel++;
      },
      getLevel: (state: GameState) => state.weaponMasteryLevel,
      getDisplayText: (state: GameState) => {
        const bonusPercent = state.weaponMasteryLevel * 10;
        const formatted =
          bonusPercent >= 1000
            ? NumberFormatter.format(bonusPercent)
            : bonusPercent.toString();
        return `Lv.${state.weaponMasteryLevel.toString()} (+${formatted}% damage)`;
      },
      subUpgrades: weaponMasterySubUpgrades,
    };

    // v3.0: Fleet Command (auto-fire ship damage)
    const fleetCommandSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'drill_sergeant',
        'formation_delta',
        'emergency_repairs',
        'fleet_tactics',
        'automated_repairs',
        'ai_swarm',
        'nanite_reconstruction',
        'fleet_synchronization',
        'quantum_coordination',
        'universal_fleet',
      ].includes(u.id),
    );

    const fleetCommandUpgrade: UpgradeConfig = {
      id: 'fleetCommand',
      name: '🛸 Fleet Command',
      description:
        'Command your fleet with precision - boost all ships effectiveness',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(10000 * Math.pow(1.6, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(10000 * Math.pow(1.6, state.fleetCommandLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.fleetCommandLevel++;
      },
      getLevel: (state: GameState) => state.fleetCommandLevel,
      getDisplayText: (state: GameState) => {
        const bonusPercent = state.fleetCommandLevel * 5;
        const formatted =
          bonusPercent >= 1000
            ? NumberFormatter.format(bonusPercent)
            : bonusPercent.toString();
        return `Lv.${state.fleetCommandLevel.toString()} (+${formatted}% fleet dmg)`;
      },
      subUpgrades: fleetCommandSubUpgrades,
    };

    // v3.0: Mutation Engine (transformative abilities)
    const mutationEngineSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'adaptive_evolution',
        'symbiotic_weapons',
        'regenerative_hull',
        'hive_mind',
        'perfect_organism',
        'eldritch_evolution',
        'cosmic_horror',
        'transcendent_form',
        'living_weapon',
        'apex_predator',
      ].includes(u.id),
    );

    const mutationEngineUpgrade: UpgradeConfig = {
      id: 'mutationEngine',
      name: '🧬 Mutation Engine',
      description: 'Evolve beyond limits - unlock transformative abilities',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(25000 * Math.pow(1.7, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(25000 * Math.pow(1.7, state.mutationEngineLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.mutationEngineLevel++;
      },
      getLevel: (state: GameState) => state.mutationEngineLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.mutationEngineLevel.toString()} (+${(state.mutationEngineLevel * 1).toString()}% all dmg)`,
      subUpgrades: mutationEngineSubUpgrades,
    };

    // v3.0: Energy Core (energy and speed)
    const energyCoreSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'fusion_reactor',
        'zero_point',
        'perpetual_motion',
        'tesla_coils',
        'arc_reactor',
        'harvested_star',
        'vacuum_energy_tap',
        'entropy_reversal_engine',
        'big_crunch_generator',
        'multiversal_tap',
      ].includes(u.id),
    );

    const energyCoreUpgrade: UpgradeConfig = {
      id: 'energyCore',
      name: '⚡ Energy Core',
      description: 'Harness pure energy - boost all systems',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(7500 * Math.pow(1.5, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(7500 * Math.pow(1.5, state.energyCoreLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.energyCoreLevel++;
      },
      getLevel: (state: GameState) => state.energyCoreLevel,
      getDisplayText: (state: GameState) => {
        const bonusPercent = state.energyCoreLevel;
        const formatted =
          bonusPercent >= 1000
            ? NumberFormatter.format(bonusPercent)
            : bonusPercent.toString();
        return `Lv.${state.energyCoreLevel.toString()} (+${formatted}% speed)`;
      },
      subUpgrades: energyCoreSubUpgrades,
    };

    // v3.0: Cosmic Knowledge (cost reduction and XP)
    const cosmicKnowledgeSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'ancient_texts',
        'akashic_records_library',
        'prophetic_vision',
        'universal_translator',
        'omniscience_lite',
        'forbidden_theorems',
        'schrodinger_upgrade',
        'universal_constants',
        'apotheosis',
        'omniscience',
      ].includes(u.id),
    );

    const cosmicKnowledgeUpgrade: UpgradeConfig = {
      id: 'cosmicKnowledge',
      name: '🌌 Cosmic Knowledge',
      description:
        'Understand the universe - reduce costs and increase rewards',
      getCost: (level: number) =>
        this.applyDiscount(Math.ceil(15000 * Math.pow(1.65, level))),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(15000 * Math.pow(1.65, state.cosmicKnowledgeLevel)),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.cosmicKnowledgeLevel++;
      },
      getLevel: (state: GameState) => state.cosmicKnowledgeLevel,
      getDisplayText: (state: GameState) =>
        `Lv.${state.cosmicKnowledgeLevel.toString()} (-${(state.cosmicKnowledgeLevel * 0.5).toFixed(1)}% costs)`,
      subUpgrades: cosmicKnowledgeSubUpgrades,
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
      weaponMasteryUpgrade,
      fleetCommandUpgrade,
      mutationEngineUpgrade,
      energyCoreUpgrade,
      cosmicKnowledgeUpgrade,
      miscUpgrade,
    ];
  }

  private applyDiscount(cost: number): number {
    let discount = 1.0;

    // Get current game state to check upgrade levels
    const state = this.getGameState();

    // v3.0: Cosmic Knowledge bonus (-0.5% all costs per level, max 40%)
    if (state && state.cosmicKnowledgeLevel > 0) {
      const knowledgeDiscount = Math.min(
        state.cosmicKnowledgeLevel * 0.005,
        0.4,
      );
      discount *= 1 - knowledgeDiscount;
    }

    // v3.0: Fleet Command bonus (-1% ship upgrade costs per level, max 50%)
    if (state && state.fleetCommandLevel > 0) {
      const fleetDiscount = Math.min(state.fleetCommandLevel * 0.01, 0.5);
      discount *= 1 - fleetDiscount;
    }

    // v3.0: COSMIC KNOWLEDGE SUBUPGRADES
    if (this.subUpgrades.find((u) => u.id === 'ancient_texts')?.owned)
      discount *= 0.97;
    if (this.subUpgrades.find((u) => u.id === 'akashic_records_library')?.owned)
      discount *= 0.95;
    if (this.subUpgrades.find((u) => u.id === 'prophetic_vision')?.owned)
      discount *= 0.93;
    if (this.subUpgrades.find((u) => u.id === 'universal_translator')?.owned)
      discount *= 0.9;
    if (this.subUpgrades.find((u) => u.id === 'omniscience_lite')?.owned)
      discount *= 0.85;
    if (this.subUpgrades.find((u) => u.id === 'forbidden_theorems')?.owned)
      discount *= 0.8;
    if (this.subUpgrades.find((u) => u.id === 'schrodinger_upgrade')?.owned)
      discount *= 0.75;
    if (this.subUpgrades.find((u) => u.id === 'universal_constants')?.owned)
      discount *= 0.7;
    if (this.subUpgrades.find((u) => u.id === 'apotheosis')?.owned)
      discount *= 0.6;
    if (this.subUpgrades.find((u) => u.id === 'omniscience')?.owned)
      discount *= 0.5;

    // v3.0: FLEET COMMAND SUBUPGRADES (ship cost reduction)
    if (this.subUpgrades.find((u) => u.id === 'automated_repairs')?.owned)
      discount *= 0.9;

    // Energy recycling: 5% discount
    if (this.subUpgrades.find((u) => u.id === 'energy_recycling')?.owned) {
      discount *= 0.95;
    }

    // Cheat codes: 20% discount
    if (this.subUpgrades.find((u) => u.id === 'cheat_codes')?.owned) {
      discount *= 0.8;
    }

    // Omniscient AI: 30% discount
    if (this.subUpgrades.find((u) => u.id === 'omniscient_ai')?.owned) {
      discount *= 0.7;
    }

    return Math.floor(cost * discount);
  }

  // Public method to get discounted cost for sub-upgrades
  public getSubUpgradeCost(subUpgrade: SubUpgrade): number {
    return this.applyDiscount(subUpgrade.cost);
  }

  // Helper to get current game state (will be set by Store)
  private gameStateGetter: (() => GameState) | null = null;

  setGameStateGetter(getter: () => GameState): void {
    this.gameStateGetter = getter;
  }

  private getGameState(): GameState | null {
    return this.gameStateGetter ? this.gameStateGetter() : null;
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
      multiplier *= 1.2;
    }

    // Neural link: +10% on clicks
    if (state.subUpgrades['neural_link']) {
      multiplier *= 1.1;
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
      multiplier *= 1.2;
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
      multiplier *= 1.3;
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
      multiplier *= 1.4;
    }

    // Golden goose: +50%
    if (state.subUpgrades['golden_goose']) {
      multiplier *= 1.5;
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

    // Late-game upgrades
    if (state.subUpgrades['multiversal_matrix']) {
      multiplier *= 5;
    }

    if (state.subUpgrades['omniscient_ai']) {
      multiplier *= 1.75;
    }

    if (state.subUpgrades['big_bang_generator']) {
      multiplier *= 10;
    }

    if (state.subUpgrades['reality_compiler']) {
      multiplier *= 20;
    }

    if (state.subUpgrades['omega_protocol']) {
      multiplier *= 25;
    }

    if (state.subUpgrades['infinity_engine']) {
      multiplier *= 100;
    }

    if (state.subUpgrades['universe_seed']) {
      multiplier *= 100;
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
    let chance = 2 + state.critChanceLevel * 0.5; // Base 2% + 0.5% per level

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

    // Multiversal matrix: +15%
    if (state.subUpgrades['multiversal_matrix']) {
      chance += 15;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      chance += this.ascensionSystem.getCritBonus(state);
    }

    // Artifact bonus (additive to percentage)
    if (this.artifactSystem) {
      const artifactBonus = this.artifactSystem.getCritBonus();
      chance += artifactBonus * 100; // Convert from decimal to percentage
    }

    return Math.min(chance, 95); // Cap increased to 95% for late game
  }

  getCritMultiplier(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let multiplier = 2.0; // Base 2x damage

    // Artifact bonus (some artifacts boost crit damage instead of chance)
    if (this.artifactSystem) {
      const artifactBonus = this.artifactSystem.getCritBonus();
      multiplier += artifactBonus * 2; // Crit damage artifacts add to the multiplier
    }

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

    // Dimensional collapse: x5
    if (state.subUpgrades['dimensional_collapse']) {
      multiplier *= 5;
    }

    return multiplier;
  }

  getPassiveGen(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    // Exponential scaling with level progression
    let gen =
      state.resourceGenLevel * 10 * Math.pow(1.2, state.resourceGenLevel * 0.5);

    // v3.0: Energy Core bonus (+10 passive generation per level)
    if (state.energyCoreLevel > 0) {
      gen += state.energyCoreLevel * 10;
    }

    // v3.0: ENERGY CORE SUBUPGRADES
    if (state.subUpgrades['fusion_reactor']) gen += 100;
    if (state.subUpgrades['zero_point']) gen += 250;
    if (state.subUpgrades['perpetual_motion']) gen += 500;
    if (state.subUpgrades['arc_reactor']) gen += 1000;
    if (state.subUpgrades['harvested_star']) gen += 5000;
    if (state.subUpgrades['vacuum_energy_tap']) gen += 10000;

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

    // Entropy reversal: x15
    if (state.subUpgrades['entropy_reversal']) {
      gen *= 15;
    }

    // Eternal engine: x50
    if (state.subUpgrades['eternal_engine']) {
      gen *= 50;
    }

    // Reality compiler: x20
    if (state.subUpgrades['reality_compiler']) {
      gen *= 20;
    }

    // Omega protocol: x25
    if (state.subUpgrades['omega_protocol']) {
      gen *= 25;
    }

    // Universe seed: x100
    if (state.subUpgrades['universe_seed']) {
      gen *= 100;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      gen *= this.ascensionSystem.getPassiveMultiplier(state);
    }

    return gen;
  }

  getXPMultiplier(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let multiplier = 1.0 + state.xpBoostLevel * 0.1; // Base +10% per level

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
      multiplier *= 1.5;
    }

    // Universe map: x3
    if (state.subUpgrades['universe_map']) {
      multiplier *= 3;
    }

    // Entropy reversal: +100%
    if (state.subUpgrades['entropy_reversal']) {
      multiplier *= 2;
    }

    // Akashic records: x10
    if (state.subUpgrades['akashic_records']) {
      multiplier *= 10;
    }

    // Reality compiler: x20
    if (state.subUpgrades['reality_compiler']) {
      multiplier *= 20;
    }

    // Omega protocol: x25
    if (state.subUpgrades['omega_protocol']) {
      multiplier *= 25;
    }

    // Universe seed: x100
    if (state.subUpgrades['universe_seed']) {
      multiplier *= 100;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      multiplier *= this.ascensionSystem.getXPMultiplier(state);
    }

    return multiplier;
  }

  getFireCooldown(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    // Slower scaling: 0.990 instead of 0.985 makes it much harder to reach low cooldowns
    let cooldown = Math.max(
      Math.floor(10000 * Math.pow(0.99, state.attackSpeedLevel)),
      120,
    );

    // v3.0: Energy Core bonus (+1% attack speed per level = -1% cooldown)
    if (state.energyCoreLevel > 0) {
      cooldown *= 1 - state.energyCoreLevel * 0.01;
    }

    // Artifact speed bonus (reduces cooldown)
    if (this.artifactSystem) {
      const speedBonus = this.artifactSystem.getSpeedBonus();
      cooldown *= 1 - speedBonus; // Speed bonus reduces cooldown
    }

    // v3.0: ENERGY CORE SUBUPGRADES
    if (state.subUpgrades['fusion_reactor']) cooldown *= 0.95; // +5% speed
    if (state.subUpgrades['zero_point']) cooldown *= 0.92; // +8% speed
    if (state.subUpgrades['perpetual_motion']) cooldown *= 0.88; // +12% speed
    if (state.subUpgrades['tesla_coils']) cooldown *= 0.85; // +15% speed
    if (state.subUpgrades['arc_reactor']) cooldown *= 0.8; // +20% speed
    if (state.subUpgrades['harvested_star']) cooldown *= 0.7; // +30% speed
    if (state.subUpgrades['vacuum_energy_tap']) cooldown *= 0.6; // +40% speed
    if (state.subUpgrades['entropy_reversal_engine']) cooldown *= 0.45; // +55% speed
    if (state.subUpgrades['big_crunch_generator']) cooldown *= 0.25; // +75% speed
    if (state.subUpgrades['multiversal_tap']) cooldown *= 0.1; // +100% speed (10x faster!)

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
      cooldown *= 0.6;
    }

    // Dimensional collapse: +200% speed
    if (state.subUpgrades['dimensional_collapse']) {
      cooldown *= 0.33; // 3x speed = 1/3 cooldown
    }

    // Omega protocol: x25 speed
    if (state.subUpgrades['omega_protocol']) {
      cooldown *= 0.04; // 25x speed
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      const speedMult = this.ascensionSystem.getSpeedMultiplier(state);
      cooldown /= speedMult;
    }

    return Math.max(Math.floor(cooldown), 50); // Minimum 50ms (20 attacks/sec max)
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

  // New method: Get main ship (click) damage only
  getMainShipDamage(state: GameState): number {
    this.updateSubUpgradesFromState(state);

    // Base damage: +0.1 per level (1.0 -> 1.1 -> 1.2 -> 1.3, etc.)
    let multiplier = this.basePoints * (1 + 0.1 * state.pointMultiplierLevel);

    // v3.0: Weapon Mastery bonus (+10% per level, reduced from 25% for balance)
    if (state.weaponMasteryLevel > 0) {
      multiplier *= 1 + state.weaponMasteryLevel * 0.1;
    }

    // v3.0: Mutation Engine bonus (+1% all damage per level, reduced from 2%)
    if (state.mutationEngineLevel > 0) {
      multiplier *= 1 + state.mutationEngineLevel * 0.01;
    }

    // v3.0: WEAPON MASTERY SUBUPGRADES
    if (state.subUpgrades['scope_calibration']) multiplier *= 1.1;
    if (state.subUpgrades['hair_trigger']) multiplier *= 1.15;
    if (state.subUpgrades['hollow_point']) multiplier *= 1.2;
    if (state.subUpgrades['explosive_payload']) multiplier *= 1.3;
    if (state.subUpgrades['particle_accelerator']) multiplier *= 1.5;
    if (state.subUpgrades['singularity_cannon']) multiplier *= 1.75;
    if (state.subUpgrades['antimatter_warheads']) multiplier *= 2.0;
    if (state.subUpgrades['quark_disruptor']) multiplier *= 2.5;
    if (state.subUpgrades['gamma_ray_burst']) multiplier *= 3.0;
    if (state.subUpgrades['planck_piercer']) multiplier *= 4.0;

    // v3.0: MUTATION ENGINE SUBUPGRADES
    if (state.subUpgrades['adaptive_evolution']) multiplier *= 1.05;
    if (state.subUpgrades['symbiotic_weapons']) multiplier *= 1.08;
    if (state.subUpgrades['regenerative_hull']) multiplier *= 1.12;
    if (state.subUpgrades['hive_mind']) multiplier *= 1.18;
    if (state.subUpgrades['perfect_organism']) multiplier *= 1.25;
    if (state.subUpgrades['eldritch_evolution']) multiplier *= 1.35;
    if (state.subUpgrades['cosmic_horror']) multiplier *= 1.5;
    if (state.subUpgrades['transcendent_form']) multiplier *= 1.75;
    if (state.subUpgrades['living_weapon']) multiplier *= 2.0;
    if (state.subUpgrades['apex_predator']) multiplier *= 2.5;

    // Ship swarm: +20%
    if (state.subUpgrades['ship_swarm']) {
      multiplier *= 1.2;
    }

    // Laser focusing crystals: +15%
    if (state.subUpgrades['laser_focusing']) {
      multiplier *= 1.15;
    }

    // Overclocked reactors: +25%
    if (state.subUpgrades['overclocked_reactors']) {
      multiplier *= 1.25;
    }

    // Neural link: +10% on clicks
    if (state.subUpgrades['neural_link']) {
      multiplier *= 1.1;
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
      multiplier *= 1.2;
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
      multiplier *= 1.3;
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
      multiplier *= 1.4;
    }

    // Golden goose: +50%
    if (state.subUpgrades['golden_goose']) {
      multiplier *= 1.5;
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

    // Click-focused upgrades (MAIN SHIP ONLY)
    if (state.subUpgrades['master_clicker']) {
      multiplier *= 2;
    }

    if (state.subUpgrades['click_multiplier']) {
      multiplier *= 3;
    }

    if (state.subUpgrades['super_clicker']) {
      multiplier *= 5;
    }

    // Late-game upgrades
    if (state.subUpgrades['multiversal_matrix']) {
      multiplier *= 5;
    }

    if (state.subUpgrades['omniscient_ai']) {
      multiplier *= 1.75;
    }

    if (state.subUpgrades['big_bang_generator']) {
      multiplier *= 10;
    }

    if (state.subUpgrades['reality_compiler']) {
      multiplier *= 20;
    }

    if (state.subUpgrades['omega_protocol']) {
      multiplier *= 25;
    }

    if (state.subUpgrades['infinity_engine']) {
      multiplier *= 100;
    }

    if (state.subUpgrades['universe_seed']) {
      multiplier *= 100;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      multiplier *= this.ascensionSystem.getDamageMultiplier(state);
      multiplier *= this.ascensionSystem.getPointsMultiplier(state);
    }

    return multiplier;
  }

  // New method: Get auto-fire ship damage (weaker but scales with ship count)
  getAutoFireDamage(state: GameState): number {
    this.updateSubUpgradesFromState(state);

    // Base: 1 damage + 0.05 per level (starts at 1 for better early game feel)
    let multiplier = this.basePoints * (1 + 0.05 * state.pointMultiplierLevel);

    // v3.0: Fleet Command bonus (+5% auto-fire damage per level)
    if (state.fleetCommandLevel > 0) {
      multiplier *= 1 + state.fleetCommandLevel * 0.05;
    }

    // v3.0: Mutation Engine bonus (+1% all damage per level, reduced from 2%)
    if (state.mutationEngineLevel > 0) {
      multiplier *= 1 + state.mutationEngineLevel * 0.01;
    }

    // v3.0: FLEET COMMAND SUBUPGRADES
    if (state.subUpgrades['drill_sergeant']) multiplier *= 1.08;
    if (state.subUpgrades['formation_delta']) multiplier *= 1.12;
    if (state.subUpgrades['emergency_repairs']) multiplier *= 1.15;
    if (state.subUpgrades['fleet_tactics'])
      multiplier *= 1 + Math.floor(state.shipsCount / 10) * 0.2;
    if (state.subUpgrades['automated_repairs']) multiplier *= 1.25;
    if (state.subUpgrades['ai_swarm']) multiplier *= 1.35;
    if (state.subUpgrades['nanite_reconstruction']) multiplier *= 1.5;
    if (state.subUpgrades['fleet_synchronization']) multiplier *= 1.75;
    if (state.subUpgrades['quantum_coordination']) multiplier *= 2.0;
    if (state.subUpgrades['universal_fleet']) multiplier *= 2.5;

    // v3.0: MUTATION ENGINE SUBUPGRADES (same as main ship)
    if (state.subUpgrades['adaptive_evolution']) multiplier *= 1.05;
    if (state.subUpgrades['symbiotic_weapons']) multiplier *= 1.08;
    if (state.subUpgrades['regenerative_hull']) multiplier *= 1.12;
    if (state.subUpgrades['hive_mind']) multiplier *= 1.18;
    if (state.subUpgrades['perfect_organism']) multiplier *= 1.25;
    if (state.subUpgrades['eldritch_evolution']) multiplier *= 1.35;
    if (state.subUpgrades['cosmic_horror']) multiplier *= 1.5;
    if (state.subUpgrades['transcendent_form']) multiplier *= 1.75;
    if (state.subUpgrades['living_weapon']) multiplier *= 2.0;
    if (state.subUpgrades['apex_predator']) multiplier *= 2.5;

    // Ship swarm: +20% (auto-fire specific)
    if (state.subUpgrades['ship_swarm']) {
      multiplier *= 1.2;
    }

    // Scale with ship count (diminishing returns)
    const shipScaling = Math.log10(state.shipsCount + 1) * 0.5;
    multiplier *= 1 + shipScaling;

    // Some general damage upgrades affect auto-fire but at reduced effectiveness
    if (state.subUpgrades['laser_focusing']) {
      multiplier *= 1.05; // Reduced from 1.15
    }

    if (state.subUpgrades['antimatter_rounds']) {
      multiplier *= 1.25; // Reduced from 2x
    }

    // Apply ascension bonuses at reduced rate
    if (this.ascensionSystem) {
      const damageBonus = this.ascensionSystem.getDamageMultiplier(state);
      const reducedBonus = 1 + (damageBonus - 1) * 0.3; // 30% effectiveness
      multiplier *= reducedBonus;
    }

    return multiplier;
  }
}
