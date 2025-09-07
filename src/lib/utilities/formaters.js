import { format, utcFormat } from "d3";

export const formatNumber = format(",");

export const formatPercentage = format(".1%");

export const formatDate = utcFormat("%b. %d, %Y");

/**
 * Formats bytes into a human-readable string
 * @param {number} bytes - The number of bytes to format
 * @param {number} decimals - Number of decimal places to show (default: 2)
 * @returns {string} Formatted string with appropriate unit (B, KB, MB, GB, TB, PB)
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Formats unique count values with appropriate rounding and suffix
 * @param {number} value - The unique count to format
 * @returns {string|number} Formatted count with appropriate suffix or the original number
 */
export const approxNumber = (value) => {
  if (value >= 1000) {
    return Math.floor(value / 1000) + "K+";
  } else if (value >= 100) {
    return Math.floor(value / 100) * 100 + "+";
  } else if (value >= 10) {
    return Math.floor(value / 10) * 10 + "+";
  } else {
    return value;
  }
};
