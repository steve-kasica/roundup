/**
 * Calculates the intersection of n Sets.
 * @param {...Set} sets - Any number of Set instances.
 * @returns {Set} A new Set containing elements common to all input Sets.
 */
export function intersection(...sets) {
  if (sets.length === 0) return new Set();
  // Start with the smallest set for efficiency
  const [smallest, ...rest] = [...sets].sort((a, b) => a.size - b.size);
  return new Set(
    [...smallest].filter((item) => rest.every((set) => set.has(item)))
  );
}
