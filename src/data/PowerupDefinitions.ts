import { SubUpgrade } from '../types';

export const POWERUP_DEFINITIONS: SubUpgrade[] = [
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
        cost: 600000000000, // 600B (escalado de 5B)
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
