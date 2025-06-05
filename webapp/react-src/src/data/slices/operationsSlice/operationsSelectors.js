import { createSelector } from "@reduxjs/toolkit";
import { isOperationId } from "./Operation";

/**
 * Selects an operation by its ID from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|number} operationId - The unique identifier of the operation to select.
 * @returns {Object} The operation object corresponding to the given ID.
 * @throws {Error} Throws an error if the operation is not found in the state.
 */
export function selectOperation(state, operationId) {
  const operation = state.operations.data[operationId];
  return operation;
}

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
 * Selects the maximum depth of the operation tree from the Redux state.
 *
 * Traverses the operations tree starting from the root node and calculates the maximum depth
 * by recursively visiting all child nodes.
 *
 * @param {Object} state - The Redux state object.
 * @param {Object} state.operations - The operations slice of the state.
 * @param {string} state.operations.root - The ID of the root operation node.
 * @param {Object.<string, {children: string[]}>} state.operations.data - A mapping of operation node IDs to node objects.
 * @returns {number} The maximum depth of the operation tree. Returns 0 if the root or its data is missing.
 */
export function selectMaxOperationDepth(state) {
  const { root, data, ids } = state.operations;
  if (!root || !data[root]) return undefined;

  return Math.max(...ids.map((id) => selectOperationDepth(state, id)));
}

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
