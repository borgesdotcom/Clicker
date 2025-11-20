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
