// export const getMaxOperationDepth = ({ operations }) => {
//   if (Object.keys(operations.data).length === 0) {
//     return 0;
//   }
//   const maxDepth = Object.values(operations.data)
//     .map((operation) => operation.depth)
//     .reduce((max, depth) => Math.max(max, depth), 0);
//   return maxDepth;
// };

// // TODO: memoize, if necessary
// export const getRootOperationId = ({ operations }) => {
//   const nullParentOperations = Object.values(operations.data).filter(
//     (operation) => operation.parentId === null
//   );
//   if (nullParentOperations.length > 1) {
//     throw new Error("Multiple root operations found");
//   }
//   if (nullParentOperations.length === 0) {
//     return null;
//   }
//   return nullParentOperations[0].id;
// };

// export const getOperationById = (state, operationId) => {
//   const operation = state.operations.data[operationId];
//   return operation;
// };

// export const getOperations = (state) => {
//   return Object.values(state.operations.data);
// };

// export const getOperationTableIds = (operation) =>
//   operation.children
//     .filter((child) => child.type === "table")
//     .map((child) => child.id);

// export const getLastOperation = (state) => {
//   const operationId = state.operations.ids[state.operations.ids.length - 1];
//   return getOperationById(state, operationId);
// };

export function selectOperation(state, operationId) {
  const operation = state.operations.data[operationId];
  if (operation === undefined) {
    throw new Error("Operation not found");
  }
  return operation;
}

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
