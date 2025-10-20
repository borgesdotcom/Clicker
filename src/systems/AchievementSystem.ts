import type { Achievement, GameState } from '../types';

export class AchievementSystem {
  private achievements: Achievement[] = [];
  private onUnlockCallback?: (achievement: Achievement) => void;

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    this.achievements = [
      // === COMBAT ACHIEVEMENTS ===
      {
        id: 'first_click',
        name: 'First Contact',
        description: 'Click an alien for the first time',
        icon: '👆',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalClicks >= 1,
      },
      {
        id: 'click_master',
        name: 'Click Master',
        description: 'Click 100 times',
        icon: '🖱️',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalClicks >= 100,
      },
      {
        id: 'click_legend',
        name: 'Click Legend',
        description: 'Click 1,000 times',
        icon: '⚡',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalClicks >= 1000,
      },
      {
        id: 'click_god',
        name: 'Click God',
        description: 'Click 10,000 times',
        icon: '👑',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalClicks >= 10000,
      },
      {
        id: 'click_transcendent',
        name: 'Transcendent Clicker',
        description: 'Click 50,000 times',
        icon: '🌟',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalClicks >= 50000,
      },
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Destroy your first alien',
        icon: '💥',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 1,
      },
      {
        id: 'alien_hunter',
        name: 'Alien Hunter',
        description: 'Destroy 50 aliens',
        icon: '🎯',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 50,
      },
      {
        id: 'alien_slayer',
        name: 'Alien Slayer',
        description: 'Destroy 250 aliens',
        icon: '⚔️',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 250,
      },
      {
        id: 'alien_destroyer',
        name: 'Alien Destroyer',
        description: 'Destroy 1,000 aliens',
        icon: '🔥',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 1000,
      },
      {
        id: 'alien_annihilator',
        name: 'Alien Annihilator',
        description: 'Destroy 5,000 aliens',
        icon: '💀',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 5000,
      },
      {
        id: 'alien_apocalypse',
        name: 'Alien Apocalypse',
        description: 'Destroy 10,000 aliens',
        icon: '☠️',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.aliensKilled >= 10000,
      },
      {
        id: 'damage_dealer',
        name: 'Damage Dealer',
        description: 'Deal 10,000 total damage',
        icon: '💪',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalDamage >= 10000,
      },
      {
        id: 'damage_master',
        name: 'Damage Master',
        description: 'Deal 100,000 total damage',
        icon: '🔨',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalDamage >= 100000,
      },
      {
        id: 'damage_overlord',
        name: 'Damage Overlord',
        description: 'Deal 1,000,000 total damage',
        icon: '⚡',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalDamage >= 1000000,
      },
      {
        id: 'damage_deity',
        name: 'Damage Deity',
        description: 'Deal 100,000,000 total damage',
        icon: '🌩️',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalDamage >= 100000000,
      },
      {
        id: 'damage_universe',
        name: 'Universe Destroyer',
        description: 'Deal 1,000,000,000 total damage',
        icon: '💫',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.totalDamage >= 1000000000,
      },
      {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat your first boss',
        icon: '👑',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.bossesKilled >= 1,
      },
      {
        id: 'boss_hunter',
        name: 'Boss Hunter',
        description: 'Defeat 10 bosses',
        icon: '👹',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.bossesKilled >= 10,
      },
      {
        id: 'boss_master',
        name: 'Boss Master',
        description: 'Defeat 50 bosses',
        icon: '🐉',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.bossesKilled >= 50,
      },
      {
        id: 'boss_annihilator',
        name: 'Boss Annihilator',
        description: 'Defeat 100 bosses',
        icon: '👾',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.bossesKilled >= 100,
      },

      // === CRITICAL HIT ACHIEVEMENTS ===
      {
        id: 'first_crit',
        name: 'Lucky Shot',
        description: 'Land your first critical hit',
        icon: '✨',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.criticalHits >= 1,
      },
      {
        id: 'crit_hunter',
        name: 'Crit Hunter',
        description: 'Land 100 critical hits',
        icon: '💎',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.criticalHits >= 100,
      },
      {
        id: 'crit_master',
        name: 'Crit Master',
        description: 'Land 1,000 critical hits',
        icon: '💥',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.criticalHits >= 1000,
      },
      {
        id: 'crit_legend',
        name: 'Crit Legend',
        description: 'Land 10,000 critical hits',
        icon: '⭐',
        category: 'combat',
        unlocked: false,
        check: (state) => state.stats.criticalHits >= 10000,
      },

      // === PROGRESSION ACHIEVEMENTS ===
      {
        id: 'level_5',
        name: 'Novice',
        description: 'Reach level 5',
        icon: '🌟',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 5,
      },
      {
        id: 'level_10',
        name: 'Apprentice',
        description: 'Reach level 10',
        icon: '✨',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 10,
      },
      {
        id: 'level_25',
        name: 'Journeyman',
        description: 'Reach level 25',
        icon: '💫',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 25,
      },
      {
        id: 'level_50',
        name: 'Expert',
        description: 'Reach level 50',
        icon: '🌠',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 50,
      },
      {
        id: 'level_75',
        name: 'Master',
        description: 'Reach level 75',
        icon: '⭐',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 75,
      },
      {
        id: 'level_100',
        name: 'Legendary',
        description: 'Reach level 100',
        icon: '🏆',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 100,
      },
      {
        id: 'level_150',
        name: 'Transcendent',
        description: 'Reach level 150',
        icon: '👑',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 150,
      },
      {
        id: 'level_200',
        name: 'Ascended',
        description: 'Reach level 200',
        icon: '🌌',
        category: 'progression',
        unlocked: false,
        check: (state) => state.level >= 200,
      },

      // === COLLECTION ACHIEVEMENTS (Ships) ===
      {
        id: 'first_ship',
        name: 'Fleet Commander',
        description: 'Recruit your first additional ship',
        icon: '🚀',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 2,
      },
      {
        id: 'small_fleet',
        name: 'Small Fleet',
        description: 'Command 5 ships',
        icon: '🛸',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 5,
      },
      {
        id: 'armada',
        name: 'Armada',
        description: 'Command 10 ships',
        icon: '🌌',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 10,
      },
      {
        id: 'space_force',
        name: 'Space Force',
        description: 'Command 20 ships',
        icon: '🌠',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 20,
      },
      {
        id: 'galactic_empire',
        name: 'Galactic Empire',
        description: 'Command 30 ships',
        icon: '👑',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 30,
      },
      {
        id: 'armada_supreme',
        name: 'Supreme Armada',
        description: 'Command 50 ships',
        icon: '💫',
        category: 'collection',
        unlocked: false,
        check: (state) => state.shipsCount >= 50,
      },

      // === UPGRADE ACHIEVEMENTS ===
      {
        id: 'first_upgrade',
        name: 'Innovator',
        description: 'Purchase your first upgrade',
        icon: '🔧',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalUpgrades >= 1,
      },
      {
        id: 'upgrade_enthusiast',
        name: 'Upgrade Enthusiast',
        description: 'Purchase 25 upgrades',
        icon: '⚙️',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalUpgrades >= 25,
      },
      {
        id: 'upgrade_master',
        name: 'Upgrade Master',
        description: 'Purchase 100 upgrades',
        icon: '🔩',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalUpgrades >= 100,
      },
      {
        id: 'upgrade_legend',
        name: 'Upgrade Legend',
        description: 'Purchase 500 upgrades',
        icon: '🛠️',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalUpgrades >= 500,
      },
      {
        id: 'upgrade_deity',
        name: 'Upgrade Deity',
        description: 'Purchase 1,000 upgrades',
        icon: '🏭',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalUpgrades >= 1000,
      },
      {
        id: 'first_subupgrade',
        name: 'Researcher',
        description: 'Unlock your first special technology',
        icon: '🔬',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalSubUpgrades >= 1,
      },
      {
        id: 'tech_collector',
        name: 'Tech Collector',
        description: 'Unlock 5 special technologies',
        icon: '📡',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalSubUpgrades >= 5,
      },
      {
        id: 'tech_master',
        name: 'Tech Master',
        description: 'Unlock 10 special technologies',
        icon: '🛰️',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalSubUpgrades >= 10,
      },
      {
        id: 'tech_legend',
        name: 'Tech Legend',
        description: 'Unlock 20 special technologies',
        icon: '🔭',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalSubUpgrades >= 20,
      },
      {
        id: 'tech_god',
        name: 'Technology God',
        description: 'Unlock all special technologies',
        icon: '🌐',
        category: 'collection',
        unlocked: false,
        check: (state) => state.stats.totalSubUpgrades >= 33,
      },

      // === WEALTH ACHIEVEMENTS ===
      {
        id: 'first_thousand',
        name: 'Starter Capital',
        description: 'Accumulate 1,000 points',
        icon: '💰',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 1000,
      },
      {
        id: 'ten_thousand',
        name: 'Entrepreneur',
        description: 'Accumulate 10,000 points',
        icon: '💎',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 10000,
      },
      {
        id: 'hundred_thousand',
        name: 'Wealthy',
        description: 'Accumulate 100,000 points',
        icon: '💵',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 100000,
      },
      {
        id: 'million',
        name: 'Millionaire',
        description: 'Accumulate 1,000,000 points',
        icon: '🤑',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 1000000,
      },
      {
        id: 'ten_million',
        name: 'Tycoon',
        description: 'Accumulate 10,000,000 points',
        icon: '👑',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 10000000,
      },
      {
        id: 'hundred_million',
        name: 'Magnate',
        description: 'Accumulate 100,000,000 points',
        icon: '💫',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 100000000,
      },
      {
        id: 'billion',
        name: 'Billionaire',
        description: 'Accumulate 1,000,000,000 points',
        icon: '🌟',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.points >= 1000000000,
      },

      // === TIME-BASED ACHIEVEMENTS ===
      {
        id: 'five_minutes',
        name: 'Getting Started',
        description: 'Play for 5 minutes',
        icon: '⏱️',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 300,
      },
      {
        id: 'thirty_minutes',
        name: 'Committed',
        description: 'Play for 30 minutes',
        icon: '⏰',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 1800,
      },
      {
        id: 'one_hour',
        name: 'Dedicated',
        description: 'Play for 1 hour',
        icon: '🕐',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 3600,
      },
      {
        id: 'three_hours',
        name: 'Addicted',
        description: 'Play for 3 hours',
        icon: '⌚',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 10800,
      },
      {
        id: 'ten_hours',
        name: 'Obsessed',
        description: 'Play for 10 hours',
        icon: '🕰️',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 36000,
      },
      {
        id: 'one_day',
        name: 'No Life',
        description: 'Play for 24 hours (total)',
        icon: '📅',
        category: 'progression',
        unlocked: false,
        check: (state) => state.stats.playTime >= 86400,
      },

      // === MASTERY ACHIEVEMENTS (specific upgrade levels) ===
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Reach Attack Speed level 20',
        icon: '💨',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.attackSpeedLevel >= 20,
      },
      {
        id: 'speed_god',
        name: 'Speed God',
        description: 'Reach Attack Speed level 50',
        icon: '⚡',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.attackSpeedLevel >= 50,
      },
      {
        id: 'damage_king',
        name: 'Damage King',
        description: 'Reach Damage Amplifier level 20',
        icon: '👑',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.pointMultiplierLevel >= 20,
      },
      {
        id: 'damage_emperor',
        name: 'Damage Emperor',
        description: 'Reach Damage Amplifier level 50',
        icon: '🔥',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.pointMultiplierLevel >= 50,
      },
      {
        id: 'crit_specialist',
        name: 'Crit Specialist',
        description: 'Reach Critical Strike level 20',
        icon: '✨',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.critChanceLevel >= 20,
      },
      {
        id: 'passive_master',
        name: 'Passive Master',
        description: 'Reach Passive Income level 30',
        icon: '🏭',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.resourceGenLevel >= 30,
      },
      {
        id: 'scholar',
        name: 'Scholar',
        description: 'Reach Knowledge Core level 25',
        icon: '📚',
        category: 'mastery',
        unlocked: false,
        check: (state) => state.xpBoostLevel >= 25,
      },
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Have all main upgrades at level 10 or higher',
        icon: '⚖️',
        category: 'mastery',
        unlocked: false,
        check: (state) => 
          state.shipsCount >= 10 && 
          state.attackSpeedLevel >= 10 && 
          state.pointMultiplierLevel >= 10 &&
          state.critChanceLevel >= 10 &&
          state.resourceGenLevel >= 10 &&
          state.xpBoostLevel >= 10,
      },
      {
        id: 'well_rounded',
        name: 'Well Rounded',
        description: 'Have all main upgrades at level 25 or higher',
        icon: '🎯',
        category: 'mastery',
        unlocked: false,
        check: (state) => 
          state.shipsCount >= 25 && 
          state.attackSpeedLevel >= 25 && 
          state.pointMultiplierLevel >= 25 &&
          state.critChanceLevel >= 25 &&
          state.resourceGenLevel >= 25 &&
          state.xpBoostLevel >= 25,
      },

      // === SECRET ACHIEVEMENTS ===
      {
        id: 'secret_patience',
        name: 'Patience is a Virtue',
        description: 'Wait without clicking for 30 seconds',
        icon: '🧘',
        category: 'secret',
        unlocked: false,
        hidden: true,
        check: (state) => state.stats.totalClicks === 0 && state.stats.playTime >= 30,
      },
      {
        id: 'secret_speed',
        name: 'Speed Clicker',
        description: 'Click 100 times in the first minute',
        icon: '💨',
        category: 'secret',
        unlocked: false,
        hidden: true,
        check: (state) => state.stats.totalClicks >= 100 && state.stats.playTime <= 60,
      },
      {
        id: 'secret_cosmic',
        name: 'Cosmic Ascension',
        description: 'Unlock the Cosmic Ascension Protocol',
        icon: '🌌',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['cosmic_ascension'] === true,
      },
      {
        id: 'secret_singularity',
        name: 'Singularity',
        description: 'Unlock the Singularity Power Core',
        icon: '⚫',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['singularity_core'] === true,
      },
      {
        id: 'secret_meaning',
        name: 'The Meaning of Life',
        description: 'Unlock the Meaning of Life upgrade',
        icon: '🔮',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['meaning_of_life'] === true,
      },
      {
        id: 'secret_perfect',
        name: 'Perfection',
        description: 'Unlock all special technologies',
        icon: '✨',
        category: 'secret',
        unlocked: false,
        hidden: true,
        check: (state) => state.stats.totalSubUpgrades >= 33,
      },
      {
        id: 'secret_coffee',
        name: 'Caffeine Addict',
        description: 'Unlock the Crew Coffee Machine',
        icon: '☕',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['coffee_machine'] === true,
      },
      {
        id: 'secret_answer',
        name: '42',
        description: 'Unlock the Answer to Everything',
        icon: '4️⃣2️⃣',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['answer_to_everything'] === true,
      },
      {
        id: 'secret_dragon',
        name: 'Dragon Tamer',
        description: 'Unlock the Dragon Egg',
        icon: '🥚',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['dragon_egg'] === true,
      },
      {
        id: 'secret_gauntlet',
        name: 'Perfectly Balanced',
        description: 'Unlock the Infinity Gauntlet (Replica)',
        icon: '💍',
        category: 'secret',
        unlocked: false,
        check: (state) => state.subUpgrades['infinity_gauntlet'] === true,
      },
    ];
  }

  setOnUnlock(callback: (achievement: Achievement) => void): void {
    this.onUnlockCallback = callback;
  }

  checkAchievements(state: GameState): void {
    for (const achievement of this.achievements) {
      if (!achievement.unlocked && achievement.check(state)) {
        achievement.unlocked = true;
        state.achievements[achievement.id] = true;
        if (this.onUnlockCallback) {
          this.onUnlockCallback(achievement);
        }
      }
    }
  }

  updateFromState(state: GameState): void {
    for (const achievement of this.achievements) {
      achievement.unlocked = state.achievements[achievement.id] ?? false;
    }
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getTotalCount(): number {
    return this.achievements.length;
  }

  getProgress(): number {
    return (this.getUnlockedCount() / this.getTotalCount()) * 100;
  }
}
