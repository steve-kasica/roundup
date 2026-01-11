/**
 * @file config.js
 * @description Configuration constants for the entire application.
 */
import { schemeTableau10 } from "d3";

/**
 * The maximum depth allowed for the operation tree.
 * @type {number}
 */
export const TREE_MAX_DEPTH = 8;

/**
 * The luminance threshold used to determine whether to use light or dark text.
 * @type {number}
 */
export const TEXT_LUMINANCE_THRESHOLD = 186;

/**
 * The color palette function for operations, using D3's interpolateBlues.
 * @type {function}
 */
export const OPERATION_COLOR_PALETTE = schemeTableau10;

/**
 * The maximum number of unique values a column object can store in the `topValues` attribute.
 * @type {number}
 */
export const COLUMN_UNIQUE_VALUE_LIMIT = 20;
