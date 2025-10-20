# Alien Ball Clicker

A minimalist black-and-white incremental clicker game built with TypeScript and HTML5 Canvas. Break alien balls, level up, and fight massive bosses!

## Overview

Click alien balls to fire volleys of lasers from your ships. Each ball has HP based on its color - the darker the ball, the tougher it is! Break balls to gain experience and level up. Every 5 levels, face off against a massive boss ball in an epic showdown! Watch traveling lasers hit their targets, ripples emanate from impacts, and enjoy smooth transition effects.

## Controls

### Normal Mode
- **Click/Tap the Ball**: Fire a volley from all ships at the ball
- **Shop Panel**: Use points to purchase upgrades
- **Reset Button**: Clear all progress and start over

### Boss Mode (Asteroids-style)
- **Arrow Keys** or **WASD**: Rotate and thrust your ship
- **Spacebar**: Fire lasers at the boss
- Wrap around screen edges like classic Asteroids!

## Game Features

### Breaking Balls & Progression
- **HP System**: Each ball has HP that depletes when hit by lasers
- **Color-Coded Difficulty**: Ball color determines HP - darker = more HP
- **Level Up**: Breaking a ball grants experience. Fill the level bar to advance!
- **Experience Bar**: Track your progress at the bottom of the screen

### Boss Fights (Asteroids-Style!)
- **Every 5th Level**: Face a giant boss ball (levels 5, 10, 15, etc.)
- **Player Control**: Take direct control of your ship like in classic Asteroids!
- **Moving Target**: Boss balls bounce around the arena - chase them down!
- **Physics-Based Movement**: Inertia, rotation, and thrust mechanics
- **Screen Wrapping**: Fly off one edge and appear on the other
- **Manual Shooting**: Fire lasers with spacebar - no auto-fire in boss mode
- **Double Points**: Boss attacks give 2x points
- **Epic Transitions**: Watch mesmerizing ripple transitions between modes

### Combat
- **Traveling Lasers**: Lasers smoothly travel from ships to targets
- **Damage on Impact**: Balls take damage when lasers arrive, not when fired
- **Main Ship**: Your first ship is larger and outlined - it's the flagship!
- **Visual Feedback**: Flash effects, screen shake, and HP bars

## Upgrades

### 1. Buy Ship
- **Cost**: `10 × 1.15^n` where `n` = current ship count
- **Effect**: Adds one ship to your fleet. Each ship fires lasers on every volley (manual and auto).
- **Ships**: Evenly distributed in a ring around the ball.

### 2. Attack Speed
- **Cost**: `50 × 1.25^level`
- **Effect**: Reduces auto-fire cooldown: `1000ms × 0.95^level`, minimum 120ms.
- **Note**: Manual clicks always fire instantly; this only affects auto-fire rate.

### 3. Auto-Fire Module
- **Cost**: `150` (one-time purchase)
- **Effect**: Unlocks automatic firing. Ships fire independently on cooldown without clicking.

### 4. Point Multiplier
- **Cost**: `100 × 1.3^level`
- **Effect**: Increases points per laser hit.
- **Formula**: `pointsPerHit = 1 × (1 + 0.15 × level)`

## Game Mechanics

- **Scoring**: Points are awarded when lasers hit (not when they're fired).
- **HP System**: Each ball has HP. Break it to gain experience and spawn a new ball.
- **Level Progression**: Experience required scales linearly: `10 + (level × 5)`
- **Color Tiers**: 8 color tiers with increasing HP (white: 10 HP → darkest gray: 260 HP)
- **Boss Mechanics**: Bosses move around and have massive HP pools. Player-controlled ship in Asteroids-style gameplay!
- **Laser Origin**: Lasers fire from the front (tip) of ships for accurate aiming
- **Ripples**: Visual wave effects spawn from targets on impact.
- **Impact Flash**: Balls flash white when hit.
- **Screen Shake**: Subtle shake effect when firing large volleys (5+ ships).
- **Persistence**: Game state auto-saves every 3 seconds and on page unload.

## Save Data

Stored in `localStorage` under key `alien-clicker-save`.

### Save Format
```json
{
  "points": number,
  "shipsCount": number,
  "attackSpeedLevel": number,
  "autoFireUnlocked": boolean,
  "pointMultiplierLevel": number,
  "level": number,
  "experience": number
}
```

### Reset Save
1. Use the "Reset Save" button in the shop panel, or
2. Open browser DevTools console and run: `localStorage.removeItem('alien-clicker-save')`

## Setup & Development

### Prerequisites
- Node.js 16+ and npm

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs Vite dev server on `http://localhost:3000` with hot reload.

### Production Build
```bash
npm run build
```
Outputs optimized build to `dist/` directory.

### Preview Build
```bash
npm run preview
```
Serves the production build locally for testing.

### Linting & Formatting
```bash
npm run lint
npm run format
```

## Tuning Guide

### Upgrade Costs (`src/systems/UpgradeSystem.ts`)
- **Ship Cost**: `10 * 1.15^n` (lines 11, 13)
  - Change `10` (base cost) or `1.15` (growth factor)
- **Attack Speed Cost**: `50 * 1.25^level` (lines 28, 30)
  - Change `50` (base cost) or `1.25` (growth factor)
- **Auto-Fire Cost**: `150` (flat) (line 46)
  - Change `150` to adjust unlock price
- **Point Multiplier Cost**: `100 * 1.3^level` (lines 61, 63)
  - Change `100` (base cost) or `1.3` (growth factor)

### Upgrade Effects (`src/systems/UpgradeSystem.ts`)
- **Base Points**: `basePoints = 1` (line 4)
  - Increase for more generous scoring
- **Multiplier Growth**: `1 + 0.15 * level` (line 78)
  - Change `0.15` to adjust multiplier power per level
- **Fire Cooldown**: `max(1000 * 0.95^level, 120)` (line 82)
  - `1000`: Starting cooldown in ms
  - `0.95`: Reduction factor per level
  - `120`: Minimum cooldown in ms

### Level Progression (`src/math/ColorManager.ts`)
- **EXP Required**: `10 + (level * 5)` (line 21)
  - Change `10` (base EXP) or `5` (per level) for different progression speed
- **Boss Frequency**: Every 5 levels (line 25)
  - Change `level % 5 === 0` to adjust frequency
- **Boss HP**: `200 * 1.8^(floor(level/5)-1)` (line 29)
  - Change `200` (base) or `1.8` (growth)

### Ball HP & Colors (`src/math/ColorManager.ts`, lines 5-12)
Each color tier has different HP:
- White: 10 HP → Darkest Gray: 260 HP
- Adjust the `hp` values in the colors array

### Player Ship (Boss Mode) (`src/entities/PlayerShip.ts`)
- **Rotation Speed**: `rotationSpeed = 4` (radians/sec) (line 11)
- **Acceleration**: `acceleration = 300` (pixels/sec²) (line 12)
- **Max Speed**: `maxSpeed = 250` (pixels/sec) (line 13)
- **Friction**: `friction = 0.98` (multiplier per frame) (line 14)
- **Shoot Cooldown**: `src/Game.ts` → `shootCooldownMax = 0.2` (seconds) (line 45)

### Visual Timings
- **Laser Travel**: `src/entities/Laser.ts` → `travelTime = 0.3` (seconds)
- **Laser Fade**: `src/entities/Laser.ts` → `fadeTime = 0.15` (seconds)
- **Ripple Lifespan**: `src/entities/Ripple.ts` → `lifespan = 0.5` (seconds)
- **Ball Break Animation**: `src/entities/AlienBall.ts` → `breakAnimDuration = 0.4` (seconds)
- **Boss Break Animation**: `src/entities/BossBall.ts` → `breakAnimDuration = 0.6` (seconds)
- **Transition Duration**: `src/Game.ts` → `transitionDuration = 2` (seconds)
- **Screen Shake**: `src/Game.ts` → `triggerShake(2, 0.1)` (amount, duration)

### Auto-Save Frequency
- **Save Interval**: `src/Game.ts` → `saveInterval = 3` (seconds)

## Technical Stack

- **Vite**: Build tool and dev server
- **TypeScript**: Strict mode, no external libraries
- **HTML5 Canvas**: 2D rendering with HiDPI support
- **LocalStorage**: Client-side persistence
- **ESLint + Prettier**: Code quality

## Performance

- Fixed timestep update loop (60 FPS)
- Efficient object pooling for lasers and ripples
- HiDPI canvas scaling via `devicePixelRatio`
- Minimal GC pressure in hot paths

## Accessibility

- Keyboard support: `Enter` and `Space` activate buttons
- Focus indicators on interactive elements
- Touch and mouse input both supported

## License

MIT

---

**Have fun clicking!**

