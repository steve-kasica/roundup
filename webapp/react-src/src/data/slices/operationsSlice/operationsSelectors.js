import { createSelector } from "@reduxjs/toolkit";

export const selectOperation = createSelector(
  // Input selectors
  (state) => state.operations.data, // Extract the operations data from the state
  (_, operationId) => operationId, // Extract the operationId argument

  // Result function
  (data, operationId) => {
    const operation = data[operationId];
    if (operation === undefined) {
      throw new Error("Operation not found");
    }
    return operation;
  }
);

export function selectAllOperationIds(state) {
  return state.operations.ids;
}

export function selectOperationsCount(state) {
  return state.operations.ids.length;
}

// Start with operations.ids instead of Object.values on the
// data property to ensure propering ordering of operations
export function selectAllOperations(state) {
  return state.operations.ids.map((operationId) => {
    const operation = state.operations.data[operationId];
    if (operation === undefined) {
      throw new Error("Operation not found");
    }
    return operation;
  });
}

export const selectOperationByTableId = (state, tableId) => {
  const operation = Object.values(state.operations.data).find((operation) =>
    operation.tableIds.includes(tableId)
  );
  return operation;
};

export function selectOperationDepth(state, operationId) {
  const ids = state.operations.ids;
  const index = ids.indexOf(operationId);
  if (index === -1) {
    return null; // Operation not found
  }
  return ids.length - index;
}

export function selectMaxOperationDepth(state) {
  return state.operations.ids.length;
}

export function selectRootOperationId(state) {
  if (state.operations.ids.length === 0) {
    return null;
  }
  // The root operation is the last one in the list
  const rootOperationId = state.operations.ids.slice(-1)[0];
  return rootOperationId;
}

export function selectRootOperation(state) {
  const rootOperationId = selectRootOperationId(state);
  if (rootOperationId === null) {
    return null;
  }
  return state.operations.data[rootOperationId];
}

export function selectOperationChildren(state, operationId) {
  const operationIndex = state.operations.ids.indexOf(operationId);
  if (operationIndex === -1) {
    throw new Error("Operation not found");
  }
  return state.operations.ids.slice(0, operationIndex);
}

export function selectOperationImmediateChildId(state, operationId) {
  const index = state.operations.ids.indexOf(operationId);
  if (index === -1) {
    throw new Error("Operation not found");
  } else if (index === 0) {
    return null; // No child operation
  } else {
    return state.operations.ids[index - 1];
  }
}

export function selectFocusedOperationId(state) {
  return state.operations.focused;
}

export function selectOperationChildrenIds(state, operationId) {
  const operationIds = state.operations.ids.filter((id) => {
    const operation = state.operations.data[id];
    return operation.parentId === operationId;
  });
  return operationIds;
}

export const getTablesByOperationId = createSelector(
  // Input selectors
  (state) => state,
  (_, operationId) => operationId,

  // Results function
  (state, operationId) => {
    const operation = selectOperation(state, operationId);
    return operation.tableIds.map((tableId) => {
      const table = getSourceTableById(state, tableId);
      return table;
    });
  }
);

/**
 * // Obviously a good candidate for memoization
// Recursive function
export function selectOperationColumnCount(state, id) {
  let columnCount = 0,
    operation;
  try {
    operation = selectOperation(state, id);
  } catch {
    return columnCount;
  }
  operation.tableIds.forEach((tableId) => {
    const columns = selectColumnIdsByTableId(state, tableId);
    updateCount(columns.length);
  });
  const childOperationId = selectOperationImmediateChildId(state, id);
  if (childOperationId !== null) {
    updateCount(selectOperationColumnCount(state, childOperationId));
  }

  return columnCount;

  function updateCount(count) {
    switch (operation.operationType) {
      case OPERATION_TYPE_NO_OP:
      case OPERATION_TYPE_PACK:
        columnCount += count;
        break;
      case OPERATION_TYPE_STACK:
        columnCount = Math.max(columnCount, count);
        break;
      default:
        throw new Error("Invalid operation type");
    }
  }
}
 */
