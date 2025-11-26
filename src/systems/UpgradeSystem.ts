import type { GameState, UpgradeConfig, SubUpgrade } from '../types';
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';
import { Config } from '../core/GameConfig';

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
    getUnspentPPMultiplier: (state: GameState) => number;
  } | null = null;

  private artifactSystem: {
    getDamageBonus: () => number;
    getSpeedBonus: () => number;
    getCritBonus: () => number;
    getPointsBonus: () => number;
    getXPBonus: () => number;
  } | null = null;

  private powerUpSystem: {
    getSpeedMultiplier: () => number;
    getDamageMultiplier: () => number;
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
    getUnspentPPMultiplier: (state: GameState) => number;
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

  setPowerUpSystem(powerUpSystem: {
    getSpeedMultiplier: () => number;
    getDamageMultiplier: () => number;
  }): void {
    this.powerUpSystem = powerUpSystem;
  }

  private initializeSubUpgrades(): void {
    this.subUpgrades = [
      // === EARLY GAME UPGRADES (Level 1-20) ===
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
        id: 'amplified_resonance',
        name: 'Amplified Resonance Core',
        description: '1.5x damage multiplier',
        flavor:
          'Harmonic resonance amplifies every shot. The aliens feel the vibration... right before they explode.',
        cost: 700000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 15,
        isVisible: (state) => state.pointMultiplierLevel >= 15,
        buy: (state) => {
          state.subUpgrades['amplified_resonance'] = true;
        },
      },
      {
        id: 'quantum_network_matrix',
        name: 'Quantum Network Matrix',
        description: '2x damage, additional connection network',
        flavor:
          'Quantum entanglement creates a third connection network. Three paths of destruction, triple the chaos.',
        cost: 50000000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 30,
        isVisible: (state) => state.pointMultiplierLevel >= 30,
        buy: (state) => {
          state.subUpgrades['quantum_network_matrix'] = true;
        },
      },
      {
        id: 'enhanced_combat_matrix',
        name: 'Enhanced Combat Matrix',
        description: '+50% attack damage',
        flavor:
          'Advanced targeting systems and power conduits amplify every shot. Precision meets raw power.',
        cost: 5500000000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 40,
        isVisible: (state) => state.pointMultiplierLevel >= 40,
        buy: (state) => {
          state.subUpgrades['enhanced_combat_matrix'] = true;
        },
      },
      {
        id: 'void_essence_core',
        name: 'Void Essence Core',
        description: '2.5x damage, enhanced laser systems',
        flavor:
          'Harness the power of the void itself. Lasers burn with purple energy, tearing through reality itself.',
        cost: 90000000000,
        owned: false,
        requires: (state) => state.pointMultiplierLevel >= 50,
        isVisible: (state) => state.pointMultiplierLevel >= 50,
        buy: (state) => {
          state.subUpgrades['void_essence_core'] = true;
        },
      },
      {
        id: 'lucky_dice',
        name: 'Lucky Space Dice',
        description: '+5% critical hit chance',
        flavor:
          'Rolled a 7! These dice ensure maximum alien destruction rates. The invasion pays... wait.',
        cost: 70500,
        owned: false,
        requires: (state) => state.critChanceLevel >= 5,
        isVisible: (state) => state.critChanceLevel >= 5,
        buy: (state) => {
          state.subUpgrades['lucky_dice'] = true;
        },
      },
      {
        id: 'critical_mastery',
        name: 'Critical Strike Mastery',
        description: 'Critical damage x2',
        flavor:
          'Master the art of the perfect strike. Every critical hit becomes a devastating blow.',
        cost: 4000000000,
        owned: false,
        requires: (state) => state.critChanceLevel >= 20,
        isVisible: (state) => state.critChanceLevel >= 20,
        buy: (state) => {
          state.subUpgrades['critical_mastery'] = true;
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
        description: 'Gain 50% more points per hit',
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
        description: 'Ships coordinate attacks for 2x damage',
        flavor:
          'Fleet coordinates synchronized attacks. The aliens never stand a chance. Especially these ones.',
        cost: 50000,
        owned: false,
        requires: (state) => state.shipsCount >= 15,
        isVisible: (state) => state.shipsCount >= 15,
        buy: (state) => {
          state.subUpgrades['ship_swarm'] = true;
        },
      },
      {
        id: 'fleet_synergy_matrix',
        name: 'Fleet Synergy Matrix',
        description: '+50% damage, +3% crit chance',
        flavor:
          'Advanced coordination protocols maximize fleet efficiency. Every shot counts, every hit matters.',
        cost: 200000,
        owned: false,
        requires: (state) => state.shipsCount >= 30,
        isVisible: (state) => state.shipsCount >= 30,
        buy: (state) => {
          state.subUpgrades['fleet_synergy_matrix'] = true;
        },
      },
      {
        id: 'quantum_fleet_sync',
        name: 'Quantum Fleet Synchronization',
        description: 'Fleet damage x2, faster connection network',
        flavor:
          'Quantum entanglement synchronizes the entire fleet. Every ship moves as one, every shot amplified.',
        cost: 2000000,
        owned: false,
        requires: (state) => state.shipsCount >= 40,
        isVisible: (state) => state.shipsCount >= 40,
        buy: (state) => {
          state.subUpgrades['quantum_fleet_sync'] = true;
        },
      },
      {
        id: 'stellar_fusion_core',
        name: 'Stellar Fusion Core',
        description: '1.5x damage, enhanced laser systems',
        flavor:
          'Harness the power of a star. Every shot burns with stellar intensity, every impact a supernova.',
        cost: 80000000,
        owned: false,
        requires: (state) => state.shipsCount >= 50,
        isVisible: (state) => state.shipsCount >= 50,
        buy: (state) => {
          state.subUpgrades['stellar_fusion_core'] = true;
        },
      },
      {
        id: 'hyper_network_accelerator',
        name: 'Hyper Network Accelerator',
        description: '1.5x damage, +25% connection speed, orange network, crits enabled',
        flavor:
          'Overclock the network to extreme speeds. Orange energy flows faster, hits harder, and sometimes... explodes.',
        cost: 200000000,
        owned: false,
        requires: (state) => state.shipsCount >= 60,
        isVisible: (state) => state.shipsCount >= 60,
        buy: (state) => {
          state.subUpgrades['hyper_network_accelerator'] = true;
        },
      },
      {
        id: 'fleet_omega_core',
        name: 'Fleet Omega Core',
        description: 'Fleet damage x2.5',
        flavor:
          'The ultimate fleet coordination system. Every ship becomes a weapon of mass destruction.',
        cost: 10000000000,
        owned: false,
        requires: (state) => state.shipsCount >= 60,
        isVisible: (state) => state.shipsCount >= 60,
        buy: (state) => {
          state.subUpgrades['fleet_omega_core'] = true;
        },
      },
      {
        id: 'fleet_xp_synergy',
        name: 'Fleet XP Synergy',
        description: '+3% XP per ship',
        flavor:
          'Each ship in the fleet contributes to collective learning. More ships, more knowledge, more power.',
        cost: 130000000,
        owned: false,
        requires: (state) => state.shipsCount >= 50,
        isVisible: (state) => state.shipsCount >= 50,
        buy: (state) => {
          state.subUpgrades['fleet_xp_synergy'] = true;
        },
      },
      {
        id: 'neural_link',
        name: 'Neural Link Interface',
        description: 'Clicking grants 10% bonus points',
        flavor:
          'Neural link directly to your trigger finger. Click faster, eliminate faster. Very efficient.',
        cost: 500000,
        owned: false,
        requires: (state) => state.level >= 20,
        isVisible: (state) => state.level >= 20,
        buy: (state) => {
          state.subUpgrades['neural_link'] = true;
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
        cost: 1000000,
        owned: false,
        requires: (state) => state.level >= 28,
        isVisible: (state) => state.level >= 28,
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
        id: 'plasma_matrix',
        name: 'Plasma Energy Matrix',
        description: 'All damage +25%',
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
        description: 'XP +50%',
        flavor: 'Siphon energy from the cosmic clouds themselves.',
        cost: 75000000,
        owned: false,
        requires: (state) => state.level >= 62,
        isVisible: (state) => state.level >= 62,
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
        cost: 10000000000,
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
        flavor:
          'Centralized coordination multiplies fleet effectiveness. Every ship fires in perfect harmony.',
        cost: 4800000000,
        owned: false,
        requires: (state) => state.level >= 75 && state.shipsCount >= 70,
        isVisible: (state) => state.level >= 75 && state.shipsCount >= 70,
        buy: (state) => {
          state.subUpgrades['fleet_command_center'] = true;
        },
      },
      {
        id: 'photon_amplifier',
        name: 'Photon Wave Amplifier',
        description: 'Damage +30%',
        flavor: "Light speed is too slow. We're going to ludicrous speed!",
        cost: 7200000000, // 7.2B (escalado de 150M)
        owned: false,
        requires: (state) => state.level >= 52,
        isVisible: (state) => state.level >= 52,
        buy: (state) => {
          state.subUpgrades['photon_amplifier'] = true;
        },
      },
      {
        id: 'dual_network_expansion',
        name: 'Dual Network Expansion',
        description: 'Adds two additional connection networks',
        flavor:
          'Expand the network to five simultaneous connections. The aliens never see it coming... from five directions at once.',
        cost: 5000000000,
        owned: false,
        requires: (state) => state.level >= 55,
        isVisible: (state) => state.level >= 55,
        buy: (state) => {
          state.subUpgrades['dual_network_expansion'] = true;
        },
      },
      {
        id: 'network_white_glow',
        name: 'Network White Glow',
        description: '+15% connection speed, white network with glow',
        flavor:
          'Purify the network energy. White light flows faster, cleaner, more devastating.',
        cost: 10000000000,
        owned: false,
        requires: (state) => state.level >= 60,
        isVisible: (state) => state.level >= 60,
        buy: (state) => {
          state.subUpgrades['network_white_glow'] = true;
        },
      },
      {
        id: 'crimson_network_protocol',
        name: 'Crimson Network Protocol',
        description: 'Adds three additional connection networks, all nets turn red',
        flavor:
          'The network bleeds crimson. Three more connections, all painted in the color of destruction.',
        cost: 50000000000,
        owned: false,
        requires: (state) => state.level >= 90,
        isVisible: (state) => state.level >= 90,
        buy: (state) => {
          state.subUpgrades['crimson_network_protocol'] = true;
        },
      },
      {
        id: 'cosmic_synergy_matrix',
        name: 'Cosmic Synergy Matrix',
        description: '+50% damage, +50% XP',
        flavor:
          'Perfect harmony between destruction and knowledge. Every kill teaches, every lesson destroys.',
        cost: 50000000000,
        owned: false,
        requires: (state) => state.level >= 70,
        isVisible: (state) => state.level >= 70,
        buy: (state) => {
          state.subUpgrades['cosmic_synergy_matrix'] = true;
        },
      },
      {
        id: 'reality_anchor',
        name: 'Reality Anchor',
        description: 'Critical damage +50%, All gains +25%',
        flavor: 'Keep reality in check. Or break it. Your choice.',
        cost: 9600000000, // 9.6B (escalado de 200M)
        owned: false,
        requires: (state) => state.critChanceLevel >= 35,
        isVisible: (state) => state.critChanceLevel >= 35,
        buy: (state) => {
          state.subUpgrades['reality_anchor'] = true;
        },
      },

      {
        id: 'orbital_satellite',
        name: 'Orbital Command Satellite',
        description: 'Deploy a satellite. Ships near it deal 2x damage',
        flavor: 'Big Brother is watching... and helping you destroy aliens.',
        cost: 15000000000, // 15B
        owned: false,
        requires: (state) => state.shipsCount >= 80,
        isVisible: (state) => state.shipsCount >= 70,
        buy: (state) => {
          state.subUpgrades['orbital_satellite'] = true;
        },
      },
      {
        id: 'rapid_fire_satellite',
        name: 'Rapid Fire Satellite Array',
        description: 'Satellite fires missiles 2x faster',
        flavor: 'More missiles, more destruction. Simple math.',
        cost: 1000000000000, // 100B
        owned: false,
        requires: (state) => state.shipsCount >= 125,
        isVisible: (state) => state.shipsCount >= 125,
        buy: (state) => {
          state.subUpgrades['rapid_fire_satellite'] = true;
        },
      },

      // === LATE GAME UPGRADES (Level 80-100) ===
      {
        id: 'dimensional_rift',
        name: 'Dimensional Rift',
        description: 'All Damage x1.2',
        flavor: "A tear in reality. Don't put your finger in it.",
        cost: 15000000000, // 15B
        owned: false,
        requires: (state) => state.level >= 81,
        isVisible: (state) => state.level >= 80,
        buy: (state) => {
          state.subUpgrades['dimensional_rift'] = true;
        },
      },
      {
        id: 'chronal_dust',
        name: 'Chronal Dust',
        description: 'XP Gain x1.2',
        flavor:
          "Time residue. Snort it for knowledge. (Don't actually snort it).",
        cost: 21000000000, // 21B
        owned: false,
        requires: (state) => state.level >= 82,
        isVisible: (state) => state.level >= 81,
        buy: (state) => {
          state.subUpgrades['chronal_dust'] = true;
        },
      },
      {
        id: 'entropy_injector',
        name: 'Entropy Injector',
        description: 'Click Damage x1.5',
        flavor:
          'Accelerates the heat death of the universe, one click at a time.',
        cost: 54000000000, // 54B
        owned: false,
        requires: (state) => state.level >= 86,
        isVisible: (state) => state.level >= 85,
        buy: (state) => {
          state.subUpgrades['entropy_injector'] = true;
        },
      },
      {
        id: 'event_horizon_shield',
        name: 'Event Horizon Shield',
        description: 'All Damage x1.3',
        flavor: "If light can't escape, neither can the aliens.",
        cost: 80000000000, // 80B
        owned: false,
        requires: (state) => state.level >= 89,
        isVisible: (state) => state.level >= 88,
        buy: (state) => {
          state.subUpgrades['event_horizon_shield'] = true;
        },
      },
      {
        id: 'cosmic_filament',
        name: 'Cosmic Filament',
        description: 'XP Gain x1.4',
        flavor: 'The nervous system of the universe.',
        cost: 105000000000, // 105B
        owned: false,
        requires: (state) => state.level >= 92,
        isVisible: (state) => state.level >= 91,
        buy: (state) => {
          state.subUpgrades['cosmic_filament'] = true;
        },
      },
      {
        id: 'null_space_projector',
        name: 'Null Space Projector',
        description: 'Critical Damage x1.5',
        flavor: 'Projects non-existence onto targets. Very effective.',
        cost: 150000000000, // 150B
        owned: false,
        requires: (state) => state.level >= 96,
        isVisible: (state) => state.level >= 95,
        buy: (state) => {
          state.subUpgrades['null_space_projector'] = true;
        },
      },
      {
        id: 'omega_relay',
        name: 'Omega Relay',
        description: 'All Damage x1.5, XP x1.5',
        flavor: 'The final connection before ascension. Power overwhelming.',
        cost: 2000000000000000, // 200T
        owned: false,
        requires: (state) => state.level >= 98,
        isVisible: (state) => state.level >= 97,
        buy: (state) => {
          state.subUpgrades['omega_relay'] = true;
        },
      },
      {
        id: 'quantum_singularity',
        name: 'Quantum Singularity Core',
        description: 'All Damage x1.3',
        flavor: 'A singularity that defies all known physics. Very convenient.',
        cost: 2500000000000000, // 250T
        owned: false,
        requires: (state) => state.level >= 99,
        isVisible: (state) => state.level >= 98,
        buy: (state) => {
          state.subUpgrades['quantum_singularity'] = true;
        },
      },

      // === END GAME UPGRADES (Level 80-100) ===
      {
        id: 'singularity_core',
        name: 'Singularity Power Core',
        description: 'Gain 5x points from all sources',
        flavor: 'A black hole in a box. What could be safer?',
        cost: 24000000000, // 24B (escalado de 2M)
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
        description: 'All upgrades 10% cheaper',
        flavor: 'Up, Up, Down, Down, Left, Right, Left, Right, B, A, Start.',
        cost: 30000000000, // 30B (escalado de 2.5M)
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
        cost: 36000000000, // 36B (escalado de 3M)
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
        cost: 48000000000, // 48B (escalado de 4M)
        owned: false,
        requires: (state) => state.xpBoostLevel >= 35,
        isVisible: (state) => state.xpBoostLevel >= 35,
        buy: (state) => {
          state.subUpgrades['universe_map'] = true;
        },
      },
      {
        id: 'heart_of_galaxy',
        name: 'Heart of the Galaxy',
        description: 'All damage x3',
        flavor: 'The galaxy had a heart. HAD.',
        cost: 90000000000, // 90B (escalado de 7.5M)
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
        description: 'Unlock ultimate power: 10x all damage',
        flavor: 'You have become death, destroyer of alien balls.',
        cost: 120000000000, // 120B (escalado de 10M)
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
        cost: 1000000000000000, // 1Q (dont affected by discount)
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
        cost: 6000000000, // 6B (escalado de 500M)
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
        description: 'XP gain +100%',
        flavor: 'Time flows backwards. Or forwards. Hard to tell.',
        cost: 9000000000, // 9B (escalado de 750M)
        owned: false,
        requires: (state) => state.level >= 200,
        isVisible: (state) => state.level >= 200,
        buy: (state) => {
          state.subUpgrades['entropy_reversal'] = true;
        },
      },
      {
        id: 'omniscient_ai',
        name: 'Omniscient AI Core',
        description: 'All stats +75%, Upgrades 15% cheaper',
        flavor: "Knows what you're going to buy before you do.",
        cost: 12000000000, // 12B (escalado de 1B)
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
        cost: 30000000000, // 30B (escalado de 2.5B)
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
        description: 'Critical damage +80%',
        flavor: 'Collapses dimensions. Please aim responsibly.',
        cost: 60000000000, // 60B (escalado de 5B)
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
        description: 'Recompile reality: All damage x20',
        flavor: 'Compiled in Release mode for maximum performance.',
        cost: 120000000000, // 120B (escalado de 10B)
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
        description: 'XP 50%, Retain all knowledge between lives',
        flavor: "The universe's library card. No late fees.",
        cost: 1000000000000, // 300B (escalado de 25B)
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
        cost: 600000000000, // 600B (escalado de 50B)
        owned: false,
        requires: (state) => state.stats.bossesKilled >= 100,
        isVisible: (state) => state.stats.bossesKilled >= 75,
        buy: (state) => {
          state.subUpgrades['void_heart'] = true;
        },
      },

      // === ULTIMATE UPGRADES (Level 750-1000+) ===
      {
        id: 'omega_protocol',
        name: 'Omega Protocol: Final Form',
        description: 'ALL MULTIPLIERS x25',
        flavor: "This isn't even my final form. Wait, yes it is.",
        cost: 6000000000000, // 6T (escalado de 500B)
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
        cost: 12000000000000, // 12T (escalado de 1T)
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
        description: 'Plant new universes: All damage x100',
        flavor: 'Water daily. Harvest in 13.8 billion years.',
        cost: 60000000000000, // 60T (escalado de 5T)
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
        cost: 120000000000000, // 120T (escalado de 10T)
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
        cost: 84000000000, // 84B (escalado de 7M)
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
        cost: 180000000000, // 180B (escalado de 15M)
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
        cost: 420000000000, // 420B (escalado de 35M)
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
        cost: 960000000000, // 960B (escalado de 80M)
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
        cost: 2400000000000, // 2.4T (escalado de 200M)
        owned: false,
        requires: (state) => state.mutationEngineLevel >= 100,
        isVisible: (state) => state.mutationEngineLevel >= 100,
        buy: (state) => {
          state.subUpgrades['apex_predator'] = true;
        },
      },

      // === v3.0: ENERGY CORE UPGRADES - removed (passive income removed)

      // === v3.0: COSMIC KNOWLEDGE UPGRADES (Cost Reduction and XP) ===
      {
        id: 'ancient_texts',
        name: 'Ancient Texts',
        description: '-3% all costs, +10% XP',
        flavor: 'The wisdom of civilizations long dead.',
        cost: 150000,
        owned: false,
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
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
        requires: () => true,
        isVisible: () => true,
        buy: (state) => {
          state.subUpgrades['schrodinger_upgrade'] = true;
        },
      },
      {
        id: 'universal_constants',
        name: 'Universal Constants',
        description: '-30% all costs, +75% XP, modify physics',
        flavor: 'The speed of light is now negotiable.',
        cost: 400000000,
        owned: false,
        requires: () => true,
        isVisible: () => true,
        buy: (state) => {
          state.subUpgrades['universal_constants'] = true;
        },
      },
      {
        id: 'apotheosis',
        name: 'Apotheosis',
        description: '-40% all costs, +100% XP, become divine',
        flavor: 'Mortals worship you now.',
        cost: 9000000000000, // 9T (escalado de 90M)
        owned: false,
        requires: () => true,
        isVisible: () => true,
        buy: (state) => {
          state.subUpgrades['apotheosis'] = true;
        },
      },
      {
        id: 'omniscience',
        name: 'True Omniscience',
        description: '-25% all costs, +150% XP, know everything',
        flavor: 'There are no more secrets.',
        cost: 25000000000000, // 25T (escalado de 250M)
        owned: false,
        requires: () => true,
        isVisible: () => true,
        buy: (state) => {
          state.subUpgrades['omniscience'] = true;
        },
      },

      // === LEVEL 100 MARK UPGRADES FOR EACH CATEGORY ===
      {
        id: 'armada_command',
        name: 'Armada Command Center',
        description: 'Fleet damage x1.2',
        flavor: 'Command an armada worthy of legends. Every ship a legend.',
        cost: 90000000000000, // 90T
        owned: false,
        requires: (state) => state.shipsCount >= 100,
        isVisible: (state) => state.shipsCount >= 100,
        buy: (state) => {
          state.subUpgrades['armada_command'] = true;
        },
      },
      {
        id: 'perfect_critical',
        name: 'Perfect Critical Mastery',
        description: 'Critical chance +5%, Critical damage x1.5',
        flavor: 'Every hit finds the perfect weak point. Perfection achieved.',
        cost: 100000000000000, // 100T
        owned: false,
        requires: (state) => state.critChanceLevel >= 100,
        isVisible: (state) => state.critChanceLevel >= 100,
        buy: (state) => {
          state.subUpgrades['perfect_critical'] = true;
        },
      },
      {
        id: 'knowledge_power_conversion',
        name: 'Knowledge Power Conversion',
        description: '+3% damage per XP Boost level',
        flavor:
          'Knowledge becomes power. Every level of understanding amplifies your destructive potential.',
        cost: 130000000,
        owned: false,
        requires: (state) => state.xpBoostLevel >= 50,
        isVisible: (state) => state.xpBoostLevel >= 50,
        buy: (state) => {
          state.subUpgrades['knowledge_power_conversion'] = true;
        },
      },
      {
        id: 'infinite_knowledge',
        name: 'Infinite Knowledge Core',
        description: 'XP gain x2.5, Knowledge transcends limits',
        flavor: 'All knowledge flows through you. You become knowledge itself.',
        cost: 250000000000000, // 250T
        owned: false,
        requires: (state) => state.xpBoostLevel >= 100,
        isVisible: (state) => state.xpBoostLevel >= 100,
        buy: (state) => {
          state.subUpgrades['infinite_knowledge'] = true;
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
        'ship_swarm',
        'fleet_synergy_matrix',
        'quantum_fleet_sync',
        'stellar_fusion_core',
        'hyper_network_accelerator',
        'fleet_omega_core',
        'fleet_xp_synergy',
        'perfect_precision',
        'fleet_command_center',
        'armada_command',
        'orbital_satellite',
        'rapid_fire_satellite',
      ].includes(u.id),
    );

    // Attack speed related sub-upgrades - removed (all ships now have fixed 1/sec attack speed)

    // Point multiplier related sub-upgrades
    const pointMultiplierSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'laser_focusing',
        'amplified_resonance',
        'quantum_network_matrix',
        'enhanced_combat_matrix',
        'void_essence_core',
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
        'click_multiplier',
        'super_clicker',
        'falafel_rollo_special',
        'plasma_matrix',
        'quantum_entanglement',
        'stellar_forge',
        'antimatter_cascade',
        'hyper_reactor',
        'photon_amplifier',
        'reality_anchor',
        'dimensional_rift',
        'entropy_injector',
        'event_horizon_shield',
        'omega_relay',
        'quantum_singularity',
        'armada_command',
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
        'perfect_critical',
      ].includes(u.id),
    );

    // Resource generation related sub-upgrades - removed (passive income upgrade removed)

    // XP boost related sub-upgrades
    const xpSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'motivational_posters',
        'void_channeling',
        'time_machine',
        'universe_map',
        'stellar_forge',
        'nebula_harvester',
        'knowledge_power_conversion',
        'cosmic_synergy_matrix',
        'infinite_knowledge',
      ].includes(u.id),
    );

    // General/misc sub-upgrades (includes cosmic knowledge upgrades)
    const miscSubUpgrades = this.subUpgrades.filter((u) =>
      [
        'energy_recycling',
        'cheat_codes',
        'alien_cookbook',
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
        'knowledge_power_conversion',
        'dual_network_expansion',
        'network_white_glow',
        'crimson_network_protocol',
        'void_essence_core',
        'cosmic_synergy_matrix',
      ].includes(u.id),
    );

    const shipUpgrade: UpgradeConfig = {
      id: 'ship',
      name: t('upgrades.main.ship.name'),
      description: t('upgrades.main.ship.description'),
      // Cost scaling using config value
      getCost: (level: number) =>
        this.applyDiscount(
          Math.ceil(
            38 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor + 0.15,
              level,
            ),
          ),
        ),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(
            38 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor + 0.15,
              state.shipsCount,
            ),
          ),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.shipsCount++;
      },
      getLevel: (state: GameState) => state.shipsCount,
      getDisplayText: (state: GameState) => {
        return `Fleet: ${state.shipsCount.toString()}`;
      },
      subUpgrades: shipSubUpgrades,
    };

    // Attack speed upgrade removed - all ships now have fixed 1/sec attack speed

    const pointMultiplierUpgrade: UpgradeConfig = {
      id: 'pointMultiplier',
      name: t('upgrades.main.pointMultiplier.name'),
      description: t('upgrades.main.pointMultiplier.description'),
      // Cost scaling using config value
      getCost: (level: number) =>
        this.applyDiscount(
          Math.ceil(
            500 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor + 0.3,
              level,
            ),
          ),
        ),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(
            500 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor + 0.3,
              state.pointMultiplierLevel,
            ),
          ),
        );
        return state.points >= cost;
      },
      buy: (state: GameState) => {
        state.pointMultiplierLevel++;
      },
      getLevel: (state: GameState) => state.pointMultiplierLevel,
      getDisplayText: (state: GameState) => {
        // Use getPointsPerHit to show final damage after all multipliers
        const finalDamage = this.getPointsPerHit(state);
        // Apply power-up damage multiplier if active
        let effectiveDamage = finalDamage;
        if (this.powerUpSystem) {
          effectiveDamage *= this.powerUpSystem.getDamageMultiplier();
        }
        const formattedFinal =
          finalDamage >= 1000
            ? NumberFormatter.format(finalDamage)
            : finalDamage.toFixed(1);
        const formattedEffective =
          effectiveDamage >= 1000
            ? NumberFormatter.format(effectiveDamage)
            : effectiveDamage.toFixed(1);

        // Show effective damage with power-up if different
        if (
          effectiveDamage > finalDamage &&
          this.powerUpSystem &&
          this.powerUpSystem.getDamageMultiplier() > 1
        ) {
          return `Lv.${state.pointMultiplierLevel.toString()} (${formattedEffective}/hit ⚔️)`;
        }
        return `Lv.${state.pointMultiplierLevel.toString()} (${formattedFinal}/hit)`;
      },
      subUpgrades: pointMultiplierSubUpgrades,
    };

    const critChanceUpgrade: UpgradeConfig = {
      id: 'critChance',
      name: t('upgrades.main.critChance.name'),
      description: t('upgrades.main.critChance.description'),
      // Cost scaling using config value
      getCost: (level: number) =>
        this.applyDiscount(
          Math.ceil(
            2500 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor + 0.5,
              level,
            ),
          ),
        ),
      canBuy: (state: GameState) => {
        const cost = this.applyDiscount(
          Math.ceil(
            2500 *
            Math.pow(
              Config.upgrades.costScaling.exponentialFactor,
              state.critChanceLevel,
            ),
          ),
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

    // Resource generation upgrade removed - passive income removed

    const xpBoostUpgrade: UpgradeConfig = {
      id: 'xpBoost',
      name: t('upgrades.main.xpBoost.name'),
      description: t('upgrades.main.xpBoost.description'),
      // Cost scaling using config value
      // After level 100, cost increases more aggressively
      getCost: (level: number) => {
        let baseCost = 10000 * Math.pow(Config.upgrades.costScaling.exponentialFactor, level);
        if (level > 100) {
          // After level 100, multiply by an additional factor
          const extraLevels = level - 100;
          baseCost *= Math.pow(1.5, extraLevels); // 1.5x multiplier per level after 100
        }
        return this.applyDiscount(Math.ceil(baseCost));
      },
      canBuy: (state: GameState) => {
        let baseCost = 180 * Math.pow(Config.upgrades.costScaling.exponentialFactor, state.xpBoostLevel);
        if (state.xpBoostLevel > 100) {
          // After level 100, multiply by an additional factor
          const extraLevels = state.xpBoostLevel - 100;
          baseCost *= Math.pow(1.5, extraLevels); // 1.5x multiplier per level after 100
        }
        const cost = this.applyDiscount(Math.ceil(baseCost));
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

    // Mutation Engine upgrade removed - +all dmg upgrade removed

    // Energy Core upgrade removed - speed upgrade removed

    // Cosmic Knowledge upgrade removed - special upgrades kept without level requirements

    const miscUpgrade: UpgradeConfig = {
      id: 'misc',
      name: t('upgrades.main.misc.name'),
      description: t('upgrades.main.misc.description'),
      getCost: () => 0,
      canBuy: () => false,
      buy: () => { },
      getLevel: () => 0,
      getDisplayText: () => 'Special Technologies',
      subUpgrades: miscSubUpgrades,
    };

    return [
      shipUpgrade,
      pointMultiplierUpgrade,
      critChanceUpgrade,
      xpBoostUpgrade,
      miscUpgrade,
    ];
  }

  private applyDiscount(cost: number): number {
    let discount = 1.0;

    // Get current game state to check upgrade levels
    const state = this.getGameState();

    // Cosmic Knowledge upgrade removed - discount removed

    // Helper to check if sub-upgrade is owned (from state if available, otherwise from this.subUpgrades)
    const hasSubUpgrade = (id: string): boolean => {
      if (state?.subUpgrades) {
        return state.subUpgrades[id] ?? false;
      }
      return this.subUpgrades.find((u) => u.id === id)?.owned ?? false;
    };

    // v3.0: COSMIC KNOWLEDGE SUBUPGRADES (reduced discounts)
    if (hasSubUpgrade('ancient_texts')) discount *= 0.985; // 1.5% discount (reduced from 3%)
    if (hasSubUpgrade('akashic_records_library')) discount *= 0.975; // 2.5% discount (reduced from 5%)
    if (hasSubUpgrade('prophetic_vision')) discount *= 0.965; // 3.5% discount (reduced from 7%)
    if (hasSubUpgrade('universal_translator')) discount *= 0.95; // 5% discount (reduced from 10%)
    if (hasSubUpgrade('omniscience_lite')) discount *= 0.925; // 7.5% discount (reduced from 15%)
    if (hasSubUpgrade('forbidden_theorems')) discount *= 0.9; // 10% discount (reduced from 20%)
    if (hasSubUpgrade('schrodinger_upgrade')) discount *= 0.875; // 12.5% discount (reduced from 25%)
    if (hasSubUpgrade('universal_constants')) discount *= 0.85; // 15% discount (reduced from 30%)
    if (hasSubUpgrade('apotheosis')) discount *= 0.8; // 20% discount (reduced from 40%)
    if (hasSubUpgrade('omniscience')) discount *= 0.75; // 25% discount (reduced from 50%)

    // v3.0: FLEET COMMAND SUBUPGRADES (ship cost reduction)
    if (hasSubUpgrade('automated_repairs')) discount *= 0.9;

    // Energy recycling: 2.5% discount (reduced from 5%)
    if (hasSubUpgrade('energy_recycling')) {
      discount *= 0.975;
    }

    // Cheat codes: 10% discount (reduced from 20%)
    if (hasSubUpgrade('cheat_codes')) {
      discount *= 0.9;
    }

    // Omniscient AI: 15% discount (reduced from 30%)
    if (hasSubUpgrade('omniscient_ai')) {
      discount *= 0.85;
    }

    return Math.floor(cost * discount);
  }

  // Public method to get discounted cost for sub-upgrades
  public getSubUpgradeCost(subUpgrade: SubUpgrade): number {
    // meaning_of_life is not affected by discounts
    if (subUpgrade.id === 'meaning_of_life') {
      return subUpgrade.cost;
    }
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

  /**
   * Get base damage that applies to both clicks and ships
   * This ensures they deal the same damage
   */
  private getBaseDamage(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    // Damage Amplifier: +1 damage per level (level 1 = 1 damage, level 2 = 2 damage, etc.)
    let damage = this.basePoints + state.pointMultiplierLevel;

    // Apply unspent prestige points multiplier (1% per unspent PP)
    if (this.ascensionSystem) {
      const unspentPPMultiplier =
        this.ascensionSystem.getUnspentPPMultiplier(state);
      damage *= unspentPPMultiplier;
    }

    return damage;
  }

  getPointsPerHit(state: GameState): number {
    let multiplier = this.getBaseDamage(state);

    // Void Prism removed - passive income removed

    // Laser focusing crystals: +15%
    if (state.subUpgrades['laser_focusing']) {
      multiplier *= 1.15;
    }

    // Amplified resonance: 1.5x
    if (state.subUpgrades['amplified_resonance']) {
      multiplier *= 1.5;
    }
    // Quantum Network Matrix: 2x
    if (state.subUpgrades['quantum_network_matrix']) {
      multiplier *= 2.0;
    }

    // Enhanced Combat Matrix: +50%
    if (state.subUpgrades['enhanced_combat_matrix']) {
      multiplier *= 1.5;
    }

    // Void Essence Core: 2.5x
    if (state.subUpgrades['void_essence_core']) {
      multiplier *= 2.5;
    }

    // Overclocked reactors: +50%
    if (state.subUpgrades['overclocked_reactors']) {
      multiplier *= 1.5;
    }

    // Ship swarm: 2x
    if (state.subUpgrades['ship_swarm']) {
      multiplier *= 2.0;
    }

    // Fleet synergy matrix: +50%
    if (state.subUpgrades['fleet_synergy_matrix']) {
      multiplier *= 1.5;
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

    // Falafel Rollo Special: +10% damage (aliens distracted by delicious smell)
    if (state.subUpgrades['falafel_rollo_special']) {
      multiplier *= 1.1;
    }

    // Chaos emeralds: +35%
    if (state.subUpgrades['chaos_emeralds']) {
      multiplier *= 1.35;
    }

    // Infinity gauntlet: +40%
    if (state.subUpgrades['infinity_gauntlet']) {
      multiplier *= 1.4;
    }

    // Fleet command center: x1.4 attack damage
    if (state.subUpgrades['fleet_command_center']) {
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

    // Mutation Engine sub-upgrades removed - +all dmg upgrade removed

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

    // === NEW LEVEL 80+ UPGRADES ===
    // Dimensional Rift: x1.2
    if (state.subUpgrades['dimensional_rift']) {
      multiplier *= 1.2;
    }
    // Entropy Injector: x1.5 (Click Damage)
    if (state.subUpgrades['entropy_injector']) {
      multiplier *= 1.5;
    }
    // Event Horizon Shield: x1.3
    if (state.subUpgrades['event_horizon_shield']) {
      multiplier *= 1.3;
    }
    // Omega Relay: x1.5
    if (state.subUpgrades['omega_relay']) {
      multiplier *= 1.5;
    }
    // Quantum Singularity: x1.3
    if (state.subUpgrades['quantum_singularity']) {
      multiplier *= 1.3;
    }
    // Armada Command: x1.2 (fleet damage)
    if (state.subUpgrades['armada_command']) {
      multiplier *= 1.2;
    }
    // Stellar Fusion Core: x1.5
    if (state.subUpgrades['stellar_fusion_core']) {
      multiplier *= 1.5;
    }
    // Hyper Network Accelerator: x1.5
    if (state.subUpgrades['hyper_network_accelerator']) {
      multiplier *= 1.5;
    }
    // Fleet Omega Core: x2.5
    if (state.subUpgrades['fleet_omega_core']) {
      multiplier *= 2.5;
    }
    // Knowledge Power Conversion: +3% damage per XP Boost level
    if (state.subUpgrades['knowledge_power_conversion']) {
      const knowledgeBonus = state.xpBoostLevel * 0.03; // 3% per level
      multiplier *= (1 + knowledgeBonus);
    }

    // Cosmic Synergy Matrix: +50% damage
    if (state.subUpgrades['cosmic_synergy_matrix']) {
      multiplier *= 1.5;
    }

    // Apply ascension bonuses (reduced effectiveness for damage nerf)
    if (this.ascensionSystem) {
      const damageBonus = this.ascensionSystem.getDamageMultiplier(state);
      const pointsBonus = this.ascensionSystem.getPointsMultiplier(state);
      // Apply at 50% effectiveness to reduce overall damage
      multiplier *= 1 + (damageBonus - 1) * 0.5;
      multiplier *= 1 + (pointsBonus - 1) * 0.5;
    }

    // Apply artifact damage bonus (multiplicative)
    if (this.artifactSystem) {
      const artifactBonus = this.artifactSystem.getDamageBonus();
      multiplier *= 1 + artifactBonus;
    }

    return multiplier;
  }

  getCritChance(state: GameState): number {
    this.updateSubUpgradesFromState(state);
    let chance = 2 + state.critChanceLevel * 0.5; // Base 2% + 0.5% per level

    // Lucky dice: +2% (reduced from 5%)
    if (state.subUpgrades['lucky_dice']) {
      chance += 2;
    }

    // Dragon egg: +2% (reduced from 5%)
    if (state.subUpgrades['dragon_egg']) {
      chance += 2;
    }

    // Quantum entanglement: +3% (reduced from 8%)
    if (state.subUpgrades['quantum_entanglement']) {
      chance += 3;
    }

    // Hyper reactor: +2% (reduced from 5%)
    if (state.subUpgrades['hyper_reactor']) {
      chance += 2;
    }

    // Multiversal matrix: +5% (reduced from 15%)
    if (state.subUpgrades['multiversal_matrix']) {
      chance += 5;
    }

    // Planck Piercer: +5% (reduced from 15%)
    if (state.subUpgrades['planck_piercer']) {
      chance += 5;
    }

    // Perfect Critical Mastery: +5%
    if (state.subUpgrades['perfect_critical']) {
      chance += 5;
    }

    // Fleet synergy matrix: +3%
    if (state.subUpgrades['fleet_synergy_matrix']) {
      chance += 3;
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
    // Base multiplier for crits starts at 2.0x
    let multiplier = 2.0;

    // Artifact bonus: Apply multiplicatively with strong diminishing returns
    // Use square root scaling to prevent exponential growth
    // NOTE: Artifact bonuses can be very high, so we need very aggressive scaling
    if (this.artifactSystem) {
      const artifactBonus = this.artifactSystem.getCritBonus();
      // artifactBonus is already in decimal form (e.g., 20.0 for 2000%)
      // Apply square root scaling with extremely reduced factor to keep multipliers reasonable
      if (artifactBonus > 0) {
        const artifactMultiplier = 1 + Math.pow(artifactBonus, 1 / 3) * 0.015;
        multiplier *= artifactMultiplier;
      }
    }

    // Rubber duck: +1%
    if (state.subUpgrades['rubber_duck']) {
      multiplier *= 1.01;
    }

    // Lucky horseshoe: +3%
    if (state.subUpgrades['lucky_horseshoe']) {
      multiplier *= 1.03;
    }

    // Dragon egg: +3%
    if (state.subUpgrades['dragon_egg']) {
      multiplier *= 1.03;
    }

    // Reality anchor: +10%
    if (state.subUpgrades['reality_anchor']) {
      multiplier *= 1.1;
    }

    // Dimensional collapse: +15%
    if (state.subUpgrades['dimensional_collapse']) {
      multiplier *= 1.15;
    }

    // Null Space Projector: x1.5
    if (state.subUpgrades['null_space_projector']) {
      multiplier *= 1.5;
    }

    // Perfect Critical Mastery: x1.5
    if (state.subUpgrades['perfect_critical']) {
      multiplier *= 1.5;
    }

    // Critical Strike Mastery: x2
    if (state.subUpgrades['critical_mastery']) {
      multiplier *= 2.0;
    }

    // Cap the multiplier to prevent excessive damage (max 10x - allows upgrades to be meaningful)
    return Math.min(multiplier, 10.0);
  }

  getPassiveGen(_state: GameState): number {
    // Passive income removed - always returns 0
    return 0;
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

    // Akashic records: +50% XP
    if (state.subUpgrades['akashic_records']) {
      multiplier *= 1.5;
    }

    // Reality compiler: x20
    if (state.subUpgrades['reality_compiler']) {
      multiplier *= 20;
    }

    // Fleet XP Synergy: +3% XP per ship
    if (state.subUpgrades['fleet_xp_synergy']) {
      const shipBonus = state.shipsCount * 0.03; // 3% per ship
      multiplier *= (1 + shipBonus);
    }

    // Omega protocol: x25
    if (state.subUpgrades['omega_protocol']) {
      multiplier *= 25;
    }

    // Universe seed: x100
    if (state.subUpgrades['universe_seed']) {
      multiplier *= 100;
    }

    // === NEW LEVEL 80+ UPGRADES ===
    // Chronal Dust: x1.2
    if (state.subUpgrades['chronal_dust']) {
      multiplier *= 1.2;
    }
    // Cosmic Filament: x1.4
    if (state.subUpgrades['cosmic_filament']) {
      multiplier *= 1.4;
    }
    // Omega Relay: x1.5
    if (state.subUpgrades['omega_relay']) {
      multiplier *= 1.5;
    }
    // Infinite Knowledge Core: x2.5
    if (state.subUpgrades['infinite_knowledge']) {
      multiplier *= 2.5;
    }

    // Apply ascension bonuses
    if (this.ascensionSystem) {
      multiplier *= this.ascensionSystem.getXPMultiplier(state);
    }

    return multiplier;
  }

  getFireCooldown(_state: GameState, _includePowerUp: boolean = false): number {
    // All ships now have fixed 1/sec attack speed (1000ms cooldown)
    return 1000;
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


  // Get auto-fire ship damage - identical to click damage (no crits applied in Game.ts for ships)
  getAutoFireDamage(state: GameState): number {
    let damage = this.getPointsPerHit(state);

    // Quantum Fleet Sync: x2 fleet damage (only applies to auto-fire/fleet damage)
    if (state.subUpgrades['quantum_fleet_sync']) {
      damage *= 2.0;
    }

    return damage;
  }
}
