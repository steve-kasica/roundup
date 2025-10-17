/**
 * Redux slice for managing columns in a data table.
 * This slice handles fetching, renaming, removing, and selecting columns,
 * as well as managing their loading and visibility states.
 *
 * Input normalization is a programming concept where inputs to a function or method are transformed into a consistent format before processing. This ensures that the function can handle various input types or structures in a predictable and uniform way, reducing complexity and potential errors in the implementation.
 *
 * Why Normalize Inputs?
 *  - Flexibility: Allows the function to accept multiple input formats (e.g., a single value or an array).
 *    Simplified Logic: By converting inputs into a standard format, the function's core logic can focus on processing the data without worrying about input variations.
 *  - Error Reduction: Reduces the likelihood of bugs caused by unexpected input types or structures.
 *  - Reusability: Makes the function more versatile and reusable in different contexts.
 */

import { createSlice } from "@reduxjs/toolkit";
import { COLUMN_TYPES, InvalidColumnTypeError } from "./Column";

const initialState = {
  idsByTable: {},
  data: {},
  selected: [],
  focused: [],
  loading: [],
  dragging: [],
  dropped: [],
  dropTargets: [], // Array of column IDs that can accept drops
  hoverTargets: [], // Array of column IDs currently being hovered over during drag
  errors: {},
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    addColumns(state, action) {
      let columns = action.payload;
      if (!Array.isArray(columns)) {
        columns = [columns];
      }
      columns.forEach((column) => {
        if (state.data[column.id]) {
          throw new Error(`Column with id ${column.id} already exists`);
        }
        // Add the column to the data object
        state.data[column.id] = column;

        // Add the column ID to the idsByTable mapping
        if (!state.idsByTable[column.tableId]) {
          state.idsByTable[column.tableId] = [];
        }

        // Insert column at the specified index position
        if (typeof column.index === "number" && column.index >= 0) {
          state.idsByTable[column.tableId].splice(column.index, 0, column.id);
        } else {
          // Fallback to push if index is not specified or invalid
          state.idsByTable[column.tableId].push(column.id);
        }
      });
    },

    setSelectedColumnIds(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.selected = ids;
    },

    excludeColumnFromTable(state, action) {
      const ids = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      ids.forEach((id) => {
        const tableId = state.data[id].tableId;
        // Exclude a column by removing it from idsByTable
        // Ensure that column data is not deleted
        state.idsByTable[tableId] = state.idsByTable[tableId].filter(
          (cid) => cid !== id
        );
        // Also make sure that excluded columns are not selected
        state.selected = state.selected.filter((cid) => cid !== id);
      });
    },

    updateColumns(state, action) {
      let columns = action.payload;
      if (!Array.isArray(columns)) {
        columns = [columns];
      }

      // Handle updates changing column selection
      const selectedColumnIds = columns.filter(({ isSelected }) => isSelected);
      if (selectedColumnIds.length > 0) {
        state.selected = selectedColumnIds.map(({ id }) => id);
      }

      columns.forEach((columnUpdate) => {
        if (!state.data[columnUpdate.id]) {
          throw new Error(`Column with id ${columnUpdate.id} does not exist`);
        }

        if (Object.hasOwnProperty.call(columnUpdate, "isSelected")) {
          columnUpdate.isSelected = undefined;
        } else if (Object.hasOwnProperty.call(columnUpdate, "index")) {
          // If index is updated, we need to reorder the idsByTable array
          const column = state.data[columnUpdate.id];
          const tableId = column.tableId;
          const currentIds = state.idsByTable[tableId] || [];
          const currentIndex = currentIds.indexOf(columnUpdate.id);
          if (currentIndex !== -1) {
            // Remove from current position
            currentIds.splice(currentIndex, 1);
            // Insert at new position
            const newIndex =
              columnUpdate.index < 0
                ? 0
                : columnUpdate.index > currentIds.length
                ? currentIds.length
                : columnUpdate.index;
            currentIds.splice(newIndex, 0, columnUpdate.id);
            state.idsByTable[tableId] = currentIds;
          }
        }
        state.data[columnUpdate.id] = {
          ...state.data[columnUpdate.id],
          ...columnUpdate,
        };
      });
    },
    /**
     *
     * @param {*} state
     * @param {*} action
     */
    updateAttribute(state, action) {
      let { ids, attribute, value } = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }

      if (attribute === "id") {
        throw new Error("`id` attribute is immutable and cannot be changed");
      } else if (attribute === "tableId") {
        throw new Error(
          "`tableId` attribute is immutable and cannot be changed"
        );
      } else if (attribute === "columnType" && !COLUMN_TYPES.includes(value)) {
        throw new InvalidColumnTypeError(value);
      } else if (attribute === "name") {
        throw new Error("`name` attribute is immutable");
      }

      ids
        .map((id) => {
          const column = state.data[id];
          if (!column) {
            throw new Error(`Column with id ${id} not found`);
          } else if (column[attribute] === undefined) {
            throw new Error(`Column does not have attribute '${attribute}'`);
          }
          return column;
        })
        .forEach((column) => (column[attribute] = value));
    },
    // need to rename to delete columns
    dropColumns(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        const column = state.data[id];
        if (column) {
          delete state.data[id]; // Remove the column from the data object

          // Remove the column ID from the idsByTable mapping
          state.idsByTable[column.tableId] = state.idsByTable[
            column.tableId
          ].filter((cid) => cid !== id);
          if (state.idsByTable[column.tableId].length === 0) {
            // If there are no columns left in the table, delete the entry
            delete state.idsByTable[column.tableId];
          }

          // Remove the column from the hovered columns if it is hovered
          state.hovered = state.hovered.filter((cid) => cid !== id);

          // Remove the column from the loading state if it is loading
          state.loading = state.loading.filter((cid) => cid !== id);

          // Remove the column from the dragging state
          state.dragging = state.dragging.filter((cid) => cid !== id);
        } else {
          throw new Error(`Column with id ${id} not found`);
        }
      });
    },
    addColumnsToDragging(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (!state.dragging.includes(id)) {
          state.dragging.push(id);
        }
      });
    },
    removeColumnsFromDragging(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.dragging = state.dragging.filter(
        (columnId) => !ids.includes(columnId)
      );
    },
    addColumnsToDropTargets(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (!state.dropTargets.includes(id)) {
          state.dropTargets.push(id);
        }
      });
    },
    removeColumnsFromDropTargets(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.dropTargets = state.dropTargets.filter(
        (columnId) => !ids.includes(columnId)
      );
    },
    clearDropTargets(state) {
      state.dropTargets = [];
    },
    addColumnsToHoverTargets(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (!state.hoverTargets.includes(id)) {
          state.hoverTargets.push(id);
        }
      });
    },
    removeColumnsFromHoverTargets(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.hoverTargets = state.hoverTargets.filter(
        (columnId) => !ids.includes(columnId)
      );
    },
    clearHoverTargets(state) {
      state.hoverTargets = [];
    },
    setValueCounts(state, action) {
      const { values, counts, columnId } = action.payload;
      if (values.length !== counts.length) {
        throw new Error("The number of values must match the number of counts");
      }
      const column = state.data[columnId];
      if (!column) {
        throw new Error(`Column with id ${columnId} not found`);
      }
      values.forEach((valueId, i) => {
        const count = counts[i];
        column.values[valueId] = count; // Update count if value already exists
      });
    },
    /**
     * Updates the `index` property of one or more columns in the state.
     * This reducer is used when swapping columns around
     *
     * @param {Object} state - The current state of the columns slice.
     * @param {Object} action - The dispatched action containing payload.
     * @param {string|string[]} action.payload.ids - The column id or array of column ids to update.
     * @param {number|number[]} action.payload.indices - The new index or array of indices corresponding to the column ids.
     * @throws {Error} If the number of ids does not match the number of indices.
     * @throws {Error} If a column with a specified id is not found in the state.
     */
    setColumnsIndex(state, action) {
      let { ids, indices } = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      if (!Array.isArray(indices)) {
        indices = [indices];
      }
      if (ids.length !== indices.length) {
        throw new Error("The number of ids must match the number of indices");
      }
      ids.forEach((id, i) => {
        const column = state.data[id];
        if (column) {
          column.index = indices[i];
        } else {
          throw new Error(`Column with id ${id} not found`);
        }
      });
    },
    setColumnType(state, action) {
      let { ids, columnTypes } = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      if (!Array.isArray(columnTypes)) {
        columnTypes = [columnTypes];
      }
      if (ids.length !== columnTypes.length) {
        throw new Error(
          "The number of ids must match the number of columnTypes"
        );
      }
      for (let columnType of columnTypes) {
        if (!COLUMN_TYPES.includes(columnType)) {
          throw new InvalidColumnTypeError(columnType);
        }
      }

      ids.forEach((id, i) => {
        const column = state.data[id];
        const columnType = columnTypes[i];
        if (column) {
          column.columnType = columnType;
        } else {
          throw new Error(`Column with id ${id} not found`);
        }
      });
    },
    fetchValuesSuccess(state, action) {
      const { id, valueCounts } = action.payload;
      const column = state.data[id];
      if (column) {
        Object.entries(valueCounts).forEach(([value, indicesArray]) => {
          if (!column.values[value]) {
            column.values[value] = indicesArray;
          } else {
            column.values[value] = column.values[value].concat(indicesArray);
          }
        });
      } else {
        throw new Error(`Column with id ${id} not found`);
      }
    },

    addColumnsToLoading(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (!state.loading.includes(id)) {
          state.loading.push(id);
        }
      });
    },
    removeColumnsFromLoading(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.loading = state.loading.filter(
        (columnId) => !ids.includes(columnId)
      );
    },

    /**
     * Adds columns to the dropped list
     * @param {*} state
     * @param {*} action
     */
    addColumnsToDropped(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (!state.dropped.includes(id)) {
          state.dropped.push(id);
        }
      });
    },
    removeColumnsFromDropped(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      state.dropped = state.dropped.filter(
        (columnId) => !ids.includes(columnId)
      );
    },

    setErrorForColumn(state, action) {
      const { id, error } = action.payload;
      state.errors[id] = error;
    },
    removeErrorForColumn(state, action) {
      const { id } = action.payload;
      delete state.errors[id];
    },
    updateColumnsArray(state, action) {
      const { tableId, columnIds } = action.payload;
      if (!state.idsByTable[tableId]) {
        state.idsByTable[tableId] = [];
      }
      state.idsByTable[tableId] = columnIds;
    },

    /**
     * Sets the focused columns
     * @param {Object} state - The current state
     * @param {Object} action - The action containing the column ID(s) to focus
     */
    setFocusedColumnIds(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      state.focused = columnIds;
    },

    /**
     * Clears the focused column
     * @param {Object} state - The current state
     */
    clearFocusedColumns(state) {
      state.focused = [];
    },
  },
});

export default columnsSlice.reducer;

export const {
  fetchValuesRequest,

  updateAttribute,
  dropColumns,

  addColumns,
  updateColumns,
  setColumnsIndex,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  removeErrorForColumn,
  addColumnsToDragging,
  removeColumnsFromDragging,
  addColumnsToDropTargets,
  removeColumnsFromDropTargets,
  clearDropTargets,
  addColumnsToHoverTargets,
  removeColumnsFromHoverTargets,
  clearHoverTargets,
  setColumnType,
  setValueCounts,
  updateColumnsArray,

  setSelectedColumnIds,
  excludeColumnFromTable,

  // Dropping columns
  addColumnsToDropped,
  removeColumnsFromDropped,

  // Focused column
  setFocusedColumnIds,
  clearFocusedColumns,
} = columnsSlice.actions;
