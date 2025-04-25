import {
  CHILD_TYPE_OPERATION,
  CHILD_TYPE_TABLE,
} from "../slices/operationsSlice/Operation";
import { getOperationById, getOperationTableIds } from "./operationsSelectors";
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

export function getChildrenData(state, children) {
  const childrenData = children.map((child) => {
    if (child.type === CHILD_TYPE_OPERATION) {
      return getOperationById(state, child.id);
    } else {
      return getSourceTableById(state, child.id);
    }
  });
  return childrenData;
}

export const getHoverOperationTableIds = (state) => {
  const hoverOperationId = selectHoveredOperationId(state);
  if (hoverOperationId === null) {
    return [];
  } else {
    const operation = getOperationById(state, hoverOperationId);
    if (operation === undefined) {
      throw new Error("Node not found");
    }
    return getOperationTableIds(operation);
  }
};

export function getOperationColumnCount(state, id) {
  const operation = getOperationById(state, id);
  const columnCounts = operation.children.map((child) => {
    if (child.type === CHILD_TYPE_TABLE) {
      return state.sourceTables.data[child.id].columnCount;
    } else {
      // child is another operation
      throw new Error("Not implemented yet");
    }
  });
  const maxColumnCount = Math.max(...columnCounts);
  return maxColumnCount;
}

export function getOperationColumnIds(state, operationId) {
  const operation = getOperationById(state, operationId);
  const idsByTable = operation.children.map((child) => {
    if (child.type === CHILD_TYPE_TABLE) {
      const columnIds = selectColumnIdsByTableId(state, child.id);
      return columnIds;
    } else {
      // child is another operation
      throw new Error("not implemented yet");
    }
  });
  return idsByTable;
}

export function getTablesByOperationId(state, operationId) {
  const operation = state.operations.entities[operationId];
  const tables = operation.children.map((child) => {
    if (child.type === CHILD_TYPE_TABLE) {
      return state.sourceTables.data[child.id];
    } else {
      throw new Error("Operations not yet implemented");
    }
  });
  return tables;
}
