import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../slices/operationsSlice/Operation";
import {
  selectAllOperations,
  selectOperation,
  selectOperationChildren,
  selectOperationImmediateChildId,
  selectRootOperation,
} from "../slices/operationsSlice";
import { selectColumnIdsByTableId } from "../slices/columnsSlice/columnSelectors";
import { getSourceTableById } from "./sourceTablesSelectors";
import {
  selectSelectedOperationId,
  selectHoveredOperationId,
} from "../slices/uiSlice";

// TODO: memoize, if necessary
export const getFocusedOperation = (state) => {
  const focusedOperationNodeId = selectSelectedOperationId(state);
  if (focusedOperationNodeId === null) {
    return null;
  } else {
    const operation = state.operations.entities[focusedOperationNodeId];
    if (operation === undefined) {
      throw new Error("Node not found");
    }
    return operation;
  }
};

// export function getChildrenData(state, children) {
//   const childrenData = children.map((child) => {
//     if (child.type === CHILD_TYPE_OPERATION) {
//       return selectOperation(state, child.id);
//     } else {
//       return getSourceTableById(state, child.id);
//     }
//   });
//   return childrenData;
// }

export const getHoverOperationTableIds = (state) => {
  const hoverOperationId = selectHoveredOperationId(state);
  if (hoverOperationId === null) {
    return [];
  } else {
    const operation = selectOperation(state, hoverOperationId);
    if (operation === undefined) {
      throw new Error("Node not found");
    }
    return getOperationTableIds(operation);
  }
};

// Obviously a good candidate for memoization
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

export function selectSchemaColumnCount(state) {
  let columnCount = 0;
  let operations = selectAllOperations(state); // orders operations from bottom to top
  if (operations.length === 0) {
    return columnCount;
  } else {
    operations.forEach((operation) => {
      switch (operation.operationType) {
        case OPERATION_TYPE_NO_OP:
        case OPERATION_TYPE_PACK:
          columnCount += selectOperationColumnCount(state, operation.id);
          break;
        case OPERATION_TYPE_STACK:
          columnCount = Math.max(
            columnCount,
            selectOperationColumnCount(state, operation.id)
          );
          break;
        default:
          throw new Error("Invalid operation type");
      }
    });
    return columnCount;
  }
}

export function getOperationColumnIds(state, operationId) {
  const operation = selectOperation(state, operationId);
  if (operation === undefined) {
    throw new Error("Operation not found");
  }
  return operation.tableIds.map((tableId) => {
    const columnIds = selectColumnIdsByTableId(state, tableId);
    return columnIds;
  });
}

export function getTablesByOperationId(state, operationId) {
  const operation = selectOperation(state, operationId);
  if (operation === undefined) {
    throw new Error("Operation not found");
  }
  return operation.tableIds.map((tableId) => {
    const table = getSourceTableById(state, tableId);
    return table;
  });
}
