/**
 * @fileoverview Barrel export for columnsSlice module.
 * @module slices/columnsSlice
 *
 * Re-exports all column-related actions, selectors, types, and the Column factory.
 *
 * @example
 * import { addColumns, selectColumnsById, Column, COLUMN_TYPE_NUMERICAL } from './columnsSlice';
 */
export * from "./columnsSlice.js"; // exports all actions
export * from "./Column.js";
export {
  selectColumnIdsByParentId,
  selectColumnsById,
  selectColumnNamesById,
  selectSelectedColumnIdsByParentId,
  selectActiveColumnIdsByParentId,
  selectColumnIndexById,
} from "./selectors.js";
import Column from "./Column.js";
import reducer from "./columnsSlice.js";

export { Column }; // export the Column factory function

export default reducer;
