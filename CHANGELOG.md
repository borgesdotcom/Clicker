# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta] - 2024-12-XX

### 🎉 Beta 1.0.0 Release

### ⚡ Performance Improvements
- **Fixed Critical Tab Switching Bug** - Resolved memory leak that caused lag and crashes when rapidly switching browser tabs. Animation frames are now properly tracked and cancelled.
- **Mobile Performance Optimizations** - Disabled deformation effects on mobile devices for better performance. Ripple effects removed entirely to reduce mobile lag.
- **Optimized Animation Frame Management** - Improved animation frame lifecycle to prevent accumulation and memory leaks.

### 🆕 New Features
- **Auto-Buy Unlock System** - Auto-Buy feature is now locked behind the Ascension Store! Purchase "Auto-Buy Protocol" for 50 Ascension Points to unlock. Button shows disabled state with info text when locked.
- **Mobile Customization Support** - Customization button now available in mobile menu. Fully responsive customization modal with optimized layouts for all screen sizes (tablet, mobile, landscape).

### 🔧 Improvements
- **Buy Quantity System Overhaul** - Fixed buy quantity logic to show exact quantities (1x, 5x, 10x, MAX) and only purchase the displayed amount. Cost display now matches button text perfectly.
- **Shop UI Reset** - Shop UI now properly resets when you reset the game or ascend. Tabs return to "Available", buy quantity resets to 1x, and all caches are cleared.
- **Stats Reset** - Special upgrade purchase stats (`totalSubUpgrades`) now properly reset when you reset or ascend the game for a clean slate.

### 🐛 Bug Fixes
- Fixed buy quantity display showing incorrect quantities (e.g., showing 3x when 10x was selected)
- Fixed shop UI state persisting after game reset or ascension
- Fixed stats not resetting special upgrade counts after reset/ascension
- Fixed tab switching causing memory leaks and performance degradation
- Fixed mobile performance issues from excessive visual effects

### 🗑️ Removed
- **Ripple Effects** - Completely removed ripple effects from the game for better performance, especially on mobile devices.

### 📱 Mobile Enhancements
- Customization button added to mobile menu
- Responsive customization modal with mobile-optimized layouts
- Deformation effects disabled on mobile for performance
- Improved touch responsiveness

---

## [0.0.4] - Previous Release

### Features
- Internationalization support (English, Portuguese, Spanish)
- Offline progress system
- Boss retry button redesign
- Improved button design with tooltips
- Mobile support enhancements
- Consistent button layout

---

[1.0.0-beta]: https://github.com/borgesdotcom/clicker/releases/tag/v1.0.0-beta
[0.0.4]: https://github.com/borgesdotcom/clicker/releases/tag/v0.0.4

