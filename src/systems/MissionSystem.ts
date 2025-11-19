import type { Store } from '../core/Store';

export type MissionType =
  | 'clicks'
  | 'damage'
  | 'kills'
  | 'boss_kills'
  | 'upgrades'
  | 'level'
  | 'ships'
  | 'no_damage'
  | 'combo'
  | 'fast_kill';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    points?: number;
    ships?: number;
    xp?: number;
  };
  icon: string;
}

interface MissionTemplate {
  type: MissionType;
  title: string;
  description: (target: number) => string;
  target: (level: number) => number;
  reward: (level: number) => { points?: number; ships?: number; xp?: number };
  icon: string;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'clicks',
    title: 'Click Master',
    description: (target) => `Click ${target.toString()} times`,
    target: (level) => Math.max(100, level * 50),
    reward: (level) => ({
      points: Math.floor(level * level * 500),
      xp: Math.floor(level * 15),
    }),
    icon: '🖱️',
  },
  {
    type: 'damage',
    title: 'Damage Dealer',
    description: (target) => `Deal ${target.toLocaleString()} damage`,
    target: (level) => Math.max(5000, level * 2000),
    reward: (level) => ({
      points: Math.floor(level * level * 750),
      ships: Math.max(1, Math.floor(level / 10)),
    }),
    icon: '⚔️',
  },
  {
    type: 'kills',
    title: 'Alien Hunter',
    description: (target) => `Destroy ${target.toString()} aliens`,
    target: (level) => Math.max(10, level * 3),
    reward: (level) => ({
      points: Math.floor(level * level * 400),
      xp: Math.floor(level * 12),
    }),
    icon: '👾',
  },
  {
    type: 'boss_kills',
    title: 'Boss Slayer',
    description: (target) => `Defeat ${target.toString()} bosses`,
    target: () => 3,
    reward: (level) => ({
      points: Math.floor(level * level * 2500),
      ships: Math.max(2, Math.floor(level / 5)),
    }),
    icon: '🏆',
  },
  {
    type: 'upgrades',
    title: 'Tech Enthusiast',
    description: (target) => `Purchase ${target.toString()} upgrades`,
    target: (level) => Math.max(5, Math.floor(level / 2)),
    reward: (level) => ({
      points: Math.floor(level * level * 600),
    }),
    icon: '🔧',
  },
  {
    type: 'level',
    title: 'Level Up',
    description: (target) => `Reach level ${target.toString()}`,
    target: (level) => level + 5,
    reward: (level) => ({
      points: Math.floor(level * level * 1000),
      xp: Math.floor(level * 30),
    }),
    icon: '⭐',
  },
  {
    type: 'ships',
    title: 'Fleet Commander',
    description: (target) => `Build a fleet of ${target.toString()} ships`,
    target: (level) => Math.max(5, Math.floor(level / 3)),
    reward: (level) => ({
      points: Math.floor(level * level * 1500),
    }),
    icon: '🚀',
  },
  {
    type: 'combo',
    title: 'Combo Master',
    description: (target) => `Achieve a ${target.toString()}x combo`,
    target: (level) => Math.max(10, level * 2),
    reward: (level) => ({
      points: Math.floor(level * level * 1250),
      xp: Math.floor(level * 25),
    }),
    icon: '🔥',
  },
];

export class MissionSystem {
  private missions: Mission[] = [];
  private dailyMissions: Mission[] = [];
  private store: Store;
  private lastDailyReset: number = 0;
  private sessionProgress = {
    clicks: 0,
    damage: 0,
    kills: 0,
    bossKills: 0,
    upgrades: 0,
    maxCombo: 0,
  };
  private onMissionCompleteCallback: ((mission: Mission) => void) | null = null;
  private onDailyResetCallback: (() => void) | null = null;

  constructor(store: Store) {
    this.store = store;
    this.loadProgress();
    this.generateMissions();
    this.checkDailyReset();
  }

  /**
   * Set callback for when a mission is completed
   */
  setOnMissionComplete(callback: (mission: Mission) => void): void {
    this.onMissionCompleteCallback = callback;
  }

  /**
   * Set callback for when daily missions reset
   */
  setOnDailyReset(callback: () => void): void {
    this.onDailyResetCallback = callback;
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved) as {
          missions?: Mission[];
          dailyMissions?: Mission[];
          lastDailyReset?: number;
          sessionProgress?: Record<string, number>;
        };
        this.missions = data.missions ?? [];
        this.dailyMissions = data.dailyMissions ?? [];
        this.lastDailyReset = data.lastDailyReset ?? 0;
        // Session progress is reset each session, so we don't load it
      } catch (e) {
        console.error('Failed to load mission progress:', e);
      }
    }
  }

  private saveProgress(): void {
    const data = {
      missions: this.missions,
      dailyMissions: this.dailyMissions,
      lastDailyReset: this.lastDailyReset,
      sessionProgress: this.sessionProgress,
    };
    localStorage.setItem('missionProgress', JSON.stringify(data));
  }

  private checkDailyReset(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (now - this.lastDailyReset > oneDayMs) {
      const hadDailyMissions = this.dailyMissions.length > 0;
      this.generateDailyMissions();
      this.lastDailyReset = now;
      this.saveProgress();

      // Notify if daily missions were reset (not on first load)
      if (hadDailyMissions && this.onDailyResetCallback) {
        this.onDailyResetCallback();
      }
    }
  }

  private generateMissions(): void {
    if (this.missions.length === 0) {
      const state = this.store.getState();
      const level = state.level;

      // Generate 5 regular missions
      for (let i = 0; i < 5; i++) {
        const templateIndex = i % MISSION_TEMPLATES.length;
        const template = MISSION_TEMPLATES[templateIndex];
        if (!template) continue;
        const target = template.target(level);

        this.missions.push({
          id: `mission_${i.toString()}_${Date.now().toString()}`,
          type: template.type,
          title: template.title,
          description: template.description(target),
          target,
          progress: 0,
          completed: false,
          claimed: false,
          reward: template.reward(level),
          icon: template.icon,
        });
      }
    }
  }

  private generateDailyMissions(): void {
    const state = this.store.getState();
    const level = state.level;

    this.dailyMissions = [];

    // Generate 3 daily missions
    const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
      const template = shuffled[i];
      if (!template) continue;
      const target = template.target(level);

      this.dailyMissions.push({
        id: `daily_${i.toString()}_${Date.now().toString()}`,
        type: template.type,
        title: `[DAILY] ${template.title}`,
        description: template.description(target),
        target,
        progress: 0,
        completed: false,
        claimed: false,
        reward: {
          points: (template.reward(level).points || 0) * 2,
          ships: template.reward(level).ships,
          xp: (template.reward(level).xp || 0) * 2,
        },
        icon: template.icon,
      });
    }
  }

  public trackClick(): void {
    this.sessionProgress.clicks++;
    this.updateMissions('clicks', 1);
  }

  public trackDamage(amount: number): void {
    this.sessionProgress.damage += amount;
    this.updateMissions('damage', amount);
  }

  public trackKill(): void {
    this.sessionProgress.kills++;
    this.updateMissions('kills', 1);
  }

  public trackBossKill(): void {
    this.sessionProgress.bossKills++;
    this.updateMissions('boss_kills', 1);
  }

  public trackUpgrade(): void {
    this.sessionProgress.upgrades++;
    this.updateMissions('upgrades', 1);
  }

  public trackCombo(combo: number): void {
    if (combo > this.sessionProgress.maxCombo) {
      this.sessionProgress.maxCombo = combo;
      this.updateMissions('combo', combo);
    }
  }

  private updateMissions(type: MissionType, value: number): void {
    let updated = false;
    const completedMissions: Mission[] = [];

    // Update regular missions
    for (const mission of this.missions) {
      if (mission.type === type && !mission.completed) {
        if (type === 'combo' || type === 'level' || type === 'ships') {
          mission.progress = value;
        } else {
          mission.progress += value;
        }

        if (mission.progress >= mission.target) {
          mission.completed = true;
          updated = true;
          completedMissions.push(mission);
        }
      }
    }

    // Update daily missions
    for (const mission of this.dailyMissions) {
      if (mission.type === type && !mission.completed) {
        if (type === 'combo' || type === 'level' || type === 'ships') {
          mission.progress = value;
        } else {
          mission.progress += value;
        }

        if (mission.progress >= mission.target) {
          mission.completed = true;
          updated = true;
          completedMissions.push(mission);
        }
      }
    }

    // Trigger callbacks for completed missions
    if (this.onMissionCompleteCallback && completedMissions.length > 0) {
      for (const mission of completedMissions) {
        this.onMissionCompleteCallback(mission);
      }
    }

    if (updated) {
      this.saveProgress();
    }
  }

  public claimReward(missionId: string): boolean {
    const mission = [...this.missions, ...this.dailyMissions].find(
      (m) => m.id === missionId,
    );

    if (!mission || !mission.completed || mission.claimed) {
      return false;
    }

    mission.claimed = true;

    const state = this.store.getState();
    const currentLevel = state.level;

    // Recalculate reward based on current level for better scaling
    const template = MISSION_TEMPLATES.find((t) => t.type === mission.type);
    const actualReward = template
      ? template.reward(currentLevel)
      : mission.reward;

    // For daily missions, double the points and XP
    const isDaily = mission.title.startsWith('[DAILY]');
    const finalReward = {
      points: isDaily
        ? (actualReward.points || 0) * 2
        : actualReward.points || 0,
      ships: actualReward.ships || 0,
      xp: isDaily ? (actualReward.xp || 0) * 2 : actualReward.xp || 0,
    };

    if (finalReward.points > 0) {
      state.points += finalReward.points;
    }
    if (finalReward.ships > 0) {
      state.shipsCount += finalReward.ships;
    }
    if (finalReward.xp > 0) {
      // At level 100, can only gain XP after defeating the boss
      if (state.level === 100 && state.blockedOnBossLevel === 100) {
        // No XP from missions until boss is defeated
      } else {
        state.experience += finalReward.xp;
      }
    }

    this.store.setState(state);
    this.saveProgress();

    return true;
  }

  public getMissions(): Mission[] {
    return this.missions;
  }

  public getDailyMissions(): Mission[] {
    this.checkDailyReset();
    return this.dailyMissions;
  }

  public getCompletedCount(): number {
    return [...this.missions, ...this.dailyMissions].filter(
      (m) => m.completed && !m.claimed,
    ).length;
  }

  public update(): void {
    this.checkDailyReset();

    // Update level and ships missions (these check current state)
    const state = this.store.getState();
    this.updateMissions('level', state.level);
    this.updateMissions('ships', state.shipsCount);
  }
}
