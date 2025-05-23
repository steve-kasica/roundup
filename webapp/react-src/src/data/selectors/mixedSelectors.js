import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../slices/operationsSlice/Operation";
import {
  selectAllOperations,
  selectOperation,
  selectOperationImmediateChildId,
} from "../slices/operationsSlice";
import { selectColumnIdsByTableId } from "../slices/columnsSlice/columnSelectors";
import { getSourceTableById } from "./sourceTablesSelectors";
import { createSelector } from "@reduxjs/toolkit";

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

export const getOperationColumnIds = createSelector(
  // Input selectors
  (state, operationId) => selectOperation(state, operationId),
  (state) => state,

  // Output selector
  (operation, state) => {
    return operation.tableIds.map((tableId) => {
      const columnIds = selectColumnIdsByTableId(state, tableId);
      return columnIds;
    });
  }
);

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
