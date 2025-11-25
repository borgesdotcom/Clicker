/**
 * Managers barrel export
 * Managers are responsible for coordinating game systems and handling complex logic
 */

export { BossManager } from './BossManager';
export type { BossManagerDependencies, BossManagerCallbacks } from './BossManager';
export { CombatManager } from './CombatManager';
export type { CombatManagerDependencies, CombatManagerCallbacks } from './CombatManager';
export { InputManager } from './InputManager';
export type { InputManagerDependencies, InputManagerCallbacks } from './InputManager';
export { RenderManager } from './RenderManager';
export type {
  RenderManagerDependencies,
  RenderEntities,
  RenderState,
} from './RenderManager';
export { EntityManager } from './EntityManager';
export type {
  EntityManagerDependencies,
  EntityManagerCallbacks,
} from './EntityManager';
export { GodModeManager } from './GodModeManager';
export type {
  GodModeManagerDependencies,
  GodModeManagerCallbacks,
  GodModeAgent,
} from './GodModeManager';

