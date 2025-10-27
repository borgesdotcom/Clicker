/**
 * Centralized number formatting utility
 * Optimized for performance with caching
 */

const formatCache = new Map<string, string>();
const CACHE_SIZE_LIMIT = 1000;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NumberFormatter {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Format large numbers with abbreviations (K, M, B, T, Q)
   * Cached for performance
   */
  static format(num: number): string {
    // Round to avoid floating point issues
    const roundedNum = Math.floor(num);

    // Check cache
    const cacheKey = roundedNum.toString();
    const cached = formatCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    let result: string;

    if (roundedNum >= 1e15) {
      result = `${(roundedNum / 1e15).toFixed(2)}Q`; // Quadrillion
    } else if (roundedNum >= 1e12) {
      result = `${(roundedNum / 1e12).toFixed(2)}T`; // Trillion
    } else if (roundedNum >= 1e9) {
      result = `${(roundedNum / 1e9).toFixed(2)}B`; // Billion
    } else if (roundedNum >= 1e6) {
      result = `${(roundedNum / 1e6).toFixed(2)}M`; // Million
    } else if (roundedNum >= 1e3) {
      result = `${(roundedNum / 1e3).toFixed(1)}K`; // Thousand
    } else {
      result = roundedNum.toString();
    }

    // Cache the result (with size limit)
    if (formatCache.size < CACHE_SIZE_LIMIT) {
      formatCache.set(cacheKey, result);
    } else if (formatCache.size === CACHE_SIZE_LIMIT) {
      // Clear cache when limit reached
      formatCache.clear();
      formatCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Format numbers with fixed decimals (for percentages, etc.)
   */
  static formatDecimal(num: number, decimals: number = 1): string {
    return num.toFixed(decimals);
  }

  /**
   * Clear the cache (useful for memory management)
   */
  static clearCache(): void {
    formatCache.clear();
  }
}
