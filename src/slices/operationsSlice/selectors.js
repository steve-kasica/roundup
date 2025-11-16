import { createSelector } from "@reduxjs/toolkit";
import {
  // selectActiveColumnDBNamesByTableId,
  selectColumnsById,
} from "../columnsSlice";
import { isTableId, selectTableQueryData } from "../tablesSlice";
import { OPERATION_TYPE_PACK, OPERATION_TYPE_STACK } from "./Operation";

/**
 * Selects an operation by its ID from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the operation to select.
 * @returns {Object} The operation object corresponding to the given ID.
 * @throws {Error} Throws an error if the operation is not found in the state.
 */
export const selectOperationsById = createSelector(
  [(state) => state.operations.byId, (state, operationId) => operationId],
  (byId, operationId) => {
    return Array.isArray(operationId)
      ? operationId.map((id) => byId[id])
      : byId[operationId];
  }
);

/**
 * Selector to retrieve all operation IDs from the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {Array<string|number>} An array of operation IDs.
 */
export function selectAllOperationIds(state) {
  return state.operations.allIds;
}

/**
 * Memoized selector to find the operation that contains the given table ID.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} tableId - The unique identifier of the table.
 * @returns {Object|undefined} The operation object containing the table, or undefined if not found.
 */
export const selectOperationIdByChildId = createSelector(
  (state) => state.operations.byId,
  (_, childId) => childId,
  (operationsData, childId) => {
    return Object.entries(operationsData).find(([, { childIds }]) =>
      childIds.includes(childId)
    )?.[0];
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

export const selectOperationDepthById = createSelector(
  [
    (state) => state.operations.rootOperationId,
    (state) => state.operations.byId,
    (_, operationId) => operationId,
  ],
  (rootOperationId, operationsData, needle) => {
    let depth = 0;
    function findDepth(operationId, currentDepth) {
      if (operationId === needle) return currentDepth;
      const children = operationsData[operationId]?.childIds;
      if (!children || children.length === 0) return null;
      for (const childId of children) {
        const result = findDepth(childId, currentDepth + 1);
        if (result !== null) return result;
      }
      return null;
    }
    // Start from the root (last in ids or explicit root)
    return findDepth(rootOperationId, depth);
  }
);

/**
 * Memoized selector to compute the maximum depth of all operations in the
 * operation tree.
 *
 * The maximum depth is defined as the largest number of edges from the
 * root operation to any operation node.
 *
 * @param {Object} state - The Redux state object.
 * @returns {number|undefined} The maximum depth of the operation tree,
 *                             or undefined if root is missing.
 */
export const selectMaxOperationDepth = createSelector(
  (state) => state.operations.byId,
  (state) => state.operations.rootOperationId,
  (operationsData, rootOperationId) => {
    if (!rootOperationId) return undefined;

    let maxDepth = 0;

    function traverse(operationId, currentDepth) {
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }

      const children = operationsData[operationId]?.childIds;
      if (!children || children.length === 0) return;

      for (const childId of children) {
        traverse(childId, currentDepth + 1);
      }
    }

    traverse(rootOperationId, 0);
    return maxDepth;
  }
);

/**
 * Selects the root operation ID from the operations slice of the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {(string|null)} The root operation ID if present, otherwise null.
 */
export function selectRootOperationId(state) {
  return state.operations.rootOperationId;
}

export const selectRootOperation = (state) => {
  const rootId = selectRootOperationId(state);
  return rootId ? selectOperationsById(state, rootId) : null;
};

/**
 * Selector to build query byId for an operation.
 * Constructs the data structure needed for database view creation.
 *
 * @param {Object} state - Redux state
 * @param {string} operationData - A partially complete instance of Operation. It can be
 *   incomplete because it is an `operationUpdate` when the updateOperationsSaga
 *   because `operationData` is a newly instantiated Operation object in the createOperationsSaga. It
 *   must contain at least the `id`
 * @returns {Object} Query data object with operation details and child table information
 */
export const selectOperationQueryData = (state, id) => {
  // Select the full operation from state, if it is present
  // It may not be present if this is a newly created Operation
  const operation = selectOperationsById(state, id);
  const childrenQueryData = operation.childIds.map((childId) => {
    if (isTableId(childId)) {
      return selectTableQueryData(state, childId);
    } else {
      // return {
      //   tableName: selectOperationsById(state, childId).databaseName,
      //   columnNames: selectOperationsById(state, childId).columnIds.map(
      //     (colId) => selectColumnsById(state, colId).databaseName
      //   ),
      // };
      return {
        tableName: selectOperationsById(state, childId).databaseName,
        columnNames: selectOperationsById(state, childId).columnIds.map(
          (colId) => selectColumnsById(state, colId).databaseName
        ),
      };
    }
  });
  let operationTypeParams =
    operation.operationType === OPERATION_TYPE_PACK
      ? {
          joinKey1: selectColumnsById(state, operation.joinKey1).databaseName,
          joinKey2: selectColumnsById(state, operation.joinKey2).databaseName,
          joinPredicate: operation.joinPredicate,
        }
      : {};

  const columnNames = operation.columnIds.map(
    (colId) => selectColumnsById(state, colId).databaseName
  );

  return {
    viewName: operation.databaseName,
    columnNames,
    ...operationTypeParams,
    children: childrenQueryData,
  };
};

// TODO: assess below

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
      children || selectOperationsById(state, operationId)?.childIds,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
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
    (state, operationId) => state.operations.childIds[operationId],
    // (state) => state.,
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
    (state, operationId) => selectOperationsById(state, operationId)?.childIds,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
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

const matchEquality = (a, b) => a === b;
const matchContains = (a, b) => a.includes(b);
const matchStartsWith = (a, b) => a.startsWith(b);
const matchEndsWith = (a, b) => a.endsWith(b);

const matchFunctionMap = new Map([
  ["EQUALS", matchEquality],
  ["CONTAINS", matchContains],
  ["STARTS_WITH", matchStartsWith],
  ["ENDS_WITH", matchEndsWith],
]);

/**
 * Memoized selector to calculate match statistics for a pack operation.
 *
 * Analyzes the join keys to determine how many rows would match, be unmatched from
 * the left table, or be unmatched from the right table based on the join predicate.
 *
 * This selector is memoized using createSelector, which means the calculation is
 * cached and only recomputed when dependencies change. Importantly, this memoization
 * is shared across all component instances that use this selector - if multiple
 * components call this selector with the same arguments, they will receive the same
 * cached result without triggering a recalculation.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the pack operation.
 * @returns {Object} Stats object with matchingRowCount, leftUnmatchedRowCount, and rightUnmatchedRowCount counts.
 */
export const selectPackOperationMatchStats = createSelector(
  [
    (state, id) => selectOperationsById(state, id),
    (state, id) => {
      const operation = selectOperationsById(state, id);
      return operation?.joinKey1
        ? selectColumnsById(state, operation.joinKey1).topValues
        : [];
    },
    (state, id) => {
      const operation = selectOperationsById(state, id);
      return operation?.joinKey2
        ? selectColumnsById(state, operation.joinKey2).topValues
        : [];
    },
  ],
  (operation, leftKey, rightKey) => {
    const stats = {
      matchingRowCount: 0,
      leftUnmatchedRowCount: 0,
      rightUnmatchedRowCount: 0,
    };

    if (!operation?.joinPredicate || !leftKey || !rightKey) {
      return stats;
    }

    const matchFunction = matchFunctionMap.get(operation.joinPredicate);

    if (!matchFunction) {
      return stats;
    }

    // Process left key values
    leftKey.forEach(({ value: leftValue, count: leftCount }) => {
      const hasMatch = rightKey.some(({ value: rightValue }) =>
        matchFunction(leftValue, rightValue)
      );

      if (hasMatch) {
        stats.matchingRowCount += leftCount;
      } else {
        stats.leftUnmatchedRowCount += leftCount;
      }
    });

    // Process right key values that don't match any left value
    rightKey.forEach(({ value: rightValue, count: rightCount }) => {
      const hasMatch = leftKey.some(({ value: leftValue }) =>
        matchFunction(leftValue, rightValue)
      );

      if (!hasMatch) {
        stats.rightUnmatchedRowCount += rightCount;
      }
    });

    return stats;
  }
);

export const selectOperationChildRowCounts = createSelector(
  [
    (state, operationId) => selectOperationsById(state, operationId)?.childIds,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
  ],
  (children, tablesData, operationsData) => {
    if (!children) return new Map();

    const rowCounts = [];
    for (const childId of children) {
      const rowCount =
        (isTableId(childId)
          ? tablesData[childId]?.rowCount
          : operationsData[childId]?.rowCount) || 0;
      rowCounts.push([childId, rowCount]);
    }
    return new Map(rowCounts);
  }
);
