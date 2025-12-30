/**
 * @fileoverview Shared utility functions for Redux slices.
 * @module slices/utilities
 *
 * Common utility functions used across all Redux slices for input
 * normalization and data processing.
 *
 * Features:
 * - Input normalization for flexible API
 * - Handles single values and arrays uniformly
 * - Reduces complexity in slice reducers
 *
 * @example
 * import { normalizeInputToArray } from './utilities';
 * const items = normalizeInputToArray(payload); // Always an array
 */

/**
 * Normalizes the input to always return an array.
 * Input normalization is a programming concept where inputs to a function
 * or method are transformed into a consistent format before processing.
 * This ensures that the function can handle various input types or structures
 * in a predictable and uniform way, reducing complexity and potential errors
 * in the implementation.
 *
 * Why Normalize Inputs?
 *  - Flexibility: Allows the function to accept multiple input formats
 *        (e.g., a single value or an array).
 *  - Simplified Logic: By converting inputs into a standard format, the
 *    function's core logic can focus on processing the data without worrying
 *    about input variations.
 *  - Error Reduction: Reduces the likelihood of bugs caused by unexpected
 *    input types or structures.
 *  - Reusability: Makes the function more versatile and reusable in different
 *    contexts.
 *
 * @param {*} input - The value to normalize. Can be any type.
 * @returns {Array} An array containing the input if it was not already an array, or the input itself if it was an array.
 */
export const normalizeInputToArray = (input) => {
  return Array.isArray(input) ? input : [input];
};
