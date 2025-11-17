# Game Configuration System

## Overview

The Game Configuration System (`GameConfig`) is a professional, centralized system for tuning all gameplay values in your clicker game. It allows you to precisely control gameplay flow without touching game logic code.

## Features

- **Centralized Configuration**: All game balancing values in one place
- **Type-Safe**: Full TypeScript support with IntelliSense
- **Easy to Modify**: Change values without understanding complex game logic
- **JSON Support**: Optional JSON file loading for external tuning
- **Optimized**: Zero runtime overhead - values are accessed directly
- **Organized**: Values grouped by system (upgrades, enemies, missions, etc.)

## Quick Start

### Using Default Configuration

Simply import and use the config:

```typescript
import { Config } from './core/GameConfig';

// Access values directly
const baseDamage = Config.upgrades.baseDamage;
const comboTimeout = Config.combo.timeout;
const bossHpMultiplier = Config.enemies.boss.hpMultiplier;
```

### Loading Custom Configuration from JSON

```typescript
import { GameConfig } from './core/GameConfig';
import customConfig from './config/custom-balancing.json';

// Load custom configuration (merges with defaults)
GameConfig.loadFromJson(customConfig);

// Now use Config as normal
import { Config } from './core/GameConfig';
const myValue = Config.upgrades.baseDamage;
```

### Resetting to Defaults

```typescript
import { GameConfig } from './core/GameConfig';

GameConfig.reset(); // Resets to default configuration
```

## Configuration Structure

### Upgrades (`Config.upgrades`)

Controls upgrade system values:

- `baseDamage`: Base damage value (default: 1)
- `damagePerLevel`: Damage increase per level (default: 0.1 = 10%)
- `costScaling`: Cost scaling factors
- `speedScaling`: Attack speed scaling
- `critChance`: Critical hit configuration
- `passiveGeneration`: Passive point generation
- `cosmicKnowledge`: Cost reduction system

**Example Tuning:**
```typescript
// Make damage scale faster
Config.upgrades.damagePerLevel = 0.15; // 15% per level

// Make upgrades cheaper
Config.upgrades.costScaling.exponentialFactor = 1.1; // 10% instead of 15%
```

### Ascension (`Config.ascension`)

Controls prestige/ascension system:

- `minLevelRequired`: Minimum level to ascend (default: 100)
- `prestigePointCalculation`: Formulas for calculating prestige points
- `upgrades`: All ascension upgrade configurations
- `unspentPPMultiplier`: Income boost from unspent prestige points
- `costScaling`: Prestige upgrade cost scaling

**Example Tuning:**
```typescript
// Make ascending easier
Config.ascension.minLevelRequired = 75;

// Increase prestige point gains
Config.ascension.prestigePointCalculation.baseScaling.formulaBase = 5; // Was 3

// Make ascension upgrades cheaper
Config.ascension.upgrades.damage.costPerLevel = 0.5; // Was 1
```

### Enemies (`Config.enemies`)

Controls enemy types and scaling:

- `types`: Configuration for each enemy type (normal, scout, tank, healer, etc.)
- `hpScaling`: HP scaling formulas and tiers
- `boss`: Boss battle configuration
- `xpScaling`: XP reduction at high levels

**Example Tuning:**
```typescript
// Make enemies easier
Config.enemies.hpScaling.baseHp = 100; // Was 120

// Increase special enemy spawn rates
Config.enemies.types.scout.spawnWeight.max = 0.5; // Was 0.42

// Make bosses easier
Config.enemies.boss.hpMultiplier = 15; // Was 18
Config.enemies.boss.nerfFactor = 0.7; // Was 0.65 (higher = easier)
```

### Missions (`Config.missions`)

Controls mission system:

- `regular`: Regular mission count
- `daily`: Daily mission configuration
- `templates`: Mission template configurations

**Example Tuning:**
```typescript
// Increase mission rewards
Config.missions.templates.clicks.pointsMultiplier = 750; // Was 500

// Make missions easier
Config.missions.templates.kills.targetMultiplier = 2; // Was 3 (lower = easier)

// Increase daily mission count
Config.missions.daily.count = 5; // Was 3
```

### Combo (`Config.combo`)

Controls combo system:

- `baseMultiplier`: Combo multiplier per hit (default: 0.0005)
- `timeout`: Time before combo resets in seconds (default: 10.0)
- `maxMultiplier`: Maximum combo multiplier (null = unlimited)
- `colorThresholds`: Color thresholds for visual display

**Example Tuning:**
```typescript
// Make combos more powerful
Config.combo.baseMultiplier = 0.001; // Double the effect

// Make combos last longer
Config.combo.timeout = 15.0; // Was 10.0

// Cap combos at 2x damage
Config.combo.maxMultiplier = 2.0;
```

### Progression (`Config.progression`)

Controls level progression:

- `xp`: XP requirement configuration
- `levelCap`: Maximum level (null = unlimited)

**Example Tuning:**
```typescript
// Make leveling faster
Config.progression.xp.growthRate = 1.08; // Was 1.1 (lower = faster)

// Reduce XP softcaps (less XP reduction at high levels)
Config.progression.xp.softcaps[0].multiplier = 0.95; // Was 0.9
```

### Power-Ups (`Config.powerUps`)

Controls power-up effects:

- `damageBoost`: Damage boost configuration
- `speedBoost`: Speed boost configuration
- `multishot`: Multishot configuration

**Example Tuning:**
```typescript
// Make power-ups more powerful
Config.powerUps.damageBoost.multiplier = 3; // Was 2

// Make power-ups last longer
Config.powerUps.damageBoost.duration = 60; // Was 30 seconds
```

### Visual (`Config.visual`)

Controls visual effects:

- `combo`: Combo UI configuration

**Example Tuning:**
```typescript
// Change combo bar size
Config.visual.combo.bar.width = 150; // Was 120
```

## JSON Configuration File

You can create a JSON file to override specific values without modifying TypeScript code. This is especially useful for:

- Game balancing iterations
- A/B testing different configurations
- Player-specific difficulty modes
- Hot-fixing balance issues

### Example JSON File

```json
{
  "upgrades": {
    "damagePerLevel": 0.12
  },
  "enemies": {
    "boss": {
      "hpMultiplier": 16
    }
  },
  "combo": {
    "timeout": 12.0
  }
}
```

Only the values you specify will override defaults - everything else remains unchanged.

### Loading JSON Configuration

**Option 1: At Game Startup**

```typescript
// In main.ts or Game.ts
import { GameConfig } from './core/GameConfig';

// Load from JSON file (you'll need to fetch/import it)
fetch('./config/game-balancing.json')
  .then(res => res.json())
  .then(config => {
    GameConfig.loadFromJson(config);
    // Start game...
  });
```

**Option 2: Dynamic Loading**

```typescript
// Allow loading config from localStorage, URL params, etc.
const customConfig = JSON.parse(localStorage.getItem('gameConfig') || '{}');
GameConfig.loadFromJson(customConfig);
```

## Best Practices

### 1. Start with Defaults

Always start with default values and tune incrementally. Drastic changes can break game balance.

### 2. Test Thoroughly

After changing values, test across different game stages:
- Early game (levels 1-50)
- Mid game (levels 50-200)
- Late game (levels 200+)
- Multiple ascensions

### 3. Document Changes

When tuning, document why you changed values:

```typescript
// Changed from 0.1 to 0.12 because early game was too slow
// Player feedback: "Damage feels weak in first 20 levels"
Config.upgrades.damagePerLevel = 0.12;
```

### 4. Use Version Control

Track your configuration changes in git. Consider creating a branch for balance iterations.

### 5. Backup Before Big Changes

Before making major balance changes, save a backup:

```typescript
const backup = Config.getConfig(); // Get full config as object
// Make changes...
// If something breaks:
GameConfig.loadFromJson(backup);
```

## System Integration

The following systems have been updated to use `GameConfig`:

- ✅ `ComboSystem` - Combo multipliers, timeout, visual settings
- ✅ `ColorManager` - HP scaling, boss configuration, XP requirements
- ⏳ Other systems can be updated incrementally

To update other systems, simply replace hardcoded values with `Config` references:

**Before:**
```typescript
const damage = 1 + level * 0.1;
```

**After:**
```typescript
import { Config } from './core/GameConfig';
const damage = Config.upgrades.baseDamage + level * Config.upgrades.damagePerLevel;
```

## Advanced Usage

### Creating Preset Configurations

```typescript
// Easy mode preset
const easyMode = {
  upgrades: { damagePerLevel: 0.15 },
  enemies: { hpScaling: { baseHp: 100 }, boss: { hpMultiplier: 15 } },
  combo: { timeout: 15.0 }
};

// Hard mode preset
const hardMode = {
  upgrades: { damagePerLevel: 0.08 },
  enemies: { hpScaling: { baseHp: 150 }, boss: { hpMultiplier: 20 } },
  combo: { timeout: 7.0 }
};

// Apply preset
GameConfig.loadFromJson(easyMode);
```

### Runtime Configuration Switching

```typescript
// Allow players to switch difficulty
function setDifficulty(level: 'easy' | 'normal' | 'hard') {
  const presets = {
    easy: { /* ... */ },
    normal: {}, // Default
    hard: { /* ... */ }
  };
  
  GameConfig.loadFromJson(presets[level]);
  // Save to localStorage, etc.
}
```

## Troubleshooting

### Values Not Changing

1. Make sure you're loading the config before systems initialize
2. Check that you're importing `Config` from the singleton instance
3. Verify JSON syntax if using JSON files

### Type Errors

All configuration values are strongly typed. If you get type errors:
1. Check the interface definitions in `GameConfig.ts`
2. Ensure JSON values match expected types
3. Use TypeScript's type checking to catch issues early

### Performance

The `Config` system has zero runtime overhead - values are accessed directly like regular object properties. There's no function call overhead or dynamic lookups.

## Reference

See `src/core/GameConfig.ts` for the complete type definitions and default values.

See `src/core/GameConfig.example.json` for a complete JSON example.

