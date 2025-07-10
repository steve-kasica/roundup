import { format, utcFormat } from "d3";

export const formatNumber = format(",");

export const formatDate = utcFormat("%B %d, %Y");

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
