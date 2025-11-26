/**
 * Centralized image asset imports
 * All images are imported here to ensure Vite processes them correctly
 * for both development and production builds
 */

// Menu icons
import menuAchievements from '@/icons/menu/achievements.png';
import menuAscension from '@/icons/menu/ascension.png';
import menuArtifacts from '@/icons/menu/artifacts.png';
import menuBuy from '@/icons/menu/buy.png';
import menuClose from '@/icons/menu/close.png';
import menuInfo from '@/icons/menu/info.png';
import menuLeft from '@/icons/menu/left.png';
import menuRight from '@/icons/menu/right.png';
import menuSettings from '@/icons/menu/settings.png';
import menuStatistic from '@/icons/menu/statistic.png';
import menuMissions from '@/icons/menu/missions.png';

// General icons
import bossbattle from '@/icons/bossbattle.png';
import graph from '@/icons/graph.png';
import stars from '@/icons/stars.png';
import target from '@/icons/target.png';
import trophy from '@/icons/trophy.png';
import books from '@/icons/books.png';
import settings from '@/icons/settings.png';
import art from '@/icons/art.png';
import hitmarker from '@/icons/hitmarker.png';

// Artifact icons
import artifactRustyCoil from '@/icons/artifacts/rusty_coil.png';
import artifactBasicTargeting from '@/icons/artifacts/baisc_targeting_system.png';
import artifactLuckyCharm from '@/icons/artifacts/lucky_charm.png';
import artifactAlienHead from '@/icons/artifacts/alien_head.png';
import artifactBattery from '@/icons/artifacts/battery.png';
import artifactCookie from '@/icons/artifacts/cookie.png';
import artifactWaterBottle from '@/icons/artifacts/water_bottle.png';
import artifactSmallMeteor from '@/icons/artifacts/small_sized_meteor.png';
import artifactAlienPowerCore from '@/icons/artifacts/alien_power_core.png';
import artifactEnhanceCapacitor from '@/icons/artifacts/enhance_capacitor.png';
import artifactQuantumProcessor from '@/icons/artifacts/quantum_processor.png';
import artifactAnxietyPills from '@/icons/artifacts/anxiety_pills.png';
import artifactGoldBar from '@/icons/artifacts/gold_bar.png';
import artifactMagnetizer from '@/icons/artifacts/magnetizer.png';
import artifactSatellite from '@/icons/artifacts/sattelite.png';
import artifactStrangePotion from '@/icons/artifacts/strange_potion.png';
import artifactStrangeKey from '@/icons/artifacts/strange_key.png';
import artifactLollipop from '@/icons/artifacts/lolipop.png';
import artifactCreditCard from '@/icons/artifacts/credit_card.png';
import artifactMoon from '@/icons/artifacts/moon.png';
import artifactPlasmaReactor from '@/icons/artifacts/plasma_reactor.png';
import artifactTemporalAccelerator from '@/icons/artifacts/temporal_accelerator.png';
import artifactFortuneFragment from '@/icons/artifacts/fortune_fragment.png';
import artifactAdrenalineInjection from '@/icons/artifacts/adrenaline_injection.png';
import artifactBlackHole from '@/icons/artifacts/black_hole.png';
import artifactGalaxySpiral from '@/icons/artifacts/galaxy_spiral.png';
import artifactNuke from '@/icons/artifacts/nuke.png';
import artifactHeartOfDyingStar from '@/icons/artifacts/heart_of_dying_star.png';
import artifactInfinityCrystal from '@/icons/artifacts/infinity_cristals.png';
import artifactCosmicHarmonizer from '@/icons/artifacts/cosmic_harmonizer.png';
import artifactConstellationMap from '@/icons/artifacts/constelation_map.png';

// Background GIFs - import all variants
import backgroundGif1 from '@/animations/space14-frames.gif';
import backgroundGif2 from '@/animations/space24-frames.gif';
import backgroundGif3 from '@/animations/space34-frames.gif';
import backgroundGif4 from '@/animations/space44-frames.gif';
import backgroundGif5 from '@/animations/space54-frames.gif';
import backgroundGif6 from '@/animations/space64-frames.gif';
import backgroundGif7 from '@/animations/space74-frames.gif';
import backgroundGif8 from '@/animations/space84-frames.gif';
import backgroundGif9 from '@/animations/space94-frames.gif';

// Import generation utils
import { generateIconUrl } from '@/utils/IconGenerator';
import {
  UPGRADE_SPRITE_DIMENSIONAL_RIFT,
  UPGRADE_SPRITE_VOID_PRISM,
  UPGRADE_SPRITE_CHRONAL_DUST,
  UPGRADE_SPRITE_DARK_MATTER_WEAVER,
  UPGRADE_SPRITE_ENTROPY_INJECTOR,
  UPGRADE_SPRITE_TEMPORAL_SIPHON,
  UPGRADE_SPRITE_EVENT_HORIZON_SHIELD,
  UPGRADE_SPRITE_COSMIC_FILAMENT,
  UPGRADE_SPRITE_NULL_SPACE_PROJECTOR,
  UPGRADE_SPRITE_OMEGA_RELAY,
  UPGRADE_SPRITE_ADAPTIVE_EVOLUTION,
  UPGRADE_SPRITE_SYMBIOTIC_WEAPONS,
  UPGRADE_SPRITE_REGENERATIVE_HULL,
  UPGRADE_SPRITE_HIVE_MIND,
  UPGRADE_SPRITE_PERFECT_ORGANISM,
  UPGRADE_SPRITE_ELDRITCH_EVOLUTION,
  UPGRADE_SPRITE_COSMIC_HORROR,
  UPGRADE_SPRITE_TRANSCENDENT_FORM,
  UPGRADE_SPRITE_LIVING_WEAPON,
  UPGRADE_SPRITE_APEX_PREDATOR,
  UPGRADE_SPRITE_FUSION_REACTOR,
  UPGRADE_SPRITE_ZERO_POINT,
  UPGRADE_SPRITE_PERPETUAL_MOTION,
  UPGRADE_SPRITE_TESLA_COILS,
  UPGRADE_SPRITE_ARC_REACTOR,
  UPGRADE_SPRITE_HARVESTED_STAR,
  UPGRADE_SPRITE_VACUUM_ENERGY_TAP,
  UPGRADE_SPRITE_ENTROPY_REVERSAL_ENGINE,
  UPGRADE_SPRITE_BIG_CRUNCH_GENERATOR,
  UPGRADE_SPRITE_MULTIVERSAL_TAP,
  UPGRADE_SPRITE_ANCIENT_TEXTS,
  UPGRADE_SPRITE_AKASHIC_RECORDS_LIBRARY,
  UPGRADE_SPRITE_PROPHETIC_VISION,
  UPGRADE_SPRITE_UNIVERSAL_TRANSLATOR,
  UPGRADE_SPRITE_OMNISCIENCE_LITE,
  UPGRADE_SPRITE_FORBIDDEN_THEOREMS,
  UPGRADE_SPRITE_SCHRODINGER_UPGRADE,
  UPGRADE_SPRITE_UNIVERSAL_CONSTANTS,
  UPGRADE_SPRITE_APOTHEOSIS,
  UPGRADE_SPRITE_OMNISCIENCE,
  UPGRADE_SPRITE_DEATH_PACT,
  UPGRADE_SPRITE_LASER_FOCUSING,
  UPGRADE_SPRITE_AMPLIFIED_RESONANCE,
  UPGRADE_SPRITE_COFFEE_MACHINE,
  UPGRADE_SPRITE_QUANTUM_TARGETING,
  UPGRADE_SPRITE_LUCKY_DICE,
  UPGRADE_SPRITE_ENERGY_RECYCLING,
  UPGRADE_SPRITE_OVERCLOCKED_REACTORS,
  UPGRADE_SPRITE_SHIP_SWARM,
  UPGRADE_SPRITE_FLEET_SYNERGY_MATRIX,
  UPGRADE_SPRITE_QUANTUM_FLEET_SYNC,
  UPGRADE_SPRITE_STELLAR_FUSION_CORE,
  UPGRADE_SPRITE_HYPER_NETWORK_ACCELERATOR,
  UPGRADE_SPRITE_FLEET_OMEGA_CORE,
  UPGRADE_SPRITE_CRITICAL_MASTERY,
  UPGRADE_SPRITE_DUAL_NETWORK_EXPANSION,
  UPGRADE_SPRITE_NETWORK_WHITE_GLOW,
  UPGRADE_SPRITE_CRIMSON_NETWORK_PROTOCOL,
  UPGRADE_SPRITE_VOID_ESSENCE_CORE,
  UPGRADE_SPRITE_ORBITAL_SATELLITE,
  UPGRADE_SPRITE_RAPID_FIRE_SATELLITE,
  UPGRADE_SPRITE_COSMIC_SYNERGY_MATRIX,
  UPGRADE_SPRITE_FLEET_XP_SYNERGY,
  UPGRADE_SPRITE_QUANTUM_NETWORK_MATRIX,
  UPGRADE_SPRITE_ENHANCED_COMBAT_MATRIX,
  UPGRADE_SPRITE_KNOWLEDGE_POWER_CONVERSION,
  UPGRADE_SPRITE_NEURAL_LINK,
  UPGRADE_SPRITE_SPACE_PIZZA,
  UPGRADE_SPRITE_RUBBER_DUCK,
  UPGRADE_SPRITE_FALAFEL_ROLLO_SPECIAL,
  UPGRADE_SPRITE_ANTIMATTER_ROUNDS,
  UPGRADE_SPRITE_MOTIVATIONAL_POSTERS,
  UPGRADE_SPRITE_WARP_CORE,
  UPGRADE_SPRITE_DISCO_BALL,
  UPGRADE_SPRITE_AI_OPTIMIZER,
  UPGRADE_SPRITE_LUCKY_HORSESHOE,
  UPGRADE_SPRITE_PERFECT_PRECISION,
  UPGRADE_SPRITE_ARCADE_MACHINE,
  UPGRADE_SPRITE_VOID_CHANNELING,
  UPGRADE_SPRITE_CHAOS_EMERALDS,
  UPGRADE_SPRITE_TIME_MACHINE,
  UPGRADE_SPRITE_NANOBOTS,
  UPGRADE_SPRITE_PLASMA_MATRIX,
  UPGRADE_SPRITE_HOLOGRAPHIC_DECOYS,
  UPGRADE_SPRITE_TEMPORAL_ACCELERATION,
  UPGRADE_SPRITE_QUANTUM_ENTANGLEMENT,
  UPGRADE_SPRITE_PHILOSOPHERS_STONE,
  UPGRADE_SPRITE_STELLAR_FORGE,
  UPGRADE_SPRITE_GOLDEN_GOOSE,
  UPGRADE_SPRITE_DARK_MATTER_ENGINE,
  UPGRADE_SPRITE_SHIP,
  UPGRADE_SPRITE_ATTACK_SPEED,
  UPGRADE_SPRITE_POINT_MULTIPLIER,
  UPGRADE_SPRITE_CRIT_CHANCE,
  UPGRADE_SPRITE_RESOURCE_GEN,
  UPGRADE_SPRITE_XP_BOOST,
  UPGRADE_SPRITE_MUTATION_ENGINE,
  UPGRADE_SPRITE_ENERGY_CORE,
  UPGRADE_SPRITE_COSMIC_KNOWLEDGE,
  UPGRADE_SPRITE_MISC,
  UPGRADE_SPRITE_ANTIMATTER_CASCADE,
  UPGRADE_SPRITE_INFINITY_GAUNTLET,
  UPGRADE_SPRITE_NEBULA_HARVESTER,
  UPGRADE_SPRITE_ALIEN_COOKBOOK,
  UPGRADE_SPRITE_HYPER_REACTOR,
  UPGRADE_SPRITE_FLEET_COMMAND_CENTER,
  UPGRADE_SPRITE_QUANTUM_SINGULARITY,
  UPGRADE_SPRITE_ARMADA_COMMAND,
  UPGRADE_SPRITE_CHRONOS_ACCELERATOR,
  UPGRADE_SPRITE_PERFECT_CRITICAL,
  UPGRADE_SPRITE_INFINITE_KNOWLEDGE,
  UPGRADE_SPRITE_NUCLEAR_REACTOR,
  UPGRADE_SPRITE_PHOTON_AMPLIFIER,
  UPGRADE_SPRITE_REALITY_ANCHOR,
  UPGRADE_SPRITE_COSMIC_BATTERY,
  UPGRADE_SPRITE_SINGULARITY_CORE,
  UPGRADE_SPRITE_CHEAT_CODES,
  UPGRADE_SPRITE_DRAGON_EGG,
  UPGRADE_SPRITE_UNIVERSE_MAP,
  UPGRADE_SPRITE_ANSWER_TO_EVERYTHING,
  UPGRADE_SPRITE_HEART_OF_GALAXY,
  UPGRADE_SPRITE_COSMIC_ASCENSION,
  UPGRADE_SPRITE_MEANING_OF_LIFE,
  UPGRADE_SPRITE_MASTER_CLICKER,
  UPGRADE_SPRITE_CLICK_MULTIPLIER,
  UPGRADE_SPRITE_SUPER_CLICKER,
  UPGRADE_SPRITE_MULTIVERSAL_MATRIX,
  UPGRADE_SPRITE_ENTROPY_REVERSAL,
  UPGRADE_SPRITE_OMNISCIENT_AI,
  UPGRADE_SPRITE_BIG_BANG_GENERATOR,
  UPGRADE_SPRITE_DIMENSIONAL_COLLAPSE,
  UPGRADE_SPRITE_REALITY_COMPILER,
  UPGRADE_SPRITE_AKASHIC_RECORDS,
  UPGRADE_SPRITE_VOID_HEART,
  UPGRADE_SPRITE_ETERNAL_ENGINE,
  UPGRADE_SPRITE_OMEGA_PROTOCOL,
  UPGRADE_SPRITE_INFINITY_ENGINE,
  UPGRADE_SPRITE_UNIVERSE_SEED,
  UPGRADE_SPRITE_TRANSCENDENCE,
} from '@/render/UpgradeSprites';

// Generate upgrade icons
const upgradeIcons = {
  // Batch 5 (New V1.0 Part 2 + Standard)
  stellar_forge: generateIconUrl(UPGRADE_SPRITE_STELLAR_FORGE, '#ff6600'),
  golden_goose: generateIconUrl(UPGRADE_SPRITE_GOLDEN_GOOSE, '#ffcc00'),
  dark_matter_engine: generateIconUrl(UPGRADE_SPRITE_DARK_MATTER_ENGINE, '#330066'),
  ship: generateIconUrl(UPGRADE_SPRITE_SHIP, '#0099ff'),
  attackSpeed: generateIconUrl(UPGRADE_SPRITE_ATTACK_SPEED, '#ffff00'),
  pointMultiplier: generateIconUrl(UPGRADE_SPRITE_POINT_MULTIPLIER, '#00ffff'),
  critChance: generateIconUrl(UPGRADE_SPRITE_CRIT_CHANCE, '#ff0000'),
  resourceGen: generateIconUrl(UPGRADE_SPRITE_RESOURCE_GEN, '#00ff00'),
  xpBoost: generateIconUrl(UPGRADE_SPRITE_XP_BOOST, '#9900ff'),
  mutationEngine: generateIconUrl(UPGRADE_SPRITE_MUTATION_ENGINE, '#ff00ff'),
  energyCore: generateIconUrl(UPGRADE_SPRITE_ENERGY_CORE, '#00ccff'),
  cosmicKnowledge: generateIconUrl(UPGRADE_SPRITE_COSMIC_KNOWLEDGE, '#6600cc'),
  misc: generateIconUrl(UPGRADE_SPRITE_MISC, '#cccccc'),

  // Batch 6 (Missing Part 1)
  antimatter_cascade: generateIconUrl(UPGRADE_SPRITE_ANTIMATTER_CASCADE, '#ff00ff'),
  infinity_gauntlet: generateIconUrl(UPGRADE_SPRITE_INFINITY_GAUNTLET, '#ffcc00'),
  nebula_harvester: generateIconUrl(UPGRADE_SPRITE_NEBULA_HARVESTER, '#330066'),
  alien_cookbook: generateIconUrl(UPGRADE_SPRITE_ALIEN_COOKBOOK, '#00ff00'),
  hyper_reactor: generateIconUrl(UPGRADE_SPRITE_HYPER_REACTOR, '#ff3300'),
  fleet_command_center: generateIconUrl(UPGRADE_SPRITE_FLEET_COMMAND_CENTER, '#0099ff'),
  quantum_singularity: generateIconUrl(UPGRADE_SPRITE_QUANTUM_SINGULARITY, '#000000'),
  armada_command: generateIconUrl(UPGRADE_SPRITE_ARMADA_COMMAND, '#0033cc'),
  chronos_accelerator: generateIconUrl(UPGRADE_SPRITE_CHRONOS_ACCELERATOR, '#ff9900'),
  perfect_critical: generateIconUrl(UPGRADE_SPRITE_PERFECT_CRITICAL, '#ff0000'),
  infinite_knowledge: generateIconUrl(UPGRADE_SPRITE_INFINITE_KNOWLEDGE, '#00ffff'),
  nuclear_reactor: generateIconUrl(UPGRADE_SPRITE_NUCLEAR_REACTOR, '#00ff33'),
  photon_amplifier: generateIconUrl(UPGRADE_SPRITE_PHOTON_AMPLIFIER, '#ffff00'),

  // Batch 7 (Missing Part 2)
  reality_anchor: generateIconUrl(UPGRADE_SPRITE_REALITY_ANCHOR, '#00ffff'),
  cosmic_battery: generateIconUrl(UPGRADE_SPRITE_COSMIC_BATTERY, '#ffcc00'),
  singularity_core: generateIconUrl(UPGRADE_SPRITE_SINGULARITY_CORE, '#000000'),
  cheat_codes: generateIconUrl(UPGRADE_SPRITE_CHEAT_CODES, '#ff0000'),
  dragon_egg: generateIconUrl(UPGRADE_SPRITE_DRAGON_EGG, '#ff9900'),
  universe_map: generateIconUrl(UPGRADE_SPRITE_UNIVERSE_MAP, '#0099ff'),
  answer_to_everything: generateIconUrl(UPGRADE_SPRITE_ANSWER_TO_EVERYTHING, '#00ff33'),
  heart_of_galaxy: generateIconUrl(UPGRADE_SPRITE_HEART_OF_GALAXY, '#ff00ff'),
  cosmic_ascension: generateIconUrl(UPGRADE_SPRITE_COSMIC_ASCENSION, '#ffffff'),
  meaning_of_life: generateIconUrl(UPGRADE_SPRITE_MEANING_OF_LIFE, '#cc00cc'),
  master_clicker: generateIconUrl(UPGRADE_SPRITE_MASTER_CLICKER, '#ffcc00'),
  click_multiplier: generateIconUrl(UPGRADE_SPRITE_CLICK_MULTIPLIER, '#00ccff'),
  super_clicker: generateIconUrl(UPGRADE_SPRITE_SUPER_CLICKER, '#ff3300'),

  // Batch 8 (Missing Part 3)
  multiversal_matrix: generateIconUrl(UPGRADE_SPRITE_MULTIVERSAL_MATRIX, '#00ffcc'),
  entropy_reversal: generateIconUrl(UPGRADE_SPRITE_ENTROPY_REVERSAL, '#cc00ff'),
  omniscient_ai: generateIconUrl(UPGRADE_SPRITE_OMNISCIENT_AI, '#00ffff'),
  big_bang_generator: generateIconUrl(UPGRADE_SPRITE_BIG_BANG_GENERATOR, '#ff6600'),
  dimensional_collapse: generateIconUrl(UPGRADE_SPRITE_DIMENSIONAL_COLLAPSE, '#000000'),
  reality_compiler: generateIconUrl(UPGRADE_SPRITE_REALITY_COMPILER, '#00ff00'),
  akashic_records: generateIconUrl(UPGRADE_SPRITE_AKASHIC_RECORDS, '#ffcc00'),
  void_heart: generateIconUrl(UPGRADE_SPRITE_VOID_HEART, '#330033'),
  eternal_engine: generateIconUrl(UPGRADE_SPRITE_ETERNAL_ENGINE, '#00ccff'),
  omega_protocol: generateIconUrl(UPGRADE_SPRITE_OMEGA_PROTOCOL, '#ff0000'),
  infinity_engine: generateIconUrl(UPGRADE_SPRITE_INFINITY_ENGINE, '#ffffff'),
  universe_seed: generateIconUrl(UPGRADE_SPRITE_UNIVERSE_SEED, '#66ff66'),
  transcendence: generateIconUrl(UPGRADE_SPRITE_TRANSCENDENCE, '#ffffcc'),

  // Batch 4 (New V1.0 Part 1)
  ai_optimizer: generateIconUrl(UPGRADE_SPRITE_AI_OPTIMIZER, '#00ffff'),
  lucky_horseshoe: generateIconUrl(UPGRADE_SPRITE_LUCKY_HORSESHOE, '#ffcc00'),
  perfect_precision: generateIconUrl(UPGRADE_SPRITE_PERFECT_PRECISION, '#ff0000'),
  arcade_machine: generateIconUrl(UPGRADE_SPRITE_ARCADE_MACHINE, '#ff00ff'),
  void_channeling: generateIconUrl(UPGRADE_SPRITE_VOID_CHANNELING, '#660066'),
  chaos_emeralds: generateIconUrl(UPGRADE_SPRITE_CHAOS_EMERALDS, '#00ff00'),
  time_machine: generateIconUrl(UPGRADE_SPRITE_TIME_MACHINE, '#cc9900'),
  nanobots: generateIconUrl(UPGRADE_SPRITE_NANOBOTS, '#cccccc'),
  plasma_matrix: generateIconUrl(UPGRADE_SPRITE_PLASMA_MATRIX, '#00ff33'),
  holographic_decoys: generateIconUrl(UPGRADE_SPRITE_HOLOGRAPHIC_DECOYS, '#3399ff'),
  temporal_acceleration: generateIconUrl(UPGRADE_SPRITE_TEMPORAL_ACCELERATION, '#ff9900'),
  quantum_entanglement: generateIconUrl(UPGRADE_SPRITE_QUANTUM_ENTANGLEMENT, '#ff33cc'),
  philosophers_stone: generateIconUrl(UPGRADE_SPRITE_PHILOSOPHERS_STONE, '#ff0000'),

  // Batch 3 (Original)
  death_pact: generateIconUrl(UPGRADE_SPRITE_DEATH_PACT, '#990033'),
  laser_focusing: generateIconUrl(UPGRADE_SPRITE_LASER_FOCUSING, '#00ffff'),
  amplified_resonance: generateIconUrl(UPGRADE_SPRITE_AMPLIFIED_RESONANCE, '#ff00ff'),
  coffee_machine: generateIconUrl(UPGRADE_SPRITE_COFFEE_MACHINE, '#663300'),
  quantum_targeting: generateIconUrl(UPGRADE_SPRITE_QUANTUM_TARGETING, '#00ff00'),
  lucky_dice: generateIconUrl(UPGRADE_SPRITE_LUCKY_DICE, '#ff0000'),
  energy_recycling: generateIconUrl(UPGRADE_SPRITE_ENERGY_RECYCLING, '#33cc33'),
  overclocked_reactors: generateIconUrl(UPGRADE_SPRITE_OVERCLOCKED_REACTORS, '#ff6600'),
  ship_swarm: generateIconUrl(UPGRADE_SPRITE_SHIP_SWARM, '#3399ff'),
  fleet_synergy_matrix: generateIconUrl(UPGRADE_SPRITE_FLEET_SYNERGY_MATRIX, '#00ccff'),
  quantum_fleet_sync: generateIconUrl(UPGRADE_SPRITE_QUANTUM_FLEET_SYNC, '#00ff00'),
  stellar_fusion_core: generateIconUrl(UPGRADE_SPRITE_STELLAR_FUSION_CORE, '#00ccff'),
  hyper_network_accelerator: generateIconUrl(UPGRADE_SPRITE_HYPER_NETWORK_ACCELERATOR, '#ff8800'),
  fleet_omega_core: generateIconUrl(UPGRADE_SPRITE_FLEET_OMEGA_CORE, '#ff0000'),
  critical_mastery: generateIconUrl(UPGRADE_SPRITE_CRITICAL_MASTERY, '#ff3300'),
  dual_network_expansion: generateIconUrl(UPGRADE_SPRITE_DUAL_NETWORK_EXPANSION, '#0099ff'),
  network_white_glow: generateIconUrl(UPGRADE_SPRITE_NETWORK_WHITE_GLOW, '#ffffff'),
  crimson_network_protocol: generateIconUrl(UPGRADE_SPRITE_CRIMSON_NETWORK_PROTOCOL, '#ff0000'),
  void_essence_core: generateIconUrl(UPGRADE_SPRITE_VOID_ESSENCE_CORE, '#9d00ff'),
  orbital_satellite: generateIconUrl(UPGRADE_SPRITE_ORBITAL_SATELLITE, '#00ccff'),
  rapid_fire_satellite: generateIconUrl(UPGRADE_SPRITE_RAPID_FIRE_SATELLITE, '#ff6600'),
  cosmic_synergy_matrix: generateIconUrl(UPGRADE_SPRITE_COSMIC_SYNERGY_MATRIX, '#00ffff'),
  fleet_xp_synergy: generateIconUrl(UPGRADE_SPRITE_FLEET_XP_SYNERGY, '#00ffff'),
  quantum_network_matrix: generateIconUrl(UPGRADE_SPRITE_QUANTUM_NETWORK_MATRIX, '#ff00ff'),
  enhanced_combat_matrix: generateIconUrl(UPGRADE_SPRITE_ENHANCED_COMBAT_MATRIX, '#ff6600'),
  knowledge_power_conversion: generateIconUrl(UPGRADE_SPRITE_KNOWLEDGE_POWER_CONVERSION, '#ffff00'),
  neural_link: generateIconUrl(UPGRADE_SPRITE_NEURAL_LINK, '#ff66cc'),
  space_pizza: generateIconUrl(UPGRADE_SPRITE_SPACE_PIZZA, '#ffcc00'),
  rubber_duck: generateIconUrl(UPGRADE_SPRITE_RUBBER_DUCK, '#ffff00'),
  falafel_rollo_special: generateIconUrl(UPGRADE_SPRITE_FALAFEL_ROLLO_SPECIAL, '#996633'),
  antimatter_rounds: generateIconUrl(UPGRADE_SPRITE_ANTIMATTER_ROUNDS, '#660066'),
  motivational_posters: generateIconUrl(UPGRADE_SPRITE_MOTIVATIONAL_POSTERS, '#ffffff'),
  warp_core: generateIconUrl(UPGRADE_SPRITE_WARP_CORE, '#6600ff'),
  disco_ball: generateIconUrl(UPGRADE_SPRITE_DISCO_BALL, '#cccccc'),

  // Batch 2
  harvested_star: generateIconUrl(UPGRADE_SPRITE_HARVESTED_STAR, '#ffcc00'),
  vacuum_energy_tap: generateIconUrl(UPGRADE_SPRITE_VACUUM_ENERGY_TAP, '#330066'),
  entropy_reversal_engine: generateIconUrl(UPGRADE_SPRITE_ENTROPY_REVERSAL_ENGINE, '#ff3333'),
  big_crunch_generator: generateIconUrl(UPGRADE_SPRITE_BIG_CRUNCH_GENERATOR, '#000000'),
  multiversal_tap: generateIconUrl(UPGRADE_SPRITE_MULTIVERSAL_TAP, '#9900ff'),
  ancient_texts: generateIconUrl(UPGRADE_SPRITE_ANCIENT_TEXTS, '#cc9966'),
  akashic_records_library: generateIconUrl(UPGRADE_SPRITE_AKASHIC_RECORDS_LIBRARY, '#00ccff'),
  prophetic_vision: generateIconUrl(UPGRADE_SPRITE_PROPHETIC_VISION, '#cc00cc'),
  universal_translator: generateIconUrl(UPGRADE_SPRITE_UNIVERSAL_TRANSLATOR, '#00ff99'),
  omniscience_lite: generateIconUrl(UPGRADE_SPRITE_OMNISCIENCE_LITE, '#ffffff'),
  forbidden_theorems: generateIconUrl(UPGRADE_SPRITE_FORBIDDEN_THEOREMS, '#ff0000'),
  schrodinger_upgrade: generateIconUrl(UPGRADE_SPRITE_SCHRODINGER_UPGRADE, '#999999'),
  universal_constants: generateIconUrl(UPGRADE_SPRITE_UNIVERSAL_CONSTANTS, '#3333ff'),
  apotheosis: generateIconUrl(UPGRADE_SPRITE_APOTHEOSIS, '#ffff00'),
  omniscience: generateIconUrl(UPGRADE_SPRITE_OMNISCIENCE, '#ffffff'),
  // Batch 1
  adaptive_evolution: generateIconUrl(UPGRADE_SPRITE_ADAPTIVE_EVOLUTION, '#00ff99'),
  symbiotic_weapons: generateIconUrl(UPGRADE_SPRITE_SYMBIOTIC_WEAPONS, '#ff3333'),
  regenerative_hull: generateIconUrl(UPGRADE_SPRITE_REGENERATIVE_HULL, '#33ff33'),
  hive_mind: generateIconUrl(UPGRADE_SPRITE_HIVE_MIND, '#ff9900'),
  perfect_organism: generateIconUrl(UPGRADE_SPRITE_PERFECT_ORGANISM, '#ffffff'),
  eldritch_evolution: generateIconUrl(UPGRADE_SPRITE_ELDRITCH_EVOLUTION, '#9900ff'),
  cosmic_horror: generateIconUrl(UPGRADE_SPRITE_COSMIC_HORROR, '#6600cc'),
  transcendent_form: generateIconUrl(UPGRADE_SPRITE_TRANSCENDENT_FORM, '#ffffcc'),
  living_weapon: generateIconUrl(UPGRADE_SPRITE_LIVING_WEAPON, '#cc0000'),
  apex_predator: generateIconUrl(UPGRADE_SPRITE_APEX_PREDATOR, '#996633'),
  fusion_reactor: generateIconUrl(UPGRADE_SPRITE_FUSION_REACTOR, '#ffcc00'),
  zero_point: generateIconUrl(UPGRADE_SPRITE_ZERO_POINT, '#00ffff'),
  perpetual_motion: generateIconUrl(UPGRADE_SPRITE_PERPETUAL_MOTION, '#0099ff'),
  tesla_coils: generateIconUrl(UPGRADE_SPRITE_TESLA_COILS, '#3366ff'),
  arc_reactor: generateIconUrl(UPGRADE_SPRITE_ARC_REACTOR, '#00ccff'),
  // Original 10
  dimensional_rift: generateIconUrl(UPGRADE_SPRITE_DIMENSIONAL_RIFT, '#9933ff'),
  void_prism: generateIconUrl(UPGRADE_SPRITE_VOID_PRISM, '#330066'),
  chronal_dust: generateIconUrl(UPGRADE_SPRITE_CHRONAL_DUST, '#ffcc00'),
  dark_matter_weaver: generateIconUrl(UPGRADE_SPRITE_DARK_MATTER_WEAVER, '#333333'),
  entropy_injector: generateIconUrl(UPGRADE_SPRITE_ENTROPY_INJECTOR, '#00ff00'),
  temporal_siphon: generateIconUrl(UPGRADE_SPRITE_TEMPORAL_SIPHON, '#00ccff'),
  event_horizon_shield: generateIconUrl(UPGRADE_SPRITE_EVENT_HORIZON_SHIELD, '#0000ff'),
  cosmic_filament: generateIconUrl(UPGRADE_SPRITE_COSMIC_FILAMENT, '#ff00ff'),
  null_space_projector: generateIconUrl(UPGRADE_SPRITE_NULL_SPACE_PROJECTOR, '#cccccc'),
  omega_relay: generateIconUrl(UPGRADE_SPRITE_OMEGA_RELAY, '#ff0000'),
};

// Export as a map for easy access
export const images = {
  menu: {
    achievements: menuAchievements,
    ascension: menuAscension,
    artifacts: menuArtifacts,
    buy: menuBuy,
    close: menuClose,
    info: menuInfo,
    left: menuLeft,
    right: menuRight,
    settings: menuSettings,
    statistic: menuStatistic,
    missions: menuMissions,
  },
  bossbattle,
  graph,
  stars,
  target,
  trophy,
  books,
  settings,
  art,
  hitmarker,
  artifacts: {
    rusty_coil: artifactRustyCoil,
    baisc_targeting_system: artifactBasicTargeting,
    lucky_charm: artifactLuckyCharm,
    alien_head: artifactAlienHead,
    battery: artifactBattery,
    cookie: artifactCookie,
    water_bottle: artifactWaterBottle,
    small_sized_meteor: artifactSmallMeteor,
    alien_power_core: artifactAlienPowerCore,
    enhance_capacitor: artifactEnhanceCapacitor,
    quantum_processor: artifactQuantumProcessor,
    anxiety_pills: artifactAnxietyPills,
    gold_bar: artifactGoldBar,
    magnetizer: artifactMagnetizer,
    sattelite: artifactSatellite,
    strange_potion: artifactStrangePotion,
    strange_key: artifactStrangeKey,
    lolipop: artifactLollipop,
    credit_card: artifactCreditCard,
    moon: artifactMoon,
    plasma_reactor: artifactPlasmaReactor,
    temporal_accelerator: artifactTemporalAccelerator,
    fortune_fragment: artifactFortuneFragment,
    adrenaline_injection: artifactAdrenalineInjection,
    black_hole: artifactBlackHole,
    galaxy_spiral: artifactGalaxySpiral,
    nuke: artifactNuke,
    heart_of_dying_star: artifactHeartOfDyingStar,
    infinity_cristals: artifactInfinityCrystal,
    cosmic_harmonizer: artifactCosmicHarmonizer,
    constelation_map: artifactConstellationMap,
  },
  upgrades: upgradeIcons, // Add generated upgrades here
  backgroundGif: backgroundGif4, // Default background
  backgroundGifs: {
    1: backgroundGif1,
    2: backgroundGif2,
    3: backgroundGif3,
    4: backgroundGif4,
    5: backgroundGif5,
    6: backgroundGif6,
    7: backgroundGif7,
    8: backgroundGif8,
    9: backgroundGif9,
  },
} as const;

/**
 * Helper function to get image URL using new URL() for dynamic paths
 * This works for both dev and production
 */
export function getImageUrl(path: string): string {
  try {
    // Use new URL() with import.meta.url to resolve paths relative to the module
    return new URL(path, import.meta.url).href;
  } catch {
    // Fallback: use BASE_URL if URL constructor fails
    const baseUrl = import.meta.env.BASE_URL || './';
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${cleanPath}`;
  }
}

/**
 * Helper function to resolve artifact icon paths
 * Maps /src/icons/artifacts/... paths to imported image URLs
 */
export function resolveArtifactIcon(iconPath: string): string {
  // If it's already a full URL or data URL, return as-is
  if (iconPath.startsWith('http') || iconPath.startsWith('data:')) {
    return iconPath;
  }

  // If it's an emoji or non-path string, return as-is
  if (
    !iconPath.startsWith('/') &&
    !iconPath.startsWith('./') &&
    !iconPath.startsWith('@/')
  ) {
    return iconPath;
  }

  // Extract filename from path
  let filename: string;
  if (iconPath.startsWith('/src/icons/artifacts/')) {
    filename = iconPath.slice('/src/icons/artifacts/'.length);
  } else if (iconPath.startsWith('@/icons/artifacts/')) {
    filename = iconPath.slice('@/icons/artifacts/'.length);
  } else if (iconPath.startsWith('/icons/artifacts/')) {
    filename = iconPath.slice('/icons/artifacts/'.length);
  } else {
    // Fallback: try to extract filename from any path
    const parts = iconPath.split('/');
    filename = parts[parts.length - 1] || iconPath;
  }

  // Map filename to imported image
  const artifactMap: Record<string, string> = {
    'rusty_coil.png': images.artifacts.rusty_coil,
    'baisc_targeting_system.png': images.artifacts.baisc_targeting_system,
    'lucky_charm.png': images.artifacts.lucky_charm,
    'alien_head.png': images.artifacts.alien_head,
    'battery.png': images.artifacts.battery,
    'cookie.png': images.artifacts.cookie,
    'water_bottle.png': images.artifacts.water_bottle,
    'small_sized_meteor.png': images.artifacts.small_sized_meteor,
    'alien_power_core.png': images.artifacts.alien_power_core,
    'enhance_capacitor.png': images.artifacts.enhance_capacitor,
    'quantum_processor.png': images.artifacts.quantum_processor,
    'anxiety_pills.png': images.artifacts.anxiety_pills,
    'gold_bar.png': images.artifacts.gold_bar,
    'magnetizer.png': images.artifacts.magnetizer,
    'sattelite.png': images.artifacts.sattelite,
    'strange_potion.png': images.artifacts.strange_potion,
    'strange_key.png': images.artifacts.strange_key,
    'lolipop.png': images.artifacts.lolipop,
    'credit_card.png': images.artifacts.credit_card,
    'moon.png': images.artifacts.moon,
    'plasma_reactor.png': images.artifacts.plasma_reactor,
    'temporal_accelerator.png': images.artifacts.temporal_accelerator,
    'fortune_fragment.png': images.artifacts.fortune_fragment,
    'adrenaline_injection.png': images.artifacts.adrenaline_injection,
    'black_hole.png': images.artifacts.black_hole,
    'galaxy_spiral.png': images.artifacts.galaxy_spiral,
    'nuke.png': images.artifacts.nuke,
    'heart_of_dying_star.png': images.artifacts.heart_of_dying_star,
    'infinity_cristals.png': images.artifacts.infinity_cristals,
    'cosmic_harmonizer.png': images.artifacts.cosmic_harmonizer,
    'constelation_map.png': images.artifacts.constelation_map,
  };

  // Return mapped image or fallback to original path
  return artifactMap[filename] || iconPath;
}
