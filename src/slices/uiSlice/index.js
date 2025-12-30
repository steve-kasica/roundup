/**
 * @fileoverview Barrel export for uiSlice module.
 * @module slices/uiSlice
 *
 * Re-exports all UI-related actions and selectors for managing
 * application interaction state.
 *
 * @example
 * import { setSelectedColumnIds, selectSelectedColumnIds } from './uiSlice';
 */
import { uiSlice } from "./uiSlice.js";
export * from "./selectors.js"; // exports all selectors
export * from "./uiSlice.js"; // exports all actions
export default uiSlice.reducer;
