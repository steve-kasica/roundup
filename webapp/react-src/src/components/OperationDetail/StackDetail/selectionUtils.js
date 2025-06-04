/**
 * Utility functions for working with 2D matrix selections in React components.
 *
 */

/**
 * Find the [i, j] index of a value in a 2D matrix.
 *
 * @param {Array<Array<any>>} m - The 2D array (matrix) to search.
 * @param {any} v - The value to find in the matrix.
 * @returns {[number, number] | null} The [row, col] index of the value if found, or null if not found.
 */
export function getIndexOfValue(m, v) {
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[i].length; j++) {
      if (m[i][j] === v) return [i, j];
    }
  }
  return null;
}

/**
 * Get all non-null values in the rectangle defined by two [i, j] coordinates in a 2D matrix.
 *
 * @param {Array<Array<any>>} m - The 2D array (matrix) to search.
 * @param {[number, number]} [i1, j1] - The first coordinate (row, col).
 * @param {[number, number]} [i2, j2] - The second coordinate (row, col).
 * @returns {Array<any>} Array of all non-null values in the rectangle defined by the two coordinates (inclusive).
 *   If the coordinates are the same and the cell is non-null, returns an array with that single value.
 */
export function getValuesInRange(m, [i1, j1], [i2, j2]) {
  if (i1 === i2 && j1 === j2 && m[i1] && m[i1][j1] != null) {
    return [m[i1][j1]];
  }
  const [rowStart, rowEnd] = [Math.min(i1, i2), Math.max(i1, i2)];
  const [colStart, colEnd] = [Math.min(j1, j2), Math.max(j1, j2)];
  const ids = [];
  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = colStart; j <= colEnd; j++) {
      if (m[i] && m[i][j] != null) ids.push(m[i][j]);
    }
  }
  return ids;
}
