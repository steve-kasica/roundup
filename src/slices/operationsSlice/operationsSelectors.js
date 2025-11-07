import { createSelector } from "@reduxjs/toolkit";
import {
  selectActiveColumnDBNamesByTableId,
  selectColumnById,
} from "../columnsSlice";
import { isTableId } from "../tablesSlice";
import { selectColumnIdMatrixByOperationId } from "../columnsSlice/columnSelectors";

/**
 * Selects an operation by its ID from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the operation to select.
 * @returns {Object} The operation object corresponding to the given ID.
 * @throws {Error} Throws an error if the operation is not found in the state.
 */
export const selectOperation = createSelector(
  [(state) => state.operations.data, (state, operationId) => operationId],
  (data, operationId) => {
    return data[operationId];
  }
);

export const selectOperationChildren = createSelector(
  [
    (state) => state.operations.data,
    (state, operationId) => selectOperation(state, operationId)?.children,
  ],
  (data, children) => {
    if (!children) return [];
    return children.map((childId) =>
      !isTableId(childId) ? data[childId] : { id: childId, operationType: null }
    );
  }
);

/**
 * Selector to retrieve all operation IDs from the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {Array<string|number>} An array of operation IDs.
 */
export function selectAllOperationIds(state) {
  return state.operations.ids;
}

/**
 * Memoized selector to find the operation that contains the given table ID.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} tableId - The unique identifier of the table.
 * @returns {Object|undefined} The operation object containing the table, or undefined if not found.
 */
export const selectOperationByTableId = createSelector(
  (state) => state.operations.data,
  (_, tableId) => tableId,
  (data, tableId) => {
    return Object.values(data).find((operation) =>
      operation.children.includes(tableId)
    );
  }
);

/**
 * Memoized selector to compute the depth of an operation in the operation tree.
 *
 * The depth is defined as the number of edges from the root operation to the target operation.
 * Returns null if the operation or root is not found.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the operation.
 * @returns {number|null} The depth of the operation, or null if not found.
 */

export const selectOperationDepth = createSelector(
  [(state) => state.operations, (_, operationId) => operationId],
  (operations, operationId) => {
    const { ids, data } = operations;
    if (!ids.length || !operations.root) return null;

    // Start from the root (last in ids or explicit root)
    let currentId = operations.root;
    let depth = 0;

    function findDepth(nodeId, currentDepth) {
      if (nodeId === operationId) return currentDepth;
      const node = data[nodeId];
      if (!node || !node.children || node.children.length === 0) return null;
      for (const childId of node.children) {
        // Remove isOperationId check to allow all children to be traversed
        const result = findDepth(childId, currentDepth + 1);
        if (result !== null) return result;
      }
      return null;
    }

    return findDepth(currentId, depth);
  }
);

/**
 * Memoized selector to compute the maximum depth of all operations in the operation tree.
 *
 * The maximum depth is defined as the largest number of edges from the root operation to any operation node.
 * Returns undefined if the root operation is not present.
 *
 * @param {Object} state - The Redux state object.
 * @returns {number|undefined} The maximum depth of the operation tree, or undefined if root is missing.
 */
export const selectMaxOperationDepth = createSelector(
  (state) => state.operations,
  (operations) => {
    const { root, data, ids } = operations;
    if (!root || !data[root]) return undefined;

    let maxDepth = -Infinity;
    for (const id of ids) {
      const depth = selectOperationDepth.resultFunc(operations, id);
      if (typeof depth === "number" && depth > maxDepth) {
        maxDepth = depth;
      }
    }
    return maxDepth === -Infinity ? undefined : maxDepth;
  }
);

/**
 * Selects the root operation ID from the operations slice of the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {(string|null)} The root operation ID if present, otherwise null.
 */
export function selectRootOperation(state) {
  return state.operations.root || null;
}

/**
 * Selector to retrieve the currently focused operation ID from the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {string|number|undefined} The ID of the focused operation, or undefined if not set.
 */
export function selectFocusedOperationId(state) {
  return state.operations.focused;
}

/**
 * Selector to retrieve the currently hovered operation from the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {*} The hovered operation from the operations slice of the state.
 */
export const selectHoveredOperation = (state) => {
  return state.operations.hovered;
};

/**
 * Memoized selector to find the parent operation ID of a given operation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the operation whose parent is to be found.
 * @returns {(string|number|null)} The ID of the parent operation if found, otherwise null.
 */
export const selectParentOperation = createSelector(
  (state) => state.operations.data,
  (_, operationId) => operationId,
  (operationsData, operationId) => {
    for (const operation of Object.values(operationsData)) {
      if (operation.children && operation.children.includes(operationId)) {
        return operation.id;
      }
    }
    return null;
  }
);

export const selectOperationChildrenData = createSelector(
  (state) => state.operations.data,
  (_, operationId) => operationId,
  (data, operationId) => {
    const operation = data[operationId];
    if (!operation || !operation.children) return [];

    return operation.children.map((childId) => ({
      id: childId,
      operationType: data[childId]?.operationType,
    }));
  }
);

/**
 * Selector to build query data for an operation.
 * Constructs the data structure needed for database view creation.
 *
 * @param {Object} state - Redux state
 * @param {string} operationData - A partially complete instance of Operation. It can be
 *   incomplete because it is an `operationUpdate` when the updateOperationsSaga
 *   because `operationData` is a newly instantiated Operation object in the createOperationsSaga. It
 *   must contain at least the `id`
 * @returns {Object} Query data object with operation details and child table information
 */
export const selectOperationQueryData = (state, operationData) => {
  // Select the full operation from state, if it is present
  // It may not be present if this is a newly created Operation
  const operation = selectOperation(state, operationData.id);

  const parent = {
    ...operation, // can be undefined
    ...operationData,
  };

  // Parent properties that are used by both Stack and Pack operations
  parent.children = parent.children.map((id) => {
    let child = {
      id,
      columnNames: selectActiveColumnDBNamesByTableId(state, id),
    };
    return child;
  });

  // parent properties that are only need for Pack operations
  // Stack operation will not throw errors if these are undefined
  parent.joinKey1 = parent.joinKey1
    ? selectColumnById(state, parent.joinKey1).columnName
    : null;
  parent.joinKey2 = parent.joinKey2
    ? selectColumnById(state, parent.joinKey2).columnName
    : null;

  return parent;
};

/**
 * Memoized selector to calculate the total row count for a stack operation.
 *
 * Sums the row counts of all child tables and operations. For table children,
 * uses the table's rowCount property. For operation children, uses the operation's
 * rowCount property.
 *
 * This selector is memoized using createSelector, which means the calculation is
 * cached and only recomputed when dependencies change. Importantly, this memoization
 * is shared across all component instances that use this selector - if multiple
 * components call this selector with the same arguments, they will receive the same
 * cached result without triggering a recalculation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the stack operation.
 * @param {Array<string|number>} [children] - Optional array of child IDs. If not provided,
 *   will be retrieved from the operation's children property.
 * @returns {number} The total row count of all children, or 0 if no children exist.
 */
export const selectStackOperationRowCount = createSelector(
  [
    (state, operationId, children) =>
      children || selectOperation(state, operationId)?.children,
    (state) => state.tables.data,
    (state) => state.operations.data,
  ],
  (children, tablesData, operationsData) => {
    if (!children) return 0;

    return children.reduce((total, id) => {
      let childRowCount = 0;
      if (isTableId(id)) {
        childRowCount = tablesData[id]?.rowCount || 0;
      } else {
        childRowCount = operationsData[id]?.rowCount || 0;
      }
      return total + childRowCount;
    }, 0);
  }
);

/**
 * Memoized selector to calculate the total column count for a pack operation.
 *
 * Sums the number of active columns across all child tables in the pack operation.
 * Only counts active (non-hidden) columns.
 *
 * This selector is memoized using createSelector, which means the calculation is
 * cached and only recomputed when dependencies change. Importantly, this memoization
 * is shared across all component instances that use this selector - if multiple
 * components call this selector with the same arguments, they will receive the same
 * cached result without triggering a recalculation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the pack operation.
 * @returns {number} The total count of active columns across all child tables.
 */
export const selectPackOperationColumnCount = createSelector(
  [
    (state, operationId) => selectOperation(state, operationId)?.children,
    (state) => state.columns.data,
  ],
  (childIds, columnsData) => {
    if (!childIds) return 0;

    return childIds.reduce((total, tableId) => {
      const activeColumns = Object.values(columnsData).filter(
        (column) => column.tableId === tableId && column.isActive !== false
      );
      return total + activeColumns.length;
    }, 0);
  }
);

/**
 * Memoized selector to calculate the maximum column count for a stack operation.
 *
 * Determines the maximum number of columns across all child tables in the stack.
 * This represents the width of the stack operation's matrix, where some tables may
 * have fewer columns and will be padded with null values.
 *
 * This selector is memoized using createSelector, which means the calculation is
 * cached and only recomputed when dependencies change. Importantly, this memoization
 * is shared across all component instances that use this selector - if multiple
 * components call this selector with the same arguments, they will receive the same
 * cached result without triggering a recalculation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the stack operation.
 * @returns {number} The maximum column count among all child tables, or 0 if no children.
 */
export const selectStackOperationColumnCount = createSelector(
  [
    (state, operationId) =>
      selectColumnIdMatrixByOperationId(state, operationId),
  ],
  (columnIdMatrix) => {
    if (!columnIdMatrix) return 0;

    // Group columns by tableId and count columns per table
    const counts = columnIdMatrix.reduce(
      (max, tableIds) => (tableIds.length > max ? tableIds.length : max),
      0
    );

    // Return the maximum column count across all tables
    return counts;
  }
);

/**
 * Memoized selector to calculate row ranges for each child in a stack operation.
 *
 * Returns a Map where each key is a child ID and each value is a tuple [start, end]
 * representing the row range for that child in the stacked result.
 *
 * This selector is memoized using createSelector, which means the calculation is
 * cached and only recomputed when dependencies change. Importantly, this memoization
 * is shared across all component instances that use this selector - if multiple
 * components call this selector with the same arguments, they will receive the same
 * cached result without triggering a recalculation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the stack operation.
 * @returns {Map} A Map of child IDs to their [start, end] row ranges.
 */
export const selectStackOperationRowRanges = createSelector(
  [
    (state, operationId) => selectOperation(state, operationId)?.children,
    (state) => state.tables.data,
    (state) => state.operations.data,
  ],
  (children, tablesData, operationsData) => {
    if (!children) return new Map();

    const rowRanges = [];
    for (let i = 0; i < children.length; i++) {
      const childId = children[i];
      const rowCount =
        (isTableId(childId)
          ? tablesData[childId]?.rowCount
          : operationsData[childId]?.rowCount) || 0;
      const start = i === 0 ? 0 : rowRanges[i - 1][1][1];
      const end = start + rowCount;
      rowRanges.push([childId, [start, end]]);
    }
    return new Map(rowRanges);
  }
);
