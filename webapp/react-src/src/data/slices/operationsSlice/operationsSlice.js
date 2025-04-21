import { createSlice } from "@reduxjs/toolkit";
import Operation, {
  Child,
  CHILD_TYPE_OPERATION,
  CHILD_TYPE_TABLE,
  OPERATION_TYPE_NO_OP,
} from "./Operation";

const initialState = {
  entities: {}, // Normalized operations stored by ID
  ids: [], // Array of operation IDs
};

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    addOperation(state, action) {
      const operation = action.payload;
      state.entities[operation.id] = operation;
      state.ids.push(operation.id);
    },
    createOperation(state, action) {
      const { operationType, children } = action.payload;
      const parentId =
        state.ids.length > 0 ? state.ids[state.ids.length - 1] : null;
      const depth = state.entities[parentId]
        ? state.entities[parentId].depth + 1
        : 1;
      const operation = Operation(operationType, parentId, depth, children);
      state.entities[operation.id] = operation;
      state.ids.push(operation.id);
      if (parentId) {
        state.entities[parentId].children.push(
          new Child(CHILD_TYPE_OPERATION, operation.id)
        );
      }
    },
    removeOperation(state, action) {
      const id = action.payload;
      delete state.entities[id];
      state.ids = state.ids.filter((operationId) => operationId !== id);
    },
    updateOperation(state, action) {
      const operation = action.payload;
      if (state.entities[operation.id]) {
        state.entities[operation.id] = operation;
      } else {
        console.warn(`Operation with ID ${operation.id} not found.`);
      }
    },
    addTableToDeepestOperation(state, action) {
      const { tableId } = action.payload;
      // Find the deepest operation (the one with the highest depth)
      const deepestOperationId = state.ids.reduce((deepestId, currentId) => {
        const currentDepth = state.entities[currentId].depth;
        const deepestDepth = state.entities[deepestId].depth;
        return currentDepth > deepestDepth ? currentId : deepestId;
      }, state.ids[0]);
      // Add the table ID to the deepest operation's children
      if (state.entities[deepestOperationId]) {
        state.entities[deepestOperationId].children.push(tableId);
      } else {
        console.warn(
          `Deepest operation with ID ${deepestOperationId} not found.`
        );
      }
    },
    addNewChildren(state, action) {
      const { operationType, children } = action.payload;
      const lastOperationId = state.ids[state.ids.length - 1];
      const lastOperationType = state.entities[lastOperationId].operationType;
      const childrenMaxColumns = Math.max(
        ...children.map(({ columnCount }) => columnCount)
      );
      if (lastOperationType === OPERATION_TYPE_NO_OP) {
        // Handle post initialization
        state.entities[lastOperationId].operationType = operationType;
        state.entities[lastOperationId].children = [
          ...(state.entities[lastOperationId].children || []),
          ...children.map((table) => new Child(CHILD_TYPE_TABLE, table.id)),
        ];
        state.entities[lastOperationId].columnCount = Math.max(
          state.entities[lastOperationId].columnCount,
          childrenMaxColumns
        );
      } else if (
        state.entities[lastOperationId].operationType === operationType
      ) {
        // Handle adding tables with operation
        state.entities[lastOperationId].children = [
          ...(state.entities[lastOperationId].children || []),
          ...children.map((table) => new Child(CHILD_TYPE_TABLE, table.id)),
        ];
        state.entities[lastOperationId].columnCount = Math.max(
          state.entities[lastOperationId].columnCount,
          childrenMaxColumns
        );
      } else {
        // Handle add tables with different operation type
        const operation = new Operation(
          operationType,
          null,
          state.entities[lastOperationId].depth,
          [...children, state.entities[lastOperationId]]
        );
        state.entities[lastOperationId].parentId = operation.id;
        state.entities[lastOperationId].depth++;
        state.entities[operation.id] = operation;
        state.ids.push(operation.id);
      }
    },
    addChildrenToLastOperation(state, action) {
      const { operationId, children } = action.payload;
      if (state.entities[operationId]) {
        state.entities[operationId].children = [
          ...(state.entities[operationId].children || []),
          ...children.map((id) => new Child(CHILD_TYPE_TABLE, id)),
        ];
      }
    },
  },
});

export default operationsSlice;
