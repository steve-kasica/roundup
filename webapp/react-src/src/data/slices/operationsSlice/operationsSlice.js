import { createSlice } from "@reduxjs/toolkit";
import Operation, { OPERATION_TYPE_NO_OP } from "./Operation";
import { selectOperation, selectRootOperation } from "./operationsSelectors";

const initialState = {
  data: {}, // Normalized operations stored by ID
  ids: [], // Array of operation IDs
  focused: null, // ID of the currently focused operation
};

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    // Initialize the operations state with a root operation
    // This is called when the first table is added
    // to the schema. This root opperation gets a special
    // operation type of OPERATION_TYPE_NO_OP
    initializeOperations(state, action) {
      const { tableId } = action.payload;
      const operation = Operation(OPERATION_TYPE_NO_OP, [tableId]);
      addOperationToState(state, operation);
    },
    appendOperationPostInitialization(state, action) {
      if (state.ids.length === 0) {
        throw new Error("State not initialized");
      } else {
        const { operationType, tableId } = action.payload;
        const root = selectRootOperation({ operations: state });
        root.operationType = operationType;
        root.tableIds.push(tableId);
      }
    },
    appendOperation(state, action) {
      const { operationType, tableId } = action.payload;
      const operation = Operation(operationType, [tableId]);
      addOperationToState(state, operation);
    },
    addTableToOperation(state, action) {
      const { operationId, tableId } = action.payload;
      const operation = selectOperation({ operations: state }, operationId);
      operation.tableIds.push(tableId);
    },
    removeOperation(state, action) {
      const { id } = action.payload;
      removeOperationFromState(state, id);
    },
    removeTableFromOperation(state, action) {
      const { operationId, tableId } = action.payload;
      const operation = state.data[operationId];
      operation.tableIds = operation.tableIds.filter((id) => id !== tableId);
      // If no tables remain, remove the operation itself
      if (operation.tableIds.length === 0) {
        removeOperationFromState(state, operationId);
      }
    },
    setFocusedOperation(state, action) {
      const { id } = action.payload;
      state.focused = id;
    },
    setOperationHoverStatus(state, action) {
      const { operationId, isHovered } = action.payload;
      const operation = selectOperation({ operations: state }, operationId);
      operation.status.isHovered = isHovered;
    },
  },
});

export const {
  initializeOperations,
  appendOperationPostInitialization,
  appendOperation,
  addTableToOperation,
  removeOperation,
  setFocusedOperation,
  setOperationHoverStatus,
  removeTableFromOperation,
} = operationsSlice.actions;

export default operationsSlice.reducer;

function addOperationToState(state, operation) {
  state.data[operation.id] = operation;
  state.ids.push(operation.id);
}

function removeOperationFromState(state, operationId) {
  delete state.data[operationId];
  state.ids = state.ids.filter((id) => id !== operationId);
}
