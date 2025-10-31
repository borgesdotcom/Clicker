# BOBBLE

> A modern incremental clicker game built with TypeScript and HTML5 Canvas

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎮 About

BOBBLE is an engaging incremental clicker game featuring bubblewrap aliens and a fake invasion plot! These bubblewrap creatures are "threatening" your profit margins - pop them all! Command a fleet of starships to boop colorful bubblewrap alien targets, level up your arsenal, and unlock powerful abilities as you progress through this profit-driven "defense" operation.

## ✨ Features

- **Dynamic Combat System** - Click to fire volleys of lasers from your fleet
- **Boss Battles** - Face massive bosses every 5 levels with time-limited challenges
- **Prestige System** - Ascend to unlock permanent bonuses and prestige upgrades
- **Achievement System** - Track your progress with unlockable achievements
- **Mission System** - Complete objectives for bonus rewards
- **Artifact Collection** - Discover powerful artifacts from boss defeats
- **Extensive Upgrade Tree** - 100+ upgrades across multiple categories
- **Mobile Support** - Full touch controls for mobile devices
- **Save System** - Automatic cloud-free saves to localStorage
- **Visual Effects** - Particles, ripples, damage numbers, and combo tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/borgesdotcom/clicker.git

# Navigate to project directory
cd clicker

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Play

### Normal Mode

- **Click/Tap** anywhere to fire lasers from your main ship
- **Purchase Upgrades** in the shop panel to increase your firepower
- **Level Up** by destroying aliens to unlock better equipment

### Boss Mode

- Triggered every 5 levels for an epic showdown
- **Click/Tap** to fire at the boss
- Defeat the boss before time runs out!
- Earn bonus rewards and potential artifact drops

## 🛠️ Tech Stack

- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript with strict mode
- **HTML5 Canvas** - High-performance 2D rendering with HiDPI support
- **LocalStorage** - Client-side persistence without external dependencies
- **ESLint + Prettier** - Code quality and formatting

## 📁 Project Structure

```
src/
├── core/          # Core systems (Input, Loop, Save, Store, Settings)
├── entities/      # Game entities (Ships, Aliens, Bosses, Projectiles)
├── math/          # Math utilities (ColorManager, RNG)
├── render/        # Rendering system (Canvas, Draw, Background)
├── systems/       # Game systems (Upgrades, Combat, Achievements, etc.)
├── ui/            # UI components (HUD, Modals, Shop)
├── types.ts       # TypeScript type definitions
└── main.ts        # Application entry point
```

## 🎨 Customization

### Balancing Upgrades

Edit `src/systems/UpgradeSystem.ts` to adjust:
- Upgrade costs and scaling
- Damage multipliers
- Fire rate cooldowns
- Passive generation rates

### Visual Tuning

Modify `src/Game.ts` and entity files for:
- Laser travel times and fade durations
- Ripple effects and lifespans
- Particle counts and behaviors
- Animation timings

### Progression

Adjust `src/math/ColorManager.ts` for:
- Experience requirements per level
- Boss frequency and HP scaling
- Enemy HP progression

## 📊 Save Data

Game progress is automatically saved to `localStorage` every 3 seconds and on page unload.

**Save Key**: `alien-clicker-save`

To manually reset:
```javascript
localStorage.removeItem('alien-clicker-save')
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic incremental games like Cookie Clicker and Clicker Heroes
- Built with modern web technologies for optimal performance

---

**Enjoy the game!** 🚀

If you encounter any issues or have suggestions, please [open an issue](https://github.com/borgesdotcom/clicker/issues).
