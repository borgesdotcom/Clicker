import type { SaveData, GameState } from '../types';
import { clamp } from '../math/rng';

const SAVE_KEY = 'alien-clicker-save';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Save {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  static save(state: GameState): void {
    const saveData: SaveData = {
      points: state.points,
      shipsCount: state.shipsCount,
      attackSpeedLevel: state.attackSpeedLevel,
      autoFireUnlocked: state.autoFireUnlocked,
      pointMultiplierLevel: state.pointMultiplierLevel,
      critChanceLevel: state.critChanceLevel,
      resourceGenLevel: state.resourceGenLevel,
      xpBoostLevel: state.xpBoostLevel,
      level: state.level,
      experience: state.experience,
      subUpgrades: state.subUpgrades,
      achievements: state.achievements,
      stats: state.stats,
      prestigeLevel: state.prestigeLevel,
      prestigePoints: state.prestigePoints,
      prestigeUpgrades: state.prestigeUpgrades,
      blockedOnBossLevel: state.blockedOnBossLevel,
      // v3.0: New upgrades
      mutationEngineLevel: state.mutationEngineLevel,
      energyCoreLevel: state.energyCoreLevel,
      cosmicKnowledgeLevel: state.cosmicKnowledgeLevel,
      discoveredUpgrades: state.discoveredUpgrades,
      // Ascension tracking
      highestLevelReached: state.highestLevelReached,
      // Auto-buy toggle
      autoBuyEnabled: state.autoBuyEnabled ?? false,
      // Offline progress tracking
      lastPlayTime: Date.now(),
      // Visual customization
      selectedThemes: state.selectedThemes,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save:', error);
      // Show user-friendly error notification if possible
      if (typeof window !== 'undefined' && window.game) {
        try {
          // Try to show notification if game is available
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const game = window.game as any;
          if (game.notificationSystem?.show) {
            game.notificationSystem.show(
              '⚠️ Failed to save game data. Your progress may not be saved.',
              'warning',
              5000,
            );
          }
        } catch {
          // Ignore notification errors
        }
      }
    }
  }

  static load(): GameState {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        const validatedState = Save.validate(data);

        // If migration changed the state (points, auto-buy, or prestigeUpgrades), save immediately
        const pointsChanged =
          validatedState.prestigePoints !== (data.prestigePoints ?? 0);
        const autoBuyChanged =
          validatedState.autoBuyEnabled !== (data.autoBuyEnabled ?? false);
        // Check if prestigeUpgrades changed (e.g., auto_buy_unlock was fixed)
        const prestigeUpgradesChanged =
          JSON.stringify(validatedState.prestigeUpgrades ?? {}) !==
          JSON.stringify(data.prestigeUpgrades ?? {});
        if (pointsChanged || autoBuyChanged || prestigeUpgradesChanged) {
          // Save the migrated state immediately
          Save.save(validatedState);
        }

        return validatedState;
      }
    } catch (error) {
      console.error('Failed to load save:', error);
    }
    return Save.getDefault();
  }

  /**
   * Get the last play time from save data
   */
  static getLastPlayTime(): number | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as SaveData;
        return data.lastPlayTime ?? null;
      }
    } catch (error) {
      console.error('Failed to load last play time:', error);
    }
    return null;
  }

  /**
   * Export save data as a JSON string
   */
  static export(): string | null {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return saved;
      }
    } catch (error) {
      console.error('Failed to export save:', error);
    }
    return null;
  }

  /**
   * Import save data from JSON string
   * Validates, formats, and saves the data properly
   * @throws Error if import fails
   */
  static import(saveDataString: string): void {
    try {
      const data = JSON.parse(saveDataString) as SaveData;
      // Validate the data (this converts SaveData to GameState)
      const validatedState = Save.validate(data);

      // Convert validated GameState back to SaveData format for storage
      // This ensures all fields are properly formatted and no data is lost
      const saveData: SaveData = {
        points: validatedState.points,
        shipsCount: validatedState.shipsCount,
        attackSpeedLevel: validatedState.attackSpeedLevel,
        autoFireUnlocked: validatedState.autoFireUnlocked,
        pointMultiplierLevel: validatedState.pointMultiplierLevel,
        critChanceLevel: validatedState.critChanceLevel,
        resourceGenLevel: validatedState.resourceGenLevel,
        xpBoostLevel: validatedState.xpBoostLevel,
        level: validatedState.level,
        experience: validatedState.experience,
        subUpgrades: validatedState.subUpgrades,
        achievements: validatedState.achievements,
        stats: validatedState.stats,
        prestigeLevel: validatedState.prestigeLevel,
        prestigePoints: validatedState.prestigePoints,
        prestigeUpgrades: validatedState.prestigeUpgrades,
        blockedOnBossLevel: validatedState.blockedOnBossLevel,
        // v3.0: New upgrades
        mutationEngineLevel: validatedState.mutationEngineLevel,
        energyCoreLevel: validatedState.energyCoreLevel,
        cosmicKnowledgeLevel: validatedState.cosmicKnowledgeLevel,
        discoveredUpgrades: validatedState.discoveredUpgrades,
        // Ascension tracking
        highestLevelReached: validatedState.highestLevelReached,
        // Auto-buy toggle
        autoBuyEnabled: validatedState.autoBuyEnabled ?? false,
        // Visual customization
        selectedThemes: validatedState.selectedThemes,
        // Preserve lastPlayTime from imported data if it exists, otherwise use current time
        lastPlayTime: data.lastPlayTime ?? Date.now(),
      };

      // Save the properly formatted data
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      } catch (storageError) {
        throw new Error(
          'Failed to save imported data. Your browser may have storage restrictions.',
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to import save:', error);

      // Provide more specific error messages
      if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        throw new Error(
          'Invalid save file format. Please ensure the file is a valid JSON file.',
        );
      }
      if (
        errorMessage.includes('localStorage') ||
        errorMessage.includes('storage')
      ) {
        throw new Error(
          'Failed to save imported data. Please check your browser storage settings.',
        );
      }
      if (error instanceof Error) {
        throw error; // Re-throw the original error if it's already an Error
      }
      throw new Error(
        'Failed to import save data. Please check that the file is valid.',
      );
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Failed to clear save:', error);
    }
  }

  private static validate(data: SaveData): GameState {
    const defaultStats = Save.getDefaultStats();
    const prestigeLevel = clamp(data.prestigeLevel ?? 0, 0, 1000);
    const prestigePoints = clamp(data.prestigePoints ?? 0, 0, 1e15);
    // Ensure prestigeUpgrades is properly initialized as an object
    // Deep clone to avoid mutation issues and preserve all upgrade levels
    const prestigeUpgrades: Record<string, number> = data.prestigeUpgrades
      ? { ...data.prestigeUpgrades }
      : {};
    const highestLevelReached = data.highestLevelReached;

    // Migration: Fix auto-buy unlock state
    // Ensure auto_buy_unlock level is properly validated and preserved
    let autoBuyEnabled = data.autoBuyEnabled ?? false;

    // Get and validate auto_buy_unlock level
    // Important: Preserve the value from save data if it exists
    const savedAutoBuyLevel = data.prestigeUpgrades?.auto_buy_unlock;
    let autoBuyUnlockLevel: number;

    if (savedAutoBuyLevel !== undefined && savedAutoBuyLevel !== null) {
      // Value exists in save - validate it's a number between 0 and 1
      autoBuyUnlockLevel = Math.max(
        0,
        Math.min(1, Number(savedAutoBuyLevel) || 0),
      );
      prestigeUpgrades.auto_buy_unlock = autoBuyUnlockLevel;
    } else {
      // Not in save data - default to 0 (not purchased)
      autoBuyUnlockLevel = 0;
      // Only set to 0 if the object exists, otherwise it will be set when purchased
      if (data.prestigeUpgrades) {
        prestigeUpgrades.auto_buy_unlock = 0;
      }
    }

    // If upgrade is purchased (level >= 1), ensure auto-buy feature is unlocked
    // The button unlock state is determined by isAutoBuyUnlocked() which checks level >= 1
    if (autoBuyUnlockLevel >= 1) {
      // Upgrade is purchased - auto-enable on first purchase if not explicitly set
      // This ensures first-time buyers get it enabled, but respects user's choice if they disabled it
      if (data.autoBuyEnabled === undefined || data.autoBuyEnabled === null) {
        autoBuyEnabled = true;
      }
    }

    const state: GameState = {
      points: clamp(data.points ?? 0, 0, 1e15),
      shipsCount: clamp(data.shipsCount ?? 1, 1, 1000),
      attackSpeedLevel: clamp(data.attackSpeedLevel ?? 0, 0, 1000),
      autoFireUnlocked: data.autoFireUnlocked ?? false,
      pointMultiplierLevel: clamp(data.pointMultiplierLevel ?? 0, 0, 1000),
      critChanceLevel: clamp(data.critChanceLevel ?? 0, 0, 1000),
      resourceGenLevel: clamp(data.resourceGenLevel ?? 0, 0, 1000),
      xpBoostLevel: clamp(data.xpBoostLevel ?? 0, 0, 1000),
      level: clamp(data.level ?? 1, 1, 10000),
      experience: clamp(data.experience ?? 0, 0, 1e15),
      subUpgrades: data.subUpgrades ?? {},
      achievements: data.achievements ?? {},
      stats: {
        ...defaultStats,
        ...data.stats,
        criticalHits: data.stats?.criticalHits ?? 0,
        totalPrestige: data.stats?.totalPrestige ?? 0,
        milestonesReached: data.stats?.milestonesReached ?? 0,
      },
      prestigeLevel,
      prestigePoints,
      prestigeUpgrades: { ...prestigeUpgrades }, // Ensure it's a new object reference
      blockedOnBossLevel: data.blockedOnBossLevel ?? null,
      // v3.0: New upgrades
      mutationEngineLevel: data.mutationEngineLevel ?? 0,
      energyCoreLevel: data.energyCoreLevel ?? 0,
      cosmicKnowledgeLevel: data.cosmicKnowledgeLevel ?? 0,
      discoveredUpgrades: data.discoveredUpgrades ?? { ship: true }, // Ship is always visible
      // highestLevelReached should ONLY be set during ascension
      // For players who haven't ascended yet (prestigeLevel === 0), it should be undefined
      // This allows the calculation to give them points from level 100 to their current level
      highestLevelReached,
      autoBuyEnabled,
      selectedThemes: data.selectedThemes,
    };

    // Migration: Fix missing ascension points
    // If player has ascended but has 0 or very few points, and has purchased upgrades,
    // calculate what they should have received and give them the missing points
    if (
      prestigeLevel > 0 &&
      highestLevelReached &&
      highestLevelReached >= 100
    ) {
      // Check if they have prestige upgrades purchased (indicating they should have had points)
      const hasPurchasedUpgrades =
        Object.keys(prestigeUpgrades).length > 0 &&
        Object.values(prestigeUpgrades).some((level) => (level as number) > 0);

      // Estimate minimum points they should have (at least enough to buy one upgrade)
      // If they have upgrades purchased, they definitely should have had points
      // If they have 0 points but have upgrades, they got 0 points on ascension (bug)
      const estimatedMinPoints = hasPurchasedUpgrades ? 50 : 0; // At least 50 to buy auto-buy

      // If they have very few points relative to their level, they might be missing points
      // Calculate what they should have received for their highest level
      if (
        prestigePoints < estimatedMinPoints ||
        (hasPurchasedUpgrades && prestigePoints === 0)
      ) {
        // Calculate points they should have received for levels 100 to highestLevelReached
        let expectedPoints = 0;
        for (let level = 100; level <= highestLevelReached; level++) {
          const levelPast100 = level - 100;
          const levelPoints = Math.floor(5 + Math.pow(levelPast100 / 12, 1.45));
          expectedPoints += levelPoints;
        }

        // Add milestone bonuses
        const milestones = [
          { level: 1000, bonus: 200 },
          { level: 750, bonus: 100 },
          { level: 500, bonus: 50 },
          { level: 250, bonus: 20 },
        ];
        for (const milestone of milestones) {
          if (highestLevelReached >= milestone.level) {
            expectedPoints += milestone.bonus;
          }
        }

        // Add achievement bonus (estimate based on current achievements from data)
        const achievements = data.achievements ?? {};
        const achievementCount = Object.values(achievements).filter(
          (unlocked) => unlocked,
        ).length;
        expectedPoints += Math.floor(achievementCount / 10);

        // Calculate what they spent on upgrades
        let spentOnUpgrades = 0;
        const upgradeCosts: Record<string, number> = {
          auto_buy_unlock: 50,
          prestige_damage: 1,
          prestige_points: 1,
          prestige_xp: 1,
          prestige_crit: 2,
          prestige_passive: 2,
          prestige_speed: 3,
          prestige_starting_level: 5,
          prestige_retain_upgrades: 10,
          prestige_boss_power: 5,
          prestige_combo_boost: 3,
        };

        for (const [upgradeId, cost] of Object.entries(upgradeCosts)) {
          const level = prestigeUpgrades[upgradeId] ?? 0;
          if (level > 0) {
            spentOnUpgrades += cost * level;
          }
        }

        // Calculate missing points
        // If they have upgrades purchased, they must have had at least enough points to buy them
        // So they should have: max(expected points, points spent on upgrades)
        const minimumPointsTheyShouldHave = Math.max(
          expectedPoints,
          spentOnUpgrades,
        );
        const missingPoints = Math.max(
          0,
          minimumPointsTheyShouldHave - spentOnUpgrades - prestigePoints,
        );

        if (missingPoints > 0) {
          // Give them the missing points
          state.prestigePoints = clamp(prestigePoints + missingPoints, 0, 1e15);
          console.log(
            `[Migration] Awarded ${missingPoints} missing prestige points (had ${prestigePoints}, expected ~${expectedPoints}, spent ~${spentOnUpgrades}, should have at least ${minimumPointsTheyShouldHave})`,
          );
        }
      }
    }

    return state;
  }

  private static getDefault(): GameState {
    return {
      points: 0,
      shipsCount: 1,
      attackSpeedLevel: 0,
      autoFireUnlocked: false,
      pointMultiplierLevel: 0,
      critChanceLevel: 0,
      resourceGenLevel: 0,
      xpBoostLevel: 0,
      level: 1,
      experience: 0,
      subUpgrades: {},
      achievements: {},
      stats: Save.getDefaultStats(),
      prestigeLevel: 0,
      prestigePoints: 0,
      prestigeUpgrades: {},
      blockedOnBossLevel: null,
      // v3.0: New upgrades
      mutationEngineLevel: 0,
      energyCoreLevel: 0,
      cosmicKnowledgeLevel: 0,
      discoveredUpgrades: { ship: true }, // Ship is always visible
      highestLevelReached: undefined,
      autoBuyEnabled: false,
      selectedThemes: undefined,
    };
  }

  private static getDefaultStats() {
    return {
      totalClicks: 0,
      totalDamage: 0,
      aliensKilled: 0,
      bossesKilled: 0,
      totalUpgrades: 0,
      totalSubUpgrades: 0,
      maxLevel: 1,
      playTime: 0,
      criticalHits: 0,
      totalPrestige: 0,
      milestonesReached: 0,
    };
  }
}
