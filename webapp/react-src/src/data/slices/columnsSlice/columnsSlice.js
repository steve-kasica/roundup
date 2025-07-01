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
import Column, {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPES,
  InvalidColumnTypeError,
} from "./Column";

const initialState = {
  idsByTable: {},
  data: {},
  selected: [],
  hovered: [],
  loading: [],
  dragging: [],
  errors: {},
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    /**
     * Adds columns to the state from OpenRefine column information.
     *
     * This reducer action takes a payload containing a project/table ID and an array of column metadata,
     * then updates the state by:
     *   - Initializing the list of column IDs for the table if it doesn't exist.
     *   - Creating a new column object for each columnInfo entry, determining its type based on the
     *     `is_numeric` property ("categorical" if true, otherwise "numeric").
     *   - Storing each column object in the state's column dictionary.
     *   - Appending each new column's ID to the list of column IDs for the table.
     *
     * @param {Object} state - The current Redux slice state.
     * @param {Object} action - The Redux action object.
     * @param {Object} action.payload - The payload for the action.
     * @param {string} action.payload.projectId - The ID of the table/project to add columns to.
     * @param {Array<Object>} action.payload.columnsInfo - Array of column metadata objects from OpenRefine.
     * @param {string} action.payload.columnsInfo[].name - The name of the column.
     * @param {boolean} action.payload.columnsInfo[].is_numeric - Whether the column is numeric.
     */
    addColumnsFromOpenRefine(state, action) {
      const { projectId: tableId, columnsInfo } = action.payload;
      if (!Object.hasOwn(state.idsByTable, tableId)) {
        state.idsByTable[tableId] = [];
      }
      columnsInfo.forEach((columnInfo, i) => {
        const column = Column(
          tableId,
          i,
          columnInfo.name,
          columnInfo.is_numeric
            ? COLUMN_TYPE_CATEGORICAL
            : COLUMN_TYPE_NUMERICAL
        );
        // Update column dictionary (columnId => column metadata)
        state.data[column.id] = column;

        // Update list of column IDs for the table
        // TODO: should this just be memoized in a selector?
        state.idsByTable[tableId].push(column.id);
      });
    },

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
        state.idsByTable[column.tableId].push(column.id);
      });
    },

    updateColumns(state, action) {
      let columns = action.payload;
      if (!Array.isArray(columns)) {
        columns = [columns];
      }
      columns.forEach((column) => {
        if (!state.data[column.id]) {
          throw new Error(`Column with id ${column.id} does not exist`);
        }
        // Update the column in the data object
        // TODO: should have some kind of validation here
        // to ensure that the column object has the correct structure
        // and required properties
        // This is a shallow merge, so it will overwrite existing properties
        // with the new values from the column object
        // This is useful for updating properties like name, columnType, etc.
        // If you want to ensure that certain properties are always present,
        state.data[column.id] = {
          ...state.data[column.id],
          ...column,
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
      } else if (attribute === "isRemoved" && typeof value !== "boolean") {
        throw new Error("`isRemoved` must be a boolean");
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

    /**
     * Updates the column name after a successful rename operation.
     * Accepts either a single column ID or an array of IDs as payload.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload.id - The ID(s) of the renamed column(s).
     * @param {string} action.payload.newColumnName - The new name of the column(s).
     */
    renameColumns(state, action) {
      let { ids, aliases } = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      if (!Array.isArray(aliases)) {
        aliases = [aliases];
      }
      if (ids.length !== aliases.length) {
        throw new Error(
          "renameColumns: ids and aliases must have the same length"
        );
      }

      ids.forEach((id, i) => {
        const column = state.data[id];
        if (!column) {
          throw new Error(`Column with id ${id} not found`);
        }
        const alias = aliases[i];
        column.alias = alias;
      });
    },
    /**
     * Removes a column from the state after a successful removal operation.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the removed column.
     */
    removeColumns(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        const column = state.data[id];
        if (column) {
          // Mark column as removed in data dictionary
          state.data[id].isRemoved = true; // Mark as removed

          // Remove the column ID from the idsByTable mapping
          state.idsByTable[column.tableId] = state.idsByTable[
            column.tableId
          ].filter((cid) => cid !== id);
          if (state.idsByTable[column.tableId].length === 0) {
            // If there are no columns left in the table, delete the entry
            delete state.idsByTable[column.tableId];
          }

          // Remove the column from the selected columns if it is selected
          state.selected = state.selected.filter((cid) => cid !== id);

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
    setHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hovered = columnIds;
    },
    appendToHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hovered = [...state.hovered, ...columnIds];
    },
    removeFromHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hovered = state.hovered.filter(
        (column) => !columnIds.includes(column)
      );
    },
    clearHoveredColumns(state) {
      state.hovered = initialState.hovered;
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
    swapColumns(state, action) {
      // Accepts either a single target and source id
      // or parallel arrays of target and sources ids
      let { targetIds, sourceIds } = action.payload;
      if (!Array.isArray(targetIds)) targetIds = [targetIds];
      if (!Array.isArray(sourceIds)) sourceIds = [sourceIds];
      if (targetIds.length !== sourceIds.length) {
        throw new Error(
          "swapColumns: targetIds and sourceIds must have the same length"
        );
      }

      sourceIds.forEach((sourceId, i) => {
        const targetId = targetIds[i];
        const sourceColumn = state.data[sourceId];
        const targetColumn = state.data[targetId];

        // Update column attributes reflecting index
        const tempIndex = sourceColumn.index;
        sourceColumn.index = targetColumn.index;
        targetColumn.index = tempIndex;

        // Swap column Id positions in the idsByTable mapping
        const tableId = sourceColumn.tableId;
        const columnIds = state.idsByTable[tableId];
        const sourceIndex = columnIds.indexOf(sourceId);
        const targetIndex = columnIds.indexOf(targetId);
        if (sourceIndex === -1 || targetIndex === -1) {
          throw new Error(
            `Column with id ${sourceId} or ${targetId} not found in table ${tableId}`
          );
        }
        // Swap the column IDs in the idsByTable mapping
        columnIds[sourceIndex] = targetId;
        columnIds[targetIndex] = sourceId;
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
    setSelectedColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selected = columnIds;
    },
    appendToSelectedColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selected = [...state.selected, ...columnIds];
    },
    clearSelectedColumns(state) {
      state.selected = initialState.selected;
    },
    removeFromSelectedColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selected = state.selected.filter(
        (column) => !columnIds.includes(column)
      );
    },
    fetchValuesRequest(state, action) {
      const { id } = action.payload;
      const column = state.data[id];
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
    fetchValuesFailure(state, action) {
      const { id, error } = action.payload;
      const column = state.data[id];
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
    setErrorForColumn(state, action) {
      const { id, error } = action.payload;
      state.errors[id] = error;
    },
    removeErrorForColumn(state, action) {
      const { id } = action.payload;
      delete state.errors[id];
    },
  }, // end reducers
});

export default columnsSlice.reducer;

export const {
  fetchValuesRequest,
  fetchValuesSuccess,
  fetchValuesFailure,

  updateAttribute,
  swapColumns,

  addColumnsFromOpenRefine,
  addColumns,
  updateColumns,
  renameColumns,
  removeColumns,
  setColumnsIndex,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  removeErrorForColumn,
  addColumnsToDragging,
  removeColumnsFromDragging,
  setHoveredColumns,
  appendToHoveredColumns,
  removeFromHoveredColumns,
  clearHoveredColumns,
  setColumnType,
  setSelectedColumns,
  appendToSelectedColumns,
  clearSelectedColumns,
  removeFromSelectedColumns,
  setValueCounts,
} = columnsSlice.actions;
