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
   * Format large numbers using Cookie Clicker notation
   * Divides by 1000 each step and uses standard suffixes
   * Cached for performance
   */
  static format(num: number): string {
    // Handle negative numbers
    if (num < 0) {
      return '-' + this.format(-num);
    }

    // Round to avoid floating point issues
    const roundedNum = Math.floor(num);

    // Check cache
    const cacheKey = roundedNum.toString();
    const cached = formatCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    let result: string;

    // Cookie Clicker notation: divide by 1000 each step
    // Suffixes: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, Ud, Dd, Td, Qad, Qid, Sxd, Spd, Ocd, Nod, Vg, Uvg, Dvg, Tvg, Qavg, Qivg, Sxvg, Spvg, Ocvg, Novg, Tg, Utg, Dtg, Ttg, Qatg, Qitg, Sxtg, Sptg, Octg, Notg, Qag, Uqag, Dqag, Tqag, Qaqag, Qiqag, Sxqag, Spqag, Ocqag, Noqag, Qig, Uqig, Dqig, Tqig, Qaqig, Qiqig, Sxqig, Spqig, Ocqig, Noqig, Sxg, Usxg, Dsxg, Tsxg, Qasxg, Qisxg, Sxsxg, Spsxg, Ocsxg, Nosxg, Spg, Uspg, Dspg, Tspg, Qaspg, Qispg, Sxspg, Spspg, Ocspg, Nospg, Ocgg, Uocgg, Docgg, Tocgg, Qaocgg, Qiocgg, Sxocgg, Spocgg, Ococgg, Noocgg, Nog, Unog, Dnog, Tnog, Qanog, Qinog, Sxnog, Spnog, Ocnog, Nonog, C, Uc, Dc, Tc, Qac, Qic, Sxc, Spc, Occ, Noc
    // For simplicity, we'll use the main ones and then switch to scientific notation

    const suffixes = [
      '',
      'K',
      'M',
      'B',
      'T',
      'Qa',
      'Qi',
      'Sx',
      'Sp',
      'Oc',
      'No',
      'Dc',
      'Ud',
      'Dd',
      'Td',
      'Qad',
      'Qid',
      'Sxd',
      'Spd',
      'Ocd',
      'Nod',
      'Vg',
      'Uvg',
      'Dvg',
      'Tvg',
      'Qavg',
      'Qivg',
      'Sxvg',
      'Spvg',
      'Ocvg',
      'Novg',
      'Tg',
      'Utg',
      'Dtg',
      'Ttg',
      'Qatg',
      'Qitg',
      'Sxtg',
      'Sptg',
      'Octg',
      'Notg',
      'Qag',
      'Uqag',
      'Dqag',
      'Tqag',
      'Qaqag',
      'Qiqag',
      'Sxqag',
      'Spqag',
      'Ocqag',
      'Noqag',
      'Qig',
      'Uqig',
      'Dqig',
      'Tqig',
      'Qaqig',
      'Qiqig',
      'Sxqig',
      'Spqig',
      'Ocqig',
      'Noqig',
      'Sxg',
      'Usxg',
      'Dsxg',
      'Tsxg',
      'Qasxg',
      'Qisxg',
      'Sxsxg',
      'Spsxg',
      'Ocsxg',
      'Nosxg',
      'Spg',
      'Uspg',
      'Dspg',
      'Tspg',
      'Qaspg',
      'Qispg',
      'Sxspg',
      'Spspg',
      'Ocspg',
      'Nospg',
      'Ocgg',
      'Uocgg',
      'Docgg',
      'Tocgg',
      'Qaocgg',
      'Qiocgg',
      'Sxocgg',
      'Spocgg',
      'Ococgg',
      'Noocgg',
      'Nog',
      'Unog',
      'Dnog',
      'Tnog',
      'Qanog',
      'Qinog',
      'Sxnog',
      'Spnog',
      'Ocnog',
      'Nonog',
      'C',
      'Uc',
      'Dc',
      'Tc',
      'Qac',
      'Qic',
      'Sxc',
      'Spc',
      'Occ',
      'Noc',
    ];

    if (roundedNum < 1000) {
      // Numbers below 1000: just add commas
      result = this.addCommas(roundedNum.toString());
    } else {
      // Cookie Clicker style: divide by 1000 repeatedly
      let value = roundedNum;
      let suffixIndex = 0;

      // Divide by 1000 until we get a value < 1000 or run out of suffixes
      while (value >= 1000 && suffixIndex < suffixes.length - 1) {
        value /= 1000;
        suffixIndex++;
      }

      // Cookie Clicker format: no commas in abbreviated numbers
      // Precision: 0 decimals for 100+, 1 decimal for 10-99, 2 decimals for < 10
      let decimals = 2;
      if (value >= 100) {
        decimals = 0; // No decimals for 100+
      } else if (value >= 10) {
        decimals = 1; // 1 decimal for 10-99
      } else {
        decimals = 2; // 2 decimals for < 10
      }

      const formatted = value.toFixed(decimals);
      const cleaned = this.removeTrailingZeros(formatted);
      result = `${cleaned}${suffixes[suffixIndex]}`;

      // If we've run out of suffixes (extremely large numbers), use scientific notation
      if (suffixIndex >= suffixes.length - 1 && value >= 1000) {
        // Use scientific notation for numbers beyond all suffixes
        const exp = Math.floor(Math.log10(roundedNum));
        const mantissa = roundedNum / Math.pow(10, exp);
        // Format mantissa with appropriate decimals
        let mantissaDecimals = 2;
        if (mantissa >= 100) mantissaDecimals = 0;
        else if (mantissa >= 10) mantissaDecimals = 1;
        result = `${mantissa.toFixed(mantissaDecimals)}e${exp}`;
      }
    }

    // Cache the result (with size limit)
    // Clear cache if at or over limit to prevent unbounded growth
    if (formatCache.size >= CACHE_SIZE_LIMIT) {
      formatCache.clear();
    }
    formatCache.set(cacheKey, result);

    return result;
  }

  /**
   * Remove trailing zeros from decimal numbers
   * Works correctly even after commas have been added
   */
  private static removeTrailingZeros(value: string): string {
    // Check if there's a decimal point
    if (!value.includes('.')) {
      return value;
    }

    // Split into parts before and after decimal
    const parts = value.split('.');
    if (parts.length !== 2) {
      return value;
    }

    const integerPart = parts[0]!;
    let decimalPart = parts[1]!;

    // Validate that decimal part only contains digits
    if (!/^\d+$/.test(decimalPart)) {
      return value;
    }

    // Remove trailing zeros from decimal part
    decimalPart = decimalPart.replace(/0+$/, '');

    // If decimal part is empty, return just the integer part (without decimal point)
    if (decimalPart === '') {
      return integerPart;
    }

    // Otherwise, combine with the cleaned decimal part
    return `${integerPart}.${decimalPart}`;
  }

  /**
   * Add comma separators to numbers (thousands separators)
   */
  private static addCommas(value: string): string {
    // Split by decimal point if present
    const parts = value.split('.');
    const integerPart = parts[0]!;
    const decimalPart = parts[1];

    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine with decimal part if present
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
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
