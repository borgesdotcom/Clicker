import type { GameState, UpgradeConfig, SubUpgrade } from '../types';
import { NumberFormatter } from '../utils/NumberFormatter';
import { t } from '../core/I18n';
import { Config } from '../core/GameConfig';
import { POWERUP_DEFINITIONS } from '../data/PowerupDefinitions';

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
    getShipHullMultiplier: (state: GameState) => number;
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
    getShipHullMultiplier: (state: GameState) => number;
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
    // Clone the definitions so we can modify 'owned' state locally without affecting the source
    this.subUpgrades = POWERUP_DEFINITIONS.map(u => ({ ...u }));
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
    // But if ship hull is active, it increases by +2 per level instead
    let damagePerLevel = 1;
    if (this.ascensionSystem) {
      const hullLevel = state.prestigeUpgrades?.prestige_ship_hull ?? 0;
      if (hullLevel > 0) {
        damagePerLevel = 2; // Double the increase per level when hull is active
      }
    }
    let damage = this.basePoints + state.pointMultiplierLevel * damagePerLevel;

    // Apply ship hull multiplier (doubles base damage per level)
    if (this.ascensionSystem) {
      const hullMultiplier = this.ascensionSystem.getShipHullMultiplier(state);
      damage *= hullMultiplier;
      
      // Apply unspent prestige points multiplier (1% per unspent PP)
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
