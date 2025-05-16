/**
 * Returns the union of n-many sets.
 * @param {...Set} sets - Any number of Set objects.
 * @returns {Set} A new Set containing all unique elements from all input sets.
 */
export default function union(...sets) {
  const result = new Set();
  for (const s of sets) {
    for (const item of s) {
      result.add(item);
    }
  }
  return result;
}
